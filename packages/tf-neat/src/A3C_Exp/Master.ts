import { Actor_Critic_Agent } from './Agent/AC_Agent';
import { Env } from './Env';
import { exec } from 'child_process';
import { serialize } from './utils';

export class MasterAgent {
	public name = `A3C_GridWorld_LocalEnv`;
	public env: Env;
	public isInit = false;
	public isTraining = false;
	public sharedAgent: Actor_Critic_Agent;
	private workerPool: Map<
		string,
		{
			ip: string;
			init?: boolean;
			workerNum: number;
			active?: boolean;
			training?: boolean;
			done?: boolean;
		}
	> = new Map();
	private workerMap: Map<
		number,
		{ ip: string; id: string; init?: boolean; active?: boolean; training?: boolean; done?: boolean }
	> = new Map();

	private i = 0;
	private reward_plotting: Record<number, number> = {};
	private moving_avg_rewards: number[] = [];

	constructor() {
		//this.workerCount = workerCount;
		this.env = new Env(8);
		this.sharedAgent = new Actor_Critic_Agent(this.env, 0, 0);
	}

	public findWorkerPool(id: string) {
		const worker = this.workerPool.get(id);
		if (!worker) throw new Error(`Worker with id '${id} not found in worker pool'`);
		return worker;
	}

	public setWorkerPool(
		id: string,
		worker: {
			ip: string;
			init?: boolean;
			workerNum: number;
			active?: boolean;
			training?: boolean;
			done?: boolean;
		}
	) {
		this.workerPool.set(id, worker);
	}

	public findWorkerMap(number: number) {
		const worker = this.workerMap.get(number);
		if (!worker) throw new Error(`Worker with workerNum '${number} not found in worker pool'`);
		return worker;
	}

	public setWorkerMap(
		ip: number,
		worker: {
			ip: string;
			id: string;
			init?: boolean;
			active?: boolean;
			training?: boolean;
			done?: boolean;
		}
	) {
		this.workerMap.set(ip, worker);
	}

	public workerCount = () => this.workerPool.size;

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
          touch workers_tokens.txt`,
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
