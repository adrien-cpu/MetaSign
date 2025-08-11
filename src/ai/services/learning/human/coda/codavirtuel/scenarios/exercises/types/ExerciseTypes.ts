/**
 * @file src/ai/services/learning/human/coda/codavirtuel/scenarios/exercises/types/ExerciseTypes.ts
 * @description Types pour les exercices d'apprentissage de la LSF
 * Définit les structures des différents types d'exercices et de leurs réponses
 * @module services/learning/codavirtuel/scenarios/exercises/types
 * @version 1.2.0
 * @since 2024
 * @author MetaSign Team
 */

// Import des types depuis les fichiers existants
import { ExerciseType, ExerciseDifficulty } from '../../types/DifficultyTypes';

/**
 * Niveaux du Cadre Européen Commun de Référence pour les Langues
 * Importé depuis le module principal des types
 */
export enum CECRLLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2'
}

/**
 * Catégories d'erreurs et compétences linguistiques en LSF
 */
export enum ErrorCategory {
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    SYNTAX = 'syntax',
    CULTURAL = 'cultural',
    SPATIAL = 'spatial',
    TEMPORAL = 'temporal',
    PROSODY = 'prosody',
    EXPRESSION = 'expression'
}

/**
 * Types de compétences linguistiques
 */
export enum SkillType {
    RECEPTIVE = 'receptive',     // Compréhension
    PRODUCTIVE = 'productive',   // Production
    INTERACTIVE = 'interactive', // Interaction
    MEDIATIVE = 'mediative'      // Médiation culturelle
}

/**
 * Interface de base pour le contenu d'un exercice 
 */
export interface BaseExerciseContent {
    /** Type d'exercice */
    type: string;
    /** Instruction principale de l'exercice */
    instruction?: string;
}

/**
 * Contenu pour exercice à choix multiples
 */
export interface MultipleChoiceContent extends BaseExerciseContent {
    type: 'multiple-choice';
    /** Question posée */
    question: string;
    /** Options disponibles */
    options: string[];
    /** Index de l'option correcte */
    correctIndex: number;
    /** Indices des réponses correctes (pour sélection multiple) */
    correctAnswers?: number[];
    /** Indique s'il s'agit d'une sélection multiple */
    multipleSelection?: boolean;
    /** Instructions */
    instructions?: string;
    /** Liste des questions (pour format avec plusieurs questions) */
    questions?: Array<{
        text: string;
        options: Array<{
            text: string;
            isCorrect: boolean;
        }>;
    }>;
}

/**
 * Contenu pour exercice de glisser-déposer
 */
export interface DragDropContent extends BaseExerciseContent {
    type: 'drag-drop';
    /** Instruction */
    instruction: string;
    /** Éléments à déplacer */
    items: string[];
    /** Ordre correct des éléments */
    correctOrder: number[];
}

/**
 * Contenu pour exercice à trous
 */
export interface FillBlankContent extends BaseExerciseContent {
    type: 'fill-blank';
    /** Texte avec des espaces à remplir */
    text: string;
    /** Éléments à placer dans les espaces */
    blanks: string[];
    /** Options pour chaque espace (facultatif) */
    options: string[][];
    /** Réponses correctes pour chaque espace */
    correctAnswers?: string[];
    /** Indices pour aider l'apprenant */
    hints?: string[];
}

/**
 * Contenu pour exercice de réponse en vidéo
 */
export interface VideoResponseContent extends BaseExerciseContent {
    type: 'video-response';
    /** Prompt pour la réponse vidéo */
    prompt: string;
    /** URL de la vidéo de démonstration (facultatif) */
    demoVideo?: string;
    /** Critères d'évaluation */
    evaluationCriteria: Array<{
        id: string;
        name: string;
        description: string;
        weight: number;
    }>;
    /** Durée minimale (en secondes) */
    minDuration: number;
    /** Durée maximale (en secondes) */
    maxDuration: number;
}

/**
 * Contenu pour exercice de saisie de texte
 */
export interface TextEntryContent extends BaseExerciseContent {
    type: 'text-entry';
    /** Question ou prompt */
    prompt: string;
    /** Exemple de réponse */
    sampleAnswer: string;
    /** Longueur minimale du texte */
    minLength: number;
    /** Longueur maximale du texte */
    maxLength: number;
    /** Réponses acceptables */
    acceptableAnswers?: string[];
    /** Tolérance aux fautes d'orthographe (0-1) */
    spellingTolerance?: number;
}

/**
 * Contenu pour exercice de correction
 */
export interface CorrectionContent extends BaseExerciseContent {
    type: 'correction';
    /** Texte ou description contenant des erreurs */
    contentWithErrors: string;
    /** Erreurs présentes */
    errors: Array<{
        index: number;
        errorText: string;
        correction: string;
        category: ErrorCategory;
    }>;
}

/**
 * Contenu pour exercice d'association
 */
export interface MatchingContent extends BaseExerciseContent {
    type: 'matching';
    /** Éléments de la colonne gauche */
    leftItems: string[];
    /** Éléments de la colonne droite */
    rightItems: string[];
    /** Associations correctes (indices) */
    correctMatches: Array<[number, number]>;
}

/**
 * Contenu pour exercice de mise en ordre
 */
export interface OrderingContent extends BaseExerciseContent {
    type: 'ordering';
    /** Éléments à ordonner */
    items: string[];
    /** Ordre correct des éléments */
    correctOrder: number[];
}

/**
 * Union de tous les types de contenu d'exercice
 */
export type ExerciseContent =
    | MultipleChoiceContent
    | DragDropContent
    | FillBlankContent
    | VideoResponseContent
    | TextEntryContent
    | CorrectionContent
    | MatchingContent
    | OrderingContent;

