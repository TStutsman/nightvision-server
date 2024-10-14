import { useFlashlight } from "./useFlashlight";
import { Game } from '../models/game';
import { Tile } from "src/models/tile";

export function flipTileById(id:number, game: Game):Tile | void{
    if(game.flashlightIsOn){
        game.bearSpotted = useFlashlight(id, game.deck.tiles);
        game.flashlightIsOn = false;
        game.goToNextTurn();
        return;
    }

    // Already two tiles flipped
    if(game.flippedTiles.length > 1) return;

    // Can't select paired tiles or the same tile
    if(game.deck.tiles[id].revealed == true) return; 

    const tile = game.deck.tiles[id]
    tile.revealed = true;

    // check if the tile was a bear
    if(tile.type == 'Bear') {
        game.handleBearTile();
        if (game.gameOver) return;
    }

    game.flippedTiles.push(tile);

    // Check tiles for match if two are flipped
    if(game.flippedTiles.length > 1){
        game.checkForMatch();

        // Check for end of game
        if(game.numTilesPaired > 19){
            game.allTilesFlipped();
        }
    }

    // Update whose turn it is
    game.goToNextTurn();

    return tile;
}