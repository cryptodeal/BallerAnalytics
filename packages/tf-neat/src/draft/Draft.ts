import { ModelApi } from '../core/genetics/models/ModelApi';
import type { Player2Object } from '@balleranalytics/nba-api-ts';

export class TeamRoster {
	public _benchLimit: number;
	public _utilLimit: number;
	public _pointGuard!: Player2Object;
	public _shootingGuard!: Player2Object;
	public _smallForward!: Player2Object;
	public _powerForward!: Player2Object;
	public _center!: Player2Object;
	public _guard!: Player2Object;
	public _forward!: Player2Object;
	public _utility: Player2Object[] = [];
	public _bench: Player2Object[] = [];

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

	get pointGuard() {
		return this._pointGuard;
	}

	set pointGuard(player: Player2Object) {
		this._smallForward = player;
	}

	get shootingGuard() {
		return this._shootingGuard;
	}

	set shootingGuard(player: Player2Object) {
		this._shootingGuard = player;
	}

	get smallForward() {
		return this._smallForward;
	}

	set smallForward(player: Player2Object) {
		this._smallForward = player;
	}

	get powerForward() {
		return this._powerForward;
	}

	set powerForward(player: Player2Object) {
		this._powerForward = player;
	}

	get center() {
		return this._center;
	}

	set center(player: Player2Object) {
		this._center = player;
	}

	get guard() {
		return this._center;
	}

	set guard(player: Player2Object) {
		this._guard = player;
	}

	get forward() {
		return this._forward;
	}

	set forward(player: Player2Object) {
		this._forward = player;
	}
}

export class Draft extends ModelApi {
	public roster = new TeamRoster(3, 3);
}
