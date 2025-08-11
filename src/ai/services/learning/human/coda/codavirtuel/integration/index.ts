/**
 * Point d'entrée centralisé pour l'intégration Pyramide IA MetaSign
 * @file src/ai/services/learning/human/coda/codavirtuel/integration/index.ts
 * @module ai/services/learning/human/coda/codavirtuel/integration
 * @description Centralise tous les exports pour l'intégration avec la pyramide IA
 * Architecture modulaire respectant la limite de 300 lignes par fichier
 * Corrections v3.1.0: Suppression des imports vers modules inexistants, correction des types
 * @author MetaSign Learning Team
 * @version 3.1.0
 * @since 2024
 * @lastModified 2025-01-24
 */

// === TYPES CENTRALISÉS ===
export type {
    // Types CODA
    CODALearningState,
    CODAResponse,
    TrainerFeedback,

    // Types Pyramide
    PyramidLevel,
    PyramidRequest,
    PyramidResponse,
    PyramidRequestType,
    PyramidPriority,
    PyramidIntegrationConfig,
    PyramidSystemState,
    PyramidLevelState,
    MutablePyramidSystemState,

    // Types d'analyse
    PyramidLevelInsights,
    CollectiveAnalysisResult,
    CollectiveAnalysisInput,
    OptimizedPathStep,
    OptimizedLearningPath
} from './types';

// === CONSTANTES ===
export {
    PYRAMID_LEVEL_CAPABILITIES,
    DEFAULT_PYRAMID_CONFIG
} from './types';

// === MODULES CORE ===
export { PyramidRequestManager } from './core/PyramidRequestManager';
export { PyramidStateManager } from './core/PyramidStateManager';
export { PyramidHealthMonitor } from './core/PyramidHealthMonitor';

// === MODULES D'ANALYSE ===
export { CollectiveAnalyzer } from './analysis/CollectiveAnalyzer';

// === IMPORTS POUR LES TYPES ===
import type { PyramidIntegrationConfig } from './types';
import { DEFAULT_PYRAMID_CONFIG } from './types';

// === FACTORY FUNCTIONS ===

/**
 * Interface pour les dépendances du système d'intégration
 */
interface PyramidIntegrationDependencies {
    readonly codaSystem: unknown; // EnhancedCODASystem
    readonly exerciseService: unknown; // ExerciseGeneratorService
    readonly config?: Partial<PyramidIntegrationConfig>;
}

/**
 * Classe d'intégration temporaire (stub)
 * TODO: Implémenter la vraie classe LearningPyramidAIIntegration
 */
class LearningPyramidAIIntegration {
    constructor(private dependencies: PyramidIntegrationDependencies) {
        // Implémentation temporaire
    }
}

/**
 * Crée une instance complète du système d'intégration avec la pyramide IA
 * @param dependencies Dépendances requises
 * @returns Instance configurée du système
 */
export function createPyramidIntegration(dependencies: PyramidIntegrationDependencies) {
    return new LearningPyramidAIIntegration(dependencies);
}

/**
 * Configuration de développement avec valeurs optimisées pour le dev
 */
export const DEV_PYRAMID_CONFIG: Required<PyramidIntegrationConfig> = {
    enabledLevels: [1, 2, 3, 4, 5, 6, 7],
    timeouts: {
        1: 500,   // Plus rapide en dev
        2: 750,
        3: 1000,
        4: 1500,
        5: 1000,
        6: 1250,
        7: 2000
    },
    retryPolicies: {
        1: { maxRetries: 2, backoffMs: 250 },
        2: { maxRetries: 2, backoffMs: 250 },
        3: { maxRetries: 1, backoffMs: 500 },
        4: { maxRetries: 1, backoffMs: 500 },
        5: { maxRetries: 2, backoffMs: 375 },
        6: { maxRetries: 1, backoffMs: 500 },
        7: { maxRetries: 1, backoffMs: 1000 }
    },
    loadBalancing: {
        enabled: false, // Désactivé en dev
        strategy: 'round-robin'
    },
    caching: {
        enabled: true,
        ttlMs: 60000, // 1 minute en dev
        maxSize: 100
    }
} as const;

/**
 * Configuration de production avec valeurs optimisées pour la prod
 */
