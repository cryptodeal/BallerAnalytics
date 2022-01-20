export interface IEspnScheduleDataGameSeason {
	year: number;
	type: number;
	slug: string;
}

export interface IEspnScheduleDataGameCompVenueAddy {
	city: string;
	state: string;
}

export interface IEspnScheduleDataGameCompVenue {
	address: IEspnScheduleDataGameCompVenueAddy;
	fullName: string;
	indoor: boolean;
	id: string;
	capacity: number;
}

interface IEspnScheduleDataGameCompTicketLink {
	href: string;
}

export interface IEspnScheduleDataGameCompTicket {
	summary: string;
	numberAvailable: number;
	links: IEspnScheduleDataGameCompTicketLink[];
}

export interface IEspnScheduleDataGameCompTeamRecordSplits {
	summary: string;
	name: string;
	type: string;
}

export interface IEspnScheduleDataGameCompTeamRecordTotal
	extends IEspnScheduleDataGameCompTeamRecord {
	abbreviation: string;
}

export interface IEspnScheduleBasicLink {
	rel: string[];
	href: string;
}

export interface IEspnScheduleAdvancedLink extends IEspnScheduleBasicLink {
	isExternal: boolean;
	shortText: string;
	language: string;
	text: string;
	isPremium: boolean;
}

interface IEspnScheduleDataGameCompTeamLeaderTeam {
	id: string;
}

export interface IEspnScheduleDataGameCompTeamLeaderAthlete {
	displayName: string;
	headshot: string;
	jersey: string;
	fullName: string;
	active: boolean;
	links: IEspnScheduleBasicLink[];
	id: string;
	position: {
		abbreviation: string;
	};
	team: IEspnScheduleDataGameCompTeamLeaderTeam;
	shortName: string;
}

export interface IEspnScheduleDataGameCompTeamLeaderItem {
	displayValue: string;
	athlete: IEspnScheduleDataGameCompTeamLeaderAthlete;
	team: IEspnScheduleDataGameCompTeamLeaderTeam;
	value: number;
}

export interface IEspnScheduleDataGameCompTeamLeader {
	shortDisplayName: string;
	displayName: string;
	name: string;
	leaders: IEspnScheduleDataGameCompTeamLeaderItem[];
	abbreviation: string;
}

export interface IEspnScheduleDataGameCompTeamLink extends IEspnScheduleBasicLink {
	isExternal: boolean;
	text: string;
	isPremium: boolean;
}

type StatsName =
	| 'rebounds'
	| 'avgRebounds'
	| 'assists'
	| 'fieldGoalsAttempted'
	| 'fieldGoalsMade'
	| 'fieldGoalPct'
	| 'freeThrowPct'
	| 'freeThrowsAttempted'
	| 'freeThrowsMade'
	| 'points'
	| 'threePointPct'
	| 'threePointFieldGoalsAttempted'
	| 'threePointFieldGoalsMade'
	| 'avgPoints'
	| 'avgAssists'
	| 'threePointFieldGoalPct';

type StatsAbbreviation =
	| 'REB'
	| 'AST'
	| 'FGA'
	| 'FGM'
	| 'FG%'
	| 'FT%'
	| 'FTA'
	| 'FTM'
	| 'PTS'
	| '3P%'
	| '3PA'
	| '3PM';

export interface IEspnScheduleDataGameCompTeamStat {
	displayValue: string;
	name: StatsName;
	rankDisplayValue: string;
	abbreviation: StatsAbbreviation;
}

export interface IEspnScheduleDataGameCompTeam {
	uid: string;
	homeAway: string;
	score: string;
	records: [
		IEspnScheduleDataGameCompTeamRecordTotal,
		IEspnScheduleDataGameCompTeamRecord,
		IEspnScheduleDataGameCompTeamRecord
	];
	leaders: IEspnScheduleDataGameCompTeamLeader[];
	id: string;
	team: {
		alternateColore: string;
		venue: {
			id: string;
		};
		color: string;
		displayName: string;
		abbreviation: string;
		isActive: boolean;
		shortDisplayName: string;
		uid: string;
		name: string;
		logo: string;
		links: IEspnScheduleDataGameCompTeam[];
		id: string;
	};
	type: string;
	order: number;
	statistics: IEspnScheduleDataGameCompTeamStat[];
}

export interface IEspnScheduleDataGameCompLastPlayAthlete {
	displayName: string;
	headshot: string;
	jersey: string;
	fullName: string;
	links: IEspnScheduleBasicLink[];
	id: string;
	position: string;
	team: {
		id: string;
	};
	shortName: string;
}

