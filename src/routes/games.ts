import { gameStore, sessionStore } from '../repository/index.js';
import { GameService } from "../service/index.js";
import { Router } from 'websocket-express';

const games = new Router();

/**
 * @route GET /api/games/new
 * 
 * Creates a new game and attaches the client session to 
 * the new gameService
 * 
 * Responds with the id of the game and entire state of the game
 */
games.get('/new', (req, res) => {
    const gameId = gameStore.createGame();

    const { session: token } = req.cookies;
    sessionStore.attachService(token, gameId);

    const game = gameStore.getGameServiceById(gameId);
    const { players, bearSpotted, endGameStatus, deck } = game;

    res.json({
        gameId,
        game: {
            activePlayer: game.activePlayer().id,
            players,
            bearSpotted,
            endGameStatus,
            deck: deck.getTiles()
        }
    });
});


/**
 * @route GET /api/games/leave
 * 
 * Unsubscribes the client websocket from the gameService, and
 * unregisters the session with that same gameService
 * 
 * Also checks if the gameService has any remaining clients, and deletes
 * the game if there are none
 * 
 * Responds with an empty gameId (200)
 */
games.get('/leave', (req, res) => {
    const token = req.cookies.session;
    const gameId = sessionStore.getServiceId(token);
    const gameService:GameService = gameStore.getGameServiceById(gameId);
    
    gameService.removeClient(token);
    sessionStore.removeService(token);

    if(gameService.numClients < 1) {
        gameStore.deleteGameById(gameId);
    }

    res.json({
        gameId: ''
    });
});

/**
 * @route GET /api/games/:gameId
 * 
 * Attaches the session to a gameService and
 * responds with the entire state of the game
 * 
 * Usually used to initialize the client's game state
 */
games.get('/:gameId', (req, res) => {
    const game:GameService = gameStore.getGameServiceById(req.params.gameId);
    console.log("GET /games/[gameId:\x1b[32m" + req.params.gameId + "\x1b[0m]");

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
        gameId: req.params.gameId,
        game: {
        activePlayer: game.activePlayer().id,
        players,
        bearSpotted,
        endGameStatus,
        deck: deck.getTiles()
        }
    });
});

/**
 * @route api/games/:gameId (websocket)
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

    if(!gameService){
        console.log('no game');
        res.reject(404, 'This game does not exist');
        return;
    }
    if(!token) res.reject(403, 'Session token invalid');

    const ws = await res.accept();
    gameService.registerClient(token, ws);
});

export { games as gamesRouter };
