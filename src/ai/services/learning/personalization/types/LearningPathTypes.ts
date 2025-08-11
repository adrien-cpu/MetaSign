/**
 * Types et interfaces pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/types/LearningPathTypes.ts
 * @module ai/services/learning/personalization/types
 * @description Types TypeScript pour la gestion des parcours d'apprentissage personnalisés
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem';

/**
 * Niveaux CECRL supportés
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Types d'étapes disponibles dans un parcours
 */
export type StepType = 'exercise' | 'lesson' | 'assessment' | 'revision' | 'practice';

/**
 * Statuts possibles d'une étape
 */
export type StepStatus = 'pending' | 'available' | 'completed' | 'locked';

/**
 * Styles d'apprentissage supportés
 */
export type LearningStyle = 'inductive' | 'deductive' | 'mixed';

/**
 * Modes de génération de parcours
 */
export type PathGenerationMode = 'balanced' | 'mastery' | 'comprehensive' | 'fast-track';

/**
 * Interface représentant une étape dans un parcours d'apprentissage
 */
export interface LearningPathStep {
    /**
     * Identifiant unique de l'étape
     */
    readonly id: string;

    /**
     * Titre de l'étape
     */
    readonly title: string;

    /**
     * Description de l'étape
     */
    readonly description: string;

    /**
     * Type d'étape
     */
    readonly type: StepType;

    /**
     * Niveau de difficulté (0-1)
     */
    readonly difficulty: number;

    /**
     * Durée estimée en minutes
     */
    readonly estimatedDuration: number;

    /**
     * Compétences ciblées
     */
    readonly targetSkills: readonly string[];

    /**
     * Paramètres spécifiques au type d'étape
     */
    readonly params: Readonly<Record<string, unknown>>;

    /**
     * Indique si l'étape est obligatoire
     */
    readonly mandatory: boolean;

    /**
     * Prérequis (identifiants des étapes requises)
     */
    readonly prerequisites: readonly string[];

    /**
     * Priorité de l'étape (pour le tri)
     */
    readonly priority: number;

    /**
     * État de l'étape
     */
    status: StepStatus;
}

/**
 * Préférences d'apprentissage d'un utilisateur
 */
export interface LearningPreferences {
    /**
     * Préférence de difficulté (0-1)
     */
    readonly difficultyPreference: number;

    /**
     * Types d'exercice préférés
     */
    readonly preferredExerciseTypes: readonly string[];

    /**
     * Durée de session préférée (en minutes)
     */
    readonly preferredSessionDuration: number;

    /**
     * Préférence pour l'apprentissage inductif ou déductif
     */
    readonly learningStyle: LearningStyle;
}

/**
 * Interface représentant un parcours d'apprentissage personnalisé
 */
export interface PersonalizedLearningPathModel {
    /**
     * Identifiant unique du parcours
     */
    readonly id: string;

    /**
     * Identifiant de l'utilisateur
     */
    readonly userId: string;

    /**
     * Nom du parcours
     */
    readonly name: string;

    /**
     * Description du parcours
     */
    readonly description: string;

    /**
     * Date de création
     */
    readonly createdAt: Date;

    /**
     * Date de dernière mise à jour
     */
    updatedAt: Date;

    /**
     * Date de début du parcours (optionnelle)
     */
    readonly startDate?: Date;

    /**
     * Date de fin prévue (optionnelle)
     */
    readonly targetEndDate?: Date;

    /**
     * Date de fin réelle si terminé (optionnelle)
     */
    actualEndDate?: Date;

    /**
     * Niveau CECRL ciblé
     */
    readonly targetLevel: CECRLLevel;

    /**
     * Niveau CECRL actuel
     */
    readonly currentLevel: CECRLLevel;

    /**
     * Progression globale (0-1)
     */
    overallProgress: number;

    /**
     * Étapes du parcours
     */
    readonly steps: LearningPathStep[];

    /**
     * Compétences ciblées par le parcours
     */
    readonly focusAreas: readonly string[];

