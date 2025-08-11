/**
 * Interfaces pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/types/PathInterfaces.ts
 * @module ai/services/learning/personalization/types
 * @description Interfaces TypeScript pour la gestion des parcours d'apprentissage complets
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
    CECRLLevel,
    LearningStyle,
    PathGenerationMode,
    LSFSkillType,
    Metadata,
    ConfigParams,
    DurationMinutes,
    IntensityLevel
} from './BaseTypes';

import type {
    LearningPathStep,
    StepType,
    StepStatus
} from './StepInterfaces';

/**
 * Interface représentant un parcours d'apprentissage personnalisé complet
 */
export interface PersonalizedLearningPathModel {
    /**
     * Identifiant unique du parcours
     */
    readonly id: UniqueId;

    /**
     * Identifiant de l'utilisateur propriétaire
     */
    readonly userId: UniqueId;

    /**
     * Nom descriptif du parcours
     */
    readonly name: DisplayName;

    /**
     * Description détaillée du parcours
     */
    readonly description: Description;

    /**
     * Date de création du parcours
     */
    readonly createdAt: Date;

    /**
     * Date de dernière mise à jour (mutable)
     */
    updatedAt: Date;

    /**
     * Date de début effectif du parcours
     */
    readonly startDate?: Date;

    /**
     * Date de fin prévue
     */
    readonly targetEndDate?: Date;

    /**
     * Date de fin réelle si terminé (mutable)
     */
    actualEndDate?: Date;

    /**
     * Niveau CECRL ciblé à l'issue du parcours
     */
    readonly targetLevel: CECRLLevel;

    /**
     * Niveau CECRL de départ de l'utilisateur
     */
    readonly currentLevel: CECRLLevel;

    /**
     * Progression globale du parcours (0-1) (mutable)
     */
    overallProgress: number;

    /**
     * Liste ordonnée des étapes du parcours
     */
    readonly steps: LearningPathStep[];

    /**
     * Compétences LSF ciblées prioritairement
     */
    readonly focusAreas: readonly LSFSkillType[];

    /**
     * Préférences d'apprentissage de l'utilisateur
     */
    readonly preferences: LearningPreferences;

    /**
     * Métadonnées additionnelles du parcours
     */
    readonly metadata?: Metadata;

    /**
     * Indicateur de parcours archivé
     */
    readonly isArchived: boolean;

    /**
     * Indicateur de parcours favori
     */
    readonly isFavorite: boolean;

    /**
     * Catégorie du parcours
     */
    readonly category: PathCategory;

    /**
     * Estimation de la durée totale en minutes
     */
    readonly estimatedTotalDuration: DurationMinutes;

    /**
     * Niveau de difficulté moyen du parcours (0-1)
     */
    readonly averageDifficulty: number;

    /**
     * Tags pour la recherche et le filtrage
     */
    readonly tags: readonly string[];
}

/**
 * Préférences d'apprentissage personnalisées
 */
export interface LearningPreferences {
    /**
     * Préférence de niveau de difficulté (0-1)
     */
    readonly difficultyPreference: number;

    /**
     * Types d'exercices préférés par l'utilisateur
     */
    readonly preferredExerciseTypes: readonly string[];

    /**
     * Durée de session d'apprentissage préférée en minutes
     */
    readonly preferredSessionDuration: DurationMinutes;

    /**
     * Style d'apprentissage préféré
     */
    readonly learningStyle: LearningStyle;

    /**
     * Préférence pour l'apprentissage en autonomie
     */
    readonly autonomyPreference: number; // 0-1

    /**
     * Préférence pour les interactions sociales dans l'apprentissage
     */
    readonly socialLearningPreference: number; // 0-1

    /**
     * Préférence pour le feedback immédiat
     */
    readonly immediateFeedbackPreference: boolean;

    /**
     * Créneaux horaires préférés pour l'apprentissage
     */
    readonly preferredTimeSlots: readonly TimeSlot[];

    /**
     * Jours de la semaine préférés pour l'apprentissage
     */
    readonly preferredDays: readonly DayOfWeek[];

