import { Deck } from '../models/deck';
import { Tile } from '../models/tile';

export function reshuffle(deck: Deck): Tile[] {
    return Deck.shuffle(deck.tiles);
}