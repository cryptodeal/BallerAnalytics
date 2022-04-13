import { Player2, Game2, Player } from '@balleranalytics/nba-api-ts';
import { calcFantasyPoints } from '../../utils';
import type {
	Player2Object,
	Game2Object,
	Player2Document,
	Game2Document
} from '@balleranalytics/nba-api-ts';
import type { SznGames, ParsedGame, PlayerData } from './types';

const loadSznGames = async (
	playerId: Player2Document['_id'],
	games: Game2Document['_id'][],
	year: number
): Promise<SznGames> => {
	const filteredGameStats: Game2Object[] = await Game2.getFantasyGames(playerId, games);
	const resGames = filteredGameStats
		.map((g) => {
			const { date, home, visitor } = g;

			if (!home.players.length) {
				const [{ stats }] = visitor.players;
				const totals = stats.totals;
				const parsedGame: ParsedGame = {
					date,
					stats: totals
				};
				return parsedGame;
			}
			const [{ stats }] = home.players;
			const totals = stats.totals;
			const parsedGame: ParsedGame = {
				date,
				stats: totals
			};
			return parsedGame;
		})
		.filter((g) => g.stats?.minutes !== undefined);
	resGames.map((g) => {
		g.stats.fantasyPts = calcFantasyPoints(g.stats);
		return g;
	});

	return { year: year, games: resGames };
};

export const loadPlayerSznGames = async (player: Player2Object): Promise<Player | void> => {
	const promises: Promise<SznGames>[] = [];
	for (let i = 0; i < player.seasons.length; i++) {
		const { year, regularSeason } = player.seasons[i];
		const { games } = regularSeason;
		if (!games) continue;
		promises.push(loadSznGames(player._id, games as Game2Document['_id'][], year));
	}
	const sznGames = await Promise.all(promises);
	sznGames.sort((a, b) => a.year - b.year);
	const playerData: PlayerData = {};
	const resPlayer = new Player(player._id, sznGames[0].year, player.birthDate);
	for (let i = 0; i < sznGames.length; i++) {
		const { year, games } = sznGames[i];
		playerData[year] = games;
	}
	resPlayer.startSeason = sznGames[0].year;
	resPlayer.playerData = playerData;
	return resPlayer;
};

export const loadSeasonPlayers = async (season: number): Promise<Player[]> => {
	return Player2.fantasyData(season).then((players) => {
		return Promise.all(players.map(loadPlayerSznGames));
	});
};
