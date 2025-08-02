import { randomUUID } from 'crypto';
import { Todo } from '../../shared/interfaces/Todo';
import { logger } from '../../shared/utils/logger';
import { logSelectedPath, resolvePath } from './todo.utils.service';
import { readTodos } from './todo.read.service';
import { writeTodos } from './todo.write.service';

export async function addTodo(data: any, path?: string) {
    logSelectedPath('addTodo', path);
    const finalPath = resolvePath(path);
    logger.debug('New Todo was received', 'addTodo', data);
    const todos = await readTodos(finalPath);
    logger.debug('Todos was read', 'addTodo');

    logger.debug('Trying to convert new Todo to Todo object', 'addTodo');

    const now = new Date().toISOString();

    let newTodo = new Todo({
        id: randomUUID(),
        ...data,
        created_at: now,
        updated_at: now,
    });

    todos.push(newTodo);
    await writeTodos(todos, finalPath);
    logger.info(`New Todo added`, 'addTodo', newTodo);

    return newTodo;
}
