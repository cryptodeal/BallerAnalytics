interface NbaSeasonMeta {
	calendar_date: string;
	season_year: string;
	stats_season_year: string;
	stats_season_id: string;
	stats_season_stage: string;
	roster_season_year: string;
	schedule_season_year: string;
	standings_season_year: string;
	season_id: string;
	display_year: string;
	display_season: string;
	season_stage: string;
	league_id: string;
}

interface NbaSeasonNext {
	url: string;
}

interface NbaBoxScoreGameOfficial {
	person_id: string;
	first_name: string;
	last_name: string;
	jersey_number: string;
}

interface NbaBoxScoreGameBroadcaster {
	scope: string;
	home_visitor: string;
	display_name: string;
}

interface NbaGameBroadcasters {
	radio?: {
		broadcaster: NbaBoxScoreGameBroadcaster[];
	};
	tv?: {
		broadcaster: NbaBoxScoreGameBroadcaster[];
	};
}

interface NbaPeriodTime {
	period_value: string;
	period_status: string;
	game_status: string;
	game_clock: string;
	total_periods: string;
	period_name: string;
}

interface NbaGameTeamLineScorePeriod {
	period_value: string;
	period_name: string;
	score: string;
}

interface NbaBoxScoreGameTeamStatLeader {
	PersonID: string;
	PlayerCode: string;
	FirstName: string;
	LastName: string;
}

interface NbaBoxScoreGameTeamStatLeaderItem {
	PlayerCount: string;
	StatValue: string;
	leader: NbaBoxScoreGameTeamStatLeader[];
}

interface NbaBoxScoreGameTeamStatLeaders {
	Points: NbaBoxScoreGameTeamStatLeaderItem;
	Assists: NbaBoxScoreGameTeamStatLeaderItem;
	Rebounds: NbaBoxScoreGameTeamStatLeaderItem;
}

interface NbaBoxScoreGameTeamStats {
	points: string;
	field_goals_made: string;
	field_goals_attempted: string;
	field_goals_percentage: string;
	free_throws_made: string;
	free_throws_attempted: string;
	free_throws_percentage: string;
	three_pointers_made: string;
	three_pointers_attempted: string;
	three_pointers_percentage: string;
	rebounds_offensive: string;
	rebounds_defensive: string;
	team_rebounds: string;
	assists: string;
	fouls: string;
	team_fouls: string;
	technical_fouls: string;
	steals: string;
	turnovers: string;
	team_turnovers: string;
	blocks: string;
	short_timeout_remaining: string;
	full_timeout_remaining: string;
}

interface NbaBoxScoreGameTeamPlayer {
	first_name: string;
	last_name: string;
	jersey_number: string;
	person_id: string;
	position_short: string;
	position_full: string;
	minutes: string;
	seconds: string;
	points: string;
	field_goals_made: string;
	field_goals_attempted: string;
	player_code: string;
	free_throws_made: string;
	free_throws_attempted: string;
	three_pointers_made: string;
	three_pointers_attempted: string;
	rebounds_offensive: string;
	rebounds_defensive: string;
	assists: string;
	fouls: string;
	steals: string;
	turnovers: string;
	team_turnovers: string;
	blocks: string;
	plus_minus: string;
	on_court: string;
	starting_position: string;
}

interface NbaBoxScoreGameTeamPlayers {
	player: NbaBoxScoreGameTeamPlayer[];
}

interface NbaBoxScoreGameTeam {
	id: string;
	team_key: string;
	city: string;
	abbreviation: string;
	nickname: string;
	url_name: string;
	team_code: string;
	score: string;
	linescores: {
		period: NbaGameTeamLineScorePeriod[];
	};
	Leaders: NbaBoxScoreGameTeamStatLeaders;
	stats: NbaBoxScoreGameTeamStats;
	players: NbaBoxScoreGameTeamPlayers;
}

interface NbaGameLpAudio {
	ENG: string;
	SPA: string;
}

interface NbaGameLpVideo {
	avl: string;
	onAir: string;
	archBB: string;
}

interface NbaGameLpTeam {
	audio: NbaGameLpAudio;
	video: NbaGameLpVideo;
}

interface NbaGameLp {
	lp_video: string;
	condensed_bb: string;
	visitor: NbaGameLpTeam;
	home: NbaGameLpTeam;
}

interface NbaGameDl {
	link: [];
}

interface NbaTicket {
	ticket_link: string;
}

interface NbaBoxScoreGame {
	id: string;
	game_url: string;
	season_id: string;
	date: string;
	time: string;
	arena: string;
	city: string;
	state: string;
	country: string;
	home_start_date: string;
	home_start_time: string;
	visitor_start_date: string;
	visitor_start_time: string;
	previewAvailable: string;
	recapAvailable: string;
	notebookAvailable: string;
	tnt_ot: string;
	attendance: string;
	officials: NbaBoxScoreGameOfficial[];
	ticket: NbaTicket;
	broadcasters: NbaGameBroadcasters;
	period_time: NbaPeriodTime;
	visitor: NbaBoxScoreGameTeam;
	home: NbaBoxScoreGameTeam;
	lp: NbaGameLp;
	dl: NbaGameDl;
}

