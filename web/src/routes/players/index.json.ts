import { getSeasonPlayers } from '$lib/data/_db/controllers/player';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ query }) => {
	const page = query.has('page') ? parseInt(query.get('page')) : 0;
	const players = await getSeasonPlayers(page);

	if (players) {
		return {
			body: {
				players
			}
		};
	}

	return {
		status: 500
	};
};
