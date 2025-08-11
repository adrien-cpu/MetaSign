/**
 * Interface pour les stratégies de génération de contenu - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/content/strategies/interfaces/IContentGeneratorStrategy.ts
 * @module ai/services/learning/human/coda/codavirtuel/exercises/content/strategies/interfaces
 * @description Interface commune pour tous les générateurs de contenu d'exercices
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import { CECRLLevel } from '../../../types/ExerciseGeneratorTypes';

/**
 * Type pour la difficulté des exercices
 */
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Interface pour le contenu d'exercice
 */
export interface ExerciseContent {
    readonly type: string;
    readonly metadata?: Record<string, unknown>;
}

/**
 * Interface pour les réponses d'exercices
 */
export interface ExerciseResponse {
    readonly [key: string]: unknown;
}

/**
 * Interface pour la génération de concepts
 */
export interface ConceptGenerator {
    generateConceptsToTest(theme: string, excludedConcepts: readonly string[], count: number): string[];
    getStats?(): Record<string, unknown>;
    destroy?(): void;
}

/**
 * Interface commune pour toutes les stratégies de génération de contenu d'exercices
 */
export interface IContentGeneratorStrategy {
    /**
     * Génère le contenu d'un exercice
     * @param theme Thème de l'exercice
     * @param level Niveau CECRL de l'apprenant
     * @param difficulty Difficulté de l'exercice
     * @param conceptGenerator Générateur de concepts pour enrichir le contenu
     * @returns Contenu d'exercice généré
     * @throws {Error} Si la génération échoue
     */
    generate(
        theme: string,
        level: CECRLLevel,
        difficulty: ExerciseDifficulty,
        conceptGenerator: ConceptGenerator
    ): ExerciseContent;

    /**
     * Génère la réponse attendue pour un exercice
     * @param content Contenu de l'exercice
     * @returns Réponse attendue
     * @throws {Error} Si le contenu est invalide
     */
    generateExpectedResponse(content: ExerciseContent): ExerciseResponse;

    /**
     * Valide une réponse d'apprenant
     * @param content Contenu de l'exercice
     * @param expectedResponse Réponse attendue
     * @param studentResponse Réponse de l'apprenant
     * @returns Score entre 0 et 1
     */
    validateResponse(
        content: ExerciseContent,
        expectedResponse: ExerciseResponse,
        studentResponse: ExerciseResponse
    ): number;

    /**
     * Retourne le nom de la stratégie (optionnel)
     */
    readonly name?: string;

    /**
     * Retourne la version de la stratégie (optionnel)
     */
    readonly version?: string;

    /**
     * Retourne les statistiques d'utilisation (optionnel)
     */
    getStats?(): {
        readonly totalGenerations: number;
        readonly averageGenerationTime: number;
        readonly successRate: number;
        readonly lastUsed: Date | null;
    };

    /**
     * Libère les ressources (optionnel)
     */
    destroy?(): void;
}

/**
 * Interface étendue pour les stratégies avancées
 */
export interface IAdvancedContentGeneratorStrategy extends IContentGeneratorStrategy {
    /**
     * Configure la stratégie avec des paramètres spécifiques
     * @param config Configuration personnalisée
     */
    configure(config: Record<string, unknown>): void;

    /**
     * Valide que la stratégie peut gérer un type de contenu
     * @param contentType Type de contenu à valider
     * @returns True si le type est supporté
     */
    canHandle(contentType: string): boolean;

    /**
     * Pré-traite les paramètres avant génération
     * @param theme Thème original
     * @param level Niveau CECRL
     * @param difficulty Difficulté
     * @returns Paramètres traités
     */
    preprocessParameters(
        theme: string,
        level: CECRLLevel,
        difficulty: ExerciseDifficulty
    ): {
        readonly processedTheme: string;
        readonly adjustedLevel: CECRLLevel;
        readonly adjustedDifficulty: ExerciseDifficulty;
        readonly metadata: Record<string, unknown>;
    };
}

/**
 * Type pour les factory functions des stratégies
 */
export type StrategyFactory<T extends IContentGeneratorStrategy = IContentGeneratorStrategy> = (
    config?: Record<string, unknown>
) => T;

/**
 * Interface pour les métriques de performance des stratégies
 */
export interface StrategyMetrics {
    readonly totalGenerations: number;
    readonly totalValidations: number;
    readonly averageGenerationTime: number;
    readonly averageValidationTime: number;
    readonly successRate: number;
    readonly errorRate: number;
    readonly lastUsed: Date | null;
    readonly createdAt: Date;
}

/**
 * Interface pour la configuration des stratégies
 */
export interface StrategyConfig {
    readonly name?: string;
    readonly version?: string;
    readonly enableMetrics?: boolean;
    readonly enableCaching?: boolean;
    readonly cacheSize?: number;
    readonly cacheTTL?: number;
    readonly customParameters?: Record<string, unknown>;
}

/**
 * Type guard pour vérifier si un objet implémente IContentGeneratorStrategy
 * @param obj Objet à vérifier
 * @returns True si l'objet implémente l'interface
 */
export function isContentGeneratorStrategy(obj: unknown): obj is IContentGeneratorStrategy {
    return obj !== null &&
        typeof obj === 'object' &&
        typeof (obj as IContentGeneratorStrategy).generate === 'function' &&
        typeof (obj as IContentGeneratorStrategy).generateExpectedResponse === 'function' &&
        typeof (obj as IContentGeneratorStrategy).validateResponse === 'function';
}

/**
 * Type guard pour vérifier si un objet implémente IAdvancedContentGeneratorStrategy
 * @param obj Objet à vérifier
 * @returns True si l'objet implémente l'interface étendue
 */
export function isAdvancedContentGeneratorStrategy(
    obj: unknown
): obj is IAdvancedContentGeneratorStrategy {
    return isContentGeneratorStrategy(obj) &&
        typeof (obj as IAdvancedContentGeneratorStrategy).configure === 'function' &&
        typeof (obj as IAdvancedContentGeneratorStrategy).canHandle === 'function' &&
        typeof (obj as IAdvancedContentGeneratorStrategy).preprocessParameters === 'function';
}