export interface IEspnScheduleDataGameCompLastPlay {
	athletesInvolved: IEspnScheduleDataGameCompLastPlayAthlete[];
	probability: {
		homeWinPercentage: number;
		awayWinPercentage: number;
		tiePercentage: number;
	};
	id: string;
	text: string;
	team: {
		id: string;
	};
	type: {
		id: string;
		text: string;
	};
	scoreValue: number;
}

export interface IEspnScheduleGameStatusType {
	name: string;
	description: string;
	id: string;
	state: string;
	completed: boolean;
	detail: string;
	shortDetail: string;
}

export interface IEspnScheduleGameStatus {
	period: number;
	displayClock: string;
	clock: number;
	type: IEspnScheduleGameStatusType;
}

export interface IEspnScheduleDataGameComp {
	date: Date;
	venue: IEspnScheduleDataGameCompVenue;
	conferenceCompeition: boolean;
	notes: string[];
	tickets: IEspnScheduleDataGameCompTicket[];
	timeValid: boolean;
	geoBroadcasts: string[];
	broadcasts: string[];
	type: {
		id: string;
		abbreviation: string;
	};
	uid: string;
	competitors: [IEspnScheduleDataGameCompTeam, IEspnScheduleDataGameCompTeam];
	id: string;
	neutralSite: boolean;
	recent: boolean;
	attendance: number;
	situation: {
		lastPlay: IEspnScheduleDataGameCompLastPlay;
	};
	startDate: Date;
	status: IEspnScheduleGameStatus;
}

export interface IEspnScheduleDataGame {
	date: Date;
	uid: string;
	name: string;
	competitions: [IEspnScheduleDataGameComp];
	season: IEspnScheduleDataGameSeason;
	links: IEspnScheduleAdvancedLink[];
	id: string;
	shortName: string;
	status: IEspnScheduleGameStatus;
}

export interface IEspnScheduleSeasonObj {
	year: number;
	type: number;
}

export interface IEspnScheduleData {
	calendar: Date[];
	leagueName: string;
	calendartype: string;
	leagues: string[];
	games: IEspnScheduleDataGame[];
	seasonObj: IEspnScheduleSeasonObj;
	apiDate: string;
}

export interface IEspnSchedule {
	[Date: string]: IEspnScheduleData | undefined;
}

type EspnBoxscoreTeamStatName =
	| 'fieldGoalsMade-fieldGoalsAttempted'
	| 'fieldGoalPct'
	| 'threePointFieldGoalsMade-threePointFieldGoalsAttempted'
	| 'threePointFieldGoalPct'
	| 'freeThrowsMade-freeThrowsAttempted'
	| 'freeThrowPct'
	| 'totalRebounds'
	| 'offensiveRebounds'
	| 'defensiveRebounds'
	| 'steals'
	| 'blocks'
	| 'assists'
	| 'steals'
	| 'blocks'
	| 'turnovers'
	| 'teamTurnovers'
	| 'totalTurnovers'
	| 'technicalFouls'
	| 'totalTechnicalFouls'
	| 'flagrantFouls'
	| 'turnoverPoints'
	| 'fastBreakPoints'
	| 'pointsInPaint'
	| 'fouls'
	| 'largestLead';

type EspnBoxscoreTeamStatLabel =
	| 'FG'
	| 'Field Goal %'
	| '3PT'
	| 'Three Point %'
	| 'FT'
	| 'Free Throw %'
	| 'Rebounds'
	| 'Offensive Rebounds'
	| 'Defensive Rebounds'
	| 'Assists'
	| 'Steals'
	| 'Blocks'
	| 'Turnovers'
	| 'Team Turnovers'
	| 'Total Turnovers'
	| 'Technical Fouls'
	| 'Total Technical Fouls'
	| 'Flagrant Fouls'
	| 'Points Off Turnovers'
	| 'Fast Break Points'
	| 'Points in Paint'
	| 'Fouls'
	| 'Largest Lead';

type EspnBoxscoreTeamStatAbbreviation =
	| 'FG%'
	| '3P%'
	| 'FT%'
	| 'REB'
	| 'OR'
	| 'DR'
	| 'AST'
	| 'STL'
	| 'BLK'
	| 'TO'
	| 'TTO'
	| 'ToTO'
	| 'TECH'
	| 'FLAG'
	| 'PTS OFF TO'
	| 'FBPs'
	| 'PIP'
	| 'PF'
	| 'LL';

