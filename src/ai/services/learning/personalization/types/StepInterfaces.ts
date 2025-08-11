/**
 * Interfaces pour les étapes d'apprentissage dans les parcours personnalisés
 * 
 * @file src/ai/services/learning/personalization/types/StepInterfaces.ts
 * @module ai/services/learning/personalization/types
 * @description Interfaces TypeScript pour la gestion des étapes d'apprentissage
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    UniqueId,
    DisplayName,
    Description,
    StepType,
    StepStatus,
    DifficultyLevel,
    DurationMinutes,
    StepPriority,
    LSFSkillType,
    ConfigParams,
    CECRLLevel
} from './BaseTypes';

/**
 * Interface représentant une étape dans un parcours d'apprentissage LSF
 */
export interface LearningPathStep {
    /**
     * Identifiant unique de l'étape
     */
    readonly id: UniqueId;

    /**
     * Titre descriptif de l'étape
     */
    readonly title: DisplayName;

    /**
     * Description détaillée de l'étape
     */
    readonly description: Description;

    /**
     * Type d'étape (leçon, exercice, évaluation, etc.)
     */
    readonly type: StepType;

    /**
     * Niveau de difficulté normalisé (0-1)
     */
    readonly difficulty: DifficultyLevel;

    /**
     * Durée estimée en minutes
     */
    readonly estimatedDuration: DurationMinutes;

    /**
     * Compétences LSF ciblées par cette étape
     */
    readonly targetSkills: readonly LSFSkillType[];

    /**
     * Paramètres spécifiques au type d'étape
     */
    readonly params: ConfigParams;

    /**
     * Indique si l'étape est obligatoire dans le parcours
     */
    readonly mandatory: boolean;

    /**
     * Identifiants des étapes prérequises
     */
    readonly prerequisites: readonly UniqueId[];

    /**
     * Priorité pour le tri et l'organisation
     */
    readonly priority: StepPriority;

    /**
     * État actuel de l'étape (mutable)
     */
    status: StepStatus;

    /**
     * Niveau CECRL minimum requis pour cette étape
     */
    readonly minRequiredLevel: CECRLLevel;

    /**
     * Niveau CECRL visé après completion de cette étape
     */
    readonly targetLevel: CECRLLevel;

    /**
     * Pourcentage de contribution à la progression globale
     */
    readonly progressWeight: number;

    /**
     * Identifiants des étapes suivantes recommandées
     */
    readonly suggestedNextSteps: readonly UniqueId[];

    /**
     * Tags pour catégoriser et filtrer l'étape
     */
    readonly tags: readonly string[];

    /**
     * Ressources associées à l'étape (vidéos, documents, etc.)
     */
    readonly resources: readonly StepResource[];

    /**
     * Critères d'évaluation pour cette étape
     */
    readonly evaluationCriteria: readonly EvaluationCriterion[];

    /**
     * Date de création de l'étape
     */
    readonly createdAt: Date;

    /**
     * Date de dernière modification
     */
    readonly updatedAt?: Date;
}

/**
 * Interface pour les ressources associées à une étape
 */
export interface StepResource {
    /**
     * Identifiant unique de la ressource
     */
    readonly id: UniqueId;

    /**
     * Titre de la ressource
     */
    readonly title: DisplayName;

    /**
     * Description de la ressource
     */
    readonly description: Description;

    /**
     * Type de ressource
     */
    readonly type: ResourceType;

    /**
     * URL ou chemin vers la ressource
     */
    readonly url: string;

    /**
     * Indique si la ressource est obligatoire
     */
    readonly mandatory: boolean;

    /**
     * Durée estimée d'utilisation en minutes
     */
    readonly estimatedDuration: DurationMinutes;

    /**
     * Niveau de difficulté de la ressource
     */
    readonly difficulty: DifficultyLevel;

    /**
     * Métadonnées additionnelles
     */
    readonly metadata: ConfigParams;
}

/**
 * Types de ressources disponibles pour les étapes
 */
export type ResourceType =
    | 'video'
    | 'document'
    | 'interactive'
    | 'audio'
    | 'image'
    | 'simulation'
    | 'quiz'
    | 'external_link';

/**
 * Interface pour les critères d'évaluation d'une étape
 */
export interface EvaluationCriterion {
    /**
     * Identifiant unique du critère
     */
    readonly id: UniqueId;

    /**
     * Nom du critère d'évaluation
     */
    readonly name: DisplayName;

    /**
     * Description du critère
     */
    readonly description: Description;

    /**
     * Poids du critère dans l'évaluation totale
     */
    readonly weight: number;

    /**
     * Score minimum requis pour valider ce critère
     */
    readonly minScore: number;

    /**
     * Score maximum atteignable pour ce critère
     */
    readonly maxScore: number;

    /**
     * Type de critère d'évaluation
     */
    readonly type: EvaluationCriterionType;

