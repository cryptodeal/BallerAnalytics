import type { TensorLike } from '@tensorflow/tfjs-node';

export class Memory {
	public states: TensorLike[];
	public actions: number[];
	public rewards: number[];

	constructor() {
		this.states = [];
		this.actions = [];
		this.rewards = [];
	}

	store(state: TensorLike, action: number, reward: number) {
		this.states.push(state);
		this.actions.push(action);
		this.rewards.push(reward);
	}

	clear() {
		this.states = [];
		this.actions = [];
		this.rewards = [];
	}
}
