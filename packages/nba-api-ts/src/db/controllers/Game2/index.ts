import { Game2, League, Team2, Player2, Official2 } from '../../../index';
import type { Game2Document, PopulatedDocument } from '../../../index';
import { getBoxScore } from '../../../api/bballRef/games';
import {
	SeasonGameItem,
	getSeasons,
	getSeasonGames,
	getPlayoffGames
} from '../../../api/bballRef/seasons';
import {
	addGameToPlayer,
	compareNbaPlayerBday,
	findMatchingBballRefPlayers,
	compareEspnPlayerBday
} from '../Player2';
import { addGameToTeam } from '../Team2';
import { addOrUpdateSeasons } from '../League';
import { addGameToOfficial } from '../Official2';
import dayjs from 'dayjs';
import { getNbaBoxscore } from '../../../api/nba/boxscores';
import type { NbaBoxScoreData } from '../../../api/nba/nba';
import { getPlayerInfo } from '../../../api/nba/player';
import { getPlayerQuery } from '../../../api/bballRef/player';
import {
	findEspnGameId,
	getEspnBoxscore,
	getScheduleEspn,
	getEspnTeamPlayers
} from '../../../api/espn';
import type { ParsedEspnBoxscoreTeamPlayer, ParsedEspnBoxscoreTeam } from '../../../api/espn/types';
import { serverlessConnect } from '../../connect';
import config from '../../../config';
import { Player2Document } from '../../interfaces/mongoose.gen';
export const importBoxScore = async (game: Game2Document) => {
	const populatedGame = await game.populate('home.team visitor.team');
	const boxScore = await getBoxScore(populatedGame);
	if (boxScore) {
		if (boxScore.arena) game.arena = boxScore.arena;
		if (boxScore.city) game.city = boxScore.city;
		if (boxScore.state) game.state = boxScore.state;
		if (boxScore.country) game.country = boxScore.country;
		if (boxScore.officials?.length) {
			boxScore.officials.map((o) =>
				game.officials.addToSet({
					official: o._id
				})
			);
		}

		/** Code below this is a WIP */

		/** Set home boxscore data */
		if (boxScore.home) {
			/** Set home players */
			if (boxScore.home.players) {
				boxScore.home.players.map((p) => {
					const player = {
						player: p._id,
						active: p.active,
						inactive: p.inactive ? p.inactive : false,
						stats: p.stats ? p.stats : {}
					};
					game.home.players.addToSet(player);
				});
			}

			/** Set home player stat leaders */
			if (boxScore.home.leaders) {
				const { leaders } = boxScore.home;
				if (leaders.points) {
					const { leader, statValue } = leaders.points;
					if (statValue) game.home.leaders.points.statValue = statValue;
					if (leader) leader.map((l) => game.home.leaders.points.leader.addToSet(l));
				}
				if (leaders.assists) {
					const { leader, statValue } = leaders.assists;
					if (statValue) game.home.leaders.assists.statValue = statValue;
					if (leader) leader.map((l) => game.home.leaders.assists.leader.addToSet(l));
				}
				if (leaders.rebounds) {
					const { leader, statValue } = leaders.rebounds;
					if (statValue) game.home.leaders.rebounds.statValue = statValue;
					if (leader) leader.map((l) => game.home.leaders.rebounds.leader.addToSet(l));
				}
			}

			/** Set home team stats (basic and advanced) */
			if (boxScore.home.stats) {
				const stats = boxScore.home.stats;
				const { totals, periods } = stats;
				const {
					fieldGoalsMade,
					fieldGoalsAttempted,
					fieldGoalsPct,
					threePointersMade,
					threePointersAttempted,
					threePointersPct,
					freeThrowsMade,
					freeThrowsAttempted,
					freeThrowsPct,
					offReb,
					defReb,
					totalReb,
					assists,
					steals,
					blocks,
					turnovers,
					personalFouls,
					points,
					advanced
				} = totals;
				if (advanced) game.home.stats.totals.advanced = advanced;
				if (fieldGoalsMade) game.home.stats.totals.fieldGoalsMade = fieldGoalsMade;
				if (fieldGoalsAttempted) game.home.stats.totals.fieldGoalsAttempted = fieldGoalsAttempted;
				if (fieldGoalsPct) game.home.stats.totals.fieldGoalsPct = fieldGoalsPct;
				if (threePointersMade) game.home.stats.totals.threePointersMade = threePointersMade;
				if (threePointersAttempted)
					game.home.stats.totals.threePointersAttempted = threePointersAttempted;
				if (threePointersPct) game.home.stats.totals.threePointersPct = threePointersPct;
				if (freeThrowsMade) game.home.stats.totals.freeThrowsMade = freeThrowsMade;
				if (freeThrowsAttempted) game.home.stats.totals.freeThrowsAttempted = freeThrowsAttempted;
				if (freeThrowsPct) game.home.stats.totals.freeThrowsPct = freeThrowsPct;
				if (offReb) game.home.stats.totals.offReb = offReb;
				if (defReb) game.home.stats.totals.defReb = defReb;
				if (totalReb) game.home.stats.totals.totalReb = totalReb;
				if (assists) game.home.stats.totals.assists = assists;
				if (steals) game.home.stats.totals.steals = steals;
				if (blocks) game.home.stats.totals.blocks = blocks;
				if (turnovers) game.home.stats.totals.turnovers = turnovers;
				if (personalFouls) game.home.stats.totals.personalFouls = personalFouls;
				if (points) game.home.stats.totals.points = points;

				/** If stats per period exists, add to home stats */
				if (periods) {
					periods.map((p) => {
						const {
							periodValue,
							periodName,
							fieldGoalsMade,
							fieldGoalsAttempted,
							fieldGoalsPct,
							threePointersMade,
							threePointersAttempted,
							threePointersPct,
							freeThrowsMade,
							freeThrowsAttempted,
							freeThrowsPct,
							offReb,
							defReb,
							totalReb,
							assists,
							steals,
							blocks,
							turnovers,
							personalFouls,
							points
						} = p;
						const periodStats = {
							periodValue,
							periodName,
							fieldGoalsMade,
							fieldGoalsAttempted,
							fieldGoalsPct,
							threePointersMade,
							threePointersAttempted,
							threePointersPct,
							freeThrowsMade,
							freeThrowsAttempted,
							freeThrowsPct,
							offReb,
							defReb,
							totalReb,
							assists,
							steals,
							blocks,
							turnovers,
							personalFouls,
							points
						};
						game.home.stats.periods.slice(0);
						game.home.stats.periods.addToSet(periodStats);
					});
				}
			}
		}

		/** Set visitor boxscore data */
		if (boxScore.visitor) {
			/** Set visitor players */
			if (boxScore.visitor.players) {
				boxScore.visitor.players.map((p) => {
					const player = {
						player: p._id,
						active: p.active,
						inactive: p.inactive ? p.inactive : false,
						stats: p.stats ? p.stats : {}
					};
					game.visitor.players.addToSet(player);
				});
			}

			/** Set visitor player stat leaders */
			if (boxScore.visitor.leaders) {
				const { leaders } = boxScore.visitor;
				if (leaders.points) {
					const { leader, statValue } = leaders.points;
					if (statValue) game.visitor.leaders.points.statValue = statValue;
					if (leader) leader.map((l) => game.visitor.leaders.points.leader.addToSet(l));
				}
				if (leaders.assists) {
					const { leader, statValue } = leaders.assists;
					if (statValue) game.visitor.leaders.assists.statValue = statValue;
					if (leader) leader.map((l) => game.visitor.leaders.assists.leader.addToSet(l));
				}
				if (leaders.rebounds) {
					const { leader, statValue } = leaders.rebounds;
					if (statValue) game.visitor.leaders.rebounds.statValue = statValue;
					if (leader) leader.map((l) => game.visitor.leaders.rebounds.leader.addToSet(l));
				}
			}

			/** Set visitor team stats (basic and advanced) */
			if (boxScore.visitor.stats) {
				const stats = boxScore.visitor.stats;
				const { totals, periods } = stats;
				const {
					fieldGoalsMade,
					fieldGoalsAttempted,
					fieldGoalsPct,
					threePointersMade,
					threePointersAttempted,
					threePointersPct,
					freeThrowsMade,
					freeThrowsAttempted,
					freeThrowsPct,
					offReb,
					defReb,
					totalReb,
					assists,
					steals,
					blocks,
					turnovers,
					personalFouls,
					points,
					advanced
				} = totals;
				if (advanced) game.visitor.stats.totals.advanced = advanced;
				if (fieldGoalsMade) game.visitor.stats.totals.fieldGoalsMade = fieldGoalsMade;
				if (fieldGoalsAttempted)
					game.visitor.stats.totals.fieldGoalsAttempted = fieldGoalsAttempted;
				if (fieldGoalsPct) game.visitor.stats.totals.fieldGoalsPct = fieldGoalsPct;
				if (threePointersMade) game.visitor.stats.totals.threePointersMade = threePointersMade;
				if (threePointersAttempted)
					game.visitor.stats.totals.threePointersAttempted = threePointersAttempted;
				if (threePointersPct) game.visitor.stats.totals.threePointersPct = threePointersPct;
				if (freeThrowsMade) game.visitor.stats.totals.freeThrowsMade = freeThrowsMade;
				if (freeThrowsAttempted)
					game.visitor.stats.totals.freeThrowsAttempted = freeThrowsAttempted;
				if (freeThrowsPct) game.visitor.stats.totals.freeThrowsPct = freeThrowsPct;
				if (offReb) game.visitor.stats.totals.offReb = offReb;
				if (defReb) game.visitor.stats.totals.defReb = defReb;
				if (totalReb) game.visitor.stats.totals.totalReb = totalReb;
				if (assists) game.visitor.stats.totals.assists = assists;
				if (steals) game.visitor.stats.totals.steals = steals;
				if (blocks) game.visitor.stats.totals.blocks = blocks;
				if (turnovers) game.visitor.stats.totals.turnovers = turnovers;
				if (personalFouls) game.visitor.stats.totals.personalFouls = personalFouls;
				if (points) game.visitor.stats.totals.points = points;

				/** If stats per period exists, add to visitor stats */
				if (periods) {
					periods.map((p) => {
						const {
							periodValue,
							periodName,
							fieldGoalsMade,
							fieldGoalsAttempted,
							fieldGoalsPct,
							threePointersMade,
							threePointersAttempted,
							threePointersPct,
							freeThrowsMade,
							freeThrowsAttempted,
							freeThrowsPct,
							offReb,
							defReb,
							totalReb,
							assists,
							steals,
							blocks,
							turnovers,
							personalFouls,
							points
						} = p;
						const periodStats = {
							periodValue,
							periodName,
							fieldGoalsMade,
							fieldGoalsAttempted,
							fieldGoalsPct,
							threePointersMade,
							threePointersAttempted,
							threePointersPct,
							freeThrowsMade,
							freeThrowsAttempted,
							freeThrowsPct,
							offReb,
							defReb,
							totalReb,
							assists,
							steals,
							blocks,
							turnovers,
							personalFouls,
							points
						};
						game.visitor.stats.periods.slice(0);
						game.visitor.stats.periods.addToSet(periodStats);
					});
				}
			}
		}
		return game.save();
	}
	return null;
};

