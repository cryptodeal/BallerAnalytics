import { Player2, serverlessConnect } from '../index';
import { DQNPlayer } from '../db/controllers/ml/DQN';
import config from '../config';

const test = async () => {
	await serverlessConnect(config.MONGO_URI);
	const players: DQNPlayer[] = [];
	for (const player of await Player2.fantasyDataPerf(2021)) {
		players.push(new DQNPlayer(player));
	}
	return players;
};

test().then(console.log);
