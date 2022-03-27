import { serverlessConnect } from '../../../db/connect';
import config from '../../../config';
import { Player2, Team2, League, endConnect } from '../../../index';

const clearGameRef = async () => {
	let playerCount = await Player2.countDocuments();
	console.log(`Players Total: ${playerCount}`);
	for (const player of await Player2.find()) {
		for (let i = 0; i < player.seasons.length; i++) {
			player.seasons[i].preseason.games.splice(0);
			player.seasons[i].regularSeason.games.splice(0);
			player.seasons[i].postseason.games.splice(0);
		}
		await player.save();
		console.log(`Players Remaining: ${playerCount--}`);
	}

	let teamCount = await Team2.countDocuments();
	console.log(`Teams Total: ${teamCount}`);
	for (const team of await Team2.find()) {
		for (let i = 0; i < team.seasons.length; i++) {
			team.seasons[i].preseason.games.splice(0);
			team.seasons[i].regularSeason.games.splice(0);
			team.seasons[i].postseason.games.splice(0);
		}
		await team.save();
		console.log(`Teams Remaining: ${teamCount--}`);
	}

	let leagueCount = await League.countDocuments();
	console.log(`Leagues Total: ${leagueCount}`);
	for (const league of await League.find()) {
		for (let i = 0; i < league.seasons.length; i++) {
			league.seasons[i].games.preseason.splice(0);
			league.seasons[i].games.regularSeason.splice(0);
			league.seasons[i].games.postSeason.splice(0);
		}
		await league.save();
		console.log(`Leagues Remaining: ${leagueCount--}`);
	}
};

serverlessConnect(config.MONGO_URI)
	.then(async () => {
		return clearGameRef();
	})
	.then(endConnect);
