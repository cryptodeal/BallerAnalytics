import { random, randomGaussian } from '../../utils';
import { NeuralNetwork } from '../models/NeuralNetwork';
import { Ai } from '../models/Ai';
import { tensor } from '@tensorflow/tfjs';

/* Runs multiple generations of AI, breeding the best models from each generation until the training ends */
export class NeuroEvolution {
	public _discountRate = 0.95;
	public _learningRate = 0.05;
	// public _neuroEvolutionChart = new NeuroEvolutionChart();
	public _bestScores: HTMLElement;
	public _bestGames: unknown[] = [];
	public _generation = 1;
	public _maxGenerations = 1500;
	public _pausedGames = [];
	public _pausedBestNeuralNetworksByFitness = [];
	public _pauseBeforeNextGeneration = false;
	public _enableMlVision = false;
	public _useImageRecognition = false;

	constructor() {
		this._bestScores = document.querySelector('_best-scores') as HTMLElement;
	}

	calculateFitness(games) {
		for (let i = 0; i < games.length; i++) {
			const game = games[i];
			games[i].fitness = game.gameApi.getProgress() / 100;
			games[i].score = game.gameApi.getScore();
			games[i].progress = game.gameApi.getProgress();
		}

		// Now make the better progressed games have a higher fitness so they have a higher chance of being selected for next generation
		games.sort(this.sortByFitness);

		games.reverse();
		let prev = 0;
		for (let i = 0; i < games.length; i++) {
			games[i].fitness = this._discountRate * prev + games[i].fitness;
			prev = games[i].fitness;
		}

		games.sort(this.sortByFitness);

		return games;
	}

	pickBestGameFromFitnessPool(games) {
		let index = 0;
		let r = random(1);

		while (r > 0) {
			if (undefined !== games[index]) {
				r = r - games[index].fitness;
				index++;
			} else {
				r = 0;
			}
		}
		index--;

		const game = games[index];

		return game;
	}

	pickBestGameByActualFitness(games) {
		let game;
		let prevFitness = 0;
		for (let i = 0; i < games.length; i++) {
			if (games[i].fitness > prevFitness) {
				game = games[i];
				prevFitness = game.fitness;
			}
		}

		return game;
	}

	didAtLeastOneGameCompleteLevel(games) {
		for (let i = 0; i < games.length; i++) {
			if (games[i].gameApi.isLevelPassed()) {
				return games[i];
			}
		}

		return false;
	}

	sortByFitness = (a, b) => {
		let comparison = 0;
		if (a.fitness < b.fitness) {
			comparison = 1;
		} else if (a.fitness > b.fitness) {
			comparison = -1;
		}
		return comparison;
	};

