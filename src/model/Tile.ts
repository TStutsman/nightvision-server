export class Tile {
    _id: number;
    type: string;
    url: string;
    _revealed: boolean;

    constructor(id: number, type: string) {
        this._id = id;
        this.type = type;
        this.url = 'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_' + type.toLowerCase() + '.jpg'
        this._revealed = false;
    }
    
    getId() {
        return this._id;
    }

    setId(id: number){
        this._id = id;
    }

    reveal() {
        this._revealed = true;
    }

    hide() {
        this._revealed = false;
    }

    isRevealed() {
        return this._revealed;
    }

    revealed() {
        return {
            id: this._id,
            type: this.type,
            url: this.url,
            revealed: this._revealed
        }
    }

    hidden() {
        return {
            id: this._id,
            revealed: this._revealed
        }
    }
}