// src/ai/systems/expressions/situations/educational/special_needs/adaptations/interfaces/interfaces.ts

import {
    AdvancedFeaturesResult
} from '../types';

/**
 * Représentation d'un motif détecté dans les données de session
 */
export interface DetectedPattern {
    /** Type de motif détecté */
    type: string;

    /** Score ou niveau de confiance dans la détection */
    confidence: number;

    /** Données associées au motif */
    data: Record<string, unknown>;

    /** Timestamp de la détection */
    timestamp: number;

    /** Métadonnées supplémentaires (optionnelles) */
    metadata?: Record<string, unknown>;
}

/**
 * Interfaces pour le système d'adaptation dynamique
 */

export interface IAdvancedAdaptation {
    /**
     * Implémente les fonctionnalités d'adaptation avancées
     */
    implementAdvancedFeatures(
        sessionData: Record<string, unknown>,
        options: Record<string, unknown>
    ): Promise<AdvancedFeaturesResult>;

    /**
     * Évalue l'efficacité des adaptations
     */
    evaluateAdaptationEffectiveness(
        sessionId: string,
        metrics?: string[]
    ): Promise<Record<string, number>>;

    /**
     * Raffine les stratégies d'adaptation
     */
    refineAdaptationStrategies(
        evaluation: Record<string, number>,
        threshold?: number
    ): Promise<Record<string, unknown>>;
}

export interface IContextAnalyzer {
    /**
     * Analyse le contexte d'une session
     */
    analyzeContext(data: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export interface ISituationalAnalyzer {
    /**
     * Analyse une situation basée sur les données de session
     */
    analyzeSituation(sessionData: Record<string, unknown>): Promise<Record<string, unknown>>;

    /**
     * Détecte des motifs dans les données de session
     */
    detectPatterns(data: Record<string, unknown>): Promise<DetectedPattern[]>;
}

export interface IMetricsCollector {
    /**
     * Collecte des métriques spécifiques
     */
    collectMetrics(
        metricType: string,
        data: Record<string, unknown>
    ): Promise<{ score: number;[key: string]: unknown }>;
}

export interface IValidationService {
    /**
     * Valide des données selon des critères
     */
    validate(
        data: Record<string, unknown>,
        options: Record<string, unknown>
    ): Promise<{ valid: boolean; issues?: string[] }>;
}

export interface IStateManager {
    /**
     * Met à jour l'état du système
     */
    updateState(state: Record<string, unknown>): void;

    /**
     * Récupère l'état actuel
     */
    getState(): Record<string, unknown>;
}

export interface ISystemAutoOptimisation {
    /**
     * Optimise un aspect spécifique du système
     */
    optimize(
        aspect: string,
        data: Record<string, unknown>
    ): Promise<Record<string, unknown>>;
}