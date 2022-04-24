import { Player2, serverlessConnect } from '../index';
import config from '../config';

const test = async () => {
	await serverlessConnect(config.MONGO_URI);
	return Player2.fantasyDataPerf(2021);
};

test().then(console.log);
