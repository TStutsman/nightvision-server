class SessionStore {
    _gameHash: {[uuid:string]: number};

    constructor(){
        this._gameHash = {}
    }

    /**
     * 
     * @param token - the session token to check
     * @returns true if the session token exists in the store, false otherwise
     */
    includes(token:string):boolean {
        return this._gameHash[token] !== undefined;
    }

    /**
     * Adds a session token to the session store, and initializes the value
     * to -1 (meaning not currently in a game)
     * 
     * @param token - the session token to add to the store
     */
    create(token: string):void {
        this._gameHash[token] = -1;
    }

    /**
     * Swaps the gameId value of the session to point to a new gameService
     * 
     * @param token - the session token for a user
     * @param gameId - the id of the GameService in the game store
     */
    attachService(token:string, gameId:number):void {
        this._gameHash[token] = gameId;
    }

    /**
     * Resets the gameService id value to -1, meaning the user is
     * no longer in an active game
     * 
     * @param token - the session token for a user
     */
    removeService(token:string):void {
        this._gameHash[token] = -1;
    }

    /**
     * Delete's a user's session token from the store
     * Useful for keeping memory usage low by removing expired users
     * 
     * @param token - the session token for a user
     */
    delete(token:string):void {
        delete this._gameHash[token];
    }

    /**
     * Retrieves the active game id associated with this user-session
     * 
     * @param token - the session token for a user
     * @returns the id of the GameService for the game the
     * user is currently playing
     */
    getServiceId(token: string):number {
        return this._gameHash[token];
    }

    /**
     * Convenient method retrieving the entire store for debugging purposes
     * Typically used to print to console
     * 
     * @returns the session store object
     */
    all() {
        return this._gameHash;
    }
}

export const sessions = new SessionStore();