import {
	endConnect,
	Game2,
	Game2HomeStatsPeriodDocument,
	Game2VisitorStatsPeriodDocument,
	initConnect
} from '../../../index';

const fixGameStats = async () => {
	let count = await Game2.countDocuments({
		$or: [
			{ 'home.stats.periods.0.periodValue': { $exists: true } },
			{ 'visitor.stats.periods.0.periodValue': { $exists: true } }
		]
	});
	for (const game of await Game2.find({
		$or: [
			{ 'home.stats.periods.0.periodValue': { $exists: true } },
			{ 'visitor.stats.periods.0.periodValue': { $exists: true } }
		]
	}).select('home.stats.periods visitor.stats.periods')) {
		console.log(count);
		const homePeriods: Game2HomeStatsPeriodDocument[] = [];
		const visitorPeriods: Game2VisitorStatsPeriodDocument[] = [];

		// fix home team stat period duplicates
		const hPeriodCount = game.home.stats.periods.length;
		for (let i = 0; i < hPeriodCount; i++) {
			if (
				homePeriods.findIndex((p) => p.periodValue === game.home.stats.periods[i].periodValue) ===
				-1
			) {
				homePeriods.push(game.home.stats.periods[i]);
			}
		}
		game.home.stats.periods.splice(0);

		// fix visitor team stat period duplicates
		const vPeriodCount = game.visitor.stats.periods.length;
		for (let j = 0; j < vPeriodCount; j++) {
			if (
				visitorPeriods.findIndex(
					(p) => p.periodValue === game.visitor.stats.periods[j].periodValue
				) === -1
			) {
				visitorPeriods.push(game.visitor.stats.periods[j]);
			}
		}
		game.visitor.stats.periods.splice(0);

		// add back home and visitor team stat periods
		homePeriods.map((p) => game.home.stats.periods.addToSet(p));
		visitorPeriods.map((p) => game.visitor.stats.periods.addToSet(p));
		count--;
		await game.save();
	}
};

initConnect()
	.then(() => {
		return fixGameStats();
	})
	.then(endConnect);
