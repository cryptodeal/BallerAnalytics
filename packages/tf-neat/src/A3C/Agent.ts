import {
	sequential,
	layers,
	train,
	losses,
	loadLayersModel,
	oneHot,
	tensor,
	mean
} from '@tensorflow/tfjs-node';
import type { Sequential, Tensor, Rank } from '@tensorflow/tfjs-node';

const zeros = (w: number, h: number, v = 0): number[][] =>
	Array.from(new Array(h), () => Array(w).fill(v));

export class Agent {
	public action_size: number;
	public state_size: number;
	public num_hidden: number;
	public discount_factor: number;
	public actions_index!: any;
	public value_size!: number;
	public actor: Sequential;
	public critic: Sequential;

	constructor(
		state_size: number,
		action_size: number,
		num_hidden: number,
		actions_idx = undefined
	) {
		this.action_size = action_size;
		console.log('Actions size ' + action_size);
		this.state_size = state_size;

		this.num_hidden = num_hidden;
		this.discount_factor = 0.999;

		if (actions_idx) this.actions_index = actions_idx;

		this.actor = this.buildActor();
		this.critic = this.buildCritic();
	}

	public buildActor() {
		const model = sequential();

		model.add(
			layers.dense({
				inputShape: [9, 12],
				units: this.num_hidden,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
		);

		model.add(layers.flatten());

		model.add(
			layers.dense({
				units: this.action_size,
				activation: 'softmax',
				kernelInitializer: 'glorotUniform'
			})
		);

		model.summary();

		model.compile({
			optimizer: train.adam(1e-4),
			loss: losses.softmaxCrossEntropy
		});

		return model;
	}

	public buildCritic() {
		const model = sequential();

		model.add(
			layers.dense({
				inputShape: [9, 12],
				kernelInitializer: 'glorotUniform',
				activation: 'relu',
				units: this.num_hidden
			})
		);

		model.add(layers.flatten());

		model.add(
			layers.dense({
				kernelInitializer: 'glorotUniform',
				activation: 'softmax',
				units: 1
			})
		);

		model.summary();
		model.compile({
			optimizer: train.adam(5e-4),
			loss: losses.meanSquaredError
		});

		return model;
	}

	public fmtState(state: (number | number[])[]): number[] {
		const copy = state.slice();
		const length = state.length;
		for (let i = 0; i < length; i++) {
			if (Array.isArray(copy[i])) {
				copy[i] = Math.ceil(state[i][1] / 10);
			}
		}
		return copy as number[];
	}

	public callActor(inputs: Tensor<Rank> | Tensor<Rank>[]) {
		return this.actor.predict(inputs);
	}

	public callCritic(inputs: Tensor<Rank> | Tensor<Rank>[]) {
		return this.critic.predict(inputs);
	}

	public async reloadWeights(pathActor: string, pathCritic: string) {
		this.actor = (await loadLayersModel('file://' + pathActor)) as Sequential;
		this.critic = (await loadLayersModel('file://' + pathCritic)) as Sequential;
		await this.critic.compile({
			optimizer: train.adam(5e-4),
			loss: losses.meanSquaredError
		});
		await this.actor.compile({
			optimizer: train.adam(1e-4),
			loss: losses.softmaxCrossEntropy
		});
		return Promise.resolve();
	}

	/* TODO: dispose of uneccessary tensors & test memory burn in */
	public async trainModel(done: boolean, memory: any, nextState: any) {
		const target = zeros(this.value_size, memory.actions.length);
		const advantages = zeros(this.action_size, memory.actions.length);

		let tf_oneHotStates;
		const length = memory.stats.length;
		for (let i = 0; i < length; i++) {
			if (i === 0) {
				tf_oneHotStates = oneHot(this.fmtState(memory.states[i]), 12);
			} else {
				tf_oneHotStates = tf_oneHotStates.concat(oneHot(this.fmtState(memory.states[i]), 12));
			}
		}
		let oneHotNextState = oneHot(this.fmtState(nextState), 12);
		oneHotNextState = oneHotNextState.reshape([1, 9, 12]);
		const values = (
			this.critic.predict(tf_oneHotStates.reshape([memory.states.length, 9, 12])) as Tensor<Rank>
		).reshape([memory.states.length, 1]);
		const next_value = (this.critic.predict(oneHotNextState) as Tensor<Rank>).reshape([1]);
		let reward_sum = 0;
		if (!done) {
			reward_sum = (
				this.critic.predict(
					oneHot(this.fmtState(nextState), 12).reshape([1, 9, 12])
				) as Tensor<Rank>
			)
				.flatten()
				.dataSync()[0];
		}

		let discounted_rewards: number[] = [];
		const memory_reward_rev = memory.rewards;
		for (const reward of memory_reward_rev.reverse()) {
			reward_sum = reward + this.discount_factor * reward_sum;
			discounted_rewards.push(reward_sum);
		}
		discounted_rewards = discounted_rewards.reverse();
		const discounted_rewards_tf = tensor(discounted_rewards);
		if (done) {
			for (let i = 0; i < memory.actions.length; i++) {
				advantages[i][memory.actions[i]] =
					discounted_rewards_tf.dataSync()[i] - values.dataSync()[i][0];
				target[i][0] = discounted_rewards[i];
			}
		} else {
			for (let i = 0; i < memory.actions.length; i++) {
				advantages[i][memory.actions[i]] =
					next_value.flatten().dataSync()[0] * this.discount_factor +
					discounted_rewards_tf.dataSync()[i] -
					values.dataSync()[i][0];
				target[i][0] =
					next_value.flatten().dataSync()[0] * this.discount_factor +
					discounted_rewards_tf.dataSync()[i];
			}
		}

		const actor_train = await this.actor.fit(
			tf_oneHotStates.reshape([memory.actions.length, 9, 12]),
			tensor(advantages).reshape([memory.actions.length, this.action_size]),
			{
				epochs: 1,
				verbose: 0
			}
		);

		const critic_train = await this.critic.fit(
			tf_oneHotStates.reshape([memory.actions.length, 9, 12]),
			tensor(target).reshape([memory.actions.length, 1]),
			{
				epochs: 1,
				verbose: 0
			}
		);

		await this.actor.save('file://./local-model-actor');
		await this.critic.save('file://./local-model-critic');

		return Promise.resolve(
			mean(tensor([critic_train.history.loss[0] as number, actor_train.history.loss[0] as number]))
				.flatten()
				.dataSync()[0]
		);
	}
}
