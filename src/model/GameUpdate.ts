import type { Tile } from "./Tile";

export class GameUpdate {
    message:string;
    _data?:Tile;
    error?:boolean;

    constructor(message:string, error:boolean = false) {
        this.message = message;
        this.error = error;
        this._data = undefined;
    }

    setData(tile: Tile) {
        this._data = tile;
    }

    getData() {
        return this._data;
    }
}