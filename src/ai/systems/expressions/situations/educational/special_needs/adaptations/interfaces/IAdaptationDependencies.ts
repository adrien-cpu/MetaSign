// src/ai/systems/expressions/situations/educational/special_needs/adaptations/interfaces/IAdaptationDependencies.ts

import {
    ContextAnalysisResult,
    SituationalAnalysisResult
} from '../types';

/**
 * Interface pour l'analyseur de contexte
 * Responsable de l'analyse du contexte d'apprentissage
 */
export interface IContextAnalyzer {
    /**
     * Analyse le contexte pour déterminer les besoins d'adaptation
     * @param data Données contextuelles à analyser
     * @returns Résultat de l'analyse de contexte
     */
    analyzeContext(data: Record<string, unknown>): Promise<ContextAnalysisResult>;
}

/**
 * Interface pour l'analyseur situationnel
 * Responsable de l'analyse des situations spécifiques d'apprentissage
 */
export interface ISituationalAnalyzer {
    /**
     * Analyse une situation éducative spécifique
     * @param situation Données de la situation à analyser
     * @returns Résultat de l'analyse situationnelle
     */
    analyzeSituation(situation: Record<string, unknown>): Promise<SituationalAnalysisResult>;
}

/**
 * Interface pour le collecteur de métriques
 * Responsable de la collecte et de l'analyse des métriques d'apprentissage
 */
export interface IMetricsCollector {
    /**
     * Collecte des métriques spécifiques basées sur le contexte
     * @param metricType Type de métrique à collecter
     * @param context Contexte pour la collecte de métriques
     * @returns Métriques collectées avec scores et indicateurs
     */
    collectMetrics(metricType: string, context: Record<string, unknown>): Promise<LearningMetrics>;
}

/**
 * Type pour les métriques d'apprentissage
 */
export interface LearningMetrics extends Record<string, unknown> {
    /**
     * Score global d'apprentissage (0-1)
     */
    score?: number;

    /**
     * Horodatage de la collecte
     */
    timestamp?: number;

    /**
     * Niveau d'attention de l'apprenant (0-1)
     */
    attention?: number;

    /**
     * Niveau de fatigue de l'apprenant (0-1)
     */
    fatigue?: number;

    /**
     * Niveau d'engagement de l'apprenant (0-1)
     */
    engagement?: number;
}

/**
 * Interface pour le service de validation
 * Responsable de la validation des adaptations proposées
 */
export interface IValidationService {
    /**
     * Valide les données selon des critères spécifiques
     * @param data Données à valider
     * @param criteria Critères de validation
     * @returns Résultat de validation avec problèmes potentiels
     */
    validate(data: unknown, criteria: Record<string, unknown>): Promise<ValidationResult>;
}

/**
 * Type pour les résultats de validation
 */
export interface ValidationResult {
    /**
     * Indique si les données sont valides
     */
    valid: boolean;

    /**
     * Liste des problèmes rencontrés
     */
    issues?: string[];

    /**
     * Suggestions pour résoudre les problèmes
     */
    suggestions?: string[];

    /**
     * Score de validité (0-1)
     */
    validityScore?: number;
}

/**
 * Interface pour le gestionnaire d'état
 * Responsable de la gestion de l'état du système d'adaptation
 */
export interface IStateManager {
    /**
     * Récupère l'état actuel du système
     * @returns État actuel du système
     */
    getState(): Record<string, unknown>;

    /**
     * Met à jour l'état du système
     * @param partialState Mise à jour partielle de l'état
     */
    updateState(partialState: Record<string, unknown>): void;

    /**
     * Réinitialise l'état à ses valeurs par défaut
     */
    resetState(): void;
}

/**
 * Interface pour le système d'auto-optimisation
 * Responsable de l'optimisation automatique des adaptations
 */
export interface ISystemAutoOptimisation {
    /**
     * Optimise un composant spécifique avec des paramètres donnés
     * @param component Composant à optimiser
     * @param parameters Paramètres d'optimisation
     * @returns Résultat de l'optimisation
     */
    optimize(component: string, parameters: Record<string, unknown>): Promise<OptimizationResult>;
}

/**
 * Type pour les résultats d'optimisation
 */
export interface OptimizationResult {
    /**
     * Composant optimisé
     */
    component: string;

    /**
     * Indique si l'optimisation a réussi
     */
    optimized: boolean;

    /**
     * Paramètres optimisés
     */
    parameters: Record<string, unknown>;

    /**
     * Amélioration de performance (pourcentage)
     */
    performanceImprovement?: number;

    /**
     * Ressources économisées
     */
    resourcesSaved?: Record<string, number>;
}