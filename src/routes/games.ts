import { GameSocket } from 'src/model/GameSocket';
import { Router } from 'websocket-express';
import { gameStore } from "../repository/GameStore";
import { sessionStore } from '../repository/SessionStore';
import { GameService } from "../service/GameService";
import { messageRouter } from './messages';

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

    // register client to recieve reaction broadcasts
    // TODO: handle this inside GameSocket constructor??
    const playerId = gameService.registerClient(token, ws);

    const socket = new GameSocket(ws, gameService, playerId);
    socket.use('message', messageRouter);
});

export { games as gamesRouter };
