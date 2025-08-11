/**
 * Types et interfaces pour le générateur d'exercices - Version enrichie et corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/types/ExerciseGeneratorTypes.ts
 * @module ai/services/learning/human/coda/codavirtuel/exercises/types
 * @description Définit tous les types et interfaces utilisés par le système de génération d'exercices
 * Compatible avec exactOptionalPropertyTypes: true et centralisé pour éviter la duplication
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

/**
 * Type union pour les niveaux CECRL valides
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Types supportés pour les exercices
 */
export type SupportedExerciseType =
    | 'MultipleChoice'
    | 'DragDrop'
    | 'FillBlank'
    | 'TextEntry'
    | 'VideoResponse'
    | 'SigningPractice';

/**
 * Type pour les paramètres de génération d'exercices
 * Respecte exactOptionalPropertyTypes: true avec types stricts
 */
export interface ExerciseGenerationParams {
    /** Type d'exercice à générer */
    readonly type: SupportedExerciseType;
    /** Niveau CECRL (A1, A2, B1, B2, C1, C2) */
    readonly level: CECRLLevel;
    /** Difficulté (0-1) */
    readonly difficulty: number;
    /** Domaines de focus (optionnel) */
    readonly focusAreas?: readonly string[];
    /** Identifiant de l'utilisateur (optionnel) */
    readonly userId?: string;
    /** Paramètres spécifiques au type d'exercice (optionnel) */
    readonly typeSpecificParams?: Readonly<Record<string, unknown>>;
}

/**
 * Type pour un exercice générique
 */
export interface Exercise<T = unknown> {
    /** Identifiant unique de l'exercice */
    readonly id: string;
    /** Type d'exercice */
    readonly type: SupportedExerciseType;
    /** Contenu de l'exercice */
    readonly content: T;
    /** Métadonnées de l'exercice */
    readonly metadata?: {
        readonly createdAt: Date;
        readonly level: CECRLLevel;
        readonly difficulty: number;
        readonly estimatedDuration: number;
    };
}

/**
 * Type pour un résultat d'évaluation générique
 */
export interface EvaluationResult {
    /** Indique si la réponse est correcte */
    readonly correct: boolean;
    /** Score obtenu (0-1) */
    readonly score: number;
    /** Explication (optionnelle) */
    readonly explanation?: string;
    /** Détails supplémentaires spécifiques au type d'exercice (optionnel) */
    readonly details?: Readonly<Record<string, unknown>>;
    /** Feedback personnalisé pour l'amélioration */
    readonly feedback?: {
        readonly strengths: readonly string[];
        readonly areasForImprovement: readonly string[];
        readonly nextSteps: readonly string[];
    };
}

/**
 * Interface pour tous les générateurs d'exercices
 * Utilise des génériques pour une meilleure sécurité de type
 */
export interface ExerciseGeneratorInterface<TExercise = unknown, TResponse = unknown> {
    /**
     * Génère un exercice selon les paramètres fournis
     * @param params Paramètres de génération
     * @returns Promesse d'exercice généré
     */
    generate(params: ExerciseGenerationParams): Promise<TExercise>;

    /**
     * Évalue la réponse à un exercice
     * @param exercise Exercice à évaluer
     * @param response Réponse de l'utilisateur
     * @returns Résultat de l'évaluation
     */
    evaluate(exercise: TExercise, response: TResponse): EvaluationResult;
}

/**
 * Interface pour les générateurs existants (adaptateur)
 */
export interface LegacyGeneratorInterface {
    generate(params: unknown): Promise<unknown>;
    evaluate(exercise: unknown, response: unknown): unknown;
}

/**
 * Statistiques du service de génération d'exercices
 */
export interface ExerciseServiceStats {
    readonly totalExercisesGenerated: number;
    readonly cachedExercises: number;
    readonly availableGenerators: number;
    readonly supportedTypes: readonly SupportedExerciseType[];
}

/**
 * Configuration des durées de base par type d'exercice
 * CORRECTION: Utilisation d'un type mappé au lieu d'une interface
 */
export type ExerciseDurationConfig = {
    readonly [K in SupportedExerciseType]: number;
};

/**
 * Options de configuration pour le service de génération
 */
