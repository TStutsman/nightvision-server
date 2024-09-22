import express from "express";

const app = express();

const port = process.env.PORT || 8080;
const callback = () => console.log(`Express server is listening on port ${port}`);

app.listen(port, callback);