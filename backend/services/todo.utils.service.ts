import { logger } from '../../shared/utils/logger';
import { Todo } from '../../shared/interfaces/Todo';
import { readTodos } from './todo.read.service';

export const DEFAULT_PATH = './backend/data/todo.json';

export function resolvePath(custom?: string) {
    return custom || DEFAULT_PATH;
}

export function logSelectedPath(source: string, path?: string) {
    if (typeof path == undefined) {
        logger.debug(
            `Path not selected, fallback on default path : ${DEFAULT_PATH}`,
            'readTodos',
            path,
        );
    } else {
        logger.debug(`Custom path selected : ${path}`, 'readTodos', path);
    }
}

export async function isValidId(id: string, path?: string): Promise<Boolean> {
    const todos: Todo[] = await readTodos(path);
    for (let i = 0; i < todos.length; i++) {
        const todo = todos[i];
        if (todo.id == id) {
            return true;
        }
    }
    return false;
}
