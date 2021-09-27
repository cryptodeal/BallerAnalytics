import { getTeamSchedule } from '$lib/_db/controllers/game';
import { getTeamIdFromSlug } from '$lib/_db/controllers/team';

export async function get({ params, query }) {
	const { teamSlug } = params;
	const seasonYear = query.get('season');
	const { _id } = await getTeamIdFromSlug(teamSlug);
	const schedule = await getTeamSchedule(_id, seasonYear);
	//console.log(schedule)

	if (schedule) {
		return {
			body: {
				schedule
			}
		};
	}

	return {
		status: 500
	};
}
