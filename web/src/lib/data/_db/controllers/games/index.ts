import { Game2 } from '@balleranalytics/nba-api-ts';
import dayjs from 'dayjs';
import type { Game2Object } from '@balleranalytics/nba-api-ts';
import type { DailyGame, DailyGames } from '$lib/data/stores/types';
import { Types } from 'mongoose';

export const getTodaysGames = async () => {
	const now = dayjs().hour() < 3 ? dayjs().subtract(3, 'hour') : dayjs();
	const endDate = now.endOf('date').toDate();
	const startDate = now.startOf('date').toDate();
	return Game2.getDailyGames(startDate, endDate).then((games: Game2Object[]) => {
		const parsedGames: DailyGames = {};
		games.map((g) => {
			if (!(g.home.team instanceof Types.ObjectId) && !(g.visitor.team instanceof Types.ObjectId)) {
				const parsedGame: DailyGame = {
					isOver: g.meta.helpers.isOver,
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
