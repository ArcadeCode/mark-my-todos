import { logSelectedPath, resolvePath } from './todo.utils.service';
import { logger } from '../../shared/utils/logger';
import { FileNotFoundError, JsonParseError } from '../utils/errors';
import { Todo } from '../../shared/interfaces/Todo';

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