	mutateNeuralNetwork(b) {
		function fn(x) {
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

	crossoverNeuralNetwork(neuralNetworkOne, neuralNetworkTwo) {
		const parentA_in_dna = neuralNetworkOne.input_weights.dataSync();
		const parentA_out_dna = neuralNetworkOne.output_weights.dataSync();
		const parentB_in_dna = neuralNetworkTwo.input_weights.dataSync();
		const parentB_out_dna = neuralNetworkTwo.output_weights.dataSync();

		const mid = Math.floor(Math.random() * parentA_in_dna.length);
		const child_in_dna = [
			...parentA_in_dna.slice(0, mid),
			...parentB_in_dna.slice(mid, parentB_in_dna.length)
		];
		const child_out_dna = [
			...parentA_out_dna.slice(0, mid),
			...parentB_out_dna.slice(mid, parentB_out_dna.length)
		];

		const child = neuralNetworkOne.clone();
		const input_shape = neuralNetworkOne.input_weights.shape;
		const output_shape = neuralNetworkOne.output_weights.shape;

		child.dispose();

		child.input_weights = tensor(child_in_dna, input_shape);
		child.output_weights = tensor(child_out_dna, output_shape);

		return child;
	}

	start(games, bestPlayerBrainsByFitness) {
		this.updateUIRoundInformation();

		if (this._generation < this._maxGenerations) {
			if (false == this._pauseBeforeNextGeneration) {
				for (let i = 0; i < games.length; i++) {
					games[i].gameApi.remove();
				}

				games = undefined;

				this._pausedGames = [];
				this._pausedBestNeuralNetworksByFitness = [];

				this._generation++;

				const ai = new Ai(this.finishGeneration.bind(this));
				ai.start(this._useImageRecognition, bestPlayerBrainsByFitness);
			} else {
				this._pausedGames = games;
				this._pausedBestNeuralNetworksByFitness = bestPlayerBrainsByFitness;

				for (let i = 0; i < games.length; i++) {
					games[i].gameApi.show();
				}
			}
		} else {
			this.enableSpeedInput();
		}
	}

	finishGeneration(games, timeTaken) {
		games = this.calculateFitness(games);

		// Did one of the games finish?
		const gamePassedLevel = this.didAtLeastOneGameCompleteLevel(games);

		let bestPlayerByFitness = gamePassedLevel;
		const bestPlayerBrainsByFitness: any[] = [];

		if (false === bestPlayerByFitness) {
			bestPlayerByFitness = this.pickBestGameByActualFitness(games);
		}

		this._bestGames.push(bestPlayerByFitness);
		this._bestGames.sort(this.sortByFitness);

		// Only keep top 5 best scores
		if (this._bestGames.length > 5) {
			this._bestGames = this._bestGames.slice(0, 5);
		}

		// Update UI - Chart
		// this._neuroEvolutionChart.update(bestPlayerByFitness.progress, bestPlayerByFitness.score);

		// Update UI
		this.updateUIaddBestGenerationToBestScore(bestPlayerByFitness, timeTaken);
		this.updateUIBestPlayerScore(this._bestGames[0]);
		this.updateUIRoundInformation();

		if (false != gamePassedLevel) {
			for (let i = 0; i < games.length; i++) {
				if (games[i].gameApi.isLevelPassed()) {
					games[i].neuralNetwork.save('neuralNetwork');
					for (let ii = 0; ii < games.length; ii++) {
						bestPlayerBrainsByFitness.push(games[i].neuralNetwork.clone());
					}
				}
			}

			console.log('Level Passed:', this._bestGames[0], this._bestGames.length, this._bestGames);
			this.start(games, bestPlayerBrainsByFitness);
		} else {
			// Breeding
			for (let i = 0; i < games.length; i++) {
				const bestPlayerA = this.pickBestGameFromFitnessPool(games);
				const bestPlayerB = this.pickBestGameFromFitnessPool(games);
				const bestPlayerC = this._bestGames[0];
				let child;

				if (random(1) < 0.1) {
					const ai = new Ai();
					const bestPlayerD = new NeuralNetwork(ai.inputs, ai.neurons, ai.outputs);
					child = this.mutateNeuralNetwork(
						this.crossoverNeuralNetwork(bestPlayerC.neuralNetwork.clone(), bestPlayerD)
					);
				} else {
					child = this.mutateNeuralNetwork(
						this.crossoverNeuralNetwork(
							bestPlayerA.neuralNetwork.clone(),
							bestPlayerB.neuralNetwork.clone()
						)
					);
				}

				bestPlayerBrainsByFitness.push(child);
			}

			this.start(games, bestPlayerBrainsByFitness);
		}
	}

	updateUIaddBestGenerationToBestScore(pickBestPlayerByFitness, timeTaken) {
		const bestScore = document.createElement('li');
		bestScore.innerHTML =
			pickBestPlayerByFitness.score +
			' (' +
			pickBestPlayerByFitness.progress.toFixed(1) +
			'%) (' +
			pickBestPlayerByFitness.fitness.toFixed(3) +
			') (' +
			timeTaken +
			's)';
		this._bestScores.insertBefore(bestScore, document.querySelector('li:first-child'));
	}

	updateUIRoundInformation() {
		(document.querySelector('_round-current') as HTMLElement).innerHTML =
			this._generation.toString();
		(document.querySelector('_round-total') as HTMLElement).innerHTML =
			this._maxGenerations.toString();
		(document.querySelector('_round-progress') as HTMLElement).style.width = '0%';
		(document.querySelector('_generation-progress') as HTMLElement).style.width =
			(this._generation / this._maxGenerations) * 100 + '%';
	}

	updateUIBestPlayerScore(bestGame) {
		(document.querySelector('_best-player-score') as HTMLElement).innerHTML =
			bestGame.score + ' points (' + bestGame.progress.toFixed(1) + '%)';
	}

	enableSpeedInput() {
		(document.querySelector('_btn-speed') as HTMLButtonElement).disabled = false;
	}

	disableSpeedInput() {
		(document.querySelector('_btn-speed') as HTMLButtonElement).disabled = true;
	}

	get pauseBeforeNextGeneration() {
		return this._pauseBeforeNextGeneration;
	}

	set pauseBeforeNextGeneration(pauseBeforeNextGeneration) {
		this._pauseBeforeNextGeneration = pauseBeforeNextGeneration;
	}

	get pausedGames() {
		return this._pausedGames;
	}

	get pausedBestNeuralNetworksByFitness() {
		return this._pausedBestNeuralNetworksByFitness;
	}

	get bestGames() {
		return this._bestGames;
	}

	set useImageRecognition(useImageRecognition) {
		this._useImageRecognition = useImageRecognition;
	}

	set enableMlVision(enableMlVision) {
		this._enableMlVision = enableMlVision;
	}

	reset() {
		this._bestGames = [];
		this._generation = 1;
		this._pausedGames = [];
		this._pausedBestNeuralNetworksByFitness = [];
		this._pauseBeforeNextGeneration = false;
	}
}
