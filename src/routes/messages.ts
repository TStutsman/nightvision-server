import { ClientError } from "../model/Reaction.js";
import { JSONEventRouter } from "../service/EventRouter.js";

const messages = new JSONEventRouter();

messages.on('tileClick', (event, client) => {
    if(!event.data || event.data.tileId === undefined) {
        client.json(new ClientError('Must provide tile id for tileClick action'));
        return;
    }

    const { game, id } = client;

    const reactions = game.tileClick(id, event.data.tileId);

    game.broadcast(reactions);
});

messages.on('bearSpray', (_, client) => {
    const reactions = client.game.buySpray(client.id);

    client.game.broadcast(reactions);
});

messages.on('reshuffle', (_, client) => {
    const reactions = client.game.reshuffle(client.id);

    client.game.broadcast(reactions);
});

messages.on('flashlight', (_, client) => {
    const reactions = client.game.turnOnFlashlight(client.id);

    client.game.broadcast(reactions);
});

messages.on('playAgain', (_, client) => {
    const reactions = client.game.resetGame();

    client.game.broadcast(reactions);
});

export { messages as messageRouter };