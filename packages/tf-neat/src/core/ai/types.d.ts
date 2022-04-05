import type { NeuralNetwork } from './NeuralNetworkwork';

export interface IModel {
	modelApi: ModelApi;
	neuralNetwork: NeuralNetwork;
	interval?: NodeJS.Timeout;
	fitness?: number;
	score?: number;
	progress?: number;
}

export interface IModelFitness extends IModel {
	modelApi: ModelApi;
	neuralNetwork: NeuralNetwork;
	interval?: NodeJS.Timeout;
	fitness: number;
	score?: number;
	progress?: number;
}
