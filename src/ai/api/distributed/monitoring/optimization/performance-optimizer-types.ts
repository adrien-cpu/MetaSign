/**
 * src/ai/api/distributed/monitoring/optimization/performance-optimizer-types.ts
 * Types pour le système d'optimisation de performance
 */

import { SystemPerformanceMetrics } from './types';

// Ré-exporter SystemPerformanceMetrics pour permettre son import depuis d'autres modules
export type { SystemPerformanceMetrics } from './types';

/**
 * Résultat d'une analyse de performance
 */
export interface PerformanceReport {
    /** Métriques de performance actuelles */
    metrics: SystemPerformanceMetrics;

    /** Goulots d'étranglement identifiés */
    bottlenecks: Bottleneck[];

    /** Opportunités d'optimisation identifiées */
    optimizationOpportunities: OptimizationOpportunity[];

    /** Recommandations */
    recommendations: string[];

    /** Horodatage du rapport */
    timestamp: number;
}

/**
 * Représente un goulot d'étranglement identifié dans le système
 */
export interface Bottleneck {
    /** Type de ressource concernée */
    resourceType: 'cpu' | 'memory' | 'network' | 'disk' | 'cache' | 'database';

    /** Composant système concerné */
    component: string;

    /** Sévérité du problème (0-1) */
    severity: number;

    /** Impact estimé sur la performance (0-1) */
    impact: number;

    /** Description du problème */
    description: string;
}

/**
 * Représente une opportunité d'optimisation
 */
export interface OptimizationOpportunity {
    /** Type d'opportunité */
    type: OptimizationType;

    /** Composant système concerné */
    component: string;

    /** Gain potentiel estimé (0-1) */
    potentialGain: number;

    /** Complexité de mise en œuvre (0-1) */
    implementationComplexity: number;

    /** Description de l'opportunité */
    description: string;
}

/**
 * Types d'optimisation possibles
 */
export type OptimizationType =
    | 'resource-scaling'
    | 'load-balancing'
    | 'caching'
    | 'query-optimization'
    | 'code-optimization'
    | 'concurrency-improvement'
    | 'memory-management'
    | 'network-optimization';

/**
 * Plan d'optimisation
 */
export interface OptimizationPlan {
    /** ID unique du plan */
    id: string;

    /** Actions d'optimisation à effectuer */
    actions: OptimizationAction[];

    /** Gain de performance attendu (0-1) */
    expectedGain: number;

    /** Risque d'impact négatif (0-1) */
    riskLevel: number;

    /** Effort d'implémentation estimé (heures) */
    estimatedEffort: number;

    /** Priorité du plan (0-100) */
    priority: number;

    /** Dépendances avec d'autres plans */
    dependencies: string[];
}

/**
 * Action d'optimisation individuelle
 */
export interface OptimizationAction {
    /** ID unique de l'action */
    id: string;

    /** Type d'action */
    type: OptimizationType;

    /** Composant cible */
    targetComponent: string;

    /** Description de l'action */
    description: string;

    /** Paramètres spécifiques à l'action */
    parameters: Record<string, unknown>;

    /** Gain attendu pour cette action (0-1) */
    expectedGain: number;

    /** Complexité d'implémentation (0-1) */
    complexity: number;
}

/**
 * Résultat d'une optimisation
 */
export interface OptimizationResult {
    /** ID du plan exécuté */
    planId: string;

    /** Succès de l'opération */
    success: boolean;

    /** Message d'erreur si échec */
    error: string | undefined;

    /** Actions exécutées avec succès */
    completedActions: string[];

    /** Actions échouées */
    failedActions: string[];

    /** Métriques avant optimisation */
    beforeMetrics: SystemPerformanceMetrics;

    /** Métriques après optimisation */
    afterMetrics: SystemPerformanceMetrics;

    /** Amélioration réelle observée (0-1) */
    actualImprovement: number;

    /** Date de début d'exécution */
    startedAt: number;

    /** Date de fin d'exécution */
    completedAt: number;
}