interface NbaSportsMeta {
	date: string;
	endToEndMs: string;
	consolidatedDomKey: string;
	seasonMeta: NbaSeasonMeta;
	next: NbaSeasonNext;
}

export interface NbaBoxScoreData {
	sports_meta: NbaSportsMeta;
	game: NbaBoxScoreGame;
}
export interface NbaBoxScore {
	sports_content: NbaBoxScoreData;
}

interface NbaScoreboardTeam {
	id: string;
	team_key: string;
	city: string;
	abbreviation: string;
	nickname: string;
	url_name: string;
	team_code: string;
	score: string;
	linescores: NbaGameTeamLineScorePeriod[];
}

export interface NbaScoreboardGame {
	id: string;
	game_url: string;
	season_id: string;
	date: string;
	time: string;
	arena: string;
	city: string;
	state: string;
	country: string;
	home_start_date: string;
	home_start_time: string;
	visitor_start_date: string;
	visitor_start_time: string;
	previewAvailable: string;
	recapAvailable: string;
	notebookAvailable: string;
	tnt_ot: string;
	buzzerBeater: string;
	ticket: NbaTicket;
	period_time: NbaPeriodTime;
	lp: NbaGameLp;
	dl: NbaGameDl;
	broadcasters: NbaGameBroadcasters;
	visitor: NbaScoreboardTeam;
	home: NbaScoreboardTeam;
}

export interface NbaScoreboardGames {
	game: NbaScoreboardGame[];
}

export interface NbaScoreboardData {
	sports_meta: NbaSportsMeta;
	games: NbaScoreboardGames;
}

export interface NbaScoreboard {
	sports_content: NbaScoreboardData;
}

export interface NbaBoxScoreQuery {
	GameID: string;
	LeagueID: string;
	endPeriod: string;
	endRange: string;
	rangeType: string;
	startPeriod: string;
	startRange: string;
}

export type PageableNbaBoxScoreQuery = {
	success: boolean;
	message: string;
} & {
	[key: string]: NbaBoxScoreQuery;
};

export interface NbaBoxScoreResPlayerStats {
	minutes: string;
	fieldGoalsMade: number;
	fieldGoalsAttempted: number;
	fieldGoalsPercentage: number;
	threePointersMade: number;
	threePointersAttempted: number;
	threePointersPercentage: number;
	freeThrowsMade: number;
	freeThrowsAttempted: number;
	freeThrowsPercentage: number;
	reboundsOffensive: number;
	reboundsDefensive: number;
	reboundsTotal: number;
	assists: number;
	steals: number;
	blocks: number;
	turnovers: number;
	foulsPersonal: number;
	points: number;
	plusMinusPoints: number;
}

export interface NbaBoxScoreResPlayer {
	personId: number;
	firstName: string;
	familyName: string;
	nameI: string;
	playerSlug: string;
	position: string;
	comment: string;
	jerseyNum: string;
	statistics: NbaBoxScoreResPlayerStats;
}

export interface NbaBoxScoreResTeamGroupStats {
	minutes: string;
	fieldGoalsMade: number;
	fieldGoalsAttempted: number;
	fieldGoalsPercentage: number;
	threePointersMade: number;
	threePointersAttempted: number;
	threePointersPercentage: number;
	freeThrowsMade: number;
	freeThrowsAttempted: number;
	freeThrowsPercentage: number;
	reboundsOffensive: number;
	reboundsDefensive: number;
	reboundsTotal: number;
	assists: number;
	steals: number;
	blocks: number;
	turnovers: number;
	foulsPersonal: number;
	points: number;
}

export interface NbaBoxScoreResTeamStats {
	minutes: string;
	fieldGoalsMade: number;
	fieldGoalsAttempted: number;
	fieldGoalsPercentage: number;
	threePointersMade: number;
	threePointersAttempted: number;
	threePointersPercentage: number;
	freeThrowsMade: number;
	freeThrowsAttempted: number;
	freeThrowsPercentage: number;
	reboundsOffensive: number;
	reboundsDefensive: number;
	reboundsTotal: number;
	assists: number;
	steals: number;
	blocks: number;
	turnovers: number;
	foulsPersonal: number;
	points: number;
	plusMinusPoints: number;
}

export interface NbaBoxScoreResTeam {
	teamId: number;
	teamCity: string;
	teamName: string;
	teamTricode: string;
	teamSlug: string;
	players: NbaBoxScoreResPlayer[];
	statistics: NbaBoxScoreResTeamStats;
	starters: NbaBoxScoreResTeamGroupStats;
	bench: NbaBoxScoreResTeamGroupStats;
}

export interface BoxScoreTraditional {
	gameId: string;
	awayTeamId: number;
	homeTeamId: number;
	homeTeam: NbaBoxScoreResTeam;
	awayTeam: NbaBoxScoreResTeam;
}

export interface NbaBoxScoreRes {
	meta: {
		version: number;
		request: string;
		time: string;
	};
	boxScoreTraditional: BoxScoreTraditional;
}
