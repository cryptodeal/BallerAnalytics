/**
 * Game API - that exposes public info to interfacing clients
 */
declare class GameApi {
    #private;
    constructor();
    start(): void;
    setHighlightSectionAhead(index: any): void;
    isOver(): any;
    isSetup(): any;
    getId(): any;
    getContainer(): any;
    getCanvas(): any;
    getHeight(): any;
    getWidth(): any;
    getPlayerY(): any;
    getPlayerX(): any;
    getSectionFromPlayer(index: any): any;
    getPlayerVelocity(): any;
    getProgress(): any;
    getScore(): any;
    canPlayerJump(): any;
    isPlayerJumping(): any;
    jump(): void;
    isLevelPassed(): any;
    setDebugPoints(debugPoints: any): void;
    remove(): void;
    show(): void;
}
