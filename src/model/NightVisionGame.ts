import { Deck } from './Deck.js';
import { Tile } from './Tile.js';
import { Player } from './Player.js';
import { Reaction as GameUpdate, PlayerError } from './Reaction.js';

export class NightVisionGame {
    turn: number;
    players: {[id:number]: Player};

    flashlightIsOn: boolean;
    bearSpotted: boolean;

    numTilesPaired: number;
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

    static images: string[] = [
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_pika.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_chipmunk.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_marmot.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_owl.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_fox.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_weasel.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_raccoon.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_bat.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_frog.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_raven.jpg',
        'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_bear.jpg'
    ]

    constructor() {
    this.turn = 0;
    this.players = {
        1: new Player(1), 
        2: new Player(2),
    };

    this.flashlightIsOn = false;
    this.bearSpotted = false;

    this.numTilesPaired = 0;
    this.endGameStatus = "";

    this.deck = new Deck(NightVisionGame.tiles);
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
    * Tile click event broker.
    * Runs checks for most game logic and updates game
    * state based on tile flip events
    * 
    * @param tileIdx - the index of the tile being flipped
    * @returns an array of GameUpdates with:
    * a status message if an action is used or the game end,
    * an error flag if an error occured,
    * and the data for the flipped Tile(s)
    */
    tileClick(playerId:number, tileIdx:number):GameUpdate[] | PlayerError {
        if(!this.activePlayerIs(playerId)){
            return new PlayerError("It isn't your turn yet");
        }

        if(this.flashlightIsOn) {
            return this.useFlashlight(tileIdx);
        }

        if(this.deck.tiles[tileIdx].isRevealed()) {
            return new PlayerError("That tile is already flipped!");
        }

        const tile = this.deck.revealTile(tileIdx);
        this.flippedTiles.push(tile);

        const gameUpdates = [new GameUpdate('tileClick', 'Tile Flipped', tile.revealed())];

        if(tile.type == 'Bear') {
            const result = this.handleBearTile();
            gameUpdates.push(result);
        }

        // Check tiles for match if two are flipped
        if(this.flippedTiles.length > 1){
            const [tile1, tile2] = this.flippedTiles;

            if(tile1.type === tile2.type) {
                const activePlayer = this.activePlayer();
                activePlayer.points++;
                this.numTilesPaired += 2;

                const data = {
                    playerId: activePlayer.id,
                    score: activePlayer.points
                };

                gameUpdates.push(new GameUpdate('match', 'Tile Match!', data));

                // Check for end of game
                if(this.numTilesPaired > 19){
                    const winner = this.winningPlayer();
                    
                    this.endGameStatus = winner ? `Player ${winner.id} Wins!` : "It's a tie";

                    gameUpdates.push(this.endGame());
                    return gameUpdates;
                }
            } else {
                tile1.hide();
                tile2.hide();
                this.turn += 1;
                
                const data = {
                    tileId1: tile1.getId(),
                    tileId2: tile2.getId(),
                    nextPlayerId: this.activePlayer().id
                }

                gameUpdates.push(new GameUpdate('noMatch', "Tiles did not match", data));
            }

            this.flippedTiles = [];
        }

        return gameUpdates;
    }

    /**
     * Sets the flashlight to 'ON' meaning the next tile click will
     * use flashlight rather than flip the tile
     * 
     * @returns a GameUpdate indicating the flashlight was turned on
     */
    turnOnFlashlight(playerId: number):GameUpdate {
        if(!this.activePlayerIs(playerId)) {
            new PlayerError("It isn't your turn yet");
        }

        this.flashlightIsOn = true;
        return new GameUpdate('flashlight', 'Flashlight ON');
    }

    /**
     * Uses the flashlight to check the row of the clicked tile
     * determines if the bear tile is in the row and sets the bear spotted flag
     * 
     * @param id - the index of the clicked tile
     * @returns a GameUpdate indicating whether the bear was spotted
     */
    useFlashlight(id: number):GameUpdate {
        const zone = Math.floor(id/7);
        const lower = zone * 7;
        const upper = lower + 7;

        this.bearSpotted = false;
        for(let i = lower; i < upper; i++){ // check all the tiles in the row for a bear
            if(this.deck.tiles[i].type == 'Bear'){
                // Found the bear
                this.bearSpotted = true;
            }
        }
        
        // Turn off the flashlight, and end the turn
        this.flashlightIsOn = false;
        this.turn += 1;

        const message = 'The bear was ' + (this.bearSpotted ? 'spotted' : 'not spotted');
        const data = {
            rowFirstIndex: lower,
        }

        return new GameUpdate('flashlightUsed', message, data);
    }

    /**
     * Uses the player's turn to purchase bear spray
     */
    buySpray(playerId:number):GameUpdate {
        if(!this.activePlayerIs(playerId)){
            return new PlayerError("It isn't your turn yet");
        }

        const purchaser = this.activePlayer();
        purchaser.buySpray();

        this.turn += 1;
        const data = {
            playerId: purchaser.id,
            nextPlayerId: this.activePlayer().id,
        }

        return new GameUpdate('bearSpray', 'bear spray purchased', data);
    }

    /**
     * Uses the player's turn to shuffle the deck
     */
    reshuffle(playerId:number):GameUpdate {
        if(!this.activePlayerIs(playerId)) {
            return new PlayerError("It isn't your turn yet");
        }

        this.deck.shuffle();
        this.turn += 1;

        const data = {
            deck: this.deck.getTiles()
        }

        return new GameUpdate('reshuffled', 'Deck Reshuffle!', data);
    }

    /**
     * Update's active player's spray
     * 
     * In the event the active player does
     * not have spray, handleBearTile will end
     * the game
     * 
     * @returns a GameUpdate indicating whether the game has ended
     */
    handleBearTile():GameUpdate {
        const activePlayer = this.activePlayer();
        if(activePlayer.hasSpray){
            // use spray if they have it
            activePlayer.hasSpray = false;
            return new GameUpdate('bearSprayUsed', 'Whew, saved by Bear Spray!', { playerId: activePlayer.id });
            
        } else {
            // end the game if bear and no spray
            this.turn += 1;
            let winner = this.activePlayer();
            this.endGameStatus = `Player ${winner.id} Wins`;
            return this.endGame();
        }
    }

    /**
     * Universal function to end the game
     * 
     * @returns a GameUpdate with the status of the ended game
     */
    endGame():GameUpdate {
        return new GameUpdate('endGame', this.endGameStatus);
    }

    /**
     * Sets the game state to a fresh deck
     * Player abilities and points are reset
     * The turn counter is set to start (0)
     */
    resetGame():GameUpdate {
        // Flip all the tiles over
        this.deck.reset();
        this.flippedTiles = [];
        this.numTilesPaired = 0;

        // Take away bear sprays and reset points
        Object.values(this.players).forEach((player) => {
            player.hasSpray = false;
            player.points = 0;
        });

        // Remove bear spotted status
        this.bearSpotted = false;

        // Make it player 1's turn
        this.turn = 0;

        // And reset this.endGameStatus
        this.endGameStatus = "";

        const data = {
            activePlayer: this.activePlayer().id,
            players: this.players,
            bearSpotted: this.bearSpotted,
            endGameStatus: '',
            deck: this.deck.getTiles(),
        };

        return new GameUpdate('gameReset', 'New Game Started', data);
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