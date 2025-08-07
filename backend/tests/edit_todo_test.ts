import { describe, test, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { Todo } from '../../shared/interfaces/Todo';
import { writeTodos } from '../services/todo.write.service';
import { readTodos } from '../services/todo.read.service';
import { TEST_DATA_PATH, BASE_URL, mockTodos, newTodoData } from './utils';

describe('Todo API Tests for `api/todos/edit/:id`', () => {
    beforeEach(async () => {
        const testTodos = mockTodos.map((data) => new Todo(data));
        await writeTodos(testTodos, TEST_DATA_PATH);
    });

    afterEach(async () => {
        const file = Bun.file(TEST_DATA_PATH);
        if (await file.exists()) {
            await Bun.write(TEST_DATA_PATH, JSON.stringify([], null, 2));
        }
    });

    afterAll(async () => {
        Bun.file(TEST_DATA_PATH).delete();
    });

    describe('PATCH /api/todos/edit/:id', () => {
        test('Should edit the first entry with new content', async () => {
            const response = await fetch(`${BASE_URL}/api/todos/edit/${mockTodos[0].id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newTodoData: newTodoData,
                    path: TEST_DATA_PATH,
                }),
            });

            expect(response.status).toBe(200);

            const todos: Todo[] = await readTodos(TEST_DATA_PATH);
            expect(todos.length).toBe(2); // Il reste 2 éléments

            const edited = todos.find((t) => t.id === mockTodos[0].id);
            expect(edited).toBeDefined();

            // Vérification du contenu édité (selon les clés de newTodoData)
            for (const [key, value] of Object.entries(newTodoData)) {
                expect(String(edited?.[key as keyof Todo])).toEqual(String(value));
            }
        });

        test('Should return 404 if the id does not exist', async () => {
            const response = await fetch(`${BASE_URL}/api/todos/edit/this-id-does-not-exist`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newTodoData: newTodoData,
                    path: TEST_DATA_PATH,
                }),
            });

            expect(response.status).toBe(404);
        });
    });
});