const addGameRefs = async (game: Game2Document, seasonStage: string) => {
	/** Add game._id to regular season games for players */
	for (let i = 0; i < game.home.players.length; i++) {
		const player = await Player2.findById(game.home.players[i].player);
		if (player) await addGameToPlayer(game, player, seasonStage);
	}

	for (let j = 0; j < game.visitor.players.length; j++) {
		const player = await Player2.findById(game.visitor.players[j].player);
		if (player) await addGameToPlayer(game, player, seasonStage);
	}

	/** Add game._id to regular season games for home and visitor teams */
	const homeTeam = await Team2.findById(game.home.team);
	if (homeTeam) await addGameToTeam(game, homeTeam, seasonStage);

	const visitorTeam = await Team2.findById(game.visitor.team);
	if (visitorTeam) await addGameToTeam(game, visitorTeam, seasonStage);

	/** Add game._id to regular season games for officials */
	for (let k = 0; k < game.officials.length; k++) {
		const official = await Official2.findById(game.officials[k]);
		if (official) await addGameToOfficial(game, official, seasonStage);
	}
};

export const addOrFindGame = async (
	game: SeasonGameItem,
	year: number,
	league: string
): Promise<Game2Document> => {
	const result: null | Game2Document = await Game2.findByUrl(game.boxScoreUrl);
	if (result) return result;
	const homeTeam = await Team2.findByName(game.home.name);
	const visitorTeam = await Team2.findByName(game.visitor.name);
	const leagueDoc = await League.findOne({ name: league });
	if (!leagueDoc?._id) throw new Error('League not found');
	if (!homeTeam._id) throw new Error('Home team not found');
	if (!visitorTeam._id) throw new Error('Visitor team not found');
	const gameDoc = new Game2({
		meta: {
			helpers: {
				bballRef: {
					year: year,
					boxScoreUrl: game.boxScoreUrl
				}
			},
			displaySeason: `${year - 1}-${year.toString().slice(-2)}`,
			league: leagueDoc._id
		},
		date: game.date.toISOString(),
		time: game.time,
		home: {
			team: homeTeam._id
		},
		visitor: {
			team: visitorTeam._id
		}
	});

	if (game.home.score) gameDoc.home.score = game.home.score;
	if (game.visitor.score) gameDoc.visitor.score = game.visitor.score;
	return gameDoc.save().then((game: Game2Document) => {
		return game;
	});
};

export const importAllGames = () => {
	return getSeasons()
		.then((seasonList) => {
			const nbaSeasons = seasonList.filter((s) => s.leagueStr === 'NBA');
			const baaSeasons = seasonList.filter((s) => s.leagueStr === 'BAA');
			const abaSeasons = seasonList.filter((s) => s.leagueStr === 'ABA');
			return Promise.all([
				addOrUpdateSeasons('NBA', nbaSeasons),
				addOrUpdateSeasons('BAA', baaSeasons),
				addOrUpdateSeasons('ABA', abaSeasons)
			]);
		})
		.then(async (leagues) => {
			let importedCount = 0;
			for (const league of leagues) {
				const { name } = league;
				for (let i = 0; i < league.seasons.length; i++) {
					const { year } = league.seasons[i];
					const games = await getSeasonGames(name, year);
					const playoffGames = await getPlayoffGames(name, year);
					const regularSeasonGames = games.filter(
						(g) => !playoffGames.findIndex((p) => p.boxScoreUrl === g.boxScoreUrl)
					);

					for (const regularSeasonGame of regularSeasonGames) {
						importedCount++;
						console.log(importedCount);
						const count: number = await Game2.countDocuments({
							'meta.helpers.bballRef.boxScoreUrl': regularSeasonGame.boxScoreUrl,
							'home.stats.totals.points': { $exists: false },
							'visitor.stats.totals.points': { $exists: false }
						});
						if (count !== 0) {
							const game: Game2Document = await addOrFindGame(regularSeasonGame, year, name);
							if (regularSeasonGame.isBoxscore && !game.meta.helpers.bballRef.missingData) {
								await importBoxScore(game).then(async (g) => {
									if (g) {
										await addGameRefs(g, 'regular');
										/** Add game._id to regular season games for league */
										const seasonIndex = league.seasons.findIndex((s) => s.year == year);
										league.seasons[seasonIndex].games.regularSeason.addToSet(g._id);
										await league.save();
									} else {
										throw Error(
											`No resulting boxScore; something is fucked with: "${regularSeasonGame.boxScoreUrl}"`
										);
									}
								});
							} else {
								/** Add game._id to regularSeason games for team, players, officials, coaches */
								await addGameRefs(game, 'regular');
								/** Add game._id to regular season games for league */
								const seasonIndex = league.seasons.findIndex((s) => s.year == year);
								league.seasons[seasonIndex].games.regularSeason.addToSet(game._id);
								await league.save();
							}
						}
					}

					for (const playoffGame of playoffGames) {
						importedCount++;
						console.log(importedCount);
						const count: number = await Game2.countDocuments({
							'meta.helpers.bballRef.boxScoreUrl': playoffGame.boxScoreUrl,
							'home.stats.totals.points': { $exists: false },
							'visitor.stats.totals.points': { $exists: false }
						});
						if (count !== 0) {
							const game: Game2Document = await addOrFindGame(playoffGame, year, name);
							if (playoffGame.isBoxscore && !game.meta.helpers.bballRef.missingData) {
								await importBoxScore(game).then(async (g) => {
									if (g) {
										await addGameRefs(g, 'post');
										/** Add game._id to regular season games for league */
										const seasonIndex = league.seasons.findIndex((s) => s.year == year);
										league.seasons[seasonIndex].games.postSeason.addToSet(g._id);
										await league.save();

										g.postseason = true;
										await g.save();
									} else {
										throw Error(
											`No resulting boxScore; something is fucked with "${playoffGame.boxScoreUrl}"`
										);
									}
								});
							} else {
								/** Add game._id to postseason games for team, players, officials, coaches */
								await addGameRefs(game, 'post');
								/** Add game._id to regular postSeason games for league */
								const seasonIndex = league.seasons.findIndex((s) => s.year == year);
								league.seasons[seasonIndex].games.postSeason.addToSet(game._id);
								await league.save();
							}
						}
					}
				}
			}
		});
};

