/**
 * @file: src/ai/types/index.ts
 * 
 * Fichier central d'exportation des types pour l'application LSF.
 * Centralise tous les types et interfaces utilisés dans l'application.
 */

// Réexporter tous les types géométriques
export * from './geometry';

// Réexporter les types du système de cache
export * from './cache';

// Réexporter les types du système de monitoring
export * from './monitoring';

// Types de base partagés entre les composants

/**
 * Niveau de difficulté
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Niveau de priorité
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * Type de modalité
 */
export type ModalityType =
    | 'text'
    | 'video'
    | 'audio'
    | 'image'
    | 'mixed';

/**
 * Catégorie d'apprentissage
 */
export type LearningCategory = 'Débutant' | 'Intermédiaire' | 'Avancé';

/**
 * Statut d'apprentissage
 */
export type ModuleStatus = 'locked' | 'in-progress' | 'completed';

/**
 * Type de requête
 */
export enum RequestType {
    // Requêtes IA Core
    CONTEXT_ANALYSIS = 'context_analysis',
    EMOTION_ANALYSIS = 'emotion_analysis',
    SYSTEM_STATUS = 'system_status',
    PERFORMANCE_METRICS = 'performance_metrics',
    CACHE_MANAGEMENT = 'cache_management',

    // Requêtes linguistiques
    LSF_TRANSLATION = 'lsf_translation',
    TEXT_TO_LSF = 'text_to_lsf',
    LSF_TO_TEXT = 'lsf_to_text',
    CULTURAL_VALIDATION = 'cultural_validation',

    // Requêtes d'expression
    GENERATE_EXPRESSION = 'generate_expression',
    ANALYZE_EXPRESSION = 'analyze_expression',
    OPTIMIZE_EXPRESSION = 'optimize_expression',
    GESTURE_GENERATION = 'gesture_generation',
    FACIAL_SYNC = 'facial_sync',

    // Requêtes multimodales avancées
    AUDIO_ALIGNMENT = 'audio_alignment',
    PROSODY_ANALYSIS = 'prosody_analysis',

    // Requêtes d'apprentissage
    LEARNING_MODULE = 'learning_module',
    LEARNING_PROGRESS = 'learning_progress',
    BADGE_ACHIEVEMENT = 'badge_achievement',
    LEARNING_RECOMMENDATION = 'learning_recommendation'
}

/**
 * Type de composant
 */
export enum ComponentType {
    IACore = 'iacore',
    Expressions = 'expressions',
    Linguistes = 'linguistes',
    VariantesDiatopiques = 'variantes_diatopiques',
    ControleEthique = 'controle_ethique',
    Orchestrator = 'orchestrator',
    Monitoring = 'monitoring',
    Learning = 'learning'
}

/**
 * Stratégies de cache
 */
export enum CacheStrategy {
    Standard = 'standard',
    NoCache = 'no-cache',
    LongTerm = 'long-term',
    ShortTerm = 'short-term'
}

/**
 * Statut d'un composant système
 */
export enum SystemComponentStatus {
    INITIALIZING = 'initializing',
    READY = 'ready',
    PROCESSING = 'processing',
    ERROR = 'error',
    SHUTDOWN = 'shutdown'
}

/**
 * Priorité de tâche
 */
export enum TaskPriority {
    Critical = 0,
    High = 1,
    Medium = 2,
    Low = 3
}

/**
 * Interface de base pour les composants système
 */
export interface ISystemComponent {
    /** Identifiant unique du composant */
    readonly id: string;
    /** Type du composant */
    readonly type: ComponentType | string;
    /** Version du composant */
    readonly version: string;
    /** Initialise le composant */
    initialize(config?: unknown): Promise<void>;
    /** Traite une requête */
    process<TInput = unknown, TOutput = unknown>(data: TInput): Promise<TOutput>;
    /** Récupère l'état du composant */
    getStatus(): SystemComponentStatus;
    /** Arrête proprement le composant */
    shutdown(): Promise<void>;
}

/**
 * Contexte de requête
 */