export interface ExerciseServiceConfig {
    readonly cacheMaxAge?: number;
    readonly maxCacheSize?: number;
    readonly enableAutoCleanup?: boolean;
    readonly cleanupInterval?: number;
}

/**
 * Interface pour la gestion du cache d'exercices
 */
export interface ExerciseCache {
    readonly set: (key: string, exercise: Exercise) => void;
    readonly get: (key: string) => Exercise | undefined;
    readonly delete: (key: string) => boolean;
    readonly clear: () => void;
    readonly size: number;
    readonly cleanup: (maxAge: number) => number;
}

/**
 * Statistiques du cache d'exercices
 */
export interface CacheStats {
    readonly size: number;
    readonly hitRate: number;
    readonly totalHits: number;
    readonly totalMisses: number;
    readonly oldestEntry?: Date;
}

/**
 * Interface enrichie pour la gestion du cache avec statistiques
 */
export interface EnhancedExerciseCache extends ExerciseCache {
    readonly getStats: () => CacheStats;
    readonly destroy: () => void;
}

/**
 * Type pour les adaptateurs de génération
 */
export interface GeneratorAdapterConfig {
    readonly type: SupportedExerciseType;
    readonly generator: LegacyGeneratorInterface;
    readonly paramAdapter?: (params: ExerciseGenerationParams) => unknown;
    readonly resultAdapter?: (result: unknown) => EvaluationResult;
}

/**
 * Interface pour les résultats de validation
 */
export interface ValidationResult {
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly severity: 'low' | 'medium' | 'high';
    readonly validationTime: number;
}

/**
 * Interface pour les validateurs personnalisés
 */
export interface CustomValidator {
    readonly name: string;
    readonly validator: (params: ExerciseGenerationParams) => ValidationResult;
}

/**
 * Options de configuration pour la validation
 */
export interface ValidationOptions {
    readonly strictMode?: boolean;
    readonly enablePerformanceOptimizations?: boolean;
    readonly customValidators?: readonly CustomValidator[];
}

/**
 * Configuration complète du système d'exercices
 */
export interface CompleteExerciseConfig {
    readonly serviceConfig?: ExerciseServiceConfig;
    readonly validationOptions?: ValidationOptions;
    readonly environment?: 'development' | 'production';
}

/**
 * Constantes pour la validation et la configuration
 */
export const EXERCISE_CONSTANTS = {
    /** Niveaux CECRL valides */
    VALID_CECRL_LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const,

    /** Types d'exercices supportés */
    SUPPORTED_EXERCISE_TYPES: [
        'MultipleChoice',
        'DragDrop',
        'FillBlank',
        'TextEntry',
        'VideoResponse',
        'SigningPractice'
    ] as const,

    /** Durées de base par type d'exercice (en minutes) */
    BASE_DURATIONS: {
        MultipleChoice: 3,
        DragDrop: 5,
        FillBlank: 4,
        TextEntry: 6,
        VideoResponse: 8,
        SigningPractice: 10
    } as const satisfies Record<SupportedExerciseType, number>,

    /** Âge maximum du cache par défaut (1 heure en millisecondes) */
    DEFAULT_CACHE_MAX_AGE: 3600000,

    /** Multiplicateur de difficulté maximum (50% d'augmentation) */
    MAX_DIFFICULTY_MULTIPLIER: 0.5,

    /** Taille maximale du cache par défaut */
    DEFAULT_MAX_CACHE_SIZE: 1000,

    /** Intervalle de nettoyage automatique du cache (15 minutes) */
    DEFAULT_CLEANUP_INTERVAL: 900000
} as const;

/**
 * Erreur personnalisée pour les fonctionnalités non implémentées
 */
export class NotImplementedError extends Error {
    public readonly context?: Readonly<Record<string, unknown>>;

    constructor(feature: string, context?: Readonly<Record<string, unknown>>) {
        super(`${feature} is not implemented yet`);
        this.name = 'NotImplementedError';
        this.context = context;

        if (context) {
            this.message += `. Context: ${JSON.stringify(context)}`;
        }
    }
}

/**
 * Erreur personnalisée pour les validations d'exercices
 */
