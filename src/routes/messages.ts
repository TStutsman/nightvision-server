import { ClientError } from "../model/Reaction.js";
import { JSONEventRouter } from "../service/EventRouter.js";

const messages = new JSONEventRouter();

messages.on('tileClick', (event, playerService) => {
    console.log(event);

    if(!event.data || event.data.tileId === undefined) return new ClientError('Must provide tile id for tileClick action');

    const { game, id } = playerService;

    const reactions = game.tileClick(id, event.data.tileId);

    for(const reaction of reactions) {
        game.broadcast(reaction);
    }
    return;
});

messages.on('bearSpray', (_, playerService) => {
    const reactions = playerService.game.buySpray(playerService.id);

    for(const reaction of reactions) {
        playerService.game.broadcast(reaction);
    }
    return;
});

messages.on('reshuffle', (_, playerService) => {
    const reactions = playerService.game.reshuffle(playerService.id);

    for(const reaction of reactions) {
        playerService.game.broadcast(reaction);
    }
    return;
});

messages.on('flashlight', (_, playerService) => {
    const reactions = playerService.game.turnOnFlashlight(playerService.id);

    for(const reaction of reactions) {
        playerService.game.broadcast(reaction);
    }
    return;
});

messages.on('playAgain', (_, playerService) => {
    const reactions = playerService.game.resetGame();

    for(const reaction of reactions) {
        playerService.game.broadcast(reaction);
    }
    return;
});

export { messages as messageRouter };