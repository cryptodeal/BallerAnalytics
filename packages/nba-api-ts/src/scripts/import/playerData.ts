import { serverlessConnect, endConnect } from '../../index';
import config from '../../config';
import { importLatestGames } from '../../db/controllers/Game2';

const test = async () => {
	await serverlessConnect(config.MONGO_URI);
	await importLatestGames();
	return endConnect();
};

test();
