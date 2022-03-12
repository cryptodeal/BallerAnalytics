import { Team2, type PopulatedDocument } from '@balleranalytics/nba-api-ts';
import type { Team2Document, Team2Object } from '@balleranalytics/nba-api-ts';
import dayjs from 'dayjs';

export const getAllTeamsCommonInfo = (): Promise<Team2Object[]> => {
	return Team2.getAllTeams().then((teams) => {
		teams.map((t) => t.seasons.sort((a, b) => b.season - a.season));
		return teams;
	});
};

export const getTeamBySlug = (
	slug: string,
	seasonIdx: number
): Promise<
	PopulatedDocument<
		PopulatedDocument<Team2Document, `seasons.regularSeason.games`>,
		'seasons.roster.players'
	>
> => {
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
		.then(
			(
				team: PopulatedDocument<
					PopulatedDocument<Team2Document, `seasons.regularSeason.games`>,
					'seasons.roster.players.player'
				>
			) => {
				if (!team) throw new Error(`Team with slug ${slug} not found`);
				team.seasons[seasonIdx].regularSeason.games.sort((a, b) =>
					dayjs(a.date).isBefore(b.date) ? -1 : 1
				);
				team.seasons[seasonIdx].roster.players.sort((a, b) =>
					a.player.name.full > b.player.name.full
						? 1
						: b.player.name.full > a.player.name.full
						? -1
						: 0
				);
				return team;
			}
		);
};

export const getTeamById = (id: string): Promise<Team2Document> => {
	return Team2.findById(id).exec();
};
