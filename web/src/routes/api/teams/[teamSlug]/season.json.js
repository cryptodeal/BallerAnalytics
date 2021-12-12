import { getTeamSeason } from '$lib/_db/controllers/team';

export async function get({ params, query }) {
	const { teamSlug } = params;
	const seasonYear = query.get('season');

	const seasonData = await getTeamSeason(teamSlug, seasonYear);

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
