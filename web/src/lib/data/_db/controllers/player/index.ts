import { Player2 } from '@balleranalytics/nba-api-ts';
import type { Player2Document } from '@balleranalytics/nba-api-ts';

export const getSeasonPlayers = (page = 0, limit = 50): Promise<Player2Document[]> => {
	return Player2.find({ $or: [{ seasons: { $elemMatch: { year: 2022 } } }] })
		.sort('name.full')
		.select('name meta.images seasons.teams')
		.paginate(page, limit)
		.lean()
		.exec()
		.then((players: Player2Document[]) => {
			return players;
		});
};
