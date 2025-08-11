/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/generators/__tests__/MultipleChoiceGenerator.test.ts
 * @description Tests unitaires pour le générateur d'exercices à choix multiples en LSF
 * @version 2.1.0
 * @author MetaSign AI Learning Team
 * @since 2025-05-26
 * @lastModified 2025-05-27
 */

import { MultipleChoiceGenerator, MultipleChoiceGeneratorParams, MultipleChoiceExercise } from '../MultipleChoiceGenerator';
import { ConceptsDataService, LSFConcept, ConceptSearchCriteria } from '../../services/ConceptsDataService';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Interface pour le mock du service de concepts avec toutes les méthodes nécessaires
 */
interface MockedConceptsDataService {
    getConceptsByIds: jest.MockedFunction<(ids: readonly string[]) => Promise<readonly LSFConcept[]>>;
    searchConcepts: jest.MockedFunction<(criteria: ConceptSearchCriteria) => Promise<readonly LSFConcept[]>>;
    getConceptDetails: jest.MockedFunction<(id: string) => Promise<{ explanation?: string } | null>>;
    getConceptIds: jest.MockedFunction<() => Promise<readonly string[]>>;
    getRandomExample: jest.MockedFunction<(conceptId: string) => Promise<string | null>>;
    getInstance: jest.MockedFunction<() => MockedConceptsDataService>;
}

/**
 * Interface pour le mock du logger
 */
interface MockedLogger {
    info: jest.MockedFunction<(message: string, meta?: Record<string, unknown>) => void>;
    debug: jest.MockedFunction<(message: string, meta?: Record<string, unknown>) => void>;
    error: jest.MockedFunction<(message: string, meta?: Record<string, unknown>) => void>;
    warn: jest.MockedFunction<(message: string, meta?: Record<string, unknown>) => void>;
}

// Créer le mock instance avant les mocks de modules
const createMockConceptsDataService = (): MockedConceptsDataService => ({
    getConceptsByIds: jest.fn(),
    searchConcepts: jest.fn(),
    getConceptDetails: jest.fn(),
    getConceptIds: jest.fn(),
    getRandomExample: jest.fn(),
    getInstance: jest.fn()
});

// Mock du ConceptsDataService avec pattern Singleton
jest.mock('../../services/ConceptsDataService', () => {
    const mockInstance = createMockConceptsDataService();

    // Mock de la classe avec getInstance static
    const MockConceptsDataService = {
        getInstance: jest.fn().mockReturnValue(mockInstance)
    };

    // Le mock instance se retourne lui-même pour getInstance
    mockInstance.getInstance.mockReturnValue(mockInstance);

    return {
        ConceptsDataService: MockConceptsDataService
    };
});

// Mock du LoggerFactory
jest.mock('@/ai/utils/LoggerFactory', () => {
    const mockLogger: MockedLogger = {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
    };

    return {
        LoggerFactory: {
            getLogger: jest.fn().mockReturnValue(mockLogger)
        }
    };
});

