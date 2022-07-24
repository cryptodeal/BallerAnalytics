import { Actor_Critic_Agent } from '../../Actor_Critic_Exp/AC_Agent';
import { Env } from '../../Actor_Critic_Exp/Env';

export class MasterAgent {
	public workerCount: number;
	public name = `A3C_GridWorld_LocalEnv`;
	public env: Env;
	public globalStep = 0;
	public sharedAgent: Actor_Critic_Agent;

	constructor(workerCount: number) {
		this.workerCount = workerCount;
		this.env = new Env(8);
		this.sharedAgent = new Actor_Critic_Agent(this.env, 0, 0);
	}

	public async init() {
		await this.sharedAgent.actor.save('file://global-model-actor/');
		await this.sharedAgent.critic.save('file://global-model-critic/');
	}

	public async train() {
		const reward_plotting: Record<number, number> = {};
		/* TODO: Finish MasterAgent implementation for A3C network */
		//const workers = getWorkersHostNames();
	}
}
