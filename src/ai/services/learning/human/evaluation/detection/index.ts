/**
 * Module de détection de lacunes - Exports principaux
 * 
 * @file src/ai/services/learning/human/evaluation/detection/index.ts
 * @description Exports centralisés pour le module de détection de lacunes
 * @version 1.0.0
 * @author MetaSign Learning Module
 */

// Services de détection spécialisés
export {
    KnowledgeGapDetector,
    type KnowledgeGapDetectorConfig,
    type KnowledgeGapAnalysisResult
} from './KnowledgeGapDetector';

export {
    CompetencyGapDetector,
    type CompetencyGapDetectorConfig,
    type CompetencyGapAnalysisResult
} from './CompetencyGapDetector';

export {
    ActivityRecommendationService,
    type ActivityRecommendationConfig,
    type ActivityRecommendationResult
} from './ActivityRecommendationService';

// Service unifié
export {
    UnifiedGapDetectorService,
    type UnifiedGapDetectorConfig,
    type UnifiedGapAnalysisResult
} from './UnifiedGapDetectorService';

// Réexports de compatibilité pour l'ancien système
export { KnowledgeGapDetector as KnowledgeGapDetectorLegacy } from './KnowledgeGapDetector';

// Imports directs pour les factory functions
import { UnifiedGapDetectorService } from './UnifiedGapDetectorService';
import { KnowledgeGapDetector } from './KnowledgeGapDetector';
import { CompetencyGapDetector } from './CompetencyGapDetector';
import { ActivityRecommendationService } from './ActivityRecommendationService';

/**
 * @description Factory function pour créer une instance du service unifié
 * @param {ConceptRelationshipGraph} conceptGraph - Graphe de relations entre concepts
 * @param {MetricsCollector} metricsCollector - Collecteur de métriques  
 * @param {UnifiedGapDetectorConfig} [config] - Configuration
 * @returns {UnifiedGapDetectorService} - Instance du service unifié
 */
export function createUnifiedGapDetector(
    conceptGraph: import('../graphs/ConceptRelationshipGraph').ConceptRelationshipGraph,
    metricsCollector: import('../../../registry/utils/MetricsCollector').MetricsCollector,
    config?: import('./UnifiedGapDetectorService').UnifiedGapDetectorConfig
): UnifiedGapDetectorService {
    return new UnifiedGapDetectorService(conceptGraph, metricsCollector, config);
}

/**
 * @description Factory function pour créer une instance du détecteur de lacunes de connaissances
 * @param {ConceptRelationshipGraph} conceptGraph - Graphe de relations entre concepts
 * @param {MetricsCollector} metricsCollector - Collecteur de métriques
 * @param {KnowledgeGapDetectorConfig} [config] - Configuration
 * @returns {KnowledgeGapDetector} - Instance du détecteur de connaissances
 */
export function createKnowledgeGapDetector(
    conceptGraph: import('../graphs/ConceptRelationshipGraph').ConceptRelationshipGraph,
    metricsCollector: import('../../../registry/utils/MetricsCollector').MetricsCollector,
    config?: import('./KnowledgeGapDetector').KnowledgeGapDetectorConfig
): KnowledgeGapDetector {
    return new KnowledgeGapDetector(conceptGraph, metricsCollector, config);
}

/**
 * @description Factory function pour créer une instance du détecteur de lacunes de compétences
 * @param {MetricsCollector} metricsCollector - Collecteur de métriques
 * @param {CompetencyGapDetectorConfig} [config] - Configuration
 * @returns {CompetencyGapDetector} - Instance du détecteur de compétences
 */
export function createCompetencyGapDetector(
    metricsCollector: import('../../../registry/utils/MetricsCollector').MetricsCollector,
    config?: import('./CompetencyGapDetector').CompetencyGapDetectorConfig
): CompetencyGapDetector {
    return new CompetencyGapDetector(metricsCollector, config);
}

