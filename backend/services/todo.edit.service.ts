import { isValidId, resolvePath } from './todo.utils.service';
import { readTodos } from './todo.read.service';
import { writeTodos } from './todo.write.service';
import { logger } from '../../shared/utils/logger';
import { InvalidIdentifier } from '../utils/errors';
import { Todo } from '../../shared/interfaces/Todo';

export async function editTodo(data: any, index: string, path?: string) {
    const finalPath = resolvePath(path);
    if (!isValidId(index, finalPath)) {
        logger.error(`Attempt to edit a Todo, but the ID ${index} doesn't exist on ${finalPath}`);
        throw InvalidIdentifier;
    }

    // At this moment, index is a valid uuid
    const editedTodo = Todo.fromJSON(data); // Checking integrity of data

    let todos: Todo[] = await readTodos(path);

    todos = todos.map((todo) => (todo.id === index ? editedTodo : todo));

    await writeTodos(todos, path);
}
