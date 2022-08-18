import { DQNPlayer, loadDQNPlayers, type SavedPlayerData } from '@balleranalytics/nba-api-ts';
import { readFile } from 'fs/promises';
import { util } from '@tensorflow/tfjs-node';
import { DraftTask } from '../../A2C/Env';
import { Actor_Critic_Agent } from '../../A2C/A2CAgent';
import type { TeamOpts } from '../../DQN/tasks/types';
import { MovingAverager } from '../../utils';
import { fileExists } from '../../A3C_Exp/utils';

const teamOpts: TeamOpts = { pg: 1, sg: 1, sf: 1, pf: 1, f: 1, c: 1, g: 1, util: 3, be: 3 };
const { cwd } = process;

const getData = async () => {
	const rootDir = cwd();
	const exists = await fileExists(rootDir + '/data/rlDraftData.json');
	if (exists) {
		const draftData = await readFile(rootDir + '/data/rlDraftData.json', 'utf8');
		const { data } = JSON.parse(draftData) as { data: SavedPlayerData[] };
		return data
			.map((p) => new DQNPlayer(p, true))
			.filter(
				(p) =>
					p.labels[0] > 500 &&
					!p.inputs.filter((i) => Number.isNaN(i)).length &&
					!p.labels.filter((i) => Number.isNaN(i)).length
			)
			.sort((a, b) => a.labels[0] - b.labels[0]);
	} else {
		const players = (await loadDQNPlayers(2021))
			.filter(
				(p) =>
					p.labels[0] > 500 &&
					!p.inputs.filter((i) => Number.isNaN(i)).length &&
					!p.labels.filter((i) => Number.isNaN(i)).length
			)
			.sort((a, b) => a.labels[0] - b.labels[0]);
		return players;
	}
};

const trainA2C = async () => {
	const moving_avg = new MovingAverager(100);
	let best_self_moving_avg = 0;
	const players = await getData();
	console.log(players.length);
	players.splice(289);
	console.log(players.length);
	util.shuffle(players);
	const actionSqrt = Math.sqrt(players.length);
	const dimensions: [number, number, number] = [actionSqrt, actionSqrt, players[0].inputs.length];
	const draft = new DraftTask({ dimensions, all_actions: players, teamOpts, oppCount: 5 });
	const agent = await Actor_Critic_Agent.build(draft, dimensions);
	while (true) {
		/* TODO: REMOVE?? --> const time_count = 0; */
		while (true) {
			console.log(
				`Episode ${agent.episodes}: ${agent.milestone + 1} / 13}
          --------------------`
			);

			/* simulate picks from competitors prior in round */
			agent.env.simulatePriorPicks(agent.env.pickSlot);

			const state = agent.env.getState().e.flat();
			let ep_loss = 0;

			const action = await agent.getAction(state);
			const [reward, done, nextTaskState] = await agent.step(action);

			agent.reward += reward;

			const next_state = <number[]>nextTaskState?.e.flat();

			const ep_mean_loss = await agent.trainModel(state, action, reward, next_state, done);

			ep_loss += ep_mean_loss;

			if (done || agent.milestone >= 13) {
				moving_avg.append(agent.reward);
				const current_moving_avg = moving_avg.average(0);

				console.log(
					`Finished Episode ${agent.episodes}: ` +
						`Loss: ${ep_loss.toFixed(4)}, ` +
						`Reward: ${agent.reward}, ` +
						`Reward Moving Avg (100 Eps): ${current_moving_avg.toFixed(4)}`
					//`(epsilon=${agent.epsilon.toFixed(3)})\n`
				);

				if (current_moving_avg > best_self_moving_avg) {
					best_self_moving_avg = current_moving_avg;
					await agent.saveLocally();
					console.log(`Saved Actor/Critic`);
				}
				agent.reset();
				break;
			}

			/* simulate picks from competitors later in round */
			agent.env.simulateLaterPicks(agent.env.pickSlot);

			agent.frameCount++;
		}
		agent.episodes += 1;
	}
};

trainA2C();
