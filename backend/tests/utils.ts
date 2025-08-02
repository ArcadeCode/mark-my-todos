export const TEST_DATA_PATH = './backend/data/test_todo.json';
export const BASE_URL = 'http://localhost:3000';

// Test dataset
export const mockTodos = [
    {
        id: '7a5bf215-f4b3-48a1-a857-cc9ad6fd0330',
        title: 'Test Todo 1',
        description: 'Description of the first test',
        project: 'TestProject',
        tags: ['test', 'important'],
        priority: 5,
        due_date: '2025-09-15T12:00:00.000Z',
        status: 'todo' as const,
        created_at: '2025-07-25T10:00:00Z',
        updated_at: '2025-07-25T10:00:00Z',
    },
    {
        id: '6d7b8151-b6af-45c3-8d6a-8aefcbe090c8',
        title: 'Test Todo 2',
        description: 'Description of the second test',
        project: 'TestProject',
        tags: ['test'],
        priority: 3,
        due_date: null,
        status: 'in-progress' as const,
        created_at: '2025-07-25T11:00:00Z',
        updated_at: '2025-07-25T11:30:00Z',
    },
];

export const newTodoData = {
    // Don't have an ID, the backend server will give it one.
    title: 'Test Todo 3',
    description: 'Description of the third test',
    project: 'TestProject',
    tags: ['new', 'test'],
    priority: 7,
    due_date: '2025-11-10T08:30:15.000Z',
    status: 'done' as const,
    // Optional created_at, updated_at
};
