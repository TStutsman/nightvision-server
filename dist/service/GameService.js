import { NightVisionGame, Reaction, Client } from "../model/index.js";
import { messageRouter } from "../routes/messages.js";
export class GameService extends NightVisionGame {
    constructor() {
        super();
        this.clients = {};
        this.numClients = 0;
    }
    registerClient(uuid, ws) {
        if (this.clients[uuid] !== undefined) {
            this.clients[uuid].reconnect(ws);
            return;
        }
        const id = ++this.numClients;
        const newClient = new Client(ws, this, id);
        newClient.use('message', messageRouter);
        this.clients[uuid] = newClient;
    }
    ;
    removeClient(uuid) {
        delete this.clients[uuid];
        this.numClients--;
        const reactions = this.resetGame();
        this.broadcast(reactions);
    }
    broadcast(reactionOrReactions) {
        if (reactionOrReactions instanceof Reaction) {
            return this._broadcast(reactionOrReactions);
        }
        for (const reaction of reactionOrReactions) {
            this._broadcast(reaction);
        }
    }
    _broadcast(reaction) {
        for (const token in this.clients) {
            const client = this.clients[token];
            client.ws.send(reaction.json());
        }
    }
}
//# sourceMappingURL=GameService.js.map