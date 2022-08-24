import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { SeasonList } from '$lib/types';
import type { TeamPageInitData } from '$lib/data/_db/controllers/team';

export const load: PageLoad = async ({ fetch, params, url }) => {
	if (url.searchParams.get('i')) {
		const apiUrl = `/teams/${params.teamSlug}.json?i=${url.searchParams.get('i')}`;
		const res = await fetch(apiUrl);
		if (res.ok) {
			const { team, players, games } = (await res.json()) as TeamPageInitData;
			const seasonIdx = parseInt(url.searchParams.get('i') as string);
			const seasons: SeasonList[] = [];
			team.seasons.map((s) => {
				const { season } = s;
				seasons.push({ season });
			});
			seasons.sort((a, b) => a.season - b.season);
			return {
				team,
				players,
				games,
				seasonIdx,
				seasonYear: team.seasons[seasonIdx].season,
				seasons
			};
		}
		throw error(500, `Could not load ${apiUrl}`);
	} else {
		const apiUrl = `/teams/${params.teamSlug}.json`;
		const res = await fetch(apiUrl);
		if (res.ok) {
			const { team, players, games } = (await res.json()) as TeamPageInitData;
			const seasonIdx = 0;
			const seasons: SeasonList[] = [];
			team.seasons.map((s) => {
				const { season } = s;
				seasons.push({ season });
			});
			seasons.sort((a, b) => a.season - b.season);
			return {
				team,
				players,
				games,
				seasonIdx,
				seasonYear: team.seasons[seasonIdx].season,
				seasons
			};
		}
		throw error(500, `Could not load ${apiUrl}`);
	}
};
