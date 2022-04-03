/** Credit p5.org:
 *  Random # generator
 * Also selects random element from array of elements
 */
export declare const random: (min?: number | any[] | undefined, max?: number | undefined) => any;
export declare const clone: (obj: unknown) => unknown;
export declare const sleep: (milliseconds?: number | undefined) => Promise<unknown>;
export declare const randomGaussian: (mean?: number | undefined, sd?: number) => number;
