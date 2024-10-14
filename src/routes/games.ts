import { Router } from 'websocket-express';
import { store } from "../store";
import { Game, ActionResponse } from "../models/game";

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
    const game:Game = store.getGameById(+req.params.gameId);
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
        deck: deck.tiles.map(tile => tile.revealed ? tile : { revealed: false })
    })
});

/**
 * @route /:gameId (websocket)
 * 
 * Websocket route for a single game instance
 */
games.ws('/:gameId', async (req, res, next) => {
    const ws = await res.accept();

    const game:Game = store.getGameById(+req.params.gameId);

    ws.on('message', (buffer: Buffer) => {
        const { event: actionType, data } = JSON.parse(buffer.toString('utf-8'));

        if(!game) {
            ws.send('This game does not exist');
            next();
        }

        const res:ActionResponse = game.action(actionType, data);

        console.log('res:', res);
        ws.send(JSON.stringify(res))
    })

    // if(!game) {
    //     ws. = 404;
    //     res.json({
    //         message: `Unable to find game with id ${req.params.gameId}`
    //     });
    //     return;
    // }

    // const { tileId } = req.body;
    // flipTileById(tileId, game);
    
    // console.log(req.params.gameId, game.deck.tiles)

    // res.json({
    //     deck: game.deck.tiles.map(tile => tile.revealed ? tile : { revealed: false })
    // });
});

export { games as gamesRouter };