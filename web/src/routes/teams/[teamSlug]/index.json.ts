import { getTeamBySlug } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ params, url }) => {
	const { teamSlug } = params;
	const seasonIdx = url.searchParams.has('seasonIdx')
		? parseInt(url.searchParams.get('seasonIdx'))
		: 0;

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
