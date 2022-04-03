import { IGenome } from './types';
export declare class Ai {
    _totalGames: number;
    _inputs: number;
    _neurons: number;
    _outputs: number;
    _genomes: IGenome[];
    _gamesRunning: number;
    _sectionsToSeeAhead: number;
    _forceDrawGameLeftCount: number;
    _timeTakenDateStart?: Date;
    _completeCallback?: () => void;
    constructor(completeCallback?: () => void);
    start(useImageRecognition: any, neuralNetworks: any): void;
    checkGame(ai: any, games: any, game: any): void;
    /**
     * Method that gets the inputs from the game, and makes a prediction to jump or not to jump
     */
    think(game: any): void;
    areAllGamesOver(games: any): boolean;
    get totalGames(): number;
    get inputs(): number;
    get neurons(): number;
    get outputs(): number;
}
