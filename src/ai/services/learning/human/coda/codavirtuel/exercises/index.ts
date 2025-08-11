/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/index.ts
 * @description Point d'entrée centralisé pour le module d'exercices - Version corrigée
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// ===== TYPES ET INTERFACES =====
export type {
    // Types de base
    Exercise,
    ExerciseGenerationParams,
    EvaluationResult,
    SupportedExerciseType,
    CECRLLevel,

    // Interfaces de service
    ExerciseGeneratorInterface,
    ExerciseServiceStats,
    ExerciseServiceConfig,

    // Types de validation
    ValidationOptions,
    ValidationResult,
    CustomValidator,

    // Types d'adaptation
    LegacyGeneratorInterface,
    GeneratorAdapterConfig,

    // Types de cache
    CacheStats,
    ExerciseCache,
    EnhancedExerciseCache,

    // Configuration complète
    CompleteExerciseConfig,

    // Types de durée
    ExerciseDurationConfig
} from './types/ExerciseGeneratorTypes';

// ===== CLASSES D'ERREUR =====
export {
    ExerciseGenerationError,
    ExerciseValidationError,
    NotImplementedError
} from './types/ExerciseGeneratorTypes';

// ===== UTILITAIRES ET CONSTANTES =====
export {
    ExerciseTypeUtils,
    EXERCISE_CONSTANTS
} from './types/ExerciseGeneratorTypes';

// ===== SERVICE PRINCIPAL =====
export { ExerciseGeneratorService } from './ExerciseGeneratorService';

// ===== GÉNÉRATEURS =====
export { MultipleChoiceGenerator } from './generators/MultipleChoiceGenerator';
export { BaseExerciseGenerator } from './generators/BaseExerciseGenerator';
export { DragDropGenerator } from './generators/DragDropGenerator';
export { FillBlankGenerator } from './generators/FillBlankGenerator';
export { TextEntryGenerator } from './generators/TextEntryGenerator';
export { VideoResponseGenerator } from './generators/VideoResponseGenerator';
export { SigningPracticeGenerator } from './generators/SigningPracticeGenerator';

// ===== ADAPTATEURS =====
export {
    GeneratorAdapter,
    GeneratorAdapterFactory
} from './adapters/GeneratorAdapter';

// ===== CACHE =====
export { ExerciseCacheManager } from './cache/ExerciseCacheManager';

// ===== VALIDATION =====
export { ExerciseValidator } from './validation/ExerciseValidator';

// ===== SERVICES AUXILIAIRES =====
export { ConceptsDataService } from './services/ConceptsDataService';
export { ExerciseContentGenerator } from './content/ExerciseContentGenerator';
export { ExerciseHintsService } from './hints/ExerciseHintsService';

// ===== FACTORY =====
export { ExerciseGeneratorFactory } from './factories/ExerciseGeneratorFactory';

// ===== UTILITAIRES =====
export { ExerciseGeneratorUtils } from './utils/ExerciseGeneratorUtils';

// ===== IMPORTS POUR LES FACTORY FUNCTIONS =====
import { ExerciseGeneratorService } from './ExerciseGeneratorService';
import { ExerciseValidator } from './validation/ExerciseValidator';
import { ExerciseCacheManager } from './cache/ExerciseCacheManager';
import type {
    ExerciseServiceConfig,
    ValidationOptions,
    ExerciseGenerationParams,
    SupportedExerciseType,
    CECRLLevel,
    Exercise,
    GeneratorAdapterConfig
} from './types/ExerciseGeneratorTypes';
import { ExerciseTypeUtils } from './types/ExerciseGeneratorTypes';

// ===== FACTORY FUNCTIONS =====

/**
 * Crée une instance simple du service de génération d'exercices
 * @returns Instance du service avec configuration par défaut
 */
export function createExerciseService(): ExerciseGeneratorService;

/**
 * Crée une instance configurée du service via le système d'initialisation
 * @param config Configuration du service
 * @returns Promise du service configuré dans un système complet
 */
