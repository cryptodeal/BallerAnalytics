import rfdc from 'rfdc';
import seedrandom from 'seedrandom';
import Random, { RNG } from 'random';
import { EspnScoring } from '../core/genetics/models';
import type { PlayerStatTotals } from '@balleranalytics/nba-api-ts';
import { nanoid } from 'nanoid';

/** Credit p5.org:
 *  Random # generator
 * Also selects random element from array of elements
 */

export const random = (min?: number | number[], max?: number) => {
	const rand = seededRandom();

	if (typeof min === undefined || !min) {
		return rand;
	} else if (typeof max === undefined || !max) {
		if (min instanceof Array || Array.isArray(min)) {
			return min[Math.floor(rand * min.length)];
		}
		return rand * min;
	} else {
		if (min instanceof Array || Array.isArray(min))
			throw new Error(
				`Error: random() cannot accept min typeof Array AND max params at the same time`
			);
		if (min > max) {
			const tmp = min;
			min = max;
			max = tmp;
		}
		return rand * (max - min) + min;
	}
};

const seedString = nanoid();
const seed = seedrandom(seedString) as unknown as RNG;
Random.use(seed);
export const seededRandom = () => Random.float();

export const seededRandomInt = () => Random.int(0, Number.MAX_SAFE_INTEGER);

export const clone = (obj: unknown) => {
	if (null == obj || 'object' != typeof obj) return obj;
	return rfdc({ proto: true })(obj);
};

export const sleep = (milliseconds?: number) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const constrain = (n: number, low: number, high: number) => Math.max(Math.min(n, high), low);

export const map = (
	n: number,
	start1: number,
	stop1: number,
	start2: number,
	stop2: number,
	withinBounds?: boolean
) => {
	const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
	if (!withinBounds) {
		return newval;
	}
	if (start2 < stop2) {
		return constrain(newval, start2, stop2);
	} else {
		return constrain(newval, stop2, start2);
	}
};

let previous = false;
let y2 = 0;

export const randomGaussian = (mean?: number, sd = 1) => {
	let y1: number, x1: number, x2: number, w: number;
	if (previous) {
		y1 = y2;
		previous = false;
	} else {
		do {
			x1 = random(2) - 1;
			x2 = random(2) - 1;
			w = x1 * x1 * x2 * x2;
		} while (w >= 1);
		w = Math.sqrt((-2 * Math.log(w)) / w);
		y1 = x1 * w;
		y2 = x2 * w;
		previous = true;
	}
	const m = mean || 0;
	const s = sd || 1;
	return y1 * s + m;
};

export const calcFantasyPoints = (playerGameStats: PlayerStatTotals): number => {
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

export class MovingAverager {
	private buffer: (number | null)[] = [];
	constructor(bufferLength: number) {
		for (let i = 0; i < bufferLength; i++) {
			this.buffer.push(null);
		}
	}

	size() {
		return this.buffer.length;
	}

	append(x: number) {
		this.buffer.shift();
		this.buffer.push(x);
	}

	average(least = -20) {
		return (
			this.buffer.map((v) => (v === null ? least : v)).reduce((x, prev) => x + prev) /
			this.buffer.length
		);
	}
}

export const weightedRandomItem = (
	data: number[],
	prob: Uint8Array | Float32Array | Int32Array | Array<number>
) => {
	/*
    if(data.length !== prob.length) {
      throw new Error('Data and probability arrays are not of same length');
    }
  */
	const rand = seededRandom();
	let threshold = 0;
	const length = prob.length;
	for (let i = 0; i < length; i++) {
		threshold += prob[i];
		if (threshold > rand) {
			return data[i];
		}
	}
};

export const randomItem = (data: number[]) => {
	const probs: number[] = [];
	const length = data.length;
	for (let i = 0; i < length; i++) {
		probs.push(1 / length);
	}
	return weightedRandomItem(data, probs);
};

export const combinations = (
	array: any[],
	size: number,
	output: any[][],
	start = 0,
	initialStuff: any[] = []
) => {
	if (initialStuff.length >= size) {
		output.push(initialStuff);
	} else {
		let i;
		for (i = start; i < array.length; ++i) {
			combinations(array, size, output, i + 1, initialStuff.concat(array[i]));
		}
	}
};

export const ones = (taille: number) => {
	return [...Array(taille)].map(Number.prototype.valueOf, 1);
};

export const argMax = (array: number[]) => {
	return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
};
