export interface IDailyGameTeam {
	_id: string;
	infoCommon: {
		city: string;
		state: string;
		country: string;
		name: string;
		allNames: string[];
		abbreviation: string;
		nbaAbbreviation?: string;
		nickname?: string;
		conference?: string;
		division?: string;
		code: string;
		slug: string;
		minYear: string;
		maxYear: string;
	};
	score?: number;
}

export type DailyGame = {
	date: Date;
	isOver: boolean;
	period?: string;
	periodValue?: number;
	displayClock?: string;
	clock?: number;
	home: {
		_id: string;
		infoCommon: {
			city: string;
			state: string;
			country: string;
			name: string;
			allNames: string[];
			abbreviation: string;
			nbaAbbreviation?: string;
			nickname?: string;
			conference?: string;
			division?: string;
			code: string;
			slug: string;
			minYear: string;
			maxYear: string;
		};
		score?: number;
	};
	visitor: {
		_id: string;
		infoCommon: {
			city: string;
			state: string;
			country: string;
			name: string;
			allNames: string[];
			abbreviation: string;
			nbaAbbreviation?: string;
			nickname?: string;
			conference?: string;
			division?: string;
			code: string;
			slug: string;
			minYear: string;
			maxYear: string;
		};
		score?: number;
	};
};

export type DailyGames = { [key: string]: DailyGame };

export type Typify<T> = { [K in keyof T]: Typify<T[K]> };

export type GraphPoint = {
	x: number;
	y: number;
};

export type GraphData = GraphPoint[];

export type TFJSTrainingData = {
	val_mse: GraphData;
	val_loss: GraphData;
	mse: GraphData;
	loss: GraphData;
};

export type TFJSEpochData = {
	val_loss: number;
	val_mse: number;
	mse: number;
	loss: number;
};
