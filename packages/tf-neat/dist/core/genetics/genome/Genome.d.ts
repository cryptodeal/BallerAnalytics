import type { Player2Object } from '@balleranalytics/nba-api-ts';
export declare class Genome {
    _roster: Player2Object[];
    _isOver: boolean;
    _score: number;
    getScore(): number;
    getRoster(): import("@balleranalytics/nba-api-ts/dist/db/interfaces/mongoose.gen").Player2[];
}
