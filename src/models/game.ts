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

  /** 
   * Updates the active player's score
   * if the two tiles in flippedTiles array
   * have matching types
   * 
   * Reflips tiles on non-matching and removes
   * from 'flipped' array
   */
  checkForMatch():void {
    const [tile1, tile2] = this.flippedTiles;

    if(tile1.type == tile2.type) {
    // tiles match, so they stay flipped
    this.activePlayer.points++;
    this.numTilesPaired += 2;

    } else {
    // The tiles get flipped back upside down
    tile1.revealed = false;
    tile2.revealed = false;
    }

    // reset flippedTiles array
    this.flippedTiles = []
  }

  /**
   * Update's active player's spray 
   * 
   * In the event the active player does
   * not have spray, handleBearTile will end
   * the game
   */
  handleBearTile():void {
    if(this.activePlayer.hasSpray){

      // use spray if they have it
      this.activePlayer.hasSpray = false;
      
    } else {

      // end the game if bear and no spray
      let winner = this.activePlayer.id;
      this.endGameStatus = `Player ${winner} Wins`;
      this.gameOver = true;

    }
  }

  /**
   * Increments the game's turn counter
   * and calculates the next active player
   */
  goToNextTurn():void {
    this.turn += 1;
    this.activePlayer = this.players[this.turn % 2];
  }

  /**
   * Sets the endgame status based on
   * the winning player
   * 
   * Ends the game.
   */
  allTilesFlipped() {
    const [{points: score1}, {points: score2}] = this.players;

    if(score1 > score2) {
        this.end(`Player 1 Wins!`);

    } else if (score2 > score1) {
        this.end(`Player 2 Wins!`);
    }
    
    this.end("It's a tie");
  }

  /**
   * required @param status: the status to end the game with
   *
   * Universal function to end the game
   */
  end(status: string):void {
    this.endGameStatus = status;
    this.gameOver = true;
  }

  /**
   * Sets the game state to a fresh deck
   * Player abilities and points are reset
   * The turn counter is set to start (0)
   */
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