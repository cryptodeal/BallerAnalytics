import { getTeamBySlug } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';
import type { TeamPageInitData } from '$lib/data/_db/controllers/team';
import type { TeamSlugParams } from './types';

export const get: RequestHandler<TeamSlugParams, TeamPageInitData> = async ({ params, url }) => {
	const { teamSlug } = params;
	const seasonIdx = url.searchParams.has('seasonIdx')
		? parseInt(url.searchParams.get('seasonIdx'))
		: 0;

	const { team, games, players } = await getTeamBySlug(teamSlug, seasonIdx);
	// console.log(teamData);

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
