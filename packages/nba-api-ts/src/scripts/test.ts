import { Player2, serverlessConnect } from '../index';
import { DQNPlayer } from '../db/controllers/ml/DQN';
import config from '../config';

const test = async () => {
	await serverlessConnect(config.MONGO_URI);
	return Player2.fantasyDataPerf(2021).then((players) => {
		return players.map((p) => new DQNPlayer(p));
	});
};

test();
