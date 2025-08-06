import { Hono } from 'hono';
import { logRequest, logResponse, logger } from '../shared/utils/logger.ts';
import { readTodos } from './services/todo.read.service.ts';
import { addTodo } from './services/todo.add.service.ts';
import { editTodo } from './services/todo.edit.service.ts';
import { removeTodo } from './services/todo.remove.service.ts';
import { FileNotFoundError, IdentifiantNotFoundError, JsonParseError } from './utils/errors';
/*
We need to ensure that body work like this :
{
    newTodoData: requested by client or sended by backend, contain a Todo[] into a JSON format
    path: precise the db file used during the request
}
*/

const app = new Hono();

// Middleware global pour logger chaque requête
app.use('*', async (c, next) => {
    logRequest(c.req);
    await next();
});

// Gestion globale des erreurs
app.onError((err, c) => {
    if (err instanceof Error && typeof err.stack === 'string') {
        console.log('Stack trace :', err.stack);
    }

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
    const request = await c.req.json();
    const filePath = request.path ?? c.req.query('path') ?? undefined;
    if (!request.newTodoData) {
        logResponse(400, 'Missing newTodo property');
        return c.text('Missing newTodo property', 400);
    }
    const newTodo = await addTodo(request.newTodoData, filePath);
    logResponse(201, newTodo);
    return c.json(newTodo, 201);
});

// PUT /api/todos/edit/:id?path=...
//app.put('/api/todos/edit/:id', async (c) => {
//    const id = c.req.param('id');
//    const filePath = c.req.query('path') ?? undefined;
//
//    const request = await c.req.json();
//    await editTodo(id, request.newTodoData, filePath);
//    return c.json(readTodos(filePath), 201);
//});

// DELETE /api/todos/remove/:id
app.delete('/api/todos/remove/:id', async (c) => {
    const id = c.req.param('id');
    const request = await c.req.json();
    const filePath = request.path ?? c.req.query('path') ?? undefined;
    try {
        await removeTodo(id, filePath);
        logResponse(200);
        return c.text('Todo deleted', 200);
    } catch (err) {
        if (err instanceof IdentifiantNotFoundError) {
            logResponse(404, err.message);
            return c.text('Identifiant not found', 404);
        }
        throw err;
    }
});

export default app;
