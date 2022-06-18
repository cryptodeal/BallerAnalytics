import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getSeasonGames, SeasonGameItem } from '../../../src/api/bballRef/seasons';

const SeasonGamesTest = suite('seasonGamesTest');
let testGames: SeasonGameItem[];
const testLeague = 'NBA';
const testYear = 2021;

SeasonGamesTest('getSeasonGames should be function', () => {
	assert.type(getSeasonGames, 'function');
});

SeasonGamesTest('get all seasonGames', async () => {
	const games = await getSeasonGames('NBA', 2021);
	console.log(games[0]);
	testGames = games;
});

SeasonGamesTest('testLeague should be string', () => {
	assert.type(testLeague, 'string');
});

SeasonGamesTest('testYear should be number', () => {
	assert.type(testYear, 'number');
});

SeasonGamesTest('testGames should be array', () => {
	assert.instance(testGames, Array);
});

SeasonGamesTest.run();
