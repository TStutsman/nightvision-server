# Night Vision API

An Express API for running the Night Vision Game

## Routes

### Connecting the Client Session
> ### Request
> * Method: `GET`
> * URL: `/api/session`
> * Cookie: [OPTIONAL] `session`
### Successful Response (200)
* Headers: `Content-Type: application/json`
* Body: 
    ```json
    {
        "gameId": "XSUKSO" 
    }
    ```
* Cookie: `session=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

This route sets the client's cookie to a unique id, to keep the client's session in case of lapses in server connectivity, browser refresh, etc.

It also recovers the session from the server upon reconnecting using the cookie stored in the client.

### Creating a New Game Instance
> ### Request
> * Method: `GET`
> * URL: `/api/games/new`
### Successful Response (200)
* Headers: `Content-Type: application/json`
* Body:
    ```json
    {
        "gameId": "XCOSZU",
        "game": {
            "activePlayer": "1",
            "players": [/** players */],
            "bearSpotted": "false",
            "endGameStatus": "",
            "deck": [/** tiles */]
        }
    }
    ```

This route creates a nwe game instance and adds the player to the created game. The response is the initial state of the game, which can be useful on the client side when starting up.

### Joining an Existing Game
> ### Request
> * Method: `GET`
> * URL: `/api/games/:gameId`
### Successful Response (200)
* Headers: `Content-Type: application/json`
* Body:
    ```json
    {
        "gameId": "XCOSZU",
        "game": {
            "activePlayer": "1",
            "players": [/** players */],
            "bearSpotted": "false",
            "endGameStatus": "",
            "deck": [/** tiles */]
        }
    }
    ```

This route adds the client to the game. Behind the scenes, the server:
1. assigns a playerId to the new client (after 2 players, all remaining players are spectators)\
***OR***
2. finds that the client-session is already associated with the game. In the second case, the player can continue to make actions as if they had not lost connection to the server.

### Leaving a Game
> ### Request
> * Method: `GET`
> * URL: `/api/games/leave`
### Successful Response (200)
* Headers: `Content-Type: application/json`
* Body:
    ```json
    {
        "gameId": ""
    }
    ```

This route removes the client from the game\
and\
If the game no longer has any remaining players, the server
will delete the game instance

It's recommended to leave the game upon leaving the page to free up server space before the game times out

### Connecting the Game Websocket
> ### Request
> * Method: `*websocket handshake*`
> * URL: `ws://<host_name>/api/games/:gameId`
### Successful Response (101)
* Sends a successful websocket upgrade response

This route establishes a websocket connection to the game instance. The client is added to a subscription list in order to recieve all relevant game events.


## Events

All events sent via Websocket should be JSON and follow the format:
```json
    {
        "name": "event_name",
        "data": {
            // event data (tileId, etc)
        }
    }
```

### Tile Click Event
> Name: `tileClick`\
> Data: 
> * `tileId`: integer representing the index of the clicked tile

This event is the main driver for the game. It handles all tile clicking interactions, including using the flashlight.

#### Successful Tile Flip:
```json
    {
        "id": "<tile_id>",
        "type": "<tile_type>",
        "revealed": "<tile_revealed_status>"
    }
```

#### Errors
> Client Errors: 
> * **No tileId**: the `tileClick` event requires a tileId, and will generate an error if `tileId` cannot be found in the event data

> Player Errors:
> * **Not your turn**: if the player attempts to click a tile while it is not their turn, the game will emit the error:\
`It isn't your turn yet`
> * **Tile flipped**: if the tile the player clicks has already been revealed, the game will emit the error:\
`That tile is already flipped!`

### Bear Spray Purchase Event
> Name: `bearSpray`\
> Data: _none_

This event immediately ends the player's turn, and adds bear spray to the player's inventory. In the event this player flips a bear tile in the future, the bear spray will be consumed, but the player will survive.

#### Successful purchase:
```json
    {
        "playerId": "<purchaser_id>",
        "nextPlayerId": "<player_whose_turn_it_becomes>"
    }
```
#### Errors
> Player Errors:
> * **Not your turn**: if the player attempts to click a tile while it is not their turn, the game will emit the error:\
`It isn't your turn yet`

### Reshuffle Event
> Name: `reshuffle`\
> Data: _none_

This event shuffles the entire deck. The paired tiles remain revealed, but their locations may shift.

#### Successful shuffle:
```json
    {
        "deck": [/** tiles */]
    }
```

#### Errors
> Player Errors:
> * **Not your turn**: if the player attempts to click a tile while it is not their turn, the game will emit the error:\
`It isn't your turn yet`

### Flashlight Event
> Name: `flashlight`\
> Data: _none_

This event ***prepares*** the flashlight. It is intended to be used when the player clicks the 'Flashlight' button. The next `tileClick` will be processed as a flashlight event.

The flashlight-modified `tileClick` event emits this reaction:
```json
    {
        "message": "The bear was (spotted / not spotted)",
        "data": {
            "rowFirstIndex": "<index_of_the_first_tile_in_the_row"
        }
    }
```

The `rowFirstIndex` data value is useful for communicating to the UI which elements are being 'searched'. (In my own client, the 7-tile row is briefly illuminated.)

#### Successful Flashlight ON
```json
    {
        "actionType":"flashlight",
        "message": "Flashlight ON"
    }
```
#### Errors
> Player Errors:
> * **Not your turn**: if the player attempts to click a tile while it is not their turn, the game will emit the error:\
`It isn't your turn yet`

### Play Again Event
> Name: `playAgain`\
> Data: _none_

This event erases the previous game, and prepares a new game using the same gameId and clients

#### Successful Play Again
```json
    {
        "actionType": "gameReset",
        "message": "New Game Started",
        "data": {
            "activePlayer": 1,
            "players": {/** 1-indexed Player Data */},
            "bearSpotted": false,
            "endGameStatus": "",
            "deck": [/** tile data */]
        }
    }