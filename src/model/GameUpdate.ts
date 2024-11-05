interface EventData {
    id?: number;
    type?: string;
    revealed?: boolean;
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

export class GameUpdate {
    actionType:string;
    message:string;
    data?:EventData;
    error?:boolean;

    constructor(actionType:string, message:string, data?:EventData) {
        this.actionType = actionType;
        this.message = message;
        this.data = data;
    }

    setError(error: boolean) {
        this.error = error;
    }
}

export class PlayerError extends GameUpdate{
    constructor(message:string) {
        super('playerError', message);
        this.setError(true);
    }
}