    /**
     * Préférences de modalités d'apprentissage
     */
    readonly modalityPreferences: readonly LearningModality[];
}

/**
 * Créneaux horaires pour l'apprentissage
 */
export interface TimeSlot {
    /**
     * Heure de début (format 24h: HH:MM)
     */
    readonly startTime: string;

    /**
     * Heure de fin (format 24h: HH:MM)
     */
    readonly endTime: string;

    /**
     * Fuseau horaire
     */
    readonly timezone: string;
}

/**
 * Jours de la semaine
 */
export type DayOfWeek =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

/**
 * Modalités d'apprentissage
 */
export type LearningModality =
    | 'visual'
    | 'kinesthetic'
    | 'interactive'
    | 'collaborative'
    | 'self_paced'
    | 'guided';

/**
 * Catégories de parcours
 */
export type PathCategory =
    | 'beginner'
    | 'intermediate'
    | 'advanced'
    | 'specialized'
    | 'preparation'
    | 'certification'
    | 'cultural'
    | 'professional';

/**
 * Interface pour les options de génération de parcours
 */
export interface PathGenerationOptions {
    /**
     * Niveau CECRL cible à atteindre
     */
    readonly targetLevel: CECRLLevel;

    /**
     * Durée cible du parcours en jours
     */
    readonly targetDuration?: number;

    /**
     * Niveau d'intensité souhaité (1-5)
     */
    readonly intensity?: IntensityLevel;

    /**
     * Compétences LSF à cibler prioritairement
     */
    readonly focusAreas?: readonly LSFSkillType[];

    /**
     * Types d'exercices à privilégier
     */
    readonly preferredExerciseTypes?: readonly string[];

    /**
     * Mode de génération du parcours
     */
    readonly mode?: PathGenerationMode;

    /**
     * Paramètres additionnels de personnalisation
     */
    readonly additionalParams?: ConfigParams;

    /**
     * Forcer la régénération même si un parcours existe
     */
    readonly forceRegeneration?: boolean;

    /**
     * Inclure des étapes de révision
     */
    readonly includeRevisions?: boolean;

    /**
     * Inclure des évaluations intermédiaires
     */
    readonly includeAssessments?: boolean;

    /**
     * Limite du nombre d'étapes
     */
    readonly maxSteps?: number;

    /**
     * Répartition personnalisée des types d'étapes
     */
    readonly customDistribution?: StepDistributionConfig;
}

/**
 * Configuration pour la répartition des types d'étapes
 */
export interface StepDistributionConfig {
    /**
     * Proportion de leçons (0-1)
     */
    readonly lesson: number;

    /**
     * Proportion d'exercices (0-1)
     */
    readonly exercise: number;

    /**
     * Proportion de pratique (0-1)
     */
    readonly practice: number;

    /**
     * Proportion d'évaluations (0-1)
     */
    readonly assessment: number;

    /**
     * Proportion de révisions (0-1)
     */
    readonly revision: number;
}

/**
 * Résultat de l'adaptation d'un parcours
 */
export interface PathAdaptationResult {
    /**
     * Parcours adapté avec les modifications appliquées
     */
    readonly adaptedPath: PersonalizedLearningPathModel;

    /**
     * Liste des changements effectués
     */
    readonly changes: readonly string[];

    /**
     * Raisons justifiant les adaptations
     */
    readonly reasons: readonly string[];

    /**
     * Horodatage de l'adaptation
     */
    readonly timestamp: Date;

    /**
     * Score de confiance de l'adaptation (0-1)
     */
    readonly confidenceScore: number;

    /**
     * Recommandations pour l'utilisateur
     */
    readonly recommendations: readonly string[];

    /**
     * Prochaine évaluation recommandée
     */
    readonly nextEvaluationDate?: Date;
}

/**
 * Statistiques détaillées d'un parcours
 */
export interface PathStatistics {
    /**
     * Nombre total d'étapes dans le parcours
     */
    readonly totalSteps: number;

    /**
     * Nombre d'étapes complétées
     */
    readonly completedSteps: number;

