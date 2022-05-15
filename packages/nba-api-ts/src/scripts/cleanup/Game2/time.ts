import { endConnect, serverlessConnect } from '../../../index';
import { fixGameTimes } from '../../../db/controllers/Game2';
import config from '../../../config';

const fixTime = async () => {
	await serverlessConnect(config.MONGO_URI);
	await fixGameTimes();
	return endConnect();
};

fixTime();
