<script lang="ts">
	import { Actor_Critic_Agent, Env, seededRandom } from '@balleranalytics/tf-neat';

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
		btn2Title = 'Run (A2C)';

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
		// iterate(true);
	}

	function toggleRun() {
		if (isRunning) {
			isRunning = false;
			btn2Title = 'Run (A2C)';
		} else {
			isRunning = true;
			env.maxEpisodes += 1;

			agent.x = Math.floor(Math.random() * env.grid_W);
			agent.y = Math.floor(Math.random() * env.grid_W);
			agent.reward = 0;
			agent.dir = 3;
			agent.key = false;

			// env.episodes += 1;
			env.steps = 0;
			env.reset();

			agent.ballCount = 1;
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (env.setEntityWithWall(agent, { ball: 1 }) !== null) {
					break;
				}
			}

			// run();

			btn2Title = 'Pause';
		}
	}
	/*
function getAction(agent, input) { // if (Math.random() < epsilon) { // return Math.floor(Math.random() * 4); // } return tf.tidy(() => { let inputTensor = tf.tensor4d(input, [1, 7, 7, 1]); const logits = agent.actor.predict(inputTensor); const actions = tf.multinomial(logits, 1, null, true); return actions.dataSync()[0]; }); }



function getVision(agent) { let top, left; left = agent.x - agent.visionForward; top = agent.y - agent.visionForward; let s = [];

for (let y = top; y < top + agent.visionForward * 2 + 1; y += 1) {
    for (let x = left; x < left + agent.visionForward * 2 + 1; x += 1) {
        if (x >= 0 && x < env.width &&
            y >= 0 && y < env.height) {
            if (env.grid[y][x].length > 0) {
                s.push(object_to_idx[env.grid[y][x][0].type]);
            }
            else {
                s.push(object_to_idx['empty']);
            }
        }
        else {
            s.push(object_to_idx['unseen']);
        }
    }
}

return s;
}



function run(is_loop = true) { const state = getVision(agent); const action = getAction(agent, state); let reward, done; [reward, done] = agent.step(action); agent.reward += reward; agent.reward = parseFloat((agent.reward).toFixed(2));

ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

env.steps += 1;
env.draw();
agent.draw();

if (done || env.steps >= env.maxSteps) {
    rewards_array.push(Math.floor(agent.reward * 10) / 10);
    if (rewards_array.length > 1) {
        ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
        env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

        ctx.beginPath();
        ctx.fillStyle = 'lightcyan';
        ctx.font = '11px monospace';
        ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = 'limegreen';
        ctx.font = '14px monospace';
        let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
        ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
        ctx.closePath();
    }
}
if (is_loop && env.episodes < env.maxEpisodes) {
    window.requestAnimationFrame(iterate);
}
}
*/
	$: if (canvas) initDemo();
</script>

<div class="flex flex-col flex-grow w-fit mx-auto">
	<div class="inline-flex w-full justify-end items-center">
		<button class="btn btn-primary" onclick={learnA2C}>Learn (A2C)</button>
		<button class="btn btn-primary" onclick={toggleRun}>{btn2Title}</button>
	</div>
	<canvas bind:this={canvas} width={410} height={310} />
</div>
