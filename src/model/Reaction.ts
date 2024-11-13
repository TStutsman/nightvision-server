import { EventData } from "../types";

export class Reaction {
    actionType:string;
    message:string;
    data?:EventData;

    constructor(actionType:string, message:string, data?:EventData) {
        this.actionType = actionType;
        this.message = message;
        this.data = data;
    }

    json() {
        return JSON.stringify(this);
    }
}

export class PlayerError extends Reaction {
    constructor(message:string) {
        super('playerError', message);
    }
}

export class ClientError extends Reaction {
    constructor(message:string) {
        super('clientError', message);
    }
}