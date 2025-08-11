/**
 * Types centralisés pour l'intégration Pyramide IA MetaSign
 * @file src/ai/services/learning/human/coda/codavirtuel/integration/types/index.ts
 * @module ai/services/learning/human/coda/codavirtuel/integration/types
 * @description Centralise tous les types pour l'intégration avec la pyramide IA
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-22
 */

import type { EvaluationResult, CECRLLevel, SupportedExerciseType } from '../../exercises';

// === TYPES CODA LOCAUX ===

/**
 * État d'apprentissage CODA local (éviter les dépendances circulaires)
 */
export interface CODALearningState {
    readonly currentLevel: CECRLLevel;
    readonly sessionProgress: number; // 0-1
    readonly overallProgress: number; // 0-1
    readonly strongAreas: readonly string[];
    readonly weakAreas: readonly string[];
    readonly recentPerformance: readonly number[];
    readonly emotionalState: {
        readonly confidence: number; // 0-1
        readonly motivation: number; // 0-1
        readonly frustration: number; // 0-1
        readonly engagement: number; // 0-1
        readonly confusion?: number; // 0-1
    };
    readonly learningContext: {
        readonly sessionId: string;
        readonly startTime: Date;
        readonly exerciseCount: number;
        readonly lastInteraction: Date;
    };
}

/**
 * Réponse CODA avec métadonnées enrichies
 */
export interface CODAResponse {
    readonly answer: unknown;
    readonly confidence: number; // 0-1
    readonly processingTime: number; // milliseconds
    readonly questionAsked?: string;
    readonly emotionalReaction: {
        readonly type: 'confusion' | 'understanding' | 'excitement' | 'frustration' | 'curiosity';
        readonly intensity: number; // 0-1
    };
    readonly metadata: {
        readonly responseId: string;
        readonly timestamp: Date;
        readonly simulatedErrors?: readonly string[];
        readonly learningInsights?: readonly string[];
    };
}

/**
 * Feedback enrichi du formateur IA
 */
export interface TrainerFeedback {
    readonly evaluation: EvaluationResult;
    readonly additionalComments?: string;
    readonly encouragement?: string;
    readonly corrections?: readonly string[];
    readonly nextSteps?: readonly string[];
    readonly culturalContext?: readonly string[];
}

// === TYPES PYRAMIDE IA ===

/**
 * Niveaux de la pyramide IA MetaSign
 */
export type PyramidLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Types de requêtes vers la pyramide
 */
export type PyramidRequestType = 'analysis' | 'synthesis' | 'guidance' | 'mentorship' | 'data_collection' | 'processing';

/**
 * Priorités des requêtes
 */
export type PyramidPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Requête vers un niveau de la pyramide
 */
