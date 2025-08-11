/**
 * @file src/ai/services/learning/metrics/types.ts
 * @description Types de base pour le module de métriques d'apprentissage
 * @module MetricsTypes
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module définit les types de base utilisés dans le module de métriques
 * d'apprentissage, y compris les configurations et les structures de données.
 */

/**
 * Configuration du collecteur de métriques
 * @interface MetricsConfiguration
 */
export interface MetricsConfiguration {
    /**
     * Taille de la fenêtre glissante pour les moyennes
     */
    rollingAverageWindow: number;

    /**
     * Seuil de réussite pour les exercices (0-1)
     */
    successThreshold: number;

    /**
     * Durée de vie du cache (en ms)
     */
    cacheTTL: number;

    /**
     * Activer la création automatique de snapshots
     */
    enableAutoSnapshots: boolean;

    /**
     * Intervalle entre les snapshots (en minutes)
     */
    snapshotInterval: number;
}

/**
 * Options du store de métriques
 * @interface MetricsStoreOptions
 */
export interface MetricsStoreOptions {
    /**
     * URL de la base de données
     */
    dbUrl?: string;

    /**
     * Période de rétention des données (en jours)
     */
    retentionPeriod?: number;

    /**
     * Activer la persistance des données
     */
    enablePersistence?: boolean;

    /**
     * Mode de stockage
     */
    storageMode?: 'memory' | 'database' | 'file';
}

/**
 * Entrée d'historique de métrique
 * @interface MetricHistoryEntry
 */
export interface MetricHistoryEntry {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Identifiant de la métrique
     */
    metricId: string;

    /**
     * Horodatage
     */
    timestamp: Date;

    /**
     * Valeur de la métrique
     */
    value: unknown;

    /**
     * Métadonnées
     */
    metadata?: Record<string, unknown>;
}

/**
 * Configuration du système de fine-tuning
 * @interface FineTuningConfig
 */
export interface FineTuningConfig {
    /**
     * Activer le fine-tuning local
     */
    enableLocalFineTuning: boolean;

    /**
     * Seuil d'éligibilité pour le fine-tuning
     */
    eligibilityThreshold: number;

    /**
     * Taille maximale du modèle local (en Mo)
     */
    maxLocalModelSize: number;

    /**
     * Intervalle de synchronisation avec le serveur (en ms)
     */
    syncInterval: number;
}

/**
 * Informations sur les ressources système
 * @interface SystemResources
 */
export interface SystemResources {
    /**
     * Mémoire disponible (en Mo)
     */
    availableMemory: number;

    /**
     * Charge CPU
     */
    cpuLoad: number;

    /**
     * Espace de stockage disponible (en Mo)
     */
    availableStorage: number;

    /**
     * Indicateur de compatibilité GPU
     */
    gpuAvailable: boolean;

    /**
     * Détails sur le GPU si disponible
     */
    gpuDetails?: Record<string, unknown>;
}

/**
 * Niveaux de priorité des métriques
 * @enum {number}
 */
export enum MetricPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3
}

/**
 * Statut de synchronisation des métriques
 * @enum {string}
 */
export enum SyncStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    SKIPPED = 'skipped'
}

/**
 * Événement de métriques
 * @interface MetricsEvent
 */
export interface MetricsEvent {
    /**
     * Type d'événement
     */
    type: string;

    /**
     * Horodatage
     */
    timestamp: Date;

    /**
     * Données de l'événement
     */
    data: Record<string, unknown>;

    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Identifiant de la session
     */
    sessionId?: string;

    /**
     * Priorité
     */
    priority?: MetricPriority;
}

/**
 * Options d'exportation de métriques
 * @interface MetricsExportOptions
 */
export interface MetricsExportOptions {
    /**
     * Format d'exportation
     */
    format: 'json' | 'csv' | 'excel';

    /**
     * Inclure les métadonnées
     */
    includeMetadata: boolean;

    /**
     * Fusionner les données liées
     */
    mergeRelatedData: boolean;

    /**
     * Période de début
     */
    startDate?: Date;

    /**
     * Période de fin
     */
    endDate?: Date;

    /**
     * Liste des métriques à inclure
     */
    includeMetrics?: string[];

    /**
     * Liste des métriques à exclure
     */
    excludeMetrics?: string[];
}