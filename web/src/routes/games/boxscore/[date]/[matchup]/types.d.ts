import type { PopulatedDocument, Game2Document } from '@balleranalytics/nba-api-ts';

export type BoxScoreLoadParams = {
	date: string;
	matchup: string;
};

export type BoxScoreData = PopulatedDocument<
	PopulatedDocument<
		PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
		'home.players.player'
	>,
	'visitor.players.player'
>;

export type BoxScoreBody = {
	boxscore: BoxScoreData;
};
