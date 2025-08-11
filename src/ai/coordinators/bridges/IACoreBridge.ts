// src/ai/api/common/monitoring/LogService.ts

/**
 * Niveaux de journalisation
 */
export enum LogLevel {
    TRACE = 'trace',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
    NONE = 'none'
}

/**
 * Options de configuration du service de journalisation
 */
export interface LogServiceOptions {
    /** Niveau de journalisation minimal */
    minLevel?: LogLevel;

    /** Horodatage des messages */
    timestamp?: boolean;

    /** Inclure le nom du composant dans les messages */
    includeComponent?: boolean;

    /** Fonction personnalisée d'écriture des logs */
    logWriter?: (level: LogLevel, message: string, meta?: Record<string, unknown>) => void;

    /** Contexte global ajouté à tous les logs */
    globalContext?: Record<string, unknown>;

    /** Mode silencieux pour les tests */
    silent?: boolean;

    /** Format de sortie (default = colored) */
    format?: 'colored' | 'plain' | 'json';
}

/**
 * Service de journalisation amélioré pour les composants du système LSF
 */
export class LogService {
    private componentName: string;
    private options: LogServiceOptions;
    private localContext: Record<string, unknown> = {};

    /**
     * Table de correspondance entre les niveaux de log et leur poids
     */
    private static readonly LOG_LEVELS_WEIGHT: Record<LogLevel, number> = {
        [LogLevel.TRACE]: 0,
        [LogLevel.DEBUG]: 1,
        [LogLevel.INFO]: 2,
        [LogLevel.WARN]: 3,
        [LogLevel.ERROR]: 4,
        [LogLevel.FATAL]: 5,
        [LogLevel.NONE]: 6
    };

    /**
     * Crée une nouvelle instance du service de journalisation
     * @param componentName Nom du composant associé
     * @param options Options de configuration
     */
    constructor(componentName: string, options: LogServiceOptions = {}) {
        this.componentName = componentName;

        // Options par défaut
        this.options = {
            minLevel: LogLevel.INFO,
            timestamp: true,
            includeComponent: true,
            format: 'colored',
            silent: false,
            globalContext: {},
            ...options
        };
    }

