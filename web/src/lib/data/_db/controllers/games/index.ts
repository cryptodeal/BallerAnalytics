import { Game2 } from '@balleranalytics/nba-api-ts';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import type { Game2Object } from '@balleranalytics/nba-api-ts';
import type { DailyGame, DailyGames } from '$lib/data/stores/types';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

export const getTodaysGames = async () => {
	const now = dayjs().tz().hour() < 3 ? dayjs().tz().subtract(3, 'hour') : dayjs().tz();
	const endDate = now.endOf('date').utc().toDate();
	const startDate = now.startOf('date').utc().toDate();
	return Game2.getDailyGames(startDate, endDate).then((games: Game2Object[]) => {
		const parsedGames: DailyGames = {};
		games.map((g) => {
			if (
				!(g.home.team instanceof mongoose.Types.ObjectId) &&
				!(g.visitor.team instanceof mongoose.Types.ObjectId)
			) {
				const parsedGame: DailyGame = {
					date: g.date,
					isOver: g.meta.helpers.isOver,
					clock: g.meta.status?.clock,
					periodValue: g.meta.status?.period,
					displayClock: g.meta.status?.displayClock,
					home: {
						_id: g.home.team._id.toString(),
						infoCommon: g.home.team.infoCommon,
						score: g.home.score
					},
					visitor: {
						_id: g.visitor.team._id.toString(),
						infoCommon: g.visitor.team.infoCommon,
						score: g.visitor.score
					}
				};
				parsedGames[g._id.toString()] = parsedGame;
			}
		});
		return parsedGames;
	});
};
