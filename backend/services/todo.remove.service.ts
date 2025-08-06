import { resolvePath } from './todo.utils.service';
import { readTodos } from './todo.read.service';
import { Todo } from '../../shared/interfaces/Todo';
import { logger } from '../../shared/utils/logger';
import { IdentifiantNotFoundError } from '../utils/errors';
import { writeTodos } from './todo.write.service';

export async function removeTodo(id: string, path?: string) {
    const finalPath = resolvePath(path);

    logger.info(`Trying to remove ${id} from ${finalPath}`, 'removeTodo');
    logger.debug(`Reading DB`, 'removeTodo');
    const todos: Todo[] = await readTodos(finalPath);
    logger.debug(`DB was loaded in memory`, 'removeTodo');

    const index = todos.findIndex((obj) => obj.id === id);

    if (index !== -1) {
        const [removed] = todos.splice(index, 1);
        logger.info(`Deleted element with id '${removed.id}' at index ${index}`, 'removeTodo');
        writeTodos(todos, finalPath);
        logger.debug(`Todos saved without ${removed}`, 'removeTodo');
    } else {
        logger.warn(`ID '${id}' not found in DB`, 'removeTodo');
        throw new IdentifiantNotFoundError(`Identifiant ${id} was not found into ${finalPath}`);
    }
}
