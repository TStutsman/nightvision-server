import { NightVisionGame } from "../model/index.js";
import { Client as Client } from "./Client.js";
import { messageRouter } from "../routes/messages.js";
export class GameService extends NightVisionGame {
    constructor() {
        super();
        this.clients = {};
    }
    registerClient(uuid, ws) {
        if (this.clients[uuid] !== undefined) {
            const reconnectTarget = this.clients[uuid];
            reconnectTarget.ws = ws;
            reconnectTarget.use('message', messageRouter);
            return;
        }
        const id = Object.keys(this.clients).length + 1;
        const newClient = new Client(ws, this, id);
        newClient.use('message', messageRouter);
        this.clients[uuid] = newClient;
    }
    ;
    broadcast(reaction) {
        for (const token in this.clients) {
            const client = this.clients[token];
            client.ws.send(reaction.json());
        }
    }
}
//# sourceMappingURL=GameService.js.map