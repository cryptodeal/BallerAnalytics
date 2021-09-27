import { getTeamBySlug } from '$lib/_db/controllers/team';
import { getTeamSchedule } from '$lib/_db/controllers/game';

export async function get({ params }) {
	const { teamSlug } = params;

	const teamData = await getTeamBySlug(teamSlug);
	const schedule = await getTeamSchedule(
		teamData._id,
		teamData.seasons[teamData.seasons.length - 1].season
	);

	if (teamData && schedule) {
		return {
			body: {
				teamData,
				schedule
			}
		};
	}

	return {
		status: 500
	};
}
