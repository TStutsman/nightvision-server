import { gameStore, sessionStore } from '../repository/index.js';
import { GameService } from "../service/index.js";
import { Router } from 'websocket-express';
const games = new Router();
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
            deck: deck.getTiles(),
            images: GameService.images
        }
    });
});
games.get('/leave', (req, res) => {
    const token = req.cookies.session;
    const gameId = sessionStore.getServiceId(token);
    const gameService = gameStore.getGameServiceById(gameId);
    gameService.removeClient(token);
    sessionStore.removeService(token);
    if (gameService.numClients < 1) {
        gameStore.deleteGameById(gameId);
    }
    res.json({
        gameId: ''
    });
});
games.get('/:gameId', (req, res) => {
    const game = gameStore.getGameServiceById(req.params.gameId);
    console.log("GET /games/[gameId:\x1b[32m" + req.params.gameId + "\x1b[0m]");
    if (!game) {
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
            deck: deck.getTiles(),
            images: GameService.images
        }
    });
});
games.ws('/:gameId', async (req, res) => {
    const token = req.cookies.session;
    const gameService = gameStore.getGameServiceById(req.params.gameId);
    if (!gameService) {
        res.reject(404, 'This game does not exist');
        return;
    }
    if (!token)
        res.reject(403, 'Session token invalid');
    const ws = await res.accept();
    gameService.registerClient(token, ws);
});
export { games as gamesRouter };
//# sourceMappingURL=games.js.map