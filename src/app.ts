import { WebSocketExpress } from "websocket-express";
import { gamesRouter } from './routes/games';

const app = new WebSocketExpress();

const port = process.env.PORT || 8080;
const callback = () => console.log(`Express server is listening on port ${port}`);

app.use(WebSocketExpress.json());
app.use('/api/games', gamesRouter);

app.listen(port, callback);