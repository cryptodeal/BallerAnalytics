import { seededRandom } from '../../utils';
import { dirs, colors, object_to_idx } from '../../Actor_Critic_Exp/const';
import {
	sequential,
	dispose,
	layers,
	log,
	input,
	train,
	multinomial,
	tensor1d,
	tensor2d,
	tensor4d,
	losses,
	model,
	tidy,
	mean,
	tensor,
	loadLayersModel
} from '@tensorflow/tfjs-node';
import type {
	SymbolicTensor,
	Tensor,
	Rank,
	Sequential,
	LayersModel,
	Tensor1D,
	Tensor2D
} from '@tensorflow/tfjs-node';
import { Env } from '../Env';

export class A3CAgent_Worker {
	public env: Env;
	public canvas!: HTMLCanvasElement;
	public x: number;
	public y: number;
	public dir = Math.floor(seededRandom() * dirs.length);
	public vision = false;
	public visionForward = 3;
	public action: null | number = null;
	public reward = 0;
	public ballCount = 0;
	public learnStep = 10;
	public batchSize = 64;
	public gamma = 0.99;
	public actionSize = 4;
	public actor: Sequential;
	public critic: LayersModel;
	public sharedAgent: any;

	constructor(env: Env, x: number, y: number, canvas?: HTMLCanvasElement) {
		this.env = env;
		this.x = x;
		this.y = y;
		if (canvas) this.canvas = canvas;
		this.actor = this.createActorNetwork();
		this.critic = this.createCriticNetwork();
	}

	public updateFromSharedAgent() {
		tidy(() => {
			this.actor.setWeights(this.sharedAgent.actor.getWeights());
			this.critic.setWeights(this.sharedAgent.critic.getWeights());
		});
	}

	public getAction(epsilon: number, input: number[]) {
		if (seededRandom() < epsilon) {
			return Math.floor(seededRandom() * 4);
		}

		return tidy(() => {
			const inputTensor = tensor4d(input, [1, 7, 7, 1]);
			const logits = <Tensor<Rank>>this.actor.predict(inputTensor);
			/**
			 * Source: the following @tensorflow/tfjs book,
			 * Deep Learning with JavaScript - Neural Networks
			 * in TensorFlow.js, we can use log fn to
			 * unnormalize logits from actor pred.
			 */
			const unnormalizedLogits = <Tensor1D>log(logits);

			const actions = multinomial(unnormalizedLogits, 1, undefined, false);
			return actions.dataSync()[0];
		});
	}

	public getVision() {
		const top = this.y - this.visionForward,
			left = this.x - this.visionForward;
		const s: number[] = [];

		for (let y = top; y < top + this.visionForward * 2 + 1; y += 1) {
			for (let x = left; x < left + this.visionForward * 2 + 1; x += 1) {
				if (x >= 0 && x < this.env.width && y >= 0 && y < this.env.height) {
					if (this.env.grid[y][x].length > 0) {
						s.push(object_to_idx[this.env.grid[y][x][0].type]);
					} else {
						s.push(object_to_idx['empty']);
					}
				} else {
					s.push(object_to_idx['unseen']);
				}
			}
		}
		return s;
	}

