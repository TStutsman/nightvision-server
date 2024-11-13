import { PlayerService } from "../service/index.js";
import { ClientError } from "../model/Reaction.js";
import type { GameEvent } from "../types/index.js";

interface Listener {
    (event:GameEvent, playerService:PlayerService):void
}

interface EventRouter {
    routes: {[event:string]: Listener};
    on: (eventName:string, reaction:Listener) => void;
    route: (playerService:PlayerService, data:any) => void;
};

class JSONEventRouter implements EventRouter{
    routes: {[event:string]: Listener};

    constructor() {
        this.routes = {};

        // Initialize default '*' route that can be overwritten by EventRouter.prototype.on()
        this.routes['*'] = (event:GameEvent, playerService:PlayerService) => {
            const error = new ClientError(`Event ${event} not found`);

            playerService.json(error);
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
     * Routes the event according to the eventName.
     * 
     * If the eventName is not registered to a listener function, 
     * the default listener ('*') is called instead
     * 
     * @param playerService - the event's origin PlayerService instance
     * @param data - the data object to pass to the listener fn
     */
    route(playerService:PlayerService, data: any):void {
        if(this.routes[data.event] === undefined) {
            return this.routes['*'](data, playerService);
        }

        const listener = this.routes[data.event];
        listener(data, playerService);
    }
}

export { EventRouter, JSONEventRouter };