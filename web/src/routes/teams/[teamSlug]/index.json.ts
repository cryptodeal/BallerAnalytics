import { getTeamBySlug } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ params, query }) => {
	const { teamSlug } = params;
	if (!query.has('seasonIdx')) throw new Error(`query missing seasonIdx`);
	const seasonIdx = parseInt(query.get('seasonIdx'));

	const teamData = await getTeamBySlug(teamSlug, seasonIdx);
	console.log(teamData);

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
