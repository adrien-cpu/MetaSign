// src/ai/systems/expressions/emotions/contextual/interfaces.ts

import {
    EmotionState,
    ContextualInformation,
    AdaptedEmotion,
    SocialContext,
    NarrativeContext,
    CulturalContext,
    TemporalContext,
    SocialFactorsAnalysis,
    NarrativeElementsAnalysis,
    CulturalConsiderationsAnalysis,
    TemporalPatternsAnalysis,
    ContextAnalysis,
    ValidationResult,
    AdaptationPlan
} from './types';

/**
 * Interface pour le système d'adaptation d'émotions contextuel
 */
export interface IContextualEmotionSystem {
    /**
     * Adapte une émotion à un contexte spécifique
     * @param emotion État émotionnel à adapter
     * @param context Informations contextuelles
     * @returns Émotion adaptée avec métadonnées
     */
    adaptEmotionToContext(emotion: EmotionState, context: ContextualInformation): Promise<AdaptedEmotion>;
}

/**
 * Interface pour les analyseurs de contexte
 */
export interface IContextAnalyzer<T, R> {
    /**
     * Analyse un contexte spécifique
     * @param context Contexte à analyser
     * @returns Résultat de l'analyse
     */
    analyze(context: T): R;
}

/**
 * Interface pour l'analyseur de contexte social
 */
export interface ISocialContextAnalyzer extends IContextAnalyzer<SocialContext, SocialFactorsAnalysis> {
    /**
     * Analyse le contexte social
     * @param context Contexte social
     * @returns Analyse des facteurs sociaux
     */
    analyzeSocialContext(context: SocialContext): SocialFactorsAnalysis;
}

/**
 * Interface pour l'analyseur de contexte narratif
 */
export interface INarrativeContextAnalyzer extends IContextAnalyzer<NarrativeContext, NarrativeElementsAnalysis> {
    /**
     * Analyse le contexte narratif
     * @param context Contexte narratif
     * @returns Analyse des éléments narratifs
     */
    analyzeNarrativeContext(context: NarrativeContext): NarrativeElementsAnalysis;
}

/**
 * Interface pour l'analyseur de contexte culturel
 */
export interface ICulturalContextAnalyzer extends IContextAnalyzer<CulturalContext, CulturalConsiderationsAnalysis> {
    /**
     * Analyse le contexte culturel
     * @param context Contexte culturel
     * @returns Analyse des considérations culturelles
     */
    analyzeCulturalContext(context: CulturalContext): CulturalConsiderationsAnalysis;
}

/**
 * Interface pour l'analyseur de contexte temporel
 */
export interface ITemporalContextAnalyzer extends IContextAnalyzer<TemporalContext, TemporalPatternsAnalysis> {
    /**
     * Analyse le contexte temporel
     * @param context Contexte temporel
     * @returns Analyse des modèles temporels
     */
    analyzeTemporalContext(context: TemporalContext): TemporalPatternsAnalysis;
}

/**
 * Interface pour le validateur d'adaptations contextuelles
 */
export interface IContextualAdaptationValidator {
    /**
     * Valide une adaptation contextuelle
     * @param adaptedEmotion État émotionnel adapté
     * @param originalEmotion État émotionnel original
     * @param context Informations contextuelles
     * @returns Promesse résolue si valide, rejetée sinon
     */
    validateContextualAdaptation(
        adaptedEmotion: EmotionState,
        originalEmotion: EmotionState,
        context: ContextualInformation
    ): Promise<ValidationResult | void>;
}

/**
 * Interface pour l'évaluateur d'adaptations émotionnelles
 */
export interface IEmotionAdaptationEvaluator {
    /**
     * Évalue la pertinence contextuelle
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Scores de pertinence contextuelle
     */
    evaluateContextualRelevance(emotion: EmotionState, context: ContextualInformation): Record<string, number>;

    /**
     * Évalue la qualité de l'adaptation
     * @param originalEmotion État émotionnel original
     * @param adaptedEmotion État émotionnel adapté
     * @returns Score de qualité de l'adaptation
     */
    evaluateAdaptationQuality(originalEmotion: EmotionState, adaptedEmotion: EmotionState): number;

    /**
     * Évalue l'authenticité culturelle
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Scores d'authenticité culturelle
     */
    evaluateCulturalAuthenticity(emotion: EmotionState, context: ContextualInformation): Record<string, number>;
}

/**
 * Interface pour la fabrique d'adaptation contextuelle
 */
export interface IContextualAdaptationFactory {
    /**
     * Crée un plan d'adaptation pour une émotion et une analyse de contexte
     * @param emotion État émotionnel
     * @param analysis Analyse de contexte
     * @returns Plan d'adaptation
     */
    createAdaptationPlan(emotion: EmotionState, analysis: ContextAnalysis): AdaptationPlan;
}