export class Player {
    id: number;
    hasSpray: boolean;
    points: number;

    constructor(id:number) {
        this.id = id;
        this.hasSpray = false;
        this.points = 0;
    }

    /** Set's the player's bear spray flag to true */
    buySpray():void {
        this.hasSpray = true;
    }
}