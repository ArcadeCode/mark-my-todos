import { describe, test, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { Todo } from '../Todo';
import { readTodos, writeTodos } from '../services/todo.service';
import { TEST_DATA_PATH, BASE_URL, mockTodos, newTodoData } from './utils';

describe('Todo API Tests for `api/todos/add`', () => {
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

    describe('POST /api/todos/add', () => {
        test('Should return a new json file with the added Todo element', async () => {
            const addResponse = await fetch(`${BASE_URL}/api/todos/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTodoData,
                    queryPath: TEST_DATA_PATH,
                }),
            });
            expect(addResponse.status).toBe(201);
        });

        test('Should handle nullable due_date', async () => {
            newTodoData.due_date = 'null'; // Force mocking to be set to null

            const addResponse = await fetch(`${BASE_URL}/api/todos/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTodoData,
                    queryPath: TEST_DATA_PATH,
                }),
            });
            const Todos = await readTodos(TEST_DATA_PATH);
            expect(Todos[2].due_date).toBe('null');
        });

        test('Should handle undefined created_at and updated_at dates and define it', async () => {
            // The mock doesn't have created_at and update_at property.

            const addResponse = await fetch(`${BASE_URL}/api/todos/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTodoData,
                    queryPath: TEST_DATA_PATH,
                }),
            });
            const Todos = await readTodos(TEST_DATA_PATH);
            expect(Todos[2].created_at).not.toBe('undefined');
            expect(Todos[2].updated_at).not.toBe('undefined');
        });
    });
});
