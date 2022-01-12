import { getTeamBySlug } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ params, query }) => {
	const { teamSlug } = params;
	const seasonIdx = query.has('seasonIdx') ? parseInt(query.get('seasonIdx')) : 0;

	const teamData = await getTeamBySlug(teamSlug, seasonIdx);
	// console.log(teamData);

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
