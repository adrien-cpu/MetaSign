/**
 * @file src/ai/services/learning/utils/logger.ts
 * @description Logger personnalisé pour le système d'apprentissage avec fallback
 * et configuration flexible pour différents environnements.
 * 
 * Fonctionnalités :
 * - 📝 Logging configurable avec niveaux multiples
 * - 🔧 Compatible exactOptionalPropertyTypes: true
 * - 🔄 Fallback automatique vers console
 * - 🌟 Support logger externe avec LoggerFactory
 * - ⚙️ Configuration dynamique et modes silencieux/verbose
 * 
 * @module utils
 * @version 1.0.0 - Logger révolutionnaire
 * @since 2025
 * @author MetaSign Team - Learning Logger
 * @lastModified 2025-07-05
 */

/**
 * Type pour nos niveaux de logs
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Type pour environnements d'exécution
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Interface pour un logger externe
 */
export interface Logger {
    readonly debug?: (message: string, context?: Record<string, unknown>) => void;
    readonly info?: (message: string, context?: Record<string, unknown>) => void;
    readonly warn?: (message: string, context?: Record<string, unknown>) => void;
    readonly error?: (message: string, error?: unknown) => void;
}

/**
 * Configuration du logger
 */
export interface LearningLoggerConfig {
    /** Préfixe pour tous les messages */
    readonly prefix: string;
    /** Niveaux de log activés */
    readonly enabledLevels: readonly LogLevel[];
    /** Utiliser les timestamps */
    readonly useTimestamps: boolean;
    /** Formater les erreurs */
    readonly formatError: (error: unknown) => unknown;
    /** Environnement d'exécution */
    readonly environment: Environment;
}

/**
 * Interface pour erreur formatée
 */
interface FormattedError {
    readonly message: string;
    readonly stack?: string;
    readonly name: string;
    readonly [key: string]: unknown;
}

/**
 * Configuration par défaut
 */
const defaultConfig: LearningLoggerConfig = {
    prefix: '[Learning System]',
    enabledLevels: ['debug', 'info', 'warn', 'error'] as const,
    useTimestamps: true,
    environment: 'development',
    formatError: (error: unknown): FormattedError | unknown => {
        if (error instanceof Error) {
            return {
                message: error.message,
                stack: error.stack,
                name: error.name
            } as const;
        }
        return error;
    }
} as const;

/**
 * Logger externe (optionnel)
 */
let externalLogger: Partial<Logger> = {};

/**
 * Tentative d'initialisation du logger externe de manière asynchrone
 * 
 * @function initializeExternalLogger
 * @returns {Promise<void>} Promise qui se résout une fois l'initialisation terminée
 * @private
 */
async function initializeExternalLogger(): Promise<void> {
    try {
        // Essayer d'importer le LoggerFactory du projet MetaSign
        const loggerModule = await import('@/ai/utils/LoggerFactory').catch(() => null);

        if (loggerModule?.LoggerFactory) {
            // Créer une instance du logger externe
            const factoryLogger = loggerModule.LoggerFactory.getLogger('LearningSystem');

            if (factoryLogger && typeof factoryLogger === 'object') {
                externalLogger = factoryLogger as Partial<Logger>;
                console.debug('LearningLogger: External LoggerFactory loaded successfully');
            }
        } else if (loggerModule && 'info' in loggerModule && typeof loggerModule.info === 'function') {
            // Fallback si le module a une interface différente
            externalLogger = loggerModule as Partial<Logger>;
            console.debug('LearningLogger: External logger loaded successfully');
        }
    } catch {
        // Logger externe non disponible, utiliser console en fallback
        console.debug('LearningLogger: Using console fallback - external logger not available');
    }
}

/**
 * Initialisation automatique du logger externe
 */
(async (): Promise<void> => {
    await initializeExternalLogger();
})();

/**
 * @class LearningLoggerClass
 * @description Logger personnalisé avec support de configuration dynamique
 * et fallback vers console si le logger externe n'est pas disponible.
 * 
 * @example
 * ```typescript
 * const logger = new LearningLoggerClass({
 *   prefix: '[Custom System]',
 *   enabledLevels: ['info', 'warn', 'error'],
 *   environment: 'production'
 * });
 * 
 * logger.info('System started', { version: '1.0.0' });
 * logger.error('Database connection failed', dbError);
 * 
 * // Créer un logger enfant
 * const childLogger = logger.createChild('Database');
 * childLogger.warn('Connection timeout');
 * ```
 */
export class LearningLoggerClass {
    /**
     * Configuration du logger
     * @private
     */
    private config: LearningLoggerConfig;

