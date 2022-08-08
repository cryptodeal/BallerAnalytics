import { Actor_Critic_Agent } from './Agent/AC_Agent';
import { tidy } from '@tensorflow/tfjs-node';
import { Env } from './Env';
import { exec } from 'child_process';
import { parseWeights, prepWeights, serialize } from './utils';
import { SharedAgentWeights } from './types';

export class MasterAgent {
	public name = `A3C_GridWorld_LocalEnv`;
	public env: Env;
	public isInit = false;
	public isTraining = false;
	private sharedAgent: Actor_Critic_Agent;
	public sharedAgentWeights: SharedAgentWeights;
	private workerPool: Map<
		string,
		{
			ip: string;
			init?: boolean;
			active?: boolean;
			training?: boolean;
			done?: boolean;
			first?: boolean;
		}
	> = new Map();

	private i = 0;
	private reward_plotting: Record<number, number> = {};
	private moving_avg_rewards: number[] = [];

	constructor() {
		//this.workerCount = workerCount;
		this.env = new Env(8);
		this.sharedAgent = new Actor_Critic_Agent(this.env, 0, 0);
		/* read/write weights to file, parsing into memory */
		this.sharedAgentWeights = {
			actor: prepWeights(this.sharedAgent.actor.getWeights()),
			critic: prepWeights(this.sharedAgent.critic.getWeights())
		};
		/* TODO: SAVE shared agent to global actor/critic models */
	}

	public findWorkerPool(id: string) {
		const worker = this.workerPool.get(id);
		if (!worker) throw new Error(`Worker with id '${id} not found in worker pool'`);
		return worker;
	}

	public allWorkersDone() {
		let isDone = true;
		for (const [, { done }] of this.workerPool) {
			if (!done) {
				isDone = false;
				break;
			}
		}
		return isDone;
	}

	public activeInPool() {
		let count = 0;
		for (const [, { active }] of this.workerPool) {
			if (active) count++;
		}
		return count;
	}

	public hasWorkerPool(id: string) {
		return this.workerPool.has(id);
	}

	public removeWorker(id: string) {
		return this.workerPool.delete(id);
	}

	public setWorkerPool(
		id: string,
		worker: {
			ip: string;
			init?: boolean;
			active?: boolean;
			training?: boolean;
			done?: boolean;
			first?: boolean;
		}
	) {
		this.workerPool.set(id, worker);
	}
	public saveSharedAgentModel = () => {
		tidy(() => {
			this.sharedAgent.actor.setWeights(parseWeights(this.sharedAgentWeights.actor));
			this.sharedAgent.critic.setWeights(parseWeights(this.sharedAgentWeights.critic));
		});
		const rootDir = process.cwd();
		return Promise.all([
			this.sharedAgent.actor.save('file://' + rootDir + '/A3C_Data/global-model-actor'),
			this.sharedAgent.critic.save('file://' + rootDir + '/A3C_Data/global-model-critic')
		]);
	};

	public workerCount = () => this.workerPool.size;

	public async init() {
		await (async () => {
			return new Promise((resolve, reject) => {
				exec(
					`mkdir -p A3C_Data
          mkdir -p A3C_Data/temporary-global-model-actor
          mkdir -p A3C_Data/temporary-global-model-critic
          mkdir -p A3C_Data/global-model-actor
          mkdir -p A3C_Data/global-model-critic
          mkdir -p A3C_Data/logs`,
					(err) => {
						if (err) reject(err);
						resolve(true);
					}
				);
			});
		})();
		await this.sharedAgent.actor.save('file://' + process.cwd() + '/A3C_Data/global-model-actor');
		await this.sharedAgent.critic.save('file://' + process.cwd() + '/A3C_Data/global-model-critic');
		this.isInit = true;
	}

	public async queue(reward: number) {
		this.moving_avg_rewards.push(reward);
		this.reward_plotting[this.i] = this.moving_avg_rewards[this.i];
		await serialize(
			{
				reward_plotting: this.reward_plotting
			},
			'plot_moving_avg_reward_a3c.json'
		);
		this.i++;
	}
}
