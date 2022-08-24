import { getAllTeamsCommonInfo } from '$lib/data/_db/controllers/team';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const teams = await getAllTeamsCommonInfo();
	return {
		teams
	};
};
