import { Router } from "websocket-express";
import { sessionStore } from "src/repository/sessionStore";
import { v4 as uuidv4} from 'uuid';

const session = new Router();

session.get('/connect', (req, res) => {
    const { session: token } = req.cookies;

    if(!token) {
        const newToken = uuidv4();
        res.cookie('session', newToken);
    }

    if(!sessionStore.includes(token)) {
        sessionStore.create(token);
    }

    const gameId = sessionStore.getServiceId(token);

    res.status(200)
    .json({
        gameId
    });
});

export { session as sessionRouter };