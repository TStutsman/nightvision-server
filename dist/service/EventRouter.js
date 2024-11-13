import { ClientError } from "../model/Reaction.js";
;
class JSONEventRouter {
    constructor() {
        this.routes = {};
        this.routes['*'] = (event, playerService) => {
            const error = new ClientError(`Event ${event} not found`);
            playerService.json(error);
        };
    }
    on(eventName, reaction) {
        this.routes[eventName] = reaction;
    }
    route(playerService, data) {
        if (this.routes[data.event] === undefined) {
            return this.routes['*'](data, playerService);
        }
        const listener = this.routes[data.event];
        listener(data, playerService);
    }
}
export { JSONEventRouter };
//# sourceMappingURL=EventRouter.js.map