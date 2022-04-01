import { serverlessConnect, Player2, endConnect } from '../../../index';
import config from '../../../config';

const fixSeasons = async () => {
	let playerCount = await Player2.countDocuments();

	for (const player of await Player2.find()) {
		const years = player.seasons.map((s) => s.year);
		const seasonYears = new Set(years);
		seasonYears.forEach((year) => {
			if (player.seasons.filter((s) => s.year == year).length > 1) {
				const seasonIdx = player.seasons.findIndex((s) => s.year === year);
				player.seasons.splice(seasonIdx, 1);
			}
		});
		await player.save();
		console.log(`Players Remaining: ${playerCount--}`);
	}
};

const importAllCareerStats = () => {
	serverlessConnect(config.MONGO_URI)
		.then(async () => {
			return fixSeasons();
		})
		.then(endConnect);
};

importAllCareerStats();
