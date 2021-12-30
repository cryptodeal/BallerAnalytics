import {
	endConnect,
	Game2,
	Game2HomeStatsPeriodDocument,
	Game2VisitorStatsPeriodDocument,
	initConnect
} from '../../../index';

const fixGameStats = async () => {
	for (const game of await Game2.find({
		$or: [
			{ 'home.stats.periods.0': { $exists: true } },
			{ 'visitor.stats.periods.0': { $exists: true } }
		]
	})) {
		const homePeriods: Game2HomeStatsPeriodDocument[] = [];
		const visitorPeriods: Game2VisitorStatsPeriodDocument[] = [];

		// fix home team stat period duplicates
		for (let i = 0; i < game.home.stats.periods.length; i++) {
			if (
				homePeriods.findIndex((p) => p.periodValue === game.home.stats.periods[i].periodValue) ===
				-1
			) {
				homePeriods.push(game.home.stats.periods[i]);
			}
		}
		game.home.stats.periods.splice(0);

		// fix visitor team stat period duplicates
		for (let i = 0; i < game.visitor.stats.periods.length; i++) {
			if (
				visitorPeriods.findIndex(
					(p) => p.periodValue === game.visitor.stats.periods[i].periodValue
				) === -1
			) {
				visitorPeriods.push(game.visitor.stats.periods[i]);
			}
		}
		game.visitor.stats.periods.splice(0);

		// add back home and visitor team stat periods
		homePeriods.map((p) => game.home.stats.periods.addToSet(p));
		visitorPeriods.map((p) => game.visitor.stats.periods.addToSet(p));
		await game.save();
	}
};

initConnect()
	.then(() => {
		return fixGameStats();
	})
	.then(endConnect);
