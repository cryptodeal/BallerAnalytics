import { Env } from '../Env';
import { seededRandom, MovingAverager } from '../../utils';
import { A3CAgent_Worker } from '../Agent';
import {
	wsBaseURI,
	addWorkerId,
	getBestScore,
	getGlobalEpisode,
	getGlobalMovingAverage,
	incrementGlobalEpisode,
	notifyWorkerDone,
	sendModel,
	setBestScore,
	setGlobalMovingAverage,
	writeQueue,
	parseWsMsg,
	isWsInitWorker,
	isWsRunWorker,
	getBestWorkerMovingAvg,
	setBestWorkerMovingAvg,
	getSharedWeights
} from '../utils';
import { WsSockette, wsSockette } from 'ws-sockette';
import { WsApiData } from '../types';
let worker: Worker,
	scopedId = '';

const bootWorker = () =>
	(async () => {
		await addWorkerId(worker.id);
		await worker.run();
	})();

const ws = wsSockette(wsBaseURI, {
	clientOptions: {
		headers: {
			id: scopedId
		}
	},
	timeout: 5e3,
	maxAttempts: 10,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onopen: (e) => {
		console.log('Connected to A3C WS API');
	},
	onmessage: (e) => {
		const { data } = e;
		const payload = parseWsMsg(data as string);
		if (isWsInitWorker(payload)) {
			const {
				payload: { id, first, loadGlobal }
			} = payload;
			scopedId = id;
			worker = new Worker(id, ws);
			if (loadGlobal) worker.loadGlobal = loadGlobal;
			/**
			 * flag enables behavior policy for 1st worker;
			 * behavior policy uses epsilon decay to explore
			 * random actions in env; as A2C and A3C are policy
			 * based, only 1 worker explores.
			 */
			if (first) worker.bhvPolicy = true;
			if (worker.bhvPolicy) worker.epsilon = 0.3;
			ws.send(JSON.stringify(<WsApiData>{ type: 'INIT_DONE' }));
		} else if (isWsRunWorker(payload)) {
			bootWorker();
		}
	},
	onreconnect: (e) => console.log('Reconnecting...', e.type),
	onmaximum: (e) => console.log('Stop Attempting:', e.type),
	onclose: (e) => console.log('Closed!\n', 'Code: ' + e.code, 'Reason: ' + e.reason),
	onerror: (e) => console.log('Error: ', e.message)
});

export class Worker {
	public id!: string;
	public ep_loss = 0.0;
	public update_freq: number;
	public action_size!: number;
	public state_size!: number;
	public agent!: A3CAgent_Worker;
	public epsilon = 0.3;
	public epsilonMin = 0.0;
	public epsilonMultiply = 0.99;
	private ws: WsSockette;
	public bhvPolicy = false;
	public loadGlobal = false;
	private moving_avg: MovingAverager;
	private best_self_moving_avg = -Infinity;

	constructor(
		id: string,
		ws: WsSockette,
		opts?: { moving_avg_size?: number; update_freq?: number }
	) {
		this.id = id;
		this.ws = ws;
		/* TODO: add update_freq to construction options */
		this.update_freq = opts?.update_freq || 2048;
		this.moving_avg = new MovingAverager(256);
	}

	private async syncGlobalModel() {
		const { actor, critic } = await getSharedWeights(this.id);
		await this.agent.setAgentWeights(actor, critic);
		//await this.agent.reloadWeights(this.id);
	}

	private async record(
		episode: number,
		reward: number,
		glob_ep_rew: number,
		total_loss: number,
		num_steps: number
	) {
		/* old global moving avg */
		let global_ep_reward = glob_ep_rew;
		if (global_ep_reward == -Infinity) {
			/* if no prev global moving avg */
			global_ep_reward = reward;
		} else {
			global_ep_reward = global_ep_reward * 0.99 + reward * 0.01;
		}
		console.log(`Episode: ${episode}`);
		console.log('Moving average reward: ' + global_ep_reward);
		console.log('Episode reward: ' + reward);
		console.log(
			'Loss: ' + (num_steps == 0 ? total_loss : Math.ceil((total_loss / num_steps) * 1000) / 1000)
		);
		console.log('Steps: ' + num_steps);
		console.log('Worker:' + this.id);
		console.log('********************* GLOBAL EP REWARD ' + global_ep_reward);
		await writeQueue(this.id, global_ep_reward);
		return global_ep_reward;
	}

