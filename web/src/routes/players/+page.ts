import { error } from '@sveltejs/kit';
import type { PageLoad } from '@sveltejs/kit';
import type { PlayersResponse } from './index.json';

export const load: PageLoad = async ({ fetch }) => {
	const url = `/players.json`;
	const res = await fetch(url);

	if (res.ok) {
		const { players, seasons } = (await res.json()) as PlayersResponse;
		return {
			players,
			seasons
		};
	}

	throw error(500, `Could not load ${url}`);
};
