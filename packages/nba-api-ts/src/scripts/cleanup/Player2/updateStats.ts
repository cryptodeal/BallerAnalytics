import { serverlessConnect, endConnect } from '../../../index';
import config from '../../../config';
import { importAllPlayerStats } from '../../../db/controllers/Player2';

const importAllCareerStats = () => {
	serverlessConnect(config.MONGO_URI)
		.then(() => {
			return importAllPlayerStats();
		})
		.then(endConnect);
};

importAllCareerStats();
