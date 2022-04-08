import { random, randomGaussian } from '../../utils';
import { NeuralNetwork } from '../ai/NeuralNetwork';
import { Population } from './Population';
import { ModelApiType } from './models';
import { tensor } from '@tensorflow/tfjs';
import type { IModel, IModelFitness } from '../ai/types';

/* Runs multiple generations of AI, breeding the best models from each generation until the training ends */
export class NeuroEvolution {
	public _discountRate = 0.95;
	public _learningRate = 0.05;
	public _bestModels: IModelFitness[] = [];
	public _generation = 1;
	public _maxGenerations = 1500;
	public _pausedModels: IModel[] = [];
	public _pausedBestNeuralNetworksByFitness: IModel[] = [];
	public _pauseBeforeNextGeneration = false;
	public _enableMlVision = false;
	public _useImageRecognition = false;

	calcFitness(models: IModel[]): IModelFitness[] {
		for (let i = 0; i < models.length; i++) {
			const model = models[i];
			models[i].fitness = model.modelApi.getProgress() / 100;
			models[i].score = model.modelApi.getScore();
			models[i].progress = model.modelApi.getProgress();
		}

		/* Slightly skew higher fitness of best models; increases odds best perf are selected for next generation */
		(models as IModelFitness[]).sort(NeuroEvolution.sortByFitness);

		models.reverse();
		let prev = 0;
		for (let i = 0; i < models.length; i++) {
			models[i].fitness = this._discountRate * prev + (models[i] as IModelFitness).fitness;
			prev = (models[i] as IModelFitness).fitness;
		}

		(models as IModelFitness[]).sort(NeuroEvolution.sortByFitness);

		return models as IModelFitness[];
	}

	getBestModelInFitnessPool(models: IModelFitness[]): IModelFitness {
		let i = 0;
		let r = random(1);

		while (r > 0) {
			if (models[i] !== null) {
				const tempCalc = r - models[i].fitness;
				r = r - tempCalc;
				i++;
			} else {
				r = 0;
			}
		}
		i--;

		return models[i];
	}

	getBestModelByTrueFitness(models: IModelFitness[]): IModelFitness {
		let model: IModelFitness | undefined = undefined;
		let prevFitness = 0;
		for (let i = 0; i < models.length; i++) {
			const tempModel = models[i];
			if (tempModel.fitness > prevFitness) {
				model = tempModel;
				prevFitness = tempModel.fitness;
			}
		}
		if (!model) throw new Error(`No model found with model.fitness > ${prevFitness}`);

		return model;
	}

	minOneModelComplete(models: IModel[]): false | IModel {
		for (let i = 0; i < models.length; i++) {
			if (models[i].modelApi.isLevelPassed()) {
				return models[i];
			}
		}

		return false;
	}

	static sortByFitness = (a: IModelFitness, b: IModelFitness) => {
		let comparison = 0;
		if (a.fitness < b.fitness) {
			comparison = 1;
		} else if (a.fitness > b.fitness) {
			comparison = -1;
		}
		return comparison;
	};

	static mutateNeuralNetwork(b: NeuralNetwork): NeuralNetwork {
		function fn(x: number): number {
			if (random(1) < 0.05) {
				const offset = randomGaussian() * 0.5;
				const newx = x + offset;
				return newx;
			}
			return x;
		}

		const neuralNetwork = b.clone();
		const ih = neuralNetwork.input_weights.dataSync().map(fn);
		const ih_shape = neuralNetwork.input_weights.shape;
		neuralNetwork.input_weights.dispose();
		neuralNetwork.input_weights = tensor(ih, ih_shape);

		const ho = neuralNetwork.output_weights.dataSync().map(fn);
		const ho_shape = neuralNetwork.output_weights.shape;
		neuralNetwork.output_weights.dispose();
		neuralNetwork.output_weights = tensor(ho, ho_shape);
		return neuralNetwork;
	}

	static crossoverNeuralNet(
		neuralNetOne: NeuralNetwork,
		neuralNetTwo: NeuralNetwork
	): NeuralNetwork {
		const parentA_in_dna = neuralNetOne.input_weights.dataSync();
		const parentA_out_dna = neuralNetOne.output_weights.dataSync();
		const parentB_in_dna = neuralNetTwo.input_weights.dataSync();
		const parentB_out_dna = neuralNetTwo.output_weights.dataSync();

		const mid = Math.floor(Math.random() * parentA_in_dna.length);
		const child_in_dna = [
			...parentA_in_dna.slice(0, mid),
			...parentB_in_dna.slice(mid, parentB_in_dna.length)
		];
		const child_out_dna = [
			...parentA_out_dna.slice(0, mid),
			...parentB_out_dna.slice(mid, parentB_out_dna.length)
		];

		const child = neuralNetOne.clone();
		const input_shape = neuralNetOne.input_weights.shape;
		const output_shape = neuralNetOne.output_weights.shape;

		child.dispose();

		child.input_weights = tensor(child_in_dna, input_shape);
		child.output_weights = tensor(child_out_dna, output_shape);

		return child;
	}

