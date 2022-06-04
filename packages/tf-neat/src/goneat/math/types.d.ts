import type { NDArray } from 'vectorious';
export type ActivationFunction = (input: number, auxParams: NDArray) => number;
export type ModularActivationFunction = (input: NDArray, auxParams: NDArray) => NDArray;
export type MathActivations = null | ActivationFunction | ModularActivationFunction;
