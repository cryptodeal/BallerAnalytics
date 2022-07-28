import { Env } from '../Env';
// import minimist from 'minimist';
// import { json } from 'body-parser';
import { seededRandom } from '../../utils';
// import polka from 'polka';
import { A3CAgent_Worker } from '../Agent';
import {
	// addWorkerToken,
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
	writeQueue
} from '../utils';

async function record(
	episode: number,
	reward: number,
	idx: number,
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
	console.log('Episode :' + episode);
	console.log('Moving average reward : ' + global_ep_reward);
	console.log('Episode reward : ' + reward);
	console.log(
		'Loss: ' + (num_steps == 0 ? total_loss : Math.ceil((total_loss / num_steps) * 1000) / 1000)
	);
	console.log('Steps : ' + num_steps);
	console.log('Worker :' + idx);
	console.log('********************* GLOBAL EP REWARD ' + global_ep_reward);
	await writeQueue(global_ep_reward);
	return Promise.resolve(global_ep_reward);
}

export class Worker {
	public workerIdx: number;
	public ep_loss = 0.0;
	/* TODO: write Environment class */
	public update_freq: number;
	public action_size!: number;
	public state_size!: number;
	public agent!: A3CAgent_Worker;
	public epsilon = 0.3;
	public epsilonMin = 0.0;
	public epsilonMultiply = 0.99;

	constructor(workerIdx: number) {
		this.workerIdx = workerIdx;

		// this.env = new Environment(1500);
		this.update_freq = 10;
	}

	public async run() {
		//Analogy to the run function of threads
		let total_step = 1;

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
		this.agent.env.setEntity(this.agent, { ball: 3 });

		for (let i = 0; i < this.agent.env.maxEpisodes; i++) {
			let ep_reward = 0.0;
			let ep_steps = 0;
			const step_count = 0;
			this.ep_loss = 0;

			let time_count = 0;
			let state = this.agent.getVision();
			while (true) {
				// TODO: REWRITE BELOW
				console.log(
					'Episode ' + i + ' : ' + (this.agent.env.steps + 1) + '/' + this.agent.env.maxSteps
				);
				const action = this.agent.getAction(this.epsilon, state);
				const [reward, done] = this.agent.step(action);
				this.agent.reward += reward;
				this.agent.reward = parseFloat(agent.reward.toFixed(2));

				console.log('--------------------');
				const next_state = this.agent.getVision();

				ep_reward += reward;
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
					if (ep_reward > global_best_score) {
						await this.agent.saveLocally();
					}
					this.ep_loss += ep_mean_loss;
					console.log(this.ep_loss);
					time_count = 0;
				}

				if (done || this.agent.env.steps >= this.agent.env.maxSteps) {
					const global_epi = await getGlobalEpisode();
					const old_glob_moving_avg = await getGlobalMovingAverage();

					const glob_moving_avg = await record(
						global_epi,
						ep_reward,
						this.workerIdx,
						old_glob_moving_avg,
						this.ep_loss,
						ep_steps
					);

					await setGlobalMovingAverage(glob_moving_avg);

					const global_best_score = await getBestScore();
					console.log('Episode reward : ' + ep_reward);
					console.log('Global best score ' + global_best_score);
					if (ep_reward > global_best_score) {
						console.log('Updating global model');
						await this.agent.saveLocally();
						await sendModel(this.workerIdx, false);
						await Promise.all([getGlobalModelActorWeights(), getGlobalModelCriticWeights()]);
						await this.agent.reloadWeights(
							process.cwd() + '/A3C_Data/local-model-actor/model.json',
							process.cwd() + '/A3C_Data/local-model-critic/model.json'
						);
						await setBestScore(ep_reward);
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
					if (i === 0 && this.epsilon > this.epsilonMin) {
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
				ep_steps++;
				time_count++;
				state = next_state;
				total_step++;
				console.log('----------------- END OF STEP TRAINING DATA');
			}
		}

		await writeQueue('done');
		await notifyWorkerDone();
		return Promise.resolve();
	}
}
/*
const argv = <{ port?: number; p?: number }>minimist(process.argv.slice(2));

let port = 8085;
// specify port using -p or --port arg
if (argv.port || argv.p) port = argv.port ? argv.port : argv.p ? argv.p : 8085;

const app = polka();
app.use(json({ limit: '10mb' }));
app.get('/start_worker', (req, res) => {
	const worker = new Worker(1);
	(async () => {
		await addWorkerToken(1);
		await worker.run();
	})();
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify({ status: 'SUCCESS' }));
});
app.listen(port, () => {
	console.log(`> Running on http://localhost:${port}`);
});
*/
