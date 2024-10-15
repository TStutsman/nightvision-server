import { Deck } from './deck';
import { Tile } from './tile';
import { Player } from './player';
import { flipTileById } from 'src/actions/flipTileById';
import { useFlashlight } from 'src/actions/useFlashlight';

export interface ActionResponse {
  actionType: string;
  data?: { 
      tileId : number,
      type?: string
  };
  error?: string
}

interface ActionHandler {
  (data? : { tileId: number }): any
}

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
    this.players = [new Player(1), new Player(2)];
    this.activePlayer = this.players[0];

    this.flashlightIsOn = false;
    this.bearSpotted = false;

    this.numTilesPaired = 0;
    this.gameOver = false;
    this.endGameStatus = "";

    this.deck = new Deck(Game.tiles);
    this.flippedTiles = [];
  }

  /**
   * Static class object with all game-actions
   * 
   * These actions must be exactly the same as the websocket
   * events in order to route to the correct class method implementation
   */
  static actions: { [action: string]: (game: Game) => ActionHandler } = {
    'flipTile': (game: Game) => {
      return (data?: { tileId: number }):Tile | void => {
        if(!data) throw Error('Must provide tile id for flipTile');
        return flipTileById(game, data.tileId);
      }
    },
    'reshuffle': (game: Game) => {
      return () => game.deck.shuffle();
    },
    'flashlight': (game: Game) => {
      return (data?: { tileId: number }) => {
        if(!data) throw Error('Must provide tile id for flashlight')
        return useFlashlight(game, data.tileId);
      }
    }
  }

  /**
   * This class method links an action 'type' to its implementation
   * and returns a response to send to a client
   * 
   * TODO: uncouple the error handling and response from Game model
   * 
   * @param actionType - the game action type (probably the same as the websocket event)
   * @param data - any data to pass into the action handler
   * @returns a response object to be sent to the client
   */
  action(actionType: string, data?: { tileId: number, type?: string }) {
    const res:ActionResponse = { actionType, data };
    const bindActionToGame:(game:Game) => ActionHandler = Game.actions[actionType];

    if(!bindActionToGame) {
      res.error = `Action named '${actionType}' is not a recognized player action`;
    } else {
      const actionHandler:ActionHandler = bindActionToGame(this);
      try {
        const tile = actionHandler(data);
        if(tile) res.data!.type = tile.type
      } catch (err: unknown) {
        if(err instanceof Error) console.log(err.message);
      }
    }

    return res;
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
      tile1.hide();
      tile2.hide();

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
      this.end(`Player ${winner} Wins`);

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
  allTilesFlipped():void {
    const [{points: score1}, {points: score2}] = this.players;

    if(score1 > score2) {
        this.end(`Player 1 Wins!`);

    } else if (score2 > score1) {
        this.end(`Player 2 Wins!`);
    }
    
    this.end("It's a tie");
  }

  /**
   * Universal function to end the game
   * 
   * @param {string} status - the status to end the game with
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