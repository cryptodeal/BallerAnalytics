import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { storePlayerRegSeasonStats } from '../../../src/db/controllers/Player2';
import { Player2, initConnect, endConnect } from '../../../src';

const ImportCareerStatsTest = suite('importCareerStatsTest');
let player;

ImportCareerStatsTest.before(async () => {
	await initConnect();
});

ImportCareerStatsTest.after(async () => {
	await endConnect();
});

ImportCareerStatsTest('test function type', () => {
	assert.type(storePlayerRegSeasonStats, 'function');
});

ImportCareerStatsTest('query db for player', async () => {
	const tempPlayer = await Player2.findOne();
	player = await storePlayerRegSeasonStats(tempPlayer);
	console.log(player);
});

ImportCareerStatsTest.run();
