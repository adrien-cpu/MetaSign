/**
 * @file src/ai/services/learning/utils/performance-wrapper.ts
 * @description Utilitaire de wrapper pour le tracking de performance sans décorateurs
 * @module PerformanceWrapper
 * @requires @/ai/services/learning/utils/logger
 * @requires @/ai/services/learning/registry/utils/MetricsCollector
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { LearningLogger } from './logger';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';

/**
 * Options pour le wrapper de performance
 * @interface WrapperOptions
 */
interface WrapperOptions {
    /** Nom de la classe */
    className: string;
    /** Collecteur de métriques */
    metricsCollector: MetricsCollector;
    /** Seuil de warning en ms */
    warnThreshold?: number;
}

/**
 * Wrapper pour tracker la performance d'une méthode
 * @param {T} method - Méthode à wrapper
 * @param {string} methodName - Nom de la méthode
 * @param {WrapperOptions} options - Options du wrapper
 * @returns {T} Méthode wrappée
 * @template T
 */
export function withPerformanceTracking<T extends (...args: unknown[]) => unknown>(
    method: T,
    methodName: string,
    options: WrapperOptions
): T {
    const { className, metricsCollector, warnThreshold = 1000 } = options;
    const fullMethodName = `${className}.${methodName}`;

    return (function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
        const start = performance.now();

        try {
            const result = method.apply(this, args);

            // Gestion des méthodes asynchrones
            if (result instanceof Promise) {
                return result
                    .then((asyncResult) => {
                        trackExecution(start, fullMethodName, args.length, 'async', warnThreshold, metricsCollector);
                        return asyncResult;
                    })
                    .catch((error) => {
                        const executionTime = performance.now() - start;
                        LearningLogger.error(
                            `Erreur async dans ${fullMethodName} après ${executionTime.toFixed(2)}ms`,
                            { error, methodName: fullMethodName, executionTime }
                        );
                        throw error;
                    }) as ReturnType<T>;
            }

            // Gestion des méthodes synchrones
            trackExecution(start, fullMethodName, args.length, 'sync', warnThreshold, metricsCollector);
            return result as ReturnType<T>;
        } catch (error) {
            const executionTime = performance.now() - start;
            LearningLogger.error(
                `Erreur dans ${fullMethodName} après ${executionTime.toFixed(2)}ms`,
                { error, methodName: fullMethodName, executionTime }
            );
            throw error;
        }
    }) as T;
}

/**
 * Enregistre l'exécution d'une méthode
 * @private
 */
function trackExecution(
    startTime: number,
    methodName: string,
    argumentCount: number,
    type: 'sync' | 'async',
    warnThreshold: number,
    metricsCollector: MetricsCollector
): void {
    const executionTime = performance.now() - startTime;

    const logData = {
        methodName,
        executionTime: Math.round(executionTime * 100) / 100,
        argumentCount,
        type
    };

    if (executionTime > warnThreshold) {
        LearningLogger.warn(`Méthode ${type} ${methodName} exécutée en ${executionTime.toFixed(2)}ms (LENT)`, logData);
    } else {
        LearningLogger.debug(`Méthode ${type} ${methodName} exécutée en ${executionTime.toFixed(2)}ms`, logData);
    }

    metricsCollector.recordEvent('method_execution', logData);
}

/**
 * Crée un proxy pour une classe entière avec tracking de performance
 * @param {T} instance - Instance de la classe
 * @param {WrapperOptions} options - Options du wrapper
 * @param {string[]} [methodsToTrack] - Méthodes spécifiques à tracker (toutes par défaut)
 * @returns {T} Instance proxifiée
 * @template T
 */
export function createPerformanceProxy<T extends object>(
    instance: T,
    options: WrapperOptions,
    methodsToTrack?: string[]
): T {
    return new Proxy(instance, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);

            if (typeof value === 'function' && typeof prop === 'string') {
                // Vérifier si cette méthode doit être trackée
                if (!methodsToTrack || methodsToTrack.includes(prop)) {
                    // Ne pas tracker les méthodes privées (commençant par _)
                    if (!prop.startsWith('_') && !prop.startsWith('constructor')) {
                        return withPerformanceTracking(
                            value.bind(target),
                            prop,
                            options
                        );
                    }
                }
            }

            return value;
        }
    });
}