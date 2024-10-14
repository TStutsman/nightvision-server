import { Tile } from './tile';

export class Deck {
    tiles: Tile[];
    bearTile: Tile;
    
    static animals = ['Pika', 'Chipmunk', 'Marmot', 'Owl', 'Fox', 'Weasel', 'Raccoon', 'Bat', 'Frog', 'Raven'];
    // Map revealed and illuminated statuses onto each animal tile
    static animalTiles = () => Deck.animals.map(animal => new Tile(animal));

    constructor() {
        this.bearTile = new Tile('Bear');

        // Create a shuffled deck of all pairs and bear tile
        this.tiles = Deck.shuffle([...Deck.animalTiles(), ...Deck.animalTiles(), this.bearTile]);
    }

    /**
     * Shuffles tiles in this deck by iterating
     * backwards over the Tiles and selecting a random index
     * to swap with
     * 
     * This method mutates the current tiles array for 'this' deck
     */
    shuffle(): void {
        let currentIndex:number = this.tiles.length;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          let randomIndex:number = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          const swap_tile:Tile = this.tiles[randomIndex];
          this.tiles[randomIndex] = this.tiles[currentIndex];
          this.tiles[currentIndex] = swap_tile;
        }
    };

    /**
     * Static class method for shuffling any Tile array
     * 
     * Useful for creating a new deck of shuffled Tiles
     * 
     * @param tiles - array of Tiles to shuffle
     * @returns a new array of shuffled Tiles
     */
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
        this.tiles = Deck.shuffle([...Deck.animalTiles(), ...Deck.animalTiles(), this.bearTile]);
    }
}