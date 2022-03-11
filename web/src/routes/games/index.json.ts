import { getGamesByDate, getMinMaxDates } from '$lib/data/_db/controllers/games';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import type { RequestHandler } from '@sveltejs/kit';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.tz.setDefault('America/New_York');

export const get: RequestHandler = async ({ url }) => {
	const queryDate = url.searchParams.has('date')
		? dayjs.utc(url.searchParams.get('date'), 'YYYY-MM-DD')
		: dayjs.utc();
	/*if (url.searchParams.has('date')) {
		const [year, month, date] = url.searchParams.get('date').split('-').map(parseInt);
		queryDate.set('year', year);
		queryDate.set('month', month - 1);
		queryDate.set('date', date);
	}*/

	// console.log('server:', queryDate)

	const games = await getGamesByDate(queryDate);
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
