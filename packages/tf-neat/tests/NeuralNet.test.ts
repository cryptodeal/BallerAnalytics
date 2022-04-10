import { suite } from 'uvu';
import { NeuralNetwork } from '../src/base/NeuralNetwork';
import type { Base } from '../src/base/Base';
import { loadPlayerSznGames } from '../src/core/data';
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
	const params = { batchSize: 10, epochs: 20000 };
	model = new NeuralNetwork(params);
	await model.init(2021);
});

NeuralNetTest('fetch list of games in 2020-21 NBA season', async () => {
	const tempPlayer = await Player2.findOne({ 'name.full': 'James Harden' });
	if (!tempPlayer) throw new Error('No players found');
	const sznIdz = tempPlayer.seasons.findIndex((s) => s.year === 2022);
	tempPlayer.seasons.splice(sznIdz, 1);
	const playerRes = await loadPlayerSznGames(tempPlayer);
	if (!playerRes) throw new Error('No player data found');
	player = playerRes;
});

NeuralNetTest('test output on model', async () => {
	player.processData();
	console.log(`calculated avgFppg: ${player.labels[0]}`);
	prediction = model.predict(player.inputs);
	console.log(`Projected avgFppg: ${prediction}`);
});

NeuralNetTest.run();
