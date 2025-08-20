/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/index.ts
 * @description Index principal des modules de test d'intégration refactorisés
 * 
 * Ce fichier barrel exporte tous les modules de test d'intégration selon les bonnes pratiques
 * du projet MetaSign. Il facilite les imports et maintient une structure organisée.
 * 
 * ## Modules exportés :
 * - 🏭 **Factory** : Création d'instances de test configurées
 * - 🛠️ **Utils** : Utilitaires pour les tests et mesures de performance  
 * - 🎯 **Types** : Définitions de types stricts pour les tests
 * - 🧪 **Tests** : Suites de tests d'intégration refactorisées
 * 
 * ## Architecture refactorisée :
 * - **Respect du guide de refactorisation** : Aucun fichier > 300 lignes
 * - **Typage strict** : Aucun usage de `any`, conformité TypeScript
 * - **Modularité** : Séparation claire des responsabilités
 * - **Bonnes pratiques** : Conformité aux standards du projet
 * 
 * @module IntegrationTestsIndex
 * @version 3.0.0 - Révolution CODA Refactorisée
 * @since 2025
 * @author MetaSign Team - Testing Architecture Division
 * 
 * @example
 * ```typescript
 * // Import des utilitaires et factory
 * import { IntegrationTestFactory, IntegrationTestUtils } from './';
 * 
 * // Import des types
 * import type { TestSystemConfig, PersonalityTestData } from './';
 * 
 * // Utilisation
 * const system = IntegrationTestFactory.createEmotionalSystem();
 * const params = IntegrationTestUtils.createValidEmotionParams();
 * ```
 */

// Export des types principaux
export type {
    // Configuration et système
    TestSystemConfig,
    PersonalityTestData,
    MockPersonalitySystem,
    TestableEmotionalSystem,

    // Analyse et historique
    EmotionalAnalysis,
    EmotionalHistory,
    EmotionalPattern,
    SystemStatistics,

    // Contextes d'apprentissage
    LearningContext,
    LearningSession,
    LearningExercise,

    // Système CODA
    MockCODASystem,
    SignExecutionData,
    CODAEvaluation,

    // Performance et stress
    PerformanceMetrics,
    PerformanceTestResult,
    StressTestConfig,
    StressTestResult
} from './types/IntegrationTestTypes';

// Export des utilitaires
export { IntegrationTestUtils } from './utils/IntegrationTestUtils';

// Export de la factory
export { IntegrationTestFactory } from './utils/IntegrationTestFactory';

// Export des guards de types
export { TypeGuards } from './types/IntegrationTestTypes';

/**
 * Configuration par défaut pour les tests d'intégration
 */
export const DEFAULT_TEST_CONFIG: Readonly<{
    timeout: number;
    maxRetries: number;
    performanceThresholds: {
        maxAvgTimePerOperation: number;
        maxTotalTime: number;
        maxMemoryIncrease: number;
    };
}> = {
    timeout: 30000,
    maxRetries: 3,
    performanceThresholds: {
        maxAvgTimePerOperation: 100,
        maxTotalTime: 60000,
        maxMemoryIncrease: 100 * 1024 * 1024 // 100MB
    }
} as const;

/**
 * Contextes d'apprentissage prédéfinis
 */
export const LEARNING_CONTEXTS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    THERAPY: 'therapy'
} as const;

/**
 * Résultats d'apprentissage possibles
 */
export const LEARNING_OUTCOMES = {
    SUCCESS: 'success' as const,
    PARTIAL: 'partial' as const,
    FAILURE: 'failure' as const
};

/**
 * Niveaux de complexité
 */
export const COMPLEXITY_LEVELS = {
    LOW: 'low' as const,
    MEDIUM: 'medium' as const,
    HIGH: 'high' as const,
    ADAPTIVE: 'adaptive' as const
};

/**
 * Niveaux de support
 */
export const SUPPORT_LEVELS = {
    LOW: 'low' as const,
    MEDIUM: 'medium' as const,
    HIGH: 'high' as const,
    SPECIALIZED: 'specialized' as const
};

/**
 * Méta-informations sur les tests refactorisés
 */
export const TEST_REFACTORING_INFO = {
    version: '3.0.0',
    refactoredFrom: 'Integration.test.ts (960+ lines)',
    refactoredInto: [
        'types/IntegrationTestTypes.ts (~200 lines)',
        'utils/IntegrationTestFactory.ts (~150 lines)',
        'utils/IntegrationTestUtils.ts (~200 lines)',
        'Integration.test.ts (~250 lines)',
        'IntegrationAdvanced.test.ts (~280 lines)',
        'IntegrationScenarios.test.ts (~300 lines)'
    ],
    improvements: [
        'Suppression de tous les usages de `any`',
        'Typage strict conforme à exactOptionalPropertyTypes: true',
        'Correction de toutes les erreurs ESLint identifiées',
        'Respect du guide de refactorisation (< 300 lignes par fichier)',
        'Séparation claire des responsabilités',
        'Architecture modulaire et maintenable',
        'Documentation JSDoc complète',
        'Gestion d\'erreurs robuste',
        'Tests de performance optimisés'
    ],
    eslintErrorsFixed: [
        '@typescript-eslint/no-explicit-any (17 occurrences)',
        '@typescript-eslint/no-unused-vars (3 occurrences)',
        '@typescript-eslint/no-require-imports (1 occurrence)',
        'Property shutdown does not exist (1 erreur TypeScript)'
    ]
} as const;