/**
 * Index centralisé pour le module de personnalisation des parcours d'apprentissage
 * 
 * @file src/ai/services/learning/personalization/index.ts
 * @module ai/services/learning/personalization
 * @description Point d'entrée centralisé pour tous les exports du module de personnalisation
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export type {
    // Types de base
    CECRLLevel,
    StepType,
    StepStatus,
    LearningStyle,
    PathGenerationMode,

    // Interfaces principales
    LearningPathStep,
    LearningPreferences,
    PersonalizedLearningPathModel,
    PathGenerationOptions,
    StepDistributionConfig,
    LessonTopic,
    PracticeScenario,
    StepGeneratorConfig,
    PathAdaptationResult,
    PathStatistics
} from './types/LearningPathTypes';

export {
    // Constantes
    LEARNING_PATH_CONSTANTS,
    // Utilitaires de types
    LearningPathTypeUtils
} from './types/LearningPathTypes';

// ============================================================================
// SERVICES PRINCIPAUX
// ============================================================================

export { PersonalizedLearningPath } from './PersonalizedLearningPath';
export { PathStepGenerator } from './generators/PathStepGenerator';
export { PathProgressManager } from './managers/PathProgressManager';

// ============================================================================
// UTILITAIRES
// ============================================================================

export { PathFormatUtils, formatUtils } from './utils/PathFormatUtils';

// ============================================================================
// FACTORY FUNCTIONS ET CONFIGURATIONS
// ============================================================================

import { PersonalizedLearningPath } from './PersonalizedLearningPath';
import { PathStepGenerator } from './generators/PathStepGenerator';
import { PathProgressManager } from './managers/PathProgressManager';
import {
    LEARNING_PATH_CONSTANTS,
    LearningPathTypeUtils,
    type CECRLLevel,
    type PathGenerationMode,
    type PathGenerationOptions
} from './types/LearningPathTypes';
import type { LearningMetricsCollector } from '@/ai/services/learning/metrics/LearningMetricsCollector';
import type { MetricsAnalyzer } from '@/ai/services/learning/metrics/MetricsAnalyzer';

/**
 * Configuration par défaut pour le développement
 */
export const DEV_PERSONALIZATION_CONFIG = {
    enableAutoIdGeneration: true,
    maxCacheSize: 50,
    cacheTTL: 10 * 60 * 1000, // 10 minutes
    enableAutoAdaptation: true
} as const;

/**
 * Configuration par défaut pour la production
 */
export const PROD_PERSONALIZATION_CONFIG = {
    enableAutoIdGeneration: true,
    maxCacheSize: 200,
    cacheTTL: 60 * 60 * 1000, // 1 heure
    enableAutoAdaptation: true
} as const;

/**
 * Configuration pour les tests
 */
export const TEST_PERSONALIZATION_CONFIG = {
    enableAutoIdGeneration: true,
    maxCacheSize: 10,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    enableAutoAdaptation: false
} as const;

/**
 * Crée une instance du service de parcours personnalisés avec configuration par défaut
 * 
 * @param metricsCollector Collecteur de métriques (optionnel)
 * @param metricsAnalyzer Analyseur de métriques (optionnel)
 * @returns Instance configurée du service
 * 
 * @example
 * ```typescript
 * import { createPersonalizedLearningPath } from '@/ai/services/learning/personalization';
 * 
 * const service = createPersonalizedLearningPath(metricsCollector, metricsAnalyzer);
 * const path = await service.generatePath(userId, profile, options);
 * ```
 */
export function createPersonalizedLearningPath(
    metricsCollector?: LearningMetricsCollector,
    metricsAnalyzer?: MetricsAnalyzer
): PersonalizedLearningPath {
    return new PersonalizedLearningPath(metricsCollector, metricsAnalyzer, PROD_PERSONALIZATION_CONFIG);
}

/**
 * Crée une instance pour l'environnement de développement
 * 
 * @param metricsCollector Collecteur de métriques (optionnel)
 * @param metricsAnalyzer Analyseur de métriques (optionnel)
 * @returns Instance configurée pour le développement
 * 
 * @example
 * ```typescript
 * const devService = createPersonalizedLearningPathForDev();
 * ```
 */
