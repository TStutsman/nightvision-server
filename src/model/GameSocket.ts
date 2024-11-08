import { EventRouter } from "src/service/EventRouter";
import { GameService } from "src/service/GameService";
import { WebSocket } from "ws";
import { Reaction } from "./Reaction";

export class GameSocket {
    ws:WebSocket;
    game:GameService;
    playerId:number;

    constructor(ws:WebSocket, gameService:GameService, token:string){
        this.ws = ws;
        this.game = gameService;
        // register client to recieve reaction broadcasts
        this.playerId = gameService.registerClient(token, ws);
    }
    
    /**
     * Register's a socket router to handle an event type, similar to how express handles
     * HTTP routes. The buffer object from the WebSocket event is passed directly to the
     * designated (event) router to be handled
     * 
     * @param eventName - the name of the websocket event ['connecting', 'message', etc.]
     * @param router - the router to handle this event
     * @returns this GameSocket object for method chaining
     */
    use(eventName: string, router:EventRouter):GameSocket {
        this.ws.on(eventName, (buffer: Buffer) => {
            router.route(this, buffer);
        });
        return this;
    }

    /**
     * Converts an object into json format and sends it to
     * the client via the websocket
     * 
     * @param reaction - an object to be converted to json
     * @returns this GameSocket object for method chaining
     */
    json(reaction: Object):GameSocket {
        const json = JSON.stringify(reaction);

        this.ws.send(json);
        return this;
    }

    /**
     * Converts an event reaction to json and sends the json string
     * to all clients registered to the game
     * 
     * @param reaction - the event reaction to send to all clients
     * @returns this GameSocketObject for method chaining
     */
    emit(reaction: Reaction):GameSocket {
        const json = reaction.json();
        const clients = Object.values(this.game.clients);

        for(const client of clients){
            client.ws.send(json)
        }
        return this;
    }
}