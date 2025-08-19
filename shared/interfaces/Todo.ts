import { logger } from '../utils/logger';

export type TodoStatus = 'todo' | 'in-progress' | 'done';

// Interface pour les données d'entrée du constructeur
interface TodoConstructorData {
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
}

export class Todo {
    readonly id?: string;
    private _title: string;
    private _description: string;
    private _project: string;
    private _tags: string[];
    private _priority: number;
    private _due_date: string | null;
    private _status: TodoStatus;
    readonly created_at?: string;
    private _updated_at?: string;

    // Constantes de validation
    private static readonly MAX_TITLE_LENGTH = 200;
    private static readonly MAX_DESCRIPTION_LENGTH = 2000;
    private static readonly MAX_PROJECT_LENGTH = 100;
    private static readonly MAX_TAG_LENGTH = 50;
    private static readonly MAX_TAGS_COUNT = 20;
    private static readonly MIN_PRIORITY = 0;
    private static readonly MAX_PRIORITY = 10;

    constructor(data: TodoConstructorData) {
        // Validation et nettoyage des données
        this.id = this.sanitizeId(data.id);
        this._title = this.validateAndSanitizeTitle(data.title);
        this._description = this.validateAndSanitizeDescription(data.description);
        this._project = this.validateAndSanitizeProject(data.project);
        this._tags = this.validateAndSanitizeTags(data.tags);
        this._priority = this.validatePriority(data.priority);
        this._due_date = this.validateDueDate(data.due_date);
        this._status = this.validateStatus(data.status);
        this.created_at = this.validateTimestamp(data.created_at);
        this._updated_at = this.validateTimestamp(data.updated_at);

        // Freeze l'objet pour empêcher la modification directe
        Object.freeze(this);
    }

    // Getters sécurisés
    get title(): string {
        return this._title;
    }
    get description(): string {
        return this._description;
    }
    get project(): string {
        return this._project;
    }
    get tags(): string[] {
        return [...this._tags];
    } // Retourne une copie
    get priority(): number {
        return this._priority;
    }
    get due_date(): string | null {
        return this._due_date;
    }
    get status(): TodoStatus {
        return this._status;
    }
    get updated_at(): string | undefined {
        return this._updated_at;
    }

    // Méthodes de validation privées
    private sanitizeId(id?: string): string | undefined {
        if (id === undefined) return undefined;

        const sanitized = id.trim();
        if (sanitized.length === 0 || sanitized.length > 36) {
            logger.error('Invalid id format');
            throw new Error('Invalid id format');
        }

        // Validation UUID basique
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(sanitized)) {
            logger.error(`Invalid UUID format for id : ${sanitized}`);
            throw new Error('Invalid UUID format for id');
        }

