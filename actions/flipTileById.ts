import { useFlashlight } from "./useFlashlight";
import { Game } from '../models/game';

export function flipTileById(id:number, game: Game):void {
    if(game.flashlightIsOn){
        game.bearSpotted = useFlashlight(id, game.deck.tiles);
        game.flashlightIsOn = false;
        game.goToNextTurn();
        return;
    }

    if(game.flippedTiles.length > 1) return; // Already two tiles flipped

    if(game.deck.tiles[id].revealed == true) return; // Can't select paired tiles or the same tile

    const tile = game.deck.tiles[id]
    tile.revealed = true;

    console.log(tile);

    // check if the tile was a bear
    if(tile.type == 'Bear'){
        if(game.activePlayer.hasSpray){
        game.activePlayer.hasSpray = false; // use spray if they have it
        } else {
        let winner = game.activePlayer.id;
        game.endGameStatus = `Player ${winner} Wins`;
        game.gameOver = true; // end the game if bear and no spray
        return;
        }
    }

    game.flippedTiles.push(tile);

    // Check tiles for match if two are flipped
    if(game.flippedTiles.length > 1){
        const [tile1, tile2] = game.flippedTiles;

        if(tile1.type == tile2.type){
        // tiles match, so they stay flipped
        game.activePlayer.points++;
        game.flippedTiles = [];
        game.numTilesPaired += 2;
        } else {
        // The tiles get flipped back upside down
        tile1.revealed = false;
        tile2.revealed = false;
        game.flippedTiles = [];
        }

        // Check for end of game
        if(game.numTilesPaired > 19){
        const [player1, player2] = game.players;

        if(player1.points > player2.points) {
            game.endGameStatus = `Player 1 Wins!`
        } else if (player2.points > player1.points) {
            game.endGameStatus = `Player 2 Wins!`
        } else {
            game.endGameStatus = "It's a tie";
        }

        game.gameOver = true;
        }

        // Update whose turn it is
        game.goToNextTurn();
    }
}