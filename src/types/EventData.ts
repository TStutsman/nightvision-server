export interface EventData {
    id?: number;
    type?: string;
    revealed?: boolean;
    tileId?:number;
    tileId1?: number;
    tileId2?: number;
    nextPlayerId?: number;
    playerId?: number;
    score?: number;
    
    players?: any;
    bearSpotted?: boolean;
    gameOver?: boolean;
    endGameStatus?: string;
    deck?: any;

    rowFirstIndex?: number;
}