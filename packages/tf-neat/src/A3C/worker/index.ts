import { Agent } from '../agent';
import { oneHot, type Rank, type Tensor } from '@tensorflow/tfjs-node';
import {
	writeQueue,
	sendModel,
	getGlobalEpisode,
	getGlobalMovingAverage,
	setGlobalMovingAverage,
	getBestScore,
	getGlobalModelActor,
	getGlobalModelCritic,
	setBestScore,
	incrementGlobalEpisode,
	notifyWorkerDone
} from '../utils';
import { Memory } from '../utils/Memory';
import { weightedRandomItem } from '../../utils';

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
	public env: any;
	public update_freq: number;
	public action_size!: number;
	public state_size!: number;
	public agent!: Agent;

	constructor(workerIdx: number) {
		this.workerIdx = workerIdx;

		// this.env = new Environment(1500);
		this.update_freq = 10;
	}

	public async run() {
		//Analogy to the run function of threads
		let total_step = 1;
		const mem = new Memory();
		await this.env.init_env(true);

		let data = this.env.getEnvironmentData();
		this.state_size = 9;
		this.action_size = data.actions_index.length;

		this.agent = new Agent(this.state_size, this.action_size, 24);

		for (let i = 0; i < Object.values(data.websites).length; i++) {
			let current_state = this.env.reset(i);
			mem.clear();
			let ep_reward = 0.0;
			let ep_steps = 0;
			const step_count = 0;
			this.ep_loss = 0;

			let time_count = 0;
			while (true) {
				data = this.env.getEnvironmentData();
				console.log(
					'Episode ' + i + ' : ' + (data.current_step + 1) + '/' + (data.length_episode + 1)
				);
				const policy = <Tensor<Rank>>(
					this.agent.callActor(oneHot(this.agent.fmtState(current_state), 12).reshape([1, 9, 12]))
				);

				const action = <number>weightedRandomItem(data.actions_index, policy.dataSync());

				const step_data = await this.env.step(action);
				console.log('-------------');
				const next_state = step_data.state,
					reward = step_data.reward,
					done = step_data.done;

				ep_reward += reward;

				mem.store(current_state, action, reward);
				if (time_count === this.update_freq || done) {
					//train local network
					const ep_mean_loss = await this.agent.trainModel(done, mem, next_state);

					await sendModel(this.workerIdx, true);
					// Updating local model with new weights
					//NESCESSARY ?
					//await this.agent.reload_weights(__dirname+'/')
					this.ep_loss += ep_mean_loss;
					console.log(this.ep_loss);
					mem.clear();
					time_count = 0;
					//TODO : Maybe we shouldn't write the weights yet, and just store them ?
				}

				if (done) {
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
						await sendModel(this.workerIdx, false);
						await getGlobalModelActor();
						await getGlobalModelCritic();
						await this.agent.reloadWeights(
							__dirname + '/local-model-actor/model.json',
							__dirname + '/local-model-critic/model.json'
						);
						await setBestScore(ep_reward);
					}
					await incrementGlobalEpisode();
					break;
				}
				ep_steps++;
				time_count++;
				current_state = next_state;
				total_step++;
				console.log('----------------- END OF TRAINING DATA');
			}
		}

		await writeQueue('done');
		await notifyWorkerDone();
		return Promise.resolve();
	}
}
