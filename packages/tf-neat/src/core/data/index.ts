import { Player2, type Player2Object } from '@balleranalytics/nba-api-ts';

export const loadSeasonPlayers = async (season: number): Promise<Player2Object[]> => {
	return Player2.fantasyData(season).then((players) => {
		return Promise.all(
			players.map((p) => {
				return p
					.populate('seasons.regularSeason.games')
					.exec()
					.then((p) => {
						return p;
					});
			})
		);
	});
};
