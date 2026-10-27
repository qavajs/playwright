import express, { type Express } from 'express';
import { createServer } from 'http';

const app: Express = express();
const port = 3000;

app.use(express.static('./apps'));
app.use(express.json());

/* local api for http steps, so e2e tests do not depend on public services */
app.get('/api/todos/:id', (req, res) => {
    res.json({ userId: 1, id: Number(req.params.id), title: 'delectus aut autem', completed: false });
});

app.post('/api/posts', (req, res) => {
    res.status(201).json({ ...req.body, id: 101 });
});

app.post('/graphql', (req, res) => {
    const { query, variables } = req.body ?? {};
    if (typeof query !== 'string' || !query.includes('characters')) {
        res.status(400).json({ errors: [{ message: 'unknown query' }] });
        return;
    }
    res.json({ data: { characters: { results: [{ name: 'Rick Sanchez' }] } }, variables });
});

const httpServer = createServer(app);
httpServer.listen(port);
