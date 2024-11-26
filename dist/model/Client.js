export class Client {
    constructor(game, id) {
        this.game = game;
        this.id = id;
        this.routers = {};
    }
    use(eventName, router) {
        if (this.ws) {
            this.ws.on(eventName, (buffer) => {
                const json = String(buffer);
                const data = JSON.parse(json);
                router.routeEvent(this.game, this, data);
            });
        }
        this.routers[eventName] = router;
        return this;
    }
    connect(ws) {
        this.ws = ws;
        for (const eventName in this.routers) {
            this.ws.on(eventName, (buffer) => {
                const json = String(buffer);
                const data = JSON.parse(json);
                this.routers[eventName].routeEvent(this.game, this, data);
            });
        }
        return this;
    }
    json(reaction) {
        this.send(reaction.json());
        return this;
    }
    error(error) {
        return this.json(error);
    }
    send(message) {
        this.ws.send(message);
        return this;
    }
}
//# sourceMappingURL=Client.js.map