import { Team2, type Game2Document } from '@balleranalytics/nba-api-ts';
import type {
	Team2Document,
	Player2StatsObject,
	PopulatedDocument,
	Team2Object
} from '@balleranalytics/nba-api-ts';
import dayjs from 'dayjs';

export const getAllTeamsCommonInfo = (): Promise<Team2Object[]> => {
	return Team2.getAllTeams().then((teams) => {
		teams.map((t) => t.seasons.sort((a, b) => b.season - a.season));
		return teams;
	});
};

export type TeamPageInitData = {
	team: PopulatedDocument<
		PopulatedDocument<Team2Document, `seasons.regularSeason.games`>,
		'seasons.roster.players.player'
	>;
	players: Player2StatsObject[];
	games: PopulatedDocument<
		PopulatedDocument<
			PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
			'home.players.player'
		>,
		'visitor.players.player'
	>[];
};

export const getTeamBySlug = (slug: string, seasonIdx: number): Promise<TeamPageInitData> => {
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
			async (
				team: PopulatedDocument<
					PopulatedDocument<Team2Document, `seasons.regularSeason.games`>,
					'seasons.roster.players.player'
				>
			) => {
				if (!team) throw new Error(`Team with slug ${slug} not found`);
				const { season } = team.seasons[seasonIdx];
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

				const players = team.seasons[seasonIdx].roster.players.map((p) => {
					const playerSznIdx = p.player.seasons.findIndex((s) => s.year === season);
					return {
						_id: p.player._id,
						name: p.player.name,
						birthDate: p.player.birthDate,
						height: p.player.height,
						weight: p.player.weight,
						college: p.player.college,
						meta: {
							images: {
								headshot: p.player.meta.images.headshot
							}
						},
						stats: [p.player.seasons[playerSznIdx].regularSeason.stats]
					} as unknown as Player2StatsObject;
				});
				const games = team.seasons[seasonIdx].regularSeason.games as unknown as PopulatedDocument<
					PopulatedDocument<
						PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
						'home.players.player'
					>,
					'visitor.players.player'
				>[];
				return {
					team,
					players,
					games
				};
			}
		);
};

export const getTeamById = (id: string): Promise<Team2Document> => {
	return Team2.findById(id).exec();
};
