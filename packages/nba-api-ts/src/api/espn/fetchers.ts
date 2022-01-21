import fetch from 'cross-fetch';

export const loadPlayerData = (playerId: string): Promise<cheerio.Root> => {
	const baseUrl = `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${playerId}/bio`;
	return fetch(baseUrl).then(async (res) => {
		return await res.json();
	});
};

loadPlayerData('3202').then(console.log);
