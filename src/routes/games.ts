import { Router } from 'websocket-express';
import { gameStore } from "../repository/GameStore";
import { sessionStore } from '../repository/SessionStore';
import { GameService } from "../service/GameService";
import { GameUpdate, PlayerError } from 'src/model/GameUpdate';

const games = new Router();

// Creates a new game and sends the id to the user
// TODO: send game immediately instead
games.get('/new', (req, res) => {
    const gameId = gameStore.createGame();

    const { session: token } = req.cookies;
    sessionStore.attachService(token, gameId);

    res.json({
        gameId
    });
});

/**
 * Attaches the session to a gameService and
 * returns the entire (initial) state of the game
 * 
 * Usually used to initialize the game on the client side
 */
games.get('/:gameId', (req, res) => {
    const game:GameService = gameStore.getGameServiceById(req.params.gameId);
    console.log('GET /:gameId:', req.params.gameId);

    if(!game) {
        res.status(404).json({
            message: `Unable to find game with id ${req.params.gameId}`
        });
        return;
    }

    const { session: token } = req.cookies;
    sessionStore.attachService(token, req.params.gameId);

    const { players, bearSpotted, gameOver, endGameStatus, deck } = game;

    res.json({
        activePlayer: game.activePlayer().id,
        players,
        bearSpotted,
        gameOver,
        endGameStatus,
        deck: deck.getTiles()
    });
});

/**
 * @route /:gameId (websocket)
 * 
 * Websocket route for a single game instance
 */
games.ws('/:gameId', async (req, res) => {
    const gameService:GameService = gameStore.getGameServiceById(req.params.gameId);

    if(!gameService) {
        res.reject(404, 'This game does not exist');
    }

    const ws = await res.accept();

    const { session: token } = req.cookies;
    gameService.addClient(token, ws);

    ws.on('message', (buffer: Buffer) => {
        const json = String(buffer)
        const { event: actionType, data } = JSON.parse(json);

        const playerId = gameService.clients[token].id;

        function handleAction(actionType:string, data:any):GameUpdate[] | PlayerError {
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
                case 'playAgain': {
                    return gameService.resetGame();
                }
                default: {
                    return new PlayerError(`Action ${actionType} not recognized`);
                }
            }
        }

        // TODO: handle errors before broadcasting
        if(gameService.activePlayer().id !== playerId) {
            ws.send(JSON.stringify({
                actionType: 'playerError',
                message: 'Not your turn',
            }));

            return;
        }

        const gameUpdates = handleAction(actionType, data);

        if (gameUpdates instanceof PlayerError){
            ws.send(JSON.stringify({
                actionType: gameUpdates.actionType,
                error: gameUpdates.message
            }));
        } else {
            for(let gameUpdate of gameUpdates) {
                for(let client of Object.values(gameService.clients)){
                    client.ws.send(JSON.stringify({
                        actionType: gameUpdate.actionType,
                        message: gameUpdate.message,
                        data: gameUpdate.data
                    }));
                }
            }
        }
    })
});

export { games as gamesRouter };