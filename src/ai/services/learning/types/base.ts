/**
 * Types de base et énumérations fondamentales pour le module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/base.ts
 * @module ai/services/learning/types
 * @description Énumérations et types fondamentaux utilisés dans tout le module d'apprentissage
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-06-28
 */

/**
 * Types de profils utilisateur supportés par le système
 * @enum ProfilType
 */
export enum ProfilType {
    /** Utilisateur sourd */
    SOURD = 'sourd',
    /** Utilisateur entendant */
    ENTENDANT = 'entendant',
    /** Interprète LSF */
    INTERPRETE = 'interprete',
    /** Éducateur/Formateur */
    EDUCATEUR = 'educateur'
}

/**
 * Types d'interactions utilisateur possibles dans le système d'apprentissage
 * @enum InteractionType
 */
export enum InteractionType {
    /** Démarrage d'une activité */
    START = 'start',
    /** Complétion d'une activité */
    COMPLETE = 'complete',
    /** Pause d'une activité */
    PAUSE = 'pause',
    /** Reprise d'une activité */
    RESUME = 'resume',
    /** Abandon d'une activité */
    ABANDON = 'abandon',
    /** Clic sur un élément */
    CLICK = 'click',
    /** Survol d'un élément */
    HOVER = 'hover',
    /** Soumission d'une réponse */
    SUBMIT = 'submit',
    /** Demande d'aide */
    HELP_REQUEST = 'help_request',
    /** Navigation */
    NAVIGATION = 'navigation',
    /** Erreur utilisateur */
    ERROR = 'error'
}

/**
 * Types de sessions d'apprentissage
 * @enum LearningSessionType
 */
export enum LearningSessionType {
    /** Session guidée */
    GUIDED = 'guided',
    /** Session libre */
    FREE = 'free',
    /** Session d'évaluation */
    ASSESSMENT = 'assessment',
    /** Session immersive */
    IMMERSIVE = 'immersive',
    /** Session de révision */
    REVIEW = 'review'
}

/**
 * États d'une session d'apprentissage
 * @enum LearningSessionState
 */
export enum LearningSessionState {
    /** En initialisation */
    INITIALIZING = 'initializing',
    /** En cours */
    IN_PROGRESS = 'in_progress',
    /** En pause */
    PAUSED = 'paused',
    /** Terminée avec succès */
    COMPLETED = 'completed',
    /** Terminée avec abandon */
    ABANDONED = 'abandoned',
    /** Terminée avec erreur */
    ERROR = 'error'
}

/**
 * Styles d'apprentissage
 * @enum LearningStyle
 */
export enum LearningStyle {
    /** Visuel */
    VISUAL = 'visual',
    /** Auditif */
    AUDITORY = 'auditory',
    /** Kinesthésique */
    KINESTHETIC = 'kinesthetic',
    /** Lecture/Écriture */
    READING_WRITING = 'reading_writing',
    /** Multimodal */
    MULTIMODAL = 'multimodal'
}

/**
 * Niveaux de compétence
 * @enum SkillLevel
 */
export enum SkillLevel {
    /** Débutant */
    BEGINNER = 'beginner',
    /** Débutant avancé */
    ADVANCED_BEGINNER = 'advanced_beginner',
    /** Intermédiaire */
    INTERMEDIATE = 'intermediate',
    /** Avancé */
    ADVANCED = 'advanced',
    /** Expert */
    EXPERT = 'expert'
}

/**
 * Niveaux de compétence pour l'évaluation
 * @enum CompetencyLevel
 */
export enum CompetencyLevel {
    /** Novice/Débutant */
    BEGINNER = 'beginner',
    /** Intermédiaire */
    INTERMEDIATE = 'intermediate',
    /** Avancé */
    ADVANCED = 'advanced',
    /** Expert */
    EXPERT = 'expert'
}

/**
 * Types de renforcement
 * @enum ReinforcementType
 */
export enum ReinforcementType {
    /** Positif */
    POSITIVE = 'positive',
    /** Correctif */
    CORRECTIVE = 'corrective',
    /** Immédiat */
    IMMEDIATE = 'immediate',
    /** Différé */
    DELAYED = 'delayed',
    /** Explicite */
    EXPLICIT = 'explicit',
    /** Implicite */
    IMPLICIT = 'implicit'
}

/**
 * Type d'exercice d'apprentissage
 * @enum LearningExerciseType
 */
export enum LearningExerciseType {
    MULTIPLE_CHOICE = 'multiple_choice',
    DRAG_DROP = 'drag_drop',
    FILL_BLANK = 'fill_blank',
    VIDEO_RESPONSE = 'video_response',
    SIGNING_PRACTICE = 'signing_practice',
    TEXT_ENTRY = 'text_entry',
    MATCHING = 'matching',
    ORDERING = 'ordering',
    HOTSPOT = 'hotspot',
    FLASHCARD = 'flashcard',
    QUIZ = 'quiz',
    CONVERSATION = 'conversation',
    TRANSLATION = 'translation',
    INTERACTIVE_STORY = 'interactive_story',
    PRONUNCIATION = 'pronunciation',
    DICTATION = 'dictation',
    CLOZE = 'cloze',
    CROSSWORD = 'crossword',
    WORD_SEARCH = 'word_search',
    SPELLING = 'spelling'
}

/**
 * Niveau d'apprentissage CECRL
 * @enum LearningLevel
 */
export enum LearningLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2'
}

/**
 * Mode d'apprentissage
 * @enum LearningMode
 */
export enum LearningMode {
    GUIDED = 'guided',
    FREE = 'free',
    CHALLENGE = 'challenge',
    ASSESSMENT = 'assessment',
    IMMERSIVE = 'immersive',
    COLLABORATIVE = 'collaborative',
    GAMIFIED = 'gamified',
    ADAPTIVE = 'adaptive',
    SPACED_REPETITION = 'spaced_repetition'
}

/**
 * Difficulté d'apprentissage
 * @enum LearningDifficulty
 */
export enum LearningDifficulty {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert'
}

/**
 * Type générique pour les valeurs de paramètres spécifiques au profil
 * @type SettingValue
 */
export type SettingValue = string | number | boolean | Record<string, unknown>;

/**
 * Représente une récompense attribuée à un niveau
 * @interface RewardItem
 */
export interface RewardItem {
    /** Type de récompense */
    readonly type: string;
    /** Nom de la récompense */
    readonly name: string;
    /** Description de la récompense */
    readonly description: string;
    /** Icône de la récompense (optionnel) */
    readonly icon?: string;
    /** Valeur de la récompense (optionnel) */
    readonly value?: number;
}

/**
 * Structure d'un badge dans le système de gamification
 * @interface Badge
 */
export interface Badge {
    /** Identifiant du badge */
    readonly id: string;
    /** Nom du badge */
    readonly name: string;
    /** Description du badge */
    readonly description: string;
    /** Critères d'obtention */
    readonly criteria: string;
    /** Icône du badge */
    readonly icon: string;
    /** Points gagnés lors de l'obtention */
    readonly pointsReward: number;
}

/**
 * Structure d'un exercice complété dans une session d'apprentissage
 * @interface Exercise
 */
export interface Exercise {
    /** Identifiant de l'exercice */
    readonly id: string;
    /** Identifiant du concept */
    readonly conceptId: string;
    /** Niveau de difficulté */
    readonly difficulty: string;
    /** Date de début */
    readonly startTime: Date;
    /** Date de fin (si terminé) */
    readonly endTime?: Date;
    /** Score obtenu (optionnel) */
    readonly score?: number;
    /** Indique si l'exercice est complété */
    readonly isComplete: boolean;
}