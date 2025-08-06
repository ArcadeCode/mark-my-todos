import { logSelectedPath, resolvePath } from './todo.utils.service';
import { logger } from '../../shared/utils/logger';
import { FileNotFoundError, JsonParseError } from '../utils/errors';
import { Todo } from '../../shared/interfaces/Todo';

/**
 * Creates a sanitized shallow copy of the given object without any prototype.
 * This effectively removes inherited properties and methods such as __proto__,
 * constructor, and prototype, which could be vectors for prototype pollution attacks.
 *
 * @param obj The source object to sanitize
 * @returns A new object with no prototype and only own enumerable properties copied,
 *          excluding dangerous keys.
 */
function sanitize<T extends object>(obj: T): Record<string, any> {
    const clean = Object.create(null); // Create an object with no prototype
    for (const key of Object.keys(obj)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) continue; // Skip dangerous keys
        clean[key] = obj[key];
    }
    return clean;
}

/**
 * Reads todos from a JSON file located at the resolved path.
 * Performs validation and sanitization of the JSON content to avoid
 * prototype pollution by stripping dangerous inherited properties from each item.
 *
 * @param path Optional relative or absolute path to the todos JSON file.
 * @returns A Promise resolving to an array of Todo objects.
 * @throws FileNotFoundError if the file does not exist.
 * @throws JsonParseError if the JSON content is not an array.
 */
export async function readTodos(path?: string): Promise<Todo[]> {
    logSelectedPath('readTodos', path);
    const finalPath = resolvePath(path);
    const file = Bun.file(finalPath);
    logger.debug(`Loaded ${finalPath} into memory`, 'readTodos');

    if (!(await file.exists())) {
        logger.warn(`File not found — returning an error`, 'readTodos', finalPath);
        throw new FileNotFoundError(finalPath);
    }

    const raw = await file.json(); // type: unknown
    logger.debug(`Loaded ${finalPath} content into memory as raw JSON element`, 'readTodos');
    if (!Array.isArray(raw)) {
        logger.error('Invalid JSON: expected an array', 'readTodos', raw);
        throw new JsonParseError(`Expected an array, found a ${raw}`);
    }

    // Raw is an array whose elements may contain dangerous inherited properties
    // like __proto__, constructor, or prototype.
    // We sanitize each object to remove these inherited properties by creating
    // a new object without prototype and copying only safe own properties.
    const sanitized = raw.map((obj) => sanitize(obj));
    logger.debug(`Sanitized all objects from raw without dangerous property`, 'readTodos');

    // At this point, the original array still has prototypes, but
    // each element in 'sanitized' is a prototype-free plain object.

    //logger.debug(`Sanitized object properties: ${listAllProps(sanitized).join(', ')}`);

    // Convert sanitized plain objects into Todo instances.
    const output: Todo[] = sanitized.map((obj) => Todo.fromJSON(obj));
    logger.debug(`Parsed sanitized raw array as array of Todo objects`, 'readTodos');

    logger.debug(raw.toString());

    return output;
}
