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
	let date = dayjs().utc().tz();
	if (url.searchParams.has('date')) {
		const [year, month, day] = url.searchParams.get('date').split('-').map(parseInt);
		const tempDate = date
			.set('year', year)
			.set('month', month - 1)
			.set('date', day);
		date = tempDate;
	}

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
