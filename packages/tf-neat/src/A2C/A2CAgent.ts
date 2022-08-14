import {
	dispose,
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
	tensor,
	tidy
} from '@tensorflow/tfjs-node';
import type {
	LayersModel,
	Rank,
	SymbolicTensor,
	Sequential,
	Tensor,
	Tensor1D,
	Tensor2D
} from '@tensorflow/tfjs-node';
import { DraftTask } from './Env';
import { seededRandom } from '../utils';
import { TaskState } from '../DQN/tasks/types';
import { getRandomInt } from '../DQN/utils';

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

	public actor: Sequential;
	public critic: LayersModel;

	public dims: [number, number, number];

	constructor(draft: DraftTask, dims: [number, number, number]) {
		this.env = draft;
		this.dims = dims;
		this.epsilonIncrement = (this.epsilonFinal - this.epsilonInit) / this.epsilonDecayFrames;

		this.actor = this.createActorNetwork(...dims);
		this.critic = this.createCriticNetwork(...dims);
	}

	public createActorNetwork(dim1: number, dim2: number, dim3: number) {
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
				units: this.env.num_actions,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
		);
		model.add(
			layers.dense({
				units: this.env.num_actions * 4,
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
		model.summary();

		const optimizer = train.adam(this.actor_learning_rate);
		model.compile({
			optimizer: optimizer,
			loss: losses.softmaxCrossEntropy
		});

		return model;
	}

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
			} else {
				prob[i] = 0;
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

	public getAction(input: number[]) {
		/*
    if (seededRandom() < this.epsilon) {
			const action = Math.floor(seededRandom() * this.env.num_actions);
			console.log('Action (rand):', action);
			return action;
		}
    */
		const [dim1, dim2, dim3] = this.dims;

		return tidy(() => {
			const inputTensor = tensor4d(input, [1, dim1, dim2, dim3]);
			const logits = <Tensor<Rank>>this.actor.predict(inputTensor);
			/**
			 * Source: the following @tensorflow/tfjs book,
			 * Deep Learning with JavaScript - Neural Networks
			 * in TensorFlow.js, we can use log fn to
			 * unnormalize logits from actor pred.
			
			const unnormalizedLogits = <Tensor1D>log(logits);

			const actions = multinomial(unnormalizedLogits, 1, undefined, false);
			const action = actions.dataSync()[0];
       */
			/* TODO: USE `booleanMaskAsync` method ?? */
			/*
			const masked = new Array(this.env.num_actions).fill(1);
			for (const [key] of this.env.drafted_player_indices) {
				masked[key] = 0;
			}
			const boolMasked = tensor1d(masked, 'bool');
      const policy = booleanMaskAsync(logits, boolMasked);
      */
			const policy = logits.dataSync();
			const action = this.weightedRandomItem(this.env.all_actions, policy);
			console.log('Action (pred):', action);
			return action;
		});
	}

	public createCriticNetwork(dim1: number, dim2: number, dim3: number) {
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
				units: 16,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
			.apply(flat);

		const output = <SymbolicTensor | SymbolicTensor[]>layers
			.dense({
				units: 1,
				activation: 'linear',
				kernelInitializer: 'glorotUniform'
			})
			.apply(dense1);

		const tempModel = model({
			inputs: input_state,
			outputs: output
		});
		tempModel.summary();

		const optimizer = train.adam(this.critic_learning_rate);
		tempModel.compile({
			optimizer: optimizer,
			loss: losses.meanSquaredError
		});

		return tempModel;
	}

	public async trainModel(
		state: number[],
		action: number,
		reward: number,
		nextState: number[],
		done: boolean
	) {
		let target: number[] | Tensor1D = new Array(1).fill(0);
		let advantages: number[] | Tensor2D = new Array(this.env.num_actions).fill(0);
		const [dim1, dim2, dim3] = this.dims;

		const input = tensor4d(state, [1, dim1, dim2, dim3]);
		const next_input = tensor4d(nextState, [1, dim1, dim2, dim3]);

		const value = <Tensor<Rank>>this.critic.predict(input);
		const next_value = <Tensor<Rank>>this.critic.predict(next_input);

		const value_v = value.dataSync()[0];
		const next_value_v = next_value.dataSync()[0];

		if (done) {
			advantages[action] = reward - value_v;
			target[0] = reward;
		} else {
			advantages[action] = reward + this.gamma * next_value_v - value_v;
			target[0] = reward + this.gamma * next_value_v;
		}

		advantages = tensor2d(advantages, [1, this.env.num_actions], 'float32');
		target = tensor1d(target, 'float32');

		const actor_train = await this.actor
			.fit(input, advantages, { batchSize: 1, epochs: 1 })
			.then((val) => {
				dispose(advantages);
				return val;
			});

		const critic_train = await this.critic
			.fit(input, target, { batchSize: 1, epochs: 1 })
			.then((val) => {
				dispose(input);
				dispose(next_input);
				dispose(value);
				dispose(next_value);
				dispose(target);
				return val;
			});

		return mean(
			tensor([critic_train.history.loss[0] as number, actor_train.history.loss[0] as number])
		)
			.flatten()
			.dataSync()[0];
	}

	public step(action: number): [number, boolean, TaskState | undefined] {
		this.epsilon =
			this.frameCount >= this.epsilonDecayFrames
				? this.epsilonFinal
				: this.epsilonInit + this.epsilonIncrement * this.frameCount;
		this.frameCount++;
		const { state: nextState, reward, done, milestone } = this.env.step(action, true);
		if (milestone) this.milestone++;

		return [reward, done, nextState];
	}

	public saveLocally() {
		const rootDir = process.cwd();
		return Promise.all([
			this.actor.save('file://' + rootDir + `/A3C_Data/local-model-actor}`),
			this.critic.save('file://' + rootDir + `/A3C_Data/local-model-critic`)
		]);
	}

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
