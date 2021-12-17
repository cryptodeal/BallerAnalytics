import { getTeamBySlug } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ params }) => {
	const { teamSlug } = params;

	const teamData = await getTeamBySlug(teamSlug);

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
