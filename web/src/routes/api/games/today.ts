import { getTodaysGames } from '$lib/data/_db/controllers/games';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async () => {
	const todaysGames = await getTodaysGames();
	return {
		body: {
			todaysGames
		}
	};
};
