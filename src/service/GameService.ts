import { Game } from "src/model/Game";
import { GameUpdate, PlayerError } from "src/model/GameUpdate";

export class GameService extends Game {
    constructor() {
        super();
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
    tileClick(tileIdx:number):GameUpdate[] {
        if(this.flashlightIsOn) {
            return [this.useFlashlight(tileIdx)];
        }

        if(this.deck.tiles[tileIdx].isRevealed()) {
            return [new PlayerError("can't flip a tile that's already been flipped")];
        }
        
        if(this.flippedTiles.length > 1) {
            return [new PlayerError("can't flip more than two tiles")];
        }

        const tile = this.deck.revealTile(tileIdx);
        this.flippedTiles.push(tile);

        const gameUpdates = [new GameUpdate('tileClick', 'tile flipped', tile.revealed())];

        if(tile.type == 'Bear') {
            gameUpdates.push(this.handleBearTile());
            return gameUpdates;
        }

        // Check tiles for match if two are flipped
        if(this.flippedTiles.length > 1){
            const [tile1, tile2] = this.flippedTiles;

            if(tile1.type === tile2.type) {
                this.activePlayer.points++;
                this.numTilesPaired += 2;

                const data = {
                    playerId: this.activePlayer.id,
                    score: this.activePlayer.points
                };

                gameUpdates.push(new GameUpdate('match', 'tiles matched', data));

                // Check for end of game
                if(this.numTilesPaired > 19){
                    gameUpdates.push(this.end());
                    return gameUpdates;
                }
            } else {
                tile1.hide();
                tile2.hide();
                this.goToNextTurn();
                
                const data = {
                    tileId1: tile1.getId(),
                    tileId2: tile2.getId(),
                    nextPlayerId: this.activePlayer.id
                }

                gameUpdates.push(new GameUpdate('noMatch', "tiles did not match", data));
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
    turnOnFlashlight():GameUpdate {
        this.flashlightIsOn = true;
        return new GameUpdate('flashlight', 'flashlight turned on');
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

        for(let i = lower; i < upper; i++){ // check all the tiles in the row for a bear
            if(this.deck.tiles[i].type == 'Bear'){
                // Found the bear
                this.bearSpotted = true;
            }
        }
        
        // Turn off the flashlight, and end the turn
        this.flashlightIsOn = false;
        this.goToNextTurn();

        return new GameUpdate('tileClick', 'Bear ' + this.bearSpotted ? 'spotted' : 'not spotted');
    }

    /**
     * Uses the player's turn to purchase bear spray
     */
    buySpray():GameUpdate[] {
        this.activePlayer.buySpray();
        const purchaser = this.activePlayer;

        this.goToNextTurn();
        const data = {
            playerId: purchaser.id,
            nextPlayerId: this.activePlayer.id,
        }
        
        return [new GameUpdate('bearSpray', 'bear spray purchased', data)];
    }

    /**
     * Uses the player's turn to shuffle the deck
     */
    reshuffle():GameUpdate {
        this.deck.shuffle();
        this.goToNextTurn();
        return new GameUpdate('reshuffle', 'deck reshuffled')
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
        if(this.activePlayer.hasSpray){
            // use spray if they have it
            this.activePlayer.hasSpray = false;
            return new GameUpdate('tileClick', 'Player was saved by bear spray');
            
        } else {
            // end the game if bear and no spray
            let winner = this.activePlayer.id;
            this.endGameStatus = `Player ${winner} Wins`;
            return this.end();
        }
    }

    /**
     * Increments the game's turn counter
     * and calculates the next active player
     */
    goToNextTurn():void {
        this.turn += 1;
        this.activePlayer = this.players[(this.turn % 2) + 1];
    }

    /**
     * Sets the endgame status based on
     * the winning player
     * 
     * Ends the game.
     */
    determineEndStatus():void {
        const [{points: score1}, {points: score2}] = Object.values(this.players);

        if(score1 > score2) {
            this.endGameStatus =`Player 1 Wins!`;

        } else if (score2 > score1) {
            this.endGameStatus = `Player 2 Wins!`;
        }

        this.endGameStatus = "It's a tie";
    }

    /**
     * Universal function to end the game
     * 
     * @returns a GameUpdate with the status of the ended game
     */
    end():GameUpdate {
        this.gameOver = true;
        return new GameUpdate('endGame', this.endGameStatus);
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
        Object.values(this.players).forEach((player) => {
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