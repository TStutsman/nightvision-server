import { ClientError } from "src/model/Reaction";
import { EventRouter } from "src/service/EventRouter";

const messages = new EventRouter();

messages.on('tileClick', (event, socket) => {
    if(!event.data || event.data.tileId === undefined) return new ClientError('Must provide tile id for tileClick action');

    const reactions = socket.game.tileClick(socket.playerId, event.data.tileId);

    for(const reaction of reactions) {
        socket.emit(reaction);
    }
    return;
});

messages.on('bearSpray', (_, socket) => {
    const reactions = socket.game.buySpray(socket.playerId);

    for(const reaction of reactions) {
        socket.emit(reaction);
    }
    return;
});

messages.on('reshuffle', (_, socket) => {
    const reactions = socket.game.reshuffle(socket.playerId);

    for(const reaction of reactions) {
        socket.emit(reaction);
    }
    return;
});

messages.on('flashlight', (_, socket) => {
    const reactions = socket.game.turnOnFlashlight(socket.playerId);

    for(const reaction of reactions) {
        socket.emit(reaction);
    }
    return;
});

messages.on('playAgain', (_, socket) => {
    const reactions = socket.game.resetGame();

    for(const reaction of reactions) {
        socket.emit(reaction);
    }
    return;
});

export { messages as messageRouter };