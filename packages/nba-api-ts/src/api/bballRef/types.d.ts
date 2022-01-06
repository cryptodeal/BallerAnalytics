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
