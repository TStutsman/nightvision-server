import { ClientError } from "../model/Reaction.js";
import { JSONEventRouter } from "../service/EventRouter.js";
const messages = new JSONEventRouter();
messages.on('tileClick', (event, client) => {
    if (!event.data || event.data.tileId === undefined)
        return new ClientError('Must provide tile id for tileClick action');
    const { game, id } = client;
    const reactions = game.tileClick(id, event.data.tileId);
    for (const reaction of reactions) {
        game.broadcast(reaction);
    }
    return;
});
messages.on('bearSpray', (_, client) => {
    const reactions = client.game.buySpray(client.id);
    for (const reaction of reactions) {
        client.game.broadcast(reaction);
    }
    return;
});
messages.on('reshuffle', (_, client) => {
    const reactions = client.game.reshuffle(client.id);
    for (const reaction of reactions) {
        client.game.broadcast(reaction);
    }
    return;
});
messages.on('flashlight', (_, client) => {
    const reactions = client.game.turnOnFlashlight(client.id);
    for (const reaction of reactions) {
        client.game.broadcast(reaction);
    }
    return;
});
messages.on('playAgain', (_, client) => {
    const reactions = client.game.resetGame();
    for (const reaction of reactions) {
        client.game.broadcast(reaction);
    }
    return;
});
export { messages as messageRouter };
//# sourceMappingURL=messages.js.map