import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Player2Document } from '@balleranalytics/nba-api-ts';
export const load: PageLoad = async ({ fetch, params }) => {
	const url = `/players/${params.playerSlug}.json`;
	const res = await fetch(url);
	if (res.ok) {
		const { playerData: player }: { playerData: Player2Document } = await res.json();
		return {
			player
		};
	}

	throw error(500, `Could not load ${url}`);
};
