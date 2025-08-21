import { Hono } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import { logRequest, logResponse } from '../shared/utils/logger.ts';
import { readTodos } from './services/todo.read.service.ts';
import { addTodo } from './services/todo.add.service.ts';
import { editTodo } from './services/todo.edit.service.ts';
import { removeTodo } from './services/todo.remove.service.ts';
import {
    FileNotFoundError,
    IdentifiantNotFoundError,
    JsonParseError,
    UnauthorizedPathError,
} from './utils/errors';
import path from 'path';
/*
We need to ensure that body work like this :
{
    newTodoData: requested by client or sended by backend, contain a Todo[] into a JSON format
    path: precise the db file used during the request
}
*/

const app = new Hono();

// Global middleware for logging requests and checking injection vulnerabilities
app.use('*', async (c, next) => {
    logRequest(c.req);

    // Anti JSON Injection Vulnerability
    const DATABASE_DIR = path.resolve('data/json');
    const userPath = c.req.query('path');
    if (userPath) {
        try {
            // 1. Normalize the path (removes `../`, `./`, etc.)
            const safePath = path.normalize(userPath);

            // 2. Strictly check the file extension
            if (!safePath.endsWith('.json')) {
                throw new UnauthorizedPathError('Invalid file extension');
            }

            // 3. Rebuild the absolute path
            const finalPath = path.resolve(DATABASE_DIR, safePath);

            // 4. Check that the final path is within BASE_DIR
            if (!finalPath.startsWith(DATABASE_DIR)) {
                throw new UnauthorizedPathError('Path traversal detected');
            }
        } catch (err) {
            throw err;
        }
    }
    await next();
});

// Global error handling
app.onError((err, c) => {
    if (err instanceof Error && typeof err.stack === 'string') {
        console.log('Stack trace :', err.stack);
    }

    let status: StatusCode = 500;
    let message = 'Internal server error';

    if (err instanceof FileNotFoundError) {
        status = 404;
        message = 'File not found';
    } else if (err instanceof IdentifiantNotFoundError) {
        status = 404;
        message = 'Identifier not found';
    } else if (err instanceof JsonParseError) {
        status = 422;
        message = 'Invalid JSON format';
    } else if (err instanceof UnauthorizedPathError) {
        status = 404; // ou 400 selon votre choix
        message = err.reason || 'Unauthorized path detected';
    }

    logResponse(status, err.message || message);

    return c.text(message, status);
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

// PATCH /api/todos/edit/:id?path=...
app.patch('/api/todos/edit/:id', async (c) => {
    const id = c.req.param('id');
    const request = await c.req.json();
    const filePath = request.path ?? c.req.query('path') ?? undefined;
    const newContent = request.newTodoData;
    try {
        await editTodo(id, newContent, filePath);
        logResponse(200);
        return c.text('Todo edited', 200);
    } catch (err) {
        if (err instanceof IdentifiantNotFoundError) {
            logResponse(404, err.message);
            return c.text('Identifier not found', 404);
        }
        throw err;
    }
});

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
            return c.text('Identifier not found', 404);
        }
        throw err;
    }
});

export default app;
