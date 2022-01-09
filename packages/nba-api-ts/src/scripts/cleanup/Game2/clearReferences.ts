import { Player2, Team2, League, Official2, initConnect, endConnect } from '../../../index';

const clearGameRef = async () => {
	for (const player of await Player2.find()) {
		for (let i = 0; i < player.seasons.length; i++) {
			player.seasons[i].preseason.games.splice(0);
			player.seasons[i].regularSeason.games.splice(0);
			player.seasons[i].postseason.games.splice(0);
		}
		await player.save();
	}

	for (const team of await Team2.find()) {
		for (let i = 0; i < team.seasons.length; i++) {
			team.seasons[i].preseason.games.splice(0);
			team.seasons[i].regularSeason.games.splice(0);
			team.seasons[i].postseason.games.splice(0);
		}
		await team.save();
	}

	for (const league of await League.find()) {
		for (let i = 0; i < league.seasons.length; i++) {
			league.seasons[i].games.preseason.splice(0);
			league.seasons[i].games.regularSeason.splice(0);
			league.seasons[i].games.postSeason.splice(0);
		}
		await league.save();
	}

	for (const official of await Official2.find()) {
		for (let i = 0; i < official.seasons.length; i++) {
			official.seasons[i].preseason.games.splice(0);
			official.seasons[i].regularSeason.games.splice(0);
			official.seasons[i].postseason.games.splice(0);
		}
		await official.save();
	}
};

initConnect()
	.then(async () => {
		return clearGameRef();
	})
	.then(endConnect);