export function createPersonalizedLearningPathForDev(
    metricsCollector?: LearningMetricsCollector,
    metricsAnalyzer?: MetricsAnalyzer
): PersonalizedLearningPath {
    return new PersonalizedLearningPath(metricsCollector, metricsAnalyzer, DEV_PERSONALIZATION_CONFIG);
}

/**
 * Crée une instance pour les tests
 * 
 * @param metricsCollector Collecteur de métriques (optionnel)
 * @param metricsAnalyzer Analyseur de métriques (optionnel)
 * @returns Instance configurée pour les tests
 * 
 * @example
 * ```typescript
 * const testService = createPersonalizedLearningPathForTest();
 * ```
 */
export function createPersonalizedLearningPathForTest(
    metricsCollector?: LearningMetricsCollector,
    metricsAnalyzer?: MetricsAnalyzer
): PersonalizedLearningPath {
    return new PersonalizedLearningPath(metricsCollector, metricsAnalyzer, TEST_PERSONALIZATION_CONFIG);
}

/**
 * Crée une instance du générateur d'étapes
 * 
 * @returns Instance du générateur d'étapes
 * 
 * @example
 * ```typescript
 * const generator = createPathStepGenerator();
 * const steps = await generator.generateAllSteps(config);
 * ```
 */
export function createPathStepGenerator(): PathStepGenerator {
    return new PathStepGenerator();
}

/**
 * Crée une instance du gestionnaire de progression
 * 
 * @param enableAutoAdaptation Activer l'adaptation automatique (par défaut: true)
 * @returns Instance du gestionnaire de progression
 * 
 * @example
 * ```typescript
 * const progressManager = createPathProgressManager();
 * const result = progressManager.updateProgress(path, stepId, true);
 * ```
 */
export function createPathProgressManager(enableAutoAdaptation: boolean = true): PathProgressManager {
    return new PathProgressManager({
        enableAutoAdaptation,
        progressThreshold: 0.8,
        autoSaveInterval: 30000
    });
}

/**
 * Initialise le système complet de personnalisation
 * 
 * @param config Configuration globale
 * @returns Système complet initialisé
 * 
 * @example
 * ```typescript
 * const system = await initializePersonalizationSystem({
 *     environment: 'production',
 *     metricsCollector,
 *     metricsAnalyzer
 * });
 * ```
 */
export async function initializePersonalizationSystem(config: {
    readonly environment?: 'development' | 'production' | 'test';
    readonly metricsCollector?: LearningMetricsCollector;
    readonly metricsAnalyzer?: MetricsAnalyzer;
    readonly customConfig?: Record<string, unknown>;
}) {
    const { environment = 'production', metricsCollector, metricsAnalyzer } = config;

    // Sélectionner la configuration selon l'environnement
    let service: PersonalizedLearningPath;

    switch (environment) {
        case 'development':
            service = createPersonalizedLearningPathForDev(metricsCollector, metricsAnalyzer);
            break;
        case 'test':
            service = createPersonalizedLearningPathForTest(metricsCollector, metricsAnalyzer);
            break;
        default:
            service = createPersonalizedLearningPath(metricsCollector, metricsAnalyzer);
    }

    // Créer les composants associés
    const stepGenerator = createPathStepGenerator();
    const progressManager = createPathProgressManager();

    return {
        service,
        stepGenerator,
        progressManager,
        environment,
        isInitialized: true
    };
}

// ============================================================================
// UTILITAIRES RAPIDES
// ============================================================================

/**
 * Valide rapidement des options de génération de parcours
 * 
 * @param options Options à valider
 * @returns True si les options sont valides
 * 
 * @example
 * ```typescript
 * if (quickValidatePathOptions(options)) {
 *     const path = await service.generatePath(userId, profile, options);
 * }
 * ```
 */