export const importLatestGames = () => {
	return getSeasons()
		.then((seasonList) => {
			const nbaSeasons = seasonList.filter((s) => s.leagueStr === 'NBA');
			return addOrUpdateSeasons('NBA', nbaSeasons);
		})
		.then(async (league) => {
			let importedCount = 0;
			const { name } = league;
			const i = league.seasons.findIndex((s) => s.year == 2022);
			const { year } = league.seasons[i];
			const games = await getSeasonGames(name, year);
			const playoffGames = (await getPlayoffGames(name, year)).filter(
				(g) => g.date.isBefore(dayjs()) && g.date.isAfter(dayjs().subtract(7, 'day'))
			);
			const regularSeasonGames = games.filter(
				(g) =>
					g.date.isBefore(dayjs()) &&
					g.date.isAfter(dayjs().subtract(7, 'day')) &&
					playoffGames.findIndex((p) => p.boxScoreUrl === g.boxScoreUrl) === -1
			);
			console.log(regularSeasonGames.length);
			for (const regularSeasonGame of regularSeasonGames) {
				importedCount++;
				console.log(importedCount);
				const count: number = await Game2.countDocuments({
					'meta.helpers.bballRef.boxScoreUrl': regularSeasonGame.boxScoreUrl,
					'home.stats.totals.points': { $exists: false },
					'visitor.stats.totals.points': { $exists: false }
				});
				if (count !== 0) {
					const game: Game2Document = await addOrFindGame(regularSeasonGame, year, name);
					if (regularSeasonGame.isBoxscore && !game.meta.helpers.bballRef.missingData) {
						await importBoxScore(game).then(async (g) => {
							if (g) {
								/** Add game._id to regularSeason games for team, players, officials, coaches */
								await addGameRefs(g, 'regular');
								/** Add game._id to regular regularSeason games for league */
								const seasonIndex = league.seasons.findIndex((s) => s.year == year);
								league.seasons[seasonIndex].games.regularSeason.addToSet(g._id);
								await league.save();
								await g.save();
							} else {
								throw Error(
									`No resulting boxScore; something is fucked with "${regularSeasonGame.boxScoreUrl}"`
								);
							}
						});
					} else {
						/** Add game._id to regularSeason games for team, players, officials, coaches */
						await addGameRefs(game, 'regular');
						/** Add game._id to regular season games for league */
						const seasonIndex = league.seasons.findIndex((s) => s.year == year);
						league.seasons[seasonIndex].games.regularSeason.addToSet(game._id);
						await league.save();
					}
				}
			}

			for (const playoffGame of playoffGames) {
				importedCount++;
				console.log(importedCount);
				const count: number = await Game2.countDocuments({
					'meta.helpers.bballRef.boxScoreUrl': playoffGame.boxScoreUrl,
					'home.stats.totals.points': { $exists: false },
					'visitor.stats.totals.points': { $exists: false },
					postseason: true
				});
				if (count !== 0) {
					const game: Game2Document = await addOrFindGame(playoffGame, year, name);
					if (playoffGame.isBoxscore && !game.meta.helpers.bballRef.missingData) {
						await importBoxScore(game).then(async (g) => {
							if (g) {
								/** Add game._id to postseason games for team, players, officials, coaches */
								await addGameRefs(g, 'post');
								/** Add game._id to regular postSeason games for league */
								const seasonIndex = league.seasons.findIndex((s) => s.year == year);
								league.seasons[seasonIndex].games.postSeason.addToSet(g._id);
								await league.save();

								g.postseason = true;
								await g.save();
							} else {
								throw Error(
									`No resulting boxScore; something is fucked with "${playoffGame.boxScoreUrl}"`
								);
							}
						});
					} else {
						/** Add game._id to postseason games for team, players, officials, coaches */
						await addGameRefs(game, 'post');
						/** Add game._id to regular postSeason games for league */
						const seasonIndex = league.seasons.findIndex((s) => s.year == year);
						league.seasons[seasonIndex].games.postSeason.addToSet(game._id);
						await league.save();
					}
				}
			}
		});
};

export const importGamesLastWeek = async () => {
	await importLatestGames().then(() => console.log('Completed import games last 7 days'));
};

