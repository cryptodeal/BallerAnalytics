import { serverlessConnect, Player2, Game2, endConnect } from '../../../index';
import config from '../../../config';
import type { Game2Document, Player2Document } from '../../../index';
import type { Player2Season } from '../../../db/controllers/Player2';

const fixPlayerGameRef = async (player: Player2Document) => {
	const games: Game2Document[] = await Game2.find({
		$or: [
			{
				'home.players': {
					$elemMatch: {
						player: player._id
					}
				}
			},
			{
				'visitor.players': {
					$elemMatch: {
						player: player._id
					}
				}
			}
		]
	})
		.select('meta.helpers.bballRef.year _id')
		.lean();
	const years: number[] = games.map((game) => game.meta.helpers.bballRef.year);
	const seasonYears = new Set(years);
	seasonYears.forEach((year) => {
		const seasonIdx = player.seasons.findIndex((s) => s.year === year);
		if (!seasonIdx || seasonIdx === -1) {
			const season: Player2Season = {
				year,
				teams: [],
				preseason: {
					games: []
				},
				regularSeason: {
					games: []
				},
				postseason: {
					games: []
				}
			};
			games
				.filter((game) => game.meta.helpers.bballRef.year === year)
				.map(({ _id }) => {
					season.regularSeason.games.push(_id);
				});
			player.seasons.addToSet(season);
		} else {
			games
				.filter((game) => game.meta.helpers.bballRef.year === year)
				.map(({ _id }) => {
					player.seasons[seasonIdx].regularSeason.games.addToSet(_id);
				});
		}
	});
	return player.save().catch((e) => console.log(e));
};

const fixPlayerGameRefs = async () => {
	let playerCount = await Player2.countDocuments({
		'seasons.0.regularSeason.games': { $exists: true, $not: { $size: 0 } }
	});
	console.log(`Players Total: ${playerCount}`);
	for (const player of await Player2.find({
		'seasons.0.regularSeason.games': { $exists: true, $not: { $size: 0 } }
	})) {
		// console.log(players)
		await fixPlayerGameRef(player);
		playerCount--;
		console.log(`Players Remaining: ${playerCount}`);
	}
};

const importAllCareerStats = () => {
	serverlessConnect(config.MONGO_URI)
		.then(async () => {
			return fixPlayerGameRefs();
		})
		.then(endConnect);
};

importAllCareerStats();
