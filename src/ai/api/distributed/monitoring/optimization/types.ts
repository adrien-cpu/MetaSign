/**
 * src/ai/api/distributed/monitoring/optimization/types.ts
 * Types pour le système d'équilibrage de charge distribué
 */

/**
 * Représente un nœud dans le système distribué
 */
export interface Node {
    /** Identifiant unique du nœud */
    id: string;

    /** Statut actuel du nœud */
    status: NodeStatus;

    /** Capacité CPU du nœud */
    cpuCapacity: number;

    /** Capacité mémoire du nœud en Mo */
    memoryCapacity: number;

    /** Adresse IP ou nom d'hôte */
    address: string;

    /** Type de nœud */
    nodeType: string;

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Statut possible d'un nœud
 */
export type NodeStatus = 'online' | 'offline' | 'maintenance' | 'degraded';

/**
 * Analyse de charge du système
 */
export interface LoadAnalysis {
    /** Charge globale du système (0-1) */
    systemLoad: number;

    /** Charges individuelles des nœuds */
    nodeLoads: NodeLoad[];

    /** Points chauds détectés */
    hotspots: Hotspot[];

    /** Niveau de déséquilibre (0-1) */
    imbalance: number;

    /** Recommandations de l'analyseur */
    recommendations: string[];
}

/**
 * Charge d'un nœud spécifique
 */
export interface NodeLoad {
    /** ID du nœud */
    nodeId: string;

    /** Charge CPU (0-1) */
    cpuLoad: number;

    /** Charge mémoire (0-1) */
    memoryLoad: number;

    /** Charge réseau (0-1) */
    networkLoad: number;
}

/**
 * Point chaud dans le système
 */
export interface Hotspot {
    /** ID du nœud concerné */
    nodeId: string;

    /** Type de ressource surchargée */
    resourceType: ResourceType;

    /** Sévérité (0-1) */
    severity: number;
}

/**
 * Type de ressource système
 */
export type ResourceType = 'cpu' | 'memory' | 'network' | 'disk';

/**
 * Tendance de charge prévue
 */
export interface LoadTrend {
    /** Charge prévue */
    predicted: {
        systemLoad: number;
        topNodeLoad: number;
    };

    /** Confiance dans la prédiction (0-1) */
    confidence: number;

    /** Direction de la tendance */
    trend: 'increasing' | 'decreasing' | 'stable';

    /** Horizon temporel en minutes */
    timeFrame: number;
}

/**
 * Plan d'équilibrage de charge
 */
export interface BalancingPlan {
    /** Migrations de charges de travail à effectuer */
    migrations: Migration[];

    /** Actions de scaling à effectuer */
    scaling: ScalingAction[];

    /** Priorité globale du plan (0-100) */
    priority: number;
}

/**
 * Niveau de priorité
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * Migration d'une charge de travail
 */
export interface Migration {
    /** ID de la charge de travail à migrer */
    workloadId: string;

    /** ID du nœud source */
    sourceNodeId: string;

    /** ID du nœud cible */
    targetNodeId: string;

    /** Priorité de la migration */
    priority: PriorityLevel;

    /** Temps d'arrêt estimé en secondes */
    estimatedDowntime: number;
}

/**
 * Type d'action de scaling
 */
export type ScalingActionType = 'scaleOut' | 'scaleIn' | 'scaleUp' | 'scaleDown';

/**
 * Action de scaling (horizontale ou verticale)
 */
export interface ScalingAction {
    /** Type d'action */
    actionType: ScalingActionType;

    /** ID du nœud concerné (null pour scaleOut) */
    nodeId: string | null;

    /** Type de ressource à scaler */
    resourceType: 'node' | ResourceType;

    /** Variation de ressources (+1 = ajout, -1 = retrait) */
    delta: number;

    /** Priorité de l'action */
    priority: PriorityLevel;

    /** Raison de cette action */
    reason: string;
}

/**
 * Résultat d'une opération d'équilibrage
 */
export interface BalancingResult {
    /** Succès de l'opération */
    success: boolean;

    /** Message d'erreur si échec */
    error?: string;

    /** Migrations effectuées */
    migrations: Migration[];

    /** Actions de scaling effectuées */
    scalingActions: ScalingAction[];

    /** Métriques avant/après */
    metrics: {
        beforeBalance: SystemPerformanceMetrics | null;
        afterBalance: SystemPerformanceMetrics | null;
        improvement: number; // Pourcentage d'amélioration
    };
}

/**
 * Métriques de performance du système
 */
export interface SystemPerformanceMetrics {
    /** Charge CPU moyenne (0-1) */
    avgCpuLoad: number;

    /** Charge mémoire moyenne (0-1) */
    avgMemoryLoad: number;

    /** Charge réseau moyenne (0-1) */
    avgNetworkLoad: number;

    /** Temps de réponse moyen en ms */
    responseTime: number;

    /** Débit en requêtes/seconde */
    throughput: number;

    /** Taux d'erreur (0-1) */
    errorRate: number;
}