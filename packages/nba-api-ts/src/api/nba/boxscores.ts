import nba from 'nba';
import fetch from 'cross-fetch';
import type {
	NbaBoxScore,
	NbaBoxScoreData,
	NbaScoreboard,
	NbaScoreboardGame,
	NbaBoxScoreQuery,
	NbaBoxScoreRes,
	BoxScoreTraditional
} from './nba';
import type { Game2Document, PopulatedDocument } from '../../index';
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

const getNbaScoreboard = (date: string): Promise<NbaScoreboardGame[]> => {
	return nba.data.scoreboard(date).then((data: NbaScoreboard) => {
		const { game } = data.sports_content.games;
		return game;
	});
};

const findNbaGameId = async (
	game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
	date: string
): Promise<string | undefined> => {
	const games = await getNbaScoreboard(date);
	for (const scoreBoardGame of games) {
		const { home, visitor } = scoreBoardGame;
		console.log(`nba home abbrev: ${home.abbreviation}`);
		console.log(`nba visitor abbrev: ${visitor.abbreviation}`);
		const { nbaTeamId: homeId } = game.home.team.meta.helpers,
			{ nbaTeamId: visitorId } = game.visitor.team.meta.helpers;

		if (home.id === homeId && visitor.id === visitorId) {
			return scoreBoardGame.id;
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
	const formattedDate = dayjs(game.date).format('YYYYMMDD');
	if (!game.meta.helpers.nbaGameId) {
		const nbaGameId = await findNbaGameId(game, formattedDate);
		if (!nbaGameId) throw Error(`Error: Could not find nba game id for game: ${game._id}`);
		game.meta.helpers.nbaGameId = nbaGameId;
		await game.save();
	}

	return nba.data
		.boxScore(formattedDate, game.meta.helpers.nbaGameId)
		.then((data: NbaBoxScore): NbaBoxScoreData => {
			const { sports_content } = data;
			return sports_content;
		});
};
