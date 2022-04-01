import { Player2 } from '../../../index';
import type {
	Game2Document,
	Player2Document,
	Player2SeasonPostseasonStatDocument
} from '../../../index';
import { BoxScorePlayer } from '../../../api/bballRef/games/utils';
import type {
	BballRefPlayerQueryResItem,
	PlayerCareerStatSeason
} from '../../../api/bballRef/types';
import { getPlayerData, getPlayerCareerStats } from '../../../api/bballRef/player';
import { findTeamAbbrevYear } from '../Team2';
import { findLatestSeason } from '../Game2';
import mongoose from 'mongoose';
import { IStatsPlayerInfo } from '../../../api/nba/nba';
import type { IEspnTeamPlayersTeamAthlete } from '../../../api/espn/types';
import dayjs from 'dayjs';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBballRefPlayerQueryItem = (arg: any): arg is BballRefPlayerQueryResItem => {
	return (
		arg &&
		arg.playerUrl &&
		typeof arg.playerUrl == 'string' &&
		arg.name &&
		typeof arg.name == 'string'
	);
};

export const addOrFindPlayer = async (playerData: BoxScorePlayer | BballRefPlayerQueryResItem) => {
	const playerUrl = isBballRefPlayerQueryItem(playerData)
		? playerData.playerUrl
		: playerData.meta.helpers.bballRef.playerUrl;
	const name = isBballRefPlayerQueryItem(playerData) ? playerData.name : playerData.fullName;
	const result: Player2Document = await Player2.findByPlayerUrl(playerUrl);
	if (!result) {
		const player = {
			meta: {
				helpers: {
					bballRef: {
						playerUrl: playerUrl
					}
				}
			},
			name: {
				full: name
			}
		};

		return new Player2(player).save().catch((err) => {
			console.log(playerData);
			console.trace(err);
		});
	} else {
		return result;
	}
};

export const addPlayerBasicData = (player: Player2Document): Promise<Player2Document> => {
	const { playerUrl } = player.meta.helpers.bballRef;
	return getPlayerData(playerUrl).then((data) => {
		const { height, weight, birthDate, birthPlace, position, shoots, name, college, socials } =
			data;
		if (height.feet) {
			player.height = {
				feet: height.feet
			};
		}
		if (height.inches) player.height.inches = height.inches;
		if (weight) player.weight = weight;
		if (birthDate) player.birthDate = birthDate;
		if (birthPlace) player.birthPlace = birthPlace;
		if (name.pronunciation) player.name.pronunciation = name.pronunciation;
		if (name.display) player.name.display = name.display;
		if (position) player.position = position;
		if (shoots) player.shoots = shoots;
		if (name?.display) player.name.display = name.display;
		if (college) player.college = college;
		if (socials?.twitter) player.socials.twitter = socials.twitter;
		if (socials?.instagram) player.socials.instagram = socials.instagram;
		return player.save().then((player) => {
			return player;
		});
	});
};

export interface Player2Season {
	year: number;
	teams: mongoose.Types.ObjectId[];
	preseason: {
		games: mongoose.Types.ObjectId[];
	};
	regularSeason: {
		games: mongoose.Types.ObjectId[];
		stats?: {
			totals?: Player2SeasonPostseasonStatDocument;
			teamSplits?: Array<{
				team: mongoose.Types.ObjectId;
				totals: Player2SeasonPostseasonStatDocument;
			}>;
		};
	};
	postseason: {
		games: mongoose.Types.ObjectId[];
	};
}

export const addGameToPlayer = async (
	game: Game2Document,
	player: Player2Document,
	seasonStage?: string
) => {
	const { year } = game.meta.helpers.bballRef;
	const { _id } = game;
	const sznCountFix = player.seasons.filter((s) => s.year === year).length;
	if (!sznCountFix || sznCountFix === 0) {
		const season: Player2Season = {
			year,
			teams: [],
			preseason: {
				games: []
			},
			regularSeason: {
				games: []
			},
			postseason: {
				games: []
			}
		};
		player.seasons.addToSet(season);
		player = await player.save();
	}
	const seasonIndex = player.seasons.findIndex((s) => s.year == year);

	switch (seasonStage) {
		case 'post': {
			player.seasons[seasonIndex].postseason.games.addToSet(_id);
			break;
		}
		case 'pre': {
			player.seasons[seasonIndex].preseason.games.addToSet(_id);
			break;
		}
		case 'regular': {
			player.seasons[seasonIndex].regularSeason.games.addToSet(_id);
			break;
		}
		default: {
			throw Error(`Invalid season stage "${seasonStage}"`);
		}
	}
	return await player.save();
};

