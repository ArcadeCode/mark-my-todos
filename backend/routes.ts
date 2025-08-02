import { Hono } from 'hono';
import { logRequest, logResponse } from './utils/logger.ts';
import { readTodos } from './services/todo.read.service.ts';
import { addTodo } from './services/todo.add.service.ts';
import { editTodo } from './services/todo.edit.service.ts';
import { FileNotFoundError, JsonParseError } from './utils/errors';

const app = new Hono();

// Middleware global pour logger chaque requête
app.use('*', async (c, next) => {
    const method = c.req.method;
    const path = c.req.path;
    const queryPath = c.req.query('path') ?? undefined;

    logRequest(method, path, { queryPath });
    await next();
});

// Gestion globale des erreurs
app.onError((err, c) => {
    logResponse(500, err.message);
    return c.text('Internal server error', 500);
});

// GET /api/todos/get?path=...
app.get('/api/todos/get', async (c) => {
    const filePath = c.req.query('path') ?? undefined;
    try {
        const todos = await readTodos(filePath);
        logResponse(200, todos);
        return c.json(todos, 200);
    } catch (err) {
        if (err instanceof FileNotFoundError) {
            logResponse(404, err.message);
            return c.text('File not found', 404);
        }
        if (err instanceof JsonParseError) {
            logResponse(422, err.message);
            return c.text('Invalid JSON format', 422);
        }
        throw err; // Send to hono with OnError
    }
});

// POST /api/todos/add?path=...
app.post('/api/todos/add', async (c) => {
    const data = await c.req.json();
    const filePath = data.queryPath ?? c.req.query('path') ?? undefined;
    if (!data.newTodo) {
        logResponse(400, 'Missing newTodo property');
        return c.text('Missing newTodo property', 400);
    }
    const newTodo = await addTodo(data.newTodo, filePath);
    logResponse(201, newTodo);
    return c.json(newTodo, 201);
});

// PUT /api/todos/edit/:id?path=...
app.put('/api/todos/edit/:id', async (c) => {
    const id = c.req.param('id');
    const filePath = c.req.query('path') ?? undefined;

    const data = await c.req.json();
    await editTodo(id, data, filePath);
    return c.json(readTodos(filePath), 201);
});

// DELETE /api/todos/remove/:id?path=...
app.delete('/api/todos/remove/:id', async (c) => {
    const id = c.req.param('id');
    const filePath = c.req.query('path') ?? undefined;
    // Implémente ta logique ici, par exemple :
    // await removeTodo(id, filePath);
    return c.text(`Remove todo ${id} - not implemented`, 501);
});

export default app;
