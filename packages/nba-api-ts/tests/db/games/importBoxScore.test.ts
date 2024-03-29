import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { importBoxScore } from '../../../src/db/controllers/Game2';
import { Game2, initConnect, endConnect } from '../../../src';
import { Game2Document } from '../../../src/db/interfaces/mongoose.gen';

const ImportBoxScoresTest = suite('importBoxScoresTest', {});
let game: Game2Document;
let result: Game2Document;

ImportBoxScoresTest.before(async () => {
	await initConnect();
});

ImportBoxScoresTest.after(async () => {
	await endConnect();
});

ImportBoxScoresTest('importBoxScores should be function', () => {
	assert.type(importBoxScore, 'function');
});

ImportBoxScoresTest('findOne Game2: instance of Game2', async () => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 2);

	game = await Game2.findOne({ date: { $lte: yesterday } }).populate('home.team visitor.team');
	assert.instance(game, Game2);
});

ImportBoxScoresTest('import boxScore: instance of Game2', async () => {
	result = await importBoxScore(game);
	assert.instance(result, Game2);
});

ImportBoxScoresTest.run();
