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
}