import { json } from '@sveltejs/kit';
import { getTodaysGames } from '$lib/data/_db/controllers/games';
import type { RequestHandler } from '@sveltejs/kit';
import type { DailyGames } from '$lib/data/stores/types';

export const GET: RequestHandler = async () => {
	const todaysGames: DailyGames = await getTodaysGames();

	return json({
		todaysGames
	});
};
