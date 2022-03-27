import type {
	Player2Document,
	Player2SeasonPostseasonStatDocument
} from '@balleranalytics/nba-api-ts';

export interface PlayerRosterStatItem {
	player?: Player2Document;
	twoWay: boolean;
	stats?: Player2SeasonPostseasonStatDocument;
}
