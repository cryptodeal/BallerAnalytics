import type { Player2Object } from '@balleranalytics/nba-api-ts';

/* Controller for each individual Genome of a given population */
export class Genome {
	/* Variable declaration for use w BallerAnalytics */
	public _roster: Player2Object[] = [];
	public _isOver = false;
	public _score = 0;

	getScore() {
		return this._score;
	}

	getRoster() {
		return this._roster;
	}
}
