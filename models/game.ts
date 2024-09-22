import { useFlashlight } from '../actions/useFlashlight';
import { Deck } from './deck';
import { Tile } from './tile';
import { Player } from './player';

class Game {
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

  flipTileById(id:number):void {
    if(this.flashlightIsOn){
      this.bearSpotted = useFlashlight(id, this.deck.tiles);
      // Turn off flashlight
      this.flashlightIsOn = false;
      // Update whose turn it is
      this.goToNextTurn();
      return;
    }
    
    if(this.flippedTiles.length > 1) return; // Already two tiles flipped

    if(this.deck[id].revealed == true) return; // Can't select paired tiles or the same tile

    const tile = this.deck[id]
    tile.revealed = true;
  
    // check if the tile was a bear
    if(tile.type == 'Bear'){
      if(this.activePlayer.hasSpray){
        this.activePlayer.hasSpray = false; // use spray if they have it
      } else {
        let winner = this.activePlayer.id;
        this.endGameStatus = `Player ${winner} Wins`;
        this.gameOver = true; // end the game if bear and no spray
        return;
      }
    }
  
    this.flippedTiles.push(tile);
  
    // Check tiles for match if two are flipped
    if(this.flippedTiles.length > 1){
      const [tile1, tile2] = this.flippedTiles;

      if(tile1.type == tile2.type){
        // tiles match, so they stay flipped
        this.activePlayer.points++;
        this.flippedTiles = [];
        this.numTilesPaired += 2;
      } else {
        // The tiles get flipped back upside down
        tile1.revealed = false;
        tile2.revealed = false;
        this.flippedTiles = [];
      }
  
      // Check for end of game
      if(this.numTilesPaired > 19){
        const [player1, player2] = this.players;

        if(player1.points > player2.points) {
          this.endGameStatus = `Player 1 Wins!`
        } else if (player2.points > player1.points) {
          this.endGameStatus = `Player 2 Wins!`
        } else {
          this.endGameStatus = "It's a tie";
        }

        this.gameOver = true;
      }
  
      // Update whose turn it is
      this.goToNextTurn();
    }
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