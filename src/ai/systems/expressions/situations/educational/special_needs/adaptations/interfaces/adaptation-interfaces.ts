// src/ai/systems/expressions/situations/educational/special_needs/adaptations/interfaces/adaptation-interfaces.ts

import {
    AdaptationStrategy,
    AdaptationEvaluationResult,
    AdaptationRecommendation,
    AnalysisResult
} from '@ai/systems/expressions/situations/educational/special_needs/adaptations/types/adaptation-types';

/**
 * Interface de base pour les adaptations
 */
export interface IAdaptationInterface {
    /**
     * Applique une stratégie d'adaptation dans un contexte donné
     */
    applyStrategy(strategy: AdaptationStrategy, context: Record<string, unknown>): Promise<boolean>;

    /**
     * Évalue l'efficacité d'une adaptation dans un contexte donné
     */
    evaluateEffectiveness(context: Record<string, unknown>): Promise<number>;

    /**
     * Obtient des recommandations d'adaptation basées sur un contexte
     */
    getRecommendations(context: Record<string, unknown>): Promise<AdaptationRecommendation[]>;
}

/**
 * Interface d'adaptation spécifique à la LSF
 */
export interface ILSFAdaptationInterface extends IAdaptationInterface {
    /**
     * Analyse les besoins visuels dans un contexte donné
     */
    analyzeVisualNeeds(context: Record<string, unknown>): Promise<AnalysisResult>;
}