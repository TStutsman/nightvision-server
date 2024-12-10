import { NightVisionGame, Reaction, Client } from "../model/index.js";
import { messageRouter } from "../routes/messages.js";
import { GameEventRouter } from "./EventRouter.js";
import type { WebSocket } from 'ws';

export class GameService extends NightVisionGame {
    clients: { [uuid: string]: Client };
    numClients: number;
    router: GameEventRouter;

    constructor() {
        super();
        this.clients = {};
        this.numClients = 0;
        this.router = messageRouter;
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
    registerClient(uuid:string, ws: WebSocket):void {
        // if the client is not defined (first time connecting)
        // create a new client and add to client hash
        if(this.clients[uuid] === undefined){
            const id = ++this.numClients;
            this.clients[uuid] = new Client(this, id);
        }
        
        this.clients[uuid].connect(ws).use('message', this.router);
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

        const reset = this.resetGame();
        this.broadcast(reset);
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