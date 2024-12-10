import { WebSocketExpress } from "websocket-express";
import { gamesRouter } from './routes/games.js';
import { sessionRouter } from './routes/sessions.js';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import type { Request, Response } from "express";

const app = new WebSocketExpress();
app.disable('x-powered-by');

const port = process.env.PORT || 8080;
const callback = () => console.log(`server listening on port ${port}`);

app.use(WebSocketExpress.json());
app.use(cookieParser());

app.use('/', WebSocketExpress.static('./public'));

app.use('/api/session', sessionRouter);
app.use('/api/games', gamesRouter);

app.use((req, res) => {
    res.status(404).json({error: "Couldn't find '" + req.url + "'"});
});

app.use((err:any, _:Request, res:Response) => {
    console.log(err.stack);
    res.status(500).json({error: "Something broke, please try again"});
});

app.listen(port, callback);