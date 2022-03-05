import { Player2 } from '@balleranalytics/nba-api-ts';
import type { Player2Document } from '@balleranalytics/nba-api-ts';

export const getSeasonPlayers = (page: number): Promise<Player2Document[]> => {
	return Player2.find({ $or: [{ seasons: { $elemMatch: { year: 2022 } } }] })
		.select('name.full meta.images meta.slug')
		.sort('name.full')
		.paginate(page)
		.lean()
		.exec();
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
