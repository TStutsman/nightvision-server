import { GameSocket } from "src/model/GameSocket";
import { ClientError } from "src/model/Reaction";
import type { GameEvent } from "src/types";

interface Listener {
    (event:GameEvent, ws:GameSocket):void
}

class EventRouter {
    routes: {[event:string]: Listener};

    constructor() {
        this.routes = {};

        // Initialize default '*' route that can be overwritten by EventRouter.prototype.on()
        this.routes['*'] = (event:GameEvent, ws:GameSocket) => {
            const error = new ClientError(`Event ${event} not found`);

            ws.json(error);
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
     * Parses buffer stream into an event object and routes the event
     * according to the eventName. If the eventName is not registered
     * to a listener function, the default listener ('*') is called instead
     * 
     * @param socket - the event's origin GameSocket instance
     * @param buffer - the datastream of the event data to be parsed
     */
    route(socket:GameSocket, buffer: Buffer):void {
        const json = String(buffer);
        const data = JSON.parse(json);

        if(this.routes[data.event] === undefined) {
            return this.routes['*'](data, socket);
        }

        const listener = this.routes[data.event];
        listener(data, socket);
    }
}

export { EventRouter };