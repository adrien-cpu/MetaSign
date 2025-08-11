/**
 * @file src/ai/services/learning/interfaces/__tests__/interfaces-validation.test.ts
 * @description Test de validation pour s'assurer que toutes les interfaces sont correctement exportées
 * et respectent exactOptionalPropertyTypes: true
 * @module InterfacesValidationTest
 * @version 2.0.0
 * @since 2024
 * @author MetaSign Team
 */

import type {
    // Core interfaces - seulement celles utilisées
    LearningProgress,
    LSFSkillProgress,
    QuizAttempt,
    ModuleCategory,

    // Content interfaces - seulement celles utilisées
    LSFLearningModule,
    LSFBadge,

    // Service interfaces - seulement celles utilisées
    IModuleManager,
    ServiceOperationResult,
    CacheConfiguration,

    // Analytics interfaces - seulement celles utilisées
    LSFSystemEvent,

    // Utility types - seulement celles utilisées
    LSFContentType,
    LSFDifficultyLevel,
    CECRLevel
} from '../index';

// Import de la constante comme valeur (pas avec import type)
import { DEFAULT_LSF_CONSTANTS } from '../index';

/**
 * Tests de validation des types - S'assurer que tout compile correctement
 */
describe('Interfaces Validation Tests', () => {

    describe('Core Learning Interfaces', () => {
        test('LearningProgress should be properly typed', () => {
            const progress: LearningProgress = {
                userId: 'test-user',
                completedModules: ['module1'],
                moduleProgress: { 'module1': 100 },
                quizAttempts: {},
                exerciseAttempts: {},
                earnedBadges: ['badge1'],
                totalExperience: 1500,
                level: 5,
                lastActivityDate: new Date(),
                timeSpent: 120,
                currentModule: 'module1',
                interactionHistory: [],
                // Les propriétés optionnelles peuvent être omises avec exactOptionalPropertyTypes: true
                masteredConcepts: ['concept1'],
                lsfSkills: {
                    fingerspelling: 80,
                    spatialGrammar: 75,
                    facialExpressions: 70,
                    handshapes: 85,
                    movements: 78,
                    basicVocabulary: 90,
                    advancedGrammar: 65
                }
            };

            expect(progress.userId).toBe('test-user');
        });

        test('QuizAttempt should support optional properties', () => {
            const attempt: QuizAttempt = {
                quizId: 'quiz1',
                score: 85,
                correctAnswers: 8,
                totalQuestions: 10,
                timeSpent: 300,
                date: new Date(),
                // Propriétés optionnelles peuvent être omises
                quizType: 'vocabulary',
                skillsAssessed: ['handshapes', 'movements']
            };

            expect(attempt.score).toBe(85);
        });
    });

    describe('Content Interfaces', () => {
        test('LSFLearningModule should be properly structured', () => {
            const testModule: LSFLearningModule = {
                id: 'module1',
                title: {
                    french: 'Module de base',
                    lsf: 'MODULE-BASE'
                },
                description: 'Description du module',
                category: 'LSF_Débutant',
                difficulty: 3,
                prerequisites: [],
                status: 'available',
                progress: 0,
                estimatedTime: 30,
                skills: ['handshapes', 'basic-vocabulary'],
                content: {
                    sections: [],
                    quizzes: [],
                    exercises: [],
                    resources: []
                },
                // Propriété optionnelle
                cecrLevel: 'A1'
            };

            expect(testModule.id).toBe('module1');
        });

        test('LSFBadge should handle optional properties correctly', () => {
            const badge: LSFBadge = {
                id: 'badge1',
                title: 'Premier Badge',
                description: 'Votre premier badge LSF',
                imageUrl: '/images/badge1.png',
                criteria: {
                    type: 'modules_completed',
                    value: 1
                },
                difficulty: 'easy',
                category: 'progression',
                experiencePoints: 100,
                // Propriétés optionnelles
                titleLSF: 'BADGE PREMIER'
            };

            expect(badge.experiencePoints).toBe(100);
        });
    });

    describe('Service Interfaces', () => {
        test('ServiceOperationResult should support generic typing', () => {
            const result: ServiceOperationResult<string> = {
                success: true,
                data: 'Success message',
                duration: 150,
                // Propriétés optionnelles
                metadata: { requestId: 'req123' },
                lsfContext: {
                    moduleId: 'module1',
                    skill: 'handshapes'
                }
            };

            expect(result.success).toBe(true);
            expect(result.data).toBe('Success message');
        });

        test('CacheConfiguration should be properly typed', () => {
            const config: CacheConfiguration = {
                defaultTTL: 3600,
                maxSize: 1000,
                evictionPolicy: 'LRU',
                enableStats: true,
                // Propriétés optionnelles
                keyPrefix: 'lsf:',
                enableDistributed: false
            };

            expect(config.evictionPolicy).toBe('LRU');
        });
    });

    describe('Analytics Interfaces', () => {
        test('LSFSystemEvent should support metadata', () => {
            const event: LSFSystemEvent = {
                eventType: 'module_completed',
                userId: 'user123',
                timestamp: new Date(),
                eventData: { moduleId: 'module1', score: 85 },
                // Propriété optionnelle
                metadata: {
                    source: 'learning-service',
                    systemVersion: '2.0.0',
                    userContext: { deviceType: 'mobile' }
                }
            };

            expect(event.eventType).toBe('module_completed');
        });
    });

    describe('Type Guards and Validators', () => {
        test('LSFConstants should be available', () => {
            expect(DEFAULT_LSF_CONSTANTS.DEFAULT_DURATIONS.MODULE).toBe(30);
            expect(DEFAULT_LSF_CONSTANTS.DEFAULT_THRESHOLDS.MASTERY).toBe(80);
            expect(DEFAULT_LSF_CONSTANTS.LIMITS.MAX_MODULES_PER_USER).toBe(100);
        });

        test('Union types should work correctly', () => {
            const difficulty: LSFDifficultyLevel = 5;
            const cecrLevel: CECRLevel = 'B1';
            const contentType: LSFContentType = 'video';
            const category: ModuleCategory = 'LSF_Intermédiaire';

            expect(difficulty).toBe(5);
            expect(cecrLevel).toBe('B1');
            expect(contentType).toBe('video');
            expect(category).toBe('LSF_Intermédiaire');
        });
    });

    describe('exactOptionalPropertyTypes compliance', () => {
        test('Optional properties can be omitted without undefined assignment', () => {
            // Ceci devrait compiler sans erreur avec exactOptionalPropertyTypes: true
            const testModule: LSFLearningModule = {
                id: 'test',
                title: { french: 'Test' },
                description: 'Test',
                category: 'LSF_Débutant',
                difficulty: 1,
                prerequisites: [],
                status: 'available',
                progress: 0,
                estimatedTime: 30,
                skills: [],
                content: {
                    sections: [],
                    quizzes: [],
                    exercises: [],
                    resources: []
                }
                // cecrLevel omis intentionnellement - ne devrait pas nécessiter undefined
            };

            expect(testModule.id).toBe('test');
        });

        test('Optional properties can be explicitly set', () => {
            const attempt: QuizAttempt = {
                quizId: 'quiz1',
                score: 85,
                correctAnswers: 8,
                totalQuestions: 10,
                timeSpent: 300,
                date: new Date(),
                quizType: 'vocabulary', // Défini explicitement
                skillsAssessed: ['handshapes'] // Défini explicitement
            };

            expect(attempt.quizType).toBe('vocabulary');
        });
    });
});

