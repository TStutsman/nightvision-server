import { Tile } from './tile';

export class Deck {
    tiles: Tile[];
    tileTypes: Tile[];
    bearTile: Tile;

    constructor() {
        // Map revealed and illuminated statuses onto each animal tile
        this.tileTypes = Deck.animals.map(animalType => new Tile(animalType));
        this.bearTile = new Tile('Bear');

        // Create a shuffled deck of all pairs and bear tile
        this.tiles = Deck.shuffle([...this.tileTypes, ...this.tileTypes, this.bearTile]);
    }

    static animals = ['Mouse', 'Chipmunk', 'Marmot', 'Owl', 'Fox', 'Weasel', 'Raccoon', 'Bat', 'Frog', 'Raven'];

    static shuffle(tiles: Tile[]): Tile[] {
        const shuffled_tiles:Tile[] = [...tiles];
        let currentIndex:number = tiles.length;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          let randomIndex:number = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          const swap_tile:Tile = shuffled_tiles[randomIndex];
          shuffled_tiles[randomIndex] = shuffled_tiles[currentIndex];
          shuffled_tiles[currentIndex] = swap_tile;
        }
      
        return shuffled_tiles;
    };

    reset() {
        // Create a new shuffled deck from fresh tiles and bear tile
        this.tiles = Deck.shuffle([...this.tileTypes, ...this.tileTypes, this.bearTile]);
    }
}