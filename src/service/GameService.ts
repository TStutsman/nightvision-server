import { NightVisionGame, Reaction } from "../model";
import { PlayerService as Client } from "./PlayerService";
import { messageRouter } from "../routes/messages";

export class GameService extends NightVisionGame {
    clients: { [uuid: string]: Client };

    constructor() {
        super();
        this.clients = {};
    }

    /**
     * Registers a client's uuid to an in-game playerId, and
     * subscribes the client websocket to recieve updates from the game service
     * 
     * If the client is already registered to this game, replaces the
     * websocket on the existing client, and returns the clients in-game playerId
     * 
     * @param uuid - the client's unique session token cookie
     * @param ws - the websocket to send updates to this client
     * 
     * @returns the in-game playerId associated with this client session token
     */
    registerClient(uuid:string, ws: any):void {
        // if the client is already defined (reconnecting)
        // only update the existing client's websocket connection
        if(this.clients[uuid] !== undefined){
            this.clients[uuid].ws = ws;
            return;
        }

        const id = Object.keys(this.clients).length + 1

        const newClient = new Client(ws, this, id);
        newClient.use('message', messageRouter);

        this.clients[uuid] = newClient;
    };

    /**
     * Sends a Reaction as JSON to all clients registered to this game
     * 
     * @param reaction - a Reaction object to emit
     */
    broadcast(reaction: Reaction):void {
        for(const token in this.clients){
            const client = this.clients[token];
            client.ws.send(reaction.json());
        }
    }
}