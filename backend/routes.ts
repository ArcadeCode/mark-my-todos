import { logRequest, logResponse } from './utils/logger.ts';
import { readTodos, writeTodos, addTodo } from './services/todo.service.ts';
import { FileNotFoundError, JsonParseError, TodoParseError } from './utils/errors';

export async function handleTodoAPI(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;
    const filePath = url.searchParams.get('path') ?? undefined; // fallback on default path into todo.service.ts

    logRequest(method, path, { queryPath: filePath });

    // GET the complete json Todo list
    if (method === 'GET' && path === '/api/todos/get') {
        try {
            const todos = await readTodos(filePath);
            logResponse(200, todos);
            return Response.json(todos, { status: 200 });
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                logResponse(404, FileNotFoundError);
            }
            if (err instanceof JsonParseError) {
                logResponse(422, JsonParseError);
            }
        }
    }

    // Add new Todo to the Todo list
    if (method === 'POST' && path === '/api/todos/add') {
        try {
            const data = await req.json();
            const filePath = data.queryPath ?? undefined;
            const newTodo = await addTodo(data, filePath);
            logResponse(201, newTodo);
            return Response.json(newTodo, { status: 201 });
        } catch (err) {
            logResponse(422);
            return new Response('Invalid todo data', { status: 422 });
        }
    }

    // Erase the complete db by another content
    if (method === 'POST' && path === '/api/todos/replace') {
        const data = await req.json();
        const newTodo = await writeTodos(data, filePath);
        logResponse(201, newTodo);
        return Response.json(newTodo, { status: 201 });
    }

    logResponse(405);
    return new Response('Not Found or Method Not Allowed', { status: 405 });
}
