import { colors } from './const';
import type { Actor_Critic_Agent } from './AC_Agent';
import { Entity } from './Entity';

export class Env {
	public canvas: HTMLCanvasElement;
	public grid!: Entity[][][];
	public grid_W: number;
	public grid_W_max = 8;
	public grid_width = 30;
	public width!: number;
	public height!: number;
	public globalReward = -0.1;
	public episodes = 0;
	public maxEpisodes = 100;
	public steps = 0;
	public maxSteps = 200;

	public balls_count = 0;
	public boxes_count = 0;
	public marks_count = 0;
	public keys_count = 0;
	public doors_count = 0;

	public agent!: Actor_Critic_Agent;

	public ctx: CanvasRenderingContext2D;
	constructor(w: number, canvas: HTMLCanvasElement) {
		this.grid_W = w;
		this.canvas = canvas;
		this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
	}

	public initGrid(w = 6, h = 6) {
		this.grid = new Array(h);
		for (let y = 0; y < h; y++) {
			this.grid[y] = new Array(w);
			for (let x = 0; x < w; x++) {
				this.grid[y][x] = [];
			}
		}

		this.width = w;
		this.height = h;
		this.grid_W = w;

		this.canvas.style.backgroundColor = 'rgb(0,0,0)';
	}

	public drawOutline() {
		this.ctx.beginPath();
		this.ctx.strokeStyle = 'white';
		for (let i = 0; i <= this.width; i++) {
			this.ctx.moveTo(i * this.grid_width, 0);
			this.ctx.lineTo(i * this.grid_width, this.height * this.grid_width);
		}
		for (let i = 0; i <= this.height; i++) {
			this.ctx.moveTo(0, i * this.grid_width);
			this.ctx.lineTo(this.width * this.grid_width, i * this.grid_width);
		}
		this.ctx.stroke();

		this.ctx.closePath();
	}

	public drawInfo() {
		this.ctx.beginPath();
		this.ctx.fillStyle = 'white';
		this.ctx.font = '14px monospace';

		this.ctx.fillText(
			`step: ${this.steps}/${this.maxSteps}`,
			10,
			this.grid_W * this.grid_width + 20
		);
		this.ctx.fillText(
			`episode: ${this.episodes + 1}/${this.maxEpisodes}`,
			10,
			this.grid_W * this.grid_width + 40
		);
		this.ctx.fillText(
			`reward: ${Math.floor(this.agent.reward * 10) / 10}`,
			10,
			this.grid_W * this.grid_width + 60
		);
		this.ctx.closePath();
	}

	public drawRewardGraph(
		rewards_array: number[],
		indent_x: number,
		indent_y: number,
		total_episode = this.episodes + 1
	) {
		const max = Math.max(...rewards_array);
		let min = Math.min(...rewards_array);
		if (max === min) {
			min = max - Math.abs(max);
		}

		const graph_height = 100;
		const graph_width = 110;
		const graph_indent = 20;
		const graph_w = graph_width / (rewards_array.length - 1); // one data width

		this.ctx.save();
		this.ctx.translate(indent_x, indent_y);

		// axis
		this.ctx.beginPath();
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 2;
		this.ctx.moveTo(graph_indent, graph_indent);
		this.ctx.lineTo(graph_indent, graph_indent + graph_height + 5);
		this.ctx.lineTo(graph_indent + graph_width, graph_indent + graph_height + 5);

		this.ctx.stroke();
		this.ctx.closePath();

		// text
		this.ctx.beginPath();
		this.ctx.font = '12px monospace';
		this.ctx.fillStyle = 'white';
		this.ctx.fillText('Reward', 100, graph_indent); // title
		this.ctx.fillText(max.toString(), 0, graph_indent);
		this.ctx.fillText(min.toString(), 0, graph_indent + graph_height);

		this.ctx.fillText(
			total_episode.toString(),
			graph_indent + graph_width - 10,
			graph_indent + graph_height + 20
		);

		this.ctx.closePath();

		// line graph
		//   rewards
		this.ctx.beginPath();
		this.ctx.strokeStyle = 'yellow';
		this.ctx.lineWidth = 1;
		this.ctx.moveTo(
			graph_indent,
			graph_indent + graph_height - ((rewards_array[0] - min) / (max - min)) * graph_height
		);
		for (let i = 1; i < rewards_array.length; i += 1) {
			this.ctx.lineTo(
				graph_indent + graph_w * i,
				graph_indent + graph_height - ((rewards_array[i] - min) / (max - min)) * graph_height
			);
		}
		this.ctx.stroke();
		this.ctx.closePath();

		this.ctx.restore();
	}

