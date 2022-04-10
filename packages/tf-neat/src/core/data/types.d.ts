import type { Player2Object, Player2Season, Game2Object } from '@balleranalytics/nba-api-ts';

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

export type ParsedGame = {
	date: Date;
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
