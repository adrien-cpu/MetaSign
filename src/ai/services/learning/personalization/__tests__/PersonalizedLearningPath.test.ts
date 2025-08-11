/**
 * Tests unitaires pour le module de personnalisation des parcours d'apprentissage
 * 
 * @file src/ai/services/learning/personalization/__tests__/PersonalizedLearningPath.test.ts
 * @module ai/services/learning/personalization/__tests__
 * @description Tests complets pour le service de parcours personnalisés refactorisé
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import {
    PersonalizedLearningPath,
    PathFormatUtils,
    createPersonalizedLearningPath,
    createPersonalizedLearningPathForTest,
    quickValidatePathOptions,
    estimatePathDuration,
    generateUniquePathId,
    EXAMPLE_PATH_OPTIONS,
    LEARNING_PATH_CONSTANTS
} from '../index';

import type {
    PersonalizedLearningPathModel,
    PathGenerationOptions,
    CECRLLevel,
    PathGenerationMode
} from '../types/LearningPathTypes';

import type { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/types/index';
import type { LearningMetricsCollector } from '@/ai/services/learning/metrics/LearningMetricsCollector';
import type { MetricsAnalyzer } from '@/ai/services/learning/metrics/MetricsAnalyzer';

// ============================================================================
// TYPES POUR LES MOCKS
// ============================================================================

/**
 * Type pour le mock du collecteur de métriques
 */
interface MockMetricsCollector {
    collectMetric: jest.Mock;
    getMetrics: jest.Mock;
    clearMetrics: jest.Mock;
}

/**
 * Type pour le mock de l'analyseur de métriques
 */
interface MockMetricsAnalyzer {
    identifyStrengthsAndWeaknesses: jest.Mock;
    analyzeProgress: jest.Mock;
    generateReport: jest.Mock;
}

// ============================================================================
// MOCKS ET DONNÉES DE TEST
// ============================================================================

/**
 * Mock d'un profil utilisateur pour les tests
 */
const createMockUserProfile = (overrides?: Partial<UserReverseProfile>): UserReverseProfile => ({
    userId: 'test-user-123',
    currentLevel: 'A1',
    strengthAreas: ['recognition'],
    weaknessAreas: ['simpleExpressions', 'basicQuestions'],
    lastEvaluation: new Date(),
    progressHistory: [],
    exercisePreferences: {
        preferredTypes: ['MultipleChoice', 'DragDrop'],
        difficultyPreference: 0.5,
        focusAreas: ['basicVocabulary']
    },
    recentPerformance: 0.7,
    emotionalState: {
        motivation: 0.8,
        frustration: 0.2,
        confidence: 0.7
    },
    culturalPreferences: {
        preferredEnvironments: ['deaf_community_center'],
        preferredPersonalities: ['encouraging_mentor'],
        desiredImmersionLevel: 0.7
    },
    ...overrides
});

/**
 * Mock du collecteur de métriques
 */
const createMockMetricsCollector = (): MockMetricsCollector => ({
    collectMetric: jest.fn(),
    getMetrics: jest.fn(),
    clearMetrics: jest.fn()
});

/**
 * Mock de l'analyseur de métriques
 */
const createMockMetricsAnalyzer = (): MockMetricsAnalyzer => ({
    identifyStrengthsAndWeaknesses: jest.fn().mockResolvedValue({
        strengths: ['Reconnaissance des signes', 'Vocabulaire de base'],
        weaknesses: ['Expressions simples', 'Questions de base']
    }),
    analyzeProgress: jest.fn(),
    generateReport: jest.fn()
});

// ============================================================================
// TESTS DU SERVICE PRINCIPAL
// ============================================================================

