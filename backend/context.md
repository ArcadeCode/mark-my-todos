# Context of the problem
This next section contain all informations about the project.

---

## Environnement specs
Operating system . . . . . . : Windows-11-10.0.26100-SP0
Generation context file data : 25/07/2025, 16:14:01
Root of the project . . . .  : .

## Tree view of the project
```

├── data
│   └── todo.json
├── services
│   └── todo.service.ts
├── tests
│   └── todo_api_test.ts
├── context.md
├── routes.ts
├── server.ts
└── Todo.ts
```

## Project configuration and important files

### todo.json file
```json
[
  {
    "id": "uuid-1",
    "title": "Finaliser le pathfinding A* dans Colonia",
    "description": "Améliorer l'algorithme et optimiser les performances",
    "project": "Colonia",
    "tags": ["feature", "urgent"],
    "priority": 8,
    "due_date": "2025-09-30",
    "status": "todo",
    "created_at": "2025-07-23T10:00:00Z",
    "updated_at": "2025-07-23T12:00:00Z"
  },
  {
    "id": "uuid-2",
    "title": "Relire les notes de microélectronique",
    "description": "Synthétiser les points clés pour la révision",
    "project": "ESEO",
    "tags": ["revision"],
    "priority": 2,
    "due_date": null,
    "status": "in-progress",
    "created_at": "2025-07-22T14:00:00Z",
    "updated_at": "2025-07-23T09:00:00Z"
  }
]
```

### Todo.Ts files
**File:** `Todo.ts`
```ts
type TodoStatus = 'todo' | 'in-progress' | 'done';

export class Todo {
    id?: string;
    title: string;
    description: string;
    project: string;
    tags: string[];
    priority: number;
    due_date: string | null;
    status: TodoStatus;
    created_at?: string;
    updated_at?: string;

    constructor(data: {
        id?: string;
        title: string;
        description: string;
        project: string;
        tags: string[];
        priority: number;
        due_date: string | null;
        status: TodoStatus;
        created_at?: string;
        updated_at?: string;
    }) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.project = data.project;
        this.tags = data.tags;
        this.priority = data.priority;
        this.due_date = data.due_date;
        this.status = data.status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static validateStatus(status: any): status is TodoStatus {
        return status === 'todo' || status === 'in-progress' || status === 'done';
    }

    static fromJSON(json: unknown): Todo {
        if (typeof json !== 'object' || json === null) {
            throw new Error('Invalid input: not an object');
        }

        const obj = json as Record<string, unknown>;

        if (obj.id !== undefined && typeof obj.id !== 'string') {
            throw new Error('Invalid id');
        }
        if (typeof obj.title !== 'string') {
            throw new Error('Invalid or missing title');
        }
        if (typeof obj.description !== 'string') {
            throw new Error('Invalid or missing description');
        }
        if (typeof obj.project !== 'string') {
            throw new Error('Invalid or missing project');
        }
        if (!Array.isArray(obj.tags) || !obj.tags.every((t) => typeof t === 'string')) {
            throw new Error('Invalid or missing tags');
        }
        if (typeof obj.priority !== 'number') {
            throw new Error('Invalid or missing priority');
        }
        if (!(typeof obj.due_date === 'string' || obj.due_date === null)) {
            throw new Error('Invalid or missing due_date');
        }
        if (!Todo.validateStatus(obj.status)) {
            throw new Error('Invalid or missing status');
        }
        if (obj.created_at !== undefined && typeof obj.created_at !== 'string') {
            throw new Error('Invalid created_at');
        }
        if (obj.updated_at !== undefined && typeof obj.updated_at !== 'string') {
            throw new Error('Invalid updated_at');
        }

        return new Todo({
            id: obj.id as string | undefined,
            title: obj.title,
            description: obj.description,
            project: obj.project,
            tags: obj.tags as string[],
            priority: obj.priority,
            due_date: obj.due_date as string | null,
            status: obj.status as TodoStatus,
            created_at: obj.created_at as string | undefined,
            updated_at: obj.updated_at as string | undefined,
        });
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            project: this.project,
            tags: this.tags,
            priority: this.priority,
            due_date: this.due_date,
            status: this.status,
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }

    toJSONString(): string {
        return JSON.stringify(this.toJSON());
    }
}

```

### todo.service.ts
```ts
import { randomUUID } from 'crypto';
import { Todo } from '../Todo';

const DEFAULT_PATH = './data/todo.json';

function resolvePath(custom?: string) {
    return custom || DEFAULT_PATH;
}

export async function readTodos(path?: string): Promise<Todo[]> {
    const file = Bun.file(resolvePath(path));
    if (!(await file.exists())) return [];

    const raw = await file.json(); // type: unknown
    if (!Array.isArray(raw)) throw new Error('Invalid JSON: expected an array');

    return raw.map((obj) => Todo.fromJSON(obj));
}

export async function writeTodos(todos: Todo[], path?: string) {
    const json = todos.map((todo) => todo.toJSON());
    await Bun.write(resolvePath(path), JSON.stringify(json, null, 2));
}

export async function addTodo(data: any, path?: string) {
    const todos = await readTodos(path); // We store todo.json
    let newTodo = new Todo({
        // Initialization of a new Todo object
        id: randomUUID(), // Custom UUID
        ...data, // We unpack and load on all the others informations
    });

    // If the user doesn't have specified the created/updated_at date
    if (newTodo.created_at === undefined) {
        const now = new Date().toISOString();
        newTodo.created_at = now;
        newTodo.updated_at = now;
    }
    todos.push(newTodo);
    await writeTodos(todos, path);
    return newTodo;
}
```

### Routes.Ts files
**File:** `routes.ts`
```ts
import { readTodos, writeTodos, addTodo } from './services/todo.service.ts';

export async function handleTodoAPI(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;

    // GET the complete json Todo list
    if (method === 'GET' && path === '/api/todos/get') {
        const todos = await readTodos();
        return Response.json(todos);
    }

    // Add new Todo to the Todo list
    if (method === 'POST' && path === '/api/todos/add') {
        const data = await req.json();
        const newTodo = await addTodo(data);
        return Response.json(newTodo, { status: 201 });
    }

    // Erase the complete db by another content
    if (method === 'POST' && path === '/api/todos/replace') {
        const data = await req.json();
        const newTodo = await writeTodos(data);
        return Response.json(newTodo, { status: 201 });
    }

    return new Response('Not Found or Method Not Allowed', { status: 405 });
}

```

### Server.Ts files
**File:** `server.ts`
```ts
import { handleTodoAPI } from './routes.ts';

Bun.serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname.startsWith('/todos')) {
            return handleTodoAPI(req);
        }
        return new Response('Not Found', { status: 404 });
    },
});

console.log('🟢 Server running at http://localhost:3000');

```

