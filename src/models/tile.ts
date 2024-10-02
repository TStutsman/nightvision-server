export class Tile {
    type: string;
    revealed: boolean;

    constructor(type: string) {
        this.type = type;
        this.revealed = false;
    }

    flip() {
        this.revealed = !this.revealed;
    }
}