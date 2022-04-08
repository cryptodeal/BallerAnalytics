import { ModelApi } from '../core/genetics/models/ModelApi';
import type { Player2Object } from '@balleranalytics/nba-api-ts';
export declare class TeamRoster {
    _benchLimit: number;
    _utilLimit: number;
    _pointGuard: Player2Object;
    _shootingGuard: Player2Object;
    _smallForward: Player2Object;
    _powerForward: Player2Object;
    _center: Player2Object;
    _guard: Player2Object;
    _forward: Player2Object;
    _utility: Player2Object[];
    _bench: Player2Object[];
    constructor(benchLimit: number, utilLimit: number);
    addBenchPlayer(player: Player2Object): void;
    needsBench(): boolean;
    get bench(): import("@balleranalytics/nba-api-ts/dist/db/interfaces/mongoose.gen").Player2[];
    addUtilityPlayer(player: Player2Object): void;
    needsUtility(): boolean;
    get utility(): import("@balleranalytics/nba-api-ts/dist/db/interfaces/mongoose.gen").Player2[];
    get pointGuard(): Player2Object;
    set pointGuard(player: Player2Object);
    get shootingGuard(): Player2Object;
    set shootingGuard(player: Player2Object);
    get smallForward(): Player2Object;
    set smallForward(player: Player2Object);
    get powerForward(): Player2Object;
    set powerForward(player: Player2Object);
    get center(): Player2Object;
    set center(player: Player2Object);
    get guard(): Player2Object;
    set guard(player: Player2Object);
    get forward(): Player2Object;
    set forward(player: Player2Object);
}
export declare class Draft extends ModelApi {
    roster: TeamRoster;
}
