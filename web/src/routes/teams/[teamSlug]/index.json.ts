import { getTeamBySlug } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';
import type { TeamPageInitData } from '$lib/data/_db/controllers/team';
import type { TeamSlugParams } from './types';

export const get: RequestHandler<TeamSlugParams, TeamPageInitData> = async ({ params, url }) => {
	const { teamSlug } = params;
	const i = url.searchParams.has('i') ? parseInt(url.searchParams.get('i')) : 0;

	const { team, games, players } = await getTeamBySlug(teamSlug, i);

	if (team && games && players) {
		return {
			body: {
				team,
				games,
				players
			}
		};
	}

	return {
		status: 500
	};
};
