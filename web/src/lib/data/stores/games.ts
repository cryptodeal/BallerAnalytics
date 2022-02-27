import { readable } from 'svelte/store';
import { browser } from '$app/env';
import type { DailyGames } from './types';

export const dailyGames = readable<DailyGames>({}, (set) => {
	if (!browser) return;

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
	return fetch('/api/games/today')
		.then((res) => {
			return res.json().then((res) => {
				const { todaysGames } = res;
				return todaysGames;
			});
		})
		.catch((err) => {
			throw new Error(`Error: Failed to fetch dailyGames:\n ${err}`);
		});
};
