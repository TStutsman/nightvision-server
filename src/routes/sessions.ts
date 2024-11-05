import { Router } from "websocket-express";
import { sessions } from "src/repository/SessionStore";
import { v4 as uuidv4} from 'uuid';

const session = new Router();

session.get('/connect', (req, res) => {
    const { session: token } = req.cookies;

    if(!token) {
        const newToken = uuidv4();
        res.cookie('session', newToken);
    }

    if(!sessions.includes(token)) {
        sessions.create(token);
    }

    const gameId = sessions.getServiceId(token);

    res.status(200)
    .json({
        gameId
    });
});

export { session as sessionRouter };