    /**
     * Préférences de l'utilisateur
     */
    readonly preferences: LearningPreferences;

    /**
     * Métadonnées additionnelles (optionnelles)
     */
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Interface pour les options de génération de parcours
 */
export interface PathGenerationOptions {
    /**
     * Niveau CECRL cible
     */
    readonly targetLevel: CECRLLevel;

    /**
     * Durée cible en jours (optionnelle)
     */
    readonly targetDuration?: number;

    /**
     * Intensité souhaitée (1-5) (optionnelle)
     */
    readonly intensity?: number;

    /**
     * Compétences à cibler en priorité (optionnelles)
     */
    readonly focusAreas?: readonly string[];

    /**
     * Types d'exercice à privilégier (optionnels)
     */
    readonly preferredExerciseTypes?: readonly string[];

    /**
     * Mode de génération (optionnel)
     */
    readonly mode?: PathGenerationMode;

    /**
     * Paramètres additionnels (optionnels)
     */
    readonly additionalParams?: Readonly<Record<string, unknown>>;
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
 * Thématique de leçon
 */
export interface LessonTopic {
    /**
     * Identifiant unique de la thématique
     */
    readonly id: string;

    /**
     * Titre de la thématique
     */
    readonly title: string;

    /**
     * Description de la thématique
     */
    readonly description: string;

    /**
     * Niveau CECRL minimum requis
     */
    readonly minLevel: CECRLLevel;

    /**
     * Compétences ciblées par cette thématique
     */
    readonly targetSkills: readonly string[];
}

/**
 * Scénario de pratique
 */
export interface PracticeScenario {
    /**
     * Identifiant unique du scénario
     */
    readonly id: string;

    /**
     * Titre du scénario
     */
    readonly title: string;

    /**
     * Description du scénario
     */
    readonly description: string;

    /**
     * Niveau CECRL minimum requis
     */
    readonly minLevel: CECRLLevel;

    /**
     * Durée estimée en minutes
     */
    readonly estimatedDuration: number;

    /**
     * Compétences développées par ce scénario
     */
    readonly targetSkills: readonly string[];
}

/**
 * Configuration pour un générateur d'étapes
 */
export interface StepGeneratorConfig {
    /**
     * Profil utilisateur
     */
    readonly profile: UserReverseProfile;

    /**
     * Parcours en cours de génération
     */
    readonly path: PersonalizedLearningPathModel;

    /**
     * Options de génération
     */
    readonly options: PathGenerationOptions;

    /**
     * Mode de génération
     */
    readonly mode: PathGenerationMode;

    /**
     * Intensité (1-5)
     */
    readonly intensity: number;
}

/**
 * Résultat de l'adaptation d'un parcours
 */
export interface PathAdaptationResult {
    /**
     * Parcours adapté
     */
    readonly adaptedPath: PersonalizedLearningPathModel;

    /**
     * Changements appliqués
     */
    readonly changes: readonly string[];

    /**
     * Raisons des adaptations
     */
    readonly reasons: readonly string[];

    /**
     * Horodatage de l'adaptation
     */
    readonly timestamp: Date;
}

/**
 * Statistiques d'un parcours
 */
export interface PathStatistics {
    /**
     * Nombre total d'étapes
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
     * Durée totale estimée (minutes)
     */
    readonly totalEstimatedDuration: number;

    /**
     * Durée restante estimée (minutes)
     */
    readonly remainingEstimatedDuration: number;

    /**
     * Répartition par type d'étape
     */
    readonly stepDistribution: Readonly<Record<StepType, number>>;

    /**
     * Répartition par statut d'étape
     */
    readonly statusDistribution: Readonly<Record<StepStatus, number>>;

    /**
     * Compétences couvertes
     */
    readonly coveredSkills: readonly string[];

