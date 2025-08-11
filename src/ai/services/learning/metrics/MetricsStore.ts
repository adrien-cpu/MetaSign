/**
 * @file src/ai/services/learning/metrics/MetricsStore.ts
 * @description Service de stockage des métriques d'apprentissage
 * @module MetricsStore
 * @requires @/ai/services/learning/metrics/interfaces/MetricsInterfaces
 * @requires @/ai/services/learning/metrics/types/MetricsTypes
 * @requires @/ai/services/learning/metrics/providers/MetricsStorageProvider
 * @requires @/ai/services/learning/metrics/utils/MetricsUtils
 * @version 2.0.0
 * @since 2024
 * @author MetaSign Team
 */

import {
    IMetricsStore,
    UserMetricsProfile,
    LearningMetric,
    MetricsFilterOptions
} from './interfaces/MetricsInterfaces';
import {
    MetricHistoryEntry,
    MetricsStoreOptions
} from './types/MetricsTypes';
import {
    createStorageProvider,
    MetricsStorageProvider
} from './providers/MetricsStorageProvider';
import { cleanupHistory } from './utils/MetricsUtils';

/**
 * Type utilitaire pour rendre toutes les propriétés requises
 * @template T
 */
type RequiredType<T> = {
    [P in keyof T]-?: T[P];
};

/**
 * Service de stockage des métriques d'apprentissage
 * 
 * @class MetricsStore
 * @implements {IMetricsStore}
 * @description Implémente l'interface IMetricsStore pour la gestion
 * et la persistance des métriques d'apprentissage
 * 
 * @example
 * ```typescript
 * const store = new MetricsStore({
 *   enablePersistence: true,
 *   storageMode: 'database'
 * });
 * 
 * const profile = await store.loadProfile('user123');
 * ```
 */
export class MetricsStore implements IMetricsStore {
    /**
     * Cache des profils en mémoire
     * @private
     */
    private profiles: Map<string, UserMetricsProfile>;

    /**
     * Cache de l'historique des métriques en mémoire
     * @private
     */
    private metricsHistory: Map<string, MetricHistoryEntry[]>;

    /**
     * Cache des métriques d'exercice en mémoire
     * @private
     */
    private exerciseMetrics: Map<string, Record<string, unknown>>;

    /**
     * Options de configuration du service
     * @private
     */
    private options: RequiredType<MetricsStoreOptions>;

    /**
     * Interface de stockage persistant (initialisée à la demande)
     * @private
     */
    private persistentStorage?: MetricsStorageProvider;

    /**
     * Constructeur du service de stockage
     * 
     * @constructor
     * @param {MetricsStoreOptions} [options={}] - Options de configuration
     */
    constructor(options: MetricsStoreOptions = {}) {
        this.profiles = new Map();
        this.metricsHistory = new Map();
        this.exerciseMetrics = new Map();

        // Options par défaut
        this.options = {
            dbUrl: options.dbUrl ?? 'memory://metrics',
            retentionPeriod: options.retentionPeriod ?? 365, // 1 an par défaut
            enablePersistence: options.enablePersistence ?? false, // Désactivé par défaut
            storageMode: options.storageMode ?? 'memory'
        } as RequiredType<MetricsStoreOptions>;

        // Initialiser le stockage persistant si activé
        if (this.options.enablePersistence && this.options.storageMode !== 'memory') {
            this.initializePersistentStorage();
        }
    }

    /**
     * Sauvegarde un profil de métriques
     * 
     * @method saveProfile
     * @async
     * @param {UserMetricsProfile} profile - Profil de métriques
     * @returns {Promise<UserMetricsProfile>} Profil sauvegardé
     * @public
     */
    public async saveProfile(profile: UserMetricsProfile): Promise<UserMetricsProfile> {
        // Mettre à jour le cache en mémoire
        this.profiles.set(profile.userId, { ...profile });

        // Sauvegarder dans le stockage persistant si activé
        if (this.options.enablePersistence && this.persistentStorage) {
            await this.persistentStorage.saveProfile(profile);
        }

        return profile;
    }

    /**
     * Charge un profil de métriques
     * 
     * @method loadProfile
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<UserMetricsProfile | undefined>} Profil de métriques ou undefined si non trouvé
     * @public
     */
    public async loadProfile(userId: string): Promise<UserMetricsProfile | undefined> {
        // Vérifier d'abord le cache en mémoire
        if (this.profiles.has(userId)) {
            const profile = this.profiles.get(userId);
            if (profile) {
                return { ...profile };
            }
        }

        // Essayer de charger depuis le stockage persistant si activé
        if (this.options.enablePersistence && this.persistentStorage) {
            const profile = await this.persistentStorage.loadProfile(userId);

            if (profile) {
                // Mettre en cache
                this.profiles.set(userId, profile);
                return { ...profile };
            }
        }

        // Profil non trouvé
        return undefined;
    }

