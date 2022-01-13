import { Game2, League, Team2, Player2, Official2, initConnect, endConnect } from '../../../index';
import type { Game2Document } from '../../../index';
import { getBoxScore } from '../../../api/bballRef/games';
import {
	SeasonGameItem,
	getSeasons,
	getSeasonGames,
	getPlayoffGames
} from '../../../api/bballRef/seasons';
import { addGameToPlayer } from '../Player2';
import { addGameToTeam } from '../Team2';
import { addOrUpdateSeasons } from '../League';
import { addGameToOfficial } from '../Official2';
import dayjs from 'dayjs';

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

export const importGamesLastWeek = () => {
	initConnect(true)
		.then(async () => {
			await importLatestGames();
		})
		.then(endConnect)
		.then(() => console.log('Completed import games last 7 days'));
};
