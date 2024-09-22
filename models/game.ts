import { Deck } from './deck';
import { Tile } from './tile';
import { Player } from './player';

export class Game {
  turn: number;
  players: Player[];
  activePlayer: Player;

  flashlightIsOn: boolean;
  bearSpotted: boolean;

  numTilesPaired: number;
  gameOver: boolean;
  endGameStatus: string;

  deck: Deck;
  flippedTiles: Tile[];

  constructor() {
    this.turn = 0;
    this.players = [new Player(1), new Player(2)];
    this.activePlayer = this.players[0];

    this.flashlightIsOn = false;
    this.bearSpotted = false;

    this.numTilesPaired = 0;
    this.gameOver = false;
    this.endGameStatus = "";

    this.deck = new Deck();
    this.flippedTiles = [];
  }

  goToNextTurn():void {
    this.turn += 1;
    this.activePlayer = this.players[this.turn % 2];
  }

  resetGame():void {
    // Flip all the tiles over
    this.deck.reset();

    // Take away bear sprays and reset points
    this.players.forEach((player) => {
      player.hasSpray = false;
      player.points = 0;
    });

    // Remove bear spotted status
    this.bearSpotted = false;

    // Make it player 1's turn
    this.turn = 0;

    // And reset this.gameOver and this.endGameStatus
    this.endGameStatus = "";
    this.gameOver = false;
  }
}