	start(models: IModel[], bestPlayerBrainsByFitness) {
		if (false == this._pauseBeforeNextGeneration) {
			for (let i = 0; i < models.length; i++) {
				models[i].modelApi.remove();
			}

			models = [];

			this._pausedModels = [];
			this._pausedBestNeuralNetworksByFitness = [];

			this._generation++;

			const ai = new Population(this.finishGeneration.bind(this));
			ai.start(ModelApiType.DRAFT, bestPlayerBrainsByFitness);
		} else {
			this._pausedModels = models;
			this._pausedBestNeuralNetworksByFitness = bestPlayerBrainsByFitness;

			for (let i = 0; i < models.length; i++) {
				models[i].modelApi.show();
			}
		}
	}

	finishGeneration(models: IModel[] /*, timeTaken?: number*/) {
		models = this.calcFitness(models);

		/* Check if any models have finished */
		const modelDone = this.minOneModelComplete(models);

		let bestModelByFitness = modelDone;
		const bestPlayerBrainsByFitness: IModelFitness[] = [];

		if (false === bestModelByFitness) {
			bestModelByFitness = this.getBestModelByTrueFitness(models as IModelFitness[]);
		}

		this._bestModels.push(bestModelByFitness as IModelFitness);
		this._bestModels.sort(NeuroEvolution.sortByFitness);

		/* Only keep 5 best models */
		if (this._bestModels.length > 5) {
			this._bestModels = this._bestModels.slice(0, 5);
		}

		if (false != modelDone) {
			for (let i = 0; i < models.length; i++) {
				if (models[i].modelApi.isLevelPassed()) {
					models[i].neuralNetwork.save('neuralNetwork');
					for (let ii = 0; ii < models.length; ii++) {
						bestPlayerBrainsByFitness.push(models[i].neuralNetwork.clone());
					}
				}
			}

			console.log('Level Passed:', this._bestModels[0], this._bestModels.length, this._bestModels);
			this.start(models, bestPlayerBrainsByFitness);
		} else {
			/* Breed the best performers for use in next generation */
			for (let i = 0; i < models.length; i++) {
				const bestModelA = this.getBestModelInFitnessPool(models as IModelFitness[]);
				const bestModelB = this.getBestModelInFitnessPool(models as IModelFitness[]);
				const bestModelC = this._bestModels[0];
				let child;

				if (random(1) < 0.1) {
					const ai = new Population();
					const bestModelD = new NeuralNetwork(ai.inputs, ai.neurons, ai.outputs);
					child = NeuroEvolution.mutateNeuralNetwork(
						NeuroEvolution.crossoverNeuralNet(bestModelC.neuralNetwork.clone(), bestModelD)
					);
				} else {
					child = NeuroEvolution.mutateNeuralNetwork(
						NeuroEvolution.crossoverNeuralNet(
							bestModelA.neuralNetwork.clone(),
							bestModelB.neuralNetwork.clone()
						)
					);
				}

				bestPlayerBrainsByFitness.push(child);
			}

			this.start(models, bestPlayerBrainsByFitness);
		}
	}

	get pauseBeforeNextGeneration() {
		return this._pauseBeforeNextGeneration;
	}

	set pauseBeforeNextGeneration(pauseBeforeNextGeneration) {
		this._pauseBeforeNextGeneration = pauseBeforeNextGeneration;
	}
	get pausedModels() {
		return this._pausedModels;
	}

	get pausedBestNeuralNetworksByFitness() {
		return this._pausedBestNeuralNetworksByFitness;
	}

	get bestModels() {
		return this._bestModels;
	}

	set useImageRecognition(useImageRecognition) {
		this._useImageRecognition = useImageRecognition;
	}

	set enableMlVision(enableMlVision) {
		this._enableMlVision = enableMlVision;
	}

	reset() {
		this._bestModels = [];
		this._generation = 1;
		this._pausedModels = [];
		this._pausedBestNeuralNetworksByFitness = [];
		this._pauseBeforeNextGeneration = false;
	}
}
