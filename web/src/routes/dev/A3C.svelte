<script lang="ts">
	import { tidy, tensor4d, multinomial, type Tensor1D } from '@tensorflow/tfjs';
	import {
		Actor_Critic_Agent,
		Env,
		seededRandom,
		object_to_idx,
		A3CAgent_Worker
	} from '@balleranalytics/tf-neat';
	import { onMount } from 'svelte';

	let global_step: number,
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		total_episode_max: number,
		total_episode: number,
		tempEnv: Env,
		agentCount: number,
		sharedAgent: Actor_Critic_Agent,
		title: string,
		agents: A3CAgent_Worker[],
		ball_get_count: number,
		isRunning = false,
		rewardsArr: number[] = [],
		epsilon = 0.3,
		epsilonMin = 0.0,
		epsilonMultiply = 0.99,
		learnDisabled = false;

	/* inits demo render onMount */
	function initDemo() {
		global_step = 0;
		ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
		title = 'A3C (4 Agents)';
		ctx.beginPath();
		ctx.fillStyle = 'lightcyan';
		ctx.font = '11px monospace';
		ctx.fillText(title, 580, 10);
		ctx.closePath();
		total_episode_max = 2000;
		total_episode = 0;
		agents = [];
		agentCount = 4;
		tempEnv = new Env(8, canvas);
		sharedAgent = new Actor_Critic_Agent(tempEnv, 0, 0, canvas);
		for (let i = 0; i < agentCount; i++) {
			const env = new Env(8, canvas);
			env.maxEpisodes = 1000;
			env.grid_width = 30;
			const agent = new A3CAgent_Worker(
				env,
				Math.floor(Math.random() * 8),
				Math.floor(Math.random() * 8),
				canvas,
				sharedAgent
			);
			agent.ballCount = 3;
			agent.vision = true;
			env.setEntity(agent, { ball: 3 });
			agents.push(agent);
			const tx = (i % 2) * (env.grid_W * env.grid_width + 80);
			const ty = Math.floor(i / 2) * (env.grid_W * env.grid_width + 70);
			ctx.translate(tx, ty);
			env.draw();
			agent.draw();
			ctx.translate(-tx, -ty);
		}
	}

	function learnA2C() {
		if (isRunning) return;
		isRunning = true;
		iterate(1);
	}

	function getAction(agent: A3CAgent_Worker, input: number[]) {
		if (seededRandom() < epsilon) {
			return Math.floor(seededRandom() * 4);
		}

		return tidy(() => {
			let inputTensor = tensor4d(input, [1, 7, 7, 1]);
			const logits = agent.actor.predict(inputTensor);
			const actions = multinomial(logits as Tensor1D, 1, undefined, true);
			return actions.dataSync()[0];
		});
	}

	function getVision(agent: A3CAgent_Worker) {
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

	async function iterate(isLoop?: number) {
		for (let i = 0; i < agentCount; i++) {
			const agent = agents[i];
			const state = getVision(agent);
			const action = getAction(agent, state);
			const [reward, done] = agent.step(action);
			agent.reward += reward;
			agent.reward = parseFloat(agent.reward.toFixed(2));
			const next_state = getVision(agent);
			await agent.trainModel(state, action, reward, next_state, done);

			agent.env.steps += 1;
			let tx = (i % 2) * (agent.env.grid_W * agent.env.grid_width + 80);
			let ty = Math.floor(i / 2) * (agent.env.grid_W * agent.env.grid_width + 70);
			ctx.clearRect((i % 2) * 290, ty, 290, agent.env.grid_W * agent.env.grid_width + 68);
			ctx.translate(tx, ty);
			agent.env.draw();
			agent.draw();
			ctx.translate(-tx, -ty);

			if (done || agent.env.steps >= agent.env.maxSteps) {
				rewardsArr.push(Math.floor(agent.reward * 10) / 10);

				agent.x = Math.floor(Math.random() * 8);
				agent.y = Math.floor(Math.random() * 8);
				agent.reward = 0;
				agent.dir = 3;

				agent.env.episodes += 1;
				agent.env.steps = 0;
				agent.env.reset();
				total_episode += 1;

				// epsilon_decay
				if (i === 0 && epsilon > epsilonMin) {
					epsilon = epsilon * epsilonMultiply;
					epsilon = Math.floor(epsilon * 10000) / 10000;
				}

				agent.ballCount = 3;
				// eslint-disable-next-line no-constant-condition
				while (true) {
					if (agent.env.setEntity(agent, { ball: 3 }) !== null) {
						break;
					}
				}

				await agent.updateFromSharedAgent();
			}
		}

		if (rewardsArr.length > 1) {
			ctx.clearRect(580, 0, 140, canvas.height);
			agents[0].env.drawRewardGraph(
				rewardsArr.slice(rewardsArr.length - 100),
				580,
				70,
				total_episode
			);

			ctx.beginPath();
			ctx.fillStyle = 'lightcyan';
			ctx.font = '11px monospace';
			ctx.fillText(title, 580, 10);
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = 'white';
			ctx.font = '14px monospace';
			ctx.fillText(
				`epsilon: ${epsilon}`,
				580,
				agents[0].env.grid_W * agents[0].env.grid_width + 40
			);
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = 'limegreen';
			ctx.font = '14px monospace';
			let avg = rewardsArr.reduce((acc, cur) => acc + cur, 0) / rewardsArr.length;
			ctx.fillText(
				`avg. reward: ${Math.floor(avg * 10) / 10}`,
				580,
				agents[0].env.grid_W * agents[0].env.grid_width + 60
			);
			ctx.closePath();
		}

		if (isRunning && isLoop && total_episode < total_episode_max) {
			window.requestAnimationFrame(iterate);
		} else {
			// button.disabled = true;
			// button2.disabled = false;
			isRunning = false;
		}
	}

	onMount(initDemo);
</script>

<div
	class="mt-10 w-full flex flex-wrap gap-10 items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
>
	<div class="flex gap-4 w-full flex-col">
		<h3 class="text-center">Asynchronous Advantage Actor Critic (A3C)</h3>

		<div class="flex flex-col flex-grow gap-2 mx-auto">
			<div class="inline-flex gap-4 justify-center items-center">
				<button class="btn btn-primary" disabled={learnDisabled} on:click={learnA2C}>
					Learn (A3C)
				</button>
			</div>
			<canvas bind:this={canvas} width={720} height={620} />
		</div>
	</div>
</div>
