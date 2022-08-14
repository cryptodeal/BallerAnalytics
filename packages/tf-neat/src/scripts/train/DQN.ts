import { loadDQNPlayers } from '@balleranalytics/nba-api-ts';
import { loadLayersModel, util } from '@tensorflow/tfjs-node';
import { DraftTask } from '../../DQN/tasks';
import { Agent } from '../../DQN/Agent';
import type { TeamOpts } from '../../DQN/tasks/types';
import { train } from '../../DQN';

const teamOpts: TeamOpts = { pg: 1, sg: 1, sf: 1, pf: 1, f: 1, c: 1, g: 1, util: 3, be: 3 };

const trainDQN = async () => {
	const path = `${process.cwd()}/data/models/DQN/model.json`;
	const cachedOnlineNet = await loadLayersModel('file://' + path);
	const players = (await loadDQNPlayers(2021))
		.filter(
			(p) =>
				p.labels[0] > 500 &&
				!p.inputs.filter((i) => Number.isNaN(i)).length &&
				!p.labels.filter((i) => Number.isNaN(i)).length
		)
		.sort((a, b) => a.labels[0] - b.labels[0]);
	players.splice(249);
	util.shuffle(players);
	const actionCount = players.length;
	const dimensions: [number, number, number] = [actionCount, 1, players[0].inputs.length];
	const draft = new DraftTask({ dimensions, all_actions: players, teamOpts, oppCount: 1 });
	const agent = new Agent(draft, {
		replayBufferSize: 1e4,
		epsilonInit: 0.75,
		learningRate: 1e-7,
		epsilonFinal: 0.01,
		epsilonDecayFrames: 1e5,
		cachedOnlineNet
	});

	await train(agent, 64, 0.99, 1e3, 150, 1e6, 5e3, `${process.cwd()}/data/models/DQN`, null);
};

trainDQN();
