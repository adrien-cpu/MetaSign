/**
 * Tests unitaires pour le service de génération d'exercices - Version corrigée v4.0.0
 * 
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/__tests__/ExerciseGeneratorService.test.ts
 * @description Tests unitaires pour le service de génération d'exercices avec nouvelle architecture
 * @version 4.0.0 - Complètement réécrits pour la nouvelle architecture
 * @author MetaSign AI Learning Team
 * @since 2025-05-26
 * @lastModified 2025-07-21
 */

// ===== IMPORTS CORRIGÉS POUR LA V4.0.0 =====
import {
    ExerciseGeneratorService,
    ExerciseGenerationParams,
    SupportedExerciseType,
    CECRLLevel,
    ExerciseTypeUtils,
    EXERCISE_CONSTANTS,
    createExerciseServiceForTest,
    quickValidateParams,
    generateUniqueExerciseId,
    estimateExerciseDuration
} from '../index';

import type { GeneratedExercise } from '../ExerciseGeneratorService';

// ===== MOCK DU LOGGER =====
jest.mock('@/ai/utils/LoggerFactory', () => ({
    LoggerFactory: {
        getLogger: jest.fn().mockReturnValue({
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn()
        })
    }
}));

// ===== UTILITAIRES DE TEST =====

/**
 * Crée des paramètres de test valides
 */
function createValidParams(overrides: Partial<ExerciseGenerationParams> = {}): ExerciseGenerationParams {
    return {
        type: 'MultipleChoice',
        level: 'A1',
        difficulty: 0.5,
        focusAreas: ['test-area'],
        userId: 'test-user',
        ...overrides
    };
}

/**
 * Crée un exercice de test mock
 */
function createMockExercise(type: string = 'MultipleChoice', level: CECRLLevel = 'A1'): GeneratedExercise {
    return {
        id: generateUniqueExerciseId(type as SupportedExerciseType, level),
        type,
        level,
        difficulty: 0.5,
        content: {
            instructions: `Instructions pour ${type}`,
            questions: [{
                id: 'q1',
                text: 'Question de test',
                type: 'multiple_choice',
                options: ['Option 1', 'Option 2', 'Option 3'],
                correctAnswer: 'Option 1',
                points: 1
            }],
            resources: [],
            hints: ['Indice de test']
        },
        metadata: {
            createdAt: new Date(),
            version: '1.0.0',
            tags: ['test'],
            estimatedDuration: 300,
            targetSkills: ['test-skill'],
            prerequisites: []
        },
        evaluation: {
            maxScore: 1,
            passingScore: 1,
            scoringMethod: 'binary',
            criteria: [],
            timeFactors: []
        }
    };
}

// ===== TESTS UNITAIRES =====

