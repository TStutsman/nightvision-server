import { GameService } from "../service/GameService.js";
class GameStore {
    constructor() {
        this._activeGames = {};
    }
    uniqueGameId() {
        function generateRandomId() {
            return [1, 1, 1, 1, 1, 1].map(_ => {
                const randLetterIndex = Math.floor(Math.random() * 26);
                return String.fromCharCode(65 + randLetterIndex);
            }).join('');
        }
        let randomString;
        do {
            randomString = generateRandomId();
        } while (this._activeGames[randomString] !== undefined);
        return randomString;
    }
    createGame() {
        const newGameService = new GameService();
        const uniqueId = this.uniqueGameId();
        this._activeGames[uniqueId] = newGameService;
        return uniqueId;
    }
    getGameServiceById(gameId) {
        return this._activeGames[gameId];
    }
    deleteGameById(gameId) {
        if (!this._activeGames[gameId])
            return;
        delete this._activeGames[gameId];
    }
}
const store = new GameStore();
export { store as gameStore };
//# sourceMappingURL=gameStore.js.map