    /**
     * Initialise le logger avec la configuration donnée
     * 
     * @param {Partial<LearningLoggerConfig>} config - Configuration partielle du logger
     */
    constructor(config: Partial<LearningLoggerConfig> = {}) {
        this.config = {
            ...defaultConfig,
            ...config,
            // Ensure enabledLevels is always an array for proper merging
            enabledLevels: config.enabledLevels
                ? [...config.enabledLevels]
                : [...defaultConfig.enabledLevels]
        };
    }

    /**
     * Formate un message avec préfixe et timestamp
     * 
     * @method formatMessage
     * @param {string} message - Message à formater
     * @returns {string} Message formaté
     * @private
     */
    private formatMessage(message: string): string {
        const timestamp = this.config.useTimestamps
            ? `[${new Date().toISOString()}] `
            : '';
        return `${timestamp}${this.config.prefix} ${message}`;
    }

    /**
     * Vérifie si une fonction de logging existe et est valide
     * 
     * @method isValidLogFunction
     * @param {unknown} fn - Fonction à vérifier
     * @returns {boolean} True si la fonction est valide
     * @private
     */
    private isValidLogFunction(fn: unknown): fn is (message: string, context?: Record<string, unknown>) => void {
        return typeof fn === 'function';
    }

    /**
     * Méthode générique de logging
     * 
     * @method log
     * @param {LogLevel} level - Niveau de log
     * @param {string} message - Message à logger
     * @param {unknown} contextOrError - Contexte ou erreur associée
     * @private
     */
    private log(level: LogLevel, message: string, contextOrError?: unknown): void {
        // Vérifier si le niveau est activé
        if (!this.config.enabledLevels.includes(level)) {
            return;
        }

        const formattedMessage = this.formatMessage(message);

        // Traitement spécifique pour les erreurs
        const context = level === 'error' && contextOrError !== undefined
            ? { error: this.config.formatError(contextOrError) }
            : contextOrError as Record<string, unknown> | undefined;

        // Utiliser le logger externe si disponible, sinon console
        const externalLogFn = externalLogger[level];

        if (this.isValidLogFunction(externalLogFn)) {
            try {
                externalLogFn(formattedMessage, context);
            } catch (logError) {
                // Fallback vers console si le logger externe échoue
                this.fallbackToConsole(level, formattedMessage, context);

                // Log de l'erreur du logger externe en mode debug
                if (this.config.environment === 'development') {
                    console.debug('LearningLogger: External logger failed', logError);
                }
            }
        } else {
            this.fallbackToConsole(level, formattedMessage, context);
        }
    }

