/**
 * src/ai/api/common/monitoring/LogService.ts
 * @file LogService.ts
 * @description
 * Service de journalisation pour l'application
 * Utilisé pour la journalisation des événements, des erreurs et des informations
 * dans l'application
 * Centralisation de la journalisation pour une meilleure gestion des logs
 * Utilisé pour la gestion des logs dans l'application
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    CRITICAL = 'critical'
}

export interface LogMessage {
    message: string;
    level: LogLevel;
    timestamp: Date;
    source: string;
    context?: Record<string, unknown> | undefined;
    error?: Error | undefined;
}

export class Logger {
    private readonly source: string;
    private static globalMinLevel: LogLevel = LogLevel.INFO;
    private static logHandlers: ((message: LogMessage) => void)[] = [];

    /**
     * Crée une nouvelle instance de Logger
     * @param source Source des logs (nom du module, service, etc.)
     */
    constructor(source: string) {
        this.source = source;
    }

    /**
     * Log un message de niveau debug
     */
    public debug(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    /**
     * Log un message de niveau info
     */
    public info(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context);
    }

    /**
     * Log un message de niveau warn
     */
    public warn(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, context);
    }

    /**
     * Log un message de niveau error
     */
    public error(message: string, error?: unknown, context?: Record<string, unknown>): void {
        let errorObj: Error | undefined;

        if (error instanceof Error) {
            errorObj = error;
        } else if (error !== undefined && error !== null) {
            errorObj = new Error(String(error));
        }

        this.log(LogLevel.ERROR, message, context, errorObj);
    }

    /**
     * Log un message de niveau critical
     */
    public critical(message: string, error?: unknown, context?: Record<string, unknown>): void {
        let errorObj: Error | undefined;

        if (error instanceof Error) {
            errorObj = error;
        } else if (error !== undefined && error !== null) {
            errorObj = new Error(String(error));
        }

        this.log(LogLevel.CRITICAL, message, context, errorObj);
    }

    /**
     * Log un message avec le niveau spécifié
     */
    private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
        // Vérifier si le niveau est suffisant pour être journalisé
        if (!this.shouldLog(level)) {
            return;
        }

        const logMessage: LogMessage = {
            message,
            level,
            timestamp: new Date(),
            source: this.source,
            context,
            error
        };

        // Envoyer le message à tous les handlers
        this.dispatchLogMessage(logMessage);

        // Afficher dans la console en développement
        this.logToConsole(logMessage);
    }

    /**
     * Vérifie si un niveau de log doit être journalisé
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = Object.values(LogLevel);
        const minLevelIndex = levels.indexOf(Logger.globalMinLevel);
        const currentLevelIndex = levels.indexOf(level);

        return currentLevelIndex >= minLevelIndex;
    }

    /**
     * Dispatch le message à tous les handlers
     */
    private dispatchLogMessage(message: LogMessage): void {
        for (const handler of Logger.logHandlers) {
            try {
                handler(message);
            } catch (error) {
                // Éviter de planter si un handler échoue
                console.error('Log handler error:', error);
            }
        }
    }

    /**
     * Log le message dans la console
     */
    private logToConsole(message: LogMessage): void {
        const timestamp = message.timestamp.toISOString();
        const prefix = `[${timestamp}] [${message.level}] [${message.source}]`;

        switch (message.level) {
            case LogLevel.DEBUG:
                console.debug(`${prefix} ${message.message}`, message.context || '');
                break;
            case LogLevel.INFO:
                console.info(`${prefix} ${message.message}`, message.context || '');
                break;
            case LogLevel.WARN:
                console.warn(`${prefix} ${message.message}`, message.context || '');
                break;
            case LogLevel.ERROR:
            case LogLevel.CRITICAL:
                console.error(
                    `${prefix} ${message.message}`,
                    message.error ? { error: message.error, ...message.context } : message.context || ''
                );
                break;
        }
    }

    /**
     * Configure le niveau minimal de log pour tous les loggers
     */
    public static setGlobalMinLevel(level: LogLevel): void {
        Logger.globalMinLevel = level;
    }

    /**
     * Ajoute un handler pour traiter les messages de log
     */
    public static addLogHandler(handler: (message: LogMessage) => void): void {
        Logger.logHandlers.push(handler);
    }

    /**
     * Supprime un handler de log
     */
    public static removeLogHandler(handler: (message: LogMessage) => void): void {
        const index = Logger.logHandlers.indexOf(handler);
        if (index !== -1) {
            Logger.logHandlers.splice(index, 1);
        }
    }
}

/**
 * Compatibility layer for LogService
 * 
 * Provides logging capabilities via the Logger class but with LogService interface
 */
export interface LogMetadata {
    [key: string]: string | number | boolean | null | undefined;
}

export class LogService {
    private logger: Logger;
    private minimumLevel: LogLevel;

    /**
     * Creates a new log service
     * @param serviceName Name of the service using the logger
     * @param minimumLevel Minimum log level to output
     */
    constructor(serviceName: string, minimumLevel: LogLevel = LogLevel.INFO) {
        this.logger = new Logger(serviceName);
        this.minimumLevel = minimumLevel;
    }

    /**
     * Log a debug message
     * @param message Message to log
     * @param metadata Optional metadata to include
     */
    public debug(message: string, metadata?: LogMetadata): void {
        this.logger.debug(message, metadata);
    }

    /**
     * Log an info message
     * @param message Message to log
     * @param metadata Optional metadata to include
     */
    public info(message: string, metadata?: LogMetadata): void {
        this.logger.info(message, metadata);
    }

    /**
     * Log a warning message
     * @param message Message to log
     * @param metadata Optional metadata to include
     */
    public warn(message: string, metadata?: LogMetadata): void {
        this.logger.warn(message, metadata);
    }

    /**
     * Log an error message
     * @param message Message to log
     * @param metadata Optional metadata to include
     */
    public error(message: string, metadata?: LogMetadata): void {
        // Extract error from metadata if present
        const error = metadata?.error;
        const cleanMetadata = { ...metadata };

        if (error) {
            delete cleanMetadata.error;
        }

        this.logger.error(message, error, cleanMetadata);
    }

    /**
     * Log a critical message
     * @param message Message to log
     * @param metadata Optional metadata to include
     */
    public critical(message: string, metadata?: LogMetadata): void {
        // Extract error from metadata if present
        const error = metadata?.error;
        const cleanMetadata = { ...metadata };

        if (error) {
            delete cleanMetadata.error;
        }

        this.logger.critical(message, error, cleanMetadata);
    }

    /**
     * Sets the minimum log level
     * @param level New minimum log level
     */
    public setMinimumLevel(level: LogLevel): void {
        this.minimumLevel = level;
    }
}