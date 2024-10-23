import { Router } from 'websocket-express';
import { store } from "../repository/GameStore";
import { GameService } from "../service/GameService";
import { GameUpdate } from 'src/model/GameUpdate';

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

        function handleAction(actionType:string, data:any):GameUpdate | ErrorMessage | void {
            switch (actionType) {
                case 'tileClick': {
                    if(!data) {
                        return { error: 'Must provide tile id for tileClick action' };
                    }
    
                    const res = gameService.tileClick(data.tileId);
                    return res;
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
                    return { error: `Action ${actionType} not recognized`}
                }
            }
        }

        const res = handleAction(actionType, data);
        ws.send(JSON.stringify(res));
    })
});

export { games as gamesRouter };

// if(gameService.flippedTiles.length > 1) {
//     const [tile1, tile2] = gameService.hideFlippedTiles();
//     const res:string = JSON.stringify({
//         actionType: 'noMatch',
//         data: {
//             tileId1: tile1.getId(),
//             tileId2: tile2.getId(),
//             playerId: gameService.activePlayer.id,
//         }
//     });
//     console.log('res:', res);
//     ws.send(res);
// }

// if(gameService.gameOver) {
//     const res:string = JSON.stringify({
//         actionType: 'endGame',
//         data: {
//             endGameStatus: gameService.endGameStatus,
//         }
//     });
//     console.log('res:', res);
//     ws.send(res);
// }