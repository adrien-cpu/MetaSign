/**
 * @file src/ai/utils/Logger.ts
 * 
 * Service de journalisation unifié pour l'application LSF.
 * Fournit des fonctionnalités de log avec niveau, formatage et support de métadonnées.
 * Ce fichier contient la classe principale Logger avec ses méthodes essentielles.
 */

import { LogLevel } from './logging/LogLevel';
import { LoggerOptions, LogOptions } from './logging/LoggerTypes';
import { LogMetricsManager } from './logging/LogMetricsManager';
import { LogFormatter } from './logging/LogFormatter';

/**
 * Classe utilitaire de logging
 * 
 * Fournit des méthodes pour logger des messages avec différents niveaux
 * de sévérité et support pour des métadonnées additionnelles.
 * Implémente le pattern Singleton avec support pour instances multiples.
 */
export class Logger {
    private readonly moduleName!: string;
    private options!: LoggerOptions;
    private metricsManager!: LogMetricsManager;
    private formatter!: LogFormatter;

    private static instances = new Map<string, Logger>();
    private static globalOptions: LoggerOptions = {
        minLevel: LogLevel.INFO,
        includeTimestamp: true,
        includeModuleName: true,
        enableConsole: true,
        enableMetrics: true,
        redactSensitiveData: true,
        metricsBufferSize: 100
    };

    /**
     * Crée une nouvelle instance de Logger.
     * Note: Utilisez Logger.getInstance() au lieu de new Logger() pour obtenir une instance.
     * 
     * @param moduleName Nom du module pour identification dans les logs
     * @param options Options spécifiques à cette instance
     */
    constructor(moduleName: string = 'default', options: LoggerOptions = {}) {
        // Si une instance existe déjà pour ce module, renvoyer celle-ci
        if (Logger.instances.has(moduleName)) {
            // Avertissement pour éviter la création directe
            console.warn(`[Logger] Une instance pour le module "${moduleName}" existe déjà. Utilisez Logger.getInstance() pour une meilleure gestion des instances.`);

            // Pour garantir la rétrocompatibilité, renvoyer silencieusement l'instance existante
            const existingInstance = Logger.getInstance(moduleName, options);
            Object.assign(this, existingInstance);
            return;
        }

        // Sinon, créer une nouvelle instance
        this.moduleName = moduleName;
        this.options = {
            ...Logger.globalOptions,
            ...options
        };

        // Initialisation des dépendances
        this.metricsManager = new LogMetricsManager(this.options.metricsBufferSize || 100);
        this.formatter = new LogFormatter(this.moduleName, this.options);

        // Adapter le niveau de log selon l'environnement
        if (process.env.NODE_ENV === 'development') {
            this.options.minLevel = LogLevel.DEBUG;
        }

        // Enregistrer l'instance dans le registre global
        Logger.instances.set(moduleName, this);
    }

    /**
     * Obtient une instance du logger pour un module spécifique
     * @param moduleName Nom du module (optionnel)
     * @param options Options spécifiques (optionnel)
     * @returns Instance du logger
     */
    public static getInstance(moduleName: string = 'default', options?: LoggerOptions): Logger {
        // Chercher une instance existante pour ce module
        if (Logger.instances.has(moduleName)) {
            const instance = Logger.instances.get(moduleName);
            // Mettre à jour les options si fournies
            if (options && instance) {
                instance.configure(options);
            }
            return instance as Logger;
        }

        // Créer une nouvelle instance
        const newInstance = new Logger(moduleName, options);
        Logger.instances.set(moduleName, newInstance);
        return newInstance;
    }

    /**
     * Obtient une instance du logger pour un module spécifique (alias pour getInstance)
     * Cette méthode est fournie pour une meilleure compatibilité avec d'autres systèmes de logging
     * 
     * @param moduleName Nom du module (optionnel)
     * @param options Options spécifiques (optionnel)
     * @returns Instance du logger
     */
    public static getLogger(moduleName: string = 'default', options?: LoggerOptions): Logger {
        return Logger.getInstance(moduleName, options);
    }