    /**
     * Date de dernière activité
     */
    readonly lastActivity?: Date;
}

/**
 * Constantes pour les parcours d'apprentissage
 */
export const LEARNING_PATH_CONSTANTS = {
    /**
     * Niveaux CECRL valides
     */
    VALID_CECRL_LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const,

    /**
     * Types d'étapes valides
     */
    VALID_STEP_TYPES: ['exercise', 'lesson', 'assessment', 'revision', 'practice'] as const,

    /**
     * Statuts d'étapes valides
     */
    VALID_STEP_STATUSES: ['pending', 'available', 'completed', 'locked'] as const,

    /**
     * Styles d'apprentissage valides
     */
    VALID_LEARNING_STYLES: ['inductive', 'deductive', 'mixed'] as const,

    /**
     * Modes de génération valides
     */
    VALID_GENERATION_MODES: ['balanced', 'mastery', 'comprehensive', 'fast-track'] as const,

    /**
     * Durée par défaut par niveau (en jours)
     */
    DEFAULT_LEVEL_DURATIONS: {
        A1: 30,
        A2: 45,
        B1: 60,
        B2: 75,
        C1: 90,
        C2: 90
    } as const,

    /**
     * Répartition par défaut des types d'étapes
     */
    DEFAULT_DISTRIBUTION: {
        lesson: 0.3,
        exercise: 0.4,
        practice: 0.1,
        assessment: 0.1,
        revision: 0.1
    } as const,

    /**
     * Intensité par défaut
     */
    DEFAULT_INTENSITY: 3,

    /**
     * Durée de session par défaut (minutes)
     */
    DEFAULT_SESSION_DURATION: 30,

    /**
     * Nombre maximum de prérequis par étape
     */
    MAX_PREREQUISITES_PER_STEP: 3,

    /**
     * Progression minimale pour débloquer les étapes suivantes
     */
    MIN_PROGRESS_THRESHOLD: 0.8
} as const;

/**
 * Utilitaires de validation pour les types
 */
export const LearningPathTypeUtils = {
    /**
     * Vérifie si un niveau CECRL est valide
     */
    isValidCECRLLevel: (level: string): level is CECRLLevel => {
        return LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.includes(level as CECRLLevel);
    },

    /**
     * Vérifie si un type d'étape est valide
     */
    isValidStepType: (type: string): type is StepType => {
        return LEARNING_PATH_CONSTANTS.VALID_STEP_TYPES.includes(type as StepType);
    },

    /**
     * Vérifie si un statut d'étape est valide
     */
    isValidStepStatus: (status: string): status is StepStatus => {
        return LEARNING_PATH_CONSTANTS.VALID_STEP_STATUSES.includes(status as StepStatus);
    },

    /**
     * Vérifie si un style d'apprentissage est valide
     */
    isValidLearningStyle: (style: string): style is LearningStyle => {
        return LEARNING_PATH_CONSTANTS.VALID_LEARNING_STYLES.includes(style as LearningStyle);
    },

    /**
     * Vérifie si un mode de génération est valide
     */
    isValidGenerationMode: (mode: string): mode is PathGenerationMode => {
        return LEARNING_PATH_CONSTANTS.VALID_GENERATION_MODES.includes(mode as PathGenerationMode);
    },

    /**
     * Normalise un niveau CECRL
     */
    normalizeCECRLLevel: (level: string): CECRLLevel => {
        const normalizedLevel = level.toUpperCase();
        return LearningPathTypeUtils.isValidCECRLLevel(normalizedLevel)
            ? normalizedLevel
            : 'A1';
    },

    /**
     * Obtient le niveau suivant dans la progression CECRL
     */
    getNextCECRLLevel: (currentLevel: CECRLLevel): CECRLLevel => {
        const levels = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS;
        const currentIndex = levels.indexOf(currentLevel);

        if (currentIndex === -1 || currentIndex === levels.length - 1) {
            return currentLevel;
        }

        return levels[currentIndex + 1];
    },

    /**
     * Obtient la durée par défaut pour un niveau
     */
    getDefaultDurationForLevel: (level: CECRLLevel): number => {
        return LEARNING_PATH_CONSTANTS.DEFAULT_LEVEL_DURATIONS[level];
    }
} as const;