const storeNbaData = async (
	game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
	data: NbaBoxScoreData
) => {
	/* store data for boxscore game totals */
	const { game: dataGame } = data;
	if (dataGame.period_time.game_status === '3') game.meta.helpers.isOver = true;
	if (!game.city) game.city = dataGame.city;
	if (!game.state) game.state = dataGame.state;
	if (!game.arena) game.arena = dataGame.arena;
	if (!game.country) game.country = dataGame.country;
	if (!game.attendance && Number.isNaN(parseInt(dataGame.attendance))) {
		game.attendance = parseInt(dataGame.attendance);
	}
	for (const official of dataGame.officials) {
		const fullName = `${official.first_name} ${official.last_name}`;
		const parsedName = fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
			nameArray = [fullName, parsedName],
			officialDocument = await Official2.findByNameOrNbaId(nameArray, official.person_id);

		if (officialDocument) {
			if (!officialDocument.meta.helpers.nbaOfficialId) {
				officialDocument.meta.helpers.nbaOfficialId = official.person_id;
				await officialDocument.save();
			}
			game.officials.addToSet({
				official: officialDocument._id,
				jersey_number: official.jersey_number
			});
			/** TODO: MAKE meta.helpers.bballRef.officialUrl OPTIONAL
			 * IF !meta.helpers.bballRef.officialUrl USE NBA OFFICIAL ID TO GET DATA
			 */
		}
	}

	for (const homePlayer of dataGame.home.players.player) {
		/** Find player by name or nba playerId or name */
		const fullName = `${homePlayer.first_name} ${homePlayer.last_name}`,
			parsedName = fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
			nameArray = [fullName, parsedName];

		let playerDocument = await Player2.findByNameOrNbaId(nameArray, homePlayer.person_id);
		if (!playerDocument) {
			const playerInfo = await getPlayerInfo(homePlayer.person_id);
			const playersQuery = await getPlayerQuery(playerInfo.commonPlayerInfo[0].displayFirstLast);
			const players = await findMatchingBballRefPlayers(playersQuery);
			playerDocument = await compareNbaPlayerBday(playerInfo, players);
		}

		if (!playerDocument.meta.helpers.nbaPlayerId) {
			if (!Number.isNaN(parseInt(homePlayer.person_id))) {
				playerDocument.meta.helpers.nbaPlayerId = parseInt(homePlayer.person_id);
				await playerDocument.save();
			}
		}
		const playerIdx = game.home.players.findIndex((p) => p.player == playerDocument._id);
		if (playerIdx === -1) {
			const playerData = {
				player: playerDocument._id,
				jerseyNumber: homePlayer.jersey_number,
				positionFull: homePlayer.position_full,
				positionShort: homePlayer.position_short,
				active:
					!Number.isNaN(parseInt(homePlayer.minutes)) || !Number.isNaN(parseInt(homePlayer.seconds))
						? true
						: false,
				inactive: false,
				stats: {
					totals: {
						minutes: Number.isNaN(parseInt(homePlayer.minutes))
							? null
							: parseInt(homePlayer.minutes),
						seconds: Number.isNaN(parseInt(homePlayer.seconds))
							? null
							: parseInt(homePlayer.seconds),
						fieldGoalsMade: Number.isNaN(parseInt(homePlayer.field_goals_made))
							? null
							: parseInt(homePlayer.field_goals_made),
						fieldGoalsAttempted: Number.isNaN(parseInt(homePlayer.field_goals_attempted))
							? null
							: parseInt(homePlayer.field_goals_attempted),
						fieldGoalsPct:
							homePlayer.field_goals_attempted === '0' && homePlayer.field_goals_made === '0'
								? null
								: parseInt(homePlayer.field_goals_made) /
								  parseInt(homePlayer.field_goals_attempted),
						threePointersMade: Number.isNaN(parseInt(homePlayer.three_pointers_made))
							? null
							: parseInt(homePlayer.three_pointers_made),
						threePointersAttempted: Number.isNaN(parseInt(homePlayer.three_pointers_attempted))
							? null
							: parseInt(homePlayer.three_pointers_attempted),
						threePointersPct:
							homePlayer.three_pointers_attempted === '0' && homePlayer.three_pointers_made === '0'
								? null
								: parseInt(homePlayer.three_pointers_made) /
								  parseInt(homePlayer.three_pointers_attempted),
						freeThrowsMade: Number.isNaN(parseInt(homePlayer.free_throws_made))
							? null
							: parseInt(homePlayer.free_throws_made),
						freeThrowsAttempted: Number.isNaN(parseInt(homePlayer.free_throws_attempted))
							? null
							: parseInt(homePlayer.free_throws_attempted),
						freeThrowsPct:
							homePlayer.free_throws_attempted === '0' && homePlayer.free_throws_made === '0'
								? null
								: parseInt(homePlayer.free_throws_made) /
								  parseInt(homePlayer.free_throws_attempted),
						offReb: Number.isNaN(parseInt(homePlayer.rebounds_offensive))
							? null
							: parseInt(homePlayer.rebounds_offensive),
						defReb: Number.isNaN(parseInt(homePlayer.rebounds_defensive))
							? null
							: parseInt(homePlayer.rebounds_defensive),
						totalReb: Number.isNaN(
							parseInt(homePlayer.rebounds_offensive) + parseInt(homePlayer.rebounds_defensive)
						)
							? null
							: parseInt(homePlayer.rebounds_offensive) + parseInt(homePlayer.rebounds_defensive),
						assists: Number.isNaN(parseInt(homePlayer.assists))
							? null
							: parseInt(homePlayer.assists),
						steals: Number.isNaN(parseInt(homePlayer.steals)) ? null : parseInt(homePlayer.steals),
						blocks: Number.isNaN(parseInt(homePlayer.blocks)) ? null : parseInt(homePlayer.blocks),
						turnovers: Number.isNaN(parseInt(homePlayer.turnovers))
							? null
							: parseInt(homePlayer.turnovers),
						personalFouls: Number.isNaN(parseInt(homePlayer.fouls))
							? null
							: parseInt(homePlayer.fouls),
						points: Number.isNaN(parseInt(homePlayer.points)) ? null : parseInt(homePlayer.points),
						plusMinus: Number.isNaN(parseInt(homePlayer.plus_minus))
							? null
							: parseInt(homePlayer.plus_minus)
					}
				}
			};
			playerData.inactive = playerData.active == true ? false : true;
			game.home.players.addToSet(playerData);
		} else {
			game.home.players[playerIdx].jerseyNumber = homePlayer.jersey_number;
			game.home.players[playerIdx].positionFull = homePlayer.position_full;
			game.home.players[playerIdx].positionShort = homePlayer.position_short;
			game.home.players[playerIdx].active =
				!Number.isNaN(parseInt(homePlayer.minutes)) || !Number.isNaN(parseInt(homePlayer.seconds))
					? true
					: false;

			game.home.players[playerIdx].stats.totals.minutes = Number.isNaN(parseInt(homePlayer.minutes))
				? undefined
				: parseInt(homePlayer.minutes);
			game.home.players[playerIdx].stats.totals.seconds = Number.isNaN(parseInt(homePlayer.seconds))
				? undefined
				: parseInt(homePlayer.seconds);

			game.home.players[playerIdx].stats.totals.fieldGoalsMade = Number.isNaN(
				parseInt(homePlayer.field_goals_made)
			)
				? undefined
				: parseInt(homePlayer.field_goals_made);

			game.home.players[playerIdx].stats.totals.fieldGoalsAttempted = Number.isNaN(
				parseInt(homePlayer.field_goals_attempted)
			)
				? undefined
				: parseInt(homePlayer.field_goals_attempted);

			game.home.players[playerIdx].stats.totals.fieldGoalsPct =
				homePlayer.field_goals_attempted === '0' && homePlayer.field_goals_made === '0'
					? undefined
					: parseInt(homePlayer.field_goals_made) / parseInt(homePlayer.field_goals_attempted);

			game.home.players[playerIdx].stats.totals.threePointersMade = Number.isNaN(
				parseInt(homePlayer.three_pointers_made)
			)
				? undefined
				: parseInt(homePlayer.three_pointers_made);

			game.home.players[playerIdx].stats.totals.threePointersAttempted = Number.isNaN(
				parseInt(homePlayer.three_pointers_attempted)
			)
				? undefined
				: parseInt(homePlayer.three_pointers_attempted);

			game.home.players[playerIdx].stats.totals.threePointersPct =
				homePlayer.three_pointers_attempted === '0' && homePlayer.three_pointers_made === '0'
					? undefined
					: parseInt(homePlayer.three_pointers_made) /
					  parseInt(homePlayer.three_pointers_attempted);

			game.home.players[playerIdx].stats.totals.freeThrowsMade = Number.isNaN(
				parseInt(homePlayer.free_throws_made)
			)
				? undefined
				: parseInt(homePlayer.free_throws_made);

			game.home.players[playerIdx].stats.totals.freeThrowsAttempted = Number.isNaN(
				parseInt(homePlayer.free_throws_attempted)
			)
				? undefined
				: parseInt(homePlayer.free_throws_attempted);

			game.home.players[playerIdx].stats.totals.freeThrowsPct =
				homePlayer.free_throws_attempted === '0' && homePlayer.free_throws_made === '0'
					? undefined
					: parseInt(homePlayer.free_throws_made) / parseInt(homePlayer.free_throws_attempted);

			game.home.players[playerIdx].stats.totals.offReb = Number.isNaN(
				parseInt(homePlayer.rebounds_offensive)
			)
				? undefined
				: parseInt(homePlayer.rebounds_offensive);

			game.home.players[playerIdx].stats.totals.defReb = Number.isNaN(
				parseInt(homePlayer.rebounds_defensive)
			)
				? undefined
				: parseInt(homePlayer.rebounds_defensive);

			game.home.players[playerIdx].stats.totals.totalReb = Number.isNaN(
				parseInt(homePlayer.rebounds_offensive) + parseInt(homePlayer.rebounds_defensive)
			)
				? undefined
				: parseInt(homePlayer.rebounds_defensive) + parseInt(homePlayer.rebounds_offensive);

			game.home.players[playerIdx].stats.totals.assists = Number.isNaN(parseInt(homePlayer.assists))
				? undefined
				: parseInt(homePlayer.assists);

			game.home.players[playerIdx].stats.totals.steals = Number.isNaN(parseInt(homePlayer.steals))
				? undefined
				: parseInt(homePlayer.steals);

			game.home.players[playerIdx].stats.totals.blocks = Number.isNaN(parseInt(homePlayer.blocks))
				? undefined
				: parseInt(homePlayer.blocks);

			game.home.players[playerIdx].stats.totals.turnovers = Number.isNaN(
				parseInt(homePlayer.turnovers)
			)
				? undefined
				: parseInt(homePlayer.turnovers);

			game.home.players[playerIdx].stats.totals.personalFouls = Number.isNaN(
				parseInt(homePlayer.fouls)
			)
				? undefined
				: parseInt(homePlayer.fouls);

			game.home.players[playerIdx].stats.totals.points = Number.isNaN(parseInt(homePlayer.points))
				? undefined
				: parseInt(homePlayer.points);

			game.home.players[playerIdx].stats.totals.plusMinus = Number.isNaN(
				parseInt(homePlayer.plus_minus)
			)
				? undefined
				: parseInt(homePlayer.plus_minus);

			game.home.players[playerIdx].inactive =
				game.home.players[playerIdx].active == true ? false : true;
		}
	}

	for (const visitorPlayer of dataGame.visitor.players.player) {
		/** Find player by name or nba playerId or name */
		const fullName = `${visitorPlayer.first_name} ${visitorPlayer.last_name}`,
			parsedName = fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
			nameArray = [fullName, parsedName];

		let playerDocument = await Player2.findByNameOrNbaId(nameArray, visitorPlayer.person_id);
		if (!playerDocument) {
			const playerInfo = await getPlayerInfo(visitorPlayer.person_id);
			const playersQuery = await getPlayerQuery(playerInfo.commonPlayerInfo[0].displayFirstLast);
			const players = await findMatchingBballRefPlayers(playersQuery);
			playerDocument = await compareNbaPlayerBday(playerInfo, players);
		}

		if (!playerDocument.meta.helpers.nbaPlayerId) {
			if (!Number.isNaN(parseInt(visitorPlayer.person_id))) {
				playerDocument.meta.helpers.nbaPlayerId = parseInt(visitorPlayer.person_id);
				await playerDocument.save();
			}
		}
		const playerIdx = game.visitor.players.findIndex((p) => p.player == playerDocument._id);
		if (playerIdx === -1) {
			const playerData = {
				player: playerDocument._id,
				jerseyNumber: visitorPlayer.jersey_number,
				positionFull: visitorPlayer.position_full,
				positionShort: visitorPlayer.position_short,
				active:
					!Number.isNaN(parseInt(visitorPlayer.minutes)) ||
					!Number.isNaN(parseInt(visitorPlayer.seconds))
						? true
						: false,
				inactive: false,
				stats: {
					totals: {
						minutes: Number.isNaN(parseInt(visitorPlayer.minutes))
							? null
							: parseInt(visitorPlayer.minutes),
						seconds: Number.isNaN(parseInt(visitorPlayer.seconds))
							? null
							: parseInt(visitorPlayer.seconds),
						fieldGoalsMade: Number.isNaN(parseInt(visitorPlayer.field_goals_made))
							? null
							: parseInt(visitorPlayer.field_goals_made),
						fieldGoalsAttempted: Number.isNaN(parseInt(visitorPlayer.field_goals_attempted))
							? null
							: parseInt(visitorPlayer.field_goals_attempted),
						fieldGoalsPct:
							visitorPlayer.field_goals_attempted === '0' && visitorPlayer.field_goals_made === '0'
								? null
								: parseInt(visitorPlayer.field_goals_made) /
								  parseInt(visitorPlayer.field_goals_attempted),
						threePointersMade: Number.isNaN(parseInt(visitorPlayer.three_pointers_made))
							? null
							: parseInt(visitorPlayer.three_pointers_made),
						threePointersAttempted: Number.isNaN(parseInt(visitorPlayer.three_pointers_attempted))
							? null
							: parseInt(visitorPlayer.three_pointers_attempted),
						threePointersPct:
							visitorPlayer.three_pointers_attempted === '0' &&
							visitorPlayer.three_pointers_made === '0'
								? null
								: parseInt(visitorPlayer.three_pointers_made) /
								  parseInt(visitorPlayer.three_pointers_attempted),
						freeThrowsMade: Number.isNaN(parseInt(visitorPlayer.free_throws_made))
							? null
							: parseInt(visitorPlayer.free_throws_made),
						freeThrowsAttempted: Number.isNaN(parseInt(visitorPlayer.free_throws_attempted))
							? null
							: parseInt(visitorPlayer.free_throws_attempted),
						freeThrowsPct:
							visitorPlayer.free_throws_attempted === '0' && visitorPlayer.free_throws_made === '0'
								? null
								: parseInt(visitorPlayer.free_throws_made) /
								  parseInt(visitorPlayer.free_throws_attempted),
						offReb: Number.isNaN(parseInt(visitorPlayer.rebounds_offensive))
							? null
							: parseInt(visitorPlayer.rebounds_offensive),
						defReb: Number.isNaN(parseInt(visitorPlayer.rebounds_defensive))
							? null
							: parseInt(visitorPlayer.rebounds_defensive),
						totalReb: Number.isNaN(
							parseInt(visitorPlayer.rebounds_offensive) +
								parseInt(visitorPlayer.rebounds_defensive)
						)
							? null
							: parseInt(visitorPlayer.rebounds_offensive) +
							  parseInt(visitorPlayer.rebounds_defensive),
						assists: Number.isNaN(parseInt(visitorPlayer.assists))
							? null
							: parseInt(visitorPlayer.assists),
						steals: Number.isNaN(parseInt(visitorPlayer.steals))
							? null
							: parseInt(visitorPlayer.steals),
						blocks: Number.isNaN(parseInt(visitorPlayer.blocks))
							? null
							: parseInt(visitorPlayer.blocks),
						turnovers: Number.isNaN(parseInt(visitorPlayer.turnovers))
							? null
							: parseInt(visitorPlayer.turnovers),
						personalFouls: Number.isNaN(parseInt(visitorPlayer.fouls))
							? null
							: parseInt(visitorPlayer.fouls),
						points: Number.isNaN(parseInt(visitorPlayer.points))
							? null
							: parseInt(visitorPlayer.points),
						plusMinus: Number.isNaN(parseInt(visitorPlayer.plus_minus))
							? null
							: parseInt(visitorPlayer.plus_minus)
					}
				}
			};
			playerData.inactive = playerData.active == true ? false : true;
			game.visitor.players.addToSet(playerData);
		} else {
			game.visitor.players[playerIdx].jerseyNumber = visitorPlayer.jersey_number;
			game.visitor.players[playerIdx].positionFull = visitorPlayer.position_full;
			game.visitor.players[playerIdx].positionShort = visitorPlayer.position_short;
			game.visitor.players[playerIdx].active =
				!Number.isNaN(parseInt(visitorPlayer.minutes)) ||
				!Number.isNaN(parseInt(visitorPlayer.seconds))
					? true
					: false;

			game.visitor.players[playerIdx].stats.totals.minutes = Number.isNaN(
				parseInt(visitorPlayer.minutes)
			)
				? undefined
				: parseInt(visitorPlayer.minutes);
			game.visitor.players[playerIdx].stats.totals.seconds = Number.isNaN(
				parseInt(visitorPlayer.seconds)
			)
				? undefined
				: parseInt(visitorPlayer.seconds);

			game.visitor.players[playerIdx].stats.totals.fieldGoalsMade = Number.isNaN(
				parseInt(visitorPlayer.field_goals_made)
			)
				? undefined
				: parseInt(visitorPlayer.field_goals_made);

			game.visitor.players[playerIdx].stats.totals.fieldGoalsAttempted = Number.isNaN(
				parseInt(visitorPlayer.field_goals_attempted)
			)
				? undefined
				: parseInt(visitorPlayer.field_goals_attempted);

			game.visitor.players[playerIdx].stats.totals.fieldGoalsPct =
				visitorPlayer.field_goals_attempted === '0' && visitorPlayer.field_goals_made === '0'
					? undefined
					: parseInt(visitorPlayer.field_goals_made) /
					  parseInt(visitorPlayer.field_goals_attempted);

			game.visitor.players[playerIdx].stats.totals.threePointersMade = Number.isNaN(
				parseInt(visitorPlayer.three_pointers_made)
			)
				? undefined
				: parseInt(visitorPlayer.three_pointers_made);

			game.visitor.players[playerIdx].stats.totals.threePointersAttempted = Number.isNaN(
				parseInt(visitorPlayer.three_pointers_attempted)
			)
				? undefined
				: parseInt(visitorPlayer.three_pointers_attempted);

			game.visitor.players[playerIdx].stats.totals.threePointersPct =
				visitorPlayer.three_pointers_attempted === '0' && visitorPlayer.three_pointers_made === '0'
					? undefined
					: parseInt(visitorPlayer.three_pointers_made) /
					  parseInt(visitorPlayer.three_pointers_attempted);

			game.visitor.players[playerIdx].stats.totals.freeThrowsMade = Number.isNaN(
				parseInt(visitorPlayer.free_throws_made)
			)
				? undefined
				: parseInt(visitorPlayer.free_throws_made);

			game.visitor.players[playerIdx].stats.totals.freeThrowsAttempted = Number.isNaN(
				parseInt(visitorPlayer.free_throws_attempted)
			)
				? undefined
				: parseInt(visitorPlayer.free_throws_attempted);

			game.visitor.players[playerIdx].stats.totals.freeThrowsPct =
				visitorPlayer.free_throws_attempted === '0' && visitorPlayer.free_throws_made === '0'
					? undefined
					: parseInt(visitorPlayer.free_throws_made) /
					  parseInt(visitorPlayer.free_throws_attempted);

			game.visitor.players[playerIdx].stats.totals.offReb = Number.isNaN(
				parseInt(visitorPlayer.rebounds_offensive)
			)
				? undefined
				: parseInt(visitorPlayer.rebounds_offensive);

			game.visitor.players[playerIdx].stats.totals.defReb = Number.isNaN(
				parseInt(visitorPlayer.rebounds_defensive)
			)
				? undefined
				: parseInt(visitorPlayer.rebounds_defensive);

			game.visitor.players[playerIdx].stats.totals.totalReb = Number.isNaN(
				parseInt(visitorPlayer.rebounds_offensive) + parseInt(visitorPlayer.rebounds_defensive)
			)
				? undefined
				: parseInt(visitorPlayer.rebounds_defensive) + parseInt(visitorPlayer.rebounds_offensive);

			game.visitor.players[playerIdx].stats.totals.assists = Number.isNaN(
				parseInt(visitorPlayer.assists)
			)
				? undefined
				: parseInt(visitorPlayer.assists);

			game.visitor.players[playerIdx].stats.totals.steals = Number.isNaN(
				parseInt(visitorPlayer.steals)
			)
				? undefined
				: parseInt(visitorPlayer.steals);

			game.visitor.players[playerIdx].stats.totals.blocks = Number.isNaN(
				parseInt(visitorPlayer.blocks)
			)
				? undefined
				: parseInt(visitorPlayer.blocks);

			game.visitor.players[playerIdx].stats.totals.turnovers = Number.isNaN(
				parseInt(visitorPlayer.turnovers)
			)
				? undefined
				: parseInt(visitorPlayer.turnovers);

			game.visitor.players[playerIdx].stats.totals.personalFouls = Number.isNaN(
				parseInt(visitorPlayer.fouls)
			)
				? undefined
				: parseInt(visitorPlayer.fouls);

			game.visitor.players[playerIdx].stats.totals.points = Number.isNaN(
				parseInt(visitorPlayer.points)
			)
				? undefined
				: parseInt(visitorPlayer.points);

			game.visitor.players[playerIdx].stats.totals.plusMinus = Number.isNaN(
				parseInt(visitorPlayer.plus_minus)
			)
				? undefined
				: parseInt(visitorPlayer.plus_minus);

			game.visitor.players[playerIdx].inactive =
				game.visitor.players[playerIdx].active == true ? false : true;
		}
	}

	/* Add home team stat totals to game */
	if (!Number.isNaN(parseInt(dataGame.home.stats.points)))
		game.home.stats.totals.points = parseInt(dataGame.home.stats.points);

	if (!Number.isNaN(parseInt(dataGame.home.stats.field_goals_made)))
		game.home.stats.totals.fieldGoalsMade = parseInt(dataGame.home.stats.field_goals_made);

	if (!Number.isNaN(parseInt(dataGame.home.stats.field_goals_attempted)))
		game.home.stats.totals.fieldGoalsAttempted = parseInt(
			dataGame.home.stats.field_goals_attempted
		);

	if (
		!Number.isNaN(
			parseInt(dataGame.home.stats.field_goals_made) && dataGame.home.stats.field_goals_made !== '0'
		) &&
		parseInt(dataGame.home.stats.field_goals_attempted) &&
		dataGame.home.stats.field_goals_attempted !== '0'
	)
		game.home.stats.totals.fieldGoalsPct =
			parseInt(dataGame.home.stats.field_goals_made) /
			parseInt(dataGame.home.stats.field_goals_attempted);

	if (!Number.isNaN(parseInt(dataGame.home.stats.free_throws_made)))
		game.home.stats.totals.freeThrowsMade = parseInt(dataGame.home.stats.free_throws_made);

	if (!Number.isNaN(parseInt(dataGame.home.stats.free_throws_attempted)))
		game.home.stats.totals.freeThrowsAttempted = parseInt(
			dataGame.home.stats.free_throws_attempted
		);

	if (
		!Number.isNaN(
			parseInt(dataGame.home.stats.free_throws_made) && dataGame.home.stats.free_throws_made !== '0'
		) &&
		parseInt(dataGame.home.stats.free_throws_attempted) &&
		dataGame.home.stats.free_throws_attempted !== '0'
	)
		game.home.stats.totals.freeThrowsPct =
			parseInt(dataGame.home.stats.free_throws_made) /
			parseInt(dataGame.home.stats.free_throws_attempted);

	if (!Number.isNaN(parseInt(dataGame.home.stats.three_pointers_made)))
		game.home.stats.totals.threePointersMade = parseInt(dataGame.home.stats.three_pointers_made);

	if (!Number.isNaN(parseInt(dataGame.home.stats.three_pointers_attempted)))
		game.home.stats.totals.threePointersAttempted = parseInt(
			dataGame.home.stats.three_pointers_attempted
		);

	if (
		!Number.isNaN(
			parseInt(dataGame.home.stats.three_pointers_made) &&
				dataGame.home.stats.three_pointers_made !== '0'
		) &&
		parseInt(dataGame.home.stats.three_pointers_attempted) &&
		dataGame.home.stats.three_pointers_attempted !== '0'
	)
		game.home.stats.totals.threePointersPct =
			parseInt(dataGame.home.stats.three_pointers_made) /
			parseInt(dataGame.home.stats.three_pointers_attempted);

	if (!Number.isNaN(parseInt(dataGame.home.stats.rebounds_offensive)))
		game.home.stats.totals.offReb = parseInt(dataGame.home.stats.rebounds_offensive);

	if (!Number.isNaN(parseInt(dataGame.home.stats.rebounds_defensive)))
		game.home.stats.totals.defReb = parseInt(dataGame.home.stats.rebounds_defensive);

	if (!Number.isNaN(parseInt(dataGame.home.stats.assists)))
		game.home.stats.totals.assists = parseInt(dataGame.home.stats.assists);

	if (!Number.isNaN(parseInt(dataGame.home.stats.fouls)))
		game.home.stats.totals.personalFouls = parseInt(dataGame.home.stats.fouls);

	if (!Number.isNaN(parseInt(dataGame.home.stats.team_fouls)))
		game.home.stats.totals.fouls.team = parseInt(dataGame.home.stats.team_fouls);

	if (!Number.isNaN(parseInt(dataGame.home.stats.technical_fouls)))
		game.home.stats.totals.fouls.technical = parseInt(dataGame.home.stats.technical_fouls);

	if (!Number.isNaN(parseInt(dataGame.home.stats.steals)))
		game.home.stats.totals.steals = parseInt(dataGame.home.stats.steals);

	if (!Number.isNaN(parseInt(dataGame.home.stats.turnovers)))
		game.home.stats.totals.turnovers = parseInt(dataGame.home.stats.turnovers);

	if (!Number.isNaN(parseInt(dataGame.home.stats.blocks)))
		game.home.stats.totals.blocks = parseInt(dataGame.home.stats.blocks);

	/** TODO: Store # of short and long timeouts remaining for home team */

	/* Add visitor team stat totals to game */
	if (!Number.isNaN(parseInt(dataGame.visitor.stats.points)))
		game.visitor.stats.totals.points = parseInt(dataGame.visitor.stats.points);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.field_goals_made)))
		game.visitor.stats.totals.fieldGoalsMade = parseInt(dataGame.visitor.stats.field_goals_made);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.field_goals_attempted)))
		game.visitor.stats.totals.fieldGoalsAttempted = parseInt(
			dataGame.visitor.stats.field_goals_attempted
		);

	if (
		!Number.isNaN(
			parseInt(dataGame.visitor.stats.field_goals_made) &&
				dataGame.visitor.stats.field_goals_made !== '0'
		) &&
		parseInt(dataGame.visitor.stats.field_goals_attempted) &&
		dataGame.visitor.stats.field_goals_attempted !== '0'
	)
		game.visitor.stats.totals.fieldGoalsPct =
			parseInt(dataGame.visitor.stats.field_goals_made) /
			parseInt(dataGame.visitor.stats.field_goals_attempted);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.free_throws_made)))
		game.visitor.stats.totals.freeThrowsMade = parseInt(dataGame.visitor.stats.free_throws_made);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.free_throws_attempted)))
		game.visitor.stats.totals.freeThrowsAttempted = parseInt(
			dataGame.visitor.stats.free_throws_attempted
		);

	if (
		!Number.isNaN(
			parseInt(dataGame.visitor.stats.free_throws_made) &&
				dataGame.visitor.stats.free_throws_made !== '0'
		) &&
		parseInt(dataGame.visitor.stats.free_throws_attempted) &&
		dataGame.visitor.stats.free_throws_attempted !== '0'
	)
		game.visitor.stats.totals.freeThrowsPct =
			parseInt(dataGame.visitor.stats.free_throws_made) /
			parseInt(dataGame.visitor.stats.free_throws_attempted);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.three_pointers_made)))
		game.visitor.stats.totals.threePointersMade = parseInt(
			dataGame.visitor.stats.three_pointers_made
		);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.three_pointers_attempted)))
		game.visitor.stats.totals.threePointersAttempted = parseInt(
			dataGame.visitor.stats.three_pointers_attempted
		);

	if (
		!Number.isNaN(
			parseInt(dataGame.visitor.stats.three_pointers_made) &&
				dataGame.visitor.stats.three_pointers_made !== '0'
		) &&
		parseInt(dataGame.visitor.stats.three_pointers_attempted) &&
		dataGame.visitor.stats.three_pointers_attempted !== '0'
	)
		game.visitor.stats.totals.threePointersPct =
			parseInt(dataGame.visitor.stats.three_pointers_made) /
			parseInt(dataGame.visitor.stats.three_pointers_attempted);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.rebounds_offensive)))
		game.visitor.stats.totals.offReb = parseInt(dataGame.visitor.stats.rebounds_offensive);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.rebounds_defensive)))
		game.visitor.stats.totals.defReb = parseInt(dataGame.visitor.stats.rebounds_defensive);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.assists)))
		game.visitor.stats.totals.assists = parseInt(dataGame.visitor.stats.assists);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.fouls)))
		game.visitor.stats.totals.personalFouls = parseInt(dataGame.visitor.stats.fouls);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.team_fouls)))
		game.visitor.stats.totals.fouls.team = parseInt(dataGame.visitor.stats.team_fouls);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.technical_fouls)))
		game.visitor.stats.totals.fouls.technical = parseInt(dataGame.visitor.stats.technical_fouls);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.steals)))
		game.visitor.stats.totals.steals = parseInt(dataGame.visitor.stats.steals);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.turnovers)))
		game.visitor.stats.totals.turnovers = parseInt(dataGame.visitor.stats.turnovers);

	if (!Number.isNaN(parseInt(dataGame.visitor.stats.blocks)))
		game.visitor.stats.totals.blocks = parseInt(dataGame.visitor.stats.blocks);

	/** TODO: Store # of short and long timeouts remaining for visitor team */

	await game.save();
};

