import express from "express";
import { store } from "../store";

const games = express.Router();

// Creates a new game and sends the id to the user
games.get('/new', (_, res) => {
    const gameId = store.createGame();

    res.json({
        gameId
    });
});

// Return the state of a specific game
games.get('/:gameId', (req, res) => {
    const game = store.getGameById(+req.params.gameId);

    if(!game) {
        res.status = 404;
        res.json({
            message: `Unable to find game with id ${req.params.id}`
        });
        return;
    }

    res.json(game)
});

export { games as gamesRouter };