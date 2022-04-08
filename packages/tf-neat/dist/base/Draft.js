import { ModelApi } from '../core/genetics/models/ModelApi';
export class TeamRoster {
    _benchLimit;
    _utilLimit;
    _pointGuard;
    _shootingGuard;
    _smallForward;
    _powerForward;
    _center;
    _guard;
    _forward;
    _utility = [];
    _bench = [];
    constructor(benchLimit, utilLimit) {
        this._benchLimit = benchLimit - 1;
        this._utilLimit = utilLimit - 1;
    }
    addBenchPlayer(player) {
        this._bench.push(player);
    }
    needsBench() {
        return this._bench.length < this._benchLimit;
    }
    get bench() {
        return this._bench;
    }
    addUtilityPlayer(player) {
        this._utility.push(player);
    }
    needsUtility() {
        return this._utility.length < this._utilLimit;
    }
    get utility() {
        return this._utility;
    }
    get pointGuard() {
        return this._pointGuard;
    }
    set pointGuard(player) {
        this._smallForward = player;
    }
    get shootingGuard() {
        return this._shootingGuard;
    }
    set shootingGuard(player) {
        this._shootingGuard = player;
    }
    get smallForward() {
        return this._smallForward;
    }
    set smallForward(player) {
        this._smallForward = player;
    }
    get powerForward() {
        return this._powerForward;
    }
    set powerForward(player) {
        this._powerForward = player;
    }
    get center() {
        return this._center;
    }
    set center(player) {
        this._center = player;
    }
    get guard() {
        return this._center;
    }
    set guard(player) {
        this._guard = player;
    }
    get forward() {
        return this._forward;
    }
    set forward(player) {
        this._forward = player;
    }
}
export class Draft extends ModelApi {
    roster = new TeamRoster(3, 3);
}
