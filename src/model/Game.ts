import { Deck } from './Deck';
import { Tile } from './Tile';
import { Player } from './Player';

export class Game {
  turn: number;
  players: {[id:number]: Player};

  flashlightIsOn: boolean;
  bearSpotted: boolean;

  numTilesPaired: number;
  gameOver: boolean;
  endGameStatus: string;

  deck: Deck;
  flippedTiles: Tile[];

  static tiles: {[type: string]: number} = {
    'Pika': 2,
    'Chipmunk': 2, 
    'Marmot': 2,
    'Owl': 2,
    'Fox': 2,
    'Weasel': 2,
    'Raccoon': 2,
    'Bat': 2,
    'Frog': 2,
    'Raven': 2,
    'Bear': 1,
  };

  constructor() {
    this.turn = 0;
    this.players = {
      1: new Player(1), 
      2: new Player(2),
    };

    this.flashlightIsOn = false;
    this.bearSpotted = false;

    this.numTilesPaired = 0;
    this.gameOver = false;
    this.endGameStatus = "";

    this.deck = new Deck(Game.tiles);
    this.flippedTiles = [];
  }

  /**
   * Class method to return the Player whose turn it is
  */
  activePlayer():Player {
    return this.players[(this.turn % 2) + 1];
  }

  /**
   * 
   * @param id - playerId to compare to activePlayer
   * @returns true if the id is the same as the game's activePlayer id
   */
  activePlayerIs(id:number) {
    return this.activePlayer().id === id;
  }

  /**
   * Returns the player with the most points
   * 
   * In the case of a tie returns undefined
   */
  winningPlayer():Player | void {
    const { 1: player1, 2: player2 } = this.players;

    if(player1.points > player2.points) {
        return player1;

    } else if (player2.points > player1.points) {
        return player2;
    }
  }
}