import { suite } from 'uvu';
import { NeuralNetwork } from '../src/base/NeuralNetwork';
import type { Base } from '../src/base/Base';
import { loadPlayerSznGames } from '@balleranalytics/nba-api-ts';
import { readFile } from 'fs';
import config from '../src/config';
import { endConnect, Player2, serverlessConnect } from '@balleranalytics/nba-api-ts';
import { Player } from '../src/base/utils/Player';

const NeuralNetTest = suite('neuralNetTest');
let player: Player;
let model: Base;
let prediction: number;

NeuralNetTest.before(async () => {
	await serverlessConnect(config.MONGO_URI);
});

NeuralNetTest.after(async () => {
	await endConnect();
});

NeuralNetTest('fetch list of games in 2020-21 NBA season', async () => {
	const params = { batchSize: 10, epochs: 100000 };
	model = new NeuralNetwork(params);
	return readFile(`${process.cwd()}/data/basic.json`, 'utf8', function (err, data) {
		if (err) throw err;
		return model.init(JSON.parse(data));
	});
});

NeuralNetTest('fetch list of games in 2020-21 NBA season', async () => {
	const tempPlayer = await Player2.findOne({ 'name.full': 'Jaylen Brown' });
	if (!tempPlayer) throw new Error('No players found');
	const playerRes = await loadPlayerSznGames(tempPlayer);
	if (!playerRes) throw new Error('No player data found');
	player = playerRes;
});

NeuralNetTest('test output on model', async () => {
	player.processSznData();
	const [calcFppgRes] = player.rawData[player.rawData.length - 1].labels;
	console.log(`calculated avgFppg: ${calcFppgRes}`);
	const pInputs = player.rawData[player.rawData.length - 1].inputs;
	prediction = model.predict(pInputs);
	console.log(`Projected avgFppg: ${prediction}`);
});

// NeuralNetTest.run();
