import { Game } from "./models/game";

class GameStore{
    activeGames: { [id:number]: Game };
    idCounter: number;

    constructor() {
        this.activeGames = {};
        this.idCounter = 0;
    }

    /** Creates a new game in the store and returns the id */
    createGame():number {
        const newGame = new Game();
        this.activeGames[this.idCounter] = newGame;
        this.idCounter += 1;

        return this.idCounter - 1;
    }

    getGameById(gameId: number) {
        return this.activeGames[gameId];
    }

    deleteGameById(gameId: number) {
        if(!this.activeGames[gameId]) return;

        delete this.activeGames[gameId];
    }
}

export const store = new GameStore();