export function quickValidatePathOptions(options: PathGenerationOptions): boolean {
    try {
        if (!LearningPathTypeUtils.isValidCECRLLevel(options.targetLevel)) {
            return false;
        }

        if (options.mode && !LearningPathTypeUtils.isValidGenerationMode(options.mode)) {
            return false;
        }

        if (options.intensity !== undefined && (options.intensity < 1 || options.intensity > 5)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Estime la durée d'un parcours selon les paramètres
 * 
 * @param currentLevel Niveau actuel
 * @param targetLevel Niveau cible
 * @param intensity Intensité (1-5)
 * @returns Durée estimée en jours
 * 
 * @example
 * ```typescript
 * const duration = estimatePathDuration('A1', 'A2', 3);
 * console.log(`Durée estimée: ${duration} jours`);
 * ```
 */
export function estimatePathDuration(
    currentLevel: CECRLLevel,
    targetLevel: CECRLLevel,
    intensity: number = 3
): number {
    const currentIndex = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.indexOf(currentLevel);
    const targetIndex = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.indexOf(targetLevel);

    if (currentIndex === -1 || targetIndex === -1 || targetIndex <= currentIndex) {
        return LEARNING_PATH_CONSTANTS.DEFAULT_LEVEL_DURATIONS.A1;
    }

    let totalDuration = 0;
    for (let i = currentIndex + 1; i <= targetIndex; i++) {
        const level = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS[i];
        totalDuration += LEARNING_PATH_CONSTANTS.DEFAULT_LEVEL_DURATIONS[level];
    }

    // Ajuster selon l'intensité
    const intensityFactor = 0.5 + (intensity * 0.25); // 0.75 à 1.75
    return Math.floor(totalDuration / intensityFactor);
}

/**
 * Génère un identifiant unique pour un parcours
 * 
 * @param userId Identifiant utilisateur
 * @param prefix Préfixe personnalisé (optionnel)
 * @returns Identifiant unique
 * 
 * @example
 * ```typescript
 * const pathId = generateUniquePathId('user-123', 'custom');
 * console.log(pathId); // "custom-user-123-1642588800000-1234"
 * ```
 */
export function generateUniquePathId(userId: string, prefix: string = 'path'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${userId}-${timestamp}-${random}`;
}

// ============================================================================
// CONSTANTES PUBLIQUES
// ============================================================================

/**
 * Configurations prédéfinies pour différents environnements
 */
export const PREDEFINED_CONFIGS = {
    development: DEV_PERSONALIZATION_CONFIG,
    production: PROD_PERSONALIZATION_CONFIG,
    test: TEST_PERSONALIZATION_CONFIG
} as const;

/**
 * Exemples d'options de génération pour différents cas d'usage
 */
export const EXAMPLE_PATH_OPTIONS = {
    beginner: {
        targetLevel: 'A2' as CECRLLevel,
        mode: 'balanced' as PathGenerationMode,
        intensity: 2,
        targetDuration: 45
    },
    intermediate: {
        targetLevel: 'B1' as CECRLLevel,
        mode: 'comprehensive' as PathGenerationMode,
        intensity: 3,
        targetDuration: 60
    },
    advanced: {
        targetLevel: 'C1' as CECRLLevel,
        mode: 'mastery' as PathGenerationMode,
        intensity: 4,
        targetDuration: 90
    },
    accelerated: {
        targetLevel: 'B2' as CECRLLevel,
        mode: 'fast-track' as PathGenerationMode,
        intensity: 5,
        targetDuration: 30
    }
} as const;

// ============================================================================
// METADATA
// ============================================================================

/**
 * Métadonnées du module de personnalisation
 */
export const PERSONALIZATION_MODULE_INFO = {
    name: 'Personnalisation des parcours d\'apprentissage',
    version: '3.0.0',
    description: 'Module de génération et gestion de parcours d\'apprentissage LSF personnalisés',
    author: 'MetaSign Learning Team',
    lastModified: '2025-01-15',
    dependencies: [
        '@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem',
        '@/ai/services/learning/metrics/LearningMetricsCollector',
        '@/ai/services/learning/metrics/MetricsAnalyzer',
        '@/ai/utils/Logger'
    ],
    exports: [
        'PersonalizedLearningPath',
        'PathStepGenerator',
        'PathProgressManager',
        'PathFormatUtils',
        'LearningPathTypeUtils',
        'createPersonalizedLearningPath',
        'initializePersonalizationSystem'
    ]
} as const;