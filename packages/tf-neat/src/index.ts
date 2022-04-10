import { NeuralNetwork } from '../src/base/NeuralNetwork';
import config from '../src/config';
import { serverlessConnect, endConnect, Player2 } from '@balleranalytics/nba-api-ts';
import { loadPlayerSznGames } from '../src/core/data';

const testBaseModel = () => {
	serverlessConnect(config.MONGO_URI).then(async () => {
		const model = new NeuralNetwork({ epochs: 20000, batchSize: 50, tfvis: false });
		await model.init(2020);
		const tempPlayer = await Player2.findOne({ 'name.full': 'James Harden' });
		if (!tempPlayer) throw new Error('No players found');
		const sznIdz = tempPlayer.seasons.findIndex((s) => s.year === 2022);
		tempPlayer.seasons.splice(sznIdz, 1);
		const playerRes = await loadPlayerSznGames(tempPlayer);
		if (!playerRes) throw new Error('No player data found');
		playerRes.processData();
		console.log(`true avgFppg: ${playerRes.labels[0]}`);
		const pred = model.predict(playerRes.inputs);
		console.log(`Projected avgFppg: ${pred}`);
		return endConnect();
	});
};

testBaseModel();
