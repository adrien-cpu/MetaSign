/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types/CompatibilityTypes.ts
 * @description Types et interfaces pour le système de compatibilité CODA v4.0.0
 * 
 * Définit tous les types nécessaires pour l'analyse de compatibilité mentor-IA,
 * l'évaluation des styles d'enseignement et les métriques de performance.
 * 
 * @module types
 * @version 4.0.0 - Types de compatibilité CODA
 * @since 2025
 * @author MetaSign Team - CODA Compatibility Types
 * @lastModified 2025-07-27
 */

/**
 * Types d'environnement culturel supportés
 */
export type CulturalEnvironment =
    | 'france_metropolitan'
    | 'france_outremer'
    | 'belgium'
    | 'switzerland'
    | 'canada_quebec'
    | 'multicultural';

/**
 * Niveaux de compétence CECRL
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Types de personnalité pour l'analyse de compatibilité
 */
export type PersonalityType =
    | 'analytical'
    | 'logical'
    | 'creative'
    | 'intuitive'
    | 'empathetic'
    | 'social'
    | 'methodical'
    | 'structured'
    | 'adaptive'
    | 'flexible';

/**
 * Interface pour l'état complet d'une IA-élève
 */
export interface ComprehensiveAIStatus {
    readonly id: string;
    readonly name: string;
    readonly personality: PersonalityType;
    readonly currentLevel: CECRLLevel;
    readonly culturalContext: CulturalEnvironment;
    readonly learningPreferences: readonly string[];
    readonly strengths: readonly string[];
    readonly challenges: readonly string[];
    readonly progressHistory: readonly {
        date: string;
        level: CECRLLevel;
        score: number;
    }[];
}

/**
 * Interface stricte pour les profils de mentor
 */
export interface MentorProfile {
    readonly id: string;
    readonly personality: PersonalityType;
    readonly culturalBackground: CulturalEnvironment;
    readonly teachingStyle: string;
    readonly experience: number;
    readonly specializations: readonly string[];
    readonly preferredMethods: readonly string[];
    readonly adaptabilityScore: number;
}

/**
 * Interface pour les métriques de session d'enseignement
 */
export interface SessionMetrics {
    readonly teachingEffectiveness: number;
    readonly participationRate: number;
    readonly engagementLevel: number;
    readonly comprehensionScore: number;
    readonly progressRate: number;
}

/**
 * Interface pour les sessions d'enseignement avec duration
 */
export interface TeachingSession {
    readonly id: string;
    readonly mentorId: string;
    readonly studentId: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly duration: number; // en minutes
    readonly topic: string;
    readonly metrics: SessionMetrics;
    readonly feedback?: string;
    readonly notes?: string;
}

/**
 * Interface pour l'analyse de compatibilité détaillée
 */
export interface DetailedCompatibilityAnalysis {
    readonly overallScore: number;
    readonly personalityCompatibility: number;
    readonly culturalCompatibility: number;
    readonly teachingStyleCompatibility: number;
    readonly experienceAlignment: number;
    readonly methodologyMatch: number;
    readonly strengths: readonly string[];
    readonly challenges: readonly string[];
    readonly recommendations: readonly string[];
    readonly confidenceLevel: number;
}

/**
 * Interface pour l'analyse de style d'enseignement
 */
export interface TeachingStyleAnalysis {
    readonly primaryStyle: string;
    readonly secondaryStyles: readonly string[];
    readonly effectivenessScore: number;
    readonly adaptabilityIndex: number;
    readonly preferredInteractionModes: readonly string[];
    readonly optimalSessionDuration: number;
    readonly recommendedAdjustments: readonly string[];
}

/**
 * Interface pour les recommandations d'amélioration
 */
export interface CompatibilityImprovementPlan {
    readonly currentScore: number;
    readonly targetScore: number;
    readonly timeline: string;
    readonly priorityActions: readonly string[];
    readonly trainingRecommendations: readonly string[];
    readonly culturalAdaptationSteps: readonly string[];
    readonly successMetrics: readonly string[];
    readonly milestones: readonly { week: number; goal: string; metric: number }[];
}

/**
 * Interface pour l'analyse de performance relationnelle
 */
export interface RelationalPerformanceMetrics {
    readonly communicationEffectiveness: number;
    readonly empathyLevel: number;
    readonly adaptationSpeed: number;
    readonly feedbackQuality: number;
    readonly motivationImpact: number;
    readonly conflictResolution: number;
    readonly trustBuilding: number;
}

/**
 * Scores de compatibilité individuels pour calculs pondérés
 */
export interface CompatibilityScores {
    readonly personalityCompatibility: number;
    readonly culturalCompatibility: number;
    readonly teachingStyleCompatibility: number;
    readonly experienceAlignment: number;
    readonly methodologyMatch: number;
}

/**
 * Configuration des styles d'enseignement
 */
export interface TeachingStyleConfig {
    readonly effectiveness: number;
    readonly adaptability: number;
}

/**
 * Seuils pour l'évaluation de compatibilité
 */
export interface CompatibilityThresholds {
    readonly excellent: number;
    readonly good: number;
    readonly adequate: number;
    readonly needsImprovement: number;
    readonly poor: number;
}