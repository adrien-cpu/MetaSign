import {
    ResourceRequest,
    ResourceAllocation,
    AllocatedResources,
    PerformanceMetrics,
    QualityMetrics,
    ResourceOptimization
} from '../types/ResourceTypes';

/**
 * Classe utilitaire pour les opérations liées aux ressources
 */
export class ResourceUtils {
    /**
     * Génère un identifiant unique
     * @returns Identifiant unique
     */
    public static generateId(): string {
        return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Estime les métriques de performance en fonction des ressources allouées
     * @param resources Ressources allouées
     * @param request Demande de ressources originale
     * @returns Métriques de performance estimées
     */
    public static estimatePerformanceMetrics(
        resources: AllocatedResources,
        request: ResourceRequest
    ): PerformanceMetrics {
        // Calculs approximatifs basés sur les ressources allouées et requises
        const resourceRatio = Math.min(
            resources.memory / request.memory,
            resources.gpu / request.gpu,
            resources.cpu / request.cpu
        );

        // Base performance
        const baseFrameRate = 60;
        const baseLatency = 16.67; // ms (1000/60)
        const baseRenderTime = 12; // ms
        const baseMorphingTime = 4; // ms

        return {
            frameRate: Math.min(baseFrameRate, baseFrameRate * resourceRatio),
            latency: baseLatency / resourceRatio,
            renderTime: baseRenderTime / resourceRatio,
            morphingTime: baseMorphingTime / resourceRatio
        };
    }

    /**
     * Estime les métriques de qualité en fonction des ressources allouées
     * @param resources Ressources allouées
     * @param request Demande de ressources originale
     * @returns Métriques de qualité estimées
     */
    public static estimateQualityMetrics(
        resources: AllocatedResources,
        request: ResourceRequest
    ): QualityMetrics {
        // Ratio des ressources disponibles par rapport à celles requises
        const memoryRatio = Math.min(1, resources.memory / request.memory);
        const gpuRatio = Math.min(1, resources.gpu / request.gpu);
        const cpuRatio = Math.min(1, resources.cpu / request.cpu);

        // La qualité est pondérée différemment selon les ressources
        const detailLevel = memoryRatio * 0.7 + gpuRatio * 0.3;
        const stability = cpuRatio * 0.6 + gpuRatio * 0.4;
        const expressionAccuracy = memoryRatio * 0.3 + cpuRatio * 0.7;

        // Qualité globale
        const overallQuality = (detailLevel + stability + expressionAccuracy) / 3;

        return {
            overallQuality,
            detailLevel,
            stability,
            expressionAccuracy
        };
    }

    /**
     * Crée une allocation de ressources complète
     * @param request Demande de ressources
     * @param resources Ressources allouées
     * @returns Allocation complète
     */
    public static createAllocation(
        request: ResourceRequest,
        resources: AllocatedResources
    ): ResourceAllocation {
        const id = this.generateId();
        const performance = this.estimatePerformanceMetrics(resources, request);
        const quality = this.estimateQualityMetrics(resources, request);

        return {
            id,
            resources,
            performance,
            quality,
            timestamp: Date.now(),
            requestId: request.id
        };
    }

    /**
     * Identifie les opportunités d'optimisation potentielles
     * @param currentUsage Utilisation actuelle
     * @param allocations Allocations actives
     * @returns Liste d'optimisations potentielles
     */
    public static identifyOptimizationOpportunities(
        currentUsage: { memory: number; gpu: number; cpu: number },
        allocations: ResourceAllocation[]
    ): ResourceOptimization[] {
        const optimizations: ResourceOptimization[] = [];

        // Optimisation mémoire si usage élevé
        if (currentUsage.memory > 0.7) {
            optimizations.push({
                type: 'MEMORY',
                description: 'Réduction des buffers de morphing',
                impact: 0.2,
                parameters: {
                    reductionFactor: 0.3
                }
            });
        }

        // Optimisation GPU si usage élevé
        if (currentUsage.gpu > 0.8) {
            optimizations.push({
                type: 'GPU',
                description: 'Réduction de la résolution de rendu',
                impact: 0.25,
                parameters: {
                    qualityReduction: 0.2
                }
            });
        }

        // Optimisation CPU si usage élevé
        if (currentUsage.cpu > 0.75) {
            optimizations.push({
                type: 'CPU',
                description: 'Réduction de la fréquence de mise à jour',
                impact: 0.15,
                parameters: {
                    updateRateReduction: 0.1
                }
            });
        }

        // Si peu d'allocations, pas besoin d'optimiser la qualité
        if (allocations.length > 5) {
            optimizations.push({
                type: 'QUALITY',
                description: 'Réduction globale de la qualité',
                impact: 0.1,
                parameters: {
                    qualityFactor: 0.85
                }
            });
        }

        return optimizations;
    }
}