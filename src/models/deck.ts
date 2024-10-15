import { Tile } from './tile';

export class Deck {
    values: {[type: string]: number}
    tiles: Tile[];
    bearTile: Tile;

    constructor(amounts: {[type: string]: number}) {
        this.values = amounts;

        // Creates 'amount' of each value and adds them to deck's tiles
        Object.entries(this.values).map(([value, amount]) => {
            for(let i = 0; i < amount; i++){
                const newTile = new Tile(this.tiles.length, value);
                this.tiles.push(newTile);
            }
        });

        // Shuffle the deck
        this.shuffle();
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
          const swapTile:Tile = this.tiles[randomIndex];
          const swapId:number = swapTile.getId();
          this.tiles[randomIndex] = this.tiles[currentIndex];
          this.tiles[randomIndex].setId(this.tiles[currentIndex].getId());
          this.tiles[currentIndex] = swapTile;
          this.tiles[currentIndex].setId(swapId);
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
        // Hide all the tiles in the deck, and shuffle them
        this.tiles.forEach(tile => tile.hide());
        this.shuffle();
    }
}