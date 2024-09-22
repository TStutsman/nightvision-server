import { Tile } from '../models/tile';

export const useFlashlight = (id: number, tiles:Tile[]):boolean => {
    const zone = Math.floor(id/7);
    const lower = zone * 7;
    const upper = lower + 7;

    for(let i = lower; i < upper; i++){ // check all the tiles in the row for a bear
        if(tiles[i].type == 'Bear'){
            // Found the bear
            return true;
        }
    }

    // Didn't find the bear
    return false;
}