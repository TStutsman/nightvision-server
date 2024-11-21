import { ClientError } from "../model/Reaction.js";
import { JSONEventRouter } from "../service/EventRouter.js";

const messages = new JSONEventRouter();

messages.on('tileClick', (event, playerService) => {
    if(!event.data || event.data.tileId === undefined) {
        playerService.json(new ClientError('Must provide tile id for tileClick action'));
        return;
    }

    const { game, id } = playerService;

    const reactions = game.tileClick(id, event.data.tileId);

    game.broadcast(reactions);
});

messages.on('bearSpray', (_, playerService) => {
    const reactions = playerService.game.buySpray(playerService.id);

    playerService.game.broadcast(reactions);
});

messages.on('reshuffle', (_, playerService) => {
    const reactions = playerService.game.reshuffle(playerService.id);

    playerService.game.broadcast(reactions);
});

messages.on('flashlight', (_, playerService) => {
    const reactions = playerService.game.turnOnFlashlight(playerService.id);

    playerService.game.broadcast(reactions);
});

messages.on('playAgain', (_, playerService) => {
    const reactions = playerService.game.resetGame();

    playerService.game.broadcast(reactions);
});

export { messages as messageRouter };