    /**
     * Sauvegarde un instantané de métrique
     * 
     * @method saveMetricSnapshot
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {LearningMetric} metric - Métrique à sauvegarder
     * @returns {Promise<LearningMetric>} Métrique sauvegardée
     * @public
     */
    public async saveMetricSnapshot(userId: string, metric: LearningMetric): Promise<LearningMetric> {
        // Créer l'entrée d'historique
        const historyEntry: MetricHistoryEntry = {
            userId,
            metricId: metric.id,
            timestamp: new Date(),
            value: metric.value,
            metadata: metric.metadata
        };

        // Clé unique pour l'historique utilisateur
        const historyKey = `${userId}:metrics`;

        // Initialiser le tableau d'historique si nécessaire
        if (!this.metricsHistory.has(historyKey)) {
            this.metricsHistory.set(historyKey, []);
        }

        // Ajouter l'entrée à l'historique
        const history = this.metricsHistory.get(historyKey);
        if (history) {
            history.push(historyEntry);
            // Limiter la taille de l'historique en mémoire
            cleanupHistory(history);
        }

        // Sauvegarder dans le stockage persistant si activé
        if (this.options.enablePersistence && this.persistentStorage) {
            await this.persistentStorage.saveMetricHistory(historyEntry);
        }

        return metric;
    }

    /**
     * Charge l'historique d'une métrique
     * 
     * @method loadMetricHistory
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {MetricsFilterOptions} [options] - Options de filtrage
     * @returns {Promise<Array<{ timestamp: Date; value: unknown }>>} Historique de la métrique
     * @public
     */
    public async loadMetricHistory(
        userId: string,
        metricId: string,
        options?: MetricsFilterOptions
    ): Promise<Array<{ timestamp: Date; value: unknown }>> {
        // Clé unique pour l'historique utilisateur
        const historyKey = `${userId}:metrics`;

        // Liste combinée des entrées d'historique
        let historyEntries: MetricHistoryEntry[] = [];

        // Récupérer l'historique depuis le cache en mémoire
        if (this.metricsHistory.has(historyKey)) {
            const inMemoryHistory = this.metricsHistory.get(historyKey);
            if (inMemoryHistory) {
                historyEntries = inMemoryHistory.filter(entry => entry.metricId === metricId);
            }
        }

        // Récupérer l'historique depuis le stockage persistant si activé
        if (this.options.enablePersistence && this.persistentStorage) {
            const persistentHistory = await this.persistentStorage.loadMetricHistory(userId, metricId, options);

            // Fusionner avec l'historique en mémoire (sans doublons)
            historyEntries = this.mergeHistoryEntries(historyEntries, persistentHistory);
        }

        // Appliquer les filtres et trier
        return this.processHistoryEntries(historyEntries, options);
    }

    /**
     * Supprime un profil de métriques
     * 
     * @method deleteProfile
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<boolean>} Vrai si le profil a été supprimé
     * @public
     */
    public async deleteProfile(userId: string): Promise<boolean> {
        // Supprimer du cache en mémoire
        const deletedFromMemory = this.profiles.delete(userId);

        // Supprimer l'historique des métriques
        const historyKey = `${userId}:metrics`;
        this.metricsHistory.delete(historyKey);

        // Supprimer du stockage persistant si activé
        if (this.options.enablePersistence && this.persistentStorage) {
            await this.persistentStorage.deleteProfile(userId);
        }

        return deletedFromMemory;
    }

    /**
     * Supprime une métrique personnalisée
     * 
     * @method deleteCustomMetric
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @returns {Promise<boolean>} Vrai si la métrique a été supprimée
     * @public
     */
    public async deleteCustomMetric(userId: string, metricId: string): Promise<boolean> {
        // Récupérer le profil
        const profile = await this.loadProfile(userId);

        if (!profile || !profile.customMetrics) {
            return false;
        }

        // Vérifier si la métrique existe
        const customMetrics = profile.customMetrics as Record<string, LearningMetric>;
        if (!(metricId in customMetrics)) {
            return false;
        }

        // Supprimer la métrique
        const updatedProfile = {
            ...profile,
            customMetrics: { ...customMetrics }
        };
        delete updatedProfile.customMetrics[metricId];

        // Mettre à jour le profil
        await this.saveProfile(updatedProfile);

        // Supprimer l'historique de la métrique
        if (this.options.enablePersistence && this.persistentStorage) {
            await this.persistentStorage.deleteMetricHistory(userId, metricId);
        }

        return true;
    }