export function createExerciseService(config: ExerciseServiceConfig): Promise<ExerciseGeneratorService>;

/**
 * Implémentation avec surcharge fonctionnelle
 */
export function createExerciseService(config?: ExerciseServiceConfig): ExerciseGeneratorService | Promise<ExerciseGeneratorService> {
    if (!config) {
        // Cas simple : retour direct du service singleton
        return ExerciseGeneratorService.getInstance();
    }

    // Cas configuré : utilisation du système d'initialisation existant
    return initializeExerciseSystem({ serviceConfig: config })
        .then(system => system.service);
}

/**
 * Crée un validateur d'exercices avec options par défaut
 * @returns Instance du validateur
 */
export function createExerciseValidator(): ExerciseValidator;

/**
 * Crée un validateur d'exercices avec options personnalisées
 * @param options Options de validation
 * @returns Instance du validateur configuré
 */
export function createExerciseValidator(options: ValidationOptions): ExerciseValidator;

/**
 * Implémentation avec surcharge fonctionnelle
 */
export function createExerciseValidator(options?: ValidationOptions): ExerciseValidator {
    if (!options) {
        // Cas simple : validateur avec options par défaut
        return new ExerciseValidator();
    }

    // Cas configuré : validateur avec options personnalisées
    return new ExerciseValidator(options);
}

/**
 * Crée un gestionnaire de cache avec configuration par défaut
 * @returns Instance du gestionnaire de cache
 */
export function createExerciseCache(): ExerciseCacheManager;

/**
 * Crée un gestionnaire de cache avec configuration personnalisée
 * @param config Configuration du cache
 * @returns Instance du gestionnaire de cache configuré
 */
export function createExerciseCache(config: ExerciseServiceConfig): ExerciseCacheManager;

/**
 * Implémentation avec surcharge fonctionnelle
 */
export function createExerciseCache(config?: ExerciseServiceConfig): ExerciseCacheManager {
    if (!config) {
        // Cas simple : cache avec configuration par défaut
        return new ExerciseCacheManager();
    }

    // Cas configuré : cache avec configuration personnalisée
    return new ExerciseCacheManager(config);
}

/**
 * Crée une instance du service pour l'environnement de développement
 * @returns Service configuré pour le développement
 */
export function createExerciseServiceForDev(): ExerciseGeneratorService {
    // Utilise le service singleton avec la configuration de développement prédéfinie
    return ExerciseGeneratorService.getInstance();
}

/**
 * Crée une instance du service pour les tests
 * @returns Service configuré pour les tests
 */
export function createExerciseServiceForTest(): ExerciseGeneratorService {
    // Utilise le service singleton - la configuration de test sera appliquée via d'autres moyens
    return ExerciseGeneratorService.getInstance();
}

/**
 * Initialise complètement le système d'exercices
 * @param config Configuration système
 * @returns Objet contenant tous les services initialisés
 */
export async function initializeExerciseSystem(config: {
    readonly serviceConfig?: ExerciseServiceConfig;
    readonly validationOptions?: ValidationOptions;
    readonly environment?: 'development' | 'production';
} = {}): Promise<{
    readonly service: ExerciseGeneratorService;
    readonly validator: ExerciseValidator;
    readonly cache: ExerciseCacheManager;
}> {
    const { serviceConfig, validationOptions, environment = 'production' } = config;

    // Créer les services avec les bonnes surcharges
    const service = environment === 'development'
        ? createExerciseServiceForDev()
        : serviceConfig
            ? await createExerciseService(serviceConfig)
            : createExerciseService();

    const validator = validationOptions
        ? createExerciseValidator(validationOptions)
        : createExerciseValidator();

    const cache = serviceConfig
        ? createExerciseCache(serviceConfig)
        : createExerciseCache();

    // Initialiser le service principal s'il n'est pas déjà initialisé
    await service.initialize();

    return {
        service,
        validator,
        cache
    };
}

