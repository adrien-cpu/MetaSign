/**
 * Index des utilitaires d'adaptation d'exercices
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/services/index.ts
 * @module ai/services/learning/codavirtuel/adapters/services
 * @description Utilitaires et types pour l'adaptation d'exercices sans dépendances externes
 * @version 3.0.0
 * @author MetaSign Learning Team
 * @since 2024
 * @lastModified 2025-01-15
 */

import {
    SupportedExerciseType,
    CECRLLevel,
    ExerciseGenerationParams
} from '../../exercises/types/ExerciseGeneratorTypes';

/**
 * Configuration pour l'adaptateur d'exercices
 */
export interface AdapterConfiguration {
    readonly enableErrorSimulation?: boolean;
    readonly defaultErrorRate?: number;
    readonly maxDifficultyBoost?: number;
    readonly focusOnWeaknessesWeight?: number;
}

/**
 * Métriques simples d'adaptation
 */
export interface AdaptationMetrics {
    readonly totalAdaptations: number;
    readonly successfulAdaptations: number;
    readonly totalProcessingTime: number;
    readonly averageProcessingTime: number;
    readonly successRate: number;
}

/**
 * Contexte d'adaptation d'exercice
 */
export interface AdaptationContext {
    readonly userId: string;
    readonly currentLevel: CECRLLevel;
    readonly sessionId?: string;
    readonly timestamp: Date;
    readonly environmentType?: 'classroom' | 'home' | 'mobile' | 'vr';
}

/**
 * Résultat d'analyse de profil utilisateur
 */
export interface ProfileAnalysisResult {
    readonly recommendedExerciseType: SupportedExerciseType;
    readonly suggestedDifficulty: number;
    readonly focusAreas: readonly string[];
    readonly estimatedDuration: number;
    readonly confidenceScore: number;
}

/**
 * Configuration par défaut pour l'adaptateur
 */
export const DEFAULT_ADAPTER_CONFIG: Required<AdapterConfiguration> = {
    enableErrorSimulation: true,
    defaultErrorRate: 0.1,
    maxDifficultyBoost: 0.3,
    focusOnWeaknessesWeight: 0.7
} as const;

/**
 * Utilitaires pour la configuration d'adaptation
 */
export const AdapterConfigUtils = {
    /**
     * Crée une configuration avec des valeurs par défaut
     * @param overrides Configuration à surcharger
     * @returns Configuration complète
     */
    createConfig: (overrides: AdapterConfiguration = {}): Required<AdapterConfiguration> => ({
        enableErrorSimulation: overrides.enableErrorSimulation ?? DEFAULT_ADAPTER_CONFIG.enableErrorSimulation,
        defaultErrorRate: overrides.defaultErrorRate ?? DEFAULT_ADAPTER_CONFIG.defaultErrorRate,
        maxDifficultyBoost: overrides.maxDifficultyBoost ?? DEFAULT_ADAPTER_CONFIG.maxDifficultyBoost,
        focusOnWeaknessesWeight: overrides.focusOnWeaknessesWeight ?? DEFAULT_ADAPTER_CONFIG.focusOnWeaknessesWeight
    }),

    /**
     * Valide une configuration
     * @param config Configuration à valider
     * @returns True si valide
     */
    validateConfig: (config: AdapterConfiguration): boolean => {
        const errorRate = config.defaultErrorRate;
        const difficultyBoost = config.maxDifficultyBoost;
        const focusWeight = config.focusOnWeaknessesWeight;

        return (
            (errorRate === undefined || (errorRate >= 0 && errorRate <= 1)) &&
            (difficultyBoost === undefined || (difficultyBoost >= 0 && difficultyBoost <= 1)) &&
            (focusWeight === undefined || (focusWeight >= 0 && focusWeight <= 1))
        );
    },

    /**
     * Crée une configuration pour un environnement spécifique
     * @param environment Type d'environnement
     * @returns Configuration adaptée
     */
    createForEnvironment: (environment: 'development' | 'testing' | 'production'): Required<AdapterConfiguration> => {
        switch (environment) {
            case 'development':
                return {
                    enableErrorSimulation: true,
                    defaultErrorRate: 0.15,
                    maxDifficultyBoost: 0.4,
                    focusOnWeaknessesWeight: 0.8
                };
            case 'testing':
                return {
                    enableErrorSimulation: false,
                    defaultErrorRate: 0.0,
                    maxDifficultyBoost: 0.2,
                    focusOnWeaknessesWeight: 0.5
                };
            case 'production':
            default:
                return DEFAULT_ADAPTER_CONFIG;
        }
    }
} as const;

/**
 * Utilitaires pour les métriques d'adaptation
 */
export const AdapterMetricsUtils = {
    /**
     * Calcule les métriques à partir de données brutes
     * @param data Données d'adaptation
     * @returns Métriques calculées
     */
    calculateMetrics: (data: {
        totalAdaptations: number;
        successfulAdaptations: number;
        totalProcessingTime: number;
    }): AdaptationMetrics => {
        const { totalAdaptations, successfulAdaptations, totalProcessingTime } = data;

        return {
            totalAdaptations,
            successfulAdaptations,
            totalProcessingTime,
            averageProcessingTime: totalAdaptations > 0 ? totalProcessingTime / totalAdaptations : 0,
            successRate: totalAdaptations > 0 ? successfulAdaptations / totalAdaptations : 0
        };
    },

    /**
     * Formate les métriques pour l'affichage
     * @param metrics Métriques à formater
     * @returns Métriques formatées
     */
    formatMetrics: (metrics: AdaptationMetrics): string => {
        return `Adaptations: ${metrics.totalAdaptations}, ` +
            `Success: ${(metrics.successRate * 100).toFixed(1)}%, ` +
            `Avg Time: ${metrics.averageProcessingTime.toFixed(0)}ms`;
    },

    /**
     * Vérifie si les métriques indiquent de bonnes performances
     * @param metrics Métriques à évaluer
     * @returns True si les performances sont bonnes
     */
    isPerformanceGood: (metrics: AdaptationMetrics): boolean => {
        return metrics.successRate > 0.9 && metrics.averageProcessingTime < 100;
    }
} as const;

/**
 * Factory functions utilitaires
 */
export const AdapterFactoryUtils = {
    /**
     * Crée un contexte d'adaptation
     * @param userId Identifiant utilisateur
     * @param level Niveau CECRL
     * @param options Options additionnelles
     * @returns Contexte d'adaptation
     */
    createAdaptationContext: (
        userId: string,
        level: CECRLLevel,
        options: {
            sessionId?: string;
            environmentType?: AdaptationContext['environmentType'];
        } = {}
    ): AdaptationContext => ({
        userId,
        currentLevel: level,
        timestamp: new Date(),
        sessionId: options.sessionId,
        environmentType: options.environmentType
    }),

    /**
     * Crée des paramètres d'exercice simplifiés
     * @param type Type d'exercice
     * @param level Niveau CECRL
     * @param options Options additionnelles
     * @returns Paramètres d'exercice
     */
    createBasicExerciseParams: (
        type: SupportedExerciseType,
        level: CECRLLevel,
        options: {
            difficulty?: number;
            userId?: string;
            focusAreas?: readonly string[];
        } = {}
    ): ExerciseGenerationParams => ({
        type,
        level,
        difficulty: options.difficulty ?? 0.5,
        userId: options.userId,
        focusAreas: options.focusAreas
    })
} as const;

// Note: Les interfaces sont déjà exportées directement dans leurs déclarations
// Pas besoin de les ré-exporter avec 'export type'