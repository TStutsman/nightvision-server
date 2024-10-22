import { Game } from "src/model/Game";
import { Tile } from "src/model/Tile";

export class GameService extends Game {
    constructor() {
        super();
    }

    /**
     * Tile click action handler.
     * Runs checks for most game logic and updates game
     * state based on tile flip events
     * 
     * @param id - the id of the tile being flipped
     * @returns a status message if an action is used or the game ends
     * else: the data for the flipped Tile
     */
    tileClick(id:number):Tile | StatusMessage {
        if(this.flashlightIsOn){
            this.bearSpotted = this.useFlashlight(id);
            this.flashlightIsOn = false;
            this.goToNextTurn();
            return {error: 'flashlight used'};
        }

        // Already two tiles flipped
        if(this.flippedTiles.length > 1) return {error: "two tiles already flipped"};

        // Can't select paired tiles or the same tile
        if(this.deck.tiles[id].isRevealed()) return {error: "can't flip a tile that's already been flipped"};

        const tile = this.deck.tiles[id]
        tile.reveal();

        // check if the tile was a bear
        if(tile.type == 'Bear') {
            this.handleBearTile();
            if (this.gameOver) return tile;

            // Update whose turn it is
            this.goToNextTurn();
            return tile;
        }

        this.flippedTiles.push(tile);

        // Check tiles for match if two are flipped
        if(this.flippedTiles.length > 1){
            const [tile1, tile2] = this.flippedTiles;

            if(tile1.type === tile2.type) {
                this.countMatch();
            }

            // Check for end of game
            if(this.numTilesPaired > 19){
                this.allTilesFlipped();
                return {error: 'this ended'};
            }

            // Update whose turn it is
            this.goToNextTurn();
        }

        return tile;
    }

    /**
     * Checks the row of the clicked tile to determine if the
     * bear tile is in the row
     * 
     * @param id - the id of the clicked tile
     * @returns 'true' if the bear was found, otherwise 'false'
     */
    useFlashlight(id: number):boolean {
        const zone = Math.floor(id/7);
        const lower = zone * 7;
        const upper = lower + 7;

        for(let i = lower; i < upper; i++){ // check all the tiles in the row for a bear
            if(this.deck.tiles[i].type == 'Bear'){
                // Found the bear
                return true;
            }
        }

        // Didn't find the bear
        return false;
    }

    /**
     * Uses the player's turn to purchase bear spray
     */
    buySpray():void {
        this.activePlayer.buySpray();
        this.goToNextTurn();
    }

    /**
     * Uses the player's turn to shuffle the deck
     */
    reshuffle():void {
        this.deck.shuffle();
        this.goToNextTurn();
    }

    /** 
     * Updates the active player's score
     * if the two tiles in flippedTiles array
     * have matching types
     * 
     * Empties the flippedTile array
     */
    countMatch():void {
    this.activePlayer.points++;
    this.numTilesPaired += 2;
    this.flippedTiles = []
    }

    /**
     * Hides the current flipped tiles
     * and empties the flippedTiles array
     * 
     * @returns an array containing the two hidden tiles
     */
    hideFlippedTiles():Tile[] {
    const [tile1, tile2] = this.flippedTiles;
    tile1.hide();
    tile2.hide();
    this.flippedTiles = [];
    return [tile1, tile2];
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