export interface RequestContext {
    /** Identifiant de la requête */
    id: string;
    /** Type de requête */
    type: RequestType;
    /** Données de la requête */
    data: unknown;
    /** Timestamp de réception */
    receivedAt: number;
    /** Timestamp de début de traitement */
    processingStartedAt: number;
    /** Priorité de la requête */
    priority: TaskPriority;
    /** État de la requête */
    state: 'pending' | 'processing' | 'completed' | 'failed';
    /** Métadonnées */
    metadata: Record<string, unknown>;

    // Propriétés spécifiques
    requiresTranslation?: boolean;
    requiresExpressions?: boolean;
    locale?: string;
    text?: string;
    userId?: string;
}

/**
 * Résultat de traitement
 */
export interface ProcessingResult<T = unknown> {
    /** Indicateur de succès */
    success: boolean;
    /** Données de résultat */
    data?: T;
    /** Message d'erreur */
    error?: string;
    /** Métriques d'exécution */
    metrics?: {
        /** Temps d'exécution en ms */
        executionTime: number;
        /** Composants utilisés */
        componentsUsed?: string[];
    };
}

/**
 * Demande de traitement
 */
export interface ProcessRequest {
    /** Identifiant de la requête */
    id: string;
    /** Type de requête */
    type: RequestType;
    /** Données de la requête */
    data: unknown;
    /** Métadonnées optionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Résultat de traitement
 */
export interface ProcessResult<T = unknown> {
    /** Identifiant de la requête */
    requestId: string;
    /** Indicateur de succès */
    success: boolean;
    /** Données de résultat */
    data?: T;
    /** Message d'erreur */
    error?: string;
    /** Temps de traitement en ms */
    processingTime: number;
}

/**
 * Interfaces pour le système d'apprentissage
 */

/**
 * Badge dans le système de gamification
 */
export interface Badge {
    /** Identifiant unique */
    id: string;
    /** Titre du badge */
    title: string;
    /** Description du badge */
    description: string;
    /** URL de l'image */
    imageUrl: string;
    /** Critères d'obtention */
    criteria: string;
    /** Difficulté */
    difficulty: Difficulty;
    /** Catégorie */
    category: string;
    /** Date d'obtention (si gagné) */
    earnedDate?: Date;
}

/**
 * Module d'apprentissage
 */
export interface LearningModule {
    /** Identifiant unique */
    id: string;
    /** Titre du module */
    title: string;
    /** Description du module */
    description: string;
    /** Catégorie du module */
    category: LearningCategory;
    /** Niveau de difficulté (1-5) */
    difficulty: number;
    /** Prérequis (IDs d'autres modules) */
    prerequisites: string[];
    /** Statut d'apprentissage */
    status: ModuleStatus;
    /** Progression (0-100) */
    progress: number;
    /** Temps estimé (minutes) */
    estimatedTime: number;
    /** Compétences développées */
    skills: string[];
}

/**
 * Progression d'apprentissage utilisateur
 */
export interface LearningProgress {
    /** Identifiant utilisateur */
    userId: string;
    /** Modules complétés */
    completedModules: string[];
    /** Module actuel */
    currentModule?: string;
    /** Progression par module */
    moduleProgress: Record<string, number>;
    /** Badges gagnés */
    earnedBadges: string[];
    /** Expérience totale */
    totalExperience: number;
    /** Niveau actuel */
    level: number;
    /** Date de dernière activité */
    lastActivityDate: Date;
    /** Temps total passé (minutes) */
    timeSpent: number;
}

/**
 * Préférences d'apprentissage utilisateur
 */
export interface UserPreferences {
    /** Identifiant utilisateur */
    userId: string;
    /** Langue des signes préférée */
    preferredSignLanguage: string;
    /** Objectifs d'apprentissage */
    learningGoals: string[];
    /** Temps d'étude quotidien (minutes) */
    dailyStudyTime: number;
    /** Moment préféré ('Matinée', 'Après-midi', 'Soirée') */
    preferredStudyTime: string;
    /** Préférences de notification */
    notificationPreferences: {
        /** Activer les rappels */
        enableReminders: boolean;
        /** Activer les mises à jour de progression */
        enableProgressUpdates: boolean;
        /** Heure de rappel (format HH:MM) */
        reminderTime?: string;
    };
}