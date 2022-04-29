import { suite } from 'uvu';
import { NeuralNetwork } from '../src/base/NeuralNetwork';
import config from '../src/config';
import {
	endConnect,
	loadPlayerSznGames,
	Player2,
	serverlessConnect,
	loadSeasonPlayers
} from '@balleranalytics/nba-api-ts';
import type { Base } from '../src/base/Base';
import type { Player } from '@balleranalytics/nba-api-ts';

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
	const params = { batchSize: 5, epochs: 10 };
	model = new NeuralNetwork(params);
	const players = await loadSeasonPlayers(2021);
	console.log('# players:', players.length);
	await model.init(players);
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

//NeuralNetTest.run();
