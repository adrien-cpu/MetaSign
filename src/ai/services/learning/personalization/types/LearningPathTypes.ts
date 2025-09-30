/**
 * Types et interfaces pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/types/LearningPathTypes.ts
 * @module ai/services/learning/personalization/types
 * @description Définitions de types complètes pour le système de parcours d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 1.0.0
 * @since 2025
 * @lastModified 2025-01-22
 */

/**
 * Niveaux CECRL (Cadre Européen Commun de Référence pour les Langues)
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Modes de génération de parcours
 */
export type GenerationMode = 'fast' | 'balanced' | 'thorough' | 'custom';

/**
 * Statuts d'une étape d'apprentissage
 */
export type StepStatus =
    | 'locked'      // Verrouillée (prérequis non satisfaits)
    | 'available'   // Disponible
    | 'in_progress' // En cours
    | 'completed'   // Terminée avec succès
    | 'failed'      // Échouée
    | 'skipped';    // Ignorée

/**
 * Style d'apprentissage
 */
export type LearningStyle = 'visual' | 'kinesthetic' | 'mixed';

/**
 * Étape d'un parcours d'apprentissage
 * 
 * @interface LearningPathStep
 */
export interface LearningPathStep {
    /** Identifiant unique de l'étape */
    readonly id: string;
    /** Titre de l'étape */
    readonly title: string;
    /** Description détaillée */
    readonly description: string;
    /** Type d'étape */
    readonly type: string;
    /** Contenu de l'étape */
    readonly content: StepContent;
    /** Durée estimée (minutes) */
    readonly estimatedDuration: number;
    /** Niveau de difficulté (1-5) */
    readonly difficulty: number;
    /** Compétences prérequises */
    readonly prerequisites: readonly string[];
    /** Compétences ciblées */
    readonly skillsTargeted: readonly string[];
    /** Statut actuel */
    readonly status: StepStatus;
    /** Progression (0-100) */
    readonly progress: number;
    /** Date de completion */
    readonly completedAt: Date | undefined;
    /** Nombre de tentatives */
    readonly attempts: number;
    /** Meilleur score obtenu */
    readonly bestScore: number | undefined;
    /** Poids dans la progression globale */
    readonly weight: number;
    /** Niveau CECRL associé */
    readonly level: CECRLLevel;
    /** Ordre dans le parcours */
    readonly order: number;
}

/**
 * Contenu d'une étape
 * 
 * @interface StepContent
 */
export interface StepContent {
    /** Instructions principales */
    readonly instructions: string;
    /** Ressources associées */
    readonly resources: readonly Resource[];
    /** Exercices pratiques */
    readonly exercises: readonly Exercise[];
    /** Exemples illustratifs */
    readonly examples: readonly Example[];
    /** Conseils pédagogiques */
    readonly tips: readonly string[];
}

/**
 * Ressource pédagogique
 * 
 * @interface Resource
 */
export interface Resource {
    /** Type de ressource */
    readonly type: 'video' | 'image' | 'document' | 'link';
    /** URL de la ressource */
    readonly url: string;
    /** Titre */
    readonly title: string;
    /** Description */
    readonly description: string;
    /** Durée (pour vidéos, en secondes) */
    readonly duration?: number;
}

/**
 * Exercice pratique
 * 
 * @interface Exercise
 */
export interface Exercise {
    /** Identifiant de l'exercice */
    readonly id: string;
    /** Type d'exercice */
    readonly type: 'quiz' | 'practice' | 'simulation' | 'evaluation';
    /** Intitulé */
    readonly prompt: string;
    /** Options ou données de l'exercice */
    readonly data: unknown;
    /** Score attendu pour validation */
    readonly passingScore: number;
}

/**
 * Exemple illustratif
 * 
 * @interface Example
 */
export interface Example {
    /** Description de l'exemple */
    readonly description: string;
    /** Démonstration (URL vidéo ou image) */
    readonly demonstration: string;
    /** Explications complémentaires */
    readonly explanation: string;
}

/**
 * Préférences d'apprentissage
 * 
 * @interface LearningPreferences
 */
export interface LearningPreferences {
    /** Préférence de difficulté (0-1) */
    readonly difficultyPreference: number;
    /** Types d'exercices préférés */
    readonly preferredExerciseTypes: readonly string[];
    /** Durée de session préférée (minutes) */
    readonly preferredSessionDuration: number;
    /** Style d'apprentissage */
    readonly learningStyle: LearningStyle;
}

/**
 * Modèle de parcours d'apprentissage personnalisé
 * 
 * @interface PersonalizedLearningPathModel
 */
export interface PersonalizedLearningPathModel {
    /** Identifiant unique du parcours */
    readonly id: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Nom du parcours */
    readonly name: string;
    /** Description */
    readonly description: string;
    /** Date de création */
    readonly createdAt: Date;
    /** Date de dernière mise à jour */
    readonly updatedAt: Date;
    /** Date de début */
    readonly startDate: Date;
    /** Date cible de fin */
    readonly targetEndDate: Date;
    /** Niveau cible */
    readonly targetLevel: CECRLLevel;
    /** Niveau actuel */
    readonly currentLevel: CECRLLevel;
    /** Progression globale (0-100) */
    readonly overallProgress: number;
    /** Liste des étapes */
    readonly steps: LearningPathStep[];
    /** Domaines de focus */
    readonly focusAreas: readonly string[];
    /** Préférences d'apprentissage */
    readonly preferences: LearningPreferences;
}