export const PROD_PYRAMID_CONFIG: Required<PyramidIntegrationConfig> = {
    enabledLevels: [1, 2, 3, 4, 5, 6, 7],
    timeouts: {
        1: 1000,
        2: 2000,
        3: 3000,
        4: 5000,
        5: 3000,
        6: 4000,
        7: 6000
    },
    retryPolicies: {
        1: { maxRetries: 3, backoffMs: 500 },
        2: { maxRetries: 3, backoffMs: 500 },
        3: { maxRetries: 2, backoffMs: 1000 },
        4: { maxRetries: 2, backoffMs: 1000 },
        5: { maxRetries: 3, backoffMs: 750 },
        6: { maxRetries: 2, backoffMs: 1000 },
        7: { maxRetries: 1, backoffMs: 2000 }
    },
    loadBalancing: {
        enabled: true,
        strategy: 'performance-based'
    },
    caching: {
        enabled: true,
        ttlMs: 300000, // 5 minutes
        maxSize: 1000
    }
} as const;

// === UTILITAIRES D'AIDE ===

/**
 * Valide une configuration de pyramide
 * @param config Configuration à valider
 * @returns true si valide, throw sinon
 */
export function validatePyramidConfig(config: Partial<PyramidIntegrationConfig>): boolean {
    const required: (keyof PyramidIntegrationConfig)[] = [
        'enabledLevels',
        'timeouts',
        'retryPolicies',
        'loadBalancing',
        'caching'
    ];

    for (const key of required) {
        if (!(key in config)) {
            throw new Error(`Missing required config key: ${String(key)}`);
        }
    }

    // Validation des niveaux activés
    if (config.enabledLevels && config.enabledLevels.length === 0) {
        throw new Error('At least one pyramid level must be enabled');
    }

    return true;
}

/**
 * Fusionne les configurations avec les valeurs par défaut
 * @param userConfig Configuration utilisateur
 * @param defaults Configuration par défaut
 * @returns Configuration complète
 */
export function mergePyramidConfig(
    userConfig: Partial<PyramidIntegrationConfig>,
    defaults: Required<PyramidIntegrationConfig> = DEFAULT_PYRAMID_CONFIG
): Required<PyramidIntegrationConfig> {
    return {
        enabledLevels: userConfig.enabledLevels ?? defaults.enabledLevels,
        timeouts: { ...defaults.timeouts, ...userConfig.timeouts },
        retryPolicies: { ...defaults.retryPolicies, ...userConfig.retryPolicies },
        loadBalancing: { ...defaults.loadBalancing, ...userConfig.loadBalancing },
        caching: { ...defaults.caching, ...userConfig.caching }
    };
}

/**
 * Crée une configuration pour un environnement spécifique
 * @param environment Environnement cible
 * @returns Configuration optimisée pour l'environnement
 */
export function createEnvironmentConfig(
    environment: 'development' | 'test' | 'production'
): Required<PyramidIntegrationConfig> {
    switch (environment) {
        case 'development':
            return DEV_PYRAMID_CONFIG;
        case 'test':
            return {
                ...DEV_PYRAMID_CONFIG,
                caching: { enabled: false, ttlMs: 0, maxSize: 0 }, // Pas de cache en test
                timeouts: {
                    1: 100, 2: 150, 3: 200, 4: 300, 5: 200, 6: 250, 7: 400
                } // Très rapide en test
            };
        case 'production':
            return PROD_PYRAMID_CONFIG;
        default:
            throw new Error(`Unknown environment: ${environment}`);
    }
}

// === EXPORTS TEMPORAIREMENT COMMENTÉS ===
// TODO: Décommenter une fois que les modules correspondants sont implémentés

// === MODULES D'ANALYSE (À IMPLÉMENTER) ===
// export { PathOptimizer } from './analysis/PathOptimizer';
// export { InsightsSynthesizer } from './analysis/InsightsSynthesizer';

// === SERVICES MÉTIER (À IMPLÉMENTER) ===
// export { ExerciseGenerator } from './services/ExerciseGenerator';
// export { ResponseEvaluator } from './services/ResponseEvaluator';
// export { FeedbackGenerator } from './services/FeedbackGenerator';

// === UTILITAIRES (À IMPLÉMENTER) ===
// export { PyramidSimulator } from './utils/PyramidSimulator';
// export { CacheManager } from './utils/CacheManager';
// export { MetricsCalculator } from './utils/MetricsCalculator';

// === CLASSE PRINCIPALE (À IMPLÉMENTER) ===
// export { LearningPyramidAIIntegration } from './LearningPyramidAIIntegration';