    /**
     * Ajoute une métrique d'exercice
     * 
     * @method addExerciseMetric
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} exerciseId - Identifiant de l'exercice
     * @param {Record<string, unknown>} metrics - Métriques à ajouter
     * @returns {Promise<Record<string, unknown>>} Métriques enregistrées
     * @public
     */
    public async addExerciseMetric(
        userId: string,
        exerciseId: string,
        metrics: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
        // Clé unique pour les métriques d'exercice
        const key = `${userId}:exercise:${exerciseId}`;

        // Stocker les métriques en mémoire
        this.exerciseMetrics.set(key, { ...metrics });

        // Sauvegarder dans le stockage persistant si activé
        if (this.options.enablePersistence && this.persistentStorage) {
            await this.persistentStorage.saveExerciseMetric(userId, exerciseId, metrics);
        }

        return metrics;
    }

    /**
     * Récupère les métriques pour un utilisateur
     * 
     * @method getMetrics
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {MetricsFilterOptions} [options] - Options de filtrage (non utilisées pour l'instant)
     * @returns {Promise<Record<string, LearningMetric>>} Métriques de l'utilisateur
     * @public
     */
    public async getMetrics(
        userId: string,
        _options?: MetricsFilterOptions
    ): Promise<Record<string, LearningMetric>> {
        // Récupérer le profil utilisateur
        const profile = await this.loadProfile(userId);

        if (!profile) {
            return {};
        }

        // Combiner les métriques standards et personnalisées
        const metrics: Record<string, LearningMetric> = {};

        // Ajouter les métriques standards si présentes
        if (profile.standardMetrics) {
            Object.assign(metrics, profile.standardMetrics);
        }

        // Ajouter les métriques personnalisées si présentes
        if (profile.customMetrics) {
            Object.assign(metrics, profile.customMetrics);
        }

        return metrics;
    }

    /**
     * Initialise le stockage persistant selon le mode choisi
     * 
     * @method initializePersistentStorage
     * @private
     */
    private initializePersistentStorage(): void {
        this.persistentStorage = createStorageProvider(this.options.storageMode, this.options.dbUrl);
    }

    /**
     * Fusionne deux listes d'entrées d'historique en évitant les doublons
     * 
     * @method mergeHistoryEntries
     * @param {MetricHistoryEntry[]} list1 - Première liste
     * @param {MetricHistoryEntry[]} list2 - Deuxième liste
     * @returns {MetricHistoryEntry[]} Liste fusionnée sans doublons
     * @private
     */
    private mergeHistoryEntries(list1: MetricHistoryEntry[], list2: MetricHistoryEntry[]): MetricHistoryEntry[] {
        const merged: MetricHistoryEntry[] = [...list1];
        const timestamps = new Set(list1.map((entry) => entry.timestamp.getTime()));

        for (let i = 0; i < list2.length; i++) {
            const entry = list2[i];
            if (!timestamps.has(entry.timestamp.getTime())) {
                merged.push(entry);
                timestamps.add(entry.timestamp.getTime());
            }
        }

        return merged;
    }

    /**
     * Traite les entrées d'historique (filtrage, tri, pagination)
     * 
     * @method processHistoryEntries
     * @param {MetricHistoryEntry[]} entries - Entrées d'historique à traiter
     * @param {MetricsFilterOptions} [options] - Options de filtrage
     * @returns {Array<{ timestamp: Date; value: unknown }>} Entrées traitées au format attendu
     * @private
     */
    private processHistoryEntries(
        entries: MetricHistoryEntry[],
        options?: MetricsFilterOptions
    ): Array<{ timestamp: Date; value: unknown }> {
        let result: MetricHistoryEntry[] = [...entries];

        // Appliquer les filtres
        if (options) {
            if (options.startDate) {
                result = result.filter(entry => entry.timestamp >= options.startDate!);
            }

            if (options.endDate) {
                result = result.filter(entry => entry.timestamp <= options.endDate!);
            }

            // Appliquer la pagination
            if (options.limit !== undefined || options.offset !== undefined) {
                const offset = options.offset || 0;
                const limit = options.limit === undefined ? result.length : options.limit;
                result = result.slice(offset, offset + limit);
            }
        }

        // Trier par ordre chronologique
        result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        // Convertir au format attendu
        return result.map(entry => ({
            timestamp: entry.timestamp,
            value: entry.value
        }));
    }

    /**
     * Enregistre un événement métrique
     * 
     * @method recordEvent
     * @param {string} eventName - Nom de l'événement
     * @param {Record<string, unknown>} data - Données de l'événement
     * @public
     * @description Méthode de compatibilité pour l'enregistrement d'événements
     */
    public recordEvent(eventName: string, data: Record<string, unknown>): void {
        // Pour la compatibilité avec l'ancien code
        // Les événements peuvent être convertis en métriques si nécessaire
        console.log(`MetricsStore: Recording event ${eventName}`, data);
    }
}