describe('MultipleChoiceGenerator', () => {
    let generator: MultipleChoiceGenerator;
    let mockConceptsService: MockedConceptsDataService;
    let mockLogger: MockedLogger;

    // Données de test pour les concepts LSF avec toutes les propriétés requises
    const mockConcepts: LSFConcept[] = [
        {
            id: 'concept-bonjour',
            text: 'Bonjour',
            categories: ['salutations', 'politesse'],
            level: 'A1',
            videoUrl: '/videos/lsf/bonjour.mp4',
            imageUrl: '/images/lsf/bonjour.jpg',
            relatedConcepts: ['bonsoir', 'salut'],
            difficulty: 0.2,
            frequency: 95,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-15')
        },
        {
            id: 'concept-merci',
            text: 'Merci',
            categories: ['politesse', 'expressions-courantes'],
            level: 'A1',
            videoUrl: '/videos/lsf/merci.mp4',
            imageUrl: '/images/lsf/merci.jpg',
            relatedConcepts: ['sil-vous-plait', 'excusez-moi'],
            difficulty: 0.1,
            frequency: 90,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-10')
        },
        {
            id: 'concept-aurevoir',
            text: 'Au revoir',
            categories: ['salutations'],
            level: 'A1',
            videoUrl: '/videos/lsf/aurevoir.mp4',
            imageUrl: '/images/lsf/aurevoir.jpg',
            relatedConcepts: ['bonjour', 'bonsoir'],
            difficulty: 0.3,
            frequency: 80,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-20')
        },
        {
            id: 'concept-famille',
            text: 'Famille',
            categories: ['famille', 'relations'],
            level: 'A2',
            videoUrl: '/videos/lsf/famille.mp4',
            imageUrl: '/images/lsf/famille.jpg',
            relatedConcepts: ['mère', 'père', 'enfant'],
            difficulty: 0.4,
            frequency: 75,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-25')
        },
        {
            id: 'concept-emotions',
            text: 'Émotions',
            categories: ['emotions', 'sentiments'],
            level: 'B1',
            videoUrl: '/videos/lsf/emotions.mp4',
            relatedConcepts: ['joie', 'tristesse', 'colère'],
            difficulty: 0.6,
            frequency: 60,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-02-01')
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Récupérer l'instance mockée du service
        mockConceptsService = ConceptsDataService.getInstance() as unknown as MockedConceptsDataService;

        // Configuration des méthodes mockées avec des valeurs par défaut
        mockConceptsService.searchConcepts.mockResolvedValue(mockConcepts.slice(0, 3)); // Retourne les 3 premiers
        mockConceptsService.getConceptsByIds.mockResolvedValue(mockConcepts.slice(0, 2)); // Retourne les 2 premiers
        mockConceptsService.getConceptDetails.mockResolvedValue({
            explanation: 'Signe important en LSF pour les interactions sociales et l\'apprentissage.'
        });
        mockConceptsService.getConceptIds.mockResolvedValue(mockConcepts.map(c => c.id));
        mockConceptsService.getRandomExample.mockResolvedValue('Exemple d\'utilisation du signe en contexte.');

        // Configuration du mock Logger
        mockLogger = LoggerFactory.getLogger('MultipleChoiceGenerator') as MockedLogger;

        // Création de l'instance du générateur en passant le service mocké
        generator = new MultipleChoiceGenerator(mockConceptsService as unknown as ConceptsDataService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('Génération d\'exercices basiques', () => {
        test('génère un exercice à choix multiples avec le format correct', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                questionType: 'text',
                answerType: 'text',
                optionCount: 4,
                userId: 'test-user-123'
            };

            // Action
            const exercise = await generator.generate(params);

            // Assertions générales
            expect(exercise).toBeDefined();
            expect(exercise.id).toBeDefined();
            expect(typeof exercise.id).toBe('string');
            expect(exercise.id).toMatch(/^mc-\d+-\d+$/);

            // Vérification de la question
            expect(exercise.question).toBeDefined();
            expect(typeof exercise.question).toBe('string');
            expect(exercise.question.length).toBeGreaterThan(0);

            // Vérification des options
            expect(exercise.options).toBeDefined();
            expect(Array.isArray(exercise.options)).toBe(true);
            expect(exercise.options.length).toBe(4);

            // Vérification du format des options
            let correctOptionsCount = 0;
            exercise.options.forEach(option => {
                expect(option.id).toBeDefined();
                expect(typeof option.id).toBe('string');
                expect(option.id).toMatch(/^opt-\d+-\d+$/);

                expect(option.text).toBeDefined();
                expect(typeof option.text).toBe('string');
                expect(option.text.length).toBeGreaterThan(0);

                expect(typeof option.isCorrect).toBe('boolean');

                if (option.isCorrect) {
                    correctOptionsCount++;
                }
            });

            // Une seule option correcte
            expect(correctOptionsCount).toBe(1);

            // Vérification des métadonnées
            expect(exercise.difficulty).toBe(0.5);
            expect(exercise.level).toBe('A1');
            expect(Array.isArray(exercise.skills)).toBe(true);
            expect(exercise.skills.length).toBeGreaterThan(0);
            expect(Array.isArray(exercise.tags)).toBe(true);
            expect(exercise.tags).toContain('multiple-choice');
            expect(exercise.tags).toContain('A1');

            // Vérification de l'explication
            expect(exercise.explanation).toBeDefined();
            expect(typeof exercise.explanation).toBe('string');
        });

        test('génère des exercices avec différents types de questions', async () => {
            // Test avec question vidéo
            const videoParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.3,
                questionType: 'video',
                answerType: 'text',
                userId: 'test-user-123'
            };

            const videoExercise = await generator.generate(videoParams);
            expect(videoExercise.questionVideoUrl).toBeDefined();
            expect(videoExercise.tags).toContain('question-video');

            // Test avec question image
            const imageParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.3,
                questionType: 'image',
                answerType: 'text',
                userId: 'test-user-123'
            };

            const imageExercise = await generator.generate(imageParams);
            expect(imageExercise.questionImageUrl).toBeDefined();
            expect(imageExercise.tags).toContain('question-image');
        });

        test('génère des exercices avec différents types de réponses', async () => {
            // Test avec réponses vidéo
            const videoAnswerParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.3,
                questionType: 'text',
                answerType: 'video',
                userId: 'test-user-123'
            };

            const videoAnswerExercise = await generator.generate(videoAnswerParams);
            const hasVideoOptions = videoAnswerExercise.options.some(option => option.videoUrl);
            expect(hasVideoOptions).toBe(true);
            expect(videoAnswerExercise.tags).toContain('answer-video');

            // Test avec réponses image
            const imageAnswerParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.3,
                questionType: 'text',
                answerType: 'image',
                userId: 'test-user-123'
            };

            const imageAnswerExercise = await generator.generate(imageAnswerParams);
            const hasImageOptions = imageAnswerExercise.options.some(option => option.imageUrl);
            expect(hasImageOptions).toBe(true);
            expect(imageAnswerExercise.tags).toContain('answer-image');
        });
    });

    describe('Adaptation selon les paramètres', () => {
        test('adapte le nombre d\'options selon le paramètre optionCount', async () => {
            // Test avec 3 options
            const params3Options: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                optionCount: 3,
                userId: 'test-user-123'
            };

            const exercise3 = await generator.generate(params3Options);
            expect(exercise3.options.length).toBe(3);

            // Test avec 5 options
            const params5Options: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                optionCount: 5,
                userId: 'test-user-123'
            };

            const exercise5 = await generator.generate(params5Options);
            expect(exercise5.options.length).toBe(5);
        });

        test('adapte les compétences selon le niveau CECRL', async () => {
            // Mock spécifique pour les niveaux différents
            mockConceptsService.searchConcepts
                .mockResolvedValueOnce(mockConcepts.filter(c => c.level === 'A1'))
                .mockResolvedValueOnce(mockConcepts.filter(c => c.level === 'B1'));

            // Test niveau A1
            const paramsA1: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.3,
                userId: 'test-user-123'
            };

            const exerciseA1 = await generator.generate(paramsA1);
            expect(exerciseA1.skills).toContain('basicVocabulary');
            expect(exerciseA1.skills).toContain('recognition');

            // Test niveau B1
            const paramsB1: MultipleChoiceGeneratorParams = {
                level: 'B1',
                difficulty: 0.7,
                userId: 'test-user-123'
            };

            const exerciseB1 = await generator.generate(paramsB1);
            expect(exerciseB1.skills).toContain('intermediateVocabulary');
            expect(exerciseB1.skills).toContain('recognition');
        });

        test('utilise les domaines de focus spécifiés', async () => {
            // Test avec domaines de focus
            const paramsWithFocus: MultipleChoiceGeneratorParams = {
                level: 'A2',
                difficulty: 0.4,
                focusAreas: ['emotions', 'family'],
                userId: 'test-user-123'
            };

            const exerciseWithFocus = await generator.generate(paramsWithFocus);

            // Vérifier que le service a été appelé avec les bonnes catégories
            expect(mockConceptsService.searchConcepts).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: 'A2',
                    categories: ['emotions', 'family']
                })
            );

            // Vérifier que l'exercice a bien été généré
            expect(exerciseWithFocus).toBeDefined();
            expect(exerciseWithFocus.level).toBe('A2');
        });

        test('utilise des concepts spécifiés quand fournis', async () => {
            // Test avec concepts spécifiques
            const conceptIds = ['concept-bonjour', 'concept-merci'];
            const paramsWithConcepts: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.4,
                conceptIds,
                userId: 'test-user-123'
            };

            await generator.generate(paramsWithConcepts);

            // Vérifier que getConceptsByIds a été appelé au lieu de searchConcepts
            expect(mockConceptsService.getConceptsByIds).toHaveBeenCalledWith(conceptIds);
            expect(mockConceptsService.searchConcepts).not.toHaveBeenCalled();
        });
    });

    describe('Évaluation des réponses', () => {
        test('évalue correctement une réponse juste', () => {
            // Arrangement - Créer un exercice de test
            const testExercise: MultipleChoiceExercise = {
                id: 'test-exercise',
                question: 'Comment signer "bonjour" ?',
                options: [
                    { id: 'opt-1', text: 'Main droite vers le haut', isCorrect: true },
                    { id: 'opt-2', text: 'Main gauche vers le bas', isCorrect: false },
                    { id: 'opt-3', text: 'Deux mains jointes', isCorrect: false }
                ],
                explanation: 'Le signe pour "bonjour" se fait avec la main droite.',
                difficulty: 0.3,
                skills: ['basicVocabulary', 'recognition'],
                level: 'A1',
                tags: ['multiple-choice', 'salutations']
            };

            // Action - Évaluer une réponse correcte (SYNCHRONE)
            const result = generator.evaluate(testExercise, 'opt-1');

            // Assertions
            expect(result.correct).toBe(true);
            expect(result.score).toBe(1);
            expect(result.explanation).toBe(testExercise.explanation);
            expect(result.details).toBeDefined();
            expect(result.details['basicVocabulary']).toBe(1);
            expect(result.details['recognition']).toBe(1);
        });

        test('évalue correctement une réponse fausse', () => {
            // Arrangement - Même exercice que précédemment
            const testExercise: MultipleChoiceExercise = {
                id: 'test-exercise',
                question: 'Comment signer "bonjour" ?',
                options: [
                    { id: 'opt-1', text: 'Main droite vers le haut', isCorrect: true },
                    { id: 'opt-2', text: 'Main gauche vers le bas', isCorrect: false },
                    { id: 'opt-3', text: 'Deux mains jointes', isCorrect: false }
                ],
                explanation: 'Le signe pour "bonjour" se fait avec la main droite.',
                difficulty: 0.3,
                skills: ['basicVocabulary', 'recognition'],
                level: 'A1',
                tags: ['multiple-choice', 'salutations']
            };

            // Action - Évaluer une réponse incorrecte (SYNCHRONE)
            const result = generator.evaluate(testExercise, 'opt-2');

            // Assertions
            expect(result.correct).toBe(false);
            expect(result.score).toBe(0);
            expect(result.explanation).toBe(testExercise.explanation);
            expect(result.details['basicVocabulary']).toBe(0);
            expect(result.details['recognition']).toBe(0);
        });

        test('gère les réponses invalides', () => {
            // Arrangement
            const testExercise: MultipleChoiceExercise = {
                id: 'test-exercise',
                question: 'Comment signer "bonjour" ?',
                options: [
                    { id: 'opt-1', text: 'Main droite vers le haut', isCorrect: true },
                    { id: 'opt-2', text: 'Main gauche vers le bas', isCorrect: false }
                ],
                explanation: 'Le signe pour "bonjour" se fait avec la main droite.',
                difficulty: 0.3,
                skills: ['basicVocabulary'],
                level: 'A1',
                tags: ['multiple-choice']
            };

            // Action - Évaluer une réponse avec ID inexistant (SYNCHRONE)
            const result = generator.evaluate(testExercise, 'opt-999');

            // Assertions
            expect(result.correct).toBe(false);
            expect(result.score).toBe(0);
            expect(result.details['basicVocabulary']).toBe(0);
        });

        test('gère les réponses vides ou null', () => {
            const testExercise: MultipleChoiceExercise = {
                id: 'test-exercise',
                question: 'Comment signer "bonjour" ?',
                options: [
                    { id: 'opt-1', text: 'Main droite vers le haut', isCorrect: true }
                ],
                explanation: 'Le signe pour "bonjour" se fait avec la main droite.',
                difficulty: 0.3,
                skills: ['basicVocabulary'],
                level: 'A1',
                tags: ['multiple-choice']
            };

            // Test réponse vide (SYNCHRONE)
            const resultEmpty = generator.evaluate(testExercise, '');
            expect(resultEmpty.correct).toBe(false);
            expect(resultEmpty.score).toBe(0);

            // Test réponse null (SYNCHRONE)
            const resultNull = generator.evaluate(testExercise, null as unknown as string);
            expect(resultNull.correct).toBe(false);
            expect(resultNull.score).toBe(0);
        });
    });

    describe('Gestion des erreurs et cas limites', () => {
        test('gère l\'absence de concepts disponibles', async () => {
            // Arrangement - Mock qui retourne une liste vide
            mockConceptsService.searchConcepts.mockResolvedValueOnce([]);
            mockConceptsService.getConceptsByIds.mockResolvedValueOnce([]);

            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            // Action & Assertion
            await expect(generator.generate(params)).rejects.toThrow();
        });

        test('gère les erreurs du service de concepts', async () => {
            // Arrangement - Mock qui lance une erreur
            const serviceError = new Error('Service indisponible - connexion échouée');
            mockConceptsService.searchConcepts.mockRejectedValueOnce(serviceError);

            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            // Action & Assertion
            await expect(generator.generate(params)).rejects.toThrow('Service indisponible - connexion échouée');
        });

        test('valide et applique les valeurs par défaut des paramètres', async () => {
            // Test avec paramètres minimaux
            const minimalParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            const exercise = await generator.generate(minimalParams);

            // Vérifier les valeurs par défaut
            expect(exercise.options.length).toBe(4); // optionCount par défaut
            expect(exercise.level).toBe('A1');
            expect(exercise.difficulty).toBe(0.5);
            expect(exercise.tags).toContain('question-text'); // questionType par défaut
            expect(exercise.tags).toContain('answer-text'); // answerType par défaut
        });

        test('clamp la difficulté dans les limites valides', async () => {
            // Test avec difficulté trop élevée
            const highDifficultyParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 1.5, // > 1
                userId: 'test-user-123'
            };

            const exerciseHigh = await generator.generate(highDifficultyParams);
            expect(exerciseHigh.difficulty).toBeLessThanOrEqual(1);

            // Test avec difficulté négative
            const lowDifficultyParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: -0.5, // < 0
                userId: 'test-user-123'
            };

            const exerciseLow = await generator.generate(lowDifficultyParams);
            expect(exerciseLow.difficulty).toBeGreaterThanOrEqual(0);
        });

        test('limite le nombre d\'options dans les limites raisonnables', async () => {
            // Test avec trop d'options
            const tooManyOptionsParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                optionCount: 20, // Très élevé
                userId: 'test-user-123'
            };

            const exerciseTooMany = await generator.generate(tooManyOptionsParams);
            expect(exerciseTooMany.options.length).toBeLessThanOrEqual(10); // Limité à un maximum raisonnable

            // Test avec pas assez d'options
            const tooFewOptionsParams: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                optionCount: 1, // Trop peu pour un QCM
                userId: 'test-user-123'
            };

            const exerciseTooFew = await generator.generate(tooFewOptionsParams);
            expect(exerciseTooFew.options.length).toBeGreaterThanOrEqual(2); // Minimum pour un QCM
        });
    });

    describe('Intégration avec ConceptsDataService', () => {
        test('appelle ConceptsDataService avec les bons paramètres de recherche', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'B1',
                difficulty: 0.6,
                focusAreas: ['emotions', 'family'],
                userId: 'test-user-123'
            };

            // Action
            await generator.generate(params);

            // Assertions
            expect(mockConceptsService.searchConcepts).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: 'B1',
                    categories: ['emotions', 'family']
                })
            );
        });

        test('récupère les détails des concepts pour les explications', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            // Action
            await generator.generate(params);

            // Assertions - Vérifier qu'au moins un concept a eu ses détails récupérés
            expect(mockConceptsService.getConceptDetails).toHaveBeenCalled();
        });

        test('utilise les exemples aléatoires dans les explications', async () => {
            // Arrangement
            const customExample = 'Exemple personnalisé pour ce concept LSF.';
            mockConceptsService.getRandomExample.mockResolvedValueOnce(customExample);

            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            // Action
            const exercise = await generator.generate(params);

            // Assertions
            expect(mockConceptsService.getRandomExample).toHaveBeenCalled();
            expect(exercise.explanation).toContain('Signe important en LSF'); // Du mock details
        });
    });

    describe('Génération d\'éléments uniques', () => {
        test('génère des IDs uniques pour les exercices', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            // Action - Générer plusieurs exercices
            const exercises: MultipleChoiceExercise[] = [];
            for (let i = 0; i < 5; i++) {
                const exercise = await generator.generate(params);
                exercises.push(exercise);
                // Petite pause pour s'assurer que les timestamps sont différents
                await new Promise(resolve => setTimeout(resolve, 2));
            }

            // Assertions
            const ids = exercises.map(ex => ex.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(exercises.length);
        });

        test('génère des IDs uniques pour les options dans un exercice', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                optionCount: 5,
                userId: 'test-user-123'
            };

            // Action
            const exercise = await generator.generate(params);

            // Assertions
            const optionIds = exercise.options.map(opt => opt.id);
            const uniqueOptionIds = new Set(optionIds);
            expect(uniqueOptionIds.size).toBe(exercise.options.length);
        });

        test('maintient la cohérence des métadonnées entre les exercices du même niveau', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'A2',
                difficulty: 0.4,
                userId: 'test-user-123'
            };

            // Action - Générer plusieurs exercices du même niveau
            const exercises: MultipleChoiceExercise[] = [];
            for (let i = 0; i < 3; i++) {
                const exercise = await generator.generate(params);
                exercises.push(exercise);
            }

            // Assertions - Vérifier la cohérence
            exercises.forEach(exercise => {
                expect(exercise.level).toBe('A2');
                expect(exercise.difficulty).toBe(0.4);
                expect(exercise.tags).toContain('A2');
                expect(exercise.tags).toContain('multiple-choice');
            });
        });
    });

    describe('Performance et optimisation', () => {
        test('génère un exercice dans un temps raisonnable', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            const startTime = Date.now();

            // Action
            const exercise = await generator.generate(params);

            const endTime = Date.now();
            const generationTime = endTime - startTime;

            // Assertions
            expect(exercise).toBeDefined();
            expect(generationTime).toBeLessThan(1000); // Moins d'une seconde
        });

        test('gère efficacement plusieurs générations simultanées', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            const startTime = Date.now();

            // Action - Générations parallèles
            const promises = Array.from({ length: 3 }, () => generator.generate(params));
            const exercises = await Promise.all(promises);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // Assertions
            expect(exercises).toHaveLength(3);
            exercises.forEach(exercise => {
                expect(exercise).toBeDefined();
                expect(exercise.id).toBeDefined();
            });
            expect(totalTime).toBeLessThan(2000); // Toutes les générations en moins de 2 secondes
        });
    });

    describe('Logging et debugging', () => {
        test('log les informations importantes durant la génération', async () => {
            // Arrangement
            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            // Action
            await generator.generate(params);

            // Assertions
            expect(mockLogger.debug).toHaveBeenCalled();
        });

        test('log les erreurs en cas de problème', async () => {
            // Arrangement
            mockConceptsService.searchConcepts.mockRejectedValueOnce(new Error('Test error'));

            const params: MultipleChoiceGeneratorParams = {
                level: 'A1',
                difficulty: 0.5,
                userId: 'test-user-123'
            };

            // Action & Assertion
            await expect(generator.generate(params)).rejects.toThrow();
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });
});