/**
 * Options de génération de parcours
 * 
 * @interface PathGenerationOptions
 */
export interface PathGenerationOptions {
    /** Niveau cible à atteindre */
    readonly targetLevel: CECRLLevel;
    /** Mode de génération */
    readonly mode?: GenerationMode;
    /** Intensité d'apprentissage (1-5) */
    readonly intensity?: number;
    /** Durée cible du parcours (jours) */
    readonly targetDuration?: number;
    /** Domaines de focus spécifiques */
    readonly focusAreas?: readonly string[];
    /** Types d'exercices préférés */
    readonly preferredExerciseTypes?: readonly string[];
}

/**
 * Configuration de génération d'étapes
 * 
 * @interface StepGeneratorConfig
 */
export interface StepGeneratorConfig {
    /** Profil utilisateur */
    readonly profile: unknown;
    /** Parcours en cours de génération */
    readonly path: PersonalizedLearningPathModel;
    /** Options de génération */
    readonly options: PathGenerationOptions;
    /** Mode sélectionné */
    readonly mode: GenerationMode;
    /** Intensité sélectionnée */
    readonly intensity: number;
}

/**
 * Statistiques d'un parcours d'apprentissage
 * 
 * @interface PathStatistics
 */
export interface PathStatistics {
    /** Nombre total d'étapes */
    readonly totalSteps: number;
    /** Étapes complétées */
    readonly completedSteps: number;
    /** Étapes en cours */
    readonly inProgressSteps: number;
    /** Étapes échouées */
    readonly failedSteps: number;
    /** Durée totale estimée (minutes) */
    readonly totalDuration: number;
    /** Durée complétée (minutes) */
    readonly completedDuration: number;
    /** Temps restant estimé (minutes) */
    readonly estimatedTimeRemaining: number;
    /** Score moyen */
    readonly averageScore: number;
    /** Taux de réussite (0-100) */
    readonly successRate: number;
    /** Compétences acquises */
    readonly skillsAcquired: readonly string[];
    /** Compétences en cours */
    readonly skillsInProgress: readonly string[];
    /** Progression globale */
    readonly overallProgress: number;
    /** Date estimée de completion */
    readonly estimatedCompletionDate: Date;
    /** Date de dernière activité */
    readonly lastActivityDate: Date;
}

/**
 * Constantes du système de parcours
 */
export const LEARNING_PATH_CONSTANTS = {
    /** Niveaux CECRL valides */
    VALID_CECRL_LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const,

    /** Modes de génération valides */
    VALID_GENERATION_MODES: ['fast', 'balanced', 'thorough', 'custom'] as const,

    /** Intensité par défaut */
    DEFAULT_INTENSITY: 3,

    /** Durée de session par défaut (minutes) */
    DEFAULT_SESSION_DURATION: 30,

    /** Durées estimées par niveau (jours) */
    DEFAULT_LEVEL_DURATIONS: {
        A1: 90,  // 3 mois
        A2: 120, // 4 mois
        B1: 150, // 5 mois
        B2: 180, // 6 mois
        C1: 240, // 8 mois
        C2: 300  // 10 mois
    } as const
} as const;

/**
 * Utilitaires pour les types de parcours
 * 
 * @class LearningPathTypeUtils
 */
export class LearningPathTypeUtils {
    /**
     * Vérifie si un niveau CECRL est valide
     * 
     * @param level - Niveau à vérifier
     * @returns boolean True si valide
     */
    public static isValidCECRLLevel(level: string): level is CECRLLevel {
        return LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.includes(level as CECRLLevel);
    }

    /**
     * Vérifie si un mode de génération est valide
     * 
     * @param mode - Mode à vérifier
     * @returns boolean True si valide
     */
    public static isValidGenerationMode(mode: string): mode is GenerationMode {
        return LEARNING_PATH_CONSTANTS.VALID_GENERATION_MODES.includes(mode as GenerationMode);
    }

    /**
     * Normalise un niveau CECRL
     * 
     * @param level - Niveau à normaliser
     * @returns CECRLLevel Niveau normalisé
     */
    public static normalizeCECRLLevel(level: string): CECRLLevel {
        const normalized = level.toUpperCase();

        if (this.isValidCECRLLevel(normalized)) {
            return normalized;
        }

        throw new Error(`Niveau CECRL invalide: ${level}`);
    }

    /**
     * Normalise un nom de compétence
     * 
     * @param skillName - Nom de compétence
     * @returns string Nom normalisé
     */
    public static normalizeSkillName(skillName: string): string {
        return skillName.toLowerCase().trim().replace(/\s+/g, '_');
    }

    /**
     * Compare deux niveaux CECRL
     * 
     * @param level1 - Premier niveau
     * @param level2 - Deuxième niveau
     * @returns number -1 si level1 < level2, 0 si égaux, 1 si level1 > level2
     */
    public static compareLevels(level1: CECRLLevel, level2: CECRLLevel): number {
        const index1 = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.indexOf(level1);
        const index2 = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.indexOf(level2);

        return Math.sign(index1 - index2);
    }

    /**
     * Calcule l'écart entre deux niveaux
     * 
     * @param currentLevel - Niveau actuel
     * @param targetLevel - Niveau cible
     * @returns number Nombre de niveaux d'écart
     */
    public static calculateLevelGap(currentLevel: CECRLLevel, targetLevel: CECRLLevel): number {
        const currentIndex = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.indexOf(currentLevel);
        const targetIndex = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.indexOf(targetLevel);

        return Math.abs(targetIndex - currentIndex);
    }
}