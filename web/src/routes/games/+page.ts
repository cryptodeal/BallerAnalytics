import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Game2Document, PopulatedDocument } from '@balleranalytics/nba-api-ts';
export const load: PageLoad = async ({ fetch, url }) => {
	let apiUrl = `/games`;
	if (url.searchParams.has('date')) {
		const date = url.searchParams.get('date');
		apiUrl += `?date=${date}`;
	}

	const res = await fetch(apiUrl);

	if (res.ok) {
		const {
			games,
			min,
			max
		}: {
			games: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>[];
			min: Date;
			max: Date;
		} = await res.json();
		return {
			games,
			min,
			max
		};
	}

	throw error(500, `Could not load ${url}`);
};
