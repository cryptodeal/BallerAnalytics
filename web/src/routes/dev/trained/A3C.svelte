<script lang="ts">
	import {
		tidy,
		tensor4d,
		multinomial,
		loadLayersModel,
		type Tensor1D,
		type Sequential,
		type Tensor,
		type Rank
	} from '@tensorflow/tfjs';
	import { Actor_Critic_Agent, Env, object_to_idx } from '@balleranalytics/tf-neat';
	import { onMount } from 'svelte';

	const dirs = [
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1]
		],
		prob_arrow_string = ['→', '↓', '←', '↑'];

	let env: Env,
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		title: string,
		agent: Actor_Critic_Agent,
		isRunning = false,
		rewardsArr: number[] = [],
		isRunnable = true,
		btnTitle = 'Run(Actor-Critic)';

	async function initDemo() {
		ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
		env = new Env(8, canvas);
		env.maxEpisodes = 2000;
		ctx.beginPath();
		ctx.fillStyle = 'lightcyan';
		ctx.font = '11px monospace';
		title = 'A3C (2 agents; 100k eps)';
		ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
		ctx.closePath();
		agent = new Actor_Critic_Agent(
			env,
			Math.floor(Math.random() * 8),
			Math.floor(Math.random() * 8),
			canvas
		);
		agent.actor = <Sequential>await loadLayersModel('/global-model-actor/model.json');
		console.log('actor model is loaded.');

		agent.critic = await loadLayersModel('/global-model-critic/model.json');
		console.log('critic model is loaded.');
		isRunnable = false;
		agent.ballCount = 3;
		agent.vision = true;
		env.setEntity(agent, { ball: 3 });
		env.draw();
		agent.draw();
	}

	function runA3C() {
		if (isRunning) {
			// PAUSE
			isRunning = false;
			btnTitle = 'Run(Actor-Critic)';
		} else {
			isRunning = true;

			agent.x = Math.floor(Math.random() * 8);
			agent.y = Math.floor(Math.random() * 8);
			agent.reward = 0;
			agent.dir = 3;

			// env.episodes += 1;
			env.steps = 0;
			env.reset();

			agent.ballCount = 3;
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (env.setEntity(agent, { ball: 3 }) !== null) {
					break;
				}
			}

			run();

			btnTitle = 'PAUSE';
		}
	}

	function getAction(agent: Actor_Critic_Agent, input: number[]) {
		/*
    if (seededRandom() < epsilon) {
			return Math.floor(seededRandom() * 4);
		}
    */

		return tidy(() => {
			let inputTensor = tensor4d(input, [1, 7, 7, 1]);
			const logits = agent.actor.predict(inputTensor);
			const actions = multinomial(logits as Tensor1D, 1, undefined, true);
			return actions.dataSync()[0];
		});
	}

	function getVision(agent: Actor_Critic_Agent) {
		let top = agent.y - agent.visionForward,
			left = agent.x - agent.visionForward;
		const s: number[] = [];

		for (let y = top; y < top + agent.visionForward * 2 + 1; y += 1) {
			for (let x = left; x < left + agent.visionForward * 2 + 1; x += 1) {
				if (x >= 0 && x < agent.env.width && y >= 0 && y < agent.env.height) {
					if (agent.env.grid[y][x].length > 0) {
						s.push(object_to_idx[agent.env.grid[y][x][0].type]);
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
	function run(is_loop = true) {
		const state = getVision(agent);
		const action = getAction(agent, state);
		const [reward, done] = agent.step(action);
		agent.reward += reward;
		agent.reward = parseFloat(agent.reward.toFixed(2));

		ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

		env.steps += 1;
		env.draw();
		agent.draw();

		if (done || env.steps >= env.maxSteps) {
			rewardsArr.push(Math.floor(agent.reward * 10) / 10);
			if (rewardsArr.length > 1) {
				ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
				env.drawRewardGraph(rewardsArr.slice(rewardsArr.length - 100), 255, 70);

				ctx.beginPath();
				ctx.fillStyle = 'lightcyan';
				ctx.font = '11px monospace';
				ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
				ctx.closePath();

				ctx.beginPath();
				ctx.fillStyle = 'limegreen';
				ctx.font = '14px monospace';
				let avg = rewardsArr.reduce((acc, cur) => acc + cur, 0) / rewardsArr.length;
				ctx.fillText(
					`avg. reward: ${Math.floor(avg * 10) / 10}`,
					env.grid_W * env.grid_width + 20,
					env.grid_W * env.grid_width + 60
				);
				ctx.closePath();
			}
		}
		if (is_loop && env.episodes < env.maxEpisodes) {
			window.requestAnimationFrame(iterate);
		}
	}

	async function iterate(isLoop?: number) {
		const state = getVision(agent);
		const action = getAction(agent, state);
		const [reward, done] = agent.step(action);
		agent.reward += reward;
		agent.reward = parseFloat(agent.reward.toFixed(2));
		const next_state = getVision(agent);

		let logits = tidy(() => {
			const inputTensor = tensor4d(next_state, [1, 7, 7, 1]);
			const logits_tensor = <Tensor<Rank>>agent.actor.predict(inputTensor);
			return logits_tensor.dataSync();
		});

		ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

		env.steps += 1;
		env.draw();
		agent.draw();

		// draw action
		// console.log(logits);
		let prob_string = '';
		for (let i = 0; i < logits.length; i += 1) {
			// arrow
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.strokeStyle = 'rgb(0,255,0)';
			ctx.moveTo((agent.x + 0.5) * env.grid_width, (agent.y + 0.5) * env.grid_width);
			ctx.lineTo(
				(agent.x + 0.5) * env.grid_width + logits[i] * dirs[i][0] * env.grid_width * 0.8,
				(agent.y + 0.5) * env.grid_width + logits[i] * dirs[i][1] * env.grid_width * 0.8
			);
			ctx.stroke();
			ctx.closePath();

			prob_string += prob_arrow_string[i] + `${Math.floor(logits[i] * 1000) / 10}%` + ' ';
		}

		// prob text
		ctx.beginPath();
		ctx.fillStyle = 'rgb(0,255,255)';
		ctx.fillText(prob_string, 10, env.grid_W * env.grid_width + 80);
		ctx.closePath();

		ctx.lineWidth = 1;

		if (done || env.steps >= env.maxSteps) {
			rewardsArr.push(Math.floor(agent.reward * 10) / 10);
			if (rewardsArr.length > 1) {
				ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
				env.drawRewardGraph(rewardsArr.slice(rewardsArr.length - 100), 255, 70);

				ctx.beginPath();
				ctx.fillStyle = 'lightcyan';
				ctx.font = '11px monospace';
				ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
				ctx.closePath();

				ctx.beginPath();
				ctx.fillStyle = 'limegreen';
				ctx.font = '14px monospace';
				let avg = rewardsArr.reduce((acc, cur) => acc + cur, 0) / rewardsArr.length;
				ctx.fillText(
					`avg. reward: ${Math.floor(avg * 10) / 10}`,
					env.grid_W * env.grid_width + 20,
					env.grid_W * env.grid_width + 60
				);
				ctx.closePath();
			}

			agent.x = Math.floor(Math.random() * 8);
			agent.y = Math.floor(Math.random() * 8);
			agent.reward = 0;
			agent.dir = 3;

			env.episodes += 1;
			env.steps = 0;
			env.reset();

			agent.ballCount = 3;
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (env.setEntity(agent, { ball: 3 }) !== null) {
					break;
				}
			}
		}
		if (isRunning && isLoop && env.episodes < env.maxEpisodes) {
			window.requestAnimationFrame(iterate);
		} else {
			isRunnable = false;
			isRunning = false;
		}
	}

	onMount(async () => {
		await initDemo();
	});
</script>

<div
	class="mt-10 w-full flex flex-wrap gap-10 items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
>
	<div class="flex gap-4 w-full flex-col">
		<h3 class="text-center">Trained Asynchronous Advantage Actor Critic (A3C)</h3>

		<div class="flex flex-col flex-grow gap-2 mx-auto">
			<div class="inline-flex gap-4 justify-center items-center">
				<button class="btn btn-primary" disabled={isRunnable} on:click={runA3C}>
					{btnTitle}
				</button>
			</div>
			<canvas bind:this={canvas} width={410} height={330} />
		</div>
	</div>
</div>
