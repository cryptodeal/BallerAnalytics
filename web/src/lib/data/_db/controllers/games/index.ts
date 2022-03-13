import { Game2 } from '@balleranalytics/nba-api-ts';
import { getBBallRefAbbrev, resolve } from '$lib/functions/helpers';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { Types } from 'mongoose';
import type { Game2Object } from '@balleranalytics/nba-api-ts';
import type { DailyGame, DailyGames } from '$lib/data/stores/types';
import type { Dayjs } from 'dayjs';
import type { BoxScoreData } from '$lib/types';
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
			if (!(g.home.team instanceof Types.ObjectId) && !(g.visitor.team instanceof Types.ObjectId)) {
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

export const getGamesByDate = async (date: Dayjs): Promise<Game2Object[]> => {
	return Game2.find({
		date: { $lte: date.endOf('day').utc().toDate(), $gte: date.startOf('day').utc().toDate() }
	})
		.select('date home visitor meta')
		.populateTeams()
		.exec()
		.then((games) => {
			return games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		});
};

export const getMinMaxYears = async (): Promise<{
	min: Date;
	max: Date;
}> => {
	const [{ min, max }] = await Game2.findMinMaxYears();
	return { min, max };
};

export const getMinMaxDates = async (): Promise<{
	min: Date;
	max: Date;
}> => {
	const minGame = await Game2.find().sort({ date: 1 }).limit(1).select('date').lean().exec();
	const maxGame = await Game2.find().sort({ date: -1 }).limit(1).select('date').lean().exec();
	if (!minGame[0]) throw new Error('Error: could not find minGame');
	if (!maxGame[0]) throw new Error('Error: could not find maxGame');
	return { min: minGame[0].date, max: maxGame[0].date };
};

export const loadBoxScore = (date: string, matchup: string): Promise<BoxScoreData> => {
	const boxScoreUrl = date + '0' + getBBallRefAbbrev(matchup.split('@')[1]);
	return Game2.findByUrl(boxScoreUrl)
		.populateTeams()
		.populatePlayers()
		.lean()
		.exec()
		.then((boxscore: BoxScoreData) => {
			const minSort = (a, b) => {
				const itemA = resolve('stats.totals.minutes', a);
				const itemB = resolve('stats.totals.minutes', b);
				if (itemA && itemB) {
					return itemA < itemB ? 1 : itemA > itemB ? -1 : 0;
				} else if (!itemA && itemB) {
					return 1;
				} else if (itemA && !itemB) {
					return -1;
				} else {
					return 0;
				}
			};
			boxscore.home.players.sort(minSort);
			boxscore.visitor.players.sort(minSort);
			return boxscore;
		});
};