describe('PersonalizedLearningPath - Service Principal', () => {
    let service: PersonalizedLearningPath;
    let mockProfile: UserReverseProfile;
    let mockMetricsCollector: MockMetricsCollector;
    let mockMetricsAnalyzer: MockMetricsAnalyzer;

    beforeEach(() => {
        mockProfile = createMockUserProfile();
        mockMetricsCollector = createMockMetricsCollector();
        mockMetricsAnalyzer = createMockMetricsAnalyzer();
        service = createPersonalizedLearningPathForTest(
            mockMetricsCollector as unknown as LearningMetricsCollector,
            mockMetricsAnalyzer as unknown as MetricsAnalyzer
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generatePath', () => {
        test('devrait créer un parcours avec les paramètres de base', async () => {
            const options: PathGenerationOptions = {
                targetLevel: 'A2',
                mode: 'balanced',
                intensity: 3
            };

            const path = await service.generatePath('test-user', mockProfile, options);

            expect(path).toBeDefined();
            expect(path.userId).toBe('test-user');
            expect(path.targetLevel).toBe('A2');
            expect(path.currentLevel).toBe('A1');
            expect(path.steps.length).toBeGreaterThan(0);
            expect(path.overallProgress).toBe(0);
            expect(path.createdAt).toBeInstanceOf(Date);
        });

        test('devrait générer des étapes selon le mode choisi', async () => {
            const balancedOptions: PathGenerationOptions = {
                targetLevel: 'A2',
                mode: 'balanced',
                intensity: 3
            };

            const comprehensiveOptions: PathGenerationOptions = {
                targetLevel: 'A2',
                mode: 'comprehensive',
                intensity: 3
            };

            const balancedPath = await service.generatePath('user1', mockProfile, balancedOptions);
            const comprehensivePath = await service.generatePath('user2', mockProfile, comprehensiveOptions);

            // Le mode comprehensive devrait avoir plus d'étapes
            expect(comprehensivePath.steps.length).toBeGreaterThan(balancedPath.steps.length);
        });

        test('devrait adapter l\'intensité du parcours', async () => {
            const lowIntensityOptions: PathGenerationOptions = {
                targetLevel: 'A2',
                intensity: 1
            };

            const highIntensityOptions: PathGenerationOptions = {
                targetLevel: 'A2',
                intensity: 5
            };

            const lowIntensityPath = await service.generatePath('user1', mockProfile, lowIntensityOptions);
            const highIntensityPath = await service.generatePath('user2', mockProfile, highIntensityOptions);

            // L'intensité élevée devrait générer plus d'étapes
            expect(highIntensityPath.steps.length).toBeGreaterThan(lowIntensityPath.steps.length);
        });

        test('devrait respecter les domaines de focus spécifiés', async () => {
            const options: PathGenerationOptions = {
                targetLevel: 'A2',
                focusAreas: ['basicVocabulary', 'simpleExpressions']
            };

            const path = await service.generatePath('test-user', mockProfile, options);

            expect(path.focusAreas).toEqual(['basicVocabulary', 'simpleExpressions']);

            // Au moins quelques étapes devraient cibler ces compétences
            const relevantSteps = path.steps.filter(step =>
                step.targetSkills.some(skill =>
                    ['basicVocabulary', 'simpleExpressions'].includes(skill)
                )
            );
            expect(relevantSteps.length).toBeGreaterThan(0);
        });

        test('devrait valider les paramètres d\'entrée', async () => {
            const invalidOptions: PathGenerationOptions = {
                targetLevel: 'INVALID' as CECRLLevel
            };

            await expect(
                service.generatePath('test-user', mockProfile, invalidOptions)
            ).rejects.toThrow('Niveau cible invalide');

            await expect(
                service.generatePath('', mockProfile, { targetLevel: 'A2' })
            ).rejects.toThrow('ID utilisateur requis');
        });

        test('devrait gérer les profils avec des données manquantes', async () => {
            const incompleteProfile = createMockUserProfile({
                weaknessAreas: [],
                strengthAreas: []
            });

            const options: PathGenerationOptions = {
                targetLevel: 'A2'
            };

            const path = await service.generatePath('test-user', incompleteProfile, options);

            expect(path).toBeDefined();
            expect(path.steps.length).toBeGreaterThan(0);
            expect(path.preferences.preferredExerciseTypes).toEqual([]);
        });
    });

    describe('getPath et getUserPaths', () => {
        test('devrait récupérer un parcours existant', async () => {
            const options: PathGenerationOptions = { targetLevel: 'A2' };
            const createdPath = await service.generatePath('test-user', mockProfile, options);

            const retrievedPath = service.getPath(createdPath.id);

            expect(retrievedPath).toBeDefined();
            expect(retrievedPath?.id).toBe(createdPath.id);
            expect(retrievedPath?.userId).toBe(createdPath.userId);
        });

        test('devrait retourner undefined pour un parcours inexistant', () => {
            const nonExistentPath = service.getPath('non-existent-id');
            expect(nonExistentPath).toBeUndefined();
        });

        test('devrait récupérer tous les parcours d\'un utilisateur', async () => {
            const options1: PathGenerationOptions = { targetLevel: 'A2' };
            const options2: PathGenerationOptions = { targetLevel: 'B1' };

            await service.generatePath('user1', mockProfile, options1);
            await service.generatePath('user1', mockProfile, options2);
            await service.generatePath('user2', mockProfile, options1);

            const user1Paths = service.getUserPaths('user1');
            const user2Paths = service.getUserPaths('user2');

            expect(user1Paths).toHaveLength(2);
            expect(user2Paths).toHaveLength(1);
            expect(user1Paths.every(path => path.userId === 'user1')).toBe(true);
        });
    });

    describe('completeStep', () => {
        let testPath: PersonalizedLearningPathModel;

        beforeEach(async () => {
            const options: PathGenerationOptions = { targetLevel: 'A2' };
            testPath = await service.generatePath('test-user', mockProfile, options);
        });

        test('devrait marquer une étape comme complétée et mettre à jour la progression', () => {
            const firstStep = testPath.steps[0];

            const updatedPath = service.completeStep(testPath.id, firstStep.id, true);

            expect(updatedPath).toBeDefined();
            expect(updatedPath?.overallProgress).toBeGreaterThan(0);

            const completedStep = updatedPath?.steps.find(step => step.id === firstStep.id);
            expect(completedStep?.status).toBe('completed');
        });

        test('devrait débloquer les étapes suivantes après completion', () => {
            const availableSteps = testPath.steps.filter(step => step.status === 'available');
            expect(availableSteps.length).toBeGreaterThan(0);

            const firstAvailableStep = availableSteps[0];
            service.completeStep(testPath.id, firstAvailableStep.id, true);

            const updatedPath = service.getPath(testPath.id);
            const newAvailableSteps = updatedPath?.steps.filter(step => step.status === 'available') || [];

            // Il devrait y avoir potentiellement de nouvelles étapes disponibles
            expect(newAvailableSteps.length).toBeGreaterThanOrEqual(availableSteps.length - 1);
        });

        test('devrait marquer le parcours comme terminé quand toutes les étapes sont complétées', () => {
            // Compléter toutes les étapes disponibles
            const availableSteps = testPath.steps.filter(step => step.status === 'available');

            let currentPath = testPath;
            for (const step of availableSteps) {
                const updated = service.completeStep(currentPath.id, step.id, true);
                if (updated) {
                    currentPath = updated;
                }
            }

            const finalPath = service.getPath(testPath.id);

            // Si toutes les étapes sont complétées, la progression devrait être à 1
            const allCompleted = finalPath?.steps.every(step => step.status === 'completed');
            if (allCompleted) {
                expect(finalPath?.overallProgress).toBe(1);
                expect(finalPath?.actualEndDate).toBeDefined();
            }
        });

        test('devrait retourner undefined pour un parcours inexistant', () => {
            const result = service.completeStep('non-existent-path', 'step-id', true);
            expect(result).toBeUndefined();
        });
    });

    describe('adaptPath', () => {
        let testPath: PersonalizedLearningPathModel;

        beforeEach(async () => {
            const options: PathGenerationOptions = { targetLevel: 'A2' };
            testPath = await service.generatePath('test-user', mockProfile, options);
        });

        test('devrait adapter le parcours selon les forces et faiblesses', async () => {
            const adaptedPath = await service.adaptPath(testPath.id, 'test-user');

            expect(adaptedPath).toBeDefined();
            expect(mockMetricsAnalyzer.identifyStrengthsAndWeaknesses).toHaveBeenCalledWith('test-user');

            // La date de mise à jour devrait être changée
            expect(adaptedPath?.updatedAt.getTime()).toBeGreaterThan(testPath.updatedAt.getTime());
        });

        test('devrait refuser l\'adaptation pour un utilisateur non autorisé', async () => {
            const result = await service.adaptPath(testPath.id, 'other-user');
            expect(result).toBeUndefined();
        });

        test('devrait retourner undefined pour un parcours inexistant', async () => {
            const result = await service.adaptPath('non-existent-path', 'test-user');
            expect(result).toBeUndefined();
        });
    });

    describe('getPathStatistics', () => {
        let testPath: PersonalizedLearningPathModel;

        beforeEach(async () => {
            const options: PathGenerationOptions = { targetLevel: 'A2' };
            testPath = await service.generatePath('test-user', mockProfile, options);
        });

        test('devrait générer des statistiques complètes', () => {
            const stats = service.getPathStatistics(testPath.id);

            expect(stats).toBeDefined();
            expect(stats?.totalSteps).toBe(testPath.steps.length);
            expect(stats?.completedSteps).toBe(0);
            expect(stats?.progress).toBe(0);
            expect(stats?.totalEstimatedDuration).toBeGreaterThan(0);
            expect(stats?.stepDistribution).toBeDefined();
            expect(stats?.statusDistribution).toBeDefined();
            expect(stats?.coveredSkills).toBeDefined();
        });

        test('devrait retourner undefined pour un parcours inexistant', () => {
            const stats = service.getPathStatistics('non-existent-path');
            expect(stats).toBeUndefined();
        });
    });

    describe('deletePath', () => {
        test('devrait supprimer un parcours existant', async () => {
            const options: PathGenerationOptions = { targetLevel: 'A2' };
            const path = await service.generatePath('test-user', mockProfile, options);

            const deleted = service.deletePath(path.id);
            expect(deleted).toBe(true);

            const retrievedPath = service.getPath(path.id);
            expect(retrievedPath).toBeUndefined();
        });

        test('devrait retourner false pour un parcours inexistant', () => {
            const deleted = service.deletePath('non-existent-path');
            expect(deleted).toBe(false);
        });
    });

    describe('cleanupCache', () => {
        test('devrait nettoyer les entrées expirées du cache', async () => {
            // Créer quelques parcours
            const options: PathGenerationOptions = { targetLevel: 'A2' };
            await service.generatePath('user1', mockProfile, options);
            await service.generatePath('user2', mockProfile, options);

            // Le cache devrait contenir des entrées
            expect(service.getUserPaths('user1')).toHaveLength(1);
            expect(service.getUserPaths('user2')).toHaveLength(1);

            // Le nettoyage ne devrait rien supprimer car les entrées sont récentes
            const removedCount = service.cleanupCache();
            expect(removedCount).toBe(0);
        });
    });
});

// ============================================================================
// TESTS DES UTILITAIRES
// ============================================================================

describe('PathFormatUtils', () => {
    describe('formatSkillName', () => {
        test('devrait formater les noms de compétences connues', () => {
            expect(PathFormatUtils.formatSkillName('basicVocabulary')).toBe('Vocabulaire de base');
            expect(PathFormatUtils.formatSkillName('recognition')).toBe('Reconnaissance des signes');
            expect(PathFormatUtils.formatSkillName('complexExpressions')).toBe('Expressions complexes');
        });

        test('devrait formater les noms génériques', () => {
            expect(PathFormatUtils.formatSkillName('customSkill')).toBe('Custom Skill');
            expect(PathFormatUtils.formatSkillName('userDefinedAbility')).toBe('User Defined Ability');
        });
    });

    describe('formatDuration', () => {
        test('devrait formater les durées correctement', () => {
            expect(PathFormatUtils.formatDuration(30)).toBe('30min');
            expect(PathFormatUtils.formatDuration(60)).toBe('1h');
            expect(PathFormatUtils.formatDuration(90)).toBe('1h 30min');
            expect(PathFormatUtils.formatDuration(120)).toBe('2h');
        });
    });

    describe('formatProgress', () => {
        test('devrait formater les pourcentages correctement', () => {
            expect(PathFormatUtils.formatProgress(0.5)).toBe('50,0%');
            expect(PathFormatUtils.formatProgress(0.756, 2)).toBe('75,60%');
            expect(PathFormatUtils.formatProgress(1)).toBe('100,0%');
        });
    });

    describe('formatDifficulty', () => {
        test('devrait formater les niveaux de difficulté', () => {
            expect(PathFormatUtils.formatDifficulty(0.1)).toBe('Très facile');
            expect(PathFormatUtils.formatDifficulty(0.3)).toBe('Facile');
            expect(PathFormatUtils.formatDifficulty(0.5)).toBe('Modéré');
            expect(PathFormatUtils.formatDifficulty(0.7)).toBe('Difficile');
            expect(PathFormatUtils.formatDifficulty(0.9)).toBe('Très difficile');
        });
    });
});

// ============================================================================
// TESTS DES FACTORY FUNCTIONS
// ============================================================================

describe('Factory Functions', () => {
    describe('createPersonalizedLearningPath', () => {
        test('devrait créer une instance configurée pour la production', () => {
            const service = createPersonalizedLearningPath();
            expect(service).toBeInstanceOf(PersonalizedLearningPath);
        });

        test('devrait accepter les dépendances optionnelles', () => {
            const mockCollector = createMockMetricsCollector();
            const mockAnalyzer = createMockMetricsAnalyzer();

            const service = createPersonalizedLearningPath(
                mockCollector as unknown as LearningMetricsCollector,
                mockAnalyzer as unknown as MetricsAnalyzer
            );

            expect(service).toBeInstanceOf(PersonalizedLearningPath);
        });
    });

    describe('createPersonalizedLearningPathForTest', () => {
        test('devrait créer une instance configurée pour les tests', () => {
            const service = createPersonalizedLearningPathForTest();
            expect(service).toBeInstanceOf(PersonalizedLearningPath);
        });
    });
});

// ============================================================================
// TESTS DES UTILITAIRES RAPIDES
// ============================================================================

describe('Quick Utilities', () => {
    describe('quickValidatePathOptions', () => {
        test('devrait valider des options correctes', () => {
            const validOptions: PathGenerationOptions = {
                targetLevel: 'A2',
                mode: 'balanced',
                intensity: 3
            };

            expect(quickValidatePathOptions(validOptions)).toBe(true);
        });

        test('devrait rejeter des options incorrectes', () => {
            const invalidOptions: PathGenerationOptions = {
                targetLevel: 'INVALID' as CECRLLevel,
                mode: 'invalid' as PathGenerationMode,
                intensity: 10
            };

            expect(quickValidatePathOptions(invalidOptions)).toBe(false);
        });
    });

    describe('estimatePathDuration', () => {
        test('devrait estimer les durées correctement', () => {
            const duration = estimatePathDuration('A1', 'A2', 3);
            expect(duration).toBeGreaterThan(0);
            expect(typeof duration).toBe('number');

            // Une intensité plus élevée devrait réduire la durée
            const highIntensityDuration = estimatePathDuration('A1', 'A2', 5);
            expect(highIntensityDuration).toBeLessThan(duration);
        });

        test('devrait gérer les niveaux invalides', () => {
            const duration = estimatePathDuration('A2', 'A1', 3); // Ordre inverse
            expect(duration).toBe(LEARNING_PATH_CONSTANTS.DEFAULT_LEVEL_DURATIONS.A1);
        });
    });

    describe('generateUniquePathId', () => {
        test('devrait générer des identifiants uniques', () => {
            const id1 = generateUniquePathId('user1');
            const id2 = generateUniquePathId('user1');

            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^path-user1-\d+-\d+$/);
        });

        test('devrait accepter un préfixe personnalisé', () => {
            const id = generateUniquePathId('user1', 'custom');
            expect(id).toMatch(/^custom-user1-\d+-\d+$/);
        });
    });
});

