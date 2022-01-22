import { getPlayerBySlug } from '$lib/data/_db/controllers/player';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ params }) => {
	const { playerSlug } = params;

	const playerData = await getPlayerBySlug(playerSlug);

	if (playerData) {
		return {
			body: {
				playerData
			}
		};
	}

	return {
		status: 500
	};
};
