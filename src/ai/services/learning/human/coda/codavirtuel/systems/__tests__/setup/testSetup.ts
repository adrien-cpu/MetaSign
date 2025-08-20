/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/setup/testSetup.ts
 * @description Configuration et setup pour l'environnement de test Jest
 * 
 * Ce fichier configure l'environnement de test pour les tests d'intégration refactorisés,
 * incluant les mocks globaux, la configuration des timeouts et les utilitaires de test.
 * 
 * ## Configuration incluse :
 * - 🔧 **Mocks globaux** : Configuration des mocks pour les dépendances
 * - ⏱️ **Timeouts** : Configuration des délais pour les tests d'intégration
 * - 🛠️ **Utilitaires** : Helpers globaux pour les tests
 * - 🔍 **Debugging** : Configuration pour le debugging des tests
 * - 🎯 **Performance** : Monitoring des performances des tests
 * 
 * @module TestSetup
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Testing Setup
 */

import { jest } from '@jest/globals';

// Configuration des timeouts pour les tests d'intégration
jest.setTimeout(30000); // 30 secondes par test

/**
 * Mock global du LoggerFactory
 */
jest.mock('@ai/utils/LoggerFactory', () => ({
    LoggerFactory: {
        getLogger: jest.fn((name: string) => ({
            info: jest.fn((message: string, ...args: unknown[]) => {
                if (process.env.TEST_MODE === 'verbose') {
                    console.log(`[INFO] ${name}: ${message}`, ...args);
                }
            }),
            debug: jest.fn((message: string, ...args: unknown[]) => {
                if (process.env.TEST_MODE === 'verbose') {
                    console.debug(`[DEBUG] ${name}: ${message}`, ...args);
                }
            }),
            error: jest.fn((message: string, ...args: unknown[]) => {
                if (process.env.TEST_MODE !== 'silent') {
                    console.error(`[ERROR] ${name}: ${message}`, ...args);
                }
            }),
            warn: jest.fn((message: string, ...args: unknown[]) => {
                if (process.env.TEST_MODE !== 'silent') {
                    console.warn(`[WARN] ${name}: ${message}`, ...args);
                }
            })
        }))
    }
}));

/**
 * Configuration globale pour les tests de performance
 */
(globalThis as Record<string, unknown>).testPerformanceConfig = {
    enablePerformanceMonitoring: process.env.ENABLE_PERF_MONITORING === 'true',
    performanceThresholds: {
        maxMemoryIncrease: 100 * 1024 * 1024, // 100MB
        maxExecutionTime: 10000, // 10 secondes
        maxAvgTimePerOperation: 100 // 100ms
    }
};

/**
 * Utilitaires globaux pour les tests
 */
(globalThis as Record<string, unknown>).testUtils = {
    /**
     * Génère un ID unique pour les tests
     */
    generateTestId: (prefix = 'test'): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 5);
        return `${prefix}_${timestamp}_${random}`;
    },

    /**
     * Attendre un délai spécifié
     */
    delay: (ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Vérifier si l'environnement est en mode debug
     */
    isDebugMode: (): boolean => {
        return process.env.TEST_MODE === 'debug';
    },

    /**
     * Logger conditionnel pour les tests
     */
    testLog: (message: string, ...args: unknown[]): void => {
        if (process.env.TEST_MODE === 'verbose' || process.env.TEST_MODE === 'debug') {
            console.log(`[TEST] ${message}`, ...args);
        }
    }
};

/**
 * Configuration des handlers d'erreur pour les tests
 */
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
    // Filtrer les erreurs connues qui ne sont pas critiques pour les tests
    const message = String(args[0]);

    const knownNonCriticalErrors = [
        'Warning: ReactDOM.render is deprecated',
        'Warning: componentWillReceiveProps has been renamed',
        'ExperimentalWarning: Conditional exports'
    ];

    const isKnownError = knownNonCriticalErrors.some(knownError =>
        message.includes(knownError)
    );

    if (!isKnownError || process.env.TEST_MODE === 'verbose') {
        originalConsoleError.apply(console, args);
    }
};

/**
 * Setup avant tous les tests
 */
beforeAll(() => {
    // Configuration de l'environnement de test
    if (!process.env.NODE_ENV) {
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: 'test',
            writable: false
        });
    }

    const testUtils = (globalThis as Record<string, unknown>).testUtils as {
        testLog: (message: string, ...args: unknown[]) => void;
    } | undefined;

    if (testUtils) {
        testUtils.testLog('Initialisation de l\'environnement de test d\'intégration');
    }

    // Configuration mémoire pour Node.js
    if (global.gc) {
        global.gc();
    }
});

/**
 * Setup avant chaque test
 */
beforeEach(() => {
    // Nettoyer les mocks avant chaque test
    jest.clearAllMocks();

    // Reset des timers si utilisés
    jest.clearAllTimers();

    // Garbage collection si disponible (pour les tests de mémoire)
    if (global.gc) {
        global.gc();
    }
});

/**
 * Cleanup après chaque test
 */
afterEach(() => {
    // Nettoyer les mocks après chaque test
    jest.restoreAllMocks();

    // Reset des timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

/**
 * Cleanup après tous les tests
 */
afterAll(() => {
    const testUtils = (globalThis as Record<string, unknown>).testUtils as {
        testLog: (message: string, ...args: unknown[]) => void;
    } | undefined;

    if (testUtils) {
        testUtils.testLog('Finalisation des tests d\'intégration');
    }

    // Nettoyage final
    jest.clearAllMocks();
    jest.restoreAllMocks();

    // Garbage collection finale
    if (global.gc) {
        global.gc();
    }
});

/**
 * Handler pour les rejections non gérées
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Enregistrer l'erreur mais ne pas faire planter les tests
});

/**
 * Handler pour les exceptions non capturées
 */
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // En mode test, on veut capturer mais pas faire planter
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
    }
});

/**
 * Extension des types globaux pour TypeScript
 */
declare global {
    const testPerformanceConfig: {
        enablePerformanceMonitoring: boolean;
        performanceThresholds: {
            maxMemoryIncrease: number;
            maxExecutionTime: number;
            maxAvgTimePerOperation: number;
        };
    };

    const testUtils: {
        generateTestId: (prefix?: string) => string;
        delay: (ms: number) => Promise<void>;
        isDebugMode: () => boolean;
        testLog: (message: string, ...args: unknown[]) => void;
    };

    interface Global {
        testPerformanceConfig?: typeof testPerformanceConfig;
        testUtils?: typeof testUtils;
        gc?: () => void;
    }
}

export { };