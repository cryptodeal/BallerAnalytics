import { loadHelperData } from '$lib/data/_db/controllers/team';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const teams = await loadHelperData();

	return {
		status: 200,
		body: {
			teams
		}
	};
};
