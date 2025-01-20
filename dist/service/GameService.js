import { NightVisionGame, Reaction, Client } from "../model/index.js";
import { messageRouter } from "../routes/messages.js";
export class GameService extends NightVisionGame {
    constructor() {
        super();
        this.clients = {};
        this.numClients = 0;
        this.router = messageRouter;
    }
    registerClient(uuid, ws) {
        let joinMessage = 'A player has reconnected';
        if (this.clients[uuid] === undefined) {
            const id = ++this.numClients;
            this.clients[uuid] = new Client(this, id);
            joinMessage = 'A new player has joined the game';
        }
        this.clients[uuid].connect(ws).use('message', this.router);
        const joinedBroadcast = new Reaction('playerJoin', joinMessage);
        this.broadcast(joinedBroadcast);
        if (this.numClients > 1) {
            this.activateMultiplayer();
            if (this.numClients == 2)
                this.broadcast(this.resetGame());
        }
    }
    ;
    removeClient(uuid) {
        delete this.clients[uuid];
        this.numClients--;
        const reset = this.resetGame();
        this.broadcast(reset);
        if (this.numClients == 1) {
            this.deactivateMultiplayer();
        }
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