    /**
     * Configure les options globales pour tous les loggers
     * @param options Options de configuration
     */
    public static setGlobalOptions(options: LoggerOptions): void {
        Logger.globalOptions = {
            ...Logger.globalOptions,
            ...options
        };

        // Mettre à jour toutes les instances existantes
        Logger.instances.forEach(instance => {
            instance.configure(options);
        });
    }

    /**
     * Définit le niveau de journalisation global
     * @param level - Niveau de journalisation global
     */
    public static setGlobalLevel(level: LogLevel): void {
        Logger.setGlobalOptions({ minLevel: level });
    }

    /**
     * Configure un formateur personnalisé
     * @param customFormatter - Formateur de logs à utiliser
     */
    public static setFormatter(customFormatter: LogFormatter): void {
        // Mettre à jour le formateur pour toutes les instances
        Logger.instances.forEach(instance => {
            instance.formatter = customFormatter;
        });
    }

    /**
     * Configure le logger
     * @param options Configuration partielle à appliquer
     */
    public configure(options: Partial<LoggerOptions>): void {
        this.options = { ...this.options, ...options };
        this.formatter.updateOptions(this.options);
    }

    /**
     * Définit le niveau de log minimum
     * @param level Niveau de log ou nom du niveau
     */
    public setLevel(level: LogLevel | string): void {
        if (typeof level === 'string') {
            const levelMap: Record<string, LogLevel> = {
                'debug': LogLevel.DEBUG,
                'info': LogLevel.INFO,
                'warn': LogLevel.WARN,
                'error': LogLevel.ERROR,
                'fatal': LogLevel.FATAL
            };
            this.options.minLevel = levelMap[level.toLowerCase()] ?? LogLevel.INFO;
        } else {
            this.options.minLevel = level;
        }
    }

    /**
     * Log un message de niveau DEBUG
     * @param message Message à logger
     * @param data Données additionnelles optionnelles
     */
    public debug(message: string, data?: unknown): void {
        this.log(LogLevel.DEBUG, message, { context: data });
    }

    /**
     * Log un message de niveau INFO
     * @param message Message à logger
     * @param data Données additionnelles optionnelles
     */
    public info(message: string, data?: unknown): void {
        this.log(LogLevel.INFO, message, { context: data });
    }

    /**
     * Log un message de niveau WARN
     * @param message Message à logger
     * @param data Données additionnelles optionnelles
     */
    public warn(message: string, data?: unknown): void {
        this.log(LogLevel.WARN, message, { context: data });
    }

    /**
     * Log un message de niveau ERROR
     * @param message Message à logger
     * @param data Données additionnelles optionnelles
     */
    public error(message: string, data?: unknown): void {
        this.log(LogLevel.ERROR, message, { context: data });
    }

    /**
     * Log un message de niveau FATAL
     * @param message Message à logger
     * @param data Données additionnelles optionnelles
     */
    public fatal(message: string, data?: unknown): void {
        this.log(LogLevel.FATAL, message, { context: data });
    }

    /**
     * Log un message avec tags
     * @param level Niveau de log
     * @param message Message à logger
     * @param tags Tags à associer au message
     * @param context Contexte optionnel
     */
    public logWithTags(level: LogLevel, message: string, tags: string[], context?: Record<string, unknown>): void {
        this.log(level, message, { context, tags });
    }

    /**
     * Log un message avec un ID de corrélation pour traçage
     * @param level Niveau de log
     * @param message Message à logger
     * @param correlationId ID de corrélation
     * @param context Contexte optionnel
     */
    public logWithCorrelation(level: LogLevel, message: string, correlationId: string, context?: Record<string, unknown>): void {
        this.log(level, message, { context, correlationId });
    }

    /**
     * Log des données sensibles (seront redactées si configuré)
     * @param level Niveau de log
     * @param message Message à logger
     * @param sensitiveData Données sensibles
     */
    public logSensitive(level: LogLevel, message: string, sensitiveData: Record<string, unknown>): void {
        this.log(level, message, { context: sensitiveData, sensitive: true });
    }

