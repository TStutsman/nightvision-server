import express from "express";
import { store } from "../store";
import { Game } from "../models/game";
import { playerAction } from "../actions";

const games = express.Router();

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

    if(!game) {
        res.statusCode = 404;
        res.json({
            message: `Unable to find game with id ${req.params.gameId}`
        });
        return;
    }

    const { activePlayer, players, bearSpotted, gameOver, endGameStatus, deck } = game;

    console.log(req.params.gameId, deck.tiles);

    res.json({
        activePlayer: activePlayer.id,
        players,
        bearSpotted,
        gameOver,
        endGameStatus,
        deck: deck.tiles.map(tile => tile.revealed ? tile : { revealed: false })
    })
});

// Websocket route for in-game actions
games.ws('/:gameId', (ws, req, next) => {
    const game:Game = store.getGameById(+req.params.gameId);

    ws.on('message', (msg: [event: string, data: {tileId: number}]) => {
        const [ event, data ] = msg;

        if(!game) {
            ws.send('This game does not exist');
            next();
        }

        const res:(string | object)[] = playerAction(game, event, data);

        ws.send(res)
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