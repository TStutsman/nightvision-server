import { gameStore, sessionStore } from '../repository';
import { GameService } from "../service";
import { Router } from 'websocket-express';

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

    const { players, bearSpotted, endGameStatus, deck } = game;

    res.json({
        activePlayer: game.activePlayer().id,
        players,
        bearSpotted,
        endGameStatus,
        deck: deck.getTiles()
    });
});

/**
 * @route /:gameId (websocket)
 * 
 * Performs the websocket handshake if the gameId exists,
 * and attaches an event router to handle the custom message events.
 * 
 * If the game doesn't exist or the client does not have a session cookie,
 * responds to client with an error message
 */
games.ws('/:gameId', async (req, res) => {
    const token = req.cookies.session;
    const gameService:GameService = gameStore.getGameServiceById(req.params.gameId);

    if(!gameService) res.reject(404, 'This game does not exist');
    if(!token) res.reject(403, 'Session token invalid');

    const ws = await res.accept();
    gameService.registerClient(token, ws);
});

export { games as gamesRouter };
