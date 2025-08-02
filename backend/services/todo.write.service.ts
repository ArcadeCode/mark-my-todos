import { logger } from '../../shared/utils/logger';
import { Todo } from '../../shared/interfaces/Todo';
import { resolvePath } from './todo.utils.service';
import { TodoParseError } from '../utils/errors';

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
