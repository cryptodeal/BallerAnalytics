import {
	booleanMaskAsync,
	sequential,
	layers,
	train,
	losses,
	input,
	model,
	tensor4d,
	tensor2d,
	tensor1d,
	mean,
	log,
	multinomial,
	tensor,
	tidy,
	memory,
	zeros
} from '@tensorflow/tfjs-node';
import { writeFile } from 'fs/promises';
import * as hpjs from 'hyperparameters';
import type {
	LayersModel,
	Rank,
	SymbolicTensor,
	Sequential,
	Tensor,
	Tensor1D
} from '@tensorflow/tfjs-node';
import { DraftTask } from './Env';
import { MovingAverager, seededRandom } from '../utils';
import { TaskState } from '../DQN/tasks/types';
import { getRandomInt } from '../DQN/utils';

export type RLOptimizers = 'rmsprop' | 'sgd' | 'adam' | 'adagrad' | 'adamax';

export class Actor_Critic_Agent {
	public env: DraftTask;
	public episodes = 0;
	public action: null | number = null;
	public reward = 0;
	public milestone = 0;

	public learnStep = 10;
	public batchSize = 64;
	public gamma = 0.99;
	public epsilon = 0.35;
	private epsilonInit = 0.35;
	public actor_learning_rate = 1e-5;
	public critic_learning_rate = 1e-5 * 5;
	private epsilonFinal = 0.00001;
	private epsilonIncrement: number;
	private epsilonDecayFrames = 1e6;
	public frameCount = 0;

	private hyperparams_loop_count = 0;

	public actor!: Sequential;
	public critic!: LayersModel;

	public dims: [number, number, number];

	constructor(draft: DraftTask, dims: [number, number, number]) {
		this.env = draft;
		this.dims = dims;
		this.epsilonIncrement = (this.epsilonFinal - this.epsilonInit) / this.epsilonDecayFrames;
	}

	/**
	 * static fn, calls constructor & optimizes hyperparameters;
	 * returns new instance Actor_Critic_Agent with actor/critic
	 * constructed using the hyperparams resulting in lowest
	 * moving avg loss over 256 episodes
	 */
	static async build(draft: DraftTask, dims: [number, number, number]) {
		const agent = new Actor_Critic_Agent(draft, dims);
		const space = {
			actor_optimizer: hpjs.choice(['adam', 'sgd', 'rmsprop', 'adagrad', 'adamax']),
			actor_learning_rate: hpjs.loguniform(-9 * Math.log(10), -4 * Math.log(10)),
			critic_optimizer: hpjs.choice(['adam', 'sgd', 'rmsprop', 'adagrad', 'adamax']),
			critic_learning_rate: hpjs.loguniform(-9 * Math.log(10), -4 * Math.log(10))
		};
		const trials = <
			{
				argmin: {
					actor_optimizer: RLOptimizers;
					actor_learning_rate: number;
					critic_optimizer: RLOptimizers;
					critic_learning_rate: number;
				};
			}
		>await hpjs.fmin(agent.optimize_actor_hyperparams, space, hpjs.search.randomSearch, 2500, {
			rng: new hpjs.RandomState(654321)
		});
		const { actor_optimizer, actor_learning_rate, critic_optimizer, critic_learning_rate } =
			trials.argmin;
		console.log(trials.argmin);
		await writeFile(process.cwd() + `/data/optimizer.json`, JSON.stringify(trials.argmin));
		console.log(
			'Best agent_optimizer:',
			actor_optimizer,
			', Best agent_learning_rate:',
			actor_learning_rate,
			'Best critic_optimizer:',
			critic_optimizer,
			', Best critic_learning_rate:',
			critic_learning_rate
		);

		agent.actor = agent.createActorNetwork(...agent.dims, {
			optimizer: actor_optimizer,
			learningRate: actor_learning_rate
		});
		agent.critic = agent.createCriticNetwork(...agent.dims, {
			optimizer: critic_optimizer,
			learningRate: critic_learning_rate
		});
		agent.warmUp();
		// agent.env.teamRoster.storeNewData = true;
		return agent;
	}

	public warmUp(actor?: Sequential, critic?: LayersModel) {
		tidy(() => {
			const input = zeros([1, ...this.dims]);
			if (actor) {
				actor.predict(input);
			} else {
				this.actor.predict(input);
			}

			if (critic) {
				critic.predict(input);
			} else {
				this.critic.predict(input);
			}
		});
	}