const setEspnPlayerStatTotals = (stats: ParsedEspnBoxscoreTeamPlayer['stats']) => {
	return {
		minutes: stats?.minutes ? stats.minutes : undefined,
		fieldGoalsMade: stats?.fieldGoalsMade ? stats.fieldGoalsMade : undefined,
		fieldGoalsAttempted: stats?.fieldGoalsAttempted ? stats.fieldGoalsAttempted : undefined,
		fieldGoalsPct:
			stats?.fieldGoalsMade && stats?.fieldGoalsAttempted
				? stats.fieldGoalsMade / stats.fieldGoalsAttempted
				: undefined,
		threePointersMade: stats?.threePointersMade ? stats.threePointersMade : undefined,
		threePointersAttempted: stats?.threePointersAttempted
			? stats.threePointersAttempted
			: undefined,
		threePointersPct:
			stats?.threePointersMade && stats?.threePointersAttempted
				? stats.threePointersMade / stats.threePointersAttempted
				: undefined,
		freeThrowsMade: stats?.freeThrowsMade ? stats.freeThrowsMade : undefined,
		freeThrowsAttempted: stats?.freeThrowsAttempted ? stats.freeThrowsAttempted : undefined,
		freeThrowsPct:
			stats?.freeThrowsMade && stats?.freeThrowsAttempted
				? stats.freeThrowsMade / stats.freeThrowsAttempted
				: undefined,
		offReb: stats?.offReb ? stats.offReb : undefined,
		defReb: stats?.defReb ? stats.defReb : undefined,
		totalReb: stats?.totalReb ? stats.totalReb : undefined,
		assists: stats?.assists ? stats.assists : undefined,
		steals: stats?.steals ? stats.steals : undefined,
		blocks: stats?.blocks ? stats.blocks : undefined,
		turnovers: stats?.turnovers ? stats.turnovers : undefined,
		personalFouls: stats?.personalFouls ? stats.personalFouls : undefined,
		points: stats?.points ? stats.points : undefined,
		plusMinus: stats?.plusMinus ? stats.plusMinus : undefined,
		advanced: {}
	};
};

