import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { type DQNPlayer, loadDQNPlayers } from '@balleranalytics/nba-api-ts';
import { Roster } from '../src/DQN/tasks';
import { getRandomInt } from '../src/DQN/utils';

const RosterTest = suite('RosterTest');
let players: DQNPlayer[];

RosterTest('load Players; initRoster w 0 size and check if `roster.done = true` ', async () => {
	const roster = new Roster({ pg: 0, sg: 0, sf: 0, pf: 0, f: 0, c: 0, g: 0, util: 0, be: 0 });
	assert.is(roster.done, false);
	const tempPlayers = await loadDQNPlayers(2021);
	// console.log(tempPlayers[0]);
	if (tempPlayers.length) players = tempPlayers;
	roster.addPick(tempPlayers[0]);
	assert.is(roster.done, true);
});

RosterTest('load Players; use defaults w random players', async () => {
	const roster = new Roster({ pg: 1, sg: 1, sf: 1, pf: 1, f: 1, c: 1, g: 1, util: 3, be: 3 });
	for (let i = 0; i < 13; i++) {
		const pick = getRandomInt(0, players.length - 1);
		const draftPick = players[pick];
		players.slice(pick, 1);
		roster.addPick(draftPick);
	}
	assert.is(roster.done, true);
});

RosterTest.run();