/**
 * Union type des différents formats de réponses simplifié
 */
export type ExerciseResponse =
    | { selectedIndex?: number }                               // Multiple Choice
    | { selectedAnswer?: number }                              // Multiple Choice simple
    | { correctAnswer?: number }                               // Multiple Choice (réponse attendue)
    | { selectedOptions?: number[] }                           // Multiple Choice (multi-sélection)
    | { order?: number[] }                                     // Drag & Drop ou Ordering
    | { filledBlanks?: string[] }                              // Fill in the Blank
    | { text?: string; keywords?: string[] }                   // Text Entry
    | { videoUrl?: string; criteriaScores?: Array<{ id: string; score: number }> } // Video Response
    | { corrections?: Array<{ index: number; correctedText: string }> } // Correction
    | { matches?: Array<[number, number]> }                    // Matching
    | Record<string, unknown>;                                 // Type générique pour compatibilité

/**
 * Base pour la réponse d'un apprenant à un exercice
 */
export interface BaseExerciseResponse {
    /** Type de l'exercice */
    exerciseType: ExerciseType;
    /** Temps passé sur l'exercice (en secondes) */
    timeSpent?: number;
    /** Nombre de tentatives */
    attempts?: number;
    /** Indique si l'exercice a été complété */
    completed?: boolean;
}

/**
 * Réponse à un exercice à choix multiples
 */
export interface MultipleChoiceResponse extends BaseExerciseResponse {
    exerciseType: 'multiple-choice';
    /** Index de l'option sélectionnée */
    selectedIndex?: number;
    /** Indices des options sélectionnées (pour multi-sélection) */
    selectedOptions?: number[];
}

/**
 * Réponse à un exercice de glisser-déposer
 */
export interface DragDropResponse extends BaseExerciseResponse {
    exerciseType: 'drag-drop';
    /** Ordre final des éléments */
    order: number[];
}

/**
 * Réponse à un exercice à trous
 */
export interface FillBlankResponse extends BaseExerciseResponse {
    exerciseType: 'fill-blank';
    /** Réponses fournies pour chaque espace */
    filledBlanks: string[];
}

/**
 * Réponse à un exercice de réponse en vidéo
 */
export interface VideoResponseResponse extends BaseExerciseResponse {
    exerciseType: 'video-response';
    /** URL de la vidéo enregistrée */
    videoUrl?: string;
    /** Scores pour les critères d'évaluation */
    criteriaScores?: Array<{ id: string; score: number }>;
    /** Éventuelles métadonnées associées */
    metadata?: Record<string, unknown>;
}

/**
 * Réponse à un exercice de saisie de texte
 */
export interface TextEntryResponse extends BaseExerciseResponse {
    exerciseType: 'text-entry';
    /** Texte saisi par l'apprenant */
    text: string;
    /** Mots-clés identifiés dans la réponse */
    keywords?: string[];
}

/**
 * Réponse à un exercice de correction
 */
export interface CorrectionResponse extends BaseExerciseResponse {
    exerciseType: 'correction';
    /** Corrections proposées par l'apprenant */
    corrections: Array<{
        index: number;
        originalText: string;
        correctedText: string;
    }>;
}

/**
 * Réponse à un exercice d'association
 */
export interface MatchingResponse extends BaseExerciseResponse {
    exerciseType: 'matching';
    /** Associations faites par l'apprenant */
    matches: Array<[number, number]>;
}

/**
 * Réponse à un exercice de mise en ordre
 */
export interface OrderingResponse extends BaseExerciseResponse {
    exerciseType: 'ordering';
    /** Ordre proposé par l'apprenant */
    order: number[];
}

/**
 * Union de tous les types de réponse détaillés à un exercice
 */
export type DetailedExerciseResponse =
    | MultipleChoiceResponse
    | DragDropResponse
    | FillBlankResponse
    | VideoResponseResponse
    | TextEntryResponse
    | CorrectionResponse
    | MatchingResponse
    | OrderingResponse;

/**
 * Définition complète d'un exercice
 */
export interface Exercise {
    /** Identifiant unique de l'exercice */
    id: string;
    /** Titre de l'exercice */
    title: string;
    /** Instructions générales */
    instructions: string;
    /** Type d'exercice */
    type: ExerciseType;
    /** Contenu spécifique au type d'exercice */
    content: ExerciseContent;
    /** Niveau de difficulté */
    difficulty: ExerciseDifficulty;
    /** Réponse attendue */
    expectedResponse: ExerciseResponse;
    /** Indices pour aider l'apprenant */
    hints: string[];
    /** Limite de temps (en secondes) */
    timeLimit: number;
    /** Compétences visées par l'exercice */
    skillsFocus: ErrorCategory[] | Partial<Record<SkillType | ErrorCategory, number>>;
    /** Texte de feedback en cas de réussite */
    successFeedback?: string;
    /** Texte de feedback en cas d'échec */
    failureFeedback?: string;
    /** Niveau CECRL cible */
    targetLevel?: CECRLLevel;
}

/**
 * Résultat d'évaluation d'un exercice
 */
export interface ExerciseEvaluation {
    /** Identifiant de l'exercice */
    exerciseId: string;
    /** Score obtenu (0-1) */
    score: number;
    /** Temps passé (en secondes) */
    timeSpent: number;
    /** Retour détaillé */
    feedback: string;
    /** L'exercice est-il réussi? */
    passed?: boolean;
    /** Erreurs identifiées */
    errors?: Array<{
        category: ErrorCategory;
        description: string;
    }>;
    /** Impact sur les compétences */
    skillsProgress: Partial<Record<ErrorCategory, number>>;
    /** Recommandations pour la suite */
    recommendations?: string[];
    /** Date de complétion */
    completedAt: Date;
}