const addEspnTeamStats = (teamData: ParsedEspnBoxscoreTeam) => {
	const {
		fieldGoalsMade,
		fieldGoalsAttempted,
		fieldGoalsPct,
		threePointersMade,
		threePointersAttempted,
		threePointersPct,
		freeThrowsMade,
		freeThrowsAttempted,
		freeThrowsPct,
		totalReb,
		offReb,
		defReb,
		assists,
		steals,
		blocks,
		turnovers,
		fouls,
		turnoverPoints,
		fastBreakPoints,
		pointsInPaint,
		largestLead
	} = teamData;
	return {
		fieldGoalsMade,
		fieldGoalsAttempted,
		fieldGoalsPct,
		threePointersMade,
		threePointersAttempted,
		threePointersPct,
		freeThrowsMade,
		freeThrowsAttempted,
		freeThrowsPct,
		totalReb,
		offReb,
		defReb,
		assists,
		steals,
		blocks,
		turnovers: turnovers.total,
		fouls: {
			technical: fouls.technical,
			team: fouls.fouls,
			totalTechnical: fouls.totalTechnical,
			flagrant: fouls.flagrant
		},
		pointsOffTov: turnoverPoints,
		fastBreakPoints: fastBreakPoints,
		pointsInPaint: pointsInPaint,
		largestLead: largestLead,
		advanced: {}
	};
};

