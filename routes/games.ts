import express from "express";
import { store } from "../store";
import { Game } from "../models/game";

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
        res.status = 404;
        res.json({
            message: `Unable to find game with id ${req.params.id}`
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

// Return the state of a specific game
games.post('/:gameId/flipTile', (req, res) => {
    const game:Game = store.getGameById(+req.params.gameId);

    if(!game) {
        res.status = 404;
        res.json({
            message: `Unable to find game with id ${req.params.id}`
        });
        return;
    }

    const { activePlayer, players, bearSpotted, gameOver, endGameStatus, deck } = game;

    console.log('FLIPPED TILE', req.body.tileId);

    res.json({
        activePlayer: activePlayer.id,
        players,
        bearSpotted,
        gameOver,
        endGameStatus,
        deck: deck.tiles.map(tile => tile.revealed ? tile : { revealed: false })
    })
});

export { games as gamesRouter };