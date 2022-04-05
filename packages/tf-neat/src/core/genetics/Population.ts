import { NeuralNetwork } from '../ai/NeuralNetwork';
import { ModelApiType } from './models';
import type { IModel } from '../ai/types';

/* Class that evaluates a population (default 9 genomes per population) */
export class Population {
	public _populationSize = 9;
	public _populationProgress = '0%';
	public _inputs = 8;
	public _neurons = 40;
	public _outputs = 2;
	public _models: IModel[] = [];
	public _modelsRunning = 0;
	public _sectionsToSeeAhead = 1;
	public _forceDrawGameLeftCount = 3;
	public _timeTakenDateStart?: Date;
	public _completeCallback?: (models: IModel[], time: number) => void;

	constructor(completeCallback?: (models: IModel[], time: number) => void) {
		this._completeCallback = completeCallback;
	}

	start(modelApiType: ModelApiType, neuralNetworks?: NeuralNetwork[]) {
		this._timeTakenDateStart = new Date();

		for (let i = 0; i < this._populationSize; i++) {
			let neuralNetwork;

			if (neuralNetworks == null) {
				neuralNetwork = new NeuralNetwork(this._inputs, this._neurons, this._outputs);
			} else {
				if (neuralNetworks[i] instanceof NeuralNetwork) neuralNetwork = neuralNetworks[i];
			}

			let modelApi;
			// TODO: set modelApi once written
			/*
      if (modelApiType === ModelApiType.DRAFT) {
				modelApi = new DraftApi();
			} else {
				modelApi = new ManagerApi();
			}
      */

			this._models[i] = {
				modelApi: modelApi,
				neuralNetwork: neuralNetwork
			};

			/* Debug look ahead */
			this._models[i].modelApi.setHighlightSectionAhead(this._sectionsToSeeAhead);

			/* Run generation (population comprised of varying NeuralNet Models) */
			this._modelsRunning++;
			this._models[i].modelApi.start();

			this._models[i].interval = setInterval(
				this.checkGame.bind(null, this, this._models, this._models[i]),
				50
			);
		}
	}

	checkGame(pop: Population, models: IModel[], model: IModel) {
		if (model.modelApi.isOver() && pop._timeTakenDateStart) {
			if (model.interval) clearInterval(model.interval);

			pop._modelsRunning--;
			pop._populationProgress = models.length - pop._modelsRunning + ' / ' + models.length;

			if (pop.areAllGamesOver(models) && 0 == pop._modelsRunning) {
				const timeTakenDateComplete = new Date();
				const timeTaken =
					(timeTakenDateComplete.valueOf() - pop._timeTakenDateStart.valueOf()) / 1000;

				if (pop._completeCallback) pop._completeCallback(models, timeTaken);
			}
		} else {
			if (model.modelApi.isSetup()) {
				pop.think(model);
				// TODO: Determine if this needs to be reworked to new codebase
				/*
        if (pop._modelsRunning <= pop._forceDrawGameLeftCount) {
					enableDrawOverride = true;
				}
        */
			}
		}
	}

	/* Gets inputs from the modelApi, and makes a prediction to jump or not to jump */
	think(game) {
		const inputs = [];
		const inputsNormalised = [];

		// Player y
		inputs[0] = game.modelApi.getPlayerY();
		inputsNormalised[0] = map(inputs[0], 0, game.modelApi.getHeight(), 0, 1);

		// Player x
		inputs[1] = game.modelApi.getPlayerX();
		inputsNormalised[1] = map(inputs[1], inputs[1], game.modelApi.getWidth(), 0, 1);

		let section = game.modelApi.getSectionFromPlayer(this._sectionsToSeeAhead);

		// 2nd closest section x
		inputs[2] = section.x + section.width;
		inputsNormalised[2] = map(inputs[2], inputs[1], game.modelApi.getWidth(), 0, 1);

		// 2nd closest section y
		inputs[3] = section.y;
		inputsNormalised[3] = map(inputs[3], 0, game.modelApi.getHeight(), 0, 1);

		// 2nd closest section y base
		inputs[4] = section.y + section.height;
		inputsNormalised[4] = map(inputs[4], 0, game.modelApi.getHeight(), 0, 1);

		section = game.modelApi.getSectionFromPlayer(this._sectionsToSeeAhead + 1);

		// Is player jumping
		inputs[5] = game.modelApi.isPlayerJumping() ? 1 : 0;
		inputsNormalised[5] = map(inputs[5], 0, 1, 0, 1);

		// Player velocity
		inputs[6] = game.modelApi.getPlayerVelocity() ? 1 : 0;
		inputsNormalised[6] = map(inputs[6], -1.1, 1.1, 0, 1);

		// Can play jump?
		inputs[7] = game.modelApi.canPlayerJump() ? 1 : 0;
		inputsNormalised[7] = map(inputs[7], 0, 1, 0, 1);

		game.modelApi.setDebugPoints([
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
			game.modelApi.jump();
		}
	}

	areAllGamesOver(games) {
		for (let i = 0; i < this._populationSize; i++) {
			if (false == games[i].modelApi.isOver()) {
				return false;
			}
		}

		return true;
	}

	get totalGames() {
		return this._populationSize;
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