	public createActorNetwork() {
		const model = sequential();
		model.add(
			layers.conv2d({
				inputShape: [7, 7, 1],
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
		model.add(
			layers.dense({
				units: 16,
				activation: 'relu',
				kernelInitializer: 'glorotUniform'
			})
		);
		model.add(
			layers.dense({
				units: 4,
				activation: 'softmax',
				kernelInitializer: 'glorotUniform'
			})
		);
		model.summary();

		const optimizer = train.adam(1e-4);
		model.compile({
			optimizer: optimizer,
			loss: losses.softmaxCrossEntropy
		});

		return model;
	}

	public createCriticNetwork() {
		const input_state = input({ shape: [7, 7, 1] });
		const conv1 = layers
			.conv2d({
				inputShape: [7, 7, 1],
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

		const optimizer = train.adam(1e-4);
		tempModel.compile({
			optimizer: optimizer,
			loss: losses.meanSquaredError
		});

		return tempModel;
	}

	public async reloadWeights(path_actor: string, path_critic: string) {
		this.actor = <Sequential>await loadLayersModel('file://' + path_actor);
		this.critic = await loadLayersModel('file://' + path_critic);
		await this.critic.compile({
			optimizer: train.adam(1e-4),
			loss: losses.meanSquaredError
		});
		await this.actor.compile({
			optimizer: train.adam(1e-4),
			loss: losses.softmaxCrossEntropy
		});

		return Promise.resolve();
	}

	public async trainModel(
		state: number[],
		action: number,
		reward: number,
		nextState: number[],
		done: boolean
		/* TODO: only save model if need be (optimize network) */
		// sync = false
	) {
		let target: number[] | Tensor1D = new Array(1).fill(0);
		let advantages: number[] | Tensor2D = new Array(this.actionSize).fill(0);

		const input = tensor4d(state, [1, 7, 7, 1]);
		const next_input = tensor4d(nextState, [1, 7, 7, 1]);

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

		advantages = tensor2d(advantages, [1, this.actionSize], 'float32');
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

	public async saveLocally() {
		const rootDir = process.cwd();
		await this.actor.save('file://' + rootDir + '/A3C_Data/local-model-actor');
		await this.critic.save('file://' + rootDir + '/A3C_Data/local-model-critic');
	}
	public step(action: number): [number, boolean] {
		if (this.x + dirs[action][0] >= 0 && this.x + dirs[action][0] < this.env.width) {
			this.x += dirs[action][0];
		}
		if (this.y + dirs[action][1] >= 0 && this.y + dirs[action][1] < this.env.height) {
			this.y += dirs[action][1];
		}
		this.dir = action;

		let reward = 0;
		let done = false;
		let entity;

		if (this.env.grid[this.y][this.x].length !== 0) {
			for (let i = 0; i < this.env.grid[this.y][this.x].length; i += 1) {
				entity = this.env.grid[this.y][this.x][i];
				reward += entity.reward;

				// if (entity.type === 'goal' || entity.type === 'box') {
				if (entity.type === 'ball') {
					// done = true;
					this.ballCount -= 1;
					this.env.grid[this.y][this.x].pop(); // empty ball

					if (this.ballCount <= 0) {
						done = true;
					}
				} else if (entity.type === 'box') {
					done = true;
				}
			}
		} else {
			reward += this.env.globalReward;
		}

		return [reward, done];
	}

	public draw() {
		const ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
		const grid_width = this.env.grid_width;

		if (this.vision) {
			let left, top, w, h;
			left = this.x - this.visionForward;
			top = this.y - this.visionForward;
			left *= grid_width;
			top *= grid_width;

			w = (this.visionForward * 2 + 1) * grid_width;
			if (left + w > this.env.grid_W * grid_width) {
				w = this.env.grid_W * grid_width - left;
			}
			h = (this.visionForward * 2 + 1) * grid_width;
			if (top + h > this.env.grid_W * grid_width) {
				h = this.env.grid_W * grid_width - top;
			}

			if (left < 0) {
				w += left;
				left = 0;
			}
			if (top < 0) {
				h += top;
				top = 0;
			}

			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = 'rgba(255,255,255,0.5)';
			ctx.fillRect(left, top, w, h);
			ctx.closePath();
			ctx.restore();
		}

		ctx.save();
		ctx.beginPath();
		ctx.translate(this.x * grid_width + grid_width / 2, this.y * grid_width + grid_width / 2);
		ctx.rotate((Math.PI / 2) * this.dir);
		ctx.translate(-this.x * grid_width - grid_width / 2, -this.y * grid_width - grid_width / 2);
		ctx.fillStyle = colors['RED'];
		ctx.moveTo(this.x * grid_width + (grid_width * 9) / 10, this.y * grid_width + grid_width / 2);
		ctx.lineTo(this.x * grid_width + grid_width / 10, this.y * grid_width + grid_width / 10);
		ctx.lineTo(this.x * grid_width + grid_width / 10, this.y * grid_width + (grid_width * 9) / 10);
		ctx.lineTo(this.x * grid_width + (grid_width * 9) / 10, this.y * grid_width + grid_width / 2);
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}

	public sample(population: any[], k: number) {
		/*
        Chooses k unique random elements from a population sequence or set.
        Returns a new list containing elements from the population while
        leaving the original population unchanged.  The resulting list is
        in selection order so that all sub-slices will also be valid random
        samples.  This allows raffle winners (the sample) to be partitioned
        into grand prize and second place winners (the subslices).
        Members of the population need not be hashable or unique.  If the
        population contains repeats, then each occurrence is a possible
        selection in the sample.
        To choose a sample in a range of integers, use range as an argument.
        This is especially fast and space efficient for sampling from a
        large population:   sample(range(10000000), 60)
        Sampling without replacement entails tracking either potential
        selections (the pool) in a list or previous selections in a set.
        When the number of selections is small compared to the
        population, then tracking selections is efficient, requiring
        only a small set and an occasional reselection.  For
        a larger number of selections, the pool tracking method is
        preferred since the list takes less space than the
        set and it doesn't suffer from frequent reselections.
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
}
