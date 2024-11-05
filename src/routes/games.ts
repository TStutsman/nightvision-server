import { Router } from 'websocket-express';
import { store } from "../repository/GameStore";
import { sessions } from '../repository/SessionStore';
import { GameService } from "../service/GameService";
import { GameUpdate, PlayerError } from 'src/model/GameUpdate';

const games = new Router();

// Creates a new game and sends the id to the user
// TODO: send game immediately instead
games.get('/new', (req, res) => {
    const gameId = store.createGame();

    const { session: token } = req.cookies;
    sessions.attachService(token, gameId);
    console.log(sessions.all());

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
    const ws = await res.accept();
    const gameService:GameService = store.getGameServiceById(+req.params.gameId);

    if(!gameService) {
        res.json({
            error: 'This game does not exist',
        });
    }

    ws.on('message', (buffer: Buffer) => {
        const json = String(buffer)
        const { event: actionType, data, token } = JSON.parse(json);
        const playerId = gameService.sessions[token]?.id;

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
                for(let session of Object.values(gameService.sessions)){
                    session.ws.send(JSON.stringify({
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