export interface PyramidRequest<TData = unknown> {
    readonly requestId: string;
    readonly sourceLevel: PyramidLevel;
    readonly targetLevel: PyramidLevel;
    readonly requestType: PyramidRequestType;
    readonly priority: PyramidPriority;
    readonly data: TData;
    readonly context: {
        readonly userId: string;
        readonly sessionId: string;
        readonly timestamp: Date;
        readonly learningContext: Partial<CODALearningState>;
    };
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Réponse d'un niveau de la pyramide
 */
export interface PyramidResponse<TResult = unknown> {
    readonly responseId: string;
    readonly requestId: string;
    readonly fromLevel: PyramidLevel;
    readonly toLevel: PyramidLevel;
    readonly success: boolean;
    readonly result: TResult;
    readonly processingTime: number;
    readonly confidence: number; // 0-1
    readonly metadata: {
        readonly timestamp: Date;
        readonly aiModel: string;
        readonly resourcesUsed: readonly string[];
        readonly nextRecommendations?: readonly string[];
    };
    readonly errors?: readonly string[];
}

// === CONFIGURATION ===

/**
 * Configuration pour l'intégration avec la pyramide
 */
export interface PyramidIntegrationConfig {
    readonly enabledLevels: readonly PyramidLevel[];
    readonly timeouts: Readonly<Record<PyramidLevel, number>>;
    readonly retryPolicies: Readonly<Record<PyramidLevel, { maxRetries: number; backoffMs: number }>>;
    readonly loadBalancing: {
        readonly enabled: boolean;
        readonly strategy: 'round-robin' | 'least-loaded' | 'performance-based';
    };
    readonly caching: {
        readonly enabled: boolean;
        readonly ttlMs: number;
        readonly maxSize: number;
    };
}

// === ÉTAT SYSTÈME ===

/**
 * État d'un niveau de la pyramide
 */
export interface PyramidLevelState {
    readonly status: 'active' | 'busy' | 'error' | 'offline';
    readonly load: number; // 0-1
    readonly lastHeartbeat: Date;
    readonly capabilities: readonly string[];
    readonly performanceMetrics: {
        readonly avgResponseTime: number;
        readonly successRate: number;
        readonly totalRequests: number;
    };
}

/**
 * État global de la pyramide IA (version readonly pour l'exposition)
 */
export interface PyramidSystemState {
    readonly levels: Readonly<Record<PyramidLevel, PyramidLevelState>>;
    readonly globalMetrics: {
        readonly totalRequests: number;
        readonly avgSystemResponseTime: number;
        readonly systemHealth: number; // 0-1
        readonly bottlenecks: readonly PyramidLevel[];
    };
}

/**
 * État mutable de la pyramide (pour les mises à jour internes)
 */
export interface MutablePyramidSystemState {
    levels: Record<PyramidLevel, {
        status: 'active' | 'busy' | 'error' | 'offline';
        load: number; // 0-1
        lastHeartbeat: Date;
        readonly capabilities: readonly string[];
        performanceMetrics: {
            avgResponseTime: number;
            successRate: number;
            totalRequests: number;
        };
    }>;
    globalMetrics: {
        totalRequests: number;
        avgSystemResponseTime: number;
        systemHealth: number; // 0-1
        bottlenecks: readonly PyramidLevel[];
    };
}

// === ANALYSE COLLECTIVE ===

/**
 * Insights par niveau de la pyramide
 */
export interface PyramidLevelInsights {
    readonly level1: { // Capteurs
        readonly dataQuality: number;
        readonly signalStrength: number;
        readonly environmentalFactors: readonly string[];
    };
    readonly level2: { // Traitement
        readonly processingEfficiency: number;
        readonly dataTransformations: readonly string[];
        readonly qualityImprovements: readonly string[];
    };
    readonly level3: { // Synthétiseurs
        readonly synthesisQuality: number;
        readonly patterns: readonly string[];
        readonly correlations: readonly string[];
    };
    readonly level4: { // Analystes
        readonly analyticalDepth: number;
        readonly predictions: readonly string[];
        readonly riskFactors: readonly string[];
    };
    readonly level5: { // Assistants
        readonly assistanceQuality: number;
        readonly recommendations: readonly string[];
        readonly userSatisfaction: number;
    };
    readonly level6: { // Guides
        readonly guidanceEffectiveness: number;
        readonly adaptationSuccess: number;
        readonly learningPathOptimizations: readonly string[];
    };
    readonly level7: { // Mentors
        readonly mentoringQuality: number;
        readonly strategicInsights: readonly string[];
        readonly longTermPlanning: readonly string[];
    };
}

/**
 * Résultat d'analyse collective de la pyramide
 */
export interface CollectiveAnalysisResult {
    readonly analysisId: string;
    readonly timestamp: Date;
    readonly participatingLevels: readonly PyramidLevel[];
    readonly insights: PyramidLevelInsights;
    readonly collectiveRecommendations: readonly string[];
    readonly emergentBehaviors: readonly string[];
    readonly systemOptimizations: readonly string[];
}

/**
 * Données d'entrée pour l'analyse collective
 */
export interface CollectiveAnalysisInput {
    readonly exercise: {
        readonly id: string;
        readonly type: SupportedExerciseType;
        readonly content: unknown;
        readonly metadata?: {
            readonly level: CECRLLevel;
            readonly difficulty: number;
            readonly estimatedDuration: number;
        };
    };
    readonly response: CODAResponse;
    readonly learningState: CODALearningState;
    readonly basicEvaluation: EvaluationResult;
}

// === OPTIMISATION DE PARCOURS ===

/**
 * Étape d'un parcours d'apprentissage optimisé
 */
export interface OptimizedPathStep {
    readonly step: number;
    readonly level: CECRLLevel;
    readonly focusAreas: readonly string[];
    readonly recommendedExercises: readonly SupportedExerciseType[];
    readonly estimatedDuration: number; // en heures
    readonly milestones: readonly string[];
}

/**
 * Résultat d'optimisation de parcours
 */
export interface OptimizedLearningPath {
    readonly optimizedPath: readonly OptimizedPathStep[];
    readonly totalDuration: number;
    readonly successProbability: number;
    readonly adaptationPoints: readonly number[];
    readonly riskFactors: readonly string[];
    readonly supportRecommendations: readonly string[];
}

// === CONSTANTES ET UTILITAIRES ===

/**
 * Capacités par niveau de la pyramide
 */
export const PYRAMID_LEVEL_CAPABILITIES: Readonly<Record<PyramidLevel, readonly string[]>> = {
    1: ['data-collection', 'sensor-processing', 'signal-analysis'],
    2: ['data-processing', 'filtering', 'normalization', 'validation'],
    3: ['pattern-synthesis', 'data-aggregation', 'correlation-analysis'],
    4: ['predictive-analysis', 'trend-detection', 'risk-assessment'],
    5: ['recommendation-generation', 'assistance-provision', 'user-support'],
    6: ['adaptive-guidance', 'path-optimization', 'personalization'],
    7: ['strategic-mentorship', 'long-term-planning', 'supervision']
} as const;

/**
 * Configuration par défaut de la pyramide
 */
export const DEFAULT_PYRAMID_CONFIG: Required<PyramidIntegrationConfig> = {
    enabledLevels: [1, 2, 3, 4, 5, 6, 7],
    timeouts: {
        1: 1000,  // Capteurs - rapide
        2: 2000,  // Traitement - rapide
        3: 3000,  // Synthétiseurs - moyen
        4: 5000,  // Analystes - plus long
        5: 3000,  // Assistants - moyen
        6: 4000,  // Guides - moyen-long
        7: 6000   // Mentors - le plus long
    },
    retryPolicies: {
        1: { maxRetries: 3, backoffMs: 500 },
        2: { maxRetries: 3, backoffMs: 500 },
        3: { maxRetries: 2, backoffMs: 1000 },
        4: { maxRetries: 2, backoffMs: 1000 },
        5: { maxRetries: 3, backoffMs: 750 },
        6: { maxRetries: 2, backoffMs: 1000 },
        7: { maxRetries: 1, backoffMs: 2000 }
    },
    loadBalancing: {
        enabled: true,
        strategy: 'performance-based'
    },
    caching: {
        enabled: true,
        ttlMs: 300000, // 5 minutes
        maxSize: 1000
    }
} as const;