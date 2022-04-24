export interface BBRefTeamRosterItem {
	number?: string;
	playerUrl: string;
	twoWay: boolean;
	position: string;
	height: {
		feet: number;
		inches: number;
	};
	weight: number;
	birthDate?: Date;
	birthCountry?: string;
	exp: string;
	college: string;
}

export interface PlayerCareerStatSeason {
	season: number;
	age: number;
	teamAbbrev: string;
	league: string;
	position?: string;
	games: number;
	gamesStarted?: number;
	minPerGame?: number;
	fgPerGame: number;
	fgaPerGame: number;
	fgPct?: number;
	fg3PerGame?: number;
	fg3aPerGame?: number;
	fg3Pct?: number;
	fg2PerGame?: number;
	fg2aPerGame?: number;
	fg2Pct?: number;
	efgPct?: number;
	ftPerGame: number;
	ftaPerGame: number;
	ftPct?: number;
	orbPerGame?: number;
	drbPerGame?: number;
	trbPerGame?: number;
	astPerGame: number;
	stlPerGame?: number;
	blkPerGame?: number;
	tovPerGame?: number;
	pfPerGame: number;
	ptsPerGame: number;
}

export interface PlayerCareerAdvStats {
	season: number;
	teamAbbrev: string;
	pEffRate?: number;
	tsPct?: number;
	threePtAttRate?: number;
	ftAttRate?: number;
	offRebPct?: number;
	defRebPct?: number;
	totalRebPct?: number;
	assistPct?: number;
	stlPct?: number;
	blkPct?: number;
	tovPct?: number;
	usgPct?: number;
	offWinShares?: number;
	defWinShares?: number;
	winShares?: number;
	winSharesPer48?: number;
	offBoxPlusMinus?: number;
	defBoxPlusMinus?: number;
	boxPlusMinus?: number;
	valOverBackup?: number;
}

export interface ParsedAdvStats extends PlayerCareerAdvStats {
	season?: number;
	teamAbbrev?: string;
}

export interface BballRefPlayerQueryResItem {
	name: string;
	playerUrl: string;
}
