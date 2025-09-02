/**
 * @file src/ai/services/learning/metrics/providers/MetricsStorageProvider.ts
 * @description Provider pour le stockage persistant des métriques
 * @module MetricsStorageProvider
 * @requires @/ai/services/learning/metrics/interfaces/MetricsInterfaces
 * @requires @/ai/services/learning/metrics/types/MetricsTypes
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { UserMetricsProfile, MetricsFilterOptions } from '../interfaces/MetricsInterfaces';
import { MetricHistoryEntry } from '../types/MetricsTypes';

/**
 * Interface pour les providers de stockage
 * @interface MetricsStorageProvider
 */
export interface MetricsStorageProvider {
    /**
     * Sauvegarde un profil
     * @param {UserMetricsProfile} profile - Profil à sauvegarder
     * @returns {Promise<void>}
     */
    saveProfile(profile: UserMetricsProfile): Promise<void>;

    /**
     * Charge un profil
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<UserMetricsProfile | null>}
     */
    loadProfile(userId: string): Promise<UserMetricsProfile | null>;

    /**
     * Supprime un profil
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<void>}
     */
    deleteProfile(userId: string): Promise<void>;

    /**
     * Sauvegarde une entrée d'historique
     * @param {MetricHistoryEntry} entry - Entrée à sauvegarder
     * @returns {Promise<void>}
     */
    saveMetricHistory(entry: MetricHistoryEntry): Promise<void>;

    /**
     * Charge l'historique d'une métrique
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {MetricsFilterOptions} [options] - Options de filtrage
     * @returns {Promise<MetricHistoryEntry[]>}
     */
    loadMetricHistory(
        userId: string,
        metricId: string,
        options?: MetricsFilterOptions
    ): Promise<MetricHistoryEntry[]>;

    /**
     * Supprime l'historique d'une métrique
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @returns {Promise<void>}
     */
    deleteMetricHistory(userId: string, metricId: string): Promise<void>;

    /**
     * Sauvegarde les métriques d'un exercice
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} exerciseId - Identifiant de l'exercice
     * @param {Record<string, unknown>} metrics - Métriques à sauvegarder
     * @returns {Promise<void>}
     */
    saveExerciseMetric(
        userId: string,
        exerciseId: string,
        metrics: Record<string, unknown>
    ): Promise<void>;
}

/**
 * Provider de stockage en mémoire (stub)
 * @class MemoryStorageProvider
 * @implements {MetricsStorageProvider}
 */
class MemoryStorageProvider implements MetricsStorageProvider {
    private profiles = new Map<string, UserMetricsProfile>();
    private history = new Map<string, MetricHistoryEntry[]>();
    private exerciseMetrics = new Map<string, Record<string, unknown>>();

    async saveProfile(profile: UserMetricsProfile): Promise<void> {
        this.profiles.set(profile.userId, profile);
    }

    async loadProfile(userId: string): Promise<UserMetricsProfile | null> {
        return this.profiles.get(userId) || null;
    }

    async deleteProfile(userId: string): Promise<void> {
        this.profiles.delete(userId);
    }

    async saveMetricHistory(entry: MetricHistoryEntry): Promise<void> {
        const key = `${entry.userId}:${entry.metricId}`;
        if (!this.history.has(key)) {
            this.history.set(key, []);
        }
        this.history.get(key)!.push(entry);
    }

    async loadMetricHistory(
        userId: string,
        metricId: string,
        options?: MetricsFilterOptions
    ): Promise<MetricHistoryEntry[]> {
        const key = `${userId}:${metricId}`;
        let entries = this.history.get(key) || [];

        // Appliquer les filtres si des options sont fournies
        if (options) {
            entries = this.applyHistoryFilters(entries, options);
        }

        return entries;
    }

    /**
     * Applique les filtres sur l'historique des métriques
     * @private
     */
    private applyHistoryFilters(
        entries: MetricHistoryEntry[],
        options: MetricsFilterOptions
    ): MetricHistoryEntry[] {
        let filteredEntries = [...entries];

        // Filtrage par date de début
        if (options.startDate) {
            filteredEntries = filteredEntries.filter(entry => 
                entry.timestamp >= options.startDate!
            );
        }

        // Filtrage par date de fin
        if (options.endDate) {
            filteredEntries = filteredEntries.filter(entry => 
                entry.timestamp <= options.endDate!
            );
        }

        // Tri par timestamp
        if (options.sortBy === 'timestamp') {
            filteredEntries.sort((a, b) => {
                const comparison = a.timestamp.getTime() - b.timestamp.getTime();
                return options.sort === 'desc' ? -comparison : comparison;
            });
        }

        // Limitation du nombre de résultats
        if (options.limit && options.limit > 0) {
            const offset = options.offset || 0;
            filteredEntries = filteredEntries.slice(offset, offset + options.limit);
        }

        return filteredEntries;
    }

    async deleteMetricHistory(userId: string, metricId: string): Promise<void> {
        const key = `${userId}:${metricId}`;
        this.history.delete(key);
    }

    async saveExerciseMetric(
        userId: string,
        exerciseId: string,
        metrics: Record<string, unknown>
    ): Promise<void> {
        const key = `${userId}:${exerciseId}`;
        this.exerciseMetrics.set(key, metrics);
    }
}

/**
 * Factory pour créer un provider de stockage
 * @param {string} mode - Mode de stockage
 * @param {string} [dbUrl] - URL de la base de données
 * @returns {MetricsStorageProvider} Provider de stockage
 */
export function createStorageProvider(
    mode: string,
    dbUrl?: string
): MetricsStorageProvider {
    switch (mode) {
        case 'memory':
            return new MemoryStorageProvider();
        case 'database':
            // Utiliser l'URL de base de données pour créer un provider de base de données
            if (!dbUrl) {
                throw new Error('Database URL is required for database storage provider');
            }
            // Pour l'instant, retourner un MemoryStorageProvider avec logging de l'URL
            console.log(`Database storage provider would connect to: ${dbUrl}`);
            return new MemoryStorageProvider();
        case 'file':
            // Utiliser l'URL comme chemin de fichier
            const filePath = dbUrl || './metrics_storage';
            console.log(`File storage provider would use path: ${filePath}`);
            return new MemoryStorageProvider();
        default:
            return new MemoryStorageProvider();
        // Ajouter d'autres providers ici (database, file, etc.)
    }
}