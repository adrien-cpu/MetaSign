// src/ai/systems/expressions/rpm/types.ts

/**
 * Interface pour les cibles de morphing RPM
 */
export interface RPMMorphTargets {
    // Définir ici les propriétés de l'interface
    id?: string;
    values: Record<string, number>;
    weight?: number;
} // Assurez-vous que cette accolade fermante est présente

/**
 * Les niveaux de priorité pour les demandes de ressources
 */
export type ResourcePriority = 'HIGH' | 'MEDIUM' | 'LOW';


/**
 * Les types d'optimisations de ressources possibles
 */
export type OptimizationType = 'MEMORY' | 'GPU' | 'CPU' | 'COMPOSITE';

/**
 * Ressources allouées
 */
export interface AllocatedResources {
    memory: number;
    gpu: number;
    cpu: number;
    utilization: number;
}

/**
 * Métriques de performance
 */
export interface PerformanceMetrics {
    frameRate: number;
    latency: number;
    jitter: number;
    dropRate: number;
}

/**
 * Métriques de qualité
 */
export interface QualityMetrics {
    accuracy: number;
    stability: number;
    smoothness: number;
    overallScore: number;
}

/**
 * Demande de ressources
 */
export interface ResourceRequest {
    memory: number;
    gpu: number;
    cpu: number;
    priority: ResourcePriority;
    morphTargets?: RPMMorphTargets;
    timeout?: number;
    minAcceptable?: {
        memory: number;
        gpu: number;
        cpu: number;
    };
}

/**
 * Allocation de ressources
 */
export interface ResourceAllocation {
    id: string;
    resources: AllocatedResources;
    performance: PerformanceMetrics;
    quality: QualityMetrics;
}

/**
 * Détail d'une ressource spécifique
 */
export interface ResourceDetail {
    available: number;
    required: number;
    canAllocate: boolean;
}

/**
 * Disponibilité des ressources
 */
export interface ResourceAvailability {
    isAvailable: boolean;
    details: {
        memory: ResourceDetail;
        gpu: ResourceDetail;
        cpu: ResourceDetail;
    };
}

/**
 * Vérification des performances
 */
export interface PerformanceCheck {
    isAcceptable: boolean;
    frameRate: number;
    latency: number;
}

/**
 * Vérification de la stabilité
 */
export interface StabilityCheck {
    isStable: boolean;
    jitter: number;
    dropRate: number;
}

/**
 * Vérification de la qualité d'allocation
 */
export interface QualityCheck {
    isAcceptable: boolean;
    performance: PerformanceCheck;
    stability: StabilityCheck;
}

/**
 * Utilisation des ressources
 */
export interface ResourceUsage {
    memory: number;
    gpu: number;
    cpu: number;
    [key: string]: number;
}

/**
 * État des ressources
 */
export interface ResourceStatus {
    usage: ResourceUsage;
    needsOptimization: boolean;
    criticalThresholds: {
        memory: boolean;
        gpu: boolean;
        cpu: boolean;
    };
}

/**
 * Optimisation de ressource
 */
export interface ResourceOptimization {
    type: OptimizationType;
    target: string;
    reduction: number;
    impact: number;
    description: string;
}

/**
 * Résultat d'optimisation
 */
export interface OptimizationResult {
    optimizations: ResourceOptimization[];
    impact: {
        memoryReduced: number;
        gpuReduced: number;
        cpuReduced: number;
    };
    qualityImpact: number;
}

/**
 * Analyse de l'utilisation des ressources
 */
export interface ResourceUsageAnalysis {
    current: ResourceUsage;
    historical: {
        memory: number[];
        gpu: number[];
        cpu: number[];
    };
    patterns: {
        peakUsageTimes: number[];
        underutilizedTimes: number[];
        trends: string[];
    };
}

/**
 * Classe d'erreur RPM
 */
export class RPMError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RPMError';
    }

    getErrorType(): string {
        return 'runtime_error';
    }

    getSeverity(): string {
        return 'high';
    }
}