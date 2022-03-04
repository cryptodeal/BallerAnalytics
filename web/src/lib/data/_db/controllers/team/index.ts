import { Team2 } from '@balleranalytics/nba-api-ts';
import type { Team2Document, Game2Document, Team2Object } from '@balleranalytics/nba-api-ts';
import dayjs from 'dayjs';

export const getAllTeamsCommonInfo = (): Promise<Team2Object[]> => {
	return Team2.getAllTeams().then((teams) => {
		teams.map((t) => t.seasons.sort((a, b) => b.season - a.season));
		return teams;
	});
};

export const getTeamBySlug = (slug: string, seasonIdx: number): Promise<Team2Document> => {
	return Team2.findOne({ 'infoCommon.slug': slug }, [
		'infoCommon',
		'seasons.season',
		'seasons.regularSeason',
		'seasons.postseason',
		'seasons.roster.players'
	])
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

export const getTeamById = (id: string): Promise<Team2Document> => {
	return Team2.findById(id).exec();
};
