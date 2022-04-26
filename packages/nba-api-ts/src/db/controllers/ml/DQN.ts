// import { Player2, Game2 } from '../../..';
import dayjs from 'dayjs';
import { PositionIdx, calcFantasyPoints /*,EspnScoring*/ } from '.';
import type { DQNParsedGame, PlayerStatTotals, PositionEncoded } from './types';
import type { /*Player2Object,*/ Game2Object, Player2Document /*, Game2Document*/ } from '../../..';
import type { MlFantasyPlayerData } from '../../models/Player2';

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
		this.initRawData(this.trainParsedGameStats, this.latestGameStats);
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
			threePtsAtt = 0,
			pts = 0,
			reb = 0,
			ast = 0,
			stl = 0,
			blk = 0,
			tov = 0,
			fp = 0;
		const seasons: Set<number> = new Set();
		for (let i = 0; i < count; i++) {
			seasons.add(games[i].season);
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
			if (game.stats.threePointersAttempted) threePtsAtt += game.stats.threePointersAttempted;
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
			if (game.stats.fantasyPts) fp += game.stats.fantasyPts;
		}

		return {
			min,
			fg,
			fga,
			ft,
			fta,
			threePts,
			threePtsAtt,
			pts,
			reb,
			ast,
			stl,
			blk,
			tov,
			fp,
			exp: seasons.size
		};
	}

	public calcAverages(games: DQNParsedGame[]) {
		const count = games.length || 0;
		const { min, fg, fga, ft, fta, threePts, threePtsAtt, pts, reb, ast, stl, blk, tov, fp, exp } =
			this.calcStatSums(games, count);

		return {
			avgMin: min / count,
			avgFg: fg / count,
			avgFga: fga / count,
			avgFt: ft / count,
			avgFta: fta / count,
			avgThreeP: threePts / count,
			avgThreePA: threePtsAtt / count,
			avgPts: pts / count,
			avgReb: reb / count,
			avgAst: ast / count,
			avgStl: stl / count,
			avgBlk: blk / count,
			avgTov: tov / count,
			avgFppg: fp / count,
			avgFppSzn: fp / exp
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

	public initRawData(inputs: DQNParsedGame[], labels: DQNParsedGame[]) {
		const {
			avgMin,
			avgFg,
			avgFga,
			avgFt,
			avgFta,
			avgThreeP,
			avgThreePA,
			avgPts,
			avgReb,
			avgAst,
			avgStl,
			avgBlk,
			avgTov,
			avgFppg,
			avgFppSzn
		} = this.calcAverages(inputs);
		const { min, fg, fga, ft, fta, threePts, threePtsAtt, pts, reb, ast, stl, blk, tov, fp, exp } =
			this.calcStatSums(inputs, inputs.length);
		const avgFgPct = fg && fga && fg !== 0 && fga !== 0 ? fg / fga : 0;
		const avgFtPct = ft && fta && ft !== 0 && fta !== 0 ? ft / fta : 0;
		const avg3Pct =
			threePts && threePtsAtt && threePts !== 0 && threePtsAtt !== 0 ? threePts / threePtsAtt : 0;

		const bdayStr = new Date(this.birthDate).toISOString();
		const maxYear = Math.max.apply(
			null,
			inputs.map((o) => o.season)
		);
		const age = this.getAge(bdayStr, dayjs(this.birthDate).year(maxYear).toDate());
		const lastSznGames = inputs.filter((o) => o.season === maxYear);
		const lastSznGameCount = lastSznGames.length;

		const {
			min: lastSznMinSum,
			fg: lastSznFgSum,
			fga: lastSznFgaSum,
			ft: lastSznFtSum,
			fta: lastSznFtaSum,
			threePts: lastSznThreePtsSum,
			threePtsAtt: lastSznThreePtsAttSum,
			pts: lastSznPtsSum,
			reb: lastSznRebSum,
			ast: lastSznAstSum,
			stl: lastSznStlSum,
			blk: lastSznBlkSum,
			tov: lastSznTovSum,
			fp: lastSznFpSum
		} = this.calcStatSums(lastSznGames, lastSznGameCount);
		const lastSznAvgFgPct =
			lastSznFgSum && lastSznFgaSum && lastSznFgSum !== 0 && lastSznFgaSum !== 0
				? lastSznFgSum / lastSznFgaSum
				: 0;
		const lastSznAvgFtPct =
			lastSznFtSum && lastSznFtaSum && lastSznFtSum !== 0 && lastSznFtaSum !== 0
				? lastSznFtSum / lastSznFtaSum
				: 0;
		const lastSznAvg3Pct =
			lastSznThreePtsSum &&
			lastSznThreePtsAttSum &&
			lastSznThreePtsSum !== 0 &&
			lastSznThreePtsAttSum !== 0
				? lastSznThreePtsSum / lastSznThreePtsAttSum
				: 0;
		const {
			avgMin: lastSznMin,
			avgFg: lastSznFg,
			avgFga: lastSznFga,
			avgFt: lastSznFt,
			avgFta: lastSznFta,
			avgThreeP: lastSznThreeP,
			avgThreePA: lastSznThreePA,
			avgPts: lastSznPts,
			avgReb: lastSznReb,
			avgAst: lastSznAst,
			avgStl: lastSznStl,
			avgBlk: lastSznBlk,
			avgTov: lastSznTov,
			avgFppg: lastSznFppg
		} = this.calcAverages(lastSznGames);

		/* TODO: format the above inputs to Array<number> and set this.inputs */
		this.inputs = [
			age, // 0 - age
			exp, // 1 - seasonsExp
			this.gpSum, // 2 - gamePlayedSum
			this.gsSum, // 3 - gamesStartedSum
			min, // 4 - careerMinSum
			fg, // 5 - careerFgSum
			fga, // 6 - careerFgaSum
			ft, // 7 - careerFtSum
			fta, // 8 - careerFtaSum
			threePts, // 9 - career3pSum
			threePtsAtt, // 10 - career3paSum
			pts, // 11 - careerPtsSum
			reb, // 12 - careerRebSum
			ast, // 13 - careerAstSum
			stl, // 14 - careerStlSum
			blk, // 15 - careerBlkSum
			tov, // 16 - careerTovSum
			fp, // 17 - careerFpSum
			avgMin, // 18 - careerAvgMin
			avgFg, // 19 - careerAvgFg
			avgFga, // 20 - careerAvgFga
			avgFgPct, // 21 - careerAvgFgPct
			avgFt, // 22 - careerAvgFt
			avgFta, // 23 - careerAvgFta
			avgFtPct, // 24 - careerAvgFtPct
			avgThreeP, // 25 - careerAvgThreePt
			avgThreePA, // 26 - careerAvgThreePtAtt
			avg3Pct, // 27 - careerAvgThreePtPct
			avgPts, // 28 - careerAvgPts
			avgReb, // 29 - careerAvgReb
			avgAst, // 30 - careerAvgAst
			avgStl, // 31 - careerAvgStl
			avgBlk, // 32 - careerAvgBlk
			avgTov, // 33 - careerAvgTov
			avgFppg, // 34 - career Avg Fantasy Points Per Game
			avgFppSzn, // 35 - career Avg Fantasy Points Per Season
			lastSznMinSum, // 36 - lastSznMinSum
			lastSznFgSum, // 37 - lastSznFgSum
			lastSznFgaSum, // 38 - lastSznFgaSum
			lastSznFtSum, // 39 - lastSznFtaSum
			lastSznFtaSum, // 40 - lastSznFtSum
			lastSznThreePtsSum, // 41 - lastSznThreePtsSum
			lastSznThreePtsAttSum, // 42 - lastSznThreePtsAttSum
			lastSznPtsSum, // 43 - lastSznPtsSum
			lastSznRebSum, // 44 - lastSznRebSum
			lastSznAstSum, // 45 - lastSznAstSum
			lastSznStlSum, // 46 - lastSznStlSum
			lastSznBlkSum, // 47 - lastSznBlkSum
			lastSznTovSum, // 48 - lastSznTovSum
			lastSznFpSum, // 49 - lastSznFpSum
			lastSznMin, // 50 - lastSznAvgMin
			lastSznFg, // 51 - lastSznAvgFg
			lastSznFga, // 52 - lastSznAvgFga
			lastSznAvgFgPct, // 53 - lastSznAvgFgPct
			lastSznFt, // 54 - lastSznAvgFt
			lastSznFta, // 55 - lastSznAvgFta
			lastSznAvgFtPct, // 56 - lastSznAvgFtPct
			lastSznThreeP, // 57 - lastSznAvgThreePt
			lastSznThreePA, // 58 - lastSznAvgThreePtAtt
			lastSznAvg3Pct, // 59 - lastSznAvgThreePtPct
			lastSznPts, // 60 - lastSznAvgPts
			lastSznReb, // 61 - lastSznAvgReb
			lastSznAst, // 62 - lastSznAvgAst
			lastSznStl, // 63 - lastSznAvgStl
			lastSznBlk, // 64 - lastSznAvgBlk
			lastSznTov, // 65 - lastSznAvgTov
			lastSznFppg, // 66 - lastSzn Avg Fantasy Points Per Game
			...this.positionEncd // position one hot encoded (occupies index: 67 - 73)
		];
		console.log('this.inputs.length', this.inputs.length);

		const { fp: labelFp } = this.calcStatSums(labels, labels.length);
		this.labels = [labelFp];
		/* TODO: set this.rawData */
	}

	/* given game, parses and returns cleaned stats */
	public parseGame(game: Game2Object): DQNParsedGame | undefined {
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
			if (stats.totals) {
				(stats.totals as PlayerStatTotals).fantasyPts = calcFantasyPoints(stats.totals);
				const totals = stats.totals;
				const parsedGame: DQNParsedGame = {
					season,
					stats: totals
				};
				return parsedGame;
			}
			return undefined;
		}

		const [{ stats }] = homeFiltered;
		if (stats.totals) {
			(stats.totals as PlayerStatTotals).fantasyPts = calcFantasyPoints(stats.totals);
			const totals = stats.totals;
			const parsedGame: DQNParsedGame = {
				season,
				stats: totals
			};
			return parsedGame;
		}
		return undefined;
	}

	/* given array of games, returns parsedGames */
	public parseGames(games: Game2Object[]): DQNParsedGame[] {
		const gameCount = games.length;
		const parsedGames: DQNParsedGame[] = [];
		for (let i = 0; i < gameCount; i++) {
			const tempGame = games[i];
			// console.log(tempGame);
			// console.log('home.players:', tempGame.home.players);
			// console.log('visitor.players:', tempGame.visitor.players);
			const parsedGame = this.parseGame(tempGame);
			// console.log(parsedGame.stats);
			if (parsedGame && parsedGame.stats.minutes && parsedGame.stats.minutes > 0) {
				parsedGames.push(parsedGame);
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
