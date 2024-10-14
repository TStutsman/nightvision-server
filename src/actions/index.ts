import { Game } from "src/models/game";
import { flipTileById } from "./flipTileById";
import { reshuffle } from "./reshuffle";
import { useFlashlight } from "./useFlashlight";

export interface ActionResponse {
    eventName: string;
    data: { 
        tileId : number,
        type?: string
    };
    error?: string
}

export function playerAction(game: Game, eventName: string, data: { tileId: number }) {
    const res: ActionResponse = { eventName, data }

    switch(eventName) {
        case 'flipTile':
            console.log('Event flipTile:')
            const tile = flipTileById(data.tileId, game);
            if (tile) res.data.type = tile.type;
            break;
        case 'reshuffle':
            reshuffle(game.deck);
            break;
        case 'useFlashlight':
            useFlashlight(data.tileId, game.deck.tiles)
            break;
        default:
            res.error = 'Not a valid recognized player-action'
    }

    return res
}