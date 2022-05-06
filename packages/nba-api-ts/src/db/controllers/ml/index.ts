import { Player2, Game2, serverlessConnect } from '../../..';
import { DQNPlayer } from './DQN';
import config from '../../../config';
import dayjs from 'dayjs';
import { writeFile } from 'fs';
import type { Player2Object, Game2Object, Player2Document, Game2Document } from '../../..';
import type {
	SznGames,
	ParsedGame,
	PlayerData,
	PlayerStatTotals,
	BaseInputs,
	RawData,
	PositionEncoded
} from './types';
import { MlFantasyPlayerData } from '../../models/Player2';

export enum EspnScoring {
	POINT = 1,
	THREEPM = 1,
	FGA = -1,
	FGM = 2,
	FTA = -1,
	FTM = 1,
	REB = 1,
	AST = 2,
	STL = 4,
	BLK = 4,
	TOV = -2
}

export enum PositionIdx {
	PG = 0,
	SG = 1,
	SF = 2,
	PF = 3,
	C = 4,
	G = 5,
	F = 6
}

export const loadPlayerData = async (year: number, batch = 10) => {
	await serverlessConnect(config.MONGO_URI);
	const count = await Player2.fantasyDataCount(2021);
	console.log('count:', count);
	const players: DQNPlayer[] = [];
	const data: MlFantasyPlayerData[] = [];
	for (let i = 0; i * batch < count; i++) {
		try {
			const temp = await Player2.fantasyDataPerf(year, i, batch);
			temp.map((p) => {
				data.push(p);
				const parsed = new DQNPlayer(p);
				console.log(parsed);
				players.push(parsed);
			});
		} catch (e) {
			console.log(e);
			console.log(i);
			console.log(players.length);
		}
	}

	return { players, data };
};

export const loadDQNData = async (year: number, limit?: number) => {
	await serverlessConnect(config.MONGO_URI);
	const players = !limit
		? await Player2.fantasyDataOpt(year)
		: await Player2.fantasyDataOptTest(year, limit);
	const playerCount = players.length;
	const parsedPlayers: MlFantasyPlayerData[] = new Array(playerCount);
	for (let i = 0; i < playerCount; i++) {
		const player = players[i];

		const parsed: MlFantasyPlayerData = {
			name: {
				full: player.name.full
			},
			position: player.position,
			birthDate: player.birthDate,
			_id: player._id,
			gpSum: player.gpSum,
			gsSum: player.gsSum,
			latestGameStats: await Game2.getFantasyGames(player._id, player.latestGames),
			trainingGameStats: await Game2.getFantasyGames(player._id, player.trainingGames)
		} as MlFantasyPlayerData;
		parsedPlayers.push(parsed);
	}
	return parsedPlayers;
};

export const loadDQNPlayers = (year = 2021, limit?: number) => {
	return loadDQNData(year, limit).then((players) => {
		return players.map((p) => new DQNPlayer(p)).filter((p) => p !== undefined);
	});
};

export const savePlayerData = (data: MlFantasyPlayerData[]) => {
	return writeFile(
		`${process.cwd()}/data/DQNPlayers.json`,
		'[' + data.map((el) => JSON.stringify(el)).join(',') + ']',
		(err) => {
			if (err) {
				throw err;
			}
			console.log(`🟢  DQNPlayers.json saved!`);
		}
	);
};

