import { Actor_Critic_Agent } from './Agent/AC_Agent';
import { Env } from './Env';
import { exec } from 'child_process';
import {
	createQueue,
	getBlockingQueue,
	// getWorkersHostNames,
	// startWorker,
	waitForWorkers,
	serialize
} from './utils';
import type { Websocket } from 'hyper-express';

export class MasterAgent {
	// public workerCount: number;
	public name = `A3C_GridWorld_LocalEnv`;
	public env: Env;
	public globalStep = 0;
	public sharedAgent: Actor_Critic_Agent;
	public workerPool!: Map<number, { ip: string; ws: Websocket }>;

	constructor() {
		//this.workerCount = workerCount;
		this.env = new Env(8);
		this.sharedAgent = new Actor_Critic_Agent(this.env, 0, 0);
	}

	public async init() {
		await (async () => {
			return new Promise((resolve, reject) => {
				exec(
					`rm -f A3C_Data/*.txt
          mkdir -p A3C_Data
          mkdir -p A3C_Data/temporary-global-model-actor
          mkdir -p A3C_Data/temporary-global-model-critic
          mkdir -p A3C_Data/global-model-actor
          mkdir -p A3C_Data/global-model-critic
          mkdir -p A3C_Data/logs
          cd A3C_Data
          touch queue.txt global_moving_average.txt best_score.txt global_episode.txt workers_tokens.txt
          echo 0 > global_moving_average.txt
          echo 0 > global_episode.txt
          echo 0 > best_score.txt`,
					(err) => {
						if (err) reject(err);
						resolve(true);
					}
				);
			});
		})();
		await this.sharedAgent.actor.save('file://' + process.cwd() + '/A3C_Data/global-model-actor');
		await this.sharedAgent.critic.save('file://' + process.cwd() + '/A3C_Data/global-model-critic');
	}

	public async train() {
		await createQueue();
		const reward_plotting: Record<number, number> = {};
		// const workers = await getWorkersHostNames();

		for (const [key, { ip, ws }] of this.workerPool) {
			console.log('Starting worker: ' + key + ' ' + ip);
			ws.send(JSON.stringify({ type: 'RUN', workerNum: key }));
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
		return waitForWorkers();
	}
}
