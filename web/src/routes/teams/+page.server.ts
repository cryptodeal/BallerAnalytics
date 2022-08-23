import { getAllTeamsCommonInfo } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
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
};
