import type { Game2HomePlayer, Game2VisitorPlayer } from '@balleranalytics/nba-api-ts';
/** Credit p5.org:
 *  Random # generator
 * Also selects random element from array of elements
 */
export declare const random: (min?: number | any[] | undefined, max?: number | undefined) => any;
export declare const clone: (obj: unknown) => unknown;
export declare const sleep: (milliseconds?: number | undefined) => Promise<unknown>;
export declare const map: (n: number, start1: number, stop1: number, start2: number, stop2: number, withinBounds?: boolean | undefined) => number;
export declare const randomGaussian: (mean?: number | undefined, sd?: number) => number;
export declare const calcFantasyPoints: (playerGameStats: Game2HomePlayer | Game2VisitorPlayer) => number;
