// @ts-ignore
import express, { Express } from 'express';
import { createServer } from 'http';

const app: Express = express();
const port = 3000;

app.use(express.static('./apps'))
const httpServer = createServer(app);
httpServer.listen(port);


