import { useFlashlight } from "./useFlashlight";
import { Game } from '../models/game';
import { Tile } from "src/models/tile";

/**
 * Universal function for Tile click actions.
 * Runs checks for most game logic and updates game
 * state based on tile flip events
 * 
 * @param game - the game the tile belongs to
 * @param id - the id of the tile being flipped
 * @returns undefined if an action is used or the game ends
 * else: the data for the flipped Tile
 */
export function flipTileById(game: Game, id:number):Tile | void{
    if(game.flashlightIsOn){
        game.bearSpotted = useFlashlight(game, id);
        game.flashlightIsOn = false;
        game.goToNextTurn();
        return;
    }

    // Already two tiles flipped
    if(game.flippedTiles.length > 1) return;

    // Can't select paired tiles or the same tile
    if(game.deck.tiles[id].isRevealed()) return;

    const tile = game.deck.tiles[id]
    tile.reveal();

    // check if the tile was a bear
    if(tile.type == 'Bear') {
        game.handleBearTile();
        if (game.gameOver) return tile;

        // Update whose turn it is
        game.goToNextTurn();
        return tile;
    }

    game.flippedTiles.push(tile);

    // Check tiles for match if two are flipped
    if(game.flippedTiles.length > 1){
        const [tile1, tile2] = game.flippedTiles;

        if(tile1.type === tile2.type) {
            game.countMatch();
        }

        // Check for end of game
        if(game.numTilesPaired > 19){
            game.allTilesFlipped();
        }

        // Update whose turn it is
        game.goToNextTurn();
    }

    return tile;
}