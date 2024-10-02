import { Game } from "src/models/game";
import { flipTileById } from "./flipTileById";
import { reshuffle } from "./reshuffle";
import { useFlashlight } from "./useFlashlight";

export function playerAction(game: Game, event: string, data: { tileId: number }) {
    const res: { error: string | undefined } = { error: undefined }

    switch(event) {
        case 'flipTile':
            flipTileById(data.tileId, game);
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

    return [ event, res ]
}