export interface IEspnBoxscoreTeamDataStat {
	displayValue: string;
	name: EspnBoxscoreTeamStatName;
	label: EspnBoxscoreTeamStatLabel;
	abbreviation?: EspnBoxscoreTeamStatAbbreviation;
}

export interface IEspnBoxscoreTeam {
	shortDisplayName: string;
	uid: string;
	alternateColor: string;
	color: string;
	displayName: string;
	name: string;
	logo: string;
	location: string;
	id: string;
	abbreviation: string;
	slug: string;
}

export interface IEspnBoxscoreTeamData {
	team: IEspnBoxscoreTeam;
	statistics: IEspnBoxscoreTeamDataStat[];
}

export interface IEspnBoxscorePlayerDataStatPlayerAthleteLink {
	href: string;
	text: string;
}

export interface IEspnBoxscorePlayerDataStatPlayerAthlete {
	uid: string;
	displayName: string;
	headshot: {
		alt: string;
		href: string;
	};
	jersey: string;
	guid: string;
	links: IEspnBoxscorePlayerDataStatPlayerAthleteLink[];
	id: string;
	position: {
		displayName: string;
		name: string;
		abbreviation: string;
	};
	shortName: string;
}

export interface IEspnBoxscorePlayerDataStatPlayer {
	reason: string;
	starter: boolean;
	athlete: IEspnBoxscorePlayerDataStatPlayerAthlete;
	ejected: boolean;
	stats: [
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string
	];
	didNotPlay: boolean;
	active: boolean;
}

type IEspnBoxscorePlayerDataStatName =
	| 'MIN'
	| 'FG'
	| '3PT'
	| 'FT'
	| 'OREB'
	| 'DREB'
	| 'REB'
	| 'AST'
	| 'STL'
	| 'BLK'
	| 'TO'
	| 'PF'
	| '+/-'
	| 'PTS';

export interface IEspnBoxscorePlayerDataStat {
	names: [
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName
	];
	athletes: IEspnBoxscorePlayerDataStatPlayer[];
	totals: [
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string
	];
	labels: [
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName,
		IEspnBoxscorePlayerDataStatName
	];
}

export interface IEspnBoxscorePlayerData {
	team: IEspnBoxscoreTeam;
	statistics: [IEspnBoxscorePlayerDataStat];
}

export interface IEspnBoxscore {
	teams: [IEspnBoxscoreTeamData, IEspnBoxscoreTeamData];
	players: [IEspnBoxscorePlayerData, IEspnBoxscorePlayerData];
}

export interface ParsedEspnBoxscoreTeamPlayer {
	reason: string;
	starter: boolean;
	espnId: string;
	jersey: string;
	position: {
		displayName: string;
		name: string;
		abbreviation: string;
	};
	ejected: boolean;
	stats?: {
		minutes: number;
		fieldGoalsMade: number;
		fieldGoalsAttempted: number;
		threePointersMade: number;
		threePointersAttempted: number;
		freeThrowsMade: number;
		freeThrowsAttempted: number;
		offReb: number;
		defReb: number;
		totalReb: number;
		assists: number;
		steals: number;
		blocks: number;
		turnovers: number;
		personalFouls: number;
		plusMinus: number;
		points: number;
	};
}

export interface ParsedEspnBoxscoreTeam {
	fieldGoalsMade: number | undefined;
	fieldGoalsAttempted: number | undefined;
	fieldGoalsPct: number | undefined;
	threePointersMade: number | undefined;
	threePointersAttempted: number | undefined;
	threePointersPct: number | undefined;
	freeThrowsMade: number | undefined;
	freeThrowsAttempted: number | undefined;
	freeThrowsPct: number | undefined;
	totalReb: number | undefined;
	offReb: number | undefined;
	defReb: number | undefined;
	assists: number | undefined;
	steals: number | undefined;
	blocks: number | undefined;
	turnovers: {
		tov: number | undefined;
		team: number | undefined;
		total: number | undefined;
	};
	fouls: {
		technical: number | undefined;
		totalTechnical: number | undefined;
		flagrant: number | undefined;
		fouls: number | undefined;
	};
	turnoverPoints: number | undefined;
	fastBreakPoints: number | undefined;
	pointsInPaint: number | undefined;
	largestLead: number | undefined;
	players: ParsedEspnBoxscoreTeamPlayer[];
}

export interface ParsedEspnBoxscore {
	[teamName: string]: ParsedEspnBoxscoreTeam | undefined;
}
