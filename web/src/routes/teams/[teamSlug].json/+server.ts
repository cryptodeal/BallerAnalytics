import { json } from '@sveltejs/kit';
import { getTeamBySlug /*, type TeamPageInitData*/ } from '$lib/data/_db/controllers/team';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const { teamSlug } = params;
	const i = url.searchParams.has('i') ? parseInt(url.searchParams.get('i') as string) : 0;

	const { team, games, players } = await getTeamBySlug(teamSlug, i);

	if (team && games && players) {
		return json({
			team,
			games,
			players
		});
	}

	return new Response(undefined, { status: 500 });
};
