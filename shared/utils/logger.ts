import { HonoRequest } from 'hono';
import kleur from 'kleur';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function formatMessage(level: LogLevel, message: string, context?: string, data?: unknown): string {
    const time = new Date().toISOString();
    let prefix = `[${time}] [${level}]`;
    if (context) prefix += ` [${context}]`;

    const base = `${prefix} ${message}`;
    const formatted = applyColor(level, base);

    if (data !== undefined) {
        return `${formatted}\n${kleur.gray('→')} ${kleur.white().italic(JSON.stringify(data, null, 2))}`;
    }
    return formatted;
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

    // Body si présent (pour les méthodes POST, PUT, PATCH)
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
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
    console.log(kleur.gray('─'.repeat(80)));
}

export function logResponse(status: number, result?: unknown) {
    const statusColor = getStatusColor(status);
    const statusLabel =
        status >= 400 ? kleur.bgRed().black(' RESPONSE ') : kleur.bgGreen().black(' RESPONSE ');

    const time = kleur.gray(`[${new Date().toISOString()}]`);
    console.log(`${time} ${statusLabel} ${statusColor(status.toString())}\n`);

    if (result !== undefined) {
        console.log(kleur.gray('→ Data:'));
        console.log(kleur.white().italic(JSON.stringify(result, null, 2)));
        console.log();
    }
}

// Personalized color in function of HTTP code
function getStatusColor(status: number) {
    if (status >= 500) return kleur.red().bold;
    if (status >= 400) return kleur.yellow().bold;
    if (status >= 300) return kleur.magenta;
    if (status >= 200) return kleur.green;
    return kleur.white;
}
