import { serverlessConnect } from '../../../index';
import { updateActivePlayersCareerStats } from '../../../db/controllers/Player2';
import config from '../../../config';

const importAllCareerStats = () => {
	serverlessConnect(config.MONGO_URI).then(async () => {
		await updateActivePlayersCareerStats();
	});
};

importAllCareerStats();
