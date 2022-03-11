export interface IColHeader {
	title: string;
	subtext?: string;
	key?: string;
}

export interface ISortBy {
	col: string;
	ascending: boolean;
}
