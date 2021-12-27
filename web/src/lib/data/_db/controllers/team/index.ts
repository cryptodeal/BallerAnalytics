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
			return teams;
		});
};

export const getTeamBySlug = (slug: string, seasonIdx: number): Promise<null | Team2Document> => {
	return Team2.findOne().getSeasonBySlug(slug, seasonIdx).exec();
};
