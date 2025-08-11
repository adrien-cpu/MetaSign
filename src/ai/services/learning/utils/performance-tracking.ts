/**
 * @file src/ai/services/learning/utils/performance-tracking.ts
 * @description Utilitaire de tracking de performance pour les méthodes avec support
 * des décorateurs TypeScript modernes et gestion des méthodes asynchrones.
 * Compatible avec les décorateurs legacy TypeScript.
 * @module PerformanceTracking
 * @requires @/ai/services/learning/utils/logger
 * @version 2.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { LearningLogger } from './logger';

/**
 * Type pour les arguments de fonction
 * @typedef {Array} FunctionArgs
 */
type FunctionArgs = unknown[];

/**
 * Type pour les valeurs de retour de fonction
 * @typedef {unknown} FunctionReturn
 */
type FunctionReturn = unknown;

/**
 * Type générique pour les fonctions
 * @typedef {Function} AnyFunction
 */
type AnyFunction = (...args: FunctionArgs) => FunctionReturn;

/**
 * Interface pour les statistiques de performance
 * @interface PerformanceStats
 * @property {string} methodName - Nom de la méthode
 * @property {number} executionTime - Temps d'exécution en millisecondes
 * @property {number} argumentCount - Nombre d'arguments passés
 * @property {'sync' | 'async'} type - Type de méthode (sync/async)
 * @property {Date} timestamp - Horodatage de l'exécution
 */
interface PerformanceStats {
    /** Nom de la méthode */
    methodName: string;
    /** Temps d'exécution en millisecondes */
    executionTime: number;
    /** Nombre d'arguments passés */
    argumentCount: number;
    /** Type de méthode (sync/async) */
    type: 'sync' | 'async';
    /** Horodatage de l'exécution */
    timestamp: Date;
}

/**
 * Collecteur de statistiques de performance
 * @class PerformanceStatsCollector
 * @description Collecte et gère les statistiques de performance des méthodes trackées
 */
class PerformanceStatsCollector {
    private static stats: PerformanceStats[] = [];
    private static readonly maxStats = 1000; // Limite pour éviter les fuites mémoire

    /**
     * Ajoute une statistique de performance
     * @param {PerformanceStats} stat - Statistique à ajouter
     * @static
     */
    public static addStat(stat: PerformanceStats): void {
        this.stats.push(stat);

        // Nettoyer les anciennes statistiques si nécessaire
        if (this.stats.length > this.maxStats) {
            this.stats = this.stats.slice(-this.maxStats);
        }
    }

    /**
     * Récupère les statistiques pour une méthode donnée
     * @param {string} methodName - Nom de la méthode
     * @returns {PerformanceStats[]} Statistiques filtrées
     * @static
     */
    public static getStatsForMethod(methodName: string): PerformanceStats[] {
        return this.stats.filter(stat => stat.methodName === methodName);
    }

    /**
     * Calcule le temps d'exécution moyen pour une méthode
     * @param {string} methodName - Nom de la méthode
     * @returns {number} Temps moyen en millisecondes
     * @static
     */
    public static getAverageExecutionTime(methodName: string): number {
        const methodStats = this.getStatsForMethod(methodName);
        if (methodStats.length === 0) return 0;

        const totalTime = methodStats.reduce((sum, stat) => sum + stat.executionTime, 0);
        return totalTime / methodStats.length;
    }

    /**
     * Efface toutes les statistiques
     * @static
     */
    public static clearStats(): void {
        this.stats = [];
    }

    /**
     * Récupère toutes les statistiques
     * @returns {PerformanceStats[]} Toutes les statistiques collectées
     * @static
     */
    public static getAllStats(): PerformanceStats[] {
        return [...this.stats];
    }
}

/**
 * Options de configuration pour le décorateur de performance
 * @interface PerformanceTrackOptions
 * @property {number} [warnThreshold=1000] - Seuil en ms au-dessus duquel afficher un warning
 * @property {boolean} [collectStats=true] - Activer la collecte de statistiques
 * @property {'debug' | 'info'} [logLevel='debug'] - Niveau de log à utiliser
 */
interface PerformanceTrackOptions {
    /** Seuil en ms au-dessus duquel afficher un warning */
    warnThreshold?: number;
    /** Activer la collecte de statistiques */
    collectStats?: boolean;
    /** Niveau de log à utiliser */
    logLevel?: 'debug' | 'info';
}

/**
 * Décorateur de performance pour le tracking des méthodes
 * Compatible avec TypeScript legacy decorators
 * 
 * @param {PerformanceTrackOptions} [options={}] - Options de configuration du tracking
 * @returns {MethodDecorator} Décorateur de méthode
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @PerformanceTrack({ warnThreshold: 500 })
 *   public async processData(data: any): Promise<void> {
 *     // ...
 *   }
 * }
 * ```
 */
