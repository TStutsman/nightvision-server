import { Tile } from './Tile.js';
export class Deck {
    constructor(amounts) {
        this.values = amounts;
        this.tiles = [];
        Object.entries(this.values).map(([value, amount]) => {
            for (let i = 0; i < amount; i++) {
                const newTile = new Tile(this.tiles.length, value);
                this.tiles.push(newTile);
            }
        });
        this.shuffle();
    }
    revealTile(idx) {
        const tile = this.tiles[idx];
        tile.reveal();
        return tile;
    }
    getTiles() {
        return this.tiles.map(tile => tile.isRevealed() ? tile.revealed() : tile.hidden());
    }
    shuffle() {
        let currentIndex = this.tiles.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            const randomTile = this.tiles[randomIndex];
            this.tiles[randomIndex] = this.tiles[currentIndex];
            this.tiles[randomIndex].setId(randomIndex);
            this.tiles[currentIndex] = randomTile;
            this.tiles[currentIndex].setId(currentIndex);
        }
    }
    ;
    static shuffle(tiles) {
        const shuffled_tiles = [...tiles];
        let currentIndex = tiles.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            const swap_tile = shuffled_tiles[randomIndex];
            shuffled_tiles[randomIndex] = shuffled_tiles[currentIndex];
            shuffled_tiles[currentIndex] = swap_tile;
        }
        return shuffled_tiles;
    }
    ;
    reset() {
        this.tiles.forEach(tile => tile.hide());
        this.shuffle();
    }
}
//# sourceMappingURL=Deck.js.map