import express from "express";
import expressWs from "express-ws";
import { gamesRouter } from "./routes/games";

const { app } = expressWs(express());

const port = process.env.PORT || 8080;
const callback = () => console.log(`Express server is listening on port ${port}`);

app.use(express.json());

app.use('/api/games', gamesRouter);

app.listen(port, callback);