/**
 * @file src/ai/services/learning/human/coda/codavirtuel/interfaces/index.ts
 * @description Interfaces et types pour le simulateur d'IA-élève révolutionnaire
 * 
 * Fonctionnalités :
 * - 🎯 Types centralisés pour AIStudentSimulator
 * - 🔧 Configuration modulaire des systèmes
 * - 📊 Interfaces pour statuts et réactions 
 * - 🌟 Compatible exactOptionalPropertyTypes: true
 * 
 * @module interfaces
 * @version 1.0.0 - Interfaces révolutionnaires
 * @since 2025
 * @author MetaSign Team - CODA Interfaces
 * @lastModified 2025-07-04
 */

// ===== TYPES DE BASE LSF =====

/**
 * Niveaux CECRL pour l'apprentissage LSF
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Humeurs de l'IA-élève
 */
export type AIMood = 'happy' | 'confused' | 'frustrated' | 'excited' | 'neutral';

/**
 * Types de personnalité pour IA-élève
 */
export type AIStudentPersonalityType =
    | 'curious_student'
    | 'shy_learner'
    | 'energetic_pupil'
    | 'patient_apprentice';

/**
 * Environnements culturels LSF
 */
export type CulturalEnvironment =
    | 'deaf_family_home'
    | 'mixed_hearing_family'
    | 'school_environment'
    | 'community_center'
    | 'online_learning';

// ===== CONFIGURATION DU SIMULATEUR =====

/**
 * Configuration du système de personnalité
 */
export interface AIPersonalityConfig {
    readonly enableDynamicEvolution?: boolean;
    readonly adaptationSpeed?: number;
    readonly culturalInfluence?: number;
    readonly emotionalVolatility?: number;
    readonly evolutionThreshold?: number;
}

/**
 * Configuration du système de mémoire
 */
export interface AIMemoryConfig {
    readonly naturalDecayRate?: number;
    readonly consolidationThreshold?: number;
    readonly enableAutoConsolidation?: boolean;
    readonly maxActiveMemories?: number;
    readonly emotionalForgettingFactor?: number;
}

/**
 * Configuration du système émotionnel
 */
export interface AIEmotionalConfig {
    readonly baseVolatility?: number;
    readonly enablePatternDetection?: boolean;
    readonly triggerSensitivity?: number;
    readonly transitionSpeed?: number;
    readonly historyDepth?: number;
}

/**
 * Configuration du système d'évolution
 */
export interface AIEvolutionConfig {
    readonly evolutionSensitivity?: number;
    readonly enableAutoOptimization?: boolean;
    readonly baseEvolutionRate?: number;
    readonly evolutionThreshold?: number;
    readonly analysisDepth?: number;
}

/**
 * Configuration générale du simulateur
 */
export interface AIGeneralConfig {
    readonly enableAdvancedLogging?: boolean;
    readonly syncInterval?: number;
    readonly maxConcurrentStudents?: number;
    readonly developmentMode?: boolean;
}

/**
 * Configuration complète du simulateur
 */
export interface AIStudentSimulatorConfig {
    readonly personalityConfig?: AIPersonalityConfig;
    readonly memoryConfig?: AIMemoryConfig;
    readonly emotionalConfig?: AIEmotionalConfig;
    readonly evolutionConfig?: AIEvolutionConfig;
    readonly generalConfig?: AIGeneralConfig;
}

// ===== STATUTS ET MÉTRIQUES =====

/**
 * Statistiques de mémoire de l'IA
 */
export interface AIMemoryStats {
    readonly totalMemories: number;
    readonly averageRetention: number;
    readonly strongestConcepts: readonly string[];
    readonly conceptsNeedingReview: readonly string[];
    readonly memorizationEfficiency: number;
}

/**
 * Historique de performance
 */
export interface AIPerformanceHistory {
    readonly averageComprehension: number;
    readonly learningVelocity: number;
    readonly emotionalStability: number;
    readonly recentProgressRate: number;
    readonly performanceConsistency: number;
}

/**
 * Statut complet de l'IA-élève
 */
