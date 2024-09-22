import express from "express";
import { gamesRouter } from "./routes/games";

const app = express();

const port = process.env.PORT || 8080;
const callback = () => console.log(`Express server is listening on port ${port}`);

app.use('/api/games', gamesRouter);

app.listen(port, callback);