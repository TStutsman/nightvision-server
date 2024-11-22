import { NightVisionGame, Reaction, Client } from "../model/index.js";
import { messageRouter } from "../routes/messages.js";

export class GameService extends NightVisionGame {
    clients: { [uuid: string]: Client };
    numClients: number;

    constructor() {
        super();
        this.clients = {};
        this.numClients = 0;
    }

    /**
     * Registers a client's uuid to an in-game playerId, and
     * subscribes the client websocket to recieve updates from the game service
     * 
     * If the client is already registered to this game, replaces the
     * websocket on the existing client
     * 
     * @param uuid - the client's unique session token cookie
     * @param ws - the websocket to send updates to this client
     */
    registerClient(uuid:string, ws: any):void {
        // if the client is already defined (reconnecting)
        // only update the existing client's websocket connection
        if(this.clients[uuid] !== undefined){
            this.clients[uuid].reconnect(ws);
            return;
        }

        const id = ++this.numClients;

        const newClient = new Client(ws, this, id);
        newClient.use('message', messageRouter);

        this.clients[uuid] = newClient;
    };

    /**
     * Removes the client with the specified uuid, and resets
     * the game the client was in
     * 
     * @param uuid - the client's unique session token cookie
     */
    removeClient(uuid:string):void {
        delete this.clients[uuid];

        this.numClients--;

        const reactions = this.resetGame();
        this.broadcast(reactions);
    }

    /**
     * Sends one Reaction as JSON to all clients registered to this game
     * 
     * @param reaction - a Reaction object to emit
     */
    broadcast(reaction: Reaction):void;
    /**
     * Sends each Reaction in an array to all clients registered to this game
     * 
     * @param reactions - an array of Reaction objects to emit
     */
    broadcast(reactions: Reaction[]):void;
    broadcast(reactionOrReactions: Reaction | Reaction[]):void {
        if(reactionOrReactions instanceof Reaction){
            return this._broadcast(reactionOrReactions);
        }

        for(const reaction of reactionOrReactions){
            this._broadcast(reaction);
        }
    }
    
    /**
     * Sends a single Reaction as JSON to all clients registered to this game
     * Used internally by broadcast()
     * 
     * @param reaction - a Reaction object to emit
     */
    _broadcast(reaction:Reaction):void {
        for(const token in this.clients){
            const client = this.clients[token];
            client.ws.send(reaction.json());
        }
    }
}