export const compareNbaPlayerBday = (
	nbaPlayerInfo: IStatsPlayerInfo,
	playerDocs: Player2Document[]
): Player2Document => {
	const { birthdate, personId, firstName, lastName } = nbaPlayerInfo.commonPlayerInfo[0];

	const nbaPlayerBday = dayjs(birthdate);
	for (let i = 0; i < playerDocs.length; i++) {
		if (nbaPlayerBday.isSame(dayjs(playerDocs[i].birthDate), 'day')) {
			return playerDocs[i];
		}
	}
	throw Error(`Could not player match for nbaId: ${personId}, name: ${firstName} ${lastName}`);
};

export const compareEspnPlayerBday = (
	espnPlayerInfo: IEspnTeamPlayersTeamAthlete,
	playerDocs: Player2Document[]
): Player2Document => {
	const { dateOfBirth, fullName, id } = espnPlayerInfo;

	const nbaPlayerBday = dayjs(dateOfBirth);
	for (let i = 0; i < playerDocs.length; i++) {
		if (nbaPlayerBday.isSame(dayjs(playerDocs[i].birthDate), 'day')) {
			return playerDocs[i];
		}
	}
	throw Error(`Could not player match for espnId: ${id}, name: ${fullName}`);
};

export const findMatchingBballRefPlayers = async (
	playerQueries: BballRefPlayerQueryResItem[]
): Promise<Player2Document[]> => {
	const players: Player2Document[] = [];
	for (let i = 0; i < playerQueries.length; i++) {
		let player = await addOrFindPlayer(playerQueries[i]);
		if (!player) throw Error(`Player not found in db. Full Name: ${playerQueries[i].name}`);
		player = await addPlayerBasicData(player);
		players.push(player);
	}
	return players;
};

interface StatTotals {
	games?: number;
	gamesStarted?: number;
	minutes?: number;
	fieldGoalsMade?: number;
	fieldGoalsAttempted?: number;
	fieldGoalsPct?: number;
	threePointersMade?: number;
	threePointersAttempted?: number;
	threePointersPct?: number;
	twoPointFGMade?: number;
	twoPointFGAttempted?: number;
	twoPointFGPct?: number;
	effectiveFieldGoalPct?: number;
	freeThrowsMade?: number;
	freeThrowsAttempted?: number;
	freeThrowsPct?: number;
	offReb?: number;
	defReb?: number;
	totalReb?: number;
	assists?: number;
	steals?: number;
	blocks?: number;
	turnovers?: number;
	personalFouls?: number;
	points?: number;
}

const formatStatTotals = (stats: PlayerCareerStatSeason): Player2SeasonPostseasonStatDocument => {
	const totals: StatTotals = {};
	if (stats.games) totals.games = stats.games;
	if (stats.gamesStarted) totals.gamesStarted = stats.gamesStarted;
	if (stats.minPerGame) totals.minutes = stats.minPerGame;
	if (stats.fgPerGame) totals.fieldGoalsMade = stats.fgPerGame;
	if (stats.fgaPerGame) totals.fieldGoalsAttempted = stats.fgaPerGame;
	if (stats.fgPct) totals.fieldGoalsPct = stats.fgPct;
	if (stats.fg3PerGame) totals.threePointersMade = stats.fg3PerGame;
	if (stats.fg3aPerGame) totals.threePointersAttempted = stats.fg3aPerGame;
	if (stats.fg3Pct) totals.threePointersPct = stats.fg3Pct;
	if (stats.fg2PerGame) totals.twoPointFGMade = stats.fg2PerGame;
	if (stats.fg2aPerGame) totals.twoPointFGAttempted = stats.fg2aPerGame;
	if (stats.fg2Pct) totals.twoPointFGPct = stats.fg2Pct;
	if (stats.efgPct) totals.effectiveFieldGoalPct = stats.efgPct;
	if (stats.ftPerGame) totals.freeThrowsMade = stats.ftPerGame;
	if (stats.ftaPerGame) totals.freeThrowsAttempted = stats.ftaPerGame;
	if (stats.ftPct) totals.freeThrowsPct = stats.ftPct;
	if (stats.orbPerGame) totals.offReb = stats.orbPerGame;
	if (stats.drbPerGame) totals.defReb = stats.drbPerGame;
	if (stats.trbPerGame) totals.totalReb = stats.trbPerGame;
	if (stats.astPerGame) totals.assists = stats.astPerGame;
	if (stats.stlPerGame) totals.steals = stats.stlPerGame;
	if (stats.blkPerGame) totals.blocks = stats.blkPerGame;
	if (stats.tovPerGame) totals.turnovers = stats.tovPerGame;
	if (stats.pfPerGame) totals.personalFouls = stats.pfPerGame;
	if (stats.ptsPerGame) totals.points = stats.ptsPerGame;
	return totals as unknown as Player2SeasonPostseasonStatDocument;
};

