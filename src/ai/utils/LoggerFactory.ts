// src/ai/utils/LoggerFactory.ts

/**
 * Interface simple pour le logger
 */
export interface ILogger {
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
}

/**
 * Factory pour créer des instances de logger
 */
export class LoggerFactory {
    private static loggers: Map<string, ILogger> = new Map();

    /**
     * Crée ou retourne une instance de logger pour un composant donné
     * 
     * @param component - Le nom du composant utilisant le logger
     * @returns Une instance de logger
     */
    public static getLogger(component: string): ILogger {
        if (!this.loggers.has(component)) {
            this.loggers.set(component, new Logger(component));
        }
        return this.loggers.get(component)!;
    }
}

/**
 * Implémentation simple d'un logger
 */
class Logger implements ILogger {
    constructor(private component: string) { }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log('DEBUG', message, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log('INFO', message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log('WARN', message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.log('ERROR', message, context);
    }

    private log(level: string, message: string, context?: Record<string, unknown>): void {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
        console.log(`[${timestamp}] [${level}] [${this.component}] ${message}${contextStr}`);
    }
}