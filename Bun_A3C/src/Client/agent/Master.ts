import { Agent } from '.';
import {
	createQueue,
	getBlockingQueue,
	getWorkersHostNames,
	startWorker,
	waitForWorkers
} from '../utils';
import { exec } from 'bun-utilities';
import { serialize } from '../../utils';
/* need to actually write env based off DQN Draft Util */
const environment: any = {};

export class MasterAgent {
	public worker_count: number;
	public name!: string;
	public env!: any;
	public env_data!: any;
	public action_size!: number;
	public state_size!: number;
	public agent!: Agent;

	constructor(workerCount: number) {
		this.worker_count = workerCount;
	}

	public async init() {
		this.name = 'Bun_A3C-env';
		this.env = environment.EnvironmentController(1500);
		await this.env.init_env();

		this.env_data = this.env.getEnvironmentData();

		this.action_size = this.env_data.actions_index.length;
		this.state_size = 9;

		console.log(this.state_size, this.action_size);

		this.agent = new Agent(this.state_size, this.action_size, 24);
		this.agent.actor.save('file://global-model-actor/');
		this.agent.critic.save('file://global-model-critic/');
		return;
	}

	public async train() {
		await createQueue();
		const reward_plotting: Record<number, number> = {};
		const workers = await getWorkersHostNames();
		await (async () => {
			const { isExecuted } = await exec([import.meta.dir + '/init_files.sh']);
			return new Promise((resolve, reject) => {
				if (!isExecuted) reject(isExecuted);
				resolve(isExecuted);
			});
		})();

		for (let i = 0; i < workers.length; i++) {
			console.log('Starting worker ' + i);
			await startWorker(workers[i]);
		}

		const moving_avg_rewards: number[] = [];
		let i = 0;
		while (true) {
			const reward = await getBlockingQueue();
			if (typeof reward === 'number') {
				console.log('Pulled new data from queue : ' + reward);
				moving_avg_rewards.push(reward);
				reward_plotting[i] = moving_avg_rewards[i];
				await serialize(
					{
						reward_plotting: reward_plotting
					},
					'plot_moving_avg_reward_a3c.json'
				);
			} else {
				break;
			}
			i++;
		}
		await waitForWorkers();
		return;
	}
}
