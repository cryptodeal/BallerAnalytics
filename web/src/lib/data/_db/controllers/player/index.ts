import { Player2 } from '@balleranalytics/nba-api-ts';
import type { Player2Document } from '@balleranalytics/nba-api-ts';

export const getSeasonPlayers = (page: number): Promise<Player2Document[]> => {
	return Player2.find({ $or: [{ seasons: { $elemMatch: { year: 2022 } } }] })
		.select('name meta.images meta.slug seasons.teams')
		.sort('name.full')
		.paginate(page)
		.lean()
		.exec()
		.then((players: Player2Document[]) => {
			return players;
		});
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
