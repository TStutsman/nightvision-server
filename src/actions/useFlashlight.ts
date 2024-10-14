import { Game } from '../models/game';

/**
 * Checks the row of the clicked tile to determine if the
 * bear tile is in the row
 * 
 * @param game - the game the tile belongs to
 * @param id - the id of the clicked tile
 * @returns 'true' if the bear was found, otherwise 'false'
 */
export const useFlashlight = (game: Game, id: number):boolean => {
    const zone = Math.floor(id/7);
    const lower = zone * 7;
    const upper = lower + 7;

    for(let i = lower; i < upper; i++){ // check all the tiles in the row for a bear
        if(game.deck.tiles[i].type == 'Bear'){
            // Found the bear
            return true;
        }
    }

    // Didn't find the bear
    return false;
}