const storeEspnData = (
	game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
	gameId: number
) => {
	return getEspnBoxscore(gameId).then(async (data) => {
		if (!game.home.team.meta.helpers.espnTeamId)
			throw Error(`No ESPN team ID found for home team ${game.home.team.infoCommon.name}`);
		if (!game.visitor.team.meta.helpers.espnTeamId)
			throw Error(`No ESPN team ID found for visitor team ${game.visitor.team.infoCommon.name}`);
		/* Set stats for home team */
		if (data[game.home.team.meta.helpers.espnTeamId] !== undefined) {
			const teamData = data[game.home.team.meta.helpers.espnTeamId];
			game.home.stats.totals = addEspnTeamStats(teamData);
			/* Update home player stats */
			const { team } = await getEspnTeamPlayers(game.home.team.meta.helpers.espnTeamId);
			for (const player of teamData.players) {
				/* If player exists, find player : create new player in db */
				const fullName = player.name.displayName,
					parsedName = fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
					nameArray = [fullName, parsedName];

				let playerDocument = await Player2.findByNameOrNbaId(nameArray, player.espnId);
				if (!playerDocument) {
					const playersQuery = await getPlayerQuery(fullName);
					const players = await findMatchingBballRefPlayers(playersQuery);
					const rosterPlayer = team.athletes.findIndex((p) => p.id === player.espnId);
					playerDocument = await compareEspnPlayerBday(team.athletes[rosterPlayer], players);
				}

				if (!playerDocument.meta.helpers.nbaPlayerId) {
					if (!Number.isNaN(parseInt(player.espnId))) {
						playerDocument.meta.helpers.espnPlayerId = parseInt(player.espnId);
						await playerDocument.save();
					}
				}
				const playerIdx = game.home.players.findIndex((p) => p.player == playerDocument._id);
				if (playerIdx !== -1) {
					game.home.players[playerIdx].jerseyNumber = player.jersey ? player.jersey : undefined;
					game.home.players[playerIdx].positionFull = player.position.name;
					game.home.players[playerIdx].positionShort = player.position.abbreviation;
					game.home.players[playerIdx].active = player.active;
					game.home.players[playerIdx].inactive = player.didNotPlay;
					game.home.players[playerIdx].stats.totals = setEspnPlayerStatTotals(player.stats);
				} else {
					const playerData = {
						player: playerDocument._id,
						jerseyNumber: player.jersey ? player.jersey : undefined,
						positionFull: player.position.name,
						positionShort: player.position.abbreviation,
						active: player.active,
						inactive: player.didNotPlay,
						stats: {
							totals: setEspnPlayerStatTotals(player.stats)
						}
					};
					game.home.players.addToSet(playerData);
				}
			}
		}

		/* Set stats for visitor team */
		if (data[game.visitor.team.meta.helpers.espnTeamId] !== undefined) {
			const teamData = data[game.visitor.team.meta.helpers.espnTeamId];
			game.home.stats.totals = addEspnTeamStats(teamData);

			/* Update visitor player stats */
			const { team } = await getEspnTeamPlayers(game.visitor.team.meta.helpers.espnTeamId);
			for (const player of teamData.players) {
				/* If player exists, find player : create new player in db */
				const fullName = player.name.displayName,
					parsedName = fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
					nameArray = [fullName, parsedName];

				let playerDocument = await Player2.findByNameOrNbaId(nameArray, player.espnId);
				if (!playerDocument) {
					const playersQuery = await getPlayerQuery(fullName);
					const players = await findMatchingBballRefPlayers(playersQuery);
					const rosterPlayer = team.athletes.findIndex((p) => p.id === player.espnId);
					playerDocument = await compareEspnPlayerBday(team.athletes[rosterPlayer], players);
				}

				if (!playerDocument.meta.helpers.nbaPlayerId) {
					if (!Number.isNaN(parseInt(player.espnId))) {
						playerDocument.meta.helpers.espnPlayerId = parseInt(player.espnId);
						await playerDocument.save();
					}
				}
				const playerIdx = game.visitor.players.findIndex((p) => p.player == playerDocument._id);
				if (playerIdx !== -1) {
					game.visitor.players[playerIdx].jerseyNumber = player.jersey ? player.jersey : undefined;
					game.visitor.players[playerIdx].positionFull = player.position.name;
					game.visitor.players[playerIdx].positionShort = player.position.abbreviation;
					game.visitor.players[playerIdx].active = player.active;
					game.visitor.players[playerIdx].inactive = player.didNotPlay;
					game.visitor.players[playerIdx].stats.totals = setEspnPlayerStatTotals(player.stats);
				} else {
					const playerData = {
						player: playerDocument._id,
						jerseyNumber: player.jersey ? player.jersey : undefined,
						positionFull: player.position.name,
						positionShort: player.position.abbreviation,
						active: player.active,
						inactive: player.didNotPlay,
						stats: {
							totals: setEspnPlayerStatTotals(player.stats)
						}
					};
					game.visitor.players.addToSet(playerData);
				}
			}
		}
		return game.save();
	});
};

