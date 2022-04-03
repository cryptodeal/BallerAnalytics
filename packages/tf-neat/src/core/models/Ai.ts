import { NeuralNetwork } from './NeuralNetwork';
import { IGenome } from './types';
/* AI class that evaluates a population (default 9 genomes per population) */
export class Ai {
	public _totalGames = 9;
	public _inputs = 8;
	public _neurons = 40;
	public _outputs = 2;
	public _genomes: IGenome[] = [];
	public _gamesRunning = 0;
	public _sectionsToSeeAhead = 1;
	public _forceDrawGameLeftCount = 3;
	public _timeTakenDateStart?: Date;
	public _completeCallback?: () => void;

	constructor(completeCallback?: () => void) {
		this._completeCallback = completeCallback;
	}

	start(useImageRecognition, neuralNetworks) {
		this._timeTakenDateStart = new Date();

		for (let i = 0; i < this._totalGames; i++) {
			let neuralNetwork;

			if (undefined !== neuralNetworks && neuralNetworks[i] instanceof NeuralNetwork) {
				neuralNetwork = neuralNetworks[i];
			} else {
				neuralNetwork = new NeuralNetwork(this._inputs, this._neurons, this._outputs);
			}

			let genomeApi;

			if (useImageRecognition) {
				genomeApi = new GameImageRecognition();
			} else {
				genomeApi = new GameApi();
			}

			this._games[i] = {
				genomeApi: genomeApi,
				neuralNetwork: neuralNetwork,
				interval: null
			};

			// Debug look ahead
			this._games[i].genomeApi.setHighlightSectionAhead(this._sectionsToSeeAhead);

			// Start game
			this._gamesRunning++;
			this._games[i].genomeApi.start();

			this._games[i].interval = setInterval(
				this.checkGame.bind(null, this, this._games, this._games[i]),
				50
			);
		}
	}

	checkGame(ai, games, game) {
		if (game.genomeApi.isOver()) {
			clearInterval(game.interval);

			ai._gamesRunning--;
			(document.querySelector('_round-progress') as HTMLElement).style.width =
				((games.length - ai._gamesRunning) / games.length) * 100 + '%';

			if (ai.areAllGamesOver(games) && 0 == ai._gamesRunning) {
				const timeTakenDateComplete = new Date();
				const timeTaken = (timeTakenDateComplete - ai._timeTakenDateStart) / 1000;

				ai._completeCallback(games, timeTaken);
			}
		} else {
			if (game.genomeApi.isSetup()) {
				ai.think(game);

				if (ai._gamesRunning <= ai._forceDrawGameLeftCount) {
					enableDrawOverride = true;
				}
			}
		}
	}

	/**
	 * Method that gets the inputs from the game, and makes a prediction to jump or not to jump
	 */
	think(game) {
		const inputs = [];
		const inputsNormalised = [];

		// Player y
		inputs[0] = game.genomeApi.getPlayerY();
		inputsNormalised[0] = map(inputs[0], 0, game.genomeApi.getHeight(), 0, 1);

		// Player x
		inputs[1] = game.genomeApi.getPlayerX();
		inputsNormalised[1] = map(inputs[1], inputs[1], game.genomeApi.getWidth(), 0, 1);

		let section = game.genomeApi.getSectionFromPlayer(this._sectionsToSeeAhead);

		// 2nd closest section x
		inputs[2] = section.x + section.width;
		inputsNormalised[2] = map(inputs[2], inputs[1], game.genomeApi.getWidth(), 0, 1);

		// 2nd closest section y
		inputs[3] = section.y;
		inputsNormalised[3] = map(inputs[3], 0, game.genomeApi.getHeight(), 0, 1);

		// 2nd closest section y base
		inputs[4] = section.y + section.height;
		inputsNormalised[4] = map(inputs[4], 0, game.genomeApi.getHeight(), 0, 1);

		section = game.genomeApi.getSectionFromPlayer(this._sectionsToSeeAhead + 1);

		// Is player jumping
		inputs[5] = game.genomeApi.isPlayerJumping() ? 1 : 0;
		inputsNormalised[5] = map(inputs[5], 0, 1, 0, 1);

		// Player velocity
		inputs[6] = game.genomeApi.getPlayerVelocity() ? 1 : 0;
		inputsNormalised[6] = map(inputs[6], -1.1, 1.1, 0, 1);

		// Can play jump?
		inputs[7] = game.genomeApi.canPlayerJump() ? 1 : 0;
		inputsNormalised[7] = map(inputs[7], 0, 1, 0, 1);

		game.genomeApi.setDebugPoints([
			{
				x: 0,
				y: inputs[0]
			},
			{
				x: inputs[1],
				y: 0
			},
			{
				x: inputs[2],
				y: 0
			},
			{
				x: 0,
				y: inputs[3]
			},
			{
				x: 0,
				y: inputs[4]
			}
		]);

		const outputs = game.neuralNetwork.predict(inputsNormalised);

		if (outputs[0] > 0.5 || outputs[1] > 0.5) {
			game.genomeApi.jump();
		}
	}

	areAllGamesOver(games) {
		for (let i = 0; i < this._totalGames; i++) {
			if (false == games[i].genomeApi.isOver()) {
				return false;
			}
		}

		return true;
	}

	get totalGames() {
		return this._totalGames;
	}

	get inputs() {
		return this._inputs;
	}

	get neurons() {
		return this._neurons;
	}

	get outputs() {
		return this._outputs;
	}
}
