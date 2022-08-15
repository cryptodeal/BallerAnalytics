import type { Player2Object, Player2Season } from '../../../';

export type SavedPlayerData = {
	_id: string;
	name: {
		full: string;
		display?: string;
	};
	rawData: {
		inputs: number[];
		labels: number[];
	};
	positionEncd: PositionEncoded;
};

export type PlayerStatTotals = {
	fantasyPts?: number;
	minutes?: number;
	seconds?: number;
	fieldGoalsMade?: number;
	fieldGoalsAttempted?: number;
	fieldGoalsPct?: number;
	threePointersMade?: number;
	threePointersAttempted?: number;
	threePointersPct?: number;
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
	plusMinus?: number;
	advanced: {
		trueShootingPct?: number;
		effectiveFieldGoalPct?: number;
		threePointAttemptRate?: number;
		freeThrowAttemptRate?: number;
		offRebPct?: number;
		defRebPct?: number;
		totalRebPct?: number;
		assistPct?: number;
		stealPct?: number;
		blockPct?: number;
		turnoverPct?: number;
		usagePct?: number;
		offRating?: number;
		defRating?: number;
		boxPlusMinus?: number;
	};
};

type StatTotals = {
	totals: PlayerStatTotals;
};
export type ParsedGame = {
	date: Date;
	stats: PlayerStatTotals;
};

export type DQNParsedGame = {
	season: number;
	stats: PlayerStatTotals;
};

export type Player2SeasonParsed = Player2Season & {
	regularSeason: {
		games: ParsedGame[];
	};
};

export type Player2ObjectParsed = Player2Object & {
	seasons: Player2SeasonParsed[];
};

export type SznGames = {
	year: number;
	games: ParsedGame[];
};

export type PlayerData = Record<number, ParsedGame[]>;

export type BaseFeatures = number[];

export interface IBaseConfig {
	batchSize: number;
	epochs: number;
	tfvis?: boolean;
}

export type BaseInputs = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number
];

export type OneHotInput = 0 | 1;

export type PositionEncoded = [
	OneHotInput, // PG
	OneHotInput, // SG
	OneHotInput, // SF
	OneHotInput, // PF
	OneHotInput, // C
	OneHotInput, // G
	OneHotInput // F
];

export interface IRawData {
	inputs: BaseInputs;
	labels: [number];
}

export type RawData = IRawData[];