	/**
	 * automatically optimizes hyperparameters:
	 *  - actor_optimizer
	 *  - actor_learning_rate
	 *  - critic_optimizer
	 *  - critic_learning_rate
	 */
	public optimize_actor_hyperparams = async ({
		actor_optimizer,
		actor_learning_rate,
		critic_optimizer,
		critic_learning_rate
	}: {
		actor_optimizer: RLOptimizers;
		actor_learning_rate: number;
		critic_optimizer: RLOptimizers;
		critic_learning_rate: number;
	}) => {
		// console.log('Memory:optimize_actor_hyperparams @ loop start', memory());

		const actor = this.createActorNetwork(this.dims[0], this.dims[1], this.dims[2], {
			optimizer: actor_optimizer,
			learningRate: actor_learning_rate
		});
		const critic = this.createCriticNetwork(this.dims[0], this.dims[1], this.dims[2], {
			optimizer: critic_optimizer,
			learningRate: critic_learning_rate
		});
		this.warmUp(actor, critic);

		console.log(
			'actor_optimizer: ',
			actor_optimizer,
			', actor_learning_rate: ',
			actor_learning_rate,
			'critic_optimizer: ',
			critic_optimizer,
			', critic_learning_rate: ',
			critic_learning_rate
		);

		let stepCount = 0;
		const lossMovAvg = new MovingAverager(128);
		let status: hpjs.STATUS_OK | hpjs.STATUS_FAIL = hpjs.STATUS_OK;
		console.log('Memory:optimize_actor_hyperparams @ loop start', memory());
		while (stepCount < 128) {
			this.env.simulatePriorPicks(this.env.pickSlot);
			const state = this.env.getState().e.flat();
			try {
				const action = await this.getAction(state, actor);
				const [reward, done, nextTaskState] = await this.step(action);
				const next_state = <number[]>nextTaskState?.e.flat();
				const loss = await this.trainingTest(
					state,
					action,
					reward,
					next_state,
					done,
					actor,
					critic
				);
				if (Number.isNaN(loss)) {
					status = hpjs.STATUS_FAIL;
					break;
				}
				if (loss === Number.NEGATIVE_INFINITY || loss === Number.POSITIVE_INFINITY) {
					status = hpjs.STATUS_FAIL;
					break;
				}

				/* track moving avg of absolute value of loss */
				lossMovAvg.append(Math.abs(loss));

				this.env.simulateLaterPicks(this.env.pickSlot);
				if (done || this.milestone >= 13) {
					this.reset();
				}
			} catch (e) {
				console.log(e);
				status = hpjs.STATUS_FAIL;
				break;
			}
			stepCount++;
		}

		this.hyperparams_loop_count++;
		console.log('hyperparams_loop_count:', this.hyperparams_loop_count);
		this.reset();
		actor.optimizer.dispose();
		actor.dispose();
		critic.optimizer.dispose();
		critic.dispose();

		const loss = lossMovAvg.average();
		console.log(
			'actor_optimizer: ',
			actor_optimizer,
			', actor_learning_rate: ',
			actor_learning_rate,
			'critic_optimizer: ',
			critic_optimizer,
			', critic_learning_rate: ',
			critic_learning_rate,
			', loss: ',
			loss
		);
		console.log('Memory:optimize_actor_hyperparams @ loop end', memory());
		return { loss, status };
	};

