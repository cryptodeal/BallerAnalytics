import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { memory, train as trainer, tensor1d } from '@tensorflow/tfjs-node';
import { DraftTask, getRandomAction, Roster } from '../../src/DQN/tasks';
import { Agent } from '../../src/DQN/Agent';
import { getRandomInt } from '../../src/DQN/utils';
import { type DQNPlayer, loadDQNPlayers } from '@balleranalytics/nba-api-ts';
import { PlayStepOutput, TeamOpts } from '../../src/DQN/tasks/types';
import { DraftAPI } from '../../src/DQN/utils/Draft';

const DraftTaskTest = suite('DraftTaskTest');
const DraftAgentTest = suite('DraftAgentTest');

const RosterTest = suite('RosterTest');
const DraftApiTest = suite('DraftApiTest');

const teamOpts: TeamOpts = { pg: 1, sg: 1, sf: 1, pf: 1, f: 1, c: 1, g: 1, util: 3, be: 3 };

let players: DQNPlayer[], draft: DraftAPI;

DraftApiTest('load Players; initialize Draft', async () => {
	const tempPlayers = await loadDQNPlayers(2021, 100);
	if (tempPlayers.length) players = tempPlayers;
	draft = new DraftAPI(players);
	assert.is(draft.players.length, 100);
	draft.rewards.map((r) => assert.is(r >= 0 && r <= 1, true));
});

DraftApiTest.run();

RosterTest('load Players; initRoster w 0 size and check if `roster.done = true`', async () => {
	const roster = new Roster({ pg: 0, sg: 0, sf: 0, pf: 0, f: 0, c: 0, g: 0, util: 0, be: 0 });
	assert.throws(() => roster.addPick(draft.players[0]), /Cannot addPick to invalid roster/);
});

RosterTest('load Players; use defaults w random players', async () => {
	let pass = false;
	/**
	 * to help roster successfully pass w random players,
	 * we'll run test 10 times to increase likelihood valid
	 * of randomly selecting valid roster
	 */
	for (let i = 0; i < 10; i++) {
		const draftPool = players;
		const roster = new Roster(teamOpts);
		for (let j = 0; j < 13; j++) {
			const pick = getRandomInt(0, draftPool.length);
			assert.is(pick >= 0, true);
			assert.is(pick < draftPool.length, true);
			const draftPick = draftPool[pick];
			if (!roster.done) {
				roster.addPick(draftPick);
			}
			draftPool.slice(pick, 1);
		}
		if (!roster.done) pass = true;
	}
	assert.is(pass, true);
});

RosterTest.run();

DraftTaskTest('getRandomAction', () => {
	for (let i = 0; i < 40; i++) {
		const action = getRandomAction(players.length);
		assert.is(action >= 0, true);
		assert.is(action < players.length, true);
	}
});

DraftTaskTest('DraftTask constructor w args', () => {
	const actionCount = players.length;
	const dimensions: [number, number, number] = [actionCount, players[0].inputs.length, 1];
	const draft = new DraftTask({ dimensions, all_actions: players, teamOpts, oppCount: 1 });
	assert.is(draft.dims1, players.length);
	assert.is(draft.dims2, players[0].inputs.length);
	assert.is(draft.dims3, 1);
});

DraftTaskTest('test basic step and associated state', () => {
	const actionCount = players.length;
	const dimensions: [number, number, number] = [actionCount, players[0].inputs.length, 1];
	for (let i = 0; i < 10; i++) {
		const draft = new DraftTask({ dimensions, all_actions: players, teamOpts, oppCount: 1 });
		const { s: sInitState, e: eInitState } = draft.getState();
		assert.is(sInitState.length, 0);
		assert.is(eInitState.length, actionCount);
		const picks: number[] = [];
		let draftDone = false;
		for (let j = 0; j < 13; j++) {
			if (!draftDone) {
				const pickIdx = getRandomAction(actionCount);
				const unavailPick = picks.includes(pickIdx);
				picks.push(pickIdx);
				const { done } = draft.step(pickIdx);
				if (unavailPick) assert.is(done, true);
				const { s, e } = draft.getState();
				if (!done) assert.is(s.length, j + 1);
				assert.is(e.length, actionCount);
				if (done) draftDone = true;
			}
		}
	}
});