	public setEntityWithWall(agent: Actor_Critic_Agent, info: Record<string, number>) {
		this.agent = agent;

		if (!this.grid) {
			this.initGrid(this.grid_W, this.grid_W);
		}

		for (const key in info) {
			switch (key) {
				case 'ball':
					this.balls_count = info[key];
					break;

				case 'door':
					this.doors_count = info[key];
					break;

				case 'key':
					this.keys_count = info[key];
					break;
			}
		}

		// walls
		const horizontal = Math.random() < 0.5 ? true : false;
		let wall_index;
		let door_index;
		const key_list: string[] = [];
		const ball_list: string[] = [];
		if (horizontal) {
			do {
				wall_index = Math.floor(Math.random() * (this.grid_W - 2)) + 1;
			} while (agent.y === wall_index);
			door_index = Math.floor(Math.random() * this.grid_W);

			for (let i = 0; i < this.grid_W; i += 1) {
				if (i !== door_index) {
					this.grid[wall_index][i].push(new Entity(wall_index, i, 0, 'GREY', 'wall'));
				} else {
					if (info['door']) {
						this.grid[wall_index][i].push(new Entity(wall_index, i, 0, 'PURPLE', 'door'));
					}
				}
			}

			for (let y = 0; y < this.grid_W; y += 1) {
				for (let x = 0; x < this.grid_W; x += 1) {
					if (
						(agent.y < wall_index && y < wall_index) ||
						(agent.y > wall_index && y > wall_index)
					) {
						// key - must be in the same room
						key_list.push(y.toString() + '#' + x.toString());
					} else if (
						(agent.y < wall_index && y > wall_index) ||
						(agent.y > wall_index && y < wall_index)
					) {
						// ball - must be in the other room
						ball_list.push(y.toString() + '#' + x.toString());
					}
				}
			}
		} else {
			do {
				wall_index = Math.floor(Math.random() * (this.grid_W - 2)) + 1;
			} while (agent.x === wall_index);
			door_index = Math.floor(Math.random() * this.grid_W);

			for (let i = 0; i < this.grid_W; i += 1) {
				if (i !== door_index) {
					this.grid[i][wall_index].push(new Entity(i, wall_index, 0, 'GREY', 'wall'));
				} else {
					if (info['door']) {
						this.grid[i][wall_index].push(new Entity(i, wall_index, 1, 'PURPLE', 'door'));
					}
				}
			}

			for (let y = 0; y < this.grid_W; y += 1) {
				for (let x = 0; x < this.grid_W; x += 1) {
					if (
						(agent.x < wall_index && x < wall_index) ||
						(agent.x > wall_index && x > wall_index)
					) {
						// key - must be in the same room
						key_list.push(y.toString() + '#' + x.toString());
					} else if (
						(agent.x < wall_index && x > wall_index) ||
						(agent.x > wall_index && x < wall_index)
					) {
						// ball - must be in the other room
						ball_list.push(y.toString() + '#' + x.toString());
					}
				}
			}
		}

		const population = new Array(this.grid_W * this.grid_W).fill(0).map((c, i) => i);
		const entity_pos_array = this.sample(population, population.length);

		if (info['ball']) {
			for (let i = 0; i < this.balls_count; i++) {
				const pos = entity_pos_array.pop();
				const x = pos % this.grid_W;
				const y = Math.floor(pos / this.grid_W);
				// if (x !== agent.x && y !== agent.y) {
				if (
					this.grid[y][x].length === 0 &&
					(x === agent.x && y === agent.y) === false &&
					ball_list.indexOf(y.toString() + '#' + x.toString()) !== -1
				) {
					if (info['key']) {
						this.grid[y][x].push(new Entity(y, x, 1, 'GREEN', 'ball'));
					} else {
						this.grid[y][x].push(new Entity(y, x, 3, 'GREEN', 'ball'));
					}
				} else {
					i -= 1;
				}
			}
		}

		if (info['key']) {
			for (let i = 0; i < this.keys_count; i++) {
				const pos = entity_pos_array.pop();
				const x = pos % this.grid_W;
				const y = Math.floor(pos / this.grid_W);
				// if (x !== agent.x && y !== agent.y) {
				if (
					this.grid[y][x].length === 0 &&
					(x === agent.x && y === agent.y) === false &&
					key_list.indexOf(y.toString() + '#' + x.toString()) !== -1
				) {
					this.grid[y][x].push(new Entity(y, x, 1, 'PURPLE', 'key'));
				} else {
					i -= 1;
				}
			}
		}
	}