    /**
     * Fallback vers console en cas d'échec du logger externe
     * 
     * @method fallbackToConsole
     * @param {LogLevel} level - Niveau de log
     * @param {string} message - Message formaté
     * @param {unknown} context - Contexte
     * @private
     */
    private fallbackToConsole(level: LogLevel, message: string, context?: unknown): void {
        const consoleMethod = console[level] || console.log;

        if (context !== undefined) {
            consoleMethod(`[${level.toUpperCase()}] ${message}`, context);
        } else {
            consoleMethod(`[${level.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Log d'information
     * 
     * @method info
     * @param {string} message - Message à logger
     * @param {Record<string, unknown>} context - Contexte optionnel
     * @public
     */
    public info(message: string, context?: Record<string, unknown>): void {
        this.log('info', message, context);
    }

    /**
     * Log d'erreur
     * 
     * @method error
     * @param {string} message - Message d'erreur
     * @param {unknown} error - Erreur associée
     * @public
     */
    public error(message: string, error?: unknown): void {
        this.log('error', message, error);
    }

    /**
     * Log d'avertissement
     * 
     * @method warn
     * @param {string} message - Message d'avertissement
     * @param {Record<string, unknown>} context - Contexte optionnel
     * @public
     */
    public warn(message: string, context?: Record<string, unknown>): void {
        this.log('warn', message, context);
    }

    /**
     * Log de débogage
     * 
     * @method debug
     * @param {string} message - Message de débogage
     * @param {Record<string, unknown>} context - Contexte optionnel
     * @public
     */
    public debug(message: string, context?: Record<string, unknown>): void {
        this.log('debug', message, context);
    }

    /**
     * Configuration dynamique du logger
     * 
     * @method configure
     * @param {Partial<LearningLoggerConfig>} newConfig - Nouvelle configuration partielle
     * @public
     */
    public configure(newConfig: Partial<LearningLoggerConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig,
            // Ensure proper array handling for enabledLevels
            enabledLevels: newConfig.enabledLevels
                ? [...newConfig.enabledLevels]
                : this.config.enabledLevels
        };
    }

    /**
     * Active ou désactive un niveau de log
     * 
     * @method setLogLevel
     * @param {LogLevel} level - Niveau de log
     * @param {boolean} enabled - Activer ou désactiver
     * @public
     */
    public setLogLevel(level: LogLevel, enabled: boolean): void {
        const currentLevels = [...this.config.enabledLevels];

        if (enabled && !currentLevels.includes(level)) {
            currentLevels.push(level);
        } else if (!enabled) {
            const index = currentLevels.indexOf(level);
            if (index > -1) {
                currentLevels.splice(index, 1);
            }
        }

        this.config = {
            ...this.config,
            enabledLevels: currentLevels
        };
    }

    /**
     * Désactive tous les logs (mode silencieux)
     * 
     * @method enableSilentMode
     * @public
     */
    public enableSilentMode(): void {
        this.config = {
            ...this.config,
            enabledLevels: []
        };
    }

    /**
     * Active tous les logs
     * 
     * @method enableVerboseMode
     * @public
     */
    public enableVerboseMode(): void {
        this.config = {
            ...this.config,
            enabledLevels: ['debug', 'info', 'warn', 'error']
        };
    }

    /**
     * Récupère la configuration actuelle
     * 
     * @method getConfig
     * @returns {LearningLoggerConfig} Configuration actuelle du logger
     * @public
     */
    public getConfig(): LearningLoggerConfig {
        return {
            ...this.config,
            enabledLevels: [...this.config.enabledLevels]
        };
    }

    /**
     * Vérifie si un niveau de log est activé
     * 
     * @method isLevelEnabled
     * @param {LogLevel} level - Niveau à vérifier
     * @returns {boolean} true si le niveau est activé
     * @public
     */
    public isLevelEnabled(level: LogLevel): boolean {
        return this.config.enabledLevels.includes(level);
    }

    /**
     * Crée un logger enfant avec un préfixe personnalisé
     * 
     * @method createChild
     * @param {string} childPrefix - Préfixe du logger enfant
     * @returns {LearningLoggerClass} Nouveau logger avec le préfixe étendu
     * @public
     */
    public createChild(childPrefix: string): LearningLoggerClass {
        return new LearningLoggerClass({
            ...this.config,
            prefix: `${this.config.prefix}[${childPrefix}]`
        });
    }

    /**
     * Obtient les statistiques d'utilisation du logger
     * 
     * @method getStats
     * @returns {object} Statistiques du logger
     * @public
     */
    public getStats(): {
        readonly hasExternalLogger: boolean;
        readonly enabledLevelsCount: number;
        readonly environment: Environment;
        readonly useTimestamps: boolean;
    } {
        return {
            hasExternalLogger: Object.keys(externalLogger).length > 0,
            enabledLevelsCount: this.config.enabledLevels.length,
            environment: this.config.environment,
            useTimestamps: this.config.useTimestamps
        } as const;
    }

    /**
     * Force la reconnexion au logger externe
     * 
     * @method reconnectExternalLogger
     * @returns {Promise<boolean>} True si la reconnexion réussit
     * @public
     */
    public async reconnectExternalLogger(): Promise<boolean> {
        try {
            await initializeExternalLogger();
            return Object.keys(externalLogger).length > 0;
        } catch {
            return false;
        }
    }
}

/**
 * Instance singleton du logger
 */
export const LearningLogger = new LearningLoggerClass();

/**
 * Factory function pour créer des loggers personnalisés
 * 
 * @function createLearningLogger
 * @param {Partial<LearningLoggerConfig>} config - Configuration du logger
 * @returns {LearningLoggerClass} Instance de logger configurée
 * @public
 */
export function createLearningLogger(config: Partial<LearningLoggerConfig> = {}): LearningLoggerClass {
    return new LearningLoggerClass(config);
}

/**
 * Constantes utiles pour la configuration
 */
export const LOGGER_CONSTANTS = {
    /**
     * Configurations prédéfinies par environnement
     */
    PRESETS: {
        DEVELOPMENT: {
            environment: 'development' as const,
            enabledLevels: ['debug', 'info', 'warn', 'error'] as const,
            useTimestamps: true
        },
        PRODUCTION: {
            environment: 'production' as const,
            enabledLevels: ['info', 'warn', 'error'] as const,
            useTimestamps: true
        },
        TEST: {
            environment: 'test' as const,
            enabledLevels: ['error'] as const,
            useTimestamps: false
        },
        SILENT: {
            enabledLevels: [] as const,
            useTimestamps: false
        }
    },

    /**
     * Niveaux de log disponibles
     */
    LEVELS: ['debug', 'info', 'warn', 'error'] as const,

    /**
     * Environnements supportés
     */
    ENVIRONMENTS: ['development', 'production', 'test'] as const
} as const;