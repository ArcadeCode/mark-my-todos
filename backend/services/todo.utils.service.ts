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