export const calcFantasyPoints = (
	playerGameStats: PlayerStatTotals | undefined
): number | undefined => {
	if (!playerGameStats) return undefined;
	const {
		points,
		threePointersMade,
		fieldGoalsAttempted,
		freeThrowsAttempted,
		freeThrowsMade,
		fieldGoalsMade,
		totalReb,
		offReb,
		defReb,
		assists,
		steals,
		blocks,
		turnovers
	} = playerGameStats;
	let fantasyPoints = 0;
	if (points) fantasyPoints += points * EspnScoring.POINT;
	if (threePointersMade) fantasyPoints += threePointersMade * EspnScoring.THREEPM;
	if (fieldGoalsAttempted) fantasyPoints += fieldGoalsAttempted * EspnScoring.FGA;
	if (fieldGoalsMade) fantasyPoints += fieldGoalsMade * EspnScoring.FGM;
	if (freeThrowsAttempted) fantasyPoints += freeThrowsAttempted * EspnScoring.FTA;
	if (freeThrowsMade) fantasyPoints += freeThrowsMade * EspnScoring.FTM;
	if (totalReb) {
		fantasyPoints += totalReb * EspnScoring.REB;
	} else {
		if (offReb) fantasyPoints += offReb * EspnScoring.REB;
		if (defReb) fantasyPoints += defReb * EspnScoring.REB;
	}
	if (assists) fantasyPoints += assists * EspnScoring.AST;
	if (steals) fantasyPoints += steals * EspnScoring.STL;
	if (blocks) fantasyPoints += blocks * EspnScoring.BLK;
	if (turnovers) fantasyPoints += turnovers * EspnScoring.TOV;
	return fantasyPoints;
};

export const getDateStr = () => {
	const now = new Date();
	return `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}_${
		now.getHours() + ':' + now.getMinutes()
	}`;
};

export enum Position {
	pg = 0,
	sg = 1,
	sf = 2,
	pf = 3,
	c = 4,
	g = 5
}

// TODO: Write Base class to remove code duplication between ml player helper classes
// class BasePlayer {}

export class Player {
	public _playerId: Player2Object['_id'];
	public _playerBirthdate!: Date;
	public _startSeason: number;
	public _position!: string;
	public _processedData!: number[];
	public _playerData!: PlayerData;
	public inputs!: BaseInputs;
	public rawData: RawData = [];
	public labels: number[] = [];
	public posEncoded: PositionEncoded = [0, 0, 0, 0, 0, 0, 0];
	// trainingData:
	// _regularSznBasicStats:

	constructor(
		playerId: Player2Object['_id'],
		startSeason: number,
		position?: string,
		birthDate?: Date
	) {
		if (position) this._position = position;
		this._playerId = playerId;
		this._startSeason = startSeason;
		if (birthDate) this._playerBirthdate = birthDate;
	}

	set startSeason(season: number) {
		this._startSeason = season;
	}

	get startSeason() {
		return this._startSeason;
	}

	get position() {
		return this._position;
	}

	set position(val: string) {
		this._position = val;
	}

	get playerBirthDate() {
		return this._playerBirthdate;
	}

	set playerData(data: PlayerData) {
		this._playerData = data;
	}

	get playerData() {
		return this._playerData;
	}

	getPlayerDataYear(year: number) {
		return this._playerData[year];
	}

	private encodePositions() {
		const positionList: string[] = [];
		/**
		 * Handle the two following formatting cases:
		 *  - `Shooting Guard, Small Forward, and Point Guard`
		 *  - `Shooting Guard and Point Guard`
		 */
		if (this._position.includes('and')) {
			const tempSplit = this._position.split('and');
			const finalPosition = tempSplit[tempSplit.length - 1].trim();
			positionList.push(finalPosition);
			if (tempSplit[0].includes(',')) {
				tempSplit[0].split(',').map((pos) => positionList.push(pos.trim()));
			} else {
				positionList.push(tempSplit[0].trim());
			}
		} else {
			/**
			 * Handle the two following formatting cases:
			 *  - `Center/Forward`
			 *  - `Center`
			 */
			if (this._position.includes('/')) {
				this._position.split('/').map((pos) => positionList.push(pos.trim()));
			} else {
				positionList.push(this._position.trim());
			}
		}
		const posListLength = positionList.length;
		/* One hot encode this.posEncoded */
		for (let i = 0; i < posListLength; i++) {
			switch (positionList[i].toLowerCase()) {
				case 'point guard':
					this.posEncoded[PositionIdx.PG] = 1;
				case 'shooting guard':
					this.posEncoded[PositionIdx.SG] = 1;
				case 'small forward':
					this.posEncoded[PositionIdx.SF] = 1;
				case 'power forward':
					this.posEncoded[PositionIdx.PF] = 1;
				case 'center':
					this.posEncoded[PositionIdx.PF] = 1;
				case 'guard':
					this.posEncoded[PositionIdx.G] = 1;
				case 'forward':
					this.posEncoded[PositionIdx.F] = 1;
				default:
					break;
			}
		}
	}

