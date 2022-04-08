import { NeuralNetwork } from '../ai/NeuralNetwork';
import { map } from '../../utils';
/* Class that evaluates a population (default 9 genomes per population) */
export class Population {
    _populationSize = 9;
    _populationProgress = '0%';
    _inputs = 8;
    _neurons = 40;
    _outputs = 2;
    _models = [];
    _modelsRunning = 0;
    _sectionsToSeeAhead = 1;
    _timeTakenDateStart;
    _completeCallback;
    constructor(completeCallback) {
        this._completeCallback = completeCallback;
    }
    start(modelApiType, neuralNetworks) {
        this._timeTakenDateStart = new Date();
        for (let i = 0; i < this._populationSize; i++) {
            let neuralNetwork;
            if (neuralNetworks == null) {
                neuralNetwork = new NeuralNetwork(this._inputs, this._neurons, this._outputs);
            }
            else {
                if (neuralNetworks[i] instanceof NeuralNetwork)
                    neuralNetwork = neuralNetworks[i];
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
            this._models[i].interval = setInterval(this.checkModel.bind(null, this, this._models, this._models[i]), 50);
        }
    }
    checkModel(pop, models, model) {
        if (model.modelApi.isOver() && pop._timeTakenDateStart) {
            if (model.interval)
                clearInterval(model.interval);
            pop._modelsRunning--;
            pop._populationProgress = models.length - pop._modelsRunning + ' / ' + models.length;
            if (pop.allModelsDone(models) && 0 == pop._modelsRunning) {
                const timeTakenDateComplete = new Date();
                const timeTaken = (timeTakenDateComplete.valueOf() - pop._timeTakenDateStart.valueOf()) / 1000;
                if (pop._completeCallback)
                    pop._completeCallback(models, timeTaken);
            }
        }
        else {
            if (model.modelApi.isSetup()) {
                pop.think(model);
            }
        }
    }
    /* Gets inputs from the modelApi, and makes a prediction to jump or not to jump */
    think(model) {
        const inputs = [];
        const inputsNormalised = [];
        // Player y
        inputs[0] = model.modelApi.getPlayerY();
        inputsNormalised[0] = map(inputs[0], 0, model.modelApi.getHeight(), 0, 1);
        // Player x
        inputs[1] = model.modelApi.getPlayerX();
        inputsNormalised[1] = map(inputs[1], inputs[1], model.modelApi.getWidth(), 0, 1);
        let section = model.modelApi.getSectionFromPlayer(this._sectionsToSeeAhead);
        // 2nd closest section x
        inputs[2] = section.x + section.width;
        inputsNormalised[2] = map(inputs[2], inputs[1], model.modelApi.getWidth(), 0, 1);
        // 2nd closest section y
        inputs[3] = section.y;
        inputsNormalised[3] = map(inputs[3], 0, model.modelApi.getHeight(), 0, 1);
        // 2nd closest section y base
        inputs[4] = section.y + section.height;
        inputsNormalised[4] = map(inputs[4], 0, model.modelApi.getHeight(), 0, 1);
        section = model.modelApi.getSectionFromPlayer(this._sectionsToSeeAhead + 1);
        // Is player jumping
        inputs[5] = model.modelApi.isPlayerJumping() ? 1 : 0;
        inputsNormalised[5] = map(inputs[5], 0, 1, 0, 1);
        // Player velocity
        inputs[6] = model.modelApi.getPlayerVelocity() ? 1 : 0;
        inputsNormalised[6] = map(inputs[6], -1.1, 1.1, 0, 1);
        // Can play jump?
        inputs[7] = model.modelApi.canPlayerJump() ? 1 : 0;
        inputsNormalised[7] = map(inputs[7], 0, 1, 0, 1);
        model.modelApi.setDebugPoints([
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
        const outputs = model.neuralNetwork.predict(inputsNormalised);
        if (outputs[0] > 0.5 || outputs[1] > 0.5) {
            model.modelApi.jump();
        }
    }
    allModelsDone(models) {
        for (let i = 0; i < this._populationSize; i++) {
            if (false == models[i].modelApi.isOver()) {
                return false;
            }
        }
        return true;
    }
    get populationSize() {
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