// ===== UTILITAIRES RAPIDES =====

/**
 * Validation rapide des paramètres d'exercice
 * @param params Paramètres à valider
 * @returns True si les paramètres sont valides
 */
export function quickValidateParams(params: ExerciseGenerationParams): boolean {
    return ExerciseTypeUtils.validateGenerationParams(params);
}

/**
 * Estimation rapide de la durée d'un exercice
 * @param type Type d'exercice
 * @param difficulty Difficulté (0-1)
 * @returns Durée estimée en secondes
 */
export function estimateExerciseDuration(type: SupportedExerciseType, difficulty: number): number {
    return ExerciseTypeUtils.estimateDuration(type, difficulty);
}

/**
 * Génération d'ID unique pour un exercice
 * @param type Type d'exercice
 * @param level Niveau CECRL
 * @returns ID unique
 */
export function generateUniqueExerciseId(type: SupportedExerciseType, level: CECRLLevel): string {
    return ExerciseTypeUtils.generateExerciseId(type, level);
}

// ===== CONFIGURATIONS PRÉDÉFINIES =====

/**
 * Configuration par défaut pour la production
 */
export const PROD_CONFIG: ExerciseServiceConfig = {
    maxCacheSize: 1000,
    cacheMaxAge: 3600000, // 1 heure
    enableAutoCleanup: true,
    cleanupInterval: 300000 // 5 minutes
};

/**
 * Configuration par défaut pour le développement
 */
export const DEV_CONFIG: ExerciseServiceConfig = {
    maxCacheSize: 100,
    cacheMaxAge: 300000, // 5 minutes
    enableAutoCleanup: true,
    cleanupInterval: 60000 // 1 minute
};

/**
 * Options de validation strictes
 */
export const STRICT_VALIDATION_OPTIONS: ValidationOptions = {
    strictMode: true,
    enablePerformanceOptimizations: true,
    customValidators: []
};

/**
 * Paramètres d'exemple pour différents types d'exercices
 */
export const EXAMPLE_EXERCISE_PARAMS = {
    beginner: {
        type: 'MultipleChoice' as const,
        level: 'A1' as const,
        difficulty: 0.3
    },
    intermediate: {
        type: 'DragDrop' as const,
        level: 'B1' as const,
        difficulty: 0.6
    },
    advanced: {
        type: 'VideoResponse' as const,
        level: 'C1' as const,
        difficulty: 0.9
    }
} as const;

// ===== TYPES AUXILIAIRES POUR LA RÉTROCOMPATIBILITÉ =====

/**
 * Alias pour ExerciseGenerationParams (rétrocompatibilité)
 */
export type ExerciseParams = ExerciseGenerationParams;

/**
 * Type pour les métadonnées d'exercice (extrait de Exercise)
 */
export type ExerciseMetadata = NonNullable<Exercise['metadata']>;

/**
 * Type générique pour le contenu d'exercice
 */
export type ExerciseContent<T = unknown> = T;

/**
 * Types spécifiques de contenu pour chaque type d'exercice
 */
export interface MultipleChoiceContent {
    readonly question: string;
    readonly choices: readonly string[];
    readonly correctAnswerIndex: number;
    readonly explanation?: string;
}

export interface DragDropContent {
    readonly instructions: string;
    readonly dragItems: readonly {
        readonly id: string;
        readonly content: string;
    }[];
    readonly dropZones: readonly {
        readonly id: string;
        readonly label: string;
        readonly acceptedItems: readonly string[];
    }[];
}

export interface FillBlankContent {
    readonly text: string;
    readonly blanks: readonly {
        readonly id: string;
        readonly correctAnswers: readonly string[];
        readonly caseSensitive?: boolean;
    }[];
}

export interface TextEntryContent {
    readonly prompt: string;
    readonly maxLength?: number;
    readonly expectedPatterns?: readonly string[];
    readonly hints?: readonly string[];
}

