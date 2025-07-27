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
