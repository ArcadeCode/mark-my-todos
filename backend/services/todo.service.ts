import { randomUUID } from 'crypto';
import { Todo } from '../Todo';
import { logger } from '../utils/logger';
import { FileNotFoundError, JsonParseError, TodoParseError } from '../utils/errors';

const DEFAULT_PATH = './backend/data/todo.json';

function resolvePath(custom?: string) {
    return custom || DEFAULT_PATH;
}

function logSelectedPath(source: string, path?: string) {
    if (typeof path == undefined) {
        logger.info(
            `Path not selected, fallback on default path : ${DEFAULT_PATH}`,
            'readTodos',
            path,
        );
    } else {
        logger.info(`Custom path selected : ${path}`, 'readTodos', path);
    }
}

export async function readTodos(path?: string): Promise<Todo[]> {
    logSelectedPath('readTodos', path);
    const finalPath = resolvePath(path);
    const file = Bun.file(finalPath);

    if (!(await file.exists())) {
        logger.warn(`File not found — returning an error`, 'readTodos', finalPath);
        throw new FileNotFoundError(finalPath);
    }

    const raw = await file.json(); // type: unknown
    if (!Array.isArray(raw)) {
        logger.error('Invalid JSON: expected an array', 'readTodos', raw);
        throw new JsonParseError(`Expected an array, found a ${raw}`);
    }

    return raw.map((obj) => Todo.fromJSON(obj));
}

export async function writeTodos(todos: Todo[], path?: string) {
    const finalPath = resolvePath(path);
    const json = todos.map((todo, i) => {
        if (typeof todo.toJSON !== 'function') {
            logger.warn(`Element at index ${i} is not a Todo instance`, 'writeTodos', todo);
            throw new TodoParseError('Todo objet cannot properly be translate into Json object');
        }
        return todo.toJSON();
    });

    await Bun.write(finalPath, JSON.stringify(json, null, 2));
    logger.info(`Todos written to file`, 'writeTodos', finalPath);
}

export async function addTodo(data: any, path?: string) {
    logSelectedPath('addTodo', path);
    const finalPath = resolvePath(path);
    const todos = await readTodos(finalPath);
    logger.debug('Todos was read', 'addTodo', todos);

    logger.debug('Trying to convert new Todo to Todo object', 'addTodo');
    const newTodo = new Todo({
        id: randomUUID(),
        ...data,
    });

    if (newTodo.created_at === undefined) {
        const now = new Date().toISOString();
        logger.debug("created_at property wasn't defined", 'addTodo', newTodo.created_at);
        logger.info(
            `Set property's created_at and updated_at of ${newTodo} to now date : ${now}`,
            'addTodo',
        );
        newTodo.created_at = now;
        newTodo.updated_at = now;
    }

    if (typeof newTodo.tags === 'string') {
        logger.warn(
            `Found typeof tags === string, excepted string[], exception handled and tags was converted from ${newTodo.tags} to ${[newTodo.tags]}`,
        );
        newTodo.tags = [newTodo.tags];
    }

    try {
        logger.debug('Trying to check newTodo structure', 'addTodo');
        Todo.fromJSON(newTodo); // validation
        logger.debug('newTodo follow structure convention', 'addTodo');
    } catch (err) {
        logger.error('Invalid Todo object', 'addTodo', err);
        throw new TodoParseError(
            `Todo objet cannot properly be translate from Json object : ${newTodo}`,
        );
    }

    todos.push(newTodo);
    await writeTodos(todos, finalPath);
    logger.info(`New Todo added`, 'addTodo', newTodo);

    return newTodo;
}
