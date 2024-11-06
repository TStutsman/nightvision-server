import { GameService } from "../service/GameService";

class GameStore{
    _activeGames: { [gameId: string]: GameService };

    constructor() {
        this._activeGames = {};
    }

    uniqueGameId() {
        function generateRandomId() {
            return [1,1,1,1,1,1].map(_ => {
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

    /** 
     * Creates a new game in the store and returns the id 
    */
    createGame():string {
        const newGameService = new GameService();
        
        const uniqueId = this.uniqueGameId();
        this._activeGames[uniqueId] = newGameService;

        return uniqueId;
    }

    /**
     * Finds the game service with the id and returns
     * 
     * @param gameId - id of the game service
     * @returns the game with the associated id, or undefined
     */
    getGameServiceById(gameId: string):GameService {
        return this._activeGames[gameId];
    }

    /**
     * Deletes the game from the game store
     * 
     * @param gameId - id of the game to remove from the store
     */
    deleteGameById(gameId: string):void {
        if(!this._activeGames[gameId]) return;

        delete this._activeGames[gameId];
    }
}

const store = new GameStore();

export { store as gameStore };