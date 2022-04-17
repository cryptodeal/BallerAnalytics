import dayjs from 'dayjs';
import type { Player2Object } from '@balleranalytics/nba-api-ts';
import type { PlayerData, ParsedGame } from '../../core/data/types';
import type { BaseInputs, RawData } from '../types';

export class Player {
	public _playerId: Player2Object['_id'];
	public _playerBirthdate!: Date;
	public _startSeason: number;
	public _processedData!: number[];
	public _playerData!: PlayerData;
	public inputs!: BaseInputs;
	public rawData: RawData = [];
	public labels: number[] = [];
	// trainingData:
	// _regularSznBasicStats:

	constructor(playerId: Player2Object['_id'], startSeason: number, birthDate?: Date) {
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
		const inputGames: ParsedGame[] = [];
		for (let i = 0; i < trainingKeys.length; i++) {
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
			tov
		];
		const { fppg } = this.calcAverages(this._playerData[maxYear.toString()]);
		this.labels = [fppg];
	}

	processSznData() {
		const keys = Object.keys(this._playerData);
		const seasonYears = keys.map((key) => parseInt(key));
		const maxYear = Math.max(...seasonYears);
		const inputKeys = keys.filter((k) => k !== maxYear.toString());
		const labelKeys = keys.filter((k) => k !== this._startSeason.toString());
		for (let i = 0; i < inputKeys.length; i++) {
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
				tov
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