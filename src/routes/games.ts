import { Router } from 'websocket-express';
import { store } from "../repository/GameStore";
import { GameService } from "../service/GameService";
import { GameUpdate, PlayerError } from 'src/model/GameUpdate';

const games = new Router();

// Creates a new game and sends the id to the user
// TODO: send game immediately instead
games.get('/new', (_, res) => {
    const gameId = store.createGame();

    res.json({
        gameId
    });
});

// Return the state of a specific game
games.get('/:gameId', (req, res) => {
    const game:GameService = store.getGameServiceById(+req.params.gameId);
    console.log('GET /:gameId:', req.params.gameId);

    if(!game) {
        res.statusCode = 404;
        res.json({
            message: `Unable to find game with id ${req.params.gameId}`
        });
        return;
    }

    const { activePlayer, players, bearSpotted, gameOver, endGameStatus, deck } = game;

    res.json({
        activePlayer: activePlayer.id,
        players,
        bearSpotted,
        gameOver,
        endGameStatus,
        deck: deck.getTiles()
    })
});

/**
 * @route /:gameId (websocket)
 * 
 * Websocket route for a single game instance
 */
games.ws('/:gameId', async (req, res, next) => {
    const ws = await res.accept();

    const gameService:GameService = store.getGameServiceById(+req.params.gameId);

    if(!gameService) {
        res.json({
            error: 'This game does not exist',
        });
        next();
    }

    ws.on('message', (buffer: Buffer) => {
        const json = String(buffer)
        const { event: actionType, data } = JSON.parse(json);

        function handleAction(actionType:string, data:any):GameUpdate | ErrorMessage {
            switch (actionType) {
                case 'tileClick': {
                    if(!data) return new PlayerError('Must provide tile id for tileClick action');

                    return gameService.tileClick(data.tileId);
                }
                case 'bearSpray': {
                    return gameService.buySpray();
                }
                case 'reshuffle': {
                    return gameService.reshuffle();
                }
                case 'flashlight': {
                    return gameService.turnOnFlashlight();
                }
                default: {
                    return new PlayerError(`Action ${actionType} not recognized`);
                }
            }
        }

        const gameUpdate = handleAction(actionType, data);

        if (gameUpdate instanceof PlayerError){
            ws.send(JSON.stringify({
                actionType: gameUpdate.actionType,
                error: gameUpdate.message
            }));
        } else {
            ws.send(JSON.stringify({
                actionType: gameUpdate.actionType,
                message: gameUpdate.message,
                data: gameUpdate.data
            }));
        }
    })
});

export { games as gamesRouter };