	/* constructs the actor network */
	public createActorNetwork(
		dim1: number,
		dim2: number,
		dim3: number,
		opts: { optimizer: RLOptimizers; learningRate: number } = {
			optimizer: 'adam',
			learningRate: this.critic_learning_rate
		}
	) {
		const model = sequential();
		model.add(
			layers.conv2d({
				inputShape: [dim1, dim2, dim3],
				kernelSize: 3,
				filters: 8,
				kernelInitializer: 'glorotUniform',
				activation: 'relu'
			})
		);
		model.add(
			layers.conv2d({
				kernelSize: 3,
				filters: 16,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
		);
		model.add(
			layers.conv2d({
				kernelSize: 3,
				filters: 32,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
		);
		model.add(layers.flatten({}));
		/* 
      TODO: REVIEW/OPTIMIZE MODEL??
    */
		model.add(
			layers.dense({
				units: this.env.num_actions * 3,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
		);
		model.add(
			layers.dense({
				units: this.env.num_actions,
				activation: 'softmax',
				kernelInitializer: 'glorotUniform'
			})
		);
		// model.summary();
		const { optimizer: optimizerStr, learningRate } = opts;

		const optimizer = this.optimizerSwitch(optimizerStr)(learningRate);
		model.compile({
			optimizer,
			loss: losses.softmaxCrossEntropy
		});

		return model;
	}

	/* constructs the actor network */
	public createCriticNetwork(
		dim1: number,
		dim2: number,
		dim3: number,
		opts: { optimizer: RLOptimizers; learningRate: number } = {
			optimizer: 'adam',
			learningRate: this.critic_learning_rate
		}
	) {
		const input_state = input({ shape: [dim1, dim2, dim3] });
		const conv1 = layers
			.conv2d({
				inputShape: [dim1, dim2, dim3],
				kernelSize: 3,
				filters: 8,
				kernelInitializer: 'glorotUniform',
				activation: 'relu'
			})
			.apply(input_state);

		const conv2 = layers
			.conv2d({
				kernelSize: 3,
				filters: 16,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
			.apply(conv1);

		const conv3 = layers
			.conv2d({
				kernelSize: 3,
				filters: 32,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
			.apply(conv2);

		const flat = layers.flatten({}).apply(conv3);
		const dense1 = layers
			.dense({
				units: this.env.num_actions * 2,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
			.apply(flat);

		const dense2 = layers
			.dense({
				units: this.env.num_actions,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
			.apply(dense1);

		const output = <SymbolicTensor | SymbolicTensor[]>layers
			.dense({
				units: 1,
				activation: 'linear',
				kernelInitializer: 'glorotUniform'
			})
			.apply(dense2);

		const tempModel = model({
			inputs: input_state,
			outputs: output
		});
		// tempModel.summary();

		const { optimizer: optimizerStr, learningRate } = opts;

		const optimizer = this.optimizerSwitch(optimizerStr)(learningRate);
		tempModel.compile({
			optimizer,
			loss: losses.meanSquaredError
		});

		return tempModel;
	}

	public optimizerSwitch(optStr: RLOptimizers) {
		switch (optStr) {
			case 'adagrad':
				return train.adagrad;
			case 'adam':
				return train.adam;
			case 'adamax':
				return train.adamax;
			case 'rmsprop':
				return train.rmsprop;
			default:
				return train.sgd;
		}
	}

	/* gets best prediction from current state */
	public async getAction(input: number[], actor?: Sequential) {
		const [dim1, dim2, dim3] = this.dims;

		const logits = tidy(() => {
			const inputTensor = tensor4d(input, [1, dim1, dim2, dim3]);
			if (actor) {
				return <Tensor<Rank>>actor.predict(inputTensor);
			} else {
				return <Tensor<Rank>>this.actor.predict(inputTensor);
			}
		});

		const masked = new Array(this.env.num_actions).fill(1);
		for (const [key] of this.env.drafted_player_indices) {
			masked[key] = 0;
		}
		const boolMasked = tensor(masked, [1, 289], 'bool');

		/* boolean masking; set invalid actions to 0 */
		const policy = await booleanMaskAsync(logits, boolMasked);
		boolMasked.dispose();
		logits.dispose();

		/**
		 * Source: the following @tensorflow/tfjs book,
		 * Deep Learning with JavaScript - Neural Networks
		 * in TensorFlow.js, we can use log fn to
		 * unnormalize logits from actor pred.
		 */
		const actions_arr = tidy(() => {
			const unnormalized_policy = <Tensor1D>log(policy);
			policy.dispose();
			const actions = multinomial(unnormalized_policy, 1, undefined, false);
			return actions.dataSync();
		});

		const testPickMap: Map<number, boolean> = new Map();
		const predCount = actions_arr.length;
		for (let i = 0; i < predCount; i++) {
			if (
				!this.env.drafted_player_indices.has(actions_arr[i]) &&
				this.env.testActorPick(actions_arr[i])
			) {
				testPickMap.set(actions_arr[i], true);
				console.log(`chose predicted action: ${actions_arr[i]}`);
				return actions_arr[i];
			} else {
				testPickMap.set(actions_arr[i], false);
			}
		}

		const valid_actions: number[] = [];
		for (let i = 0; i < this.env.num_actions; i++) {
			if (!this.env.drafted_player_indices.has(i)) {
				if (testPickMap.has(i)) {
					if (testPickMap.get(i) === true) valid_actions.push(i);
				} else {
					if (this.env.testActorPick(i)) {
						testPickMap.set(i, true);
						valid_actions.push(i);
					} else {
						testPickMap.set(i, false);
					}
				}
			}
		}

		if (valid_actions.length > 0) {
			return valid_actions[getRandomInt(0, valid_actions.length)];
		} else {
			return actions_arr[0];
		}
	}

	/**
	 * private fn used in `optimize_actor_hyperparams`;
	 * allows the hyperparameter optimization loop to
	 * pass in new actor/critic at each iteration w/o
	 * needing to set this.actor/this.critic
	 */
	private async trainingTest(
		state: number[],
		action: number,
		reward: number,
		nextState: number[],
		done: boolean,
		actor: Sequential,
		critic: LayersModel
	) {
		const target: number[] = new Array(1).fill(0);
		const advantages: number[] = new Array(this.env.num_actions).fill(0);
		const [dim1, dim2, dim3] = this.dims;

		const input = tensor4d(state, [1, dim1, dim2, dim3]);

		const value_v = tidy(() => {
			const value = <Tensor<Rank>>critic.predict(input);
			return value.dataSync()[0];
		});

		const next_value_v = tidy(() => {
			const next_input = tensor4d(nextState, [1, dim1, dim2, dim3]);
			const next_value = <Tensor<Rank>>critic.predict(next_input);
			return next_value.dataSync()[0];
		});

		if (done) {
			advantages[action] = reward - value_v;
			target[0] = reward;
		} else {
			advantages[action] = reward + this.gamma * next_value_v - value_v;
			target[0] = reward + this.gamma * next_value_v;
		}

		const advantageTensor = tensor2d(advantages, [1, this.env.num_actions], 'float32');
		const targetTensor = tensor1d(target, 'float32');

		const actor_train = await actor
			.fit(input, advantageTensor, { batchSize: 1, epochs: 1 })
			.then((val) => {
				advantageTensor.dispose();
				return val;
			});

		const critic_train = await critic
			.fit(input, targetTensor, { batchSize: 1, epochs: 1 })
			.then((val) => {
				input.dispose();
				targetTensor.dispose();
				return val;
			});

		return tidy(() => {
			return mean(
				tensor1d([<number>critic_train.history.loss[0], <number>actor_train.history.loss[0]])
			).dataSync()[0];
		});
	}

	/* public training fn; returns loss; calls this.actor/this.critic */
	public async trainModel(
		state: number[],
		action: number,
		reward: number,
		nextState: number[],
		done: boolean
	) {
		const target: number[] = new Array(1).fill(0);
		const advantages: number[] = new Array(this.env.num_actions).fill(0);
		const [dim1, dim2, dim3] = this.dims;

		const input = tensor4d(state, [1, dim1, dim2, dim3]);

		const value_v = tidy(() => {
			const value = <Tensor<Rank>>this.critic.predict(input);
			return value.dataSync()[0];
		});

		const next_value_v = tidy(() => {
			const next_input = tensor4d(nextState, [1, dim1, dim2, dim3]);
			const next_value = <Tensor<Rank>>this.critic.predict(next_input);
			return next_value.dataSync()[0];
		});

		if (done) {
			advantages[action] = reward - value_v;
			target[0] = reward;
		} else {
			advantages[action] = reward + this.gamma * next_value_v - value_v;
			target[0] = reward + this.gamma * next_value_v;
		}

		const advantageTensor = tensor2d(advantages, [1, this.env.num_actions], 'float32');
		const targetTensor = tensor1d(target, 'float32');

		const actor_train = await this.actor
			.fit(input, advantageTensor, { batchSize: 1, epochs: 1 })
			.then((val) => {
				advantageTensor.dispose();
				return val;
			});

		const critic_train = await this.critic
			.fit(input, targetTensor, { batchSize: 1, epochs: 1 })
			.then((val) => {
				input.dispose();
				targetTensor.dispose();
				return val;
			});

		return tidy(() => {
			return mean(
				tensor1d([<number>critic_train.history.loss[0], <number>actor_train.history.loss[0]])
			).dataSync()[0];
		});
	}

	/* agent performs step in RL Env using param, `action` */
	public async step(action: number): Promise<[number, boolean, TaskState | undefined]> {
		this.epsilon =
			this.frameCount >= this.epsilonDecayFrames
				? this.epsilonFinal
				: this.epsilonInit + this.epsilonIncrement * this.frameCount;
		this.frameCount++;
		const { state: nextState, reward, done, milestone } = await this.env.step(action, true);
		if (milestone) this.milestone++;

		return [reward, done, nextState];
	}

	/* saves best copy of local model locally */
	public saveLocally() {
		const rootDir = process.cwd();
		return Promise.all([
			this.actor.save('file://' + rootDir + `/data/local-model-actor`),
			this.critic.save('file://' + rootDir + `/data/local-model-critic`)
		]);
	}

	/* TODO: potentially make use of (or remove) these fns that were previously utilized? */
	private randAction(actions: number[]) {
		return actions[getRandomInt(0, actions.length)];
	}

	private weightedRandomItem = (
		data: number[],
		prob: Uint8Array | Float32Array | Int32Array | Array<number>
	) => {
		if (data.length !== prob.length) {
			throw new Error('Data and probability arrays are not of same length');
		}
		const length = prob.length;
		const validActions: number[] = [];

		for (let i = 0; i < length; i++) {
			if (!this.env.drafted_player_indices.has(data[i])) {
				validActions.push(data[i]);
			}
		}

		const rand = seededRandom();
		let threshold = 0;
		for (let i = 0; i < length; i++) {
			threshold += prob[i];
			if (threshold > rand) {
				console.log('rand weighted prediction');
				return data[i];
			}
		}
		console.log('rand valid action');
		return this.randAction(validActions);
	};

	public sample(population: number[], k: number) {
		/**
		 * Chooses k unique rand elements from a population
		 * sequence/set. Returns a new list w elements from
		 * the population w/o altering the orginal population.
		 * The resulting list is in selection order so all
		 * sub-slices are also valid random samples. This
		 * allows raffle winners (the sample) to be partitioned
		 * into grand prize and second place winners (sub-slices).
		 * Members of population don't need to be hashable or
		 * unique. If population has repeats, it's possible for
		 * each instance to be selected in sample.
		 *
		 * To sample in a range of integers, use `[...Array(number).keys()];`
		 * as an arg; this is especially fast and space efficient for
		 * sampling from a large population:
		 *  e.g. `sample([...Array(10000000).keys(60)], )`
		 *
		 * Sampling w/o replacement entails tracking either
		 * potential selections (the pool) in a list or prior
		 * selections in a set. When the number of selections is
		 * small compared to the population, tracking selections
		 * is efficient, using a small set and occasional reselection.
		 * For larger number of selections, pool tracking is preferred
		 * given the list takes less space than the set and it doesn't
		 * require frequent reselections.
		 *
		 * ref: https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array/45556840#45556840
		 */

		if (!Array.isArray(population)) throw new TypeError('Population must be an array.');
		const n = population.length;
		if (k < 0 || k > n) throw new RangeError('Sample larger than population or is negative');

		const result = new Array(k);
		let setsize = 21; // size of a small set minus size of an empty list

		if (k > 5) {
			setsize += Math.pow(4, Math.ceil(Math.log(k * 3)));
		}

		if (n <= setsize) {
			// An n-length list is smaller than a k-length set
			const pool = population.slice();
			for (let i = 0; i < k; i++) {
				// invariant:  non-selected at [0,n-i)
				const j = (seededRandom() * (n - i)) | 0;
				result[i] = pool[j];
				pool[j] = pool[n - i - 1]; // move non-selected item into vacancy
			}
		} else {
			const selected = new Set();
			for (let i = 0; i < k; i++) {
				let j = (seededRandom() * (n - i)) | 0;
				while (selected.has(j)) {
					j = (seededRandom() * (n - i)) | 0;
				}
				selected.add(j);
				result[i] = population[j];
			}
		}

		return result;
	}

	reset() {
		this.milestone = 0;
		this.reward = 0;
		this.env.reset();
	}
}
