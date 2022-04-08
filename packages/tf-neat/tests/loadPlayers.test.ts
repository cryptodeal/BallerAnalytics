import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { loadSeasonPlayers } from '../../src/core/data';
import config from '../../src/config';
import { serverlessConnect } from '@balleranalytics/nba-api-ts';

const LoadPlayersTest = suite('loadPlayersTest');
let players;

LoadPlayersTest.before(async () => {
	await serverlessConnect(config.MONGO_URI);
});

LoadPlayersTest('expect typeof function', () => {
	assert.type(loadSeasonPlayers, 'function');
});

LoadPlayersTest('fetch list of games in 2020-21 NBA season', async () => {
	players = await loadSeasonPlayers(2020);
});

LoadPlayersTest.run();
