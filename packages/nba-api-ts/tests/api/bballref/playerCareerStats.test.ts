import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Player2, initConnect, endConnect } from '../../../src';
import { Player2Document } from '../../../src';
import { getPlayerCareerStats } from '../../../src/api/bballRef/player';
import { PlayerCareerStatSeason } from '../../../src/api/bballRef/types';

const PlayerCareerStatsTest = suite('playerCareerStatsTest');
let player: Player2Document;
let careerStats: PlayerCareerStatSeason[];

PlayerCareerStatsTest.before(async () => {
	await initConnect();
});

PlayerCareerStatsTest.after(async () => {
	await endConnect();
});

PlayerCareerStatsTest('find player in Player2 collection ', async () => {
	player = await Player2.findOne({ 'meta.helpers.bballRef.playerUrl': 'curryse01' });
});

PlayerCareerStatsTest('playerUrl should be string', async () => {
	const { playerUrl } = player.meta.helpers.bballRef;
	assert.type(playerUrl, 'string');
});

PlayerCareerStatsTest('getPlayerData should be function', () => {
	assert.type(getPlayerCareerStats, 'function');
});

PlayerCareerStatsTest('load player profile meta data', async () => {
	const { playerUrl } = player.meta.helpers.bballRef;
	careerStats = await getPlayerCareerStats(playerUrl);
});

PlayerCareerStatsTest('verify playerData exists', () => {
	console.log(careerStats);
	assert.ok(careerStats);
});

PlayerCareerStatsTest.run();
