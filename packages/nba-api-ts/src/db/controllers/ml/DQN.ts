// import { Player2, Game2 } from '../../..';
import dayjs from 'dayjs';
import { PositionIdx, calcFantasyPoints /*,EspnScoring*/ } from '.';
import type { DQNParsedGame, PositionEncoded } from './types';
import type { /*Player2Object,*/ Game2Object, Player2Document /*, Game2Document*/ } from '../../..';
import type { MlFantasyPlayerData } from '../../models/Player2';

/**
 * Inputs for each player
 * [
 *   age,
 *   seasonsExp,
 *   gamePlayedSum,
 *   gamesStartedSum,
 *   careerMinSum,
 *   careerFgSum,
 *   careerFgaSum,
 *   careerFtSum,
 *   careerFtaSum,
 *   career3pSum,
 *   career3paSum,
 *   careerPtsSum,
 *   careerRebSum,
 *   careerAstSum,
 *   careerStlSum,
 *   careerBlkSum,
 *   careerTovSum,
 *   careerAvgMin,
 *   careerAvgFg,
 *   careerAvgFga,
 *   careerAvgFgPct,
 *   careerAvgFt,
 *   careerAvgFta,
 *   careerAvgFtPct,
 *   careerAvgThreePt,
 *   careerAvgThreePtPct,
 *   careerAvgPts,
 *   careerAvgReb,
 *   careerAvgAst,
 *   careerAvgStl,
 *   careerAvgBlk,
 *   careerAvgTov
 *   lastSznAvgMin,
 *   lastSznAvgFg,
 *   lastSznAvgFga,
 *   lastSznAvgFgPct,
 *   lastSznAvgFt,
 *   lastSznAvgFta,
 *   lastSznAvgFtPct,
 *   lastSznAvgThreePt,
 *   lastSznAvgThreePtPct,
 *   lastSznAvgPts,
 *   lastSznAvgReb,
 *   lastSznAvgAst,
 *   lastSznAvgStl,
 *   lastSznAvgBlk,
 *   lastSznAvgTov
 *   position[0],
 *   position[1],
 *   position[2],
 *   position[3],
 *   position[4],
 *   position[5],
 *   position[6]
 * ]
 */
/* TODO: Write class of player for DQN Model API */
export class DQNPlayer {
	private _id: Player2Document['_id'];
	private gpSum: number;
	private gsSum: number;
	private birthDate!: Date;
	private name: {
		full: string;
		display?: string;
	};
	private trainParsedGameStats: DQNParsedGame[] = [];
	private latestGameStats: DQNParsedGame[] = [];

	public positionEncd: PositionEncoded = [0, 0, 0, 0, 0, 0, 0];
	public inputs: number[] = [];
	public labels: number[] = [];
	public rawData: { inputs: number[]; labels: number[] }[] = [];
	constructor(playerData: MlFantasyPlayerData) {
		const { _id, gpSum, gsSum, birthDate, position, name, latestGameStats, trainingGameStats } =
			playerData;
		this._id = _id;
		this.gpSum = gpSum;
		this.gsSum = gsSum;
		if (birthDate) this.birthDate = birthDate;
		if (position) this.encodePositions(position);
		this.name = name;
		this.latestGameStats = this.parseGames(latestGameStats);
		this.trainParsedGameStats = this.parseGames(trainingGameStats);
	}

	/* resets inputs, labels, and rawData */
	public reset() {
		this.inputs = [];
		this.labels = [];
		this.rawData = [];
	}
	private calcStatSums(games: DQNParsedGame[], count: number) {
		let min = 0,
			fg = 0,
			fga = 0,
			ft = 0,
			fta = 0,
			threePts = 0,
			pts = 0,
			reb = 0,
			ast = 0,
			stl = 0,
			blk = 0,
			tov = 0,
			fppg = 0;
		for (let i = 0; i < count; i++) {
			const game = games[i];
			if (game.stats.minutes) {
				let totalSec = game.stats.minutes * 60;
				if (game.stats.seconds) totalSec += game.stats.seconds;
				min += totalSec / 60;
			}
			if (game.stats.fieldGoalsMade) fg += game.stats.fieldGoalsMade;
			if (game.stats.fieldGoalsAttempted) fga += game.stats.fieldGoalsAttempted;
			if (game.stats.freeThrowsMade) ft += game.stats.freeThrowsMade;
			if (game.stats.freeThrowsAttempted) fta += game.stats.freeThrowsAttempted;
			if (game.stats.threePointersMade) threePts += game.stats.threePointersMade;
			if (game.stats.points) pts += game.stats.points;
			if (game.stats.totalReb) {
				reb += game.stats.totalReb;
			} else {
				if (game.stats.offReb) reb += game.stats.offReb;
				if (game.stats.defReb) reb += game.stats.defReb;
			}
			if (game.stats.assists) ast += game.stats.assists;
			if (game.stats.steals) stl += game.stats.steals;
			if (game.stats.blocks) blk += game.stats.blocks;
			if (game.stats.turnovers) tov += game.stats.turnovers;
			if (game.stats.fantasyPts) fppg += game.stats.fantasyPts;
		}
		return {
			min,
			fg,
			fga,
			ft,
			fta,
			threePts,
			pts,
			reb,
			ast,
			stl,
			blk,
			tov,
			fppg
		};
	}

