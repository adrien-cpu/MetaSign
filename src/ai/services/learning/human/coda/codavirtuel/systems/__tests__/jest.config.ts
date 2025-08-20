/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/jest.config.ts
 * @description Configuration Jest corrigée pour les tests d'intégration refactorisés
 * 
 * Cette configuration Jest résout les problèmes d'imports de modules et assure
 * la compatibilité avec l'architecture refactorisée des tests d'intégration.
 * 
 * ## Fonctionnalités configurées :
 * - 🔧 **Résolution de modules** : Mapping des alias TypeScript
 * - 📁 **Chemins de modules** : Configuration des paths pour les imports
 * - 🧪 **Environnement de test** : Setup pour les tests d'intégration
 * - ⚡ **Performance** : Optimisations pour les tests de charge
 * - 🎯 **Couverture** : Configuration de la couverture de code
 * 
 * @module JestIntegrationConfig
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Testing Configuration
 * 
 * @see {@link ./Integration.test.ts} - Tests principaux
 * @see {@link ./IntegrationAdvanced.test.ts} - Tests avancés
 * @see {@link ./IntegrationScenarios.test.ts} - Scénarios réels
 */

import type { Config } from 'jest';

const config: Config = {
    // Preset TypeScript pour Jest
    preset: 'ts-jest',

    // Environnement de test Node.js
    testEnvironment: 'node',

    // Patterns de fichiers de test
    testMatch: [
        '**/Integration*.test.ts'
    ],

    // Extensions de fichiers à transformer
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // Transformation des fichiers TypeScript
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                exactOptionalPropertyTypes: true,
                strict: true,
                noImplicitAny: true,
                strictNullChecks: true
            }
        }]
    },

    // Résolution des modules avec chemins alias
    moduleNameMapper: {
        '^@ai/(.*)$': '<rootDir>/../../../../../../$1',
        '^@/(.*)$': '<rootDir>/../../../../../../$1',
        '^@spatial/(.*)$': '<rootDir>/../../../../../../spatial/$1',
        '^@ai-types/(.*)$': '<rootDir>/../../../../../../types/$1'
    },

    // Chemins de résolution des modules
    modulePaths: [
        '<rootDir>',
        '<rootDir>/utils',
        '<rootDir>/types',
        '<rootDir>/../../../../../../'
    ],

    // Racines des modules
    roots: [
        '<rootDir>'
    ],

    // Setup et teardown
    setupFilesAfterEnv: [
        '<rootDir>/setup/testSetup.ts'
    ],

    // Configuration de timeout pour les tests d'intégration
    testTimeout: 30000,

    // Couverture de code
    collectCoverageFrom: [
        '**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/__tests__/**',
        '!**/coverage/**'
    ],

    // Seuils de couverture
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 75,
            lines: 80,
            statements: 80
        }
    },

    // Formats de rapport de couverture
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json-summary'
    ],

    // Variables d'environnement globales
    globals: {
        'ts-jest': {
            useESM: true,
            isolatedModules: true
        }
    },

    // Configuration des mocks
    clearMocks: true,
    restoreMocks: true,

    // Sortie détaillée pour debugging
    verbose: true,

    // Détection automatique des fuites mémoire
    detectLeaks: true,

    // Limite de workers pour éviter la surcharge système
    maxWorkers: '50%',

    // Cache pour améliorer les performances
    cache: true,
    cacheDirectory: '<rootDir>/.jest-cache',

    // Extensions pour la résolution de modules
    moduleDirectories: [
        'node_modules',
        '<rootDir>',
        '<rootDir>/utils',
        '<rootDir>/types'
    ],

    // Ignorer certains patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/coverage/',
        '/dist/',
        '/build/'
    ],

    // Configuration ESM
    extensionsToTreatAsEsm: ['.ts'],

    // Reporters personnalisés pour les tests d'intégration
    reporters: [
        'default',
        ['jest-html-reporters', {
            publicPath: './coverage/html-report',
            filename: 'integration-test-report.html',
            expand: true,
            hideIcon: false,
            pageTitle: 'MetaSign Integration Tests Report'
        }]
    ]
};

export default config;