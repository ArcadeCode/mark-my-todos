export class FileNotFoundError extends Error {
    constructor(public filepath: string) {
        super(`File not found: ${filepath}`);
        this.name = 'FileNotFoundError';
    }
}

export class JsonParseError extends Error {
    constructor(public reason: string) {
        super(`Json parsing error: ${reason}`);
        this.name = 'JsonParseError';
    }
}

export class TodoParseError extends Error {
    constructor(public reason: string) {
        super(`Todo class parsing error: ${reason}`);
        this.name = 'TodoParseError';
    }
}
