import { Game2, Team2Document } from '@balleranalytics/nba-api-ts';
import { getTeamById } from '../team';
import dayjs from 'dayjs';
import type { Game2Object } from '@balleranalytics/nba-api-ts';
import type { DailyGame, DailyGames } from '$lib/data/stores/types';

export const getTodaysGames = async () => {
	const now = dayjs().hour() < 3 ? dayjs().subtract(3, 'hour') : dayjs();
	const endDate = now.endOf('date').toDate();
	const startDate = now.startOf('date').toDate();
	return Game2.getDailyGames(startDate, endDate).then((games: Game2Object[]) => {
		const promises: Promise<Team2Document>[] = [];
		games.map((g) => {
			const homePromise: Promise<Team2Document> = getTeamById(g.home.team as unknown as string);
			const visitorPromise: Promise<Team2Document> = getTeamById(
				g.visitor.team as unknown as string
			);
			promises.push(homePromise);
			promises.push(visitorPromise);
		});
		return Promise.all(promises).then((teams) => {
			const parsedGames: DailyGames = {};
			for (let i = 0; i < games.length; i++) {
				const tempGame = games[i];
				const parsedGame: DailyGame = {
					isOver: tempGame.meta.helpers.isOver,
					home: {
						_id: tempGame.home.team.toString(),
						infoCommon:
							teams[teams.findIndex(({ _id }) => _id.toString() === tempGame.home.team.toString())]
								.infoCommon,
						score: tempGame.home.score
					},
					visitor: {
						_id: tempGame.visitor.team.toString(),
						infoCommon:
							teams[
								teams.findIndex(({ _id }) => _id.toString() === tempGame.visitor.team.toString())
							].infoCommon,
						score: tempGame.visitor.score
					}
				};
				if (tempGame.meta.status) {
					const { period, displayClock, clock } = tempGame.meta.status;
					if (period) parsedGame.periodValue = period;
					if (displayClock) parsedGame.displayClock = displayClock;
					if (clock) parsedGame.clock = clock;
				}
				parsedGames[tempGame._id.toString()] = parsedGame;
			}
			return parsedGames;
		});
	});
};
