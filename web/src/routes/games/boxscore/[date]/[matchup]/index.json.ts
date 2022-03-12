import { loadBoxScore } from '$lib/data/_db/controllers/games';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import type { RequestHandler } from '@sveltejs/kit';
import type { BoxScoreLoadParams, BoxScoreBody } from '$lib/types';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.tz.setDefault('America/New_York');

export const get: RequestHandler<BoxScoreLoadParams, BoxScoreBody> = async ({ params }) => {
	const { date, matchup } = params;
	const boxscore = await loadBoxScore(date, matchup);

	if (boxscore) {
		return {
			body: {
				boxscore
			}
		};
	}

	return {
		status: 500
	};
};