/**
 * Tests d'intégration des types pour s'assurer de la cohérence
 */
describe('Type Integration Tests', () => {
    test('All core exports should be available from index', () => {
        // Ce test s'assure que les types principaux sont correctement exportés
        // Si un type est manquant, TypeScript générera une erreur de compilation
        const typeCheck = {
            // Core
            learningProgress: {} as LearningProgress,
            lsfSkillProgress: {} as LSFSkillProgress,
            quizAttempt: {} as QuizAttempt,

            // Content
            lsfLearningModule: {} as LSFLearningModule,
            lsfBadge: {} as LSFBadge,

            // Services
            moduleManager: {} as IModuleManager,
            serviceResult: {} as ServiceOperationResult,

            // Analytics
            systemEvent: {} as LSFSystemEvent,

            // Utilities
            constants: DEFAULT_LSF_CONSTANTS
        };

        expect(typeCheck).toBeDefined();
    });

    test('Type narrowing works correctly', () => {
        const difficulty: LSFDifficultyLevel = 5;
        const isValidDifficulty = (diff: number): diff is LSFDifficultyLevel => {
            return diff >= 1 && diff <= 10 && Number.isInteger(diff);
        };

        expect(isValidDifficulty(difficulty)).toBe(true);
        expect(isValidDifficulty(11)).toBe(false);
    });
});