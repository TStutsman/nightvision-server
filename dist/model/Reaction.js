export class Reaction {
    constructor(actionType, message, data) {
        this.actionType = actionType;
        this.message = message;
        this.data = data;
    }
    json() {
        return JSON.stringify(this);
    }
}
export class PlayerError extends Reaction {
    constructor(message) {
        super('playerError', message);
    }
}
export class ClientError extends Reaction {
    constructor(message) {
        super('clientError', message);
    }
}
//# sourceMappingURL=Reaction.js.map