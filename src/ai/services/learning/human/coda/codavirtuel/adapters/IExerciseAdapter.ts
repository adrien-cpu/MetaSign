/**
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/IExerciseAdapter.ts
 * @description Interface pour l'adaptation intelligente d'exercices
 * 
 * Fonctionnalités :
 * - 🎯 Interface standardisée pour adaptation d'exercices
 * - 🔧 Compatible exactOptionalPropertyTypes: true
 * - 📊 Adaptation basée sur profil utilisateur
 * - 🌟 Support multi-modal et culturel
 * 
 * @module adapters
 * @version 1.0.0 - Interface révolutionnaire
 * @since 2025
 * @author MetaSign Team - CODA Adapters
 * @lastModified 2025-07-19
 */

import type {
    UserReverseProfile,
    ExerciseGenerationParams,
    UserAdaptedExercise
} from '../types/index';

import type { GeneratedExercise } from '../exercises/ExerciseGeneratorService';

/**
 * Interface pour les résultats d'évaluation
 */
export interface EvaluationResult {
    /** Identifiant de l'exercice évalué */
    readonly exerciseId: string;

    /** Identifiant de l'utilisateur */
    readonly userId: string;

    /** Score obtenu */
    readonly score: number;

    /** Pourcentage de réussite */
    readonly percentage: number;

    /** Indique si la réponse est correcte */
    readonly isCorrect: boolean;

    /** Feedback textuel */
    readonly feedback: string;

    /** Suggestions d'amélioration */
    readonly suggestions: readonly string[];

    /** Horodatage de l'évaluation */
    readonly timestamp: Date;

    /** Temps passé sur l'exercice (en secondes) */
    readonly timeSpent?: number;

    /** Métadonnées additionnelles */
    readonly metadata?: Record<string, unknown>;
}

/**
 * Interface pour l'adaptation d'exercices
 */
export interface IExerciseAdapter {
    /**
     * Génère les paramètres d'exercice basés sur le profil utilisateur
     * 
     * @param userProfile - Profil de l'utilisateur
     * @param previousExercise - Exercice précédent (optionnel)
     * @param adaptiveDifficulty - Activer l'adaptation de difficulté
     * @param focusOnWeaknesses - Se concentrer sur les faiblesses
     * @returns Paramètres d'exercice générés
     */
    generateExerciseParams(
        userProfile: UserReverseProfile,
        previousExercise?: GeneratedExercise,
        adaptiveDifficulty?: boolean,
        focusOnWeaknesses?: boolean
    ): ExerciseGenerationParams;

    /**
     * Adapte un exercice généré au profil utilisateur
     * 
     * @param exercise - Exercice à adapter
     * @param userProfile - Profil utilisateur
     * @param simulateErrors - Simuler des erreurs pour l'apprentissage
     * @param errorRate - Taux d'erreur à simuler
     * @returns Exercice adapté
     */
    adaptExercise(
        exercise: GeneratedExercise,
        userProfile: UserReverseProfile,
        simulateErrors?: boolean,
        errorRate?: number
    ): Promise<UserAdaptedExercise>;

    /**
     * Analyse l'interaction utilisateur pour l'adaptation future
     * 
     * @param userProfile - Profil utilisateur
     * @param exercise - Exercice effectué
     * @param result - Résultat de l'exercice
     * @returns Insights pour adaptation future
     */
    analyzeInteraction(
        userProfile: UserReverseProfile,
        exercise: UserAdaptedExercise,
        result: EvaluationResult
    ): Promise<AdaptationInsights>;

    /**
     * Recommande le prochain exercice basé sur l'historique
     * 
     * @param userProfile - Profil utilisateur
     * @param recentResults - Résultats récents
     * @returns Recommandations d'exercice
     */
    recommendNextExercise(
        userProfile: UserReverseProfile,
        recentResults: readonly EvaluationResult[]
    ): Promise<ExerciseRecommendation>;

    /**
     * Adapte la difficulté en temps réel
     * 
     * @param currentDifficulty - Difficulté actuelle
     * @param performance - Performance utilisateur
     * @param adaptationRate - Vitesse d'adaptation
     * @returns Nouvelle difficulté
     */
    adaptDifficulty(
        currentDifficulty: number,
        performance: PerformanceMetrics,
        adaptationRate?: number
    ): number;
}

/**
 * Insights pour l'adaptation future
 */
export interface AdaptationInsights {
    /** Points forts identifiés */
    readonly strengths: readonly string[];

    /** Faiblesses identifiées */
    readonly weaknesses: readonly string[];

    /** Style d'apprentissage préféré */
    readonly preferredLearningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'mixed';

    /** Difficulté optimale recommandée */
    readonly optimalDifficulty: number;

    /** Zones de focus suggérées */
    readonly suggestedFocusAreas: readonly string[];

    /** Préférences culturelles */
    readonly culturalPreferences: readonly string[];

    /** Facteurs de motivation */
    readonly motivationFactors: readonly string[];

    /** Durée d'attention (en minutes) */
    readonly attentionSpan: number;

    /** Niveau de confiance (0-1) */
    readonly confidence: number;
}

/**
 * Recommandation d'exercice
 */
export interface ExerciseRecommendation {
    /** Type d'exercice recommandé */
    readonly recommendedType: string;

    /** Difficulté suggérée */
    readonly suggestedDifficulty: number;

    /** Zones de focus */
    readonly focusAreas: readonly string[];

    /** Raisonnement de la recommandation */
    readonly reasoning: string;

    /** Types alternatifs */
    readonly alternativeTypes: readonly string[];

    /** Durée estimée (en minutes) */
    readonly estimatedDuration: number;

    /** Priorité de la recommandation */
    readonly priority: 'high' | 'medium' | 'low';

    /** Contexte culturel recommandé */
    readonly culturalContext?: string;
}

/**
 * Métriques de performance
 */
export interface PerformanceMetrics {
    /** Précision des réponses (0-1) */
    readonly accuracy: number;

    /** Vitesse de réponse (0-1) */
    readonly speed: number;

    /** Consistance des performances (0-1) */
    readonly consistency: number;

    /** Niveau d'engagement (0-1) */
    readonly engagement: number;

    /** Patterns d'erreurs identifiés */
    readonly errorPattern: readonly string[];

    /** Distribution du temps par section */
    readonly timeDistribution: readonly number[];
}

/**
 * Configuration d'adaptation
 */
export interface AdaptationConfig {
    /** Activer l'adaptation en temps réel */
    readonly enableRealTimeAdaptation: boolean;

    /** Sensibilité de l'adaptation (0-1) */
    readonly adaptationSensitivity: number;

    /** Changement maximum de difficulté par session */
    readonly maxDifficultyChange: number;

    /** Nombre minimum de sessions avant adaptation */
    readonly minSessionsBeforeAdaptation: number;

    /** Sensibilité culturelle (0-1) */
    readonly culturalSensitivity: number;

    /** Activer la simulation d'erreurs */
    readonly errorSimulationEnabled: boolean;

    /** Adaptation basée sur la personnalité */
    readonly personalityBasedAdaptation: boolean;
}