import { ClientError, Reaction, PlayerError } from "../model/index.js";
import { GameEventRouter } from "../service/EventRouter.js";

const messages = new GameEventRouter();

messages.on('tileClick', (game, client, data) => {
    if(!data || data.tileId === undefined) {
        client.error(new ClientError('Must provide tile id for tileClick action'));
        return;
    }

    const reactions:Reaction[] | PlayerError = game.tileClick(client.id, data.tileId);

    if (reactions instanceof PlayerError) {
        client.error(reactions);
    } else {
        game.broadcast(reactions);
    }
});

messages.on('bearSpray', (game, client) => {
    const reaction = game.buySpray(client.id);

    if (reaction instanceof PlayerError) {
        client.error(reaction);
    } else {
        game.broadcast(reaction);
    }
});

messages.on('reshuffle', (game, client) => {
    const reaction = game.reshuffle(client.id);

    if (reaction instanceof PlayerError) {
        client.error(reaction);
    } else {
        game.broadcast(reaction);
    }
});

messages.on('flashlight', (game, client) => {
    const reaction = game.turnOnFlashlight(client.id);

    if (reaction instanceof PlayerError) {
        client.error(reaction);
    } else {
        game.broadcast(reaction);
    }
});

messages.on('playAgain', (game) => {
    const reaction = game.resetGame();

    game.broadcast(reaction);
});

export { messages as messageRouter };