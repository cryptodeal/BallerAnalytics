import { loadDQNPlayers } from '@balleranalytics/nba-api-ts';
import { util } from '@tensorflow/tfjs-node';
import { DraftTask } from '../../DQN/tasks';
import { Actor_Critic_Agent } from '../A2CAgent';
import type { TeamOpts } from '../../DQN/tasks/types';
import { train } from '../../DQN';

const teamOpts: TeamOpts = { pg: 1, sg: 1, sf: 1, pf: 1, f: 1, c: 1, g: 1, util: 3, be: 3 };

const trainDQN = async () => {
	const players = (await loadDQNPlayers(2021))
		.filter(
			(p) =>
				p.labels[0] > 500 &&
				!p.inputs.filter((i) => Number.isNaN(i)).length &&
				!p.labels.filter((i) => Number.isNaN(i)).length
		)
		.sort((a, b) => a.labels[0] - b.labels[0]);
	players.splice(250);
	util.shuffle(players);
	const actionCount = players.length;
	const dimensions: [number, number, number] = [actionCount, players[0].inputs.length, 1];
	const draft = new DraftTask({ dimensions, all_actions: players, teamOpts, oppCount: 1 });
	const agent = new Actor_Critic_Agent(draft, dimensions);
	for (let i = 0; i < 1000; i++) {
		/* TODO: REMOVE?? --> const time_count = 0; */
		const state = agent.env.getState().e.flat();

		while (true) {
			const ep_loss = 0;
			// TODO: REWRITE BELOW
			console.log(
				`Episode ${agent.epsiodes}: ${agent.milestone + 1} / 13}
        --------------------`
			);

			const action = agent.getAction(state);
			const [reward, done, nextTaskState] = agent.step(action);
			agent.reward += reward;

			const next_state = nextTaskState?.e.flat() as number[];

			/*
      			const ep_mean_loss = await agent.trainModel(state, action, reward, next_state, done);

      ep_loss += ep_mean_loss;

			if (done || this.agent.env.steps >= this.agent.env.maxSteps) {
				this.moving_avg.append(this.agent.reward);

				const current_moving_avg = this.moving_avg.average();
				if (current_moving_avg > this.best_self_moving_avg) {
					this.best_self_moving_avg = current_moving_avg;
				}

				const global_epi = await getGlobalEpisode(this.id);
				const old_glob_moving_avg = await getGlobalMovingAverage(this.id);

				const glob_moving_avg = await this.record(
					global_epi,
					this.agent.reward,
					old_glob_moving_avg,
					this.ep_loss,
					this.agent.env.steps
				);
				const [global_best_score, best_all_worker_moving_avg] = await Promise.all([
					getBestScore(this.id),
					getBestWorkerMovingAvg(this.id),
					setGlobalMovingAverage(this.id, glob_moving_avg)
				]);
				const stdout = `Episode loss: ${this.ep_loss}
Episode reward: ${this.agent.reward}
Global best score: ${global_best_score}
Current moving average (${this.moving_avg.size()} eps): ${current_moving_avg}
Best worker moving avg: ${best_all_worker_moving_avg}`;
				console.log(stdout);
				if (
					current_moving_avg >
					best_all_worker_moving_avg 
				) {
					console.log(
						'************************ UPDATING THE GLOBAL MODEL ************************'
					);
					await Promise.all([
						sendModel(this.id, this.agent.getWeights(), false),
						setBestScore(this.id, this.agent.reward),
						setBestWorkerMovingAvg(this.id, current_moving_avg)
					]);
				}
			

				await incrementGlobalEpisode(this.id);
				this.agent.x = Math.floor(seededRandom() * 8);
				this.agent.y = Math.floor(seededRandom() * 8);
				this.agent.reward = 0;
				this.agent.dir = 3;
				console.log('----------------- END OF STEP TRAINING DATA -----------------');

				this.agent.env.episodes += 1;
				this.agent.env.steps = 0;
				this.agent.env.reset();
			

				agent.ballCount = 3;
				while (true) {
					if (agent.env.setEntity(agent, { ball: 3 }) !== null) {
						break;
					}
				}
				break;
			}
			state = next_state;
      */
			/* TODO: REMOVE?? --> time_count++; */
		}
	}
};

trainDQN();