DraftTaskTest.run();

DraftAgentTest('playStep', () => {
	const actionCount = players.length;
	const dimensions: [number, number, number] = [actionCount, players[0].inputs.length, 1];
	const draft = new DraftTask({ dimensions, all_actions: players, teamOpts, oppCount: 1 });
	const agent = new Agent(draft, {
		replayBufferSize: 100,
		epsilonInit: 1,
		epsilonFinal: 0.1,
		epsilonDecayFrames: 10
	});

	const numRounds = 40;
	let bufferIdx = 0;
	for (let i = 0; i < numRounds; i++) {
		let out: PlayStepOutput | null = null;
		let outPrev: PlayStepOutput | null = null;
		for (let j = 0; j < 13; j++) {
			const currentState = agent.task.getState();
			out = agent.playStep();
			/* Check the content of the replay buffer */
			assert.equal(agent.replayMemory.buffer[bufferIdx % 100][0], currentState);
			assert.is(agent.replayMemory.buffer[bufferIdx % 100][1], out.action);
			const expectedDiff = Math.pow(10, -2) / 2;
			const received =
				outPrev == null ? out.cumulativeReward : out.cumulativeReward - outPrev.cumulativeReward;
			const receivedDiff = Math.abs(received - agent.replayMemory.buffer[bufferIdx % 100][2]);
			assert.is(receivedDiff < expectedDiff, true);
			assert.is(agent.replayMemory.buffer[bufferIdx % 100][3], out.done);
			assert.equal(
				agent.replayMemory.buffer[bufferIdx % 100][4],
				out.done ? undefined : agent.task.getState()
			);
			bufferIdx++;
			if (out.done) {
				break;
			}
			outPrev = out;
		}
		agent.reset();
	}
});

DraftAgentTest('trainOnReplayBatch', () => {
	const actionCount = players.length;
	const dimensions: [number, number, number] = [actionCount, players[0].inputs.length, 1];
	const draft = new DraftTask({ dimensions, all_actions: players, teamOpts, oppCount: 1 });
	const replayBufferSize = 500;
	const agent = new Agent(draft, {
		replayBufferSize,
		epsilonInit: 1,
		epsilonFinal: 0.1,
		epsilonDecayFrames: 10
	});

	const oldOnlineWeights = agent.onlineNetwork.getWeights().map((x) => x.dataSync()),
		oldTargetWeights = agent.targetNetwork.getWeights().map((x) => x.dataSync());

	for (let i = 0; i < replayBufferSize; i++) {
		agent.playStep();
	}

	/* Burn-in run for memory leak check below */
	const batchSize = 128;
	const gamma = 0.99;
	const optimizer = trainer.adam();
	agent.trainOnReplayBatch(batchSize, gamma, optimizer);

	const numTensors0 = memory().numTensors;
	agent.trainOnReplayBatch(batchSize, gamma, optimizer);
	assert.is(memory().numTensors, numTensors0);

	const newOnlineWeights = agent.onlineNetwork.getWeights().map((x) => x.dataSync()),
		newTargetWeights = agent.targetNetwork.getWeights().map((x) => x.dataSync());

	/* check that online network's weights were updated */
	const oldOnlineWeightCount = oldOnlineWeights.length;
	for (let i = 0; i < oldOnlineWeightCount; i++) {
		assert.is(
			tensor1d(newOnlineWeights[i]).sub(tensor1d(oldOnlineWeights[i])).abs().max().arraySync() > 0,
			true
		);
	}
	/* check that target network's weights have not changed */
	for (let i = 0; i < oldOnlineWeightCount; i++) {
		assert.is(
			tensor1d(newTargetWeights[i]).sub(tensor1d(oldTargetWeights[i])).abs().max().arraySync(),
			0
		);
	}
});

DraftAgentTest.run();
