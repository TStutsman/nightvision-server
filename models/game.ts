import { useFlashlight } from '../actions/useFlashlight';
import { Deck } from './deck';
import { Tile } from './tile';

class Game {
  whoseTurn: number;
  usersPoints: number[];
  userHasSpray: boolean[];

  flashlightIsOn: boolean;
  bearSpotted: boolean;

  numTilesPaired: number;
  gameOver: boolean;
  endGameStatus: string;

  deck: Deck;
  flippedTiles: {type: string, id:number}[];

  constructor() {
    this.whoseTurn = 0;
    this.usersPoints = [0,0];
    this.userHasSpray = [false, false];

    this.flashlightIsOn = false;
    this.bearSpotted = false;

    this.numTilesPaired = 0;
    this.gameOver = false;
    this.endGameStatus = "";

    this.deck = new Deck();
    this.flippedTiles = [];
  }

  flipTile(id:number):void {
    if(this.flashlightIsOn){
      this.bearSpotted = useFlashlight(id, this.deck.tiles);
      // Turn off flashlight
      this.flashlightIsOn = false;
      // Update whose turn it is
      this.whoseTurn = this.whoseTurn == 0 ? 1 : 0;
      return;
    }
    
    if(this.flippedTiles.length > 1) return; // Already two this.deck flipped
    if(this.deck[id].revealed == true) return; // Can't select paired this.deck or the same tile
    this.deck[id].revealed = true;
    const {type} = this.deck[id];
  
    // check if the tile was a bear
    if(type == 'Bear'){
      if(this.userHasSpray[this.whoseTurn]){
        this.userHasSpray[this.whoseTurn] = false; // use spray if they have it
      } else {
        let winner = this.whoseTurn == 0 ? 2 : 1;
        this.endGameStatus = `Player ${winner} Wins`;
        this.gameOver = true; // end the game if bear and no spray
      }
    }
  
    this.flippedTiles.push({type, id});
  
    if(this.flippedTiles.length > 1){ // Check to see if two this.deck are flipped
      if(this.flippedTiles[0].type == this.flippedTiles[1].type){
        // The this.deck stay flipped, the user gets a point
        this.usersPoints[this.whoseTurn]++;
        // Empty flipped this.deck array
        this.flippedTiles.pop();
        this.flippedTiles.pop();
        // Update number of paired this.deck
        this.numTilesPaired += 2;
      } else {
        // The this.deck get flipped back upside down
        setTimeout(() => {
          this.deck[this.flippedTiles[0].id].revealed = false;
          this.deck[this.flippedTiles[1].id].revealed = false;
          this.flippedTiles.pop();
          this.flippedTiles.pop();
        }, 1750);
      }
  
      // Check for end of game
      if(this.numTilesPaired > 19){
        let winner = this.usersPoints[0] > this.usersPoints[1]
        ? 1
        : this.usersPoints[0] !== this.usersPoints[1]
        ? 2
        : 0
  
        if(winner == 0){
          this.endGameStatus = "It's a tie";
        } else {
          this.endGameStatus = `Player ${winner} Wins!`
        }
        this.gameOver = true;
      }
  
      // Update whose turn it is
      this.whoseTurn = this.whoseTurn == 0 ? 1 : 0;
    }
  }

  resetGame():void {
    // Flip all the this.deck over
    this.deck.reset();
    // Take away bear sprays and spotted warning
    this.userHasSpray.forEach((e) => e = false);
    this.bearSpotted = false
    // Make it player 1's turn and reset points
    this.whoseTurn = 0;
    this.usersPoints.forEach((e) => e = 0);
    // And reset this.gameOver and this.endGameStatus
    this.endGameStatus = "";
    this.gameOver = false;
  }
}