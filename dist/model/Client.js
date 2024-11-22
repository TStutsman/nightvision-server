export class Client {
    constructor(ws, gameService, id) {
        this.ws = ws;
        this.game = gameService;
        this.id = id;
        this.routers = {};
    }
    use(eventName, router) {
        this.ws.on(eventName, (buffer) => {
            const json = String(buffer);
            const data = JSON.parse(json);
            router.route(this, data);
        });
        this.routers[eventName] = router;
        return this;
    }
    reconnect(ws) {
        this.ws = ws;
        for (const eventName in this.routers) {
            this.ws.on(eventName, (buffer) => {
                const json = String(buffer);
                const data = JSON.parse(json);
                this.routers[eventName].route(this, data);
            });
        }
        return this;
    }
    json(reaction) {
        this.send(reaction.json());
        return this;
    }
    send(message) {
        this.ws.send(message);
        return this;
    }
}
//# sourceMappingURL=Client.js.map