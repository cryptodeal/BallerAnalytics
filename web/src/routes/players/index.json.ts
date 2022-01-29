import { getSeasonPlayers } from '$lib/data/_db/controllers/player';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ url }) => {
	const page = url.searchParams.has('page') ? parseInt(url.searchParams.get('page')) : 0;
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
