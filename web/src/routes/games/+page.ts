import { error } from '@sveltejs/kit';
import type { PageLoad } from '@sveltejs/kit';
import type { Game2Document, PopulatedDocument } from '@balleranalytics/nba-api-ts';
export const logoModules = import.meta.glob('../../lib/ux/teams/assets/logo-*.svelte', {
	eager: true
});
export const load: PageLoad = async ({ fetch, url }) => {
	let apiUrl = `/games.json`;
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