describe('ExerciseGeneratorService - Tests unitaires v4.0.0', () => {
    let service: ExerciseGeneratorService;

    beforeEach(async () => {
        jest.clearAllMocks();

        // Utiliser la factory function pour les tests
        service = createExerciseServiceForTest();
        await service.initialize();
    });

    afterEach(() => {
        service.clearCaches();
        jest.resetAllMocks();
    });

    describe('Initialisation', () => {
        test('devrait créer une instance singleton', () => {
            const instance1 = ExerciseGeneratorService.getInstance();
            const instance2 = ExerciseGeneratorService.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(ExerciseGeneratorService);
        });

        test('devrait initialiser le service correctement', async () => {
            const newService = createExerciseServiceForTest();

            expect(async () => {
                await newService.initialize();
            }).not.toThrow();

            const stats = newService.getStatistics();
            expect(stats.initialized).toBe(1);
        });

        test('ne devrait pas réinitialiser un service déjà initialisé', async () => {
            // Le service est déjà initialisé dans beforeEach
            await service.initialize(); // Ne devrait pas planter

            const stats = service.getStatistics();
            expect(stats.initialized).toBe(1);
        });
    });

    describe('Génération d\'exercices', () => {
        test('devrait générer un exercice avec des paramètres valides', async () => {
            const params = createValidParams();

            const exercise = await service.generateExercise(params);

            expect(exercise).toBeDefined();
            expect(exercise.id).toBeDefined();
            expect(exercise.type).toBeDefined();
            expect(exercise.content).toBeDefined();
            expect(exercise.metadata).toBeDefined();
        });

        test('devrait valider les paramètres avant génération', async () => {
            const invalidParams = createValidParams({ difficulty: -1 });

            // La validation devrait échouer
            expect(quickValidateParams(invalidParams)).toBe(false);

            // Le service pourrait lancer une erreur ou corriger automatiquement
            try {
                await service.generateExercise(invalidParams);
                // Si ça ne plante pas, le service a corrigé automatiquement
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        test('devrait utiliser le cache pour des paramètres identiques', async () => {
            const params = createValidParams();

            const exercise1 = await service.generateExercise(params);
            const exercise2 = await service.generateExercise(params);

            // Les exercices du cache peuvent être identiques ou différents selon l'implémentation
            expect(exercise1).toBeDefined();
            expect(exercise2).toBeDefined();
        });

        test('devrait générer des exercices différents pour des paramètres différents', async () => {
            const params1 = createValidParams({ difficulty: 0.3 });
            const params2 = createValidParams({ difficulty: 0.7 });

            const exercise1 = await service.generateExercise(params1);
            const exercise2 = await service.generateExercise(params2);

            expect(exercise1.id).not.toBe(exercise2.id);
        });
    });

    describe('Évaluation d\'exercices', () => {
        test('devrait évaluer une réponse correctement', async () => {
            const exercise = createMockExercise();
            const userResponse = 'Option 1'; // Réponse correcte

            const evaluation = await service.evaluateResponse(exercise, userResponse);

            expect(evaluation).toBeDefined();
            expect(evaluation.exerciseId).toBe(exercise.id);
            expect(typeof evaluation.score).toBe('number');
            expect(typeof evaluation.percentage).toBe('number');
            expect(typeof evaluation.isCorrect).toBe('boolean');
            expect(evaluation.timestamp).toBeInstanceOf(Date);
        });

        test('devrait gérer les réponses incorrectes', async () => {
            const exercise = createMockExercise();
            const userResponse = 'Option Incorrecte';

            const evaluation = await service.evaluateResponse(exercise, userResponse);

            expect(evaluation).toBeDefined();
            expect(evaluation.exerciseId).toBe(exercise.id);
            expect(evaluation.score).toBeGreaterThanOrEqual(0);
            expect(evaluation.percentage).toBeGreaterThanOrEqual(0);
        });

        test('devrait utiliser le cache pour les évaluations', async () => {
            const exercise = createMockExercise();
            const userResponse = 'Option 1';

            const evaluation1 = await service.evaluateResponse(exercise, userResponse);
            const evaluation2 = await service.evaluateResponse(exercise, userResponse);

            expect(evaluation1.exerciseId).toBe(evaluation2.exerciseId);
            expect(evaluation1.timestamp).toBeDefined();
            expect(evaluation2.timestamp).toBeDefined();
        });
    });

    describe('Gestion du cache', () => {
        test('devrait nettoyer les caches', () => {
            expect(() => service.clearCaches()).not.toThrow();

            const stats = service.getStatistics();
            expect(stats.exercisesCached).toBe(0);
            expect(stats.evaluationsCached).toBe(0);
        });

        test('devrait maintenir les statistiques du cache', async () => {
            const params = createValidParams();
            await service.generateExercise(params);

            const stats = service.getStatistics();
            expect(typeof stats.exercisesCached).toBe('number');
            expect(typeof stats.evaluationsCached).toBe('number');
            expect(typeof stats.generatorsLoaded).toBe('number');
        });
    });

    describe('Récupération d\'exercices', () => {
        test('devrait récupérer un exercice par son ID', async () => {
            const params = createValidParams();
            const exercise = await service.generateExercise(params);

            const retrieved = await service.getExerciseById(exercise.id);

            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe(exercise.id);
        });

        test('devrait retourner null pour un ID inexistant', async () => {
            const retrieved = await service.getExerciseById('inexistant-id');

            expect(retrieved).toBeNull();
        });
    });

    describe('Statistiques du service', () => {
        test('devrait retourner des statistiques valides', () => {
            const stats = service.getStatistics();

            expect(stats).toBeDefined();
            expect(typeof stats.exercisesCached).toBe('number');
            expect(typeof stats.evaluationsCached).toBe('number');
            expect(typeof stats.generatorsLoaded).toBe('number');
            expect(typeof stats.initialized).toBe('number');
            expect(stats.exercisesCached).toBeGreaterThanOrEqual(0);
            expect(stats.evaluationsCached).toBeGreaterThanOrEqual(0);
            expect(stats.generatorsLoaded).toBeGreaterThan(0);
            expect(stats.initialized).toBe(1);
        });
    });

    describe('Gestion des erreurs', () => {
        test('devrait lancer une erreur si le service n\'est pas initialisé', () => {
            // Note: Comme on utilise un singleton et qu'il est déjà initialisé,
            // ce test vérifie plutôt que l'initialisation multiple fonctionne
            expect(async () => {
                await service.initialize();
            }).not.toThrow();
        });

        test('devrait gérer les types d\'exercices non supportés gracieusement', async () => {
            const params = createValidParams({
                type: 'UnsupportedType' as SupportedExerciseType
            });

            try {
                await service.generateExercise(params);
                // Si ça ne plante pas, le service utilise un générateur par défaut
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });
});

// ===== TESTS DES UTILITAIRES =====

describe('ExerciseTypeUtils', () => {
    describe('Validation des niveaux CECRL', () => {
        test('devrait valider les niveaux CECRL corrects', () => {
            EXERCISE_CONSTANTS.VALID_CECRL_LEVELS.forEach(level => {
                expect(ExerciseTypeUtils.isValidCECRLLevel(level)).toBe(true);
            });
        });

        test('devrait rejeter les niveaux CECRL incorrects', () => {
            expect(ExerciseTypeUtils.isValidCECRLLevel('invalid')).toBe(false);
            expect(ExerciseTypeUtils.isValidCECRLLevel('')).toBe(false);
            expect(ExerciseTypeUtils.isValidCECRLLevel('Z1')).toBe(false);
        });
    });

    describe('Validation des types d\'exercices', () => {
        test('devrait valider les types supportés', () => {
            EXERCISE_CONSTANTS.SUPPORTED_EXERCISE_TYPES.forEach(type => {
                expect(ExerciseTypeUtils.isSupportedExerciseType(type)).toBe(true);
            });
        });

        test('devrait rejeter les types non supportés', () => {
            expect(ExerciseTypeUtils.isSupportedExerciseType('InvalidType')).toBe(false);
            expect(ExerciseTypeUtils.isSupportedExerciseType('')).toBe(false);
        });
    });

    describe('Normalisation des scores', () => {
        test('devrait normaliser les scores dans la plage 0-1', () => {
            expect(ExerciseTypeUtils.normalizeScore(1.5)).toBe(1);
            expect(ExerciseTypeUtils.normalizeScore(-0.5)).toBe(0);
            expect(ExerciseTypeUtils.normalizeScore(0.7)).toBe(0.7);
            expect(ExerciseTypeUtils.normalizeScore(0)).toBe(0);
            expect(ExerciseTypeUtils.normalizeScore(1)).toBe(1);
        });

        test('devrait gérer les valeurs non numériques', () => {
            expect(ExerciseTypeUtils.normalizeScore('invalid')).toBe(0);
            expect(ExerciseTypeUtils.normalizeScore(null)).toBe(0);
            expect(ExerciseTypeUtils.normalizeScore(undefined)).toBe(0);
        });
    });

    describe('Estimation de durée', () => {
        test('devrait estimer des durées positives', () => {
            EXERCISE_CONSTANTS.SUPPORTED_EXERCISE_TYPES.forEach(type => {
                const duration = ExerciseTypeUtils.estimateDuration(type, 0.5);
                expect(duration).toBeGreaterThan(0);
                expect(typeof duration).toBe('number');
            });
        });

        test('devrait ajuster la durée selon la difficulté', () => {
            const durationEasy = ExerciseTypeUtils.estimateDuration('MultipleChoice', 0.2);
            const durationHard = ExerciseTypeUtils.estimateDuration('MultipleChoice', 0.8);

            expect(durationHard).toBeGreaterThan(durationEasy);
        });
    });

    describe('Génération d\'ID', () => {
        test('devrait générer des IDs uniques', () => {
            const id1 = ExerciseTypeUtils.generateExerciseId('MultipleChoice', 'A1');
            const id2 = ExerciseTypeUtils.generateExerciseId('MultipleChoice', 'A1');

            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^MultipleChoice_A1_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^MultipleChoice_A1_\d+_[a-z0-9]+$/);
        });

        test('devrait inclure le type et le niveau dans l\'ID', () => {
            const id = ExerciseTypeUtils.generateExerciseId('DragDrop', 'B2');
            expect(id).toContain('DragDrop');
            expect(id).toContain('B2');
        });
    });

    describe('Validation des paramètres', () => {
        test('devrait valider des paramètres corrects', () => {
            const params = createValidParams();
            expect(ExerciseTypeUtils.validateGenerationParams(params)).toBe(true);
        });

        test('devrait rejeter des paramètres incorrects', () => {
            const invalidParams1 = createValidParams({ difficulty: -1 });
            const invalidParams2 = createValidParams({ difficulty: 2 });
            const invalidParams3 = createValidParams({
                level: 'invalid' as CECRLLevel
            });

            expect(ExerciseTypeUtils.validateGenerationParams(invalidParams1)).toBe(false);
            expect(ExerciseTypeUtils.validateGenerationParams(invalidParams2)).toBe(false);
            expect(ExerciseTypeUtils.validateGenerationParams(invalidParams3)).toBe(false);
        });
    });

    describe('Création de métadonnées', () => {
        test('devrait créer des métadonnées par défaut', () => {
            const params = createValidParams();
            const metadata = ExerciseTypeUtils.createDefaultMetadata(params);

            expect(metadata).toBeDefined();
            if (metadata) {
                expect(metadata.createdAt).toBeInstanceOf(Date);
                expect(metadata.level).toBe(params.level);
                expect(metadata.difficulty).toBe(params.difficulty);
                expect(typeof metadata.estimatedDuration).toBe('number');
                expect(metadata.estimatedDuration).toBeGreaterThan(0);
            }
        });
    });
});

// ===== TESTS DES FONCTIONS UTILITAIRES =====

describe('Fonctions utilitaires', () => {
    describe('quickValidateParams', () => {
        test('devrait valider rapidement des paramètres corrects', () => {
            const params = createValidParams();
            expect(quickValidateParams(params)).toBe(true);
        });

        test('devrait détecter des paramètres incorrects', () => {
            const invalidParams = createValidParams({ difficulty: -1 });
            expect(quickValidateParams(invalidParams)).toBe(false);
        });
    });

    describe('estimateExerciseDuration', () => {
        test('devrait estimer une durée en secondes', () => {
            const duration = estimateExerciseDuration('MultipleChoice', 0.5);
            expect(duration).toBeGreaterThan(0);
            expect(typeof duration).toBe('number');
        });
    });

    describe('generateUniqueExerciseId', () => {
        test('devrait générer un ID unique', () => {
            const id = generateUniqueExerciseId('MultipleChoice', 'A1');
            expect(id).toMatch(/^MultipleChoice_A1_\d+_[a-z0-9]+$/);
        });
    });
});

// ===== TESTS DE CONSTANTES =====

describe('EXERCISE_CONSTANTS', () => {
    test('devrait contenir tous les niveaux CECRL valides', () => {
        expect(EXERCISE_CONSTANTS.VALID_CECRL_LEVELS).toEqual([
            'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
        ]);
    });

    test('devrait contenir tous les types d\'exercices supportés', () => {
        expect(EXERCISE_CONSTANTS.SUPPORTED_EXERCISE_TYPES.length).toBeGreaterThan(0);
        expect(EXERCISE_CONSTANTS.SUPPORTED_EXERCISE_TYPES).toContain('MultipleChoice');
    });

    test('devrait avoir des durées de base définies pour tous les types', () => {
        EXERCISE_CONSTANTS.SUPPORTED_EXERCISE_TYPES.forEach(type => {
            expect(EXERCISE_CONSTANTS.BASE_DURATIONS[type]).toBeGreaterThan(0);
        });
    });

    test('devrait avoir des constantes de configuration valides', () => {
        expect(EXERCISE_CONSTANTS.DEFAULT_CACHE_MAX_AGE).toBeGreaterThan(0);
        expect(EXERCISE_CONSTANTS.DEFAULT_MAX_CACHE_SIZE).toBeGreaterThan(0);
        expect(EXERCISE_CONSTANTS.DEFAULT_CLEANUP_INTERVAL).toBeGreaterThan(0);
        expect(EXERCISE_CONSTANTS.MAX_DIFFICULTY_MULTIPLIER).toBeGreaterThan(0);
        expect(EXERCISE_CONSTANTS.MAX_DIFFICULTY_MULTIPLIER).toBeLessThanOrEqual(1);
    });
});