    /**
     * Méthode de journalisation principale
     * @param level Niveau de journalisation
     * @param message Message à journaliser
     * @param options Options de journalisation
     */
    private log(level: LogLevel, message: string, options: LogOptions = {}): void {
        // Vérifier si le niveau de log est suffisant
        if (!this.shouldLog(level)) {
            return;
        }

        // Préparer les données du log
        const timestamp = Date.now();
        const formattedMessage = this.formatter.formatMessage(level, message, timestamp, options);

        // Écrire dans la console si activé
        if (this.options.enableConsole) {
            this.writeToConsole(level, formattedMessage);
        }

        // Mettre à jour les métriques si activé
        if (this.options.enableMetrics) {
            this.metricsManager.updateMetrics(level, message, timestamp, options);
        }

        // Appeler le handler personnalisé si défini
        if (this.options.customHandler) {
            try {
                this.options.customHandler(level, this.moduleName, message, options.context);
            } catch (error) {
                console.error('Erreur dans le handler de log personnalisé', error);
            }
        }
    }

    /**
     * Détermine si un message doit être journalisé selon son niveau
     * @param level Niveau de journalisation
     * @returns true si le message doit être journalisé
     */
    private shouldLog(level: LogLevel): boolean {
        const minLevel = this.options.minLevel ?? LogLevel.INFO;
        return level >= minLevel;
    }

    /**
     * Écrit un message dans la console
     * @param level Niveau de journalisation
     * @param message Message à écrire
     */
    private writeToConsole(level: LogLevel, message: string): void {
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(message);
                break;
            case LogLevel.INFO:
                console.info(message);
                break;
            case LogLevel.WARN:
                console.warn(message);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(message);
                break;
        }
    }

    /**
     * Récupère les métriques de journalisation
     * @returns Métriques actuelles
     */
    public getMetrics(): Record<string, unknown> {
        // Conversion en Record<string, unknown> via unknown pour satisfaire TypeScript
        const metrics = this.metricsManager.getMetrics();
        return metrics as unknown as Record<string, unknown>;
    }

    /**
     * Réinitialise les métriques de journalisation
     */
    public resetMetrics(): void {
        this.metricsManager.resetMetrics();
    }

    /**
     * Obtient les statistiques de journalisation
     * @returns Statistiques sur les logs enregistrés
     */
    public static getLogStats(): Record<string, number> {
        // Compiler les statistiques de toutes les instances
        const stats: Record<string, number> = {
            totalInstances: Logger.instances.size,
            totalLogs: 0
        };

        // Interface pour typer les métriques tout en évitant l'utilisation de 'any'
        interface MetricsLike {
            totalLogs?: number;
            countByLevel?: Record<string, number>;
        }

        // Agréger les métriques de toutes les instances
        Logger.instances.forEach((instance) => {
            // Obtenir les métriques et les convertir en type compatible
            const metrics = instance.metricsManager.getMetrics() as unknown as MetricsLike;
            const totalLogs = metrics.totalLogs || 0;

            stats.totalLogs += totalLogs;

            // Agréger les compteurs par niveau si disponibles
            if (metrics.countByLevel) {
                Object.entries(metrics.countByLevel).forEach(([level, count]) => {
                    const levelName = `level_${level}`;
                    stats[levelName] = (stats[levelName] || 0) + (count || 0);
                });
            }
        });

        return stats;
    }

    /**
     * Réinitialise les statistiques de journalisation
     */
    public static resetLogStats(): void {
        // Réinitialiser les métriques pour toutes les instances
        Logger.instances.forEach((instance) => {
            instance.resetMetrics();
        });
    }
}

// Exporter l'instance singleton par défaut
export const logger = Logger.getInstance();

// Re-export des types principaux pour faciliter l'utilisation
export { LogLevel } from './logging/LogLevel';
export type { LoggerOptions, LogOptions } from './logging/LoggerTypes';