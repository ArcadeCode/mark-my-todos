import { describe, test, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { Todo } from '../../shared/interfaces/Todo';
import { writeTodos } from '../services/todo.write.service';
import { readTodos } from '../services/todo.read.service';
import { TEST_DATA_PATH, BASE_URL, mockTodos } from './utils';

describe('Todo API Tests for `api/todos/remove/:id`', () => {
    beforeEach(async () => {
        // Save data before each test
        const testTodos = mockTodos.map((data) => new Todo(data));
        await writeTodos(testTodos, TEST_DATA_PATH);
    });

    afterEach(async () => {
        // Clean data before after each test
        const file = Bun.file(TEST_DATA_PATH);
        if (await file.exists()) {
            await Bun.write(TEST_DATA_PATH, JSON.stringify([], null, 2));
        }
    });

    afterAll(async () => {
        Bun.file(TEST_DATA_PATH).delete();
    });

    describe('DELETE /api/todos/remove/:id', () => {
        test('Should remove the first entry', async () => {
            const removeResponse = await fetch(`${BASE_URL}/api/todos/remove/${mockTodos[0].id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: TEST_DATA_PATH,
                }),
            });

            expect(removeResponse.status).toBe(200);

            const Todos: Todo[] = await readTodos(TEST_DATA_PATH);
            expect(Todos.length).toBe(1);
            expect(Todos[0].id).not.toBe(mockTodos[0].id);
        });
        test("Should return an error if an entry doesn't exist", async () => {
            const removeResponse = await fetch(
                `${BASE_URL}/api/todos/remove/129c601e-9b14-4c30-ab04-724554851ae3`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: TEST_DATA_PATH,
                    }),
                },
            );

            expect(removeResponse.status).toBe(404);
        });
    });
});
