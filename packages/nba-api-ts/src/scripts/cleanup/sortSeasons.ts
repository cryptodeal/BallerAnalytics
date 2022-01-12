import { Player2, Team2, League, Official2, initConnect, endConnect } from '../../index';

const fixSeasonSort = async () => {
	for (const player of await Player2.find()) {
		player.seasons.sort((a, b) => b.year - a.year);
		await player.save();
	}

	for (const team of await Team2.find()) {
		team.seasons.sort((a, b) => b.season - a.season);
		await team.save();
	}

	for (const league of await League.find()) {
		league.seasons.sort((a, b) => b.year - a.year);
		await league.save();
	}

	for (const official of await Official2.find()) {
		official.seasons.sort((a, b) => b.year - a.year);
		await official.save();
	}
};

initConnect(true)
	.then(async () => {
		return fixSeasonSort();
	})
	.then(endConnect);
