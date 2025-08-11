// src/ai/types/logger.ts
/**
 * Interface commune pour les loggers du système
 */
export interface Logger {
    /**
     * Log des informations
     */
    info(message: string, context?: Record<string, unknown>): void;

    /**
     * Log des erreurs
     */
    error(message: string, context?: Record<string, unknown>): void;

    /**
     * Log des avertissements
     */
    warn(message: string, context?: Record<string, unknown>): void;

    /**
     * Log de débogage
     */
    debug(message: string, context?: Record<string, unknown>): void;
}