	calcAverages(games: ParsedGame[]) {
		const count = games.length || 0;
		let avgMin = 0,
			avgFg = 0,
			avgFga = 0,
			avgFt = 0,
			avgFta = 0,
			avg3p = 0,
			avgPts = 0,
			avgReb = 0,
			avgAst = 0,
			avgStl = 0,
			avgBlk = 0,
			avgTov = 0,
			avgFppg = 0;
		for (let i = 0; i < count; i++) {
			const game = games[i];
			if (game.stats.minutes) {
				let totalSec = game.stats.minutes * 60;
				if (game.stats.seconds) totalSec += game.stats.seconds;
				avgMin += totalSec / 60;
			}
			if (game.stats.fieldGoalsMade) avgFg += game.stats.fieldGoalsMade;
			if (game.stats.fieldGoalsAttempted) avgFga += game.stats.fieldGoalsAttempted;
			if (game.stats.freeThrowsMade) avgFt += game.stats.freeThrowsMade;
			if (game.stats.freeThrowsAttempted) avgFta += game.stats.freeThrowsAttempted;
			if (game.stats.threePointersMade) avg3p += game.stats.threePointersMade;
			if (game.stats.points) avgPts += game.stats.points;
			if (game.stats.totalReb) {
				avgReb += game.stats.totalReb;
			} else {
				if (game.stats.offReb) avgReb += game.stats.offReb;
				if (game.stats.defReb) avgReb += game.stats.defReb;
			}
			if (game.stats.assists) avgAst += game.stats.assists;
			if (game.stats.steals) avgStl += game.stats.steals;
			if (game.stats.blocks) avgBlk += game.stats.blocks;
			if (game.stats.turnovers) avgTov += game.stats.turnovers;
			if (game.stats.fantasyPts) avgFppg += game.stats.fantasyPts;
		}
		return {
			min: avgMin / count,
			fg: avgFg / count,
			fga: avgFga / count,
			ft: avgFt / count,
			fta: avgFta / count,
			threeP: avg3p / count,
			pts: avgPts / count,
			reb: avgReb / count,
			ast: avgAst / count,
			stl: avgStl / count,
			blk: avgBlk / count,
			tov: avgTov / count,
			fppg: avgFppg / count
		};
	}
	getAge = (dateString: string, today = new Date()): number => {
		const birthDate = new Date(dateString);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	/* process data for basic linear regression prediction model 
    input: [age, seasonExp, gamesPlayed, avgMin, avgFg, avgFga, avgFt, avgFta, avg3p, avgPts, avgReb, avgAst, avgStl, avgBlk, avgTov]
    output: [futureFppg]
  */
	processData() {
		const keys = Object.keys(this._playerData);
		const seasonYears = keys.map((key) => parseInt(key));
		const maxYear = Math.max(...seasonYears);
		const trainingKeys = keys.filter((k) => k !== maxYear.toString());
		if (this._position) this.encodePositions();
		const inputGames: ParsedGame[] = [];
		const tKeyLength = trainingKeys.length;
		for (let i = 0; i < tKeyLength; i++) {
			const key = trainingKeys[i];
			const games = this._playerData[key];
			games.map((g) => inputGames.push(g));
		}
		if (!inputGames || inputGames.length === 0) console.log(`no games for ${this}`);
		const { min, fg, fga, ft, fta, threeP, pts, reb, ast, stl, blk, tov } =
			this.calcAverages(inputGames);
		const bdayStr = new Date(this._playerBirthdate).toISOString();
		const age = this.getAge(
			bdayStr,
			dayjs(this._playerBirthdate)
				.year(maxYear - 1)
				.toDate()
		);
		const exp = keys.length - 1;
		this.inputs = [
			age,
			exp,
			inputGames.length,
			min,
			fg,
			fga,
			ft,
			fta,
			threeP,
			pts,
			reb,
			ast,
			stl,
			blk,
			tov,
			...this.posEncoded
		];
		const { fppg } = this.calcAverages(this._playerData[maxYear.toString()]);
		this.labels = [fppg];
	}

	processSznData() {
		if (this._position) this.encodePositions();
		const keys = Object.keys(this._playerData);
		const seasonYears = keys.map((key) => parseInt(key));
		const maxYear = Math.max(...seasonYears);
		const inputKeys = keys.filter((k) => k !== maxYear.toString());
		const labelKeys = keys.filter((k) => k !== this._startSeason.toString());
		const iKeyLength = inputKeys.length;
		for (let i = 0; i < iKeyLength; i++) {
			const tempGames = this._playerData[inputKeys[i]];
			const {
				min,
				fg,
				fga,
				ft,
				fta,
				threeP,
				pts,
				reb,
				ast,
				stl,
				blk,
				tov,
				fppg: labelAvgFppg
			} = this.calcAverages(tempGames);
			const bdayStr = new Date(this._playerBirthdate).toISOString();
			const age = this.getAge(
				bdayStr,
				dayjs(this._playerBirthdate).year(parseInt(inputKeys[i])).toDate()
			);
			const exp = keys.length - 1;
			const tempInputs: BaseInputs = [
				age,
				exp,
				tempGames.length,
				min,
				fg,
				fga,
				ft,
				fta,
				threeP,
				pts,
				reb,
				ast,
				stl,
				blk,
				tov,
				...this.posEncoded
			];
			if (labelKeys.includes((parseFloat(inputKeys[i]) + 1).toString()) && labelAvgFppg !== 0) {
				const { fppg } = this.calcAverages(this._playerData[maxYear.toString()]);
				/*
          only add pairs of inputs and labels if player averages 15+ fppg
          in next season (i.e. only use relevant data) & if inputs have
          fewer than 2 NaN values (replace NaN => 0) else discard
        */
				if (
					fppg >= 15 &&
					!Number.isNaN(tempInputs[2]) &&
					!Number.isNaN(tempInputs[3]) &&
					!tempInputs.filter((i) => Number.isNaN(i)).length
				) {
					this.rawData.push({
						labels: [fppg],
						inputs: tempInputs
					});
				}
			}
		}
	}
}

const loadSznGames = async (
	playerId: Player2Document['_id'],
	games: Game2Document['_id'][],
	year: number
): Promise<SznGames> => {
	const filteredGameStats: Game2Object[] = await Game2.getFantasyGames(playerId, games);
	const resGames = filteredGameStats
		.map((g) => {
			const { date, home, visitor } = g;

			if (!home.players.length) {
				const [{ stats }] = visitor.players;
				const totals = stats.totals;
				const parsedGame: ParsedGame = {
					date,
					stats: totals
				};
				return parsedGame;
			}
			const [{ stats }] = home.players;
			const totals = stats.totals;
			const parsedGame: ParsedGame = {
				date,
				stats: totals
			};
			return parsedGame;
		})
		.filter((g) => g.stats?.minutes !== undefined);
	resGames.map((g) => {
		g.stats.fantasyPts = calcFantasyPoints(g.stats);
		return g;
	});

	return { year: year, games: resGames };
};

export const loadPlayerSznGames = async (player: Player2Object): Promise<Player> => {
	const pSznCount = player.seasons.length;
	const promises: Promise<SznGames>[] = new Array(pSznCount);
	for (let i = 0; i < pSznCount; i++) {
		const { year, regularSeason } = player.seasons[i];
		const { games } = regularSeason;
		if (!games) continue;
		promises[i] = loadSznGames(player._id, games as Game2Document['_id'][], year);
	}
	const sznGames = await Promise.all(promises);
	sznGames.sort((a, b) => a.year - b.year);
	const playerData: PlayerData = {};
	const resPlayer = new Player(player._id, sznGames[0].year, player.position, player.birthDate);
	const sznGameCount = sznGames.length;
	for (let i = 0; i < sznGameCount; i++) {
		const { year, games } = sznGames[i];
		playerData[year] = games;
	}
	resPlayer.startSeason = sznGames[0].year;
	resPlayer.playerData = playerData;
	return resPlayer;
};

export const loadSeasonPlayers = async (season: number): Promise<Player[]> => {
	return Player2.fantasyData(season).then((players) => {
		return Promise.all(players.map(loadPlayerSznGames));
	});
};
