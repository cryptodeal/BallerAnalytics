import rfdc from 'rfdc';
import { EspnScoring } from '../core/genetics/models';
/** Credit p5.org:
 *  Random # generator
 * Also selects random element from array of elements
 */
export const random = (min, max) => {
    const rand = Math.random();
    if (typeof min === undefined || !min) {
        return rand;
    }
    else if (typeof max === undefined || !max) {
        if (min instanceof Array || Array.isArray(min)) {
            return min[Math.floor(rand * min.length)];
        }
        return rand * min;
    }
    else {
        if (min instanceof Array || Array.isArray(min))
            throw new Error(`Error: random() cannot accept min typeof Array AND max params at the same time`);
        if (min > max) {
            const tmp = min;
            min = max;
            max = tmp;
        }
        return rand * (max - min) + min;
    }
};
export const clone = (obj) => {
    if (null == obj || 'object' != typeof obj)
        return obj;
    return rfdc({ proto: true })(obj);
};
export const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
const constrain = (n, low, high) => Math.max(Math.min(n, high), low);
export const map = (n, start1, stop1, start2, stop2, withinBounds) => {
    const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return constrain(newval, start2, stop2);
    }
    else {
        return constrain(newval, stop2, start2);
    }
};
let previous = false;
let y2 = 0;
export const randomGaussian = (mean, sd = 1) => {
    let y1, x1, x2, w;
    if (previous) {
        y1 = y2;
        previous = false;
    }
    else {
        do {
            x1 = random(2) - 1;
            x2 = random(2) - 1;
            w = x1 * x1 * x2 * x2;
        } while (w >= 1);
        w = Math.sqrt((-2 * Math.log(w)) / w);
        y1 = x1 * w;
        y2 = x2 * w;
        previous = true;
    }
    const m = mean || 0;
    const s = sd || 1;
    return y1 * s + m;
};
export const calcFantasyPoints = (playerGameStats) => {
    const { totals } = playerGameStats.stats;
    let fantasyPoints = 0;
    if (!totals)
        return fantasyPoints;
    if (totals.points)
        fantasyPoints += totals.points * EspnScoring.POINT;
    if (totals.threePointersMade)
        fantasyPoints += totals.threePointersMade * EspnScoring.THREEPM;
    if (totals.fieldGoalsAttempted)
        fantasyPoints -= totals.fieldGoalsAttempted * EspnScoring.FGA;
    if (totals.fieldGoalsMade)
        fantasyPoints += totals.fieldGoalsMade * EspnScoring.FGM;
    if (totals.freeThrowsAttempted)
        fantasyPoints += totals.freeThrowsAttempted * EspnScoring.FTA;
    if (totals.freeThrowsMade)
        fantasyPoints += totals.freeThrowsMade * EspnScoring.FTM;
    if (totals.totalReb)
        fantasyPoints += totals.totalReb * EspnScoring.REB;
    if (totals.assists)
        fantasyPoints += totals.assists * EspnScoring.AST;
    if (totals.steals)
        fantasyPoints += totals.steals * EspnScoring.STL;
    if (totals.blocks)
        fantasyPoints += totals.blocks * EspnScoring.BLK;
    if (totals.turnovers)
        fantasyPoints -= totals.turnovers * EspnScoring.TOV;
    return fantasyPoints;
};