    /**
     * Progression globale (0-1)
     */
    readonly progress: number;

    /**
     * Durée totale estimée en minutes
     */
    readonly totalEstimatedDuration: DurationMinutes;

    /**
     * Durée restante estimée en minutes
     */
    readonly remainingEstimatedDuration: DurationMinutes;

    /**
     * Répartition des étapes par type
     */
    readonly stepDistribution: Readonly<Record<StepType, number>>;

    /**
     * Répartition des étapes par statut
     */
    readonly statusDistribution: Readonly<Record<StepStatus, number>>;

    /**
     * Compétences LSF couvertes par le parcours
     */
    readonly coveredSkills: readonly LSFSkillType[];

    /**
     * Date de dernière activité
     */
    readonly lastActivity?: Date;

    /**
     * Temps total passé sur le parcours en minutes
     */
    readonly totalTimeSpent: DurationMinutes;

    /**
     * Score moyen obtenu sur les étapes complétées
     */
    readonly averageScore: number;

    /**
     * Vitesse de progression (étapes par jour)
     */
    readonly progressionRate: number;

    /**
     * Prédiction de date de completion
     */
    readonly estimatedCompletionDate?: Date;
}

/**
 * Interface pour l'historique d'un parcours
 */
export interface PathHistory {
    /**
     * Identifiant du parcours
     */
    readonly pathId: UniqueId;

    /**
     * Événements chronologiques du parcours
     */
    readonly events: readonly PathEvent[];

    /**
     * Snapshots de progression
     */
    readonly progressSnapshots: readonly ProgressSnapshot[];

    /**
     * Adaptations effectuées
     */
    readonly adaptations: readonly PathAdaptationResult[];
}

/**
 * Événement dans l'historique d'un parcours
 */
export interface PathEvent {
    /**
     * Identifiant unique de l'événement
     */
    readonly id: UniqueId;

    /**
     * Type d'événement
     */
    readonly type: PathEventType;

    /**
     * Description de l'événement
     */
    readonly description: string;

    /**
     * Horodatage de l'événement
     */
    readonly timestamp: Date;

    /**
     * Données associées à l'événement
     */
    readonly data: ConfigParams;
}

/**
 * Types d'événements dans un parcours
 */
export type PathEventType =
    | 'created'
    | 'started'
    | 'step_completed'
    | 'step_failed'
    | 'adapted'
    | 'paused'
    | 'resumed'
    | 'completed'
    | 'archived';

/**
 * Snapshot de progression à un instant donné
 */
export interface ProgressSnapshot {
    /**
     * Horodatage du snapshot
     */
    readonly timestamp: Date;

    /**
     * Progression globale à ce moment
     */
    readonly progress: number;

    /**
     * Nombre d'étapes complétées
     */
    readonly completedSteps: number;

    /**
     * Compétences maîtrisées à ce moment
     */
    readonly masteredSkills: readonly LSFSkillType[];

    /**
     * Score moyen à ce moment
     */
    readonly averageScore: number;
}

/**
 * Garde de type pour vérifier si une valeur est un jour de la semaine valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un jour de la semaine valide
 */
export function isDayOfWeek(value: unknown): value is DayOfWeek {
    return typeof value === 'string' &&
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est une modalité d'apprentissage valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est une modalité d'apprentissage valide
 */
export function isLearningModality(value: unknown): value is LearningModality {
    return typeof value === 'string' &&
        ['visual', 'kinesthetic', 'interactive', 'collaborative', 'self_paced', 'guided'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est une catégorie de parcours valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est une catégorie de parcours valide
 */
export function isPathCategory(value: unknown): value is PathCategory {
    return typeof value === 'string' &&
        ['beginner', 'intermediate', 'advanced', 'specialized', 'preparation', 'certification', 'cultural', 'professional'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est un type d'événement de parcours valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un type d'événement de parcours valide
 */
export function isPathEventType(value: unknown): value is PathEventType {
    return typeof value === 'string' &&
        ['created', 'started', 'step_completed', 'step_failed', 'adapted', 'paused', 'resumed', 'completed', 'archived'].includes(value);
}