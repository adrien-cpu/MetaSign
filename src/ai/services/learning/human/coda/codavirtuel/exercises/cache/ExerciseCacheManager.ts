/**
 * Gestionnaire de cache pour les exercices
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/cache/ExerciseCacheManager.ts
 * @module ai/services/learning/human/coda/codavirtuel/exercises/cache
 * @description Gère la mise en cache des exercices avec nettoyage automatique et optimisations
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import {
    Exercise,
    ExerciseCache,
    ExerciseServiceConfig,
    EXERCISE_CONSTANTS
} from '../types/ExerciseGeneratorTypes';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Interface pour les statistiques du cache
 */
interface CacheStats {
    readonly size: number;
    readonly maxSize: number;
    readonly hitRate: number;
    readonly totalHits: number;
    readonly totalMisses: number;
    readonly lastCleanup: Date;
    readonly oldestEntry: Date | null;
}

/**
 * Gestionnaire de cache avancé pour les exercices
 * Implémente LRU (Least Recently Used) avec nettoyage automatique
 */
export class ExerciseCacheManager implements ExerciseCache {
    private readonly logger = LoggerFactory.getLogger('ExerciseCacheManager');
    private readonly cache = new Map<string, Exercise>();
    private readonly accessTimes = new Map<string, number>();
    private readonly maxSize: number;
    private readonly maxAge: number;
    private readonly enableAutoCleanup: boolean;
    private cleanupTimer: NodeJS.Timeout | null = null;

    // Statistiques
    private totalHits = 0;
    private totalMisses = 0;
    private lastCleanup = new Date();

    /**
     * Constructeur du gestionnaire de cache
     * @param config Configuration du cache
     */
    constructor(config: ExerciseServiceConfig = {}) {
        this.maxSize = config.maxCacheSize ?? EXERCISE_CONSTANTS.DEFAULT_MAX_CACHE_SIZE;
        this.maxAge = config.cacheMaxAge ?? EXERCISE_CONSTANTS.DEFAULT_CACHE_MAX_AGE;
        this.enableAutoCleanup = config.enableAutoCleanup ?? true;

        this.logger.debug('ExerciseCacheManager initialized', {
            maxSize: this.maxSize,
            maxAge: this.maxAge,
            enableAutoCleanup: this.enableAutoCleanup
        });

        if (this.enableAutoCleanup) {
            this.startAutoCleanup(config.cleanupInterval);
        }
    }

    /**
     * Ajoute un exercice au cache
     * @param key Clé de l'exercice
     * @param exercise Exercice à mettre en cache
     */
    public set(key: string, exercise: Exercise): void {
        // Vérifier la validité de la clé
        if (!key || typeof key !== 'string' || key.trim().length === 0) {
            this.logger.warn('Invalid cache key provided', { key });
            return;
        }

        // Vérifier la validité de l'exercice
        if (!this.isValidExercise(exercise)) {
            this.logger.warn('Invalid exercise provided for caching', { exerciseId: exercise?.id });
            return;
        }

        // Nettoyer le cache si nécessaire
        this.enforceMaxSize();

        // Ajouter l'exercice
        this.cache.set(key, exercise);
        this.accessTimes.set(key, Date.now());

        this.logger.debug('Exercise cached', {
            key,
            exerciseId: exercise.id,
            cacheSize: this.cache.size
        });
    }

    /**
     * Récupère un exercice du cache
     * @param key Clé de l'exercice
     * @returns Exercice trouvé ou undefined
     */
    public get(key: string): Exercise | undefined {
        if (!key || typeof key !== 'string') {
            this.totalMisses++;
            return undefined;
        }

        const exercise = this.cache.get(key);

        if (exercise === undefined) {
            this.totalMisses++;
            this.logger.debug('Cache miss', { key });
            return undefined;
        }

        // Vérifier si l'exercice n'est pas expiré
        const exerciseAge = this.getExerciseAge(exercise);
        if (exerciseAge > this.maxAge) {
            this.delete(key);
            this.totalMisses++;
            this.logger.debug('Cache hit but expired', { key, age: exerciseAge });
            return undefined;
        }

        // Mettre à jour le temps d'accès (LRU)
        this.accessTimes.set(key, Date.now());
        this.totalHits++;

        this.logger.debug('Cache hit', { key, exerciseId: exercise.id });
        return exercise;
    }

