import { GameService } from "../service/GameService";

class GameStore{
    activeGames: { [id:number]: GameService };
    idCounter: number;

    constructor() {
        this.activeGames = {};
        this.idCounter = 0;
    }

    /** Creates a new game in the store and returns the id */
    createGame():number {
        const newGameService = new GameService();
        this.activeGames[this.idCounter] = newGameService;
        this.idCounter += 1;

        return this.idCounter - 1;
    }

    getGameServiceById(gameId: number) {
        return this.activeGames[gameId];
    }

    deleteGameById(gameId: number) {
        if(!this.activeGames[gameId]) return;

        delete this.activeGames[gameId];
    }
}

export const store = new GameStore();