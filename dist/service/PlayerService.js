export class PlayerService {
    constructor(ws, gameService, id) {
        this.ws = ws;
        this.game = gameService;
        this.id = id;
    }
    use(eventName, router) {
        this.ws.on(eventName, (buffer) => {
            const json = String(buffer);
            const data = JSON.parse(json);
            router.route(this, data);
        });
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
//# sourceMappingURL=PlayerService.js.map