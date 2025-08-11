// src/ai/systems/expressions/situations/educational/special_needs/adaptations/interfaces/IAdvancedAdaptation.ts
import {
    AdaptationSuggestionResult,
    AdvancedFeaturesResult,
    EffectivenessEvaluationResult,
    StrategyRefinementResult
} from '../types/intervention.types';
import { ContextAnalysisResult } from '../AdvancedFeatures';

/**
 * Interface définissant les fonctionnalités d'adaptation avancées
 * pour les besoins spéciaux dans les contextes éducatifs LSF.
 */
export interface IAdvancedAdaptation {
    /**
     * Implémente des fonctionnalités d'adaptation avancées selon les données de session
     * @param session Données de session de l'apprenant
     * @param options Options de configuration
     * @returns Résultats des fonctionnalités avancées
     */
    implementAdvancedFeatures(
        session: Record<string, unknown>,
        options: Record<string, unknown>
    ): Promise<AdvancedFeaturesResult>;

    /**
     * Suggère des adaptations basées sur l'analyse du contexte
     * @param context Données de contexte
     * @returns Suggestions d'adaptation
     */
    suggestAdaptations(
        context: Record<string, unknown>
    ): Promise<AdaptationSuggestionResult>;

    /**
     * Évalue l'efficacité des adaptations
     * @param adaptations Adaptations à évaluer
     * @param metrics Métriques utilisées pour l'évaluation
     * @returns Résultats de l'évaluation d'efficacité
     */
    evaluateEffectiveness(
        adaptations: Record<string, unknown>[],
        metrics: Record<string, number>
    ): Promise<EffectivenessEvaluationResult>;

    /**
     * Raffine les stratégies d'adaptation basées sur les évaluations
     * @param evaluation Résultats d'évaluation
     * @param currentStrategies Stratégies actuelles
     * @returns Stratégies raffinées
     */
    refineStrategy(
        evaluation: Record<string, unknown>,
        currentStrategies: string[]
    ): Promise<StrategyRefinementResult>;

    /**
     * Évalue l'efficacité des adaptations pour une session spécifique
     * @param sessionId Identifiant de la session
     * @param metrics Métriques spécifiques à évaluer (optionnel)
     * @returns Résultats d'évaluation
     */
    evaluateAdaptationEffectiveness(
        sessionId: string,
        metrics?: string[]
    ): Promise<Record<string, number>>;

    /**
     * Raffine les stratégies d'adaptation basées sur les résultats d'évaluation
     * @param evaluation Résultats d'évaluation
     * @param threshold Seuil d'apprentissage
     * @returns Stratégies d'adaptation raffinées
     */
    refineAdaptationStrategies(
        evaluation: Record<string, number>,
        threshold: number
    ): Promise<Record<string, unknown>>;

    /**
     * Analyse le contexte pour déterminer les besoins d'adaptation
     * @param session Données de session
     * @returns Résultats d'analyse de contexte
     */
    analyzeContext(
        session: Record<string, unknown>
    ): Promise<ContextAnalysisResult>;
}