export const storePlayerRegSeasonStats = async (player: Player2Document) => {
	const careerStats = await getPlayerCareerStats(player.meta.helpers.bballRef.playerUrl);
	const seasons: Set<number> = new Set();
	careerStats.map((s) => {
		if (!isNaN(s.season)) seasons.add(s.season);
	});
	player.meta.helpers.missingData = false;
	if (!seasons.size) {
		console.log(`No seasons found for ${player.name}`);
		return;
	}
	for (const year of seasons) {
		const filtered = careerStats.filter((s) => s.season === year);
		const sznCountFix = player.seasons.filter((s) => s.year === year).length;
		if (!sznCountFix || sznCountFix === 0) {
			const season: Player2Season = {
				year,
				teams: [],
				preseason: {
					games: []
				},
				regularSeason: {
					games: []
				},
				postseason: {
					games: []
				}
			};
			player.seasons.addToSet(season);
			player = await player.save();
		} else if (sznCountFix > 1) {
			const removeIdx: number[] = [];
			let usedIdx;
			player.seasons.map((s, i) => {
				if (s.year === year) {
					if (s.regularSeason.stats.totals && !usedIdx) {
						usedIdx = i;
					} else {
						removeIdx.push(i);
					}
				}
			});
			for (const idx of removeIdx) {
				player.seasons.pull(player.seasons[idx]);
			}
		}
		const seasonIdx = player.seasons.findIndex((s) => s.year === year);
		player.seasons[seasonIdx].teams.splice(0);
		player = await player.save();
		if (filtered.length > 1) {
			for (let i = 0; i < filtered.length; i++) {
				const stat: PlayerCareerStatSeason = filtered[i];
				if (stat.teamAbbrev === 'TOT') {
					player.seasons[seasonIdx].regularSeason.stats.totals = formatStatTotals(stat);
				} else {
					try {
						const { _id } = await findTeamAbbrevYear(stat.teamAbbrev, year);
						if (_id && stat) {
							player.seasons[seasonIdx].teams.addToSet({ id: _id });
							player.seasons[seasonIdx].regularSeason.stats.teamSplits.addToSet({
								team: _id,
								totals: formatStatTotals(stat)
							});
						}
					} catch (e) {
						console.log(e);
						player.meta.helpers.missingData = true;
					}
				}
			}
		} else {
			const { _id } = await findTeamAbbrevYear(filtered[0].teamAbbrev, year);
			player.seasons[seasonIdx].teams.addToSet({ id: _id });
			player.seasons[seasonIdx].regularSeason.stats.totals = formatStatTotals(filtered[0]);
		}
	}
	player.seasons.sort(({ year: a }, { year: b }) => a - b);
	return player.save().catch((e) => {
		console.log(player.name);
		console.log(e);
	});
};

export const importPlayerStats = async () => {
	const year = await findLatestSeason();
	// let count = await Player2.countDocuments({ seasons: { $elemMatch: { year } } });
	for (const player of await Player2.find({ seasons: { $elemMatch: { year } } })) {
		// console.log('remaining: ', count--);
		await storePlayerRegSeasonStats(player);
	}
};

export const importAllPlayerStats = async () => {
	let count = await Player2.countDocuments({ $seasons: { $exists: true, $size: 1 } });
	for (const player of await Player2.find({ $seasons: { $exists: true, $size: 1 } })) {
		await storePlayerRegSeasonStats(player);
		console.log('remaining: ', count--);
	}
};

export const updateActivePlayersCareerStats = async () => {
	await importPlayerStats().then(() =>
		console.log(`Completed syncing active player career stats from basketball reference`)
	);
};
