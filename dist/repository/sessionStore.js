class SessionStore {
    constructor() {
        this._gameHash = {};
    }
    includes(token) {
        return this._gameHash[token] !== undefined;
    }
    create(token) {
        this._gameHash[token] = '';
    }
    attachService(token, gameId) {
        this._gameHash[token] = gameId;
    }
    removeService(token) {
        this._gameHash[token] = '';
    }
    delete(token) {
        delete this._gameHash[token];
    }
    getServiceId(token) {
        return this._gameHash[token];
    }
    all() {
        return this._gameHash;
    }
}
const sessions = new SessionStore();
export { sessions as sessionStore };
//# sourceMappingURL=sessionStore.js.map