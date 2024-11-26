import { ClientError } from "../model/index.js";
import type { Client } from "../model/index.js";
import type { GameEvent } from "../types/index.js";
import type { GameService } from "./index.js";

interface Listener {
    (game:GameService, client:Client, data:any):void
}

interface EventRouter {
    routes: {[event:string]: Listener};
    on: (eventName:string, reaction:Listener) => void;
    routeEvent: (game:GameService, client:Client, data:any) => void;
};

class GameEventRouter implements EventRouter{
    routes: {[event:string]: Listener};

    constructor() {
        this.routes = {};

        // Initialize default '*' route that can be overwritten by EventRouter.prototype.on()
        this.routes['*'] = (_, client, eventName) => {
            const error = new ClientError(`Event ${eventName} not found`);

            client.json(error);
        };
    }

    /**
     * Registers a listener function to handle all incoming events
     * named 'eventName'
     * 
     * @param eventName - the name of the event
     * @param reaction - the listener to register to the event
     */
    on(eventName:string, reaction:Listener) {
        this.routes[eventName] = reaction;
    }

    /**
     * Routes the event to a listener according to the event's name.
     * 
     * If the eventName is not registered to a listener function, 
     * the default listener ('*') is called instead
     * 
     * @param client - the event's origin Client instance
     * @param data - the data object to pass to the listener fn
     */
    routeEvent(game:GameService, client: Client, event: GameEvent):void {
        if(this.routes[event.name] === undefined) {
            return this.routes['*'](game, client, event.name);
        }

        const listener = this.routes[event.name];
        listener(game, client, event.data);
    }
}

export { EventRouter, GameEventRouter };