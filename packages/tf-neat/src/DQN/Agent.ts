import {
	train,
	tidy,
	tensor1d,
	scalar,
	oneHot,
	variableGrads,
	dispose,
	losses,
	type LayersModel,
	RMSPropOptimizer,
	AdamOptimizer,
	SGDOptimizer
} from '@tensorflow/tfjs-node';

import { createDeepQNetwork } from '.';
import { getRandomAction, DraftTask, getStateTensor } from './tasks';
import { ReplayMemory } from './utils/ReplayMemory';
import { assertPositiveInt } from './utils';

import type { Optimizer, Sequential, Tensor, Rank, Scalar } from '@tensorflow/tfjs-node';
import { PlayStepOutput } from './tasks/types';
import { seededRandom } from '../utils';

export type AgentConfig = {
	/* size of the replay memory; must be a positive integer */
	replayBufferSize: number;
	/* init value of epsilon (for epsilon-greedy algo); must be >= 0 and <= 1 */
	epsilonInit: number;
	/* the final value of epsilon; must be >= 0 and <= 1 */
	epsilonFinal: number;
	/**
	 * # of frames over which the value of `epsilon` decreases from `epsilonInit`
	 * to `epsilonFinal`, via a linear schedule
	 */
	epsilonDecayFrames: number;
	/* learning rate used during training */
	learningRate?: number;
	/* should online model be loaded to restart training of existing model */
	cachedOnlineNet?: LayersModel;
};

export class Agent {
	public task: DraftTask;
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

	/* Constructor of Agent for Task */
	constructor(task: DraftTask, config: AgentConfig) {
		this.task = task;
		const { epsilonDecayFrames, epsilonInit, epsilonFinal, cachedOnlineNet } = config;
		assertPositiveInt(epsilonDecayFrames);
		this.epsilonInit = epsilonInit;
		this.epsilonFinal = epsilonFinal;
		this.epsilonDecayFrames = epsilonDecayFrames;
		this.epsilonIncrement = (this.epsilonFinal - this.epsilonInit) / this.epsilonDecayFrames;

		this.onlineNetwork = cachedOnlineNet
			? (cachedOnlineNet as Sequential)
			: createDeepQNetwork(task.dims1, task.dims2, task.dims3, task.num_actions);
		this.targetNetwork = createDeepQNetwork(task.dims1, task.dims2, task.dims3, task.num_actions);

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

	public resetNetworks() {
		const task = this.task;
		this.onlineNetwork = createDeepQNetwork(task.dims1, task.dims2, task.dims3, task.num_actions);
		this.targetNetwork = createDeepQNetwork(task.dims1, task.dims2, task.dims3, task.num_actions);
	}

	public setOptimizer(opt: RMSPropOptimizer | AdamOptimizer | SGDOptimizer) {
		this.optimizer = opt;
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

		// const teamIdx = this.task.draftOrder.indexOf(this.task.pickSlot);
		/* TODO: simulate picks of teams earlier in draftOrder */
		/*
      for (let i = 0; i < teamIdx; i++) {
        this.task.simulatePick(this.task.draftOrder[i]);
      }
    */
		/* epsilon-greedy algo */
		/* TODO: optimize by increasing exploration as roster becomes increasingly full?? */
		let action: number;
		const state = this.task.getState();
		if (seededRandom() < this.epsilon) {
			/* pick an action at random */
			action = getRandomAction(this.task.num_actions);
		} else {
			/* greedily pick action using output from online DQN */
			action = tidy(() => {
				const stateTensor = getStateTensor(
					state,
					this.task.dims1,
					this.task.dims2,
					this.task.dims3
				);
				return this.task.all_actions[
					(this.onlineNetwork.predict(stateTensor) as Tensor<Rank>).argMax(-1).dataSync()[0]
				];
			});
		}
		const { state: nextState, reward, done, milestone } = this.task.step(action);
		this.replayMemory.append([state, action, reward, done, nextState]);

		/* TODO: simulate picks of teams later in draftOrder */
		/*
      for (let i = teamIdx + 1; i < this.task.draftOrder.length; i++) {
        this.task.simulatePick(this.task.draftOrder[i]);
      }
      const nextState = this.task.getState();
    */

		/* TODO: reverse draftOrder at end of round */
		/* 
      this.draftApi.reverseDraftOrder();
    */

		this.cumulativeReward += reward;
		if (milestone) {
			this.milestone++;
		}
		/* TODO: Copy weights of network if it hits milestone for full roster */
		const output: PlayStepOutput = {
			action,
			cumulativeReward: this.cumulativeReward,
			done,
			milestone: this.milestone
		};

		if (done || this.milestone === 13) {
			this.reset();
		}
		return output;
	}

	/**
	 * Perform training on a randomly sampled batch from the replay buffer
	 * `batchSize`: Batch size
	 * `gamma`: Reward discount rate. Must be >= 0 and <= 1
	 * `optimizer`: optimizer used to update weights of online network
	 */
	trainOnReplayBatch(batchSize: number, gamma: number, optimizer: Optimizer) {
		/* Get a batch of examples from the replay buffer */
		const batch = this.replayMemory.sample(batchSize);
		const lossFunction = () =>
			tidy(() => {
				const stateTensor = getStateTensor(
					batch.map((example) => example[0]),
					this.task.dims1,
					this.task.dims2,
					this.task.dims3
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
					this.task.dims1,
					this.task.dims2,
					this.task.dims3
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

		/* calc gradients of loss function w respect to weights of online DQN */
		const grads = variableGrads(lossFunction);
		/* use gradients to update the online DQN's weights */
		optimizer.applyGradients(grads.grads);
		dispose(grads);
		/* TODO: Return the loss value here? */
	}
}
