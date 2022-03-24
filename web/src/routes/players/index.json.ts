import { getSeasonPlayers } from '$lib/data/_db/controllers/player';
import type { Player2Document } from '@balleranalytics/nba-api-ts';
import type { RequestHandler } from '@sveltejs/kit';

type GetPlayerParams = {
	page: string | undefined;
	year: string | undefined;
};

export type PlayersResponse = {
	players: Player2Document[];
	query: {
		year: number;
	};
	seasons: number[];
};
export const get: RequestHandler<GetPlayerParams, PlayersResponse> = async ({ url }) => {
	const year = url.searchParams.has('year') ? parseInt(url.searchParams.get('year')) : 2022;
	const page = url.searchParams.has('page') ? parseInt(url.searchParams.get('page')) : 0;
	const data = await getSeasonPlayers(page, year);

	if (data) {
		const [{ players, query }, { min, max }] = data;
		const seasons: number[] = [];
		for (let i = min; i <= max; i++) seasons.push(i);
		return {
			body: {
				players,
				query,
				seasons
			}
		};
	}

	return {
		status: 500
	};
};