/**
 * @description Factory function pour créer une instance du service de recommandation d'activités
 * @param {MetricsCollector} metricsCollector - Collecteur de métriques
 * @param {ActivityRecommendationConfig} [config] - Configuration
 * @returns {ActivityRecommendationService} - Instance du service de recommandation
 */
export function createActivityRecommendationService(
    metricsCollector: import('../../../registry/utils/MetricsCollector').MetricsCollector,
    config?: import('./ActivityRecommendationService').ActivityRecommendationConfig
): ActivityRecommendationService {
    return new ActivityRecommendationService(metricsCollector, config);
}

/**
 * @description Constantes pour la configuration par défaut
 */
export const DEFAULT_CONFIGS = {
    KNOWLEDGE_GAP_DETECTOR: {
        masteryThreshold: 70,
        minimumGapPriority: 3,
        enableDetailedMetrics: true,
        minimumConfidence: 0.4,
        maxRecommendedResources: 3
    } as import('./KnowledgeGapDetector').KnowledgeGapDetectorConfig,

    COMPETENCY_GAP_DETECTOR: {
        minimumImpact: 5,
        minimumPriority: 5,
        enableDetailedMetrics: true,
        maxGapsPerAnalysis: 10
    } as import('./CompetencyGapDetector').CompetencyGapDetectorConfig,

    ACTIVITY_RECOMMENDATION: {
        maxActivitiesPerGap: 3,
        maxSessionDuration: 1800,
        enableDetailedMetrics: true,
        defaultDifficulty: 3,
        minimumExpectedImpact: 5
    } as import('./ActivityRecommendationService').ActivityRecommendationConfig,

    UNIFIED_DETECTOR: {
        enableDetailedMetrics: true,
        autoDetectGaps: true
    } as Partial<import('./UnifiedGapDetectorService').UnifiedGapDetectorConfig>
} as const;

/**
 * @description Types utilitaires pour le module de détection
 */
export type GapDetectionServices = {
    readonly knowledgeGapDetector: import('./KnowledgeGapDetector').KnowledgeGapDetector;
    readonly competencyGapDetector: import('./CompetencyGapDetector').CompetencyGapDetector;
    readonly activityRecommendationService: import('./ActivityRecommendationService').ActivityRecommendationService;
    readonly unifiedService: import('./UnifiedGapDetectorService').UnifiedGapDetectorService;
};

/**
 * @description Helper function pour créer tous les services de détection en une fois
 * @param {ConceptRelationshipGraph} conceptGraph - Graphe de relations entre concepts
 * @param {MetricsCollector} metricsCollector - Collecteur de métriques
 * @param {object} [configs] - Configurations pour chaque service
 * @returns {GapDetectionServices} - Tous les services de détection
 */
export function createAllGapDetectionServices(
    conceptGraph: import('../graphs/ConceptRelationshipGraph').ConceptRelationshipGraph,
    metricsCollector: import('../../../registry/utils/MetricsCollector').MetricsCollector,
    configs: {
        knowledgeGap?: import('./KnowledgeGapDetector').KnowledgeGapDetectorConfig;
        competencyGap?: import('./CompetencyGapDetector').CompetencyGapDetectorConfig;
        activityRecommendation?: import('./ActivityRecommendationService').ActivityRecommendationConfig;
        unified?: import('./UnifiedGapDetectorService').UnifiedGapDetectorConfig;
    } = {}
): GapDetectionServices {
    const knowledgeGapDetector = new KnowledgeGapDetector(
        conceptGraph,
        metricsCollector,
        configs.knowledgeGap
    );

    const competencyGapDetector = new CompetencyGapDetector(
        metricsCollector,
        configs.competencyGap
    );

    const activityRecommendationService = new ActivityRecommendationService(
        metricsCollector,
        configs.activityRecommendation
    );

    const unifiedService = new UnifiedGapDetectorService(
        conceptGraph,
        metricsCollector,
        configs.unified
    );

    return {
        knowledgeGapDetector,
        competencyGapDetector,
        activityRecommendationService,
        unifiedService
    };
}