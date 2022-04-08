import { NeuralNetwork } from '../ai/NeuralNetwork';
import { ModelApiType } from './models';
import type { IModel } from '../ai/types';
export declare class Population {
    _populationSize: number;
    _populationProgress: string;
    _inputs: number;
    _neurons: number;
    _outputs: number;
    _models: IModel[];
    _modelsRunning: number;
    _sectionsToSeeAhead: number;
    _timeTakenDateStart?: Date;
    _completeCallback?: (models: IModel[], time: number) => void;
    constructor(completeCallback?: (models: IModel[], time: number) => void);
    start(modelApiType: ModelApiType, neuralNetworks?: NeuralNetwork[]): void;
    checkModel(pop: Population, models: IModel[], model: IModel): void;
    think(model: IModel): void;
    allModelsDone(models: IModel[]): boolean;
    get populationSize(): number;
    get inputs(): number;
    get neurons(): number;
    get outputs(): number;
}