export interface ComprehensiveAIStatus {
    readonly name: string;
    readonly currentLevel: CECRLLevel;
    readonly mood: AIMood;
    readonly progress: number;
    readonly weaknesses: readonly string[];
    readonly strengths: readonly string[];
    readonly motivation: number;
    readonly totalLearningTime: number;
    readonly personality: AIStudentPersonalityType;
    readonly culturalContext: CulturalEnvironment;
    readonly personalityProfile: AIPersonalityProfile;
    readonly emotionalState: EmotionalState;
    readonly evolutionMetrics: EvolutionMetrics;
    readonly memoryStats: AIMemoryStats;
    readonly performanceHistory: AIPerformanceHistory;
}

// ===== RÉACTIONS ET INTERACTIONS =====

/**
 * Réaction de base de l'IA
 */
export interface BasicAIReaction {
    readonly comprehension: number;
    readonly reaction: string;
    readonly confidence: number;
    readonly timestamp: Date;
}

/**
 * Métadonnées de traitement
 */
export interface ReactionMetadata {
    readonly primarySystem: string;
    readonly influencingFactors: readonly string[];
    readonly certaintyLevel: number;
    readonly processingTime: number;
    readonly systemVersions: Record<string, string>;
}

/**
 * Réaction complète de l'IA
 */
export interface ComprehensiveAIReaction {
    readonly basicReaction: BasicAIReaction;
    readonly emotionalState: EmotionalState;
    readonly recalledMemories: readonly LearningMemory[];
    readonly evolutionMetrics: EvolutionMetrics;
    readonly question?: string;
    readonly error?: string;
    readonly improvementSuggestions: readonly string[];
    readonly metadata: ReactionMetadata;
}

// ===== TYPES POUR SYSTÈMES SPÉCIALISÉS =====

/**
 * Profil de personnalité Big Five
 */
export interface BigFiveTraits {
    readonly openness: number;
    readonly conscientiousness: number;
    readonly extraversion: number;
    readonly agreeableness: number;
    readonly neuroticism: number;
}

/**
 * Profil complet de personnalité IA
 */
export interface AIPersonalityProfile {
    readonly name: string;
    readonly personalityType: AIStudentPersonalityType;
    readonly culturalContext: CulturalEnvironment;
    readonly bigFiveTraits: BigFiveTraits;
    readonly learningPreferences: readonly string[];
    readonly motivationFactors: readonly string[];
    readonly challengeAreas: readonly string[];
    readonly strengths: readonly string[];
    readonly adaptationRate: number;
}

/**
 * État émotionnel de l'IA
 */
export interface EmotionalState {
    readonly primaryEmotion: string;
    readonly intensity: number;
    readonly valence: number;
    readonly arousal: number;
    readonly confidence: number;
    readonly triggers: readonly string[];
    readonly duration: number;
    readonly timestamp: Date;
}

/**
 * Souvenir d'apprentissage
 */
export interface LearningMemory {
    readonly id: string;
    readonly concept: string;
    readonly content: string;
    readonly strength: number;
    readonly emotion: string;
    readonly timestamp: Date;
    readonly consolidationLevel: number;
    readonly retrievalCount: number;
    readonly associations: readonly string[];
}

/**
 * Métriques d'évolution
 */
export interface EvolutionMetrics {
    readonly globalConfidence: number;
    readonly adaptationRate: number;
    readonly learningEfficiency: number;
    readonly emotionalStability: number;
    readonly socialSkills: number;
    readonly progressConsistency: number;
    readonly evolutionTrend: 'improving' | 'stable' | 'declining';
    readonly lastEvolutionDate: Date;
}

/**
 * Paramètres de rappel de mémoire
 */
export interface RecallParameters {
    readonly context: string;
    readonly cues: readonly string[];
    readonly minStrength?: number;
    readonly memoryTypes?: readonly string[];
    readonly includeAssociations?: boolean;
}

/**
 * Paramètres de génération émotionnelle
 */
export interface EmotionGenerationParams {
    readonly learningContext: string;
    readonly stimulus: string;
    readonly stimulusIntensity: number;
    readonly learningOutcome: 'success' | 'partial' | 'failure';
    readonly contextualFactors: readonly string[];
}

/**
 * Expérience d'apprentissage
 */
export interface LearningExperience {
    readonly concept: string;
    readonly method: string;
    readonly successRate: number;
    readonly duration: number;
    readonly challenges: readonly string[];
    readonly emotions: readonly string[];
    readonly timestamp: Date;
}