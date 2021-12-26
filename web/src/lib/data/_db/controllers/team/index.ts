import { Team2 } from '@balleranalytics/nba-api-ts';
import type { Team2Document } from '@balleranalytics/nba-api-ts';

export const getAllTeamsCommonInfo = (): Promise<Team2Document[]> => {
	return Team2.find({ seasons: { $elemMatch: { season: 2022 } } }, {})
		.select('infoCommon seasons.season')
		.lean()
		.exec()
		.then((teams: Team2Document[]) => {
			teams.sort((a, b) => {
				if (a.infoCommon.name < b.infoCommon.name) {
					return -1;
				}
				if (a.infoCommon.name > b.infoCommon.name) {
					return 1;
				}
				return 0;
			});
			teams.map((t) => {
				t.seasons.sort((a, b) => a.season - b.season);
			});
			return teams;
		});
};

export const getTeamBySlug = async (slug: string, seasonIdx: number): Promise<Team2Document> => {
	const teamData = await Team2.findOne().getSeasonBySlug(slug, seasonIdx);
	if (!teamData) throw Error(`Team not found`);
	return teamData;
};
