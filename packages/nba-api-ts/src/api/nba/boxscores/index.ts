import nba from 'nba';
import fetch from 'cross-fetch';
import type {
	NbaBoxScore,
	NbaBoxScoreData,
	IStatsScoreboard,
	IStatsScoreboardGameHeaderItem,
	NbaBoxScoreQuery,
	NbaBoxScoreRes,
	BoxScoreTraditional
} from '../nba';
import type { Game2Document, PopulatedDocument } from '../../../index';
import dayjs from 'dayjs';
const baseUrl = `https://stats.nba.com/stats/`;

const fetchNbaBoxScore = (query: NbaBoxScoreQuery): Promise<BoxScoreTraditional> => {
	const queryStr = new URLSearchParams(
		query as unknown as {
			[key: string]: string;
		}
	);
	return fetch(baseUrl + 'boxscoretraditionalv3?' + queryStr.toString(), {
		method: 'GET',
		headers: {
			Accept: '*/*',
			'Accept-Encoding': 'gzip, deflate, br',
			'Accept-Language': 'en-US',
			Origin: 'https://www.nba.com',
			Referer: 'https://www.nba.com/',
			'User-Agent':
				'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Mobile Safari/537.36'
		}
	})
		.then((res) => res.json())
		.then((data: NbaBoxScoreRes) => {
			const { boxScoreTraditional: boxScorePeriod } = data;
			return boxScorePeriod;
		});
};

const getNbaScoreboard = (gameDate: string): Promise<IStatsScoreboardGameHeaderItem[]> => {
	console.log('made it to getNbaScoreboard');
	return nba.stats
		.scoreboard({ gameDate })
		.then((data: IStatsScoreboard) => {
			const { gameHeader } = data;
			return gameHeader;
		})
		.catch(console.trace);
};

const findNbaGameId = async (
	game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
	date: string
): Promise<string | undefined> => {
	console.log(date);
	const games = await getNbaScoreboard(date);
	//console.log(games);
	for (const scoreBoardGame of games) {
		const { homeTeamId, visitorTeamId } = scoreBoardGame;

		const { nbaTeamId: homeId } = game.home.team.meta.helpers,
			{ nbaTeamId: visitorId } = game.visitor.team.meta.helpers;

		if (`${homeTeamId}` === homeId && `${visitorTeamId}` === visitorId) {
			return scoreBoardGame.gameId;
		}
	}
};

export const getNbaBoxScoreRes = async (GameID: string, period: string) => {
	const query: NbaBoxScoreQuery = {
		GameID,
		LeagueID: '00',
		endRange: '28800',
		endPeriod: period,
		rangeType: '1',
		startPeriod: period,
		startRange: '0'
	};
	return fetchNbaBoxScore(query);
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const parseBoxScoreRes = (data: NbaBoxScoreData) => {};

export const getNbaBoxscore = async (
	game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>
) /*: Promise<NbaBoxScoreData>*/ => {
	const tempDate = dayjs(game.date);
	if (!game.meta.helpers.nbaGameId) {
		const nbaGameId = await findNbaGameId(game, tempDate.format('MM/DD/YYYY'));
		console.log(nbaGameId);
		if (!nbaGameId) throw Error(`Error: Could not find nba game id for game: ${game._id}`);
		game.meta.helpers.nbaGameId = nbaGameId;
		await game.save();
	}

	return nba.data
		.boxScore(tempDate.format('YYYYMMDD'), game.meta.helpers.nbaGameId)
		.then((data: NbaBoxScore): NbaBoxScoreData => {
			const { sports_content } = data;
			return sports_content;
		});
};
