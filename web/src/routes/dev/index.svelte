<script lang="ts">
	import { tidy, tensor4d, multinomial, type Tensor1D } from '@tensorflow/tfjs';
	import { Actor_Critic_Agent, Env, seededRandom, object_to_idx } from '@balleranalytics/tf-neat';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		env: Env,
		title: string,
		agent: Actor_Critic_Agent,
		ball_get_count: number,
		isRunning = false,
		rewardsArr: number[] = [],
		epsilon = 1.0,
		epsilonMin = 0.01,
		epsilonMultiply = 0.9999,
		btn2Title = 'Run (A2C)',
		learnDisabled = false,
		runDisabled = true,
		bhvPolicy = false;

	function initDemo() {
		ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
		env = new Env(8, canvas);
		env.maxEpisodes = 2000;
		title = 'A2C';
		ctx.beginPath();
		ctx.fillStyle = 'lightcyan';
		ctx.font = '11px monospace';
		ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
		ctx.closePath();
		agent = new Actor_Critic_Agent(
			env,
			Math.floor(seededRandom() * env.grid_W),
			Math.floor(seededRandom() * env.grid_W),
			canvas
		);
		agent.ballCount = 1;
		agent.vision = true;
		env.setEntityWithWall(agent, { ball: 1 });
		env.draw();
		agent.draw();
		ball_get_count = 0;
	}
	function learnA2C() {
		if (isRunning) return;
		isRunning = true;
		iterate(1);
	}

	function toggleRun() {
		if (isRunning) {
			isRunning = false;
			btn2Title = 'Run (A2C)';
		} else {
			isRunning = true;
			env.maxEpisodes += 1;

			agent.x = Math.floor(seededRandom() * env.grid_W);
			agent.y = Math.floor(seededRandom() * env.grid_W);
			agent.reward = 0;
			agent.dir = 3;
			agent.key = false;

			env.episodes += 1;
			env.steps = 0;
			env.reset();

			agent.ballCount = 1;
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (env.setEntityWithWall(agent, { ball: 1 }) !== null) {
					break;
				}
			}
			run();
			btn2Title = 'Pause';
		}
	}

	function getAction(agent: Actor_Critic_Agent, input: number[], bhvPolicy = false) {
		if (bhvPolicy && seededRandom() < epsilon) {
			return Math.floor(seededRandom() * 4);
		}

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
				if (x >= 0 && x < env.width && y >= 0 && y < env.height) {
					if (env.grid[y][x].length > 0) {
						s.push(object_to_idx[env.grid[y][x][0].type]);
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

	function run(isLoop = true) {
		const state = getVision(agent);
		const action = getAction(agent, state, bhvPolicy);
		let [reward, done] = agent.step(action);
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
		if (isLoop && env.episodes < env.maxEpisodes) {
			window.requestAnimationFrame(iterate);
		}
	}

	async function iterate(isLoop?: number) {
		const state = getVision(agent);
		const action = getAction(agent, state, bhvPolicy);
		const [reward, done] = agent.step(action);
		agent.reward += reward;
		agent.reward = parseFloat(agent.reward.toFixed(2));
		const next_state = getVision(agent);
		await agent.trainModel(state, action, reward, next_state, done);

		// epsilon_decay
		if (epsilon > epsilonMin) {
			epsilon = epsilon * epsilonMultiply;
			epsilon = Math.floor(epsilon * 10000) / 10000;
		}

		ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

		env.steps += 1;
		env.draw();
		agent.draw();

		if (done || env.steps >= env.maxSteps) {
			env.episodes += 1;
			rewardsArr.push(Math.floor(agent.reward * 10) / 10);
			if (rewardsArr.length > 1) {
				ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
				env.drawRewardGraph(rewardsArr.slice(rewardsArr.length - 100), 255, 70);

				ctx.beginPath();
				ctx.fillStyle = 'lightcyan';
				ctx.font = '11px monospace';
				ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
				ctx.closePath();

				if (agent.ballCount === 0) {
					ball_get_count += 1;
				}

				ctx.beginPath();
				ctx.fillStyle = '#00ff00';
				ctx.font = '14px monospace';
				ctx.fillText(
					`ball: ${ball_get_count}/${env.episodes} (${
						Math.floor((ball_get_count / env.episodes) * 1000) / 10
					}%)`,
					env.grid_W * env.grid_width + 20,
					env.grid_W * env.grid_width + 20
				);
				ctx.closePath();

				ctx.beginPath();
				ctx.fillStyle = 'white';
				ctx.font = '14px monospace';
				ctx.fillText(
					`epsilon: ${epsilon}`,
					env.grid_W * env.grid_width + 20,
					env.grid_W * env.grid_width + 40
				);
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

			agent.x = Math.floor(seededRandom() * env.grid_W);
			agent.y = Math.floor(seededRandom() * env.grid_W);
			agent.reward = 0;
			agent.dir = 3;
			agent.key = false;

			env.steps = 0;
			env.reset();

			agent.ballCount = 1;
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (env.setEntityWithWall(agent, { ball: 1 }) !== null) {
					break;
				}
			}
		}
		if (isRunning && isLoop && env.episodes < env.maxEpisodes) {
			window.requestAnimationFrame(iterate);
		} else {
			learnDisabled = true;
			runDisabled = false;
			isRunning = false;
		}
	}

	onMount(initDemo);
</script>

<div
	class="mt-10 w-full flex flex-wrap gap-10 items-center mx-auto p-4 rounded-lg min-h-100 glassmorphicBg md:(w-3/4 p-4) 2xl:w-1/2"
>
	<div class="flex gap-4 w-full flex-col">
		<h3 class="text-center">Advantage Actor Critic (A2C)</h3>
		<div class="flex w-full flex-col gap-4 mb-10 items-center">
			<h4 class="text-center">Controls:</h4>
			<div class="flex justify-center mx-auto">
				<div class="form-control">
					<label for="enabled" class="label items-center gap-4">
						<span class="label-text text-xl">Behavior Policy:</span>
					</label>
					<div class="flex justify-start items-center">
						<input
							id="enabled"
							name="enabled"
							type="checkbox"
							bind:checked={bhvPolicy}
							class="checkbox checkbox-primary"
						/>
					</div>
					<label for="dropoff" class="label">
						<span class="label-text-alt text-xs"
							>Enable/Disable use of Behavior Policy (Random Exploration)</span
						>
					</label>
				</div>
			</div>
		</div>

		<div class="flex flex-col flex-grow gap-2 w-fit mx-auto">
			<div class="inline-flex gap-4 w-full justify-center items-center">
				<button class="btn btn-primary" disabled={learnDisabled} on:click={learnA2C}>
					Learn (A2C)
				</button>
				<button class="btn btn-primary" disabled={runDisabled} on:click={toggleRun}>
					{btn2Title}
				</button>
			</div>
			<canvas bind:this={canvas} width={410} height={310} />
		</div>
	</div>
</div>
