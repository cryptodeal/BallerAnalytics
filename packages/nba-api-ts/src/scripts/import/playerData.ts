import { serverlessConnect, endConnect } from '../../index';
import config from '../../config';
import { importAllPlayerStats } from '../../db/controllers/Player2';

const test = async () => {
	await serverlessConnect(config.MONGO_URI);
	await importAllPlayerStats();
	return endConnect();
};

test();
