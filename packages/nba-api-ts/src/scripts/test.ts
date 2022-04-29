import { loadDQNPlayers } from '../db/controllers/ml';

const test = async () => {
	return loadDQNPlayers(2021).then(console.log);
};

test();
