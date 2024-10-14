export class Tile {
    type: string;
    revealed: boolean;

    constructor(type: string) {
        this.type = type;
        this.revealed = false;
    }
}