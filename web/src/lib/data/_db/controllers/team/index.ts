import { Game2Document, Team2 } from '@balleranalytics/nba-api-ts';
import type { Team2Document } from '@balleranalytics/nba-api-ts';
import dayjs from 'dayjs';

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

export const getTeamBySlug = (slug: string, seasonIdx: number): Promise<Team2Document> => {
	return Team2.findOne({ 'infoCommon.slug': slug })
		.select(
			`infoCommon seasons.season seasons.regularSeason seasons.postseason seasons.roster.players`
		)
		.populateSznPlayers(seasonIdx)
		.populateSznGames(seasonIdx)
		.lean()
		.exec()
		.then((team) => {
			if (!team) throw new Error(`Team with slug ${slug} not found`);
			team.seasons[seasonIdx].regularSeason.games.sort((a: Game2Document, b: Game2Document) =>
				dayjs(a.date).isBefore(b.date) ? -1 : 1
			);
			return team;
		});
};