    /**
     * Supprime un exercice du cache
     * @param key Clé de l'exercice
     * @returns True si l'exercice a été supprimé
     */
    public delete(key: string): boolean {
        const wasDeleted = this.cache.delete(key);
        this.accessTimes.delete(key);

        if (wasDeleted) {
            this.logger.debug('Exercise removed from cache', { key });
        }

        return wasDeleted;
    }

    /**
     * Vide le cache complètement
     */
    public clear(): void {
        const previousSize = this.cache.size;
        this.cache.clear();
        this.accessTimes.clear();
        this.totalHits = 0;
        this.totalMisses = 0;

        this.logger.info('Cache cleared', { previousSize });
    }

    /**
     * Retourne la taille actuelle du cache
     */
    public get size(): number {
        return this.cache.size;
    }

    /**
     * Nettoie les exercices expirés
     * @param maxAge Âge maximum en millisecondes
     * @returns Nombre d'exercices supprimés
     */
    public cleanup(maxAge: number = this.maxAge): number {
        const expiredKeys: string[] = [];

        for (const [key, exercise] of this.cache.entries()) {
            const exerciseAge = this.getExerciseAge(exercise);
            if (exerciseAge > maxAge) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.delete(key));
        this.lastCleanup = new Date();

        if (expiredKeys.length > 0) {
            this.logger.info('Cache cleanup completed', {
                removedExercises: expiredKeys.length,
                remainingExercises: this.cache.size,
                maxAge
            });
        }

        return expiredKeys.length;
    }

    /**
     * Obtient les statistiques du cache
     * @returns Statistiques détaillées
     */
    public getStats(): CacheStats {
        const total = this.totalHits + this.totalMisses;
        const hitRate = total > 0 ? this.totalHits / total : 0;

        let oldestEntry: Date | null = null;
        for (const exercise of this.cache.values()) {
            const createdAt = exercise.metadata?.createdAt;
            if (createdAt && (!oldestEntry || createdAt < oldestEntry)) {
                oldestEntry = createdAt;
            }
        }

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate,
            totalHits: this.totalHits,
            totalMisses: this.totalMisses,
            lastCleanup: this.lastCleanup,
            oldestEntry
        };
    }

    /**
     * Démarre le nettoyage automatique
     * @param interval Intervalle en millisecondes
     * @private
     */
    private startAutoCleanup(interval?: number): void {
        const cleanupInterval = interval ?? EXERCISE_CONSTANTS.DEFAULT_CLEANUP_INTERVAL;

        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, cleanupInterval);

        this.logger.debug('Auto cleanup started', { interval: cleanupInterval });
    }

    /**
     * Arrête le nettoyage automatique
     */
    public stopAutoCleanup(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
            this.logger.debug('Auto cleanup stopped');
        }
    }

    /**
     * Applique la limite de taille du cache (LRU)
     * @private
     */
    private enforceMaxSize(): void {
        while (this.cache.size >= this.maxSize) {
            // Trouver l'entrée la moins récemment utilisée
            let oldestKey: string | null = null;
            let oldestTime = Date.now();

            for (const [key, time] of this.accessTimes.entries()) {
                if (time < oldestTime) {
                    oldestTime = time;
                    oldestKey = key;
                }
            }

            if (oldestKey) {
                this.delete(oldestKey);
                this.logger.debug('LRU eviction', { evictedKey: oldestKey });
            } else {
                // Fallback: supprimer le premier élément
                const firstKey = this.cache.keys().next().value;
                if (firstKey) {
                    this.delete(firstKey as string);
                }
                break;
            }
        }
    }

    /**
     * Calcule l'âge d'un exercice
     * @param exercise Exercice à analyser
     * @returns Âge en millisecondes
     * @private
     */
    private getExerciseAge(exercise: Exercise): number {
        const createdAt = exercise.metadata?.createdAt;
        if (!createdAt) {
            return 0;
        }
        return Date.now() - createdAt.getTime();
    }

    /**
     * Valide qu'un exercice est correctement formé
     * @param exercise Exercice à valider
     * @returns True si l'exercice est valide
     * @private
     */
    private isValidExercise(exercise: Exercise): boolean {
        return exercise &&
            typeof exercise === 'object' &&
            typeof exercise.id === 'string' &&
            exercise.id.length > 0 &&
            typeof exercise.type === 'string' &&
            exercise.content !== undefined;
    }

    /**
     * Détruit le gestionnaire de cache
     * Nettoie les ressources et arrête les timers
     */
    public destroy(): void {
        this.stopAutoCleanup();
        this.clear();
        this.logger.debug('ExerciseCacheManager destroyed');
    }
}