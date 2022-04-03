import rfdc from 'rfdc';
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
