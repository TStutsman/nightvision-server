import { Reaction } from "../model";
import { EventRouter } from "../service/EventRouter";
import { GameService } from "../service/GameService";
import { WebSocket } from "ws";

export class PlayerService {
    id:number;
    ws:WebSocket;
    game:GameService;

    constructor(ws:WebSocket, gameService:GameService, id:number){
        this.ws = ws;
        this.game = gameService;
        this.id = id;
    }
    
    /**
     * Register's a socket router to handle an event type, similar to how express handles
     * HTTP routes. The buffer object from the WebSocket event is parsed into an event object
     * (currently only supports JSON) and passed to the designated (event) router to be handled
     * 
     * @param eventName - the name of the websocket event ['connecting', 'message', etc.]
     * @param router - the router to handle this event
     * @returns this PlayerService for method chaining
     */
    use(eventName: string, router:EventRouter):PlayerService {
        this.ws.on(eventName, (buffer: Buffer) => {
            const json = String(buffer);
            const data = JSON.parse(json);

            router.route(this, data);
        });
        return this;
    }

    /**
     * Converts a Reaction into json format and sends it to
     * the client via the websocket
     * 
     * @param reaction - an object to be converted to json
     * @returns this PlayerService for method chaining
     */
    json(reaction: Reaction):PlayerService {
        this.send(reaction.json());
        return this;
    }

    /**
     * Sends a message string via the websocket, this is a convenience
     * method to refer to PlayerServiceInstance.ws.send()
     * 
     * @param message - string to be send via the websocket
     * @returns this PlayerService for method chaining
     */
    send(message: string):PlayerService {
        this.ws.send(message);
        return this;
    }
}