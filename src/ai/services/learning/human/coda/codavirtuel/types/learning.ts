/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types/learning.ts
 * @description Types et interfaces révolutionnaires pour le système d'apprentissage CODA
 * 
 * Fonctionnalités avancées :
 * - 🎯 Prédictions d'apprentissage intelligent avec IA
 * - 📊 Évaluations de niveau CECRL complètes
 * - 🔄 Apprentissage inversé avec IA-élève
 * - 🎨 Exercices adaptatifs et personnalisés
 * - 🧠 Profils utilisateurs enrichis culturellement
 * - 📈 Métriques d'évaluation temps réel
 * - 🌍 Adaptation culturelle et personnalité IA
 * 
 * @module LearningTypes
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Learning Systems Division
 */

import { CECRLLevel, CulturalEnvironment, CODAPersonalityType } from './base';

/**
 * Interface pour les prédictions d'apprentissage IA avancées
 * 
 * @interface LearningPrediction
 * @description Prédit les résultats d'apprentissage basé sur l'analyse
 * comportementale et les patterns d'acquisition de compétences LSF
 * 
 * @example
 * ```typescript
 * const prediction: LearningPrediction = {
 *   area: 'fingerspelling',
 *   difficulty: 'medium',
 *   timeEstimate: 45,
 *   confidence: 0.85,
 *   recommendations: ['Practice daily', 'Focus on rhythm']
 * };
 * ```
 */
export interface LearningPrediction {
    /** Domaine d'apprentissage ciblé (vocabulaire, grammaire, etc.) */
    readonly area: string;
    /** Niveau de difficulté prédit */
    readonly difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    /** Estimation du temps d'apprentissage (en minutes) */
    readonly timeEstimate: number;
    /** Niveau de confiance dans la prédiction (0-1) */
    readonly confidence: number;
    /** Recommandations pédagogiques personnalisées */
    readonly recommendations: readonly string[];
    /** Obstacles potentiels identifiés */
    readonly potentialObstacles?: readonly string[];
    /** Stratégies d'adaptation proposées */
    readonly adaptationStrategies?: readonly string[];
}

/**
 * Interface pour l'évaluation complète de niveau CECRL
 * 
 * @interface LevelEvaluation
 * @description Évalue précisément le niveau actuel et recommande
 * les prochaines étapes d'apprentissage avec analyse détaillée
 * 
 * Critères d'évaluation :
 * - Compréhension gestuelle
 * - Expression manuelle
 * - Grammaire spatiale
 * - Vocabulaire spécialisé
 * - Fluidité conversationnelle
 * 
 * @example
 * ```typescript
 * const evaluation: LevelEvaluation = {
 *   currentLevel: 'A2',
 *   recommendedLevel: 'B1',
 *   levelChangeRecommended: true,
 *   progressInCurrentLevel: 0.95
 * };
 * ```
 */
export interface LevelEvaluation {
    /** Niveau CECRL actuel de l'apprenant */
    readonly currentLevel: CECRLLevel;
    /** Niveau CECRL recommandé après évaluation */
    readonly recommendedLevel: CECRLLevel;
    /** Indique si un changement de niveau est recommandé */
    readonly levelChangeRecommended: boolean;
    /** Progression dans le niveau actuel (0-1) */
    readonly progressInCurrentLevel: number;
    /** Scores détaillés par compétence */
    readonly scores: Readonly<Record<string, number>>;
    /** Explication détaillée de l'évaluation */
    readonly explanation: string;
    /** Domaines de compétence forte identifiés */
    readonly strengthAreas: readonly string[];
    /** Domaines nécessitant amélioration */
    readonly weaknessAreas: readonly string[];
    /** Recommandations spécifiques d'amélioration */
    readonly recommendations?: readonly string[];
    /** Temps estimé pour atteindre le niveau suivant (heures) */
    readonly estimatedTimeToNext?: number;
    /** Niveau de confiance dans l'évaluation (0-1) */
    readonly confidence?: number;
}

/**
 * Paramètres pour la génération dynamique d'exercices LSF
 * 
 * @interface ExerciseGenerationParams
 * @description Configure précisément la génération d'exercices adaptatifs
 * tenant compte du contexte culturel et de la personnalité IA
 * 
 * @example
 * ```typescript
 * const params: ExerciseGenerationParams = {
 *   type: 'recognition',
 *   level: 'A2',
 *   difficulty: 0.7,
 *   focusAreas: ['numbers', 'colors'],
 *   culturalContext: 'france'
 * };
 * ```
 */
