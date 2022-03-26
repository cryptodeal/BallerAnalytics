import { serverlessConnect } from '../../../index';
import { importAllPlayerStats } from '../../../db/controllers/Player2';
import config from '../../../config';

const importAllCareerStats = () => {
	serverlessConnect(config.MONGO_URI).then(async () => {
		await importAllPlayerStats();
	});
};

importAllCareerStats();
