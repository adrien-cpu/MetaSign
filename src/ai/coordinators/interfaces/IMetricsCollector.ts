/**
 * @file: src/ai/coordinators/interfaces/IMetricsCollector.ts
 * 
 * Interfaces pour le collecteur de métriques.
 * Fournit les interfaces de base pour la gestion des métriques de performance.
 */

import { MetricValue, MetricTags, MetricType, MetricStats } from '../types/metrics.types';

/**
 * Interface de configuration pour le collecteur de métriques
 */
export interface MetricsCollectorConfig {
    /** Nombre maximal de valeurs à conserver par métrique */
    maxHistorySize?: number;
    /** Période de rétention des métriques en millisecondes */
    retentionPeriod?: number;
    /** Activer l'agrégation des métriques */
    enableAggregation?: boolean;
    /** Intervalle d'agrégation en millisecondes */
    aggregationInterval?: number;
}

/**
 * Interface pour le collecteur de métriques
 */
export interface IMetricsCollector {
    /**
     * Enregistre une valeur de métrique
     * @param name Nom de la métrique
     * @param value Valeur à enregistrer
     * @param type Type de métrique
     * @param tags Tags associés à la métrique
     */
    recordMetric(
        name: string,
        value: number,
        type?: MetricType,
        tags?: MetricTags
    ): void;

    /**
     * Récupère la dernière valeur d'une métrique
     * @param name Nom de la métrique
     * @param tags Tags pour filtrer (optionnel)
     * @returns Dernière valeur de la métrique ou undefined
     */
    getMetric(name: string, tags?: MetricTags): MetricValue | undefined;

    /**
     * Récupère toutes les métriques par préfixe
     * @param prefix Préfixe des noms de métriques
     * @returns Carte des dernières valeurs de métriques
     */
    getMetricsByPrefix(prefix: string): Map<string, MetricValue>;

    /**
     * Récupère l'historique d'une métrique
     * @param name Nom de la métrique
     * @param limit Limite du nombre de valeurs à retourner
     * @param tags Tags pour filtrer (optionnel)
     * @returns Historique des valeurs de la métrique
     */
    getMetricHistory(
        name: string,
        limit?: number,
        tags?: MetricTags
    ): MetricValue[];

    /**
     * Récupère toutes les métriques
     * @returns Toutes les dernières valeurs de métriques
     */
    getAllMetrics(): Record<string, number>;

    /**
     * Calcule des statistiques pour une métrique
     * @param name Nom de la métrique
     * @returns Statistiques calculées
     */
    getMetricStats(name: string): MetricStats | null;

    /**
     * Nettoie les métriques anciennes
     */
    cleanup(): void;

    /**
     * Réinitialise une métrique
     * @param name Nom de la métrique
     */
    resetMetric(name: string): void;

    /**
     * Réinitialise toutes les métriques
     */
    resetAllMetrics(): void;
}