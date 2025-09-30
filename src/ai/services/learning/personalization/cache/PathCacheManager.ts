/**
 * Gestionnaire de cache pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/cache/PathCacheManager.ts
 * @module ai/services/learning/personalization/cache
 * @description Gestion du cache des parcours avec TTL et taille limitée
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 1.0.0
 * @since 2025
 * @lastModified 2025-01-22
 */

import type { PersonalizedLearningPathModel } from '@learning/types/LearningPathTypes';
import { Logger } from '@ai/utils/Logger';

/**
 * Configuration du gestionnaire de cache
 * 
 * @interface PathCacheConfig
 */
interface PathCacheConfig {
    /** Taille maximale du cache */
    readonly maxSize: number;
    /** Durée de vie des entrées (ms) */
    readonly ttl: number;
}

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG: PathCacheConfig = {
    maxSize: 100,
    ttl: 30 * 60 * 1000 // 30 minutes
} as const;

/**
 * Entrée de cache avec métadonnées temporelles
 * 
 * @interface CacheEntry
 */
interface CacheEntry {
    /** Parcours mis en cache */
    readonly path: PersonalizedLearningPathModel;
    /** Timestamp de création */
    readonly timestamp: number;
    /** Timestamp du dernier accès */
    lastAccessed: number;
}

/**
 * Gestionnaire de cache pour les parcours d'apprentissage
 * 
 * @class PathCacheManager
 * @example
 * ```typescript
 * const cacheManager = new PathCacheManager({ maxSize: 50, ttl: 1800000 });
 * cacheManager.set('path-123', pathModel);
 * const path = cacheManager.get('path-123');
 * ```
 */
export class PathCacheManager {
    private readonly logger = Logger.getInstance('PathCacheManager');
    private readonly config: PathCacheConfig;
    private readonly cache: Map<string, CacheEntry>;

    /**
     * Constructeur du gestionnaire de cache
     * 
     * @param config - Configuration du cache (optionnelle)
     */
    constructor(config?: Partial<PathCacheConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.cache = new Map();

        this.logger.info('PathCacheManager initialisé', {
            maxSize: this.config.maxSize,
            ttl: this.config.ttl
        });
    }

    /**
     * Ajoute un parcours au cache
     * 
     * @param pathId - Identifiant du parcours
     * @param path - Parcours à mettre en cache
     */
    public set(pathId: string, path: PersonalizedLearningPathModel): void {
        // Vérifier la taille du cache
        if (this.cache.size >= this.config.maxSize) {
            this.evictOldestEntry();
        }

        const now = Date.now();
        const entry: CacheEntry = {
            path,
            timestamp: now,
            lastAccessed: now
        };

        this.cache.set(pathId, entry);

        this.logger.debug('Parcours ajouté au cache', {
            pathId,
            cacheSize: this.cache.size
        });
    }

    /**
     * Récupère un parcours du cache
     * 
     * @param pathId - Identifiant du parcours
     * @returns PersonalizedLearningPathModel | undefined Parcours ou undefined si non trouvé/expiré
     */
    public get(pathId: string): PersonalizedLearningPathModel | undefined {
        const entry = this.cache.get(pathId);

        if (!entry) {
            return undefined;
        }

        const now = Date.now();

        // Vérifier l'expiration
        if (now - entry.timestamp > this.config.ttl) {
            this.cache.delete(pathId);
            this.logger.debug('Entrée expirée supprimée du cache', { pathId });
            return undefined;
        }

        // Mettre à jour le dernier accès
        entry.lastAccessed = now;

        this.logger.debug('Parcours récupéré du cache', { pathId });
        return entry.path;
    }

    /**
     * Obtient tous les parcours d'un utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns PersonalizedLearningPathModel[] Liste des parcours
     */
    public getUserPaths(userId: string): PersonalizedLearningPathModel[] {
        const userPaths: PersonalizedLearningPathModel[] = [];
        const now = Date.now();

        for (const [pathId, entry] of this.cache.entries()) {
            // Vérifier l'expiration
            if (now - entry.timestamp > this.config.ttl) {
                this.cache.delete(pathId);
                continue;
            }

            if (entry.path.userId === userId) {
                entry.lastAccessed = now;
                userPaths.push(entry.path);
            }
        }

        return userPaths;
    }

    /**
     * Supprime un parcours du cache
     * 
     * @param pathId - Identifiant du parcours
     * @returns boolean True si le parcours a été supprimé
     */
    public delete(pathId: string): boolean {
        const deleted = this.cache.delete(pathId);

        if (deleted) {
            this.logger.debug('Parcours supprimé du cache', { pathId });
        }

        return deleted;
    }

    /**
     * Nettoie le cache des entrées expirées
     * 
     * @returns number Nombre d'entrées supprimées
     */
    public cleanup(): number {
        const now = Date.now();
        let removedCount = 0;

        for (const [pathId, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.config.ttl) {
                this.cache.delete(pathId);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            this.logger.debug('Nettoyage du cache effectué', {
                removedEntries: removedCount,
                remainingEntries: this.cache.size
            });
        }

        return removedCount;
    }

    /**
     * Vide complètement le cache
     */
    public clear(): void {
        const size = this.cache.size;
        this.cache.clear();

        this.logger.info('Cache vidé complètement', { clearedEntries: size });
    }

    /**
     * Obtient des statistiques sur le cache
     * 
     * @returns object Statistiques du cache
     */
    public getStats(): {
        size: number;
        maxSize: number;
        hitRate?: number;
        oldestEntry?: number;
        newestEntry?: number;
    } {
        if (this.cache.size === 0) {
            return {
                size: 0,
                maxSize: this.config.maxSize
            };
        }

        const now = Date.now();
        let oldestTimestamp = now;
        let newestTimestamp = 0;

        for (const entry of this.cache.values()) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
            }
            if (entry.timestamp > newestTimestamp) {
                newestTimestamp = entry.timestamp;
            }
        }

        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            oldestEntry: now - oldestTimestamp,
            newestEntry: now - newestTimestamp
        };
    }

    /**
     * Évince l'entrée la plus ancienne du cache
     * 
     * @private
     */
    private evictOldestEntry(): void {
        let oldestKey = '';
        let oldestAccess = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestAccess) {
                oldestAccess = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.logger.debug('Éviction de l\'entrée la plus ancienne', {
                evictedKey: oldestKey,
                age: Date.now() - oldestAccess
            });
        }
    }
}