	public async run() {
		/* analogous to the run function of threads */
		const env = new Env(8);
		env.maxEpisodes = 50000;
		const agent = new A3CAgent_Worker(
			env,
			Math.floor(seededRandom() * 8),
			Math.floor(seededRandom() * 8)
		);
		agent.ballCount = 3;
		agent.vision = true;
		this.agent = agent;
		// await this.agent.saveLocally(this.id);
		this.agent.env.setEntity(this.agent, { ball: 3 });
		if (this.loadGlobal) {
			await this.syncGlobalModel();
		}

		while (this.agent.env.episodes < this.agent.env.maxEpisodes) {
			this.ep_loss = 0;
			/* TODO: REMOVE?? --> const time_count = 0; */
			let state = this.agent.getVision();

			while (true) {
				// TODO: REWRITE BELOW
				console.log(
					`Episode ${this.agent.env.episodes}: ${this.agent.env.steps + 1} / ${
						this.agent.env.maxSteps
					}
          --------------------`
				);

				const action = this.agent.getAction(state, this.bhvPolicy ? this.epsilon : undefined);
				const [reward, done] = this.agent.step(action);
				this.agent.reward += reward;

				const next_state = this.agent.getVision();

				const ep_mean_loss = await this.agent.trainModel(state, action, reward, next_state, done);
				this.agent.env.steps += 1;
				this.ep_loss += ep_mean_loss;

				if (done || this.agent.env.steps >= this.agent.env.maxSteps) {
					this.moving_avg.append(this.agent.reward);

					const current_moving_avg = this.moving_avg.average();
					if (current_moving_avg > this.best_self_moving_avg) {
						this.best_self_moving_avg = current_moving_avg;
					}

					const global_epi = await getGlobalEpisode(this.id);
					const old_glob_moving_avg = await getGlobalMovingAverage(this.id);

					const glob_moving_avg = await this.record(
						global_epi,
						this.agent.reward,
						old_glob_moving_avg,
						this.ep_loss,
						this.agent.env.steps
					);
					const [global_best_score, best_all_worker_moving_avg] = await Promise.all([
						getBestScore(this.id),
						getBestWorkerMovingAvg(this.id),
						setGlobalMovingAverage(this.id, glob_moving_avg)
					]);
					const stdout = `Episode loss: ${this.ep_loss}
Episode reward: ${this.agent.reward}
Global best score: ${global_best_score}
Current moving average (${this.moving_avg.size()} eps): ${current_moving_avg}
Best worker moving avg: ${best_all_worker_moving_avg}`;
					console.log(stdout);
					if (
						current_moving_avg >
						best_all_worker_moving_avg /* || this.agent.reward > global_best_score*/
					) {
						console.log(
							'************************ UPDATING THE GLOBAL MODEL ************************'
						);
						await Promise.all([
							sendModel(this.id, this.agent.getWeights(), false),
							setBestScore(this.id, this.agent.reward),
							setBestWorkerMovingAvg(this.id, current_moving_avg)
						]);
					} else if (
						this.agent.env.episodes !== 0 &&
						this.agent.env.episodes % this.update_freq === 0
					) {
						console.log('************************ UPDATING LOCAL MODEL ************************');
						await this.syncGlobalModel();
					}

					await incrementGlobalEpisode(this.id);
					this.agent.x = Math.floor(seededRandom() * 8);
					this.agent.y = Math.floor(seededRandom() * 8);
					this.agent.reward = 0;
					this.agent.dir = 3;
					console.log('----------------- END OF STEP TRAINING DATA -----------------');

					this.agent.env.episodes += 1;
					this.agent.env.steps = 0;
					this.agent.env.reset();
					/**
					 * epsilon decay, only applied/utilized by worker w `first`
					 * property; aka the first worker to connect to central
					 * server. this allows random exploration of action space
					 * while keeping core global model policy driven as per
					 * traditional actor advantage critic algorithm
					 */
					if (this.bhvPolicy && this.epsilon > this.epsilonMin) {
						this.epsilon = this.epsilon * this.epsilonMultiply;
						this.epsilon = Math.floor(this.epsilon * 10000) / 10000;
					}

					agent.ballCount = 3;
					while (true) {
						if (agent.env.setEntity(agent, { ball: 3 }) !== null) {
							break;
						}
					}
					break;
				}
				state = next_state;
				/* TODO: REMOVE?? --> time_count++; */
			}
		}
		console.log(`Best Moving Avg (${this.moving_avg.size()} Eps): ${this.best_self_moving_avg}`);
		const [best_all_worker_moving_avg] = await Promise.all([
			getBestWorkerMovingAvg(this.id),
			notifyWorkerDone(this.id)
		]);
		console.log(`Best moving avg (${this.moving_avg.size()} eps): ${this.best_self_moving_avg}
Best moving avg across all workers (100 eps): ${best_all_worker_moving_avg}`);

		return this.ws.close(1000);
	}
}