export interface VideoResponseContent {
    readonly prompt: string;
    readonly maxDuration: number;
    readonly allowRetakes?: boolean;
    readonly evaluationCriteria?: readonly string[];
}

export interface SigningPracticeContent {
    readonly word: string;
    readonly videoUrl?: string;
    readonly description: string;
    readonly difficulty: number;
    readonly category: string;
}

/**
 * Configuration d'adaptateur (alias pour GeneratorAdapterConfig)
 */
export type AdapterConfig = GeneratorAdapterConfig;

// ===== CONFIGURATION PAR DÉFAUT =====

/**
 * Configuration par défaut du système
 */
export const DEFAULT_CONFIG: ExerciseServiceConfig = {
    maxCacheSize: 500,
    cacheMaxAge: 1800000, // 30 minutes
    enableAutoCleanup: true,
    cleanupInterval: 300000 // 5 minutes
};

/**
 * Exemples de paramètres pour les tests et la documentation
 */
export const EXAMPLE_PARAMS: Record<string, ExerciseGenerationParams> = {
    simpleMultipleChoice: {
        type: 'MultipleChoice',
        level: 'A1',
        difficulty: 0.3
    },
    advancedVideoResponse: {
        type: 'VideoResponse',
        level: 'C1',
        difficulty: 0.8,
        focusAreas: ['conversation', 'fluency']
    },
    practiceSigningBasic: {
        type: 'SigningPractice',
        level: 'A2',
        difficulty: 0.5,
        focusAreas: ['basic-vocabulary']
    }
} as const;

// ===== HELPER FUNCTIONS ADDITIONNELS =====

/**
 * Crée des métadonnées par défaut pour un exercice
 * @param params Paramètres de génération
 * @returns Métadonnées par défaut
 */
export function createDefaultExerciseMetadata(params: ExerciseGenerationParams): ExerciseMetadata {
    const metadata = ExerciseTypeUtils.createDefaultMetadata(params);

    // S'assurer que les métadonnées ne sont jamais undefined
    if (!metadata) {
        return {
            createdAt: new Date(),
            level: params.level,
            difficulty: params.difficulty,
            estimatedDuration: ExerciseTypeUtils.estimateDuration(params.type, params.difficulty)
        };
    }

    return metadata;
}

/**
 * Valide si un objet est un exercice valide
 * @param obj Objet à valider
 * @returns True si l'objet est un exercice valide
 */
export function isValidExercise(obj: unknown): obj is Exercise {
    return ExerciseTypeUtils.hasValidId(obj) &&
        typeof obj === 'object' &&
        obj !== null &&
        'type' in obj &&
        'content' in obj &&
        ExerciseTypeUtils.isSupportedExerciseType((obj as Exercise).type);
}

/**
 * Extrait le type de contenu d'un exercice
 * @param exercise Exercice dont extraire le contenu
 * @param expectedType Type d'exercice attendu
 * @returns Contenu typé selon le type d'exercice
 */
export function extractExerciseContent<T extends SupportedExerciseType>(
    exercise: Exercise,
    expectedType: T
): T extends 'MultipleChoice'
    ? MultipleChoiceContent
    : T extends 'DragDrop'
    ? DragDropContent
    : T extends 'FillBlank'
    ? FillBlankContent
    : T extends 'TextEntry'
    ? TextEntryContent
    : T extends 'VideoResponse'
    ? VideoResponseContent
    : T extends 'SigningPractice'
    ? SigningPracticeContent
    : unknown {
    if (exercise.type !== expectedType) {
        throw new Error(`Expected exercise type ${expectedType}, got ${exercise.type}`);
    }
    return exercise.content as T extends 'MultipleChoice'
        ? MultipleChoiceContent
        : T extends 'DragDrop'
        ? DragDropContent
        : T extends 'FillBlank'
        ? FillBlankContent
        : T extends 'TextEntry'
        ? TextEntryContent
        : T extends 'VideoResponse'
        ? VideoResponseContent
        : T extends 'SigningPractice'
        ? SigningPracticeContent
        : unknown;
}