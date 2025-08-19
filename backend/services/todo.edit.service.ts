import { resolvePath } from './todo.utils.service';
import { readTodos } from './todo.read.service';
import { writeTodos } from './todo.write.service';
import { logger } from '../../shared/utils/logger';
import { IdentifiantNotFoundError } from '../utils/errors';
import { Todo } from '../../shared/interfaces/Todo';

export async function editTodo(id: string, newContent: Partial<Todo>, path?: string) {
    const finalPath = resolvePath(path);

    // Si newContent vient du body avec newTodoData en string JSON
    if (typeof newContent === 'string') {
        newContent = JSON.parse(newContent);
    }

    logger.info(`Trying to edit ${id} from ${finalPath} with content : ${newContent}`, 'editTodo');
    logger.debug(`Reading DB`, 'editTodo');
    const todos: Todo[] = await readTodos(finalPath);
    logger.debug(`DB was loaded in memory`, 'editTodo');

    const index = todos.findIndex((obj) => obj.id === id);

    if (index !== -1) {
        const [todoToEdit] = todos.splice(index, 1);
        // Here todoToEdit doesn't is part of todos[] anymore

        // Here will check on the newContent any part who doesn't is
        // Already on the todoToEdit, we remind that newContent is a
        // object who is partial Todo.
        const updatedTodo = new Todo({
            ...todoToEdit, // ancienne valeur
            ...newContent, // écrase les champs existants si présents
        } as Todo);

        logger.info(`Edited element with id '${todoToEdit.id}' at index ${index}`, 'editTodo');
        todos.splice(index, 0, updatedTodo); // Pushing at the same index
        writeTodos(todos, finalPath);
        logger.debug(
            `Todos saved with ${todoToEdit.id} edited, new todo is : ${updatedTodo.toJSONString()}`,
            'editTodo',
        );
    } else {
        logger.warn(`ID '${id}' not found in DB`, 'editTodo');
        throw new IdentifiantNotFoundError(`Identifier ${id} was not found into ${finalPath}`);
    }
}
