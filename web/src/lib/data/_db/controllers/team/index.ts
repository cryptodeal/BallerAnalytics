import { Team2 } from '@balleranalytics/nba-api-ts';
import type { Team2Document } from '@balleranalytics/nba-api-ts';

export const getAllTeamsCommonInfo = (): Promise<Team2Document[]> => {
	return Team2.find({ seasons: { $elemMatch: { season: 2022 } } })
		.select('infoCommon seasons.season')
		.lean()
		.exec()
		.then((teams: Team2Document[]) => {
			return teams.sort((a, b) => {
				if (a.infoCommon.name < b.infoCommon.name) {
					return -1;
				}
				if (a.infoCommon.name > b.infoCommon.name) {
					return 1;
				}
				return 0;
			});
		});
};

export const getTeamBySlug = (slug: string): Promise<void | Team2Document> => {
	return Team2.findOne(
		{ 'infoCommon.slug': slug },
		'infoCommon seasons.season seasons.regularSeason.games'
	)
		.exec()
		.then((team) => {
			if (!team) throw Error('Team not found!');
			team.seasons.sort((a, b) => {
				return a.season - b.season;
			});
			const i = team.seasons.length - 1;
			return team.populate([
				{
					path: `seasons.${i}.regularSeason.games`,
					select: 'home visitor date time',
					populate: {
						path: 'home.team visitor.team',
						select: 'infoCommon'
					}
				}
			]);
		});
};
