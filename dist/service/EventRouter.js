import { ClientError } from "../model/index.js";
;
class JSONEventRouter {
    constructor() {
        this.routes = {};
        this.routes['*'] = (event, client) => {
            const error = new ClientError(`Event ${event} not found`);
            client.json(error);
        };
    }
    on(eventName, reaction) {
        this.routes[eventName] = reaction;
    }
    route(client, data) {
        if (this.routes[data.event] === undefined) {
            return this.routes['*'](data, client);
        }
        const listener = this.routes[data.event];
        listener(data, client);
    }
}
export { JSONEventRouter };
//# sourceMappingURL=EventRouter.js.map