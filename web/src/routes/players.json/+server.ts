import { json } from '@sveltejs/kit';

import { getSeasonPlayers } from '$lib/data/_db/controllers/player';
import type { Player2Document } from '@balleranalytics/nba-api-ts';
import type { RequestHandler } from './$types';

/*
type GetPlayerParams = Record<string, string> & {
	page: string | undefined;
	year: string | undefined;
	name: string | undefined;
};
*/

export type PlayersResponse = {
	players: Player2Document[];
	query: {
		year?: number;
		name?: string;
	};
	seasons: number[];
};
export const GET: RequestHandler = async ({ url }) => {
	const year = url.searchParams.has('year')
		? parseInt(url.searchParams.get('year') as string)
		: 2022;
	const page = url.searchParams.has('page') ? parseInt(url.searchParams.get('page') as string) : 0;
	const name = url.searchParams.has('name') ? url.searchParams.get('name') : undefined;

	const data = name ? await getSeasonPlayers(page, year, name) : await getSeasonPlayers(page, year);

	if (data) {
		const [{ players, query }, { min, max }] = data;
		const seasons: number[] = [];
		for (let i = min; i <= max; i++) seasons.push(i);
		return json({
			players,
			query,
			seasons
		});
	}

	return new Response(undefined, { status: 500 });
};
