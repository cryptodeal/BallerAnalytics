import { SteepenedSigmoid } from './activations';

export enum MathActivations {
	SigmoidSteepenedActivation = 'SigmoidSteepenedActivation'
}

const SigmoidSteepenedActivation = new SteepenedSigmoid().apply;

export type MathExport = Record<
	MathActivations,
	| ((input: number, auxParams: Float64Array) => number)
	| ((input: Float64Array, auxParams: Float64Array) => Float64Array)
>;
export const math: MathExport = {
	SigmoidSteepenedActivation
};
