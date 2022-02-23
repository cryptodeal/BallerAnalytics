import { readable } from 'svelte/store';
import { browser } from '$app/env';
import type { DailyGames } from './types';

export const dailyGames = readable<DailyGames>({}, (set) => {
	if (!browser) return null;

	fetchDailyGames()
		.then(set)
		.catch((err) => console.error(`Failed to fetch`, err));

	//query graph api every minute
	const id = setInterval(() => {
		fetchDailyGames()
			.then(set)
			.catch((err) => console.error(`Failed to fetch`, err));
	}, 10000);

	return () => {
		clearInterval(id);
	};
});

const fetchDailyGames = () => {
	return fetch('/api/games/today', {
		headers: {
			Accept: 'application/json'
		}
	}).then((res) => {
		if (!res.ok) {
			throw new Error(`Bad response`);
		}
		return res.json();
	});
};