	public setEntity(
		agent: Actor_Critic_Agent,
		info: Record<string, number>,
		init_pos?: [number, number][]
	) {
		this.agent = agent;

		if (!this.grid) {
			this.initGrid(this.grid_W, this.grid_W);
		}

		let entity_pos_array;
		if (!init_pos) {
			// entities
			const population = new Array(this.grid_W * this.grid_W).fill(0).map((c, i) => i);
			entity_pos_array = this.sample(population, population.length);
		} else {
			entity_pos_array = init_pos.map((c) => c[0] + c[1] * this.grid_W);
		}

		let now_ball_count = 0;
		let now_box_count = 0;
		/* TODO: Remove if truly unnecessary */
		// const now_marks_count = 0;
		let total_count = 0;

		for (const key in info) {
			switch (key) {
				case 'ball':
					this.balls_count = info[key];
					total_count += this.balls_count;
					break;

				case 'box':
					this.boxes_count = info[key];
					total_count += this.boxes_count;
					break;

				case 'mark':
					this.marks_count = info[key];
					total_count += this.marks_count;
					break;
			}
		}

		while (total_count > 0) {
			const pos = entity_pos_array.shift();
			const x = pos % this.grid_W;
			const y = Math.floor(pos / this.grid_W);
			if (isNaN(pos) || isNaN(x) || isNaN(y)) {
				console.log('NaN Error', pos, x, y);
				return null;
			}

			if (x !== agent.x && y !== agent.y) {
				if (now_ball_count < this.balls_count) {
					this.grid[y][x].push(new Entity(y, x, 1, 'LIGHTBLUE', 'ball'));
					now_ball_count += 1;
					total_count -= 1;
				} else if (now_box_count < this.boxes_count) {
					this.grid[y][x].push(new Entity(y, x, -1, 'YELLOW', 'box'));
					now_box_count += 1;
					total_count -= 1;
				}
			}
		}
	}

