import type { NeuralNetwork } from './NeuralNetwork';

export interface IGenome {
	genomeApi: GenomeApi;
	neuralNetwork: NeuralNetwork;
	interval: null | NodeJS.Timer;
}
