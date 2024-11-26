import type { Reaction, ClientError, PlayerError } from "./index.js";
import type { EventRouter, GameService } from "../service/index.js";
import type { WebSocket } from "ws";

export class Client {
    id:number;
    ws:WebSocket;
    game:GameService;
    routers:{[eventName:string]: EventRouter};

    constructor(game:GameService, id:number){
        this.game = game;
        this.id = id;
        this.routers = {};
    }
    
    /**
     * Register's a socket router to handle an event type, similar to how express handles
     * HTTP routes. The buffer object from the WebSocket event is parsed into an event object
     * (currently only supports JSON) and passed to the designated (event) router to be handled
     * 
     * @param eventName - the name of the websocket event ['connecting', 'message', etc.]
     * @param router - the router to handle this event
     * @returns this Client for method chaining
     */
    use(eventName: string, router:EventRouter):Client {
        if(this.ws){
            this.ws.on(eventName, (buffer: Buffer) => {
                const json = String(buffer);
                const data = JSON.parse(json);
    
                router.routeEvent(this.game, this, data);
            });
        }

        this.routers[eventName] = router;
        return this;
    }

    /**
     * Connects a new websocket connection to an existing client,
     * and re-registers all routers associated with the client
     * 
     * @param ws - new websocket object to recieve and emit events
     * @returns this Client for method chaining
     */
    connect(ws:WebSocket):Client {
        this.ws = ws;
        for(const eventName in this.routers){
            this.ws.on(eventName, (buffer: Buffer) => {
                const json = String(buffer);
                const data = JSON.parse(json);

                this.routers[eventName].routeEvent(this.game, this, data);
            })
        }
        return this;
    }

    /**
     * Converts a Reaction into json format and sends it to
     * the client via the websocket
     * 
     * @param reaction - an object to be converted to json
     * @returns this Client for method chaining
     */
    json(reaction: Reaction):Client {
        this.send(reaction.json());
        return this;
    }

    /**
     * Syntax-friendly function for sending
     * json of an error to a client
     * @param error - an error to be converted to json and sent to client
     * @returns this Client for method chaining
     */
    error(error: ClientError | PlayerError):Client {
        return this.json(error);
    }

    /**
     * Sends a message string via the websocket, this is a convenience
     * method to refer to ClientInstance.ws.send()
     * 
     * @param message - string to be send via the websocket
     * @returns this Client for method chaining
     */
    send(message: string):Client {
        this.ws.send(message);
        return this;
    }
}