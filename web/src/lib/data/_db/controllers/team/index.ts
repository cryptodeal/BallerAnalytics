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

export type TeamPageGames = {
	regularSeason: PopulatedDocument<
		PopulatedDocument<
			PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
			'home.players.player'
		>,
		'visitor.players.player'
	>[];
	postseason: PopulatedDocument<
		PopulatedDocument<
			PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
			'home.players.player'
		>,
		'visitor.players.player'
	>[];
};

export type TeamPageInitData = {
	team: PopulatedDocument<
		PopulatedDocument<
			PopulatedDocument<Team2Document, `seasons.regularSeason.games`>,
			'seasons.postseason.games'
		>,
		'seasons.roster.players.player'
	>;
	players: Player2StatsObject[];
	games: TeamPageGames;
};

export const getTeamBySlug = (
	slug: string,
	seasonIdx: number,
	season?: number
): Promise<TeamPageInitData> => {
	const query = season
		? { 'infoCommon.slug': slug, seasons: { $elemMatch: { season: season } } }
		: { 'infoCommon.slug': slug };
	return Team2.findOne(query, [
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
					PopulatedDocument<
						PopulatedDocument<Team2Document, `seasons.regularSeason.games`>,
						'seasons.postseason.games'
					>,
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
					const stats =
						playerSznIdx !== -1
							? p.player.seasons[playerSznIdx].regularSeason.stats
							: {
									totals: {
										games: undefined,
										gamesStarted: undefined,
										minutes: undefined,
										fieldGoalsMade: undefined,
										fieldGoalsAttempted: undefined,
										fieldGoalsPct: undefined,
										threePointersMade: undefined,
										threePointersAttempted: undefined,
										threePointersPct: undefined,
										twoPointFGMade: undefined,
										twoPointFGAttempted: undefined,
										twoPointFGPct: undefined,
										effectiveFieldGoalPct: undefined,
										freeThrowsMade: undefined,
										freeThrowsAttempted: undefined,
										freeThrowsPct: undefined,
										offReb: undefined,
										defReb: undefined,
										totalReb: undefined,
										assists: undefined,
										steals: undefined,
										blocks: undefined,
										turnovers: undefined,
										personalFouls: undefined,
										points: undefined
									},
									teamSplits: []
							  };

					const isSplit =
						stats.teamSplits?.findIndex((s) => s.team.toString() === team._id.toString()) === -1
							? false
							: stats.teamSplits?.findIndex((s) => s.team.toString() === team._id.toString());
					if (isSplit) stats.totals = stats.teamSplits[isSplit].totals;
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
						stats: [stats]
					} as unknown as Player2StatsObject;
				});
				const regularSeason = team.seasons[seasonIdx].regularSeason
					.games as unknown as PopulatedDocument<
					PopulatedDocument<
						PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
						'home.players.player'
					>,
					'visitor.players.player'
				>[];
				const postseason = team.seasons[seasonIdx].postseason.games as unknown as PopulatedDocument<
					PopulatedDocument<
						PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
						'home.players.player'
					>,
					'visitor.players.player'
				>[];
				const games = { regularSeason, postseason };

				const result = {
					team,
					players,
					games
				};
				return result;
			}
		);
};

export const getTeamById = (id: string): Promise<Team2Document> => {
	return Team2.findById(id).exec();
};
