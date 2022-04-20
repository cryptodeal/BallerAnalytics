import {
	train,
	tidy,
	tensor1d,
	scalar,
	oneHot,
	variableGrads,
	dispose,
	losses
} from '@tensorflow/tfjs';

import { createDeepQNetwork } from '.';
import { getRandomAction, Task, getStateTensor } from './tasks';
// import { getRandomAction, Snaketask, NUM_ACTIONS, ALL_ACTIONS, getStateTensor } from './snake_task';
import { ReplayMemory } from './utils/ReplayMemory';
import { assertPositiveInt } from './utils';

import type { Optimizer, Sequential, Tensor, Rank, Scalar } from '@tensorflow/tfjs';
import { PlayStepOutput } from './tasks/types';

export type AgentConfig = {
	/* size of the replay memory; must be a positive integer */
	replayBufferSize: number;
	/* init value of epsilon (for epsilon-greedy algo); must be >= 0 and <= 1 */
	epsilonInit: number;
	/* the final value of epsilon; must be >= 0 and <= 1 */
	epsilonFinal: number;
	/**
	 * # of frames over which the value of `epsilon` decreases from `episloInit`
	 * to `epsilonFinal`, via a linear schedule
	 */
	epsilonDecayFrames: number;
	/* learning rate used during training */
	learningRate: number;
};

export class Agent {
	public task;
	public epsilon!: number;
	public epsilonInit: number;
	public epsilonFinal: number;
	public epsilonDecayFrames: number;
	public onlineNetwork: Sequential;
	public targetNetwork: Sequential;
	public optimizer: Optimizer;
	public replayBufferSize: number;
	public replayMemory: ReplayMemory;
	public frameCount = 0;

	private epsilonIncrement: number;
	private cumulativeReward = 0;
	private milestone = 0;

	/* Constructor of Task Agent */
	constructor(task: Task, config: AgentConfig) {
		assertPositiveInt(config.epsilonDecayFrames);
		this.epsilonInit = config.epsilonInit;
		this.epsilonFinal = config.epsilonFinal;
		this.epsilonDecayFrames = config.epsilonDecayFrames;
		this.epsilonIncrement = (this.epsilonFinal - this.epsilonInit) / this.epsilonDecayFrames;

		this.onlineNetwork = createDeepQNetwork(task.height, task.width, task.num_actions);
		this.targetNetwork = createDeepQNetwork(task.height, task.width, task.num_actions);

		/**
		 * Freeze taget network: it's weights are updated only through copying from
		 * the online network.
		 */
		this.targetNetwork.trainable = false;

		this.optimizer = train.adam(config.learningRate);

		this.replayBufferSize = config.replayBufferSize;
		this.replayMemory = new ReplayMemory(config.replayBufferSize);
		this.reset();
	}

	reset() {
		this.cumulativeReward = 0;
		this.milestone = 0;
		this.task.reset();
	}

	playStep() {
		this.epsilon =
			this.frameCount >= this.epsilonDecayFrames
				? this.epsilonFinal
				: this.epsilonInit + this.epsilonIncrement * this.frameCount;
		this.frameCount++;

		/* epsilon-greedy algo */
		let action: number;
		const state = this.task.getState();
		if (Math.random() < this.epsilon) {
			/* pick an action at random */
			action = getRandomAction(this.task.num_actions);
		} else {
			/* greedily pick action using output from online DQN */
			action = tidy(() => {
				const stateTensor = getStateTensor(state, this.task.height, this.task.width);
				return this.task.all_actions[
					(this.onlineNetwork.predict(stateTensor) as Tensor<Rank>).argMax(-1).dataSync()[0]
				];
			});
		}

		const { state: nextState, reward, done, fruitEaten } = this.task.step(action);

		this.replayMemory.append([state, action, reward, done, nextState]);

		this.cumulativeReward += reward;
		if (fruitEaten) {
			this.milestone++;
		}
		const output: PlayStepOutput = {
			action,
			cumulativeReward: this.cumulativeReward,
			done,
			milestone: this.milestone
		};
		if (done) {
			this.reset();
		}
		return output;
	}

	/**
	 * Perform training on a randomly sampled batch from the replay buffer.
	 *
	 * @param {number} batchSize Batch size.
	 * @param {number} gamma Reward discount rate. Must be >= 0 and <= 1.
	 * @param {train.Optimizer} optimizer The optimizer object used to update
	 *   the weights of the online network.
	 */
	trainOnReplayBatch(batchSize: number, gamma: number, optimizer: Optimizer) {
		// Get a batch of examples from the replay buffer.
		const batch = this.replayMemory.sample(batchSize);
		const lossFunction = () =>
			tidy(() => {
				const stateTensor = getStateTensor(
					batch.map((example) => example[0]),
					this.task.height,
					this.task.width
				);
				const actionTensor = tensor1d(
					batch.map((example) => example[1]),
					'int32'
				);
				const qs = (this.onlineNetwork.apply(stateTensor, { training: true }) as Tensor<Rank>)
					.mul(oneHot(actionTensor, this.task.num_actions))
					.sum(-1);

				const rewardTensor = tensor1d(batch.map((example) => example[2]));
				const nextStateTensor = getStateTensor(
					batch.map((example) => example[4]),
					this.task.height,
					this.task.width
				);
				const nextMaxQTensor = (this.targetNetwork.predict(nextStateTensor) as Tensor<Rank>).max(
					-1
				);
				const doneMask = scalar(1).sub(
					tensor1d(batch.map((example) => example[3])).asType('float32')
				);
				const targetQs = rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(gamma));
				return losses.meanSquaredError(targetQs, qs) as Scalar;
			});

		// Calculate the gradients of the loss function with repsect to the weights
		// of the online DQN.
		const grads = variableGrads(lossFunction);
		// Use the gradients to update the online DQN's weights.
		optimizer.applyGradients(grads.grads);
		dispose(grads);
		// TODO(cais): Return the loss value here?
	}
}
