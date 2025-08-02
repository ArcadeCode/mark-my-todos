import { describe, test, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { Todo } from '../../shared/interfaces/Todo';
import { writeTodos } from '../services/todo.write.service';
import { TEST_DATA_PATH, BASE_URL, mockTodos } from './utils';

describe('Todo API Tests for `api/todos/get`', () => {
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

    describe('GET /api/todos/get', () => {
        test('Should return a complete todo list', async () => {
            const response = await fetch(`${BASE_URL}/api/todos/get?path=${TEST_DATA_PATH}`);

            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toContain('application/json');

            // We remind, than todos need to be a Todo[] array parsed as json
            const todos = await response.json();

            expect(Array.isArray(todos)).toBe(true); // Theoretically database is a Json Array
            expect(todos.length).toBe(2);

            // Structure verification of the first todo
            const firstTodo = todos[0];
            expect(firstTodo).toHaveProperty('id'); // This property need to be initialized by the backend
            expect(firstTodo).toHaveProperty('title');
            expect(firstTodo).toHaveProperty('description');
            expect(firstTodo).toHaveProperty('project');
            expect(firstTodo).toHaveProperty('tags');
            expect(firstTodo).toHaveProperty('priority');
            expect(firstTodo).toHaveProperty('due_date');
            expect(firstTodo).toHaveProperty('status');
            expect(firstTodo).toHaveProperty('created_at');
            expect(firstTodo).toHaveProperty('updated_at');
            // Structure verification of the second todo
            const secondTodo = todos[0];
            expect(secondTodo).toHaveProperty('id'); // This property need to be initialized by the backend
            expect(secondTodo).toHaveProperty('title');
            expect(secondTodo).toHaveProperty('description');
            expect(secondTodo).toHaveProperty('project');
            expect(secondTodo).toHaveProperty('tags');
            expect(secondTodo).toHaveProperty('priority');
            expect(secondTodo).toHaveProperty('due_date');
            expect(secondTodo).toHaveProperty('status');
            expect(secondTodo).toHaveProperty('created_at');
            expect(secondTodo).toHaveProperty('updated_at');
        });

        test("Should return an error, when path doesn't exist", async () => {
            const response = await fetch(
                `${BASE_URL}/api/todos/get?path='./an/improbable/path/todo.json'`,
            );
            expect(response.status).toBe(404);
        });
    });
});