        return sanitized;
    }

    private validateAndSanitizeTitle(title: string): string {
        if (typeof title !== 'string') {
            logger.error(`Title must be a string not ${title}`);
            throw new Error(`Title must be a string not ${title}`);
        }

        const sanitized = this.sanitizeString(title);
        if (sanitized.length === 0) {
            logger.error('Title cannot be empty');
            throw new Error('Title cannot be empty');
        }
        if (sanitized.length > Todo.MAX_TITLE_LENGTH) {
            logger.error(`Title too long (max ${Todo.MAX_TITLE_LENGTH} characters)`);
            throw new Error(`Title too long (max ${Todo.MAX_TITLE_LENGTH} characters)`);
        }

        return sanitized;
    }

    private validateAndSanitizeDescription(description: string): string {
        if (typeof description !== 'string') {
            logger.error('Description must be a string');
            throw new Error('Description must be a string');
        }

        const sanitized = this.sanitizeString(description);
        if (sanitized.length > Todo.MAX_DESCRIPTION_LENGTH) {
            logger.error(`Description too long (max ${Todo.MAX_DESCRIPTION_LENGTH} characters)`);
            throw new Error(`Description too long (max ${Todo.MAX_DESCRIPTION_LENGTH} characters)`);
        }

        return sanitized;
    }

    private validateAndSanitizeProject(project: string): string {
        if (typeof project !== 'string') {
            logger.error('Project must be a string');
            throw new Error('Project must be a string');
        }

        const sanitized = this.sanitizeString(project);
        if (sanitized.length === 0) {
            logger.error('Project cannot be empty');
            throw new Error('Project cannot be empty');
        }
        if (sanitized.length > Todo.MAX_PROJECT_LENGTH) {
            logger.error(`Project name too long (max ${Todo.MAX_PROJECT_LENGTH} characters)`);
            throw new Error(`Project name too long (max ${Todo.MAX_PROJECT_LENGTH} characters)`);
        }

        return sanitized;
    }

    private validateAndSanitizeTags(tags: unknown): string[] {
        if (!Array.isArray(tags)) {
            logger.error('Tags must be an array');
            throw new Error('Tags must be an array');
        }

        if (tags.length > Todo.MAX_TAGS_COUNT) {
            logger.error(`Too many tags (max ${Todo.MAX_TAGS_COUNT})`);
            throw new Error(`Too many tags (max ${Todo.MAX_TAGS_COUNT})`);
        }

        const sanitizedTags: string[] = [];
        const uniqueTags = new Set<string>();

        for (const tag of tags) {
            if (typeof tag !== 'string') {
                logger.error('All tags must be strings');
                throw new Error('All tags must be strings');
            }

            const sanitized = this.sanitizeString(tag);
            if (sanitized.length === 0) continue; // Ignore les tags vides

            if (sanitized.length > Todo.MAX_TAG_LENGTH) {
                logger.error(`Tag too long (max ${Todo.MAX_TAG_LENGTH} characters)`);
                throw new Error(`Tag too long (max ${Todo.MAX_TAG_LENGTH} characters)`);
            }

            const lowerTag = sanitized.toLowerCase();
            if (!uniqueTags.has(lowerTag)) {
                uniqueTags.add(lowerTag);
                sanitizedTags.push(sanitized);
            }
        }

        return sanitizedTags;
    }

    private validatePriority(priority: unknown): number {
        if (typeof priority !== 'number' || !Number.isInteger(priority)) {
            logger.error('Priority must be an integer');
            throw new Error('Priority must be an integer');
        }

        if (priority < Todo.MIN_PRIORITY || priority > Todo.MAX_PRIORITY) {
            logger.error(`Priority must be between ${Todo.MIN_PRIORITY} and ${Todo.MAX_PRIORITY}`);
            throw new Error(
                `Priority must be between ${Todo.MIN_PRIORITY} and ${Todo.MAX_PRIORITY}`,
            );
        }

        return priority;
    }

    private validateDueDate(due_date: unknown): string | null {
        if (due_date === null || due_date === 'null') {
            return null;
        }

        if (typeof due_date !== 'string') {
            logger.error('Due date must be a string or null');
            throw new Error('Due date must be a string or null');
        }

        const sanitized = due_date.trim();
        if (sanitized.length === 0) return null;

        // Validation ISO 8601 date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/;
        if (!dateRegex.test(sanitized)) {
            logger.error(
                `Due date must be in ISO 8601 format, not : ${sanitized}`,
                undefined,
                this.toJSONString(),
            );
            throw new Error('Due date must be in ISO 8601 format');
        }

        const date = new Date(sanitized);
        if (isNaN(date.getTime())) {
            logger.error('Invalid due date');
            throw new Error('Invalid due date');
        }

        return sanitized;
    }

    private validateStatus(status: unknown): TodoStatus {
        if (!Todo.validateStatusValue(status)) {
            logger.error('Invalid status value');
            throw new Error('Invalid status value');
        }
        return status;
    }

    private validateTimestamp(timestamp?: unknown): string | undefined {
        if (timestamp === undefined) return undefined;

        if (typeof timestamp !== 'string') {
            logger.error('Timestamp must be a string');
            throw new Error('Timestamp must be a string');
        }

        const sanitized = timestamp.trim();
        if (sanitized.length === 0) return undefined;

        const date = new Date(sanitized);
        if (isNaN(date.getTime())) {
            logger.error('Invalid timestamp format');
            throw new Error('Invalid timestamp format');
        }

        return sanitized;
    }

    private sanitizeString(input: string): string {
        return input
            .trim()
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Supprime les caractères de contrôle
            .replace(/\s+/g, ' '); // Normalise les espaces
    }

    // Méthodes statiques
    static validateStatusValue(status: unknown): status is TodoStatus {
        return status === 'todo' || status === 'in-progress' || status === 'done';
    }

    static fromJSON(json: unknown): Todo {
        // Check that the input is an object (and not null)
        if (typeof json !== 'object' || json === null) {
            logger.error('Invalid input: not an object');
            throw new Error('Invalid input: not an object');
        }

        // Prevent prototype pollution by ensuring the constructor is not overridden
        if (json.constructor !== Object && json.constructor !== undefined) {
            logger.error('Invalid input: suspicious object constructor');
            throw new Error('Invalid input: suspicious object constructor');
        }

        // Cast the input to a generic object with unknown values
        const obj = json as Record<string, unknown>;

        // Check for prototype pollution attack vectors
        const dangerousProps = ['__proto__', 'constructor', 'prototype'];
        for (const prop of dangerousProps) {
            if (prop in obj) {
                logger.error(`Dangerous property detected: ${prop}`);
                throw new Error(`Dangerous property detected: ${prop}`);
            }
        }

        // Limit the number of properties to avoid potential DoS attacks
        if (Object.keys(obj).length > 20) {
            logger.error('Too many properties in input object');
            throw new Error('Too many properties in input object');
        }

        try {
            // Construct a new Todo object from the sanitized input
            return new Todo({
                id: obj.id as string | undefined, // Optional field
                title: obj.title as string, // Required
                description: obj.description as string, // Required
                project: obj.project as string, // Required
                tags: obj.tags as string[], // Array of strings
                priority: obj.priority as number, // Integer or float
                due_date: obj.due_date as string | null, // Nullable date
                status: obj.status as TodoStatus, // Enum or string representation
                created_at: obj.created_at as string | undefined, // Optional date string
                updated_at: obj.updated_at as string | undefined, // Optional date string
            });
        } catch (error) {
            // Log and rethrow the error if Todo creation fails
            logger.error(
                `Failed to create Todo from JSON: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw error;
        }
    }

    // Méthodes de mise à jour sécurisées
    updateTitle(newTitle: string): Todo {
        return new Todo({
            id: this.id,
            title: newTitle,
            description: this._description,
            project: this._project,
            tags: this._tags,
            priority: this._priority,
            due_date: this._due_date,
            status: this._status,
            created_at: this.created_at,
            updated_at: new Date().toISOString(),
        });
    }

    updateStatus(newStatus: TodoStatus): Todo {
        return new Todo({
            id: this.id,
            title: this._title,
            description: this._description,
            project: this._project,
            tags: this._tags,
            priority: this._priority,
            due_date: this._due_date,
            status: newStatus,
            created_at: this.created_at,
            updated_at: new Date().toISOString(),
        });
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            title: this._title,
            description: this._description,
            project: this._project,
            tags: [...this._tags], // Copie pour éviter les mutations
            priority: this._priority,
            due_date: this._due_date,
            status: this._status,
            created_at: this.created_at,
            updated_at: this._updated_at,
        };
    }

    toJSONString(): string {
        try {
            return JSON.stringify(this.toJSON());
        } catch (error) {
            logger.error(
                `Failed to serialize Todo to JSON: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw new Error('Failed to serialize Todo to JSON');
        }
    }
}
