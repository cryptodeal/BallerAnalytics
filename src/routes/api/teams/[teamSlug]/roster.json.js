import { getTeamRoster } from '$lib/_db/controllers/team';

export async function get({ params, query }) {
	const { teamSlug } = params;
	const seasonYear = query.get('season');

	const seasonData = await getTeamRoster(teamSlug, seasonYear);

	if (seasonData) {
		return {
			body: {
				seasonData
			}
		};
	}

	return {
		status: 500
	};
}