export class ExerciseValidationError extends Error {
    constructor(
        message: string,
        public readonly validationErrors: readonly string[],
        public readonly exerciseId?: string
    ) {
        super(message);
        this.name = 'ExerciseValidationError';
    }
}

/**
 * Erreur personnalisée pour les problèmes de génération
 */
export class ExerciseGenerationError extends Error {
    constructor(
        message: string,
        public readonly exerciseType: SupportedExerciseType,
        public readonly params: ExerciseGenerationParams
    ) {
        super(message);
        this.name = 'ExerciseGenerationError';
    }
}

/**
 * Fonctions utilitaires pour la validation des types
 */
export const ExerciseTypeUtils = {
    /**
     * Valide qu'un niveau CECRL est valide
     * @param level Niveau à valider
     * @returns True si le niveau est valide
     */
    isValidCECRLLevel: (level: string): level is CECRLLevel => {
        return EXERCISE_CONSTANTS.VALID_CECRL_LEVELS.includes(level as CECRLLevel);
    },

    /**
     * Valide qu'un type d'exercice est supporté
     * @param type Type à valider
     * @returns True si le type est supporté
     */
    isSupportedExerciseType: (type: string): type is SupportedExerciseType => {
        return EXERCISE_CONSTANTS.SUPPORTED_EXERCISE_TYPES.includes(type as SupportedExerciseType);
    },

    /**
     * Vérifie si un contenu d'exercice a un ID valide
     * @param content Contenu à vérifier
     * @returns True si l'ID est valide
     */
    hasValidId: (content: unknown): content is { id: string } => {
        return typeof content === 'object' &&
            content !== null &&
            'id' in content &&
            typeof (content as { id: unknown }).id === 'string' &&
            (content as { id: string }).id.length > 0;
    },

    /**
     * Vérifie si un résultat d'évaluation est valide
     * @param result Résultat à vérifier
     * @returns True si le résultat est valide
     */
    isValidEvaluationResult: (result: unknown): result is Record<string, unknown> => {
        return typeof result === 'object' && result !== null;
    },

    /**
     * Normalise un score pour s'assurer qu'il est entre 0 et 1
     * @param score Score à normaliser
     * @returns Score normalisé
     */
    normalizeScore: (score: unknown): number => {
        if (typeof score === 'number' && !isNaN(score)) {
            return Math.max(0, Math.min(1, score));
        }
        return 0;
    },

    /**
     * Valide les paramètres de génération d'exercice
     * @param params Paramètres à valider
     * @returns True si les paramètres sont valides
     */
    validateGenerationParams: (params: ExerciseGenerationParams): boolean => {
        return ExerciseTypeUtils.isValidCECRLLevel(params.level) &&
            ExerciseTypeUtils.isSupportedExerciseType(params.type) &&
            typeof params.difficulty === 'number' &&
            params.difficulty >= 0 &&
            params.difficulty <= 1;
    },

    /**
     * Estime la durée d'un exercice en fonction de son type et de sa difficulté
     * @param type Type d'exercice
     * @param difficulty Niveau de difficulté (0-1)
     * @returns Durée estimée en minutes
     */
    estimateDuration: (type: SupportedExerciseType, difficulty: number): number => {
        const baseDuration = EXERCISE_CONSTANTS.BASE_DURATIONS[type];
        const difficultyMultiplier = 1 + (difficulty * EXERCISE_CONSTANTS.MAX_DIFFICULTY_MULTIPLIER);
        return Math.round(baseDuration * difficultyMultiplier);
    },

    /**
     * Génère un ID unique pour un exercice
     * @param type Type d'exercice
     * @param level Niveau CECRL
     * @returns ID unique
     */
    generateExerciseId: (type: SupportedExerciseType, level: CECRLLevel): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${type}_${level}_${timestamp}_${random}`;
    },

    /**
     * Crée des métadonnées par défaut pour un exercice
     * @param params Paramètres de génération
     * @returns Métadonnées d'exercice
     */
    createDefaultMetadata: (params: ExerciseGenerationParams): Exercise['metadata'] => {
        return {
            createdAt: new Date(),
            level: params.level,
            difficulty: params.difficulty,
            estimatedDuration: ExerciseTypeUtils.estimateDuration(params.type, params.difficulty)
        };
    }
} as const;