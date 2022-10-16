import { getAllTeamsCommonInfo } from '$lib/data/_db/controllers/team';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const teams = await getAllTeamsCommonInfo();

	if (teams) {
		return json({
			teams
		});
	}

	return new Response(undefined, { status: 500 });
};
