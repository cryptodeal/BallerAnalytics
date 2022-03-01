import { Game2, serverlessConnect } from '../../../index';
import dayjs from 'dayjs';
import { importBoxScore } from '../../../db/controllers/Game2';
import config from '../../../config';

const fixGameOver = async () => {
	serverlessConnect(config.MONGO_URI).then(async () => {
		const date = dayjs().subtract(1, 'day');
		let count = await Game2.countDocuments({
			date: { $lte: date },
			$or: [{ 'meta.helpers.isOver': false }, { 'meta.helpers.isOver': { $exists: false } }]
		});
		for (const game of await Game2.find({
			date: { $lte: date },
			$or: [{ 'meta.helpers.isOver': false }, { 'meta.helpers.isOver': { $exists: false } }]
		})) {
			console.log(count);
			count--;
			await importBoxScore(game);
		}
	});
};

fixGameOver();
