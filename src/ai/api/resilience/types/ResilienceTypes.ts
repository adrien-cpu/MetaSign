// src/ai/api/resilience/types/ResilienceTypes.ts

import { Anomaly as BaseAnomaly } from '../../common/detection/types/AnomalyTypes';

// Réutilisation du type Anomaly importé
export type Anomaly = BaseAnomaly;

// Définir notre propre version de SystemMetrics
export interface SystemMetrics {
    /** Utilisation CPU (%) */
    cpu: number;
    /** Utilisation mémoire (%) */
    memory?: number;
    /** Utilisation disque (%) */
    disk?: number;
    /** Taux d'erreurs (%) */
    errorRate?: number;
    /** Latence (ms) */
    latency?: number;
    /** Débit (req/s) */
    throughput?: number;
    /** Nombre de connexions actives */
    connections?: number;
    /** Statistiques de file d'attente */
    queue?: {
        size: number;
        waitTime: number;
        throughput: number;
    };
    /** Horodatage de collecte */
    collectedAt?: number;
    /** Métriques additionnelles */
    [key: string]: unknown;
}

/**
 * Définit les types de ressources pouvant être gérées par le système de résilience
 */
export type ResourceType = 'service' | 'component' | 'node' | 'container' | 'database' | 'api';

/**
 * Types d'actions de guérison possibles (combinaison des types définis précédemment)
 */
export type HealingActionType =
    | 'restart'
    | 'scale'
    | 'reconfigure'
    | 'failover'
    | 'isolate'
    | 'reconnect'
    | 'purge'
    | 'redeploy'
    | 'throttle'
    | 'migrate';

/**
 * Cible d'une action de guérison
 */
export interface ActionTarget {
    /** Identifiant de la ressource */
    resource: string;
    /** Type de ressource */
    type: ResourceType;
    /** Localisation ou environnement de la ressource */
    location?: string;
    /** Identifiant du cluster ou de l'environnement */
    environment?: string;
    /** Contraintes à appliquer */
    constraints?: Record<string, unknown>;
    /** Tags additionnels pour le ciblage */
    tags?: Record<string, string>;
}

/**
 * Stratégie de backoff pour les tentatives
 */
export interface RetryPolicy {
    /** Nombre maximum de tentatives */
    maxAttempts: number;
    /** Délai initial avant nouvelle tentative (ms) */
    backoffMs: number;
    /** Délai maximum de backoff (ms) */
    maxBackoffMs: number;
    /** Facteur d'augmentation du délai entre les tentatives */
    factor?: number;
    /** Jitter pour éviter les tempêtes de tentatives (%) */
    jitter?: number;
}

/**
 * Plan de rollback en cas d'échec
 */
export interface RollbackPlan {
    /** Étapes de rollback */
    steps: string[];
    /** Points de contrôle */
    checkpoints: string[];
    /** Critères de validation */
    validationCriteria: string[];
}

/**
 * Évaluation de l'impact d'une action
 */
export interface ImpactAssessment {
    /** Sévérité de l'impact (0-10) */
    severity: number;
    /** Portée de l'impact */
    scope: string[];
    /** Durée estimée (ms) */
    duration: number;
    /** Options de mitigation */
    mitigationOptions: string[];
}

/**
 * Paramètres pour une action de guérison
 */
export interface ActionParameters {
    /** Délai maximal d'exécution (ms) */
    timeout: number;
    /** Stratégie de nouvelles tentatives */
    retryPolicy: RetryPolicy;
    /** Validation requise après exécution */
    requireValidation?: boolean;
    /** Taille cible en cas de scaling */
    targetSize?: number;
    /** Configurations spécifiques à appliquer */
    config?: Record<string, unknown>;
    /** Rollback automatique en cas d'échec */
    autoRollback?: boolean;
    /** Règles métier à appliquer */
    businessRules?: string[];
}

/**
 * Action de guérison complète
 */
export interface HealingAction {
    /** Identifiant unique de l'action */
    id: string;
    /** Type d'action */
    type: HealingActionType;
    /** Ressource cible */
    target: ActionTarget;
    /** Paramètres d'exécution */
    parameters: ActionParameters;
    /** Plan de rollback */
    rollbackPlan?: RollbackPlan;
    /** Priorité de l'action */
    priority: number;
    /** Dépendances à d'autres actions */
    dependencies?: string[];
    /** Horodatage de création */
    createdAt: number;
    /** Utilisateur ou service ayant initié l'action */
    initiator?: string;
    /** Contexte d'exécution additionnel */
    context?: Record<string, unknown>;
}

/**
 * Plan de guérison comportant plusieurs actions
 */
export interface HealingPlan {
    /** Actions du plan */
    actions: HealingAction[];
    /** Priorité globale du plan */
    priority: number;
    /** Durée estimée d'exécution (ms) */
    estimatedDuration: number;
}

/**
 * Résultat d'une action de guérison
 */
export interface ActionResult {
    /** Indicateur de succès */
    success: boolean;
    /** Métriques après exécution */
    metrics: SystemMetrics;
    /** Liste des changements effectués */
    changes: string[];
    /** Horodatage d'exécution */
    timestamp: number;
    /** Message d'erreur si échec */
    error?: string;
    /** Durée d'exécution (ms) */
    duration?: number;
    /** État avant/après si disponible */
    diff?: {
        before: Record<string, unknown>;
        after: Record<string, unknown>;
    };
}

/** Type pour les statuts possibles du système */
export type SystemStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';

/**
 * Santé du système
 */
export interface SystemHealth {
    /** État général du système */
    status: SystemStatus;
    /** Métriques du système */
    metrics: SystemMetrics;
    /** Anomalies détectées */
    anomalies: Anomaly[];
    /** Recommandations d'actions */
    recommendations: Array<{
        action: string;
        priority: number;
        impact: string;
    }>;
}

/**
 * État de résilience global du système
 */
export interface ResilienceState {
    /** Niveau de santé global (0-100) */
    healthScore: number;
    /** Statut de chaque composant */
    components: Record<string, {
        status: SystemStatus;
        metrics: Partial<SystemMetrics>;
        lastUpdated: number;
    }>;
    /** Actions de guérison actives */
    activeActions: HealingAction[];
    /** Historique récent des actions */
    recentActions: ActionResult[];
    /** Alarmes actuelles */
    alarms: {
        id: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        resource: string;
        createdAt: number;
    }[];
}