    /**
     * Journalise un message de niveau TRACE
     * @param message Message à journaliser
     * @param meta Métadonnées additionnelles
     */
    public trace(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.TRACE, message, meta);
    }

    /**
     * Journalise un message de niveau DEBUG
     * @param message Message à journaliser
     * @param meta Métadonnées additionnelles
     */
    public debug(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, meta);
    }

    /**
     * Journalise un message de niveau INFO
     * @param message Message à journaliser
     * @param meta Métadonnées additionnelles
     */
    public info(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, meta);
    }

    /**
     * Journalise un message de niveau WARN
     * @param message Message à journaliser
     * @param meta Métadonnées additionnelles
     */
    public warn(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, meta);
    }

    /**
     * Journalise un message de niveau ERROR
     * @param message Message à journaliser
     * @param meta Métadonnées additionnelles
     */
    public error(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, meta);
    }

    /**
     * Journalise un message de niveau FATAL
     * @param message Message à journaliser
     * @param meta Métadonnées additionnelles
     */
    public fatal(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.FATAL, message, meta);
    }

    /**
     * Journalise un message avec le niveau spécifié
     * @param level Niveau de journalisation
     * @param message Message à journaliser
     * @param meta Métadonnées additionnelles
     */
    private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
        // Vérifier si le niveau est suffisant et que le mode silencieux n'est pas activé
        if (!this.shouldLog(level) || this.options.silent) {
            return;
        }

        // Construire le message complet
        let formattedMessage = message;

        // Ajouter l'horodatage si nécessaire
        if (this.options.timestamp) {
            const timestamp = new Date().toISOString();
            formattedMessage = `[${timestamp}] ${formattedMessage}`;
        }

        // Ajouter le nom du composant si nécessaire
        if (this.options.includeComponent) {
            formattedMessage = `[${this.componentName}] ${formattedMessage}`;
        }

        // Ajouter le niveau
        formattedMessage = `[${level.toUpperCase()}] ${formattedMessage}`;

        // Fusionner les métadonnées
        const mergedMeta = this.mergeMetadata(meta);

        // Utiliser la fonction d'écriture personnalisée ou la console
        if (this.options.logWriter) {
            this.options.logWriter(level, formattedMessage, mergedMeta);
        } else {
            this.writeToConsole(level, formattedMessage, mergedMeta);
        }
    }

    /**
     * Fusionne les métadonnées locales, globales et celles spécifiques au message
     * @param meta Métadonnées spécifiques au message
     * @returns Métadonnées fusionnées
     */
    private mergeMetadata(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
        if (!meta && Object.keys(this.localContext).length === 0 &&
            (!this.options.globalContext || Object.keys(this.options.globalContext).length === 0)) {
            return undefined;
        }

        return {
            ...this.options.globalContext,
            ...this.localContext,
            ...meta
        };
    }

    /**
     * Vérifie si un message du niveau spécifié doit être journalisé
     * @param level Niveau à vérifier
     * @returns true si le niveau doit être journalisé
     */
    private shouldLog(level: LogLevel): boolean {
        const minLevelWeight = LogService.LOG_LEVELS_WEIGHT[this.options.minLevel!];
        const currentLevelWeight = LogService.LOG_LEVELS_WEIGHT[level];

        return currentLevelWeight >= minLevelWeight;
    }

    /**
     * Écrit un message dans la console
     * @param level Niveau de journalisation
     * @param message Message à écrire
     * @param meta Métadonnées additionnelles
     */
    private writeToConsole(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
        // Détermine si on doit utiliser la coloration
        const useColor = this.options.format === 'colored';

        let coloredMessage = message;

        // Appliquer la coloration si nécessaire
        if (useColor) {
            switch (level) {
                case LogLevel.TRACE:
                    coloredMessage = `\x1b[90m${message}\x1b[0m`; // Gris
                    break;
                case LogLevel.DEBUG:
                    coloredMessage = `\x1b[36m${message}\x1b[0m`; // Cyan
                    break;
                case LogLevel.INFO:
                    coloredMessage = `\x1b[32m${message}\x1b[0m`; // Vert
                    break;
                case LogLevel.WARN:
                    coloredMessage = `\x1b[33m${message}\x1b[0m`; // Jaune
                    break;
                case LogLevel.ERROR:
                    coloredMessage = `\x1b[31m${message}\x1b[0m`; // Rouge
                    break;
                case LogLevel.FATAL:
                    coloredMessage = `\x1b[35m${message}\x1b[0m`; // Magenta
                    break;
            }
        }

        // Si le format est JSON, formatter le message en JSON
        if (this.options.format === 'json') {
            const jsonLog = JSON.stringify({
                timestamp: new Date().toISOString(),
                level: level.toUpperCase(),
                component: this.componentName,
                message,
                ...meta
            });

            console.log(jsonLog);
            return;
        }

        // Écrire dans la console appropriée
        switch (level) {
            case LogLevel.TRACE:
            case LogLevel.DEBUG:
                console.debug(coloredMessage, meta || '');
                break;

            case LogLevel.INFO:
                console.info(coloredMessage, meta || '');
                break;

            case LogLevel.WARN:
                console.warn(coloredMessage, meta || '');
                break;

            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(coloredMessage, meta || '');
                break;
        }
    }

    /**
     * Change le niveau minimal de journalisation
     * @param level Nouveau niveau minimal
     */
    public setMinLevel(level: LogLevel): void {
        this.options.minLevel = level;
    }

    /**
     * Configure une fonction d'écriture personnalisée
     * @param writer Fonction d'écriture
     */
    public setLogWriter(writer: (level: LogLevel, message: string, meta?: Record<string, unknown>) => void): void {
        this.options.logWriter = writer;
    }

    /**
     * Ajoute un contexte local pour ce logger
     * @param context Contexte à ajouter
     */
    public setContext(context: Record<string, unknown>): void {
        this.localContext = { ...context };
    }

    /**
     * Étend le contexte local existant
     * @param context Contexte additionnel
     */
    public extendContext(context: Record<string, unknown>): void {
        this.localContext = { ...this.localContext, ...context };
    }

    /**
     * Crée un nouveau logger avec le même contexte
     * @param componentName Nom du nouveau composant
     * @returns Nouveau logger
     */
    public createChildLogger(componentName: string): LogService {
        return new LogService(componentName, {
            ...this.options,
            globalContext: { ...this.options.globalContext, parentComponent: this.componentName }
        });
    }

    /**
     * Active ou désactive le mode silencieux
     * @param silent true pour activer le mode silencieux
     */
    public setSilent(silent: boolean): void {
        this.options.silent = silent;
    }

    /**
     * Change le format de sortie
     * @param format Format de sortie
     */
    public setFormat(format: 'colored' | 'plain' | 'json'): void {
        this.options.format = format;
    }
}