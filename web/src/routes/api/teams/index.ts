import { loadTeamHelperData } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async () => {
	const teams = await loadTeamHelperData();

	return {
		headers: {
			'content-type': 'application/json'
		},
		body: {
			teams
		}
	};
};
