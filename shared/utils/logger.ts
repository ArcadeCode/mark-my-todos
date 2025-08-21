import type { HonoRequest } from 'hono';
import kleur from 'kleur';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export function listAllProps(obj: any): string[] {
    const props = new Set<string>();

    let current = obj;
    while (current) {
        Object.getOwnPropertyNames(current).forEach((p) => props.add(p));
        current = Object.getPrototypeOf(current);
    }

    return Array.from(props);
}

function formatMessage(level: LogLevel, message: string, context?: string, data?: unknown): string {
    const time = new Date().toISOString();
    let prefix = `[${time}] [${level}]`;
    if (context) prefix += ` [${context}]`;
    const base = `${prefix} ${message}`;

    if (data !== undefined) {
        const dataFormatted = `\n→ ${JSON.stringify(data, null, 4)}`;
        const fullMessage = `${base}${dataFormatted}`;
        return applyColor(level, fullMessage);
    }

    return applyColor(level, base);
}

function applyColor(level: LogLevel, msg: string): string {
    switch (level) {
        case 'INFO':
            return kleur.cyan(msg);
        case 'WARN':
            return kleur.yellow(msg);
        case 'ERROR':
            return kleur.red().bold(msg);
        case 'DEBUG':
            return kleur.magenta(msg);
        default:
            return msg;
    }
}

export const logger = {
    info: (msg: string, context?: string, data?: unknown) =>
        console.log(formatMessage('INFO', msg, context, data)),

    warn: (msg: string, context?: string, data?: unknown) =>
        console.warn(formatMessage('WARN', msg, context, data)),

    error: (msg: string, context?: string, data?: unknown) =>
        console.error(formatMessage('ERROR', msg, context, data)),

    debug: (msg: string, context?: string, data?: unknown) =>
        console.debug(formatMessage('DEBUG', msg, context, data)),
};

export async function logRequest(request: HonoRequest) {
    const timestamp = new Date();
    const time = kleur.gray(`[${timestamp.toISOString()}]`);
    const methodColor = kleur.bold().cyan(request.method.padEnd(6));
    const pathColor = kleur.white(request.url);

    // Header principal
    console.log(`${time} ${kleur.bgCyan().black(' REQUEST ')} ${methodColor} ${pathColor}`);

    // IP et User-Agent si disponibles
    const details: string[] = [];
    const ip = request.header('x-forwarded-for') || request.header('x-real-ip') || 'unknown';
    const userAgent = request.header('user-agent');

    if (ip && ip !== 'unknown') details.push(kleur.yellow(`IP: ${ip}`));
    if (userAgent) {
        details.push(
            kleur.yellow(`UA: ${userAgent.substring(0, 50)}${userAgent.length > 50 ? '...' : ''}`),
        );
    }

    if (details.length > 0) {
        console.log(`${kleur.gray('  ├─')} ${details.join(kleur.gray(' | '))}`);
    }

    // Query parameters si présents
    const queryParams = request.queries();
    if (queryParams && Object.keys(queryParams).length > 0) {
        console.log(
            `${kleur.gray('  ├─')} ${kleur.blue('Query:')} ${kleur.white().italic(JSON.stringify(queryParams))}`,
        );
    }

    // Headers si présents
    const headers = request.header();
    if (headers && Object.keys(headers).length > 0) {
        console.log(`${kleur.gray('  ├─')} ${kleur.magenta('Headers:')}`);
        Object.entries(headers).forEach(([key, value], index, array) => {
            const isLast = index === array.length - 1;
            const prefix = isLast ? '  └─' : '  ├─';
            console.log(
                `${kleur.gray(prefix)}   ${kleur.dim(key)}: ${kleur.white().italic(value)}`,
            );
        });
    }

    // Body si présent (pour les méthodes POST, PUT, PATCH, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const hasOtherData =
            Object.keys(queryParams || {}).length > 0 ||
            Object.keys(headers || {}).length > 0 ||
            details.length > 0;
        const prefix = hasOtherData ? '  └─' : '  ├─';

        try {
            const contentType = request.header('content-type');
            let body: any;

            if (contentType?.includes('application/json')) {
                body = await request.json();
            } else if (contentType?.includes('application/x-www-form-urlencoded')) {
                body = await request.parseBody();
            } else if (contentType?.includes('text/')) {
                body = await request.text();
            } else {
                body = '[Binary data]';
            }

            if (body !== undefined && body !== '[Binary data]') {
                console.log(`${kleur.gray(prefix)} ${kleur.green('Body:')}`);
                const bodyStr = typeof body === 'string' ? body : JSON.stringify(body, null, 2);

                // Indenter le body pour une meilleure lisibilité
                const indentedBody = bodyStr
                    .split('\n')
                    .map((line) => `    ${line}`)
                    .join('\n');
                console.log(kleur.white().italic(indentedBody));
            } else if (body === '[Binary data]') {
                console.log(
                    `${kleur.gray(prefix)} ${kleur.green('Body:')} ${kleur.dim('[Binary data]')}`,
                );
            }
        } catch (error) {
            console.log(`${kleur.gray(prefix)} ${kleur.green('Body:')}`);
            console.log(kleur.red(`    Erreur lors de la lecture du body: ${error}`));
        }
    }

    // Ligne de séparation pour délimiter les requêtes
    console.log(kleur.gray('─'.repeat(process.stdout.columns)));
}

export function logResponse(status: number, result?: unknown) {
    const statusColor = getStatusColor(status);
    const statusLabel =
        status >= 400 ? kleur.bgRed().black(' RESPONSE ') : kleur.bgGreen().black(' RESPONSE ');

    const time = kleur.gray(`[${new Date().toISOString()}]`);
    console.log(kleur.gray('─'.repeat(process.stdout.columns)));
    console.log(`${time} ${statusLabel} ${statusColor(status.toString())}\n`);

    if (result !== undefined && status <= 399) {
        console.log(kleur.gray('→ Response data:'));
        console.log(kleur.white().italic(JSON.stringify(result, null, 2)));
    } else if (result !== undefined && status >= 400) {
        console.log(kleur.red('→ Response data:'));
        console.log(kleur.red().italic(JSON.stringify(result, null, 2)));
    }

    console.log(kleur.gray('─'.repeat(process.stdout.columns)));
}

// Personalized color in function of HTTP code
function getStatusColor(status: number) {
    if (status >= 500) return kleur.red().bold;
    if (status >= 400) return kleur.yellow().bold;
    if (status >= 300) return kleur.magenta;
    if (status >= 200) return kleur.green;
    return kleur.white;
}