/*
  interface PeriodSetItem {
    period_value: string;
    period_name: string;
  }
*/

const syncLiveNbaStats = async () => {
	const endDate = dayjs();
	const startDate = endDate.startOf('day');
	for (const game of await Game2.find({
		date: { $lte: endDate, $gte: startDate }
	}).populateTeams()) {
		if (!game.meta.helpers.isOver) game.meta.helpers.isOver = false;
		await getNbaBoxscore(game)
			.then(async (data: NbaBoxScoreData) => {
				await storeNbaData(game, data);
			})
			.catch(console.log);
	}
};

const syncLiveEspnStats = async () => {
	const endDate = dayjs(),
		startDate = endDate.startOf('day'),
		espnScoreboard = await getScheduleEspn(
			startDate.year(),
			startDate.month() + 1,
			startDate.date()
		);
	const dateStr = startDate.format('YYYYMMDD');
	console.log(dateStr);
	//console.log(espnScoreboard);

	for (const game of await Game2.find({
		date: { $lte: endDate, $gte: startDate }
	}).populateTeams()) {
		if (!game.meta.helpers.isOver) game.meta.helpers.isOver = false;
		game.home.players.splice(0);
		game.visitor.players.splice(0);
		const espnGameBasic = findEspnGameId(dateStr, espnScoreboard, game);
		if (!espnGameBasic) throw Error(`Error: could not find info`);
		const [gameId, isOver]: [string, boolean] = espnGameBasic;
		if (isOver) game.meta.helpers.isOver = true;
		if (!gameId) {
			throw Error(
				`Error: no matching game id found for ${dayjs(game.date).format('YYYY-MM-DD')}, ${
					game.visitor.team.infoCommon.name
				} @ ${game.home.team.infoCommon.name}`
			);
		}
		await storeEspnData(game, parseInt(gameId)).then(console.log);
	}
};

export const syncLiveGameData = async () => {
	await syncLiveNbaStats().then(() =>
		console.log(`Completed syncing live game data from nba stats api`)
	);
};

export const syncLiveEspnGameData = async () => {
	await syncLiveEspnStats().then(() =>
		console.log(`Completed syncing live game data from espn api`)
	);
};
