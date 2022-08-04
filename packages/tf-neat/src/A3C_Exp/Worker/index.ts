import { Env } from '../Env';
import { exec } from 'child_process';
import { seededRandom } from '../../utils';
import { A3CAgent_Worker } from '../Agent';
import {
	wsBaseURI,
	addWorkerId,
	getBestScore,
	getGlobalEpisode,
	getGlobalModelActorWeights,
	getGlobalModelCriticWeights,
	getGlobalMovingAverage,
	incrementGlobalEpisode,
	notifyWorkerDone,
	sendModel,
	setBestScore,
	setGlobalMovingAverage,
	writeQueue,
	parseWsMsg
} from '../utils';
import { WsSockette, wsSockette } from 'ws-sockette';
let worker: Worker,
	id = '';

const bootWorker = () =>
	(async () => {
		await addWorkerId(worker.id);
		await worker.run();
	})();

const ws = wsSockette(wsBaseURI, {
	clientOptions: {
		headers: {
			ID: id
		}
	},
	timeout: 5e3,
	maxAttempts: 10,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onopen: (e) => {
		console.log('Connected to A3C WS API');
	},
	onmessage: async (e) => {
		const { data } = e;
		const payload = parseWsMsg(data as string);
		if (payload.type === 'INIT' && !worker) {
			const { id: tempId, first } = payload;
			id = tempId;
			worker = new Worker(id, ws);
			/**
			 * flag enables behavior policy for 1st worker;
			 * behavior policy uses epsilon decay to explore
			 * random actions in env; as A2C and A3C are policy
			 * based, only 1 worker explores.
			 */
			worker.bhvPolicy = true;
			await worker.mkDirLocals();
			if (worker.bhvPolicy) worker.epsilon = 0.3;
			ws.send(JSON.stringify({ type: 'INIT_DONE' }));
		} else if (payload.type === 'RUN') {
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
	public epsilon: undefined | number = undefined;
	public epsilonMin = 0.0;
	public epsilonMultiply = 0.99;
	private ws: WsSockette;
	public bhvPolicy = false;

	constructor(id: string, ws: WsSockette) {
		this.id = id;
		this.ws = ws;
		/* TODO: add update_freq to construction options */
		this.update_freq = 10;
	}

	private async record(
		episode: number,
		reward: number,
		glob_ep_rew: number,
		total_loss: number,
		num_steps: number
	) {
		let global_ep_reward = glob_ep_rew;
		if (global_ep_reward == 0) {
			global_ep_reward = reward;
		} else {
			global_ep_reward = global_ep_reward * 0.99 + reward * 0.01;
		}
		console.log('Episode:' + episode + 1);
		console.log('Moving average reward : ' + global_ep_reward);
		console.log('Episode reward : ' + reward);
		console.log(
			'Loss: ' + (num_steps == 0 ? total_loss : Math.ceil((total_loss / num_steps) * 1000) / 1000)
		);
		console.log('Steps : ' + num_steps);
		console.log('Worker :' + this.id);
		console.log('********************* GLOBAL EP REWARD ' + global_ep_reward);
		await writeQueue(global_ep_reward, this.id);
		return Promise.resolve(global_ep_reward);
	}

	public mkDirLocals = () => {
		return new Promise((resolve, reject) => {
			exec(
				`mkdir -p A3C_Data
        mkdir -p A3C_Data/local-model-actor/${this.id}
        mkdir -p A3C_Data/local-model-critic/${this.id}`,
				(err) => {
					if (err) reject(err);
					resolve(true);
				}
			);
		});
	};

	public rmRfDirLocals = () => {
		return new Promise((resolve, reject) => {
			exec(
				`rm -rf A3C_Data/local-model-actor/${this.id}
        rm -rf A3C_Data/local-model-critic/${this.id}`,
				(err) => {
					if (err) reject(err);
					resolve(true);
				}
			);
		});
	};

	public async run() {
		//Analogy to the run function of threads
		const env = new Env(8);
		env.maxEpisodes = 10000;
		const agent = new A3CAgent_Worker(
			env,
			Math.floor(seededRandom() * 8),
			Math.floor(seededRandom() * 8)
		);
		agent.ballCount = 3;
		agent.vision = true;
		this.agent = agent;
		this.agent.env.setEntity(this.agent, { ball: 3 });

		while (this.agent.env.episodes < this.agent.env.maxEpisodes) {
			this.ep_loss = 0;

			let time_count = 0;
			let state = this.agent.getVision();
			while (true) {
				// TODO: REWRITE BELOW
				console.log(
					`Episode ${this.agent.env.episodes}: ${this.agent.env.steps + 1} / ${
						this.agent.env.maxSteps
					}`
				);

				const action = this.agent.getAction(state, this.epsilon);
				const [reward, done] = this.agent.step(action);
				this.agent.reward += reward;

				console.log('--------------------');
				const next_state = this.agent.getVision();

				const ep_mean_loss = await this.agent.trainModel(
					state,
					action,
					reward,
					next_state,
					done
					/* TODO: only sync if needed time_count === this.update_freq ? true : false */
				);
				this.agent.env.steps += 1;
				const global_best_score = await getBestScore();

				if (time_count === this.update_freq) {
					if (this.agent.reward > global_best_score) {
						await this.agent.saveLocally(this.id);
					}
					this.ep_loss += ep_mean_loss;
					console.log(this.ep_loss);
					time_count = 0;
				}

				if (done || this.agent.env.steps >= this.agent.env.maxSteps) {
					const global_epi = await getGlobalEpisode();
					const old_glob_moving_avg = await getGlobalMovingAverage();

					const glob_moving_avg = await this.record(
						global_epi,
						this.agent.reward,
						old_glob_moving_avg,
						this.ep_loss,
						this.agent.env.steps
					);

					await setGlobalMovingAverage(glob_moving_avg);

					const global_best_score = await getBestScore();
					console.log('Episode reward : ' + this.agent.reward + 1);
					console.log('Global best score ' + global_best_score);
					if (this.agent.reward > global_best_score) {
						console.log('Updating global model');
						await this.agent.saveLocally(this.id);
						await sendModel(this.id, false);
						await Promise.all([
							getGlobalModelActorWeights(this.id),
							getGlobalModelCriticWeights(this.id)
						]);
						await this.agent.reloadWeights(
							process.cwd() + `/A3C_Data/local-model-actor/${this.id}/model.json`,
							process.cwd() + `/A3C_Data/local-model-critic/${this.id}/model.json`
						);
						await setBestScore(this.agent.reward);
					}
					await incrementGlobalEpisode();
					this.agent.x = Math.floor(seededRandom() * 8);
					this.agent.y = Math.floor(seededRandom() * 8);
					this.agent.reward = 0;
					this.agent.dir = 3;

					this.agent.env.episodes += 1;
					this.agent.env.steps = 0;
					this.agent.env.reset();
					// epsilon_decay
					if (this.epsilon && this.epsilon > this.epsilonMin) {
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
				time_count++;
				state = next_state;
				console.log('----------------- END OF STEP TRAINING DATA');
			}
		}
		return notifyWorkerDone(this.id);
	}
}

process.on('SIGINT', () => {
	console.log('Caught interrupt signal');
	return worker.rmRfDirLocals().then(() => {
		process.exit();
	});
});
