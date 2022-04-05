import { ModelApi } from '../core/genetics/models/ModelApi';
import type { Player2Object } from '@balleranalytics/nba-api-ts';

export class TeamRoster {
	public _benchLimit: number;
	public _utilLimit: number;

	// _pointGuard: Player2Object;
	_shootingGuard?: Player2Object;
	_smallForward?: Player2Object;
	_powerForward?: Player2Object;
	_center?: Player2Object;
	_guard?: Player2Object;
	_forward?: Player2Object;
	_utility: Player2Object[] = [];
	_bench: Player2Object[] = [];

	constructor(benchLimit: number, utilLimit: number) {
		this._benchLimit = benchLimit - 1;
		this._utilLimit = utilLimit - 1;
	}

	addBenchPlayer(player: Player2Object) {
		this._bench.push(player);
	}

	needsBench(): boolean {
		return this._bench.length < this._benchLimit;
	}

	get bench() {
		return this._bench;
	}

	addUtilityPlayer(player: Player2Object) {
		this._utility.push(player);
	}

	needsUtility(): boolean {
		return this._utility.length < this._utilLimit;
	}

	get utility() {
		return this._utility;
	}

	/* get pointGuard() {
		return this._pointGuard;
	}

	set pointGuard(player: Player2Object) {
		this._pointGuard = player;
	} */
}

export class Draft extends ModelApi {
	public roster = new TeamRoster(3, 3);
}
