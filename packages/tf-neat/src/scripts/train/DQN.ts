import { loadDQNPlayers } from '@balleranalytics/nba-api-ts';
import { loadLayersModel } from '@tensorflow/tfjs-node';
import { DraftTask } from '../../DQN/tasks';
import { Agent } from '../../DQN/Agent';
import type { TeamOpts } from '../../DQN/tasks/types';
import { train } from '../../DQN';

const teamOpts: TeamOpts = { pg: 1, sg: 1, sf: 1, pf: 1, f: 1, c: 1, g: 1, util: 3, be: 3 };

const trainDQN = async () => {
	const path = `${process.cwd()}/data/models/DQN/model.json`;
	const cachedOnlineNet = await loadLayersModel('file://' + path);
	const players = await loadDQNPlayers(2021, 250);
	const actionCount = players.length;
	const dimensions: [number, number, number] = [actionCount, players[0].inputs.length, 1];
	const draft = new DraftTask({ dimensions, all_actions: players, teamOpts, oppCount: 1 });
	const agent = new Agent(draft, {
		replayBufferSize: 1e4,
		epsilonInit: 0.5,
		epsilonFinal: 0.01,
		epsilonDecayFrames: 1e5,
		cachedOnlineNet
	});

	await train(agent, 64, 0.99, 1e3, 150, 1e6, 2.5e3, `${process.cwd()}/data/models/DQN`, null);
};

trainDQN();
