import { Game2, initConnect, endConnect } from '../../../index';
import dayjs from 'dayjs';

initConnect(true)
	.then(async () => {
		const startOfDay = dayjs().startOf('day').toDate();
		let count = await Game2.countDocuments({ date: { $lte: startOfDay } });
		for (const game of await Game2.find({ date: { $lte: startOfDay } }).select('meta')) {
			console.log(count);
			count--;
			game.meta.helpers.isOver = true;
			await game.save();
		}
	})
	.then(endConnect);
