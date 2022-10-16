import { Team2, type Game2Document } from '@balleranalytics/nba-api-ts';
import type {
	Team2Document,
	Player2StatsObject,
	Player2Object,
	Player2Stats,
	PopulatedDocument,
	Team2Object,
	Player2SeasonPostseasonStatDocument,
	Player2SeasonDocument,
	Team2SeasonRosterPlayer
} from '@balleranalytics/nba-api-ts';
import dayjs from 'dayjs';

export const getAllTeamsCommonInfo = (): Promise<Team2Object[]> => {
	return Team2.getAllTeams().then((teams: Team2[]) => {
		teams.map((t) => t.seasons.sort((a, b) => b.season - a.season));
		return teams;
	});
};

export const loadHelperData = (): Promise<Team2Object[]> => {
	return Team2.getHelperData().then((teams: Team2Object[]) => {
		teams.sort((a, b) => (a.infoCommon.name as any) - (b.infoCommon.name as any));
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
	return Team2.findOne(
		query,
		'infoCommon seasons.season seasons.regularSeason seasons.postseason seasons.roster.players'
	)
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

				team.seasons[seasonIdx].postseason.games.sort((a, b) =>
					dayjs(a.date).isBefore(b.date) ? -1 : 1
				);

				team.seasons[seasonIdx].roster.players.sort((a, b) =>
					a.player.name.full > b.player.name.full
						? 1
						: b.player.name.full > a.player.name.full
						? -1
						: 0
				);
				type PopTeam2SeasonRosterPlayer = Team2SeasonRosterPlayer & {
					player: Player2Object;
				};
				const formatPlayerStats = (
					sznIdx: number,
					seasons: Player2SeasonDocument[],
					rosterData: PopTeam2SeasonRosterPlayer
				): Player2Stats => {
					/* If player was on roster, but didn't play populate totals w undefined */
					const totals = {
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
					} as Player2SeasonPostseasonStatDocument;

					let stats: Player2Stats;
					if (sznIdx !== -1) {
						stats = seasons[sznIdx].regularSeason.stats
							? seasons[sznIdx].regularSeason.stats
							: {
									totals,
									teamSplits: []
							  };
						const isSplit =
							stats?.teamSplits?.findIndex((s) => s.team.toString() === team._id.toString()) === -1
								? false
								: stats?.teamSplits?.findIndex((s) => s.team.toString() === team._id.toString());
						if (isSplit) stats.totals = stats.teamSplits[isSplit].totals;
					} else {
						stats = {
							totals,
							teamSplits: []
						};
					}

					/* set player position, number, and twoWay on stats object */
					const { number, position, twoWay } = rosterData;
					stats.position = position ? position : undefined;
					stats.number = number ? number : undefined;
					stats.twoWay = twoWay ? twoWay : undefined;
					return stats;
				};

				const players = team.seasons[seasonIdx].roster.players.map(({ player }, i) => {
					const playerSznIdx = player.seasons.findIndex((s) => s.year === season);
					const rosterData = team.seasons[seasonIdx].roster.players[
						i
					] as PopTeam2SeasonRosterPlayer;
					return {
						_id: player._id,
						name: player.name,
						birthDate: player.birthDate,
						height: player.height,
						weight: player.weight,
						college: player.college,
						meta: {
							images: {
								headshot: player.meta.images.headshot
							}
						},
						stats: [formatPlayerStats(playerSznIdx, player.seasons, rosterData)]
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
	return Team2.findById(id).exec() as Promise<Team2Document>;
};
