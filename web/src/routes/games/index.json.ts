import { getGamesByDate, getMinMaxDates } from '$lib/data/_db/controllers/games';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import type { RequestHandler } from '@sveltejs/kit';
dayjs.extend(utc);
dayjs.extend(customParseFormat);

export const get: RequestHandler = async ({ url }) => {
	if (url.searchParams.has('date'))
		console.log('server url.searchParams', url.searchParams.get('date'));

	const date = url.searchParams.has('date')
		? dayjs(url.searchParams.get('date'), 'YYYY-MM-DD').utc()
		: dayjs().utc();

	const games = await getGamesByDate(date);
	const { min, max } = await getMinMaxDates();

	if (games && min && max) {
		return {
			body: {
				games,
				min,
				max
			}
		};
	}

	return {
		status: 500
	};
};
