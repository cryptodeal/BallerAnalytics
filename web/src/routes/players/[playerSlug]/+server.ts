import { json } from '@sveltejs/kit';
import { getPlayerBySlug } from '$lib/data/_db/controllers/player';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { playerSlug } = params;

	const playerData = await getPlayerBySlug(playerSlug);

	if (playerData) {
		return json({
			playerData
		});
	}

	return new Response(undefined, { status: 500 });
};
