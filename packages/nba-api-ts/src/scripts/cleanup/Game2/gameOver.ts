import { Game2, initConnect, endConnect } from '../../../index';

initConnect(true)
	.then(async () => {
		const startOfDay = new Date(2022, 0, 18);
		let count = await Game2.countDocuments({
			date: { $lte: startOfDay },
			$or: [{ 'meta.helpers.isOver': false }, { 'meta.helpers.isOver': { $exists: false } }]
		});
		for (const game of await Game2.find({
			date: { $lte: startOfDay },
			$or: [{ 'meta.helpers.isOver': false }, { 'meta.helpers.isOver': { $exists: false } }]
		}).select('meta')) {
			console.log(count);
			count--;
			game.meta.helpers.isOver = true;
			await game.save();
		}
	})
	.then(endConnect);