// ============================================================================
// TESTS D'INTÉGRATION
// ============================================================================

describe('Integration Tests', () => {
    test('devrait fonctionner de bout en bout : créer -> progresser -> adapter', async () => {
        const service = createPersonalizedLearningPathForTest();
        const profile = createMockUserProfile();
        const options = EXAMPLE_PATH_OPTIONS.beginner;

        // 1. Créer un parcours
        const path = await service.generatePath('integration-user', profile, options);
        expect(path).toBeDefined();
        expect(path.steps.length).toBeGreaterThan(0);

        // 2. Compléter une étape
        const firstAvailableStep = path.steps.find(step => step.status === 'available');
        expect(firstAvailableStep).toBeDefined();

        const updatedPath = service.completeStep(path.id, firstAvailableStep!.id, true);
        expect(updatedPath?.overallProgress).toBeGreaterThan(0);

        // 3. Adapter le parcours
        const adaptedPath = await service.adaptPath(path.id, 'integration-user');
        expect(adaptedPath).toBeDefined();

        // 4. Obtenir des statistiques
        const stats = service.getPathStatistics(path.id);
        expect(stats?.completedSteps).toBe(1);
        expect(stats?.totalSteps).toBe(path.steps.length);

        // 5. Nettoyer
        const deleted = service.deletePath(path.id);
        expect(deleted).toBe(true);
    });

    test('devrait gérer plusieurs utilisateurs simultanément', async () => {
        const service = createPersonalizedLearningPathForTest();
        const profile = createMockUserProfile();

        // Créer des parcours pour plusieurs utilisateurs
        const users = ['user1', 'user2', 'user3'];
        const paths = await Promise.all(
            users.map(userId =>
                service.generatePath(userId, profile, EXAMPLE_PATH_OPTIONS.beginner)
            )
        );

        expect(paths).toHaveLength(3);
        expect(paths.every(path => path.steps.length > 0)).toBe(true);

        // Vérifier l'isolation des données utilisateur
        for (let i = 0; i < users.length; i++) {
            const userPaths = service.getUserPaths(users[i]);
            expect(userPaths).toHaveLength(1);
            expect(userPaths[0].userId).toBe(users[i]);
        }
    });
});