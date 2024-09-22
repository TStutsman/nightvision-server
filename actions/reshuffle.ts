import { Deck } from '../models/deck';
import { Tile } from '../models/tile';

export function reshuffle(tiles:Tile[]): Tile[] {
    return Deck.shuffle(tiles);
}