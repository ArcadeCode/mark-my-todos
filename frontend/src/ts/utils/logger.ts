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
