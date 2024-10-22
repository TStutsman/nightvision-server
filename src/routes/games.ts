import { Router } from 'websocket-express';
import { store } from "../repository/GameStore";
import { GameService } from "../service/GameService";

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

        switch (actionType) {
            case 'tileClick': {
                if(!data) {
                    ws.send(JSON.stringify({error: 'Must provide tile id for tileClick action'}));
                    return;
                }

                const res = gameService.tileClick(data.tileId);
                ws.send(JSON.stringify(res));

                break;
            }
            case 'bearSpray': {
                gameService.buySpray();
                break;
            }
            case 'reshuffle': {
                gameService.reshuffle();
                break;
            }
            case 'flashlight': {
                gameService.flashlightIsOn = true;
                break;
            }
            default: {

            }
        }

        if(gameService.flippedTiles.length > 1) {
            const [tile1, tile2] = gameService.hideFlippedTiles();
            const res:string = JSON.stringify({
                actionType: 'noMatch',
                data: {
                    tileId1: tile1.getId(),
                    tileId2: tile2.getId(),
                    playerId: gameService.activePlayer.id,
                }
            });
            console.log('res:', res);
            ws.send(res);
        }

        if(gameService.gameOver) {
            const res:string = JSON.stringify({
                actionType: 'endGame',
                data: {
                    endGameStatus: gameService.endGameStatus,
                }
            });
            console.log('res:', res);
            ws.send(res);
        }
    })
});

export { games as gamesRouter };