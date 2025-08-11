/**
 * @file src/ai/services/learning/metrics/index.ts
 * @description Point d'entrée principal pour le module de métriques d'apprentissage
 * @module Metrics
 * 
 * Ce fichier exporte tous les composants publics du système de métriques
 * pour faciliter leur utilisation dans d'autres modules.
 */

// Exportation du collecteur principal
export { LearningMetricsCollector } from './LearningMetricsCollector';

// Exportation des interfaces
export * from './interfaces/MetricsInterfaces';

// Exportation des types étendus
export * from './types/DetailedMetricsTypes';
export * from './types/MetricsTypes';

// Exportation des gestionnaires
export { MetricsProfileManager } from './managers/MetricsProfileManager';
export { CustomMetricsManager } from './managers/CustomMetricsManager';
export { MetricsSnapshotManager } from './managers/MetricsSnapshotManager';

// Exportation des processeurs
export { PerformanceMetricsProcessor } from './processors/PerformanceMetricsProcessor';
export { MasteryMetricsProcessor } from './processors/MasteryMetricsProcessor';

// Exportation des calculateurs
export { MetricsCalculator } from './calculators/MetricsCalculator';

// Exportation du store
export { MetricsStore } from './MetricsStore';

// Exportation des utilitaires
export * from './utils/MetricsUtils';
export { MetricsStorageProvider, createStorageProvider } from './providers/MetricsStorageProvider';

/**
 * Configuration par défaut pour le système de métriques
 * @constant
 */
export const DEFAULT_METRICS_CONFIG = {
    rollingAverageWindow: 20,
    successThreshold: 0.6,
    cacheTTL: 60000, // 1 minute
    enableAutoSnapshots: true,
    snapshotInterval: 5, // minutes
    maxCustomMetricsPerUser: 50,
    retentionPeriod: 365 // jours
} as const;

/**
 * Factory pour créer une instance configurée du collecteur de métriques
 * 
 * @function createMetricsCollector
 * @param {Partial<MetricsConfiguration>} config - Configuration personnalisée
 * @returns {LearningMetricsCollector} Instance configurée
 * 
 * @example
 * ```typescript
 * const collector = createMetricsCollector({
 *   enableAutoSnapshots: true,
 *   cacheTTL: 120000
 * });
 * ```
 */
export function createMetricsCollector(
    config?: Partial<import('./types/DetailedMetricsTypes').MetricsConfiguration>
): LearningMetricsCollector {
    return new LearningMetricsCollector({
        ...DEFAULT_METRICS_CONFIG,
        ...config
    });
}

/**
 * Utilitaire pour formater les métriques pour l'affichage
 * 
 * @function formatMetricValue
 * @param {unknown} value - Valeur à formater
 * @param {string} type - Type de métrique
 * @param {string} unit - Unité (optionnelle)
 * @returns {string} Valeur formatée
 * 
 * @example
 * ```typescript
 * const formatted = formatMetricValue(0.85, 'percent'); // "85%"
 * ```
 */
export function formatMetricValue(
    value: unknown,
    type?: string,
    unit?: string
): string {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    switch (type) {
        case 'percent':
            return `${Math.round((value as number) * 100)}%`;

        case 'time':
            return formatDuration(value as number);

        case 'count':
            return `${value}${unit ? ` ${unit}` : ''}`;

        case 'boolean':
            return value ? 'Oui' : 'Non';

        default:
            return `${value}${unit ? ` ${unit}` : ''}`;
    }
}

/**
 * Formate une durée en format lisible
 * 
 * @function formatDuration
 * @param {number} minutes - Durée en minutes
 * @returns {string} Durée formatée
 */
function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
}