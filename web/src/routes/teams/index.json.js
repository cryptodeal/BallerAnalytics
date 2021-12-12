import { getAllTeamsCommonInfo } from '$lib/_db/controllers/team';

export async function get() {
	const teams = await getAllTeamsCommonInfo();

	if (teams) {
		return {
			body: {
				teams
			}
		};
	}

	return {
		status: 500
	};
}
