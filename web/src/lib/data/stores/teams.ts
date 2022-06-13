import { readable } from 'svelte/store';
import type { Team2Document } from '@balleranalytics/nba-api-ts';

let cachedVa = [];

function fetchTeamData() {
	return fetch('/api/teams').then((res) => {
		if (!res.ok) throw new Error(`Error: !res.ok; ${res.status}`);
		return res.json().then((res) => {
			const { teams } = res;
			cachedVa = teams;
			return teams;
		});
	});
}

export const teams = readable<Team2Document[]>({}, (set) => {
	if (!browser) return;

	fetchTeamData()
		.then(set)
		.catch((err) => console.error(`Failed to fetch`, err));

	let id;
	//query graph api every minute
	if (!cachedVa.length) {
		id = setInterval(() => {
			fetchTeamData()
				.then(set)
				.catch((err) => console.error(`Failed to fetch`, err));
		}, 10000);
	}

	return () => {
		if (id) clearInterval(id);
	};
});
