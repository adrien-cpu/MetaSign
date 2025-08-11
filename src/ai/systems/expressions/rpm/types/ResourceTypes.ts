import { RPMMorphTargets } from '../RPMMorphTargets';

/**
 * Interface pour une demande d'allocation de ressources
 */
export interface ResourceRequest {
    /** Mémoire requise (en Mo) */
    memory: number;
    /** Puissance GPU requise (0-1) */
    gpu: number;
    /** Puissance CPU requise (0-1) */
    cpu: number;
    /** Priorité de la demande */
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    /** Cibles de morphing associées à cette demande */
    morphTargets: RPMMorphTargets;
    /** Identifiant unique optionnel */
    id?: string;
    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Interface pour les ressources allouées
 */
export interface AllocatedResources {
    /** Mémoire allouée (en Mo) */
    memory: number;
    /** Puissance GPU allouée (0-1) */
    gpu: number;
    /** Puissance CPU allouée (0-1) */
    cpu: number;
    /** Temps d'allocation (ms) */
    allocationTime: number;
}

/**
 * Interface pour les métriques de performance
 */
export interface PerformanceMetrics {
    /** Taux de rafraîchissement estimé (fps) */
    frameRate: number;
    /** Latence estimée (ms) */
    latency: number;
    /** Temps de rendu moyen par frame (ms) */
    renderTime: number;
    /** Temps de calcul des morph targets (ms) */
    morphingTime: number;
}

/**
 * Interface pour les métriques de qualité
 */
export interface QualityMetrics {
    /** Score global de qualité (0-1) */
    overallQuality: number;
    /** Niveau de détail (0-1) */
    detailLevel: number;
    /** Stabilité des animations (0-1) */
    stability: number;
    /** Précision des expressions (0-1) */
    expressionAccuracy: number;
}

/**
 * Interface pour une allocation de ressources complète
 */
export interface ResourceAllocation {
    /** Identifiant unique de l'allocation */
    id: string;
    /** Ressources allouées */
    resources: AllocatedResources;
    /** Métriques de performance */
    performance: PerformanceMetrics;
    /** Métriques de qualité */
    quality: QualityMetrics;
    /** Horodatage de l'allocation */
    timestamp: number;
    /** Identifiant de la demande source */
    requestId?: string;
}

/**
 * Interface pour la disponibilité des ressources
 */
export interface ResourceAvailability {
    /** Indique si les ressources sont globalement disponibles */
    isAvailable: boolean;
    /** Détails par type de ressource */
    details: {
        memory: ResourceDetail;
        gpu: ResourceDetail;
        cpu: ResourceDetail;
    };
}

/**
 * Interface pour le détail de disponibilité d'une ressource
 */
export interface ResourceDetail {
    /** Quantité disponible */
    available: number;
    /** Quantité requise */
    required: number;
    /** Indique si l'allocation est possible */
    canAllocate: boolean;
}

/**
 * Interface pour la vérification de qualité d'une allocation
 */
export interface QualityCheck {
    /** Indique si la qualité est acceptable */
    isAcceptable: boolean;
    /** Vérification des performances */
    performance: PerformanceCheck;
    /** Vérification de la stabilité */
    stability: StabilityCheck;
}

/**
 * Interface pour la vérification des performances
 */
export interface PerformanceCheck {
    /** Indique si les performances sont acceptables */
    isAcceptable: boolean;
    /** Taux de rafraîchissement (fps) */
    frameRate: number;
    /** Latence (ms) */
    latency: number;
}

/**
 * Interface pour la vérification de la stabilité
 */
export interface StabilityCheck {
    /** Indique si la stabilité est acceptable */
    isStable: boolean;
    /** Gigue (ms) */
    jitter: number;
    /** Taux de perte de frames (0-1) */
    dropRate: number;
}

/**
 * Interface pour l'optimisation des ressources
 */
export interface ResourceOptimization {
    /** Type d'optimisation */
    type: 'MEMORY' | 'GPU' | 'CPU' | 'QUALITY';
    /** Description de l'optimisation */
    description: string;
    /** Impact estimé (0-1) */
    impact: number;
    /** Paramètres spécifiques à l'optimisation */
    parameters: Record<string, unknown>;
}

/**
 * Interface pour le résultat d'une optimisation
 */
export interface OptimizationResult {
    /** Liste des optimisations appliquées */
    optimizations: ResourceOptimization[];
    /** Impact sur les ressources */
    impact: {
        /** Mémoire économisée (Mo) */
        memoryReduced: number;
        /** GPU économisé (0-1) */
        gpuReduced: number;
        /** CPU économisé (0-1) */
        cpuReduced: number;
    };
    /** Impact sur la qualité (-1 à 1, négatif = dégradation) */
    qualityImpact: number;
}

/**
 * Interface pour le statut des ressources
 */
export interface ResourceStatus {
    /** Utilisation actuelle */
    usage: {
        memory: number;
        gpu: number;
        cpu: number;
    };
    /** Indique si une optimisation est nécessaire */
    needsOptimization: boolean;
    /** Santé du système (0-1) */
    systemHealth: number;
    /** Problèmes détectés */
    issues: string[];
}