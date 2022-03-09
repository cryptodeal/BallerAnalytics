import { getGamesByDate, getMinMaxDates } from '$lib/data/_db/controllers/games';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import type { RequestHandler } from '@sveltejs/kit';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

export const get: RequestHandler = async ({ url }) => {
	const date = url.searchParams.has('date')
		? dayjs(url.searchParams.get('date')).tz()
		: dayjs().tz();
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
