interface TileData {
    id: number;
    type?: string;
    revealed: boolean;
}

export class GameUpdate {
    actionType:string;
    message:string;
    data?:TileData;
    error?:boolean;

    constructor(actionType:string, message:string, data?:TileData) {
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