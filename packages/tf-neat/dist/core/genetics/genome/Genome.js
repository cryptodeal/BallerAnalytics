/* Controller for each individual Genome of a given population */
export class Genome {
    /* Variable declaration for use w BallerAnalytics */
    _roster = [];
    _isOver = false;
    _score = 0;
    getScore() {
        return this._score;
    }
    getRoster() {
        return this._roster;
    }
}
