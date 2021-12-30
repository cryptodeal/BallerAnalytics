import { getTeamBySlug } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ params, url }) => {
	const { teamSlug } = params;
	if (!url.searchParams.has('seasonIdx')) throw new Error(`query missing seasonIdx`);
	const seasonIdx = parseInt(url.searchParams.get('seasonIdx'));

	const teamData = await getTeamBySlug(teamSlug, seasonIdx);

	if (teamData) {
		return {
			body: {
				teamData
			}
		};
	}

	return {
		status: 500
	};
};