export function PerformanceTrack(options: PerformanceTrackOptions = {}): MethodDecorator {
    const {
        warnThreshold = 1000,
        collectStats = true,
        logLevel = 'debug'
    } = options;

    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value as AnyFunction;
        const propertyKeyStr = String(propertyKey);

        if (typeof originalMethod !== 'function') {
            throw new Error(`@PerformanceTrack can only be applied to methods, not ${typeof originalMethod}`);
        }

        descriptor.value = function (this: unknown, ...args: FunctionArgs): FunctionReturn {
            const start = performance.now();
            const className = (target.constructor as { name?: string }).name || 'UnknownClass';
            const methodName = `${className}.${propertyKeyStr}`;

            try {
                const result = originalMethod.apply(this, args);

                // Gestion des méthodes asynchrones (Promise)
                if (result instanceof Promise) {
                    return result
                        .then((asyncResult) => {
                            trackExecution(methodName, start, args.length, 'async', {
                                warnThreshold,
                                collectStats,
                                logLevel
                            });
                            return asyncResult;
                        })
                        .catch((error) => {
                            const executionTime = performance.now() - start;
                            LearningLogger.error(
                                `Erreur async dans la méthode ${methodName} après ${executionTime.toFixed(2)}ms`,
                                { error, methodName, executionTime }
                            );
                            throw error;
                        });
                }

                // Gestion des méthodes synchrones
                trackExecution(methodName, start, args.length, 'sync', {
                    warnThreshold,
                    collectStats,
                    logLevel
                });

                return result;
            } catch (error) {
                const executionTime = performance.now() - start;
                LearningLogger.error(
                    `Erreur dans la méthode ${methodName} après ${executionTime.toFixed(2)}ms`,
                    { error, methodName, executionTime }
                );
                throw error;
            }
        };

        // Préserver les métadonnées de la méthode originale
        Object.defineProperty(descriptor.value, 'name', { value: propertyKeyStr });

        return descriptor;
    };
}

/**
 * Enregistre l'exécution d'une méthode
 * @param {string} methodName - Nom de la méthode
 * @param {number} startTime - Temps de début
 * @param {number} argumentCount - Nombre d'arguments
 * @param {'sync' | 'async'} type - Type de méthode
 * @param {Object} options - Options de tracking
 * @private
 */
function trackExecution(
    methodName: string,
    startTime: number,
    argumentCount: number,
    type: 'sync' | 'async',
    options: {
        warnThreshold: number;
        collectStats: boolean;
        logLevel: 'debug' | 'info';
    }
): void {
    const executionTime = performance.now() - startTime;
    const { warnThreshold, collectStats, logLevel } = options;

    const stat: PerformanceStats = {
        methodName,
        executionTime,
        argumentCount,
        type,
        timestamp: new Date()
    };

    // Logging
    const logMessage = `Méthode ${type} ${methodName} exécutée en ${executionTime.toFixed(2)}ms`;
    const logData = {
        methodName,
        executionTime: Math.round(executionTime * 100) / 100,
        argumentCount,
        type
    };

    if (executionTime > warnThreshold) {
        LearningLogger.warn(`${logMessage} (LENT)`, logData);
    } else {
        LearningLogger[logLevel](logMessage, logData);
    }

    // Collecte de statistiques
    if (collectStats) {
        PerformanceStatsCollector.addStat(stat);
    }
}

/**
 * Fonction utilitaire pour mesurer manuellement la performance d'une fonction
 * @param {string} name - Nom de l'opération
 * @param {Function} fn - Fonction à mesurer
 * @returns {Promise<T>} Résultat de la fonction
 * @template T
 * 
 * @example
 * ```typescript
 * const result = await measurePerformance('dataProcessing', async () => {
 *   // Code à mesurer
 *   return processedData;
 * });
 * ```
 */
export async function measurePerformance<T>(
    name: string,
    fn: () => T | Promise<T>
): Promise<T> {
    const start = performance.now();

    try {
        const result = await fn();
        const executionTime = performance.now() - start;

        LearningLogger.debug(`Opération ${name} exécutée en ${executionTime.toFixed(2)}ms`, {
            operationName: name,
            executionTime: Math.round(executionTime * 100) / 100
        });

        return result;
    } catch (error) {
        const executionTime = performance.now() - start;
        LearningLogger.error(
            `Erreur dans l'opération ${name} après ${executionTime.toFixed(2)}ms`,
            { error, operationName: name, executionTime }
        );
        throw error;
    }
}

/**
 * Classe utilitaire pour créer des mesures de performance personnalisées
 * @class PerformanceTimer
 * @description Permet de mesurer facilement le temps d'exécution de sections de code
 * 
 * @example
 * ```typescript
 * const timer = new PerformanceTimer('myOperation');
 * timer.start();
 * // ... code à mesurer
 * timer.stop();
 * console.log(timer.getExecutionTime());
 * ```
 */
export class PerformanceTimer {
    private startTime: number | null = null;
    private endTime: number | null = null;

    /**
     * Crée une nouvelle instance de timer
     * @param {string} name - Nom de l'opération
     * @constructor
     */
    constructor(private readonly name: string) { }

    /**
     * Démarre le timer
     */
    public start(): void {
        this.startTime = performance.now();
        this.endTime = null;
    }

    /**
     * Arrête le timer et retourne le temps écoulé
     * @returns {number} Temps écoulé en millisecondes
     * @throws {Error} Si le timer n'a pas été démarré
     */
    public stop(): number {
        if (this.startTime === null) {
            throw new Error(`Timer ${this.name} not started`);
        }
        this.endTime = performance.now();
        return this.getExecutionTime();
    }

    /**
     * Récupère le temps d'exécution
     * @returns {number} Temps d'exécution en millisecondes
     * @throws {Error} Si le timer n'est pas complet
     */
    public getExecutionTime(): number {
        if (this.startTime === null || this.endTime === null) {
            throw new Error(`Timer ${this.name} not complete`);
        }
        return this.endTime - this.startTime;
    }

    /**
     * Réinitialise le timer
     */
    public reset(): void {
        this.startTime = null;
        this.endTime = null;
    }
}

/**
 * Export du collecteur de statistiques pour accès externe
 */
export { PerformanceStatsCollector };

/**
 * Export des types utiles
 */
export type { PerformanceStats, AnyFunction, PerformanceTrackOptions, FunctionArgs, FunctionReturn };