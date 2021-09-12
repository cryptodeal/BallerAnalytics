import { getTeamBySlug } from '$lib/_db/controllers/team';

export async function get({ params }) {
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
}
