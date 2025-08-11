/**
 * Types pour les métriques et KPIs de santé
 */
import { SystemHealth } from '@monitoring/health/types/health.types';

/**
 * Entrée dans l'historique de santé
 */
export interface HealthHistoryEntry {
    /** Timestamp de l'entrée */
    timestamp: number;

    /** Statut de santé du système */
    status: SystemHealth;
}

/**
 * Indicateurs de performance clés pour la santé du système
 */
export interface HealthKPIs {
    /** Pourcentage de temps où le système était fonctionnel */
    uptime: number;

    /** Temps moyen entre pannes (Mean Time Between Failures) en ms */
    mtbf: number;

    /** Temps moyen de récupération (Mean Time To Recovery) en ms */
    mttr: number;

    /** Timestamp de la dernière panne */
    lastFailure: number | null;

    /** Nombre total de pannes observées */
    failureCount: number;
}

/**
 * Entrée d'une métrique
 */
export interface MetricEntry {
    /** Timestamp de la mesure */
    timestamp: number;

    /** Valeur de la métrique */
    value: number;
}

/**
 * Structure de stockage des métriques
 */
export type MetricsStore = Map<string, Array<MetricEntry>>;