    /**
     * Compétences LSF évaluées par ce critère
     */
    readonly evaluatedSkills: readonly LSFSkillType[];
}

/**
 * Types de critères d'évaluation
 */
export type EvaluationCriterionType =
    | 'comprehension'
    | 'expression'
    | 'precision'
    | 'fluency'
    | 'grammar'
    | 'vocabulary'
    | 'cultural_context'
    | 'interaction';

/**
 * Interface pour le résultat d'une étape complétée
 */
export interface StepCompletionResult {
    /**
     * Identifiant de l'étape complétée
     */
    readonly stepId: UniqueId;

    /**
     * Indique si l'étape a été complétée avec succès
     */
    readonly success: boolean;

    /**
     * Score obtenu (0-100)
     */
    readonly score: number;

    /**
     * Temps passé sur l'étape en minutes
     */
    readonly timeSpent: DurationMinutes;

    /**
     * Résultats détaillés par critère d'évaluation
     */
    readonly criteriaResults: readonly CriterionResult[];

    /**
     * Feedback textuel sur la performance
     */
    readonly feedback: string;

    /**
     * Recommandations pour l'amélioration
     */
    readonly recommendations: readonly string[];

    /**
     * Date de completion
     */
    readonly completedAt: Date;

    /**
     * Tentatives effectuées avant réussite
     */
    readonly attempts: number;

    /**
     * Compétences maîtrisées après cette étape
     */
    readonly masteredSkills: readonly LSFSkillType[];

    /**
     * Compétences à améliorer
     */
    readonly skillsToImprove: readonly LSFSkillType[];
}

/**
 * Interface pour le résultat d'un critère d'évaluation
 */
export interface CriterionResult {
    /**
     * Identifiant du critère évalué
     */
    readonly criterionId: UniqueId;

    /**
     * Score obtenu pour ce critère
     */
    readonly score: number;

    /**
     * Score maximum possible pour ce critère
     */
    readonly maxScore: number;

    /**
     * Pourcentage de réussite (0-100)
     */
    readonly percentage: number;

    /**
     * Indique si le critère a été validé
     */
    readonly passed: boolean;

    /**
     * Commentaires spécifiques à ce critère
     */
    readonly comments: string;

    /**
     * Détails de l'évaluation par compétence
     */
    readonly skillDetails: readonly SkillEvaluationDetail[];
}

/**
 * Interface pour le détail d'évaluation par compétence
 */
export interface SkillEvaluationDetail {
    /**
     * Type de compétence LSF évaluée
     */
    readonly skill: LSFSkillType;

    /**
     * Score obtenu pour cette compétence (0-100)
     */
    readonly score: number;

    /**
     * Niveau de maîtrise atteint
     */
    readonly masteryLevel: MasteryLevel;

    /**
     * Progression par rapport à l'évaluation précédente
     */
    readonly progress: number;

    /**
     * Observations spécifiques à cette compétence
     */
    readonly observations: string;

    /**
     * Suggestions d'amélioration
     */
    readonly improvements: readonly string[];
}

/**
 * Niveaux de maîtrise d'une compétence
 */
export type MasteryLevel =
    | 'novice'        // 0-25%
    | 'beginner'      // 26-50%
    | 'intermediate'  // 51-75%
    | 'advanced'      // 76-90%
    | 'expert';       // 91-100%

/**
 * Garde de type pour vérifier si une valeur est un type de ressource valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un type de ressource valide
 */
export function isResourceType(value: unknown): value is ResourceType {
    return typeof value === 'string' &&
        ['video', 'document', 'interactive', 'audio', 'image', 'simulation', 'quiz', 'external_link'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est un type de critère d'évaluation valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un type de critère d'évaluation valide
 */
export function isEvaluationCriterionType(value: unknown): value is EvaluationCriterionType {
    return typeof value === 'string' &&
        ['comprehension', 'expression', 'precision', 'fluency', 'grammar', 'vocabulary', 'cultural_context', 'interaction'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est un niveau de maîtrise valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un niveau de maîtrise valide
 */
export function isMasteryLevel(value: unknown): value is MasteryLevel {
    return typeof value === 'string' &&
        ['novice', 'beginner', 'intermediate', 'advanced', 'expert'].includes(value);
}

/**
 * Calcule le niveau de maîtrise basé sur un score
 * 
 * @param score Score de 0 à 100
 * @returns Niveau de maîtrise correspondant
 * 
 * @example
 * ```typescript
 * const level = calculateMasteryLevel(85); // Returns 'advanced'
 * ```
 */
export function calculateMasteryLevel(score: number): MasteryLevel {
    if (score < 0 || score > 100) {
        throw new Error('Score must be between 0 and 100');
    }

    if (score <= 25) return 'novice';
    if (score <= 50) return 'beginner';
    if (score <= 75) return 'intermediate';
    if (score <= 90) return 'advanced';
    return 'expert';
}