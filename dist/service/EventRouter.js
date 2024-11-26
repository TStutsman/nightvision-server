import { ClientError } from "../model/index.js";
;
class GameEventRouter {
    constructor() {
        this.routes = {};
        this.routes['*'] = (_, client, eventName) => {
            const error = new ClientError(`Event ${eventName} not found`);
            client.json(error);
        };
    }
    on(eventName, reaction) {
        this.routes[eventName] = reaction;
    }
    routeEvent(game, client, event) {
        if (this.routes[event.name] === undefined) {
            return this.routes['*'](game, client, event.name);
        }
        const listener = this.routes[event.name];
        listener(game, client, event.data);
    }
}
export { GameEventRouter };
//# sourceMappingURL=EventRouter.js.map