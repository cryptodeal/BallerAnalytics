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
	tensor1d
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
import type { Env } from '../Env';
import { dirs, colors } from '../../Actor_Critic_Exp/const';
import { seededRandom } from '../../utils';

export class Actor_Critic_Agent {
	public env: Env;
	public canvas!: HTMLCanvasElement;
	public x: number;
	public y: number;
	public action: null | number = null;
	public reward = 0;
	public ballCount = 0;
	public doorCount = 0;
	public key = false;
	public dir = Math.floor(seededRandom() * dirs.length);
	public vision = false;
	public visionForward = 3;

	public learnStep = 10;
	public batchSize = 64;
	public gamma = 0.99;

	public actionSize = 4;
	public actor: Sequential;
	public critic: LayersModel;

	constructor(env: Env, x: number, y: number, canvas?: HTMLCanvasElement) {
		this.env = env;
		if (canvas) this.canvas = canvas;
		this.x = x;
		this.y = y;

		this.actor = this.createActorNetwork();
		this.critic = this.createCriticNetwork();
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

	public async trainModel(
		state: number[],
		action: number,
		reward: number,
		nextState: number[],
		done: boolean
	) {
		let target: number[] | Tensor1D = new Array(1).fill(0);
		let advantages: number[] | Tensor2D = new Array(this.actionSize).fill(0);

		const input = tensor4d(state, [1, 7, 7, 1]);
		const nextInput = tensor4d(nextState, [1, 7, 7, 1]);

		const value = <Tensor<Rank>>this.critic.predict(input);
		const nextValue = <Tensor<Rank>>this.critic.predict(nextInput);

		const valueV = value.dataSync()[0];
		const nextValueV = nextValue.dataSync()[0];

		if (done) {
			advantages[action] = reward - valueV;
			target[0] = reward;
		} else {
			advantages[action] = reward + this.gamma * nextValueV - valueV;
			target[0] = reward + this.gamma * nextValueV;
		}

		advantages = tensor2d(advantages, [1, this.actionSize], 'float32');
		target = tensor1d(target, 'float32');

		await this.actor.fit(input, advantages, { batchSize: 1, epochs: 1 }).then(() => {
			dispose(advantages);
		});

		await this.critic.fit(input, target, { batchSize: 1, epochs: 1 }).then(() => {
			dispose(input);
			dispose(nextInput);
			dispose(value);
			dispose(nextValue);
			dispose(target);
		});
	}

	public step(action: number): [number, boolean] {
		let entity;

		if (this.x + dirs[action][0] >= 0 && this.x + dirs[action][0] < this.env.width) {
			entity = this.env.grid[this.y][this.x + dirs[action][0]][0];
			if (
				entity === undefined ||
				entity.type === 'key' ||
				(entity.type === 'door' && this.key === true) ||
				entity.type === 'ball' ||
				entity.type === 'goal'
			) {
				this.x += dirs[action][0];
			}
		}
		if (this.y + dirs[action][1] >= 0 && this.y + dirs[action][1] < this.env.height) {
			entity = this.env.grid[this.y + dirs[action][1]][this.x][0];
			if (
				entity === undefined ||
				entity.type === 'key' ||
				(entity.type === 'door' && this.key === true) ||
				entity.type === 'ball' ||
				entity.type === 'goal'
			) {
				this.y += dirs[action][1];
			}
		}
		this.dir = action;

		let reward = 0;
		let done = false;

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
				} else if (entity.type === 'door') {
					this.doorCount -= 1;
					this.env.grid[this.y][this.x].pop();
				} else if (entity.type === 'key') {
					this.key = true;
					this.env.grid[this.y][this.x].pop();
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
			let left = this.x - this.visionForward,
				top = this.y - this.visionForward,
				w = (this.visionForward * 2 + 1) * grid_width,
				h = (this.visionForward * 2 + 1) * grid_width;

			left *= grid_width;
			top *= grid_width;

			if (left + w > this.env.grid_W * grid_width) {
				w = this.env.grid_W * grid_width - left;
			}
			if (top + h > this.env.grid_W * grid_width) {
				h = this.env.grid_W * grid_width - top;
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
}
