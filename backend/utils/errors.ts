export class FileNotFoundError extends Error {
    constructor(public filepath: string) {
        super(`File not found: ${filepath}`);
        this.name = 'FileNotFoundError';
    }
}

export class IdentifiantNotFoundError extends Error {
    constructor(public reason: string) {
        super(`Identifiant not found: ${reason}`);
        this.name = 'IdentifiantNotFoundError';
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

export class InvalidIdentifier extends Error {
    constructor(public reason: string) {
        super(`Todo class parsing error: ${reason}`);
        this.name = 'InvalidIdentifier';
    }
}

export class UnauthorizedPathError extends Error {
    constructor(public reason?: string) {
        super(`Unauthorized path error: ${reason || 'potential malicious injection detected'}`);
        this.name = 'UnauthorizedPathError';
    }
}
