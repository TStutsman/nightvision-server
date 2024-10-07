import express from "express";
import expressWs from "express-ws";

const { app } = expressWs(express());

const port = process.env.PORT || 8080;
const callback = () => console.log(`Express server is listening on port ${port}`);

app.use(express.json());

async function mountRouter(app: expressWs.Application) {
    app.use('/api/games', (await import('./routes/games')).gamesRouter);
}
mountRouter(app);

app.listen(port, callback);