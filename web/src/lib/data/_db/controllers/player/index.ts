import { Player2 } from '@balleranalytics/nba-api-ts';
import { getMinMaxSeasons } from '../games';
import type { Player2Document } from '@balleranalytics/nba-api-ts';

export type PlayersQueryRes = {
	players: Player2Document[];
	query: {
		year: number;
	};
};
export const getSeasonPlayers = (
	page: number,
	year: number
): Promise<[PlayersQueryRes, { min: number; max: number }]> => {
	return Promise.all([
		Player2.find({ $or: [{ seasons: { $elemMatch: { year: year } } }] })
			.select('name.full meta.images meta.slug')
			.sort('name.full')
			.paginate(page)
			.lean()
			.exec()
			.then((players) => {
				return { players, query: { year } };
			}),
		getMinMaxSeasons()
	]);
};

export const getPlayerBySlug = (slug: string): Promise<Player2Document> => {
	return Player2.findBySlug(slug)
		.lean()
		.exec()
		.then((player: Player2Document | null) => {
			if (!player) throw new Error(`Player with slug ${slug} not found`);
			player.seasons.sort((a, b) => b.year - a.year);
			return player;
		});
};