export interface ExerciseGenerationParams {
    /** Type d'exercice (reconnaissance, production, compréhension) */
    readonly type: string;
    /** Niveau de difficulté cible */
    readonly level: string;
    /** Facteur de difficulté précis (0-1) */
    readonly difficulty: number;
    /** Domaines d'apprentissage spécifiques à cibler */
    readonly focusAreas?: readonly string[];
    /** Identifiant utilisateur pour personnalisation */
    readonly userId?: string;
    /** Contexte culturel pour adaptation régionale */
    readonly culturalContext?: CulturalEnvironment;
    /** Type de personnalité IA pour interaction */
    readonly aiPersonality?: CODAPersonalityType;
    /** Méthode pédagogique préférée */
    readonly teachingMethod?: string;
}

/**
 * Interface pour un exercice généré et adapté spécifiquement à l'utilisateur
 * 
 * @interface UserAdaptedExercise
 * @description Exercice personnalisé avec simulation d'erreurs et ciblage
 * précis des compétences selon le profil de l'apprenant
 * 
 * @example
 * ```typescript
 * const exercise: UserAdaptedExercise = {
 *   id: 'ex_001',
 *   type: 'fingerspelling',
 *   content: { word: 'BONJOUR', hints: ['B-O-N'] },
 *   errorsSimulated: true,
 *   targetedSkills: ['dactylologie', 'vitesse']
 * };
 * ```
 */
export interface UserAdaptedExercise {
    readonly id: string;
    readonly type: string;
    readonly content: Readonly<Record<string, unknown>>;
    readonly generationParams: {
        readonly type: string;
        readonly level: string;
        readonly difficulty: number;
        readonly focusAreas: readonly string[];
        readonly userId: string;
    };
    readonly errorsSimulated: boolean;
    readonly targetedSkills: readonly string[];
}

/**
 * Résultat d'évaluation d'exercice avec métriques détaillées
 * 
 * @interface EvaluationResult
 * @description Capture les performances et fournit un feedback
 * personnalisé avec suggestions d'amélioration
 */
export interface EvaluationResult {
    readonly exerciseId: string;
    readonly userId: string;
    readonly score: number;
    readonly percentage: number;
    readonly isCorrect: boolean;
    readonly feedback: string;
    readonly suggestions: readonly string[];
    readonly completionTime?: number;
    readonly timestamp: Date;
}

/**
 * Profil utilisateur complet pour le système d'apprentissage inversé
 * 
 * @interface UserReverseProfile
 * @description Profil riche incluant historique, préférences culturelles
 * et patterns d'apprentissage pour optimiser l'expérience personnalisée
 */
export interface UserReverseProfile {
    readonly userId: string;
    readonly currentLevel: CECRLLevel;
    readonly strengths: readonly string[];
    readonly weaknesses: readonly string[];
    readonly learningPreferences: readonly string[];
    readonly progressHistory: readonly {
        readonly date: Date;
        readonly level: CECRLLevel;
        readonly score: number;
    }[];
    readonly culturalBackground: CulturalEnvironment;
    readonly motivationFactors: readonly string[];
    readonly learningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'mixed';
    readonly sessionCount: number;
    readonly totalLearningTime: number;
    readonly lastActivity: Date;
}

/**
 * Options de configuration avancées pour l'apprentissage inversé
 * 
 * @interface ReverseApprenticeshipOptions
 * @description Configure finement le comportement de l'IA-élève
 * pour une expérience d'apprentissage optimale et réaliste
 */
export interface ReverseApprenticeshipOptions {
    readonly adaptiveDifficulty?: boolean;
    readonly errorSimulationRate?: number;
    readonly focusOnWeaknesses?: boolean;
    readonly enforceProgressCurve?: boolean;
    readonly codaMode?: boolean;
    readonly aiPersonality?: CODAPersonalityType;
    readonly realTimeEvaluation?: boolean;
    readonly autoGenerateSupports?: boolean;
    readonly aiIntelligenceLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
    readonly personalityType?: CODAPersonalityType;
    readonly culturalAuthenticity?: boolean;
    readonly predictiveLearning?: boolean;
    readonly mentorshipMode?: boolean;
    readonly emotionalIntelligenceLevel?: number;
    readonly adaptationFrequency?: number;
    readonly defaultCulturalEnvironment?: CulturalEnvironment;
    readonly initialLevel?: string;
    readonly enableRealTimeAnalytics?: boolean;
    readonly maxConcurrentSessions?: number;
}