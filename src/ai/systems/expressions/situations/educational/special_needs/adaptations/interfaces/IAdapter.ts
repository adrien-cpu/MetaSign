// src/ai/systems/expressions/situations/educational/special_needs/adaptations/interfaces/IAdapter.ts

import {
    BaseOptions,
    PredictionOptions,
    DynamicAdaptationOptions,
    CollaborationOptions,
    IntegratedOptions,
    BalancedOptions,
    SessionData
} from '../AdapterTypes';

/**
 * Interface de base pour tous les adaptateurs
 */
export interface IAdapter<T extends BaseOptions> {
    /**
     * ID unique de l'adaptateur
     */
    readonly id: string;

    /**
     * Configure l'adaptateur avec les options spécifiées
     * @param options Options de configuration
     */
    configure(options: T): void;

    /**
     * Traite les données de session pour générer une adaptation
     * @param sessionData Données de la session
     * @returns Résultat du traitement
     */
    process(sessionData: SessionData): Promise<Record<string, unknown>>;

    /**
     * Réinitialise l'adaptateur à son état initial
     */
    reset(): void;
}

/**
 * Interface pour les adaptateurs prédictifs
 */
export interface IPredictiveAdapter extends IAdapter<PredictionOptions> {
    /**
     * Prédit les besoins d'adaptation futurs
     * @param sessionData Données de la session
     * @returns Résultat de la prédiction
     */
    predict(sessionData: SessionData): Promise<{
        predictions: Array<{
            timestamp: number;
            confidence: number;
            adaptation_type: string;
        }>;
        metrics: Record<string, unknown>;
    }>;

    /**
     * Évalue la précision des prédictions précédentes
     * @param actualData Données réelles observées
     * @returns Score de précision (0-1)
     */
    evaluateAccuracy(actualData: Record<string, unknown>): Promise<number>;
}

/**
 * Interface pour les adaptateurs dynamiques
 */
export interface IDynamicAdapter extends IAdapter<DynamicAdaptationOptions> {
    /**
     * Analyse le contexte actuel pour identifier les adaptations nécessaires
     * @param sessionData Données de la session
     * @returns Résultat de l'analyse
     */
    analyzeContext(sessionData: SessionData): Promise<{
        environmental: Record<string, unknown>;
        cognitive: Record<string, unknown>;
        recommendations: string[];
    }>;

    /**
     * Applique dynamiquement les adaptations en fonction du contexte
     * @param sessionData Données de la session
     * @param context Contexte analysé
     * @returns Résultat de l'adaptation
     */
    applyDynamicAdaptations(
        sessionData: SessionData,
        context: Record<string, unknown>
    ): Promise<{
        applied_adaptations: string[];
        effectiveness: number;
    }>;
}

/**
 * Interface pour les adaptateurs de collaboration
 */
export interface ICollaborationAdapter extends IAdapter<CollaborationOptions> {
    /**
     * Identifie les opportunités de collaboration
     * @param sessionData Données de la session
     * @returns Opportunités de collaboration
     */
    identifyCollaborationOpportunities(sessionData: SessionData): Promise<{
        opportunities: Array<{
            id: string;
            participants: string[];
            potential_benefit: number;
            focus_area: string;
        }>;
    }>;

    /**
     * Facilite la collaboration entre les participants
     * @param sessionData Données de la session
     * @param opportunityId ID de l'opportunité à faciliter
     * @returns Résultat de la facilitation
     */
    facilitateCollaboration(
        sessionData: SessionData,
        opportunityId: string
    ): Promise<{
        success: boolean;
        engagement_metrics: Record<string, unknown>;
        collaboration_artifacts: unknown[];
    }>;
}

/**
 * Interface pour les adaptateurs intégrés
 */
export interface IIntegratedAdapter extends IAdapter<IntegratedOptions> {
    /**
     * Coordonne les différentes stratégies d'adaptation
     * @param sessionData Données de la session
     * @returns Plan coordonné
     */
    coordinateStrategies(sessionData: SessionData): Promise<{
        integrated_plan: {
            prediction_component: Record<string, unknown>;
            dynamic_component: Record<string, unknown>;
            collaboration_component: Record<string, unknown>;
        };
        sync_points: number[];
    }>;

    /**
     * Synchronise les différentes composantes d'adaptation
     * @param sessionData Données de la session
     * @returns État de synchronisation
     */
    synchronizeComponents(sessionData: SessionData): Promise<{
        synchronized: boolean;
        component_states: Record<string, unknown>;
    }>;
}

/**
 * Interface pour les adaptateurs équilibrés
 */
export interface IBalancedAdapter extends IAdapter<BalancedOptions> {
    /**
     * Équilibre les différentes stratégies d'adaptation
     * @param sessionData Données de la session
     * @returns Résultat de l'équilibrage
     */
    balanceStrategies(sessionData: SessionData): Promise<{
        weights: Record<string, number>;
        rationale: string;
        effectiveness: number;
    }>;

    /**
     * Ajuste l'équilibre en fonction des retours
     * @param sessionData Données de la session
     * @param feedback Retour sur l'adaptation précédente
     * @returns Nouvel équilibre
     */
    adjustBalance(
        sessionData: SessionData,
        feedback: Record<string, unknown>
    ): Promise<{
        previous_weights: Record<string, number>;
        new_weights: Record<string, number>;
        adjustment_factors: Record<string, unknown>;
    }>;
}

/**
 * Interface pour les adaptateurs avancés
 */
export interface IAdvancedAdapter extends IAdapter<BaseOptions> {
    /**
     * Implémente des fonctionnalités avancées d'adaptation
     * @param sessionData Données de la session
     * @param customOptions Options personnalisées
     * @returns Résultat des fonctionnalités avancées
     */
    implementAdvancedFeatures(
        sessionData: Record<string, unknown>,
        customOptions?: Record<string, unknown>
    ): Promise<Record<string, unknown>>;
}