import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getSeasonGames } from '../../../src/api/bballRef/seasons';
import { addOrFindGame } from '../../../src/db/controllers/Game2';
import { Game2, initConnect, endConnect } from '../../../src';

const AddOrFindGameTest = suite('addOrFindGameTest');
let game;

AddOrFindGameTest.before(async () => {
	await initConnect();
});

AddOrFindGameTest.after(async () => {
	await endConnect();
});

AddOrFindGameTest('test function exec', () => {
	assert.type(addOrFindGame, 'function');
});

AddOrFindGameTest('fetch list of games in 2020-21 NBA season', async () => {
	const league = 'NBA';
	const year = 2021;
	const games = await getSeasonGames('NBA', 2021);
	game = await addOrFindGame(games[0], year, league);
	assert.ok(game);
});

AddOrFindGameTest('fetch list of games in 2020-21 NBA season', () => {
	assert.instance(game, Game2);
});

AddOrFindGameTest.run();
