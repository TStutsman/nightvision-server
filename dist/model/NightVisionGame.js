import { Deck } from './Deck.js';
import { Player } from './Player.js';
import { Reaction as GameUpdate, PlayerError } from './Reaction.js';
export class NightVisionGame {
    constructor() {
        this.turn = 0;
        this.players = {
            1: new Player(1),
            2: new Player(2),
        };
        this.flashlightIsOn = false;
        this.bearSpotted = false;
        this.numTilesPaired = 0;
        this.endGameStatus = "";
        this.deck = new Deck(NightVisionGame.tiles);
        this.flippedTiles = [];
    }
    activePlayer() {
        return this.players[(this.turn % 2) + 1];
    }
    activePlayerIs(id) {
        return this.activePlayer().id === id;
    }
    tileClick(playerId, tileIdx) {
        if (!this.activePlayerIs(playerId)) {
            return new PlayerError("It isn't your turn yet");
        }
        if (this.flashlightIsOn) {
            return this.useFlashlight(tileIdx);
        }
        if (this.deck.tiles[tileIdx].isRevealed()) {
            return new PlayerError("That tile is already flipped!");
        }
        const tile = this.deck.revealTile(tileIdx);
        this.flippedTiles.push(tile);
        const gameUpdates = [new GameUpdate('tileClick', 'Tile Flipped', tile.revealed())];
        if (tile.type == 'Bear') {
            const result = this.handleBearTile();
            gameUpdates.push(result);
        }
        if (this.flippedTiles.length > 1) {
            const [tile1, tile2] = this.flippedTiles;
            if (tile1.type === tile2.type) {
                const activePlayer = this.activePlayer();
                activePlayer.points++;
                this.numTilesPaired += 2;
                const data = {
                    playerId: activePlayer.id,
                    score: activePlayer.points
                };
                gameUpdates.push(new GameUpdate('match', 'Tile Match!', data));
                if (this.numTilesPaired > 19) {
                    const winner = this.winningPlayer();
                    this.endGameStatus = winner ? `Player ${winner.id} Wins!` : "It's a tie";
                    gameUpdates.push(this.endGame());
                    return gameUpdates;
                }
            }
            else {
                tile1.hide();
                tile2.hide();
                this.turn += 1;
                const data = {
                    tileId1: tile1.getId(),
                    tileId2: tile2.getId(),
                    nextPlayerId: this.activePlayer().id
                };
                gameUpdates.push(new GameUpdate('noMatch', "Tiles did not match", data));
            }
            this.flippedTiles = [];
        }
        return gameUpdates;
    }
    turnOnFlashlight(playerId) {
        if (!this.activePlayerIs(playerId)) {
            new PlayerError("It isn't your turn yet");
        }
        this.flashlightIsOn = true;
        return new GameUpdate('flashlight', 'Flashlight ON');
    }
    useFlashlight(id) {
        const zone = Math.floor(id / 7);
        const lower = zone * 7;
        const upper = lower + 7;
        this.bearSpotted = false;
        for (let i = lower; i < upper; i++) {
            if (this.deck.tiles[i].type == 'Bear') {
                this.bearSpotted = true;
            }
        }
        this.flashlightIsOn = false;
        this.turn += 1;
        const message = 'The bear was ' + (this.bearSpotted ? 'spotted' : 'not spotted');
        const data = {
            rowFirstIndex: lower,
        };
        return new GameUpdate('flashlightUsed', message, data);
    }
    buySpray(playerId) {
        if (!this.activePlayerIs(playerId)) {
            return new PlayerError("It isn't your turn yet");
        }
        const purchaser = this.activePlayer();
        purchaser.buySpray();
        this.turn += 1;
        const data = {
            playerId: purchaser.id,
            nextPlayerId: this.activePlayer().id,
        };
        return new GameUpdate('bearSpray', 'bear spray purchased', data);
    }
    reshuffle(playerId) {
        if (!this.activePlayerIs(playerId)) {
            return new PlayerError("It isn't your turn yet");
        }
        this.deck.shuffle();
        this.turn += 1;
        const data = {
            deck: this.deck.getTiles()
        };
        return new GameUpdate('reshuffled', 'Deck Reshuffle!', data);
    }
    handleBearTile() {
        const activePlayer = this.activePlayer();
        if (activePlayer.hasSpray) {
            activePlayer.hasSpray = false;
            return new GameUpdate('bearSprayUsed', 'Whew, saved by Bear Spray!', { playerId: activePlayer.id });
        }
        else {
            this.turn += 1;
            let winner = this.activePlayer();
            this.endGameStatus = `Player ${winner.id} Wins`;
            return this.endGame();
        }
    }
    endGame() {
        return new GameUpdate('endGame', this.endGameStatus);
    }
    resetGame() {
        this.deck.reset();
        this.flippedTiles = [];
        this.numTilesPaired = 0;
        Object.values(this.players).forEach((player) => {
            player.hasSpray = false;
            player.points = 0;
        });
        this.bearSpotted = false;
        this.turn = 0;
        this.endGameStatus = "";
        const data = {
            activePlayer: this.activePlayer().id,
            players: this.players,
            bearSpotted: this.bearSpotted,
            endGameStatus: '',
            deck: this.deck.getTiles(),
        };
        return new GameUpdate('gameReset', 'New Game Started', data);
    }
    winningPlayer() {
        const { 1: player1, 2: player2 } = this.players;
        if (player1.points > player2.points) {
            return player1;
        }
        else if (player2.points > player1.points) {
            return player2;
        }
    }
}
NightVisionGame.tiles = {
    'Pika': 2,
    'Chipmunk': 2,
    'Marmot': 2,
    'Owl': 2,
    'Fox': 2,
    'Weasel': 2,
    'Raccoon': 2,
    'Bat': 2,
    'Frog': 2,
    'Raven': 2,
    'Bear': 1,
};
NightVisionGame.images = [
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_pika.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_chipmunk.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_marmot.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_owl.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_fox.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_weasel.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_raccoon.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_bat.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_frog.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_raven.jpg',
    'https://nmls-pictures-bucket.s3.us-east-2.amazonaws.com/rainier_bear.jpg'
];
//# sourceMappingURL=NightVisionGame.js.map