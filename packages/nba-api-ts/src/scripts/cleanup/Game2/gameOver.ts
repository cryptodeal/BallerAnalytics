import { Game2, serverlessConnect } from '../../../index';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getSeasonGames } from '../../../api/bballRef/seasons';
// import { importBoxScore } from '../../../db/controllers/Game2';
import config from '../../../config';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

interface ISetItem {
	year: number;
	league: string;
}

const fixGameOver = () => {
	serverlessConnect(config.MONGO_URI).then(async () => {
		//	const date = dayjs().subtract(1, 'day');
		const games = await Game2.find({
			date: { $exists: true },
			time: true
		})
			.select('date meta.helpers.bballRef.year meta.helpers.bballRef.boxScoreUrl meta.league')
			.populate('meta.league', 'name');
		/*
      for (const game of await Game2.find({
        date: { $exists: date },
        time: true
      })) {
        console.log(count);
        count--;
        await importBoxScore(game);
      }
    */

		const seasonYears = new Set<string>();
		games.map((g) => {
			seasonYears.add(
				JSON.stringify({ year: g.meta.helpers.bballRef.year, league: g.meta.league.name })
			);
		});
		const pendingFix = seasonYears.values();
		for (const entry of pendingFix) {
			const { year, league } = JSON.parse(entry) as ISetItem;
			const filteredGames = games.filter((g) => g.meta.helpers.bballRef.year === year);
			const gameData = await getSeasonGames(league, year);
			for (let i = 0; i < filteredGames.length; i++) {
				const game = filteredGames[i];
				const gameIdx = gameData.findIndex(
					(g) => g.boxScoreUrl === game.meta.helpers.bballRef.boxScoreUrl
				);
				console.log('db date:', game.date);
				console.log(gameData[gameIdx].date);
				game.date = gameData[gameIdx].date.utc().toDate();
				await game.save();
			}
		}
		console.log(`finished!`);
	});
};

fixGameOver();