	public calcAverages(games: DQNParsedGame[]) {
		const count = games.length || 0;
		const { min, fg, fga, ft, fta, threePts, pts, reb, ast, stl, blk, tov, fppg } =
			this.calcStatSums(games, count);

		return {
			avgMin: min / count,
			avgFg: fg / count,
			avgFga: fga / count,
			avgFt: ft / count,
			avgFta: fta / count,
			avgThreeP: threePts / count,
			avgPts: pts / count,
			avgReb: reb / count,
			avgAst: ast / count,
			avgStl: stl / count,
			avgBlk: blk / count,
			avgTov: tov / count,
			avgFppg: fppg / count
		};
	}

	public getAge = (dateString: string, today = new Date()): number => {
		const birthDate = new Date(dateString);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	public preprocessData(inputs: DQNParsedGame[], labels: DQNParsedGame[]) {
		const inputAvg = this.calcAverages(inputs);
		const inputSums = this.calcStatSums(inputs, inputs.length);
		const bdayStr = new Date(this.birthDate).toISOString();
		const maxYear = Math.max.apply(
			null,
			inputs.map(function (o) {
				return o.season;
			})
		);
		const inputAge = this.getAge(bdayStr, dayjs(this.birthDate).year(maxYear).toDate());
		const lastSznAvg = this.calcAverages(labels.filter((g) => g.season === maxYear));

		/* TODO: format the above inputs to Array<number> and set this.inputs */

		const { fppg } = this.calcStatSums(labels, labels.length);
		this.labels = [fppg];
		/* TODO: set this.rawData */
	}

	/* given game, parses and returns cleaned stats */
	public parseGame(game: Game2Object): DQNParsedGame {
		/* bleh, ugly destructuring of game object, but... */
		const {
			meta: {
				helpers: {
					bballRef: { year: season }
				}
			},
			home,
			visitor
		} = game;

		//console.log(game.home.players);
		//console.log(game.visitor.players);

		const homeFiltered = home.players.filter(
			({ player }) => player?.toString() === this._id.toString()
		);
		const visitorFiltered = visitor.players.filter(
			({ player }) => player?.toString() === this._id.toString()
		);
		if (!homeFiltered.length) {
			const [{ stats }] = visitorFiltered;
			const totals = stats.totals;
			const parsedGame: DQNParsedGame = {
				season,
				stats: totals
			};
			return parsedGame;
		}

		const [{ stats }] = homeFiltered;
		const totals = stats.totals;
		const parsedGame: DQNParsedGame = {
			season,
			stats: totals
		};
		return parsedGame;
	}

	/* given array of games, returns parsedGames */
	public parseGames(games: Game2Object[]): DQNParsedGame[] {
		const gameCount = games.length;
		const parsedGames: DQNParsedGame[] = new Array(gameCount);
		for (let i = 0; i < gameCount; i++) {
			const tempGame = games[i];
			// console.log(tempGame);
			// console.log('home.players:', tempGame.home.players);
			// console.log('visitor.players:', tempGame.visitor.players);
			const parsedGame = this.parseGame(tempGame);
			// console.log(parsedGame.stats);
			if (parsedGame.stats && parsedGame.stats.minutes && parsedGame.stats.minutes > 0) {
				parsedGames[i] = parsedGame;
			} else {
				parsedGames.slice(i, 1);
			}
		}
		return parsedGames;
	}

	/* one hot encodes player position using 7 positions */
	public encodePositions(position: string) {
		const positionList: string[] = [];
		/**
		 * Handle the two following formatting cases:
		 *  - `Shooting Guard, Small Forward, and Point Guard`
		 *  - `Shooting Guard and Point Guard`
		 */
		if (position.includes('and')) {
			const tempSplit = position.split('and');
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
			if (position.includes('/')) {
				position.split('/').map((pos) => positionList.push(pos.trim()));
			} else {
				positionList.push(position.trim());
			}
		}
		const posListLength = positionList.length;
		/* One hot encode this.posEncoded */
		for (let i = 0; i < posListLength; i++) {
			switch (positionList[i].toLowerCase()) {
				case 'point guard':
					this.positionEncd[PositionIdx.PG] = 1;
				case 'shooting guard':
					this.positionEncd[PositionIdx.SG] = 1;
				case 'small forward':
					this.positionEncd[PositionIdx.SF] = 1;
				case 'power forward':
					this.positionEncd[PositionIdx.PF] = 1;
				case 'center':
					this.positionEncd[PositionIdx.PF] = 1;
				case 'guard':
					this.positionEncd[PositionIdx.G] = 1;
				case 'forward':
					this.positionEncd[PositionIdx.F] = 1;
				default:
					break;
			}
		}
	}
}
