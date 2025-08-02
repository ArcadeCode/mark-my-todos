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

export function logRequest(method: string, path: string, body?: unknown) {
    const time = kleur.gray(`[${new Date().toISOString()}]`);
    const methodColor = kleur.bold().cyan(method.padEnd(6));
    const pathColor = kleur.white(path);
    console.log(`${time} ${kleur.bgCyan().black(' REQUEST ')} ${methodColor} ${pathColor}`);

    if (body !== undefined) {
        console.log(kleur.gray('→ Body:'));
        console.log(kleur.white().italic(JSON.stringify(body, null, 2)));
    }
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
