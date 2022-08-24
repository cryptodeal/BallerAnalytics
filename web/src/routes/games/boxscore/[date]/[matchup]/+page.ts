import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
// import type { BoxScoreLoadParams, BoxScoreBody } from '$lib/types';

export const load: PageLoad = async ({ fetch, params }) => {
	const { date, matchup } = params;
	const apiUrl = `/games/boxscore/${date}/${matchup}.json`;
	const res = await fetch(apiUrl);

	if (res.ok) {
		const { boxscore } = await res.json();
		return {
			boxscore
		};
	}

	throw error(500, `Could not load ${apiUrl}`);
};