	public draw() {
		// this.canvas.width = this.canvas.width;
		this.drawOutline();
		this.drawInfo();

		let entity;

		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				for (let i = 0; i < this.grid[y][x].length; i += 1) {
					entity = this.grid[y][x][i];
					this.ctx.beginPath();
					this.ctx.fillStyle = colors[entity.color];

					switch (entity.type) {
						case 'goal':
							this.ctx.fillRect(
								x * this.grid_width,
								y * this.grid_width,
								this.grid_width,
								this.grid_width
							);
							break;

						case 'box':
							this.ctx.fillRect(
								(x + 0.2) * this.grid_width,
								(y + 0.2) * this.grid_width,
								this.grid_width * 0.6,
								this.grid_width * 0.6
							);
							break;

						case 'ball':
							this.ctx.arc(
								(x + 0.5) * this.grid_width,
								(y + 0.5) * this.grid_width,
								this.grid_width / 3,
								0,
								Math.PI * 2
							);
							this.ctx.fill();
							break;

						case 'mark':
							this.ctx.strokeStyle = colors[entity.color];
							this.ctx.lineWidth = 3;
							this.ctx.moveTo(
								x * this.grid_width + this.grid_width * 0.1,
								y * this.grid_width + this.grid_width * 0.1
							);
							this.ctx.lineTo(
								x * this.grid_width + this.grid_width * 0.9,
								y * this.grid_width + this.grid_width * 0.9
							);
							this.ctx.moveTo(
								x * this.grid_width + this.grid_width * 0.9,
								y * this.grid_width + this.grid_width * 0.1
							);
							this.ctx.lineTo(
								x * this.grid_width + this.grid_width * 0.1,
								y * this.grid_width + this.grid_width * 0.9
							);
							this.ctx.stroke();
							break;

						case 'wall':
							this.ctx.fillRect(
								x * this.grid_width,
								y * this.grid_width,
								this.grid_width,
								this.grid_width
							);
							break;

						case 'door':
							this.ctx.strokeStyle = colors[entity.color];
							this.ctx.lineWidth = 2;
							this.ctx.rect(
								(x + 0.1) * this.grid_width,
								(y + 0.1) * this.grid_width,
								this.grid_width * 0.8,
								this.grid_width * 0.8
							);

							this.ctx.moveTo(
								x * this.grid_width + this.grid_width * 0.66,
								y * this.grid_width + this.grid_width * 0.38
							);
							this.ctx.arc(
								x * this.grid_width + this.grid_width * 0.5,
								y * this.grid_width + this.grid_width * 0.38,
								this.grid_width * 0.16,
								Math.PI,
								0
							);
							this.ctx.rect(
								x * this.grid_width + this.grid_width * 0.25,
								y * this.grid_width + this.grid_width * 0.38,
								this.grid_width * 0.5,
								this.grid_width * 0.42
							);

							this.ctx.moveTo(
								x * this.grid_width + this.grid_width * 0.58,
								y * this.grid_width + this.grid_width * 0.55
							);
							this.ctx.arc(
								x * this.grid_width + this.grid_width * 0.5,
								y * this.grid_width + this.grid_width * 0.55,
								this.grid_width * 0.08,
								0,
								Math.PI * 2
							);
							this.ctx.moveTo(
								x * this.grid_width + this.grid_width * 0.5,
								y * this.grid_width + this.grid_width * 0.63
							);
							this.ctx.lineTo(
								x * this.grid_width + this.grid_width * 0.5,
								y * this.grid_width + this.grid_width * 0.8
							);

							this.ctx.stroke();
							break;

						case 'key':
							this.ctx.strokeStyle = colors[entity.color];
							this.ctx.lineWidth = 3;
							this.ctx.arc(
								x * this.grid_width + this.grid_width * 0.5,
								y * this.grid_width + this.grid_width * 0.25,
								this.grid_width * 0.18,
								0,
								Math.PI * 2
							);
							this.ctx.moveTo(
								x * this.grid_width + this.grid_width * 0.5,
								y * this.grid_width + this.grid_width * 0.45
							);
							this.ctx.lineTo(
								x * this.grid_width + this.grid_width * 0.5,
								y * this.grid_width + this.grid_width * 0.85
							);
							this.ctx.lineTo(
								x * this.grid_width + this.grid_width * 0.75,
								y * this.grid_width + this.grid_width * 0.85
							);
							this.ctx.moveTo(
								x * this.grid_width + this.grid_width * 0.5,
								y * this.grid_width + this.grid_width * 0.6
							);
							this.ctx.lineTo(
								x * this.grid_width + this.grid_width * 0.7,
								y * this.grid_width + this.grid_width * 0.6
							);
							this.ctx.stroke();
							break;
					}
					this.ctx.closePath();
				}
			}
		}
		this.ctx.lineWidth = 1;
	}

	// from https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array/45556840#45556840
	public sample(population: Array<unknown>, k: number) {
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
				const j = (Math.random() * (n - i)) | 0;
				result[i] = pool[j];
				pool[j] = pool[n - i - 1]; // move non-selected item into vacancy
			}
		} else {
			const selected = new Set();
			for (let i = 0; i < k; i++) {
				let j = (Math.random() * (n - i)) | 0;
				while (selected.has(j)) {
					j = (Math.random() * (n - i)) | 0;
				}
				selected.add(j);
				result[i] = population[j];
			}
		}

		return result;
	}

	public reset() {
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				for (let i = 0; i < this.grid[y][x].length; i += 1) {
					this.grid[y][x].pop();
				}
			}
		}
	}
}
