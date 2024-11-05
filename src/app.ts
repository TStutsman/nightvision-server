import { WebSocketExpress } from "websocket-express";
import { gamesRouter } from './routes/games';
import { sessionRouter } from './routes/sessions';
import cookieParser from 'cookie-parser';

const app = new WebSocketExpress();

const port = process.env.PORT || 8080;
const callback = () => console.log(`Express server is listening on port ${port}`);

app.use(WebSocketExpress.json());
app.useHTTP(cookieParser());
app.use('/api/session', sessionRouter);
app.use('/api/games', gamesRouter);

app.listen(port, callback);