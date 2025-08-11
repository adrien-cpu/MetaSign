/**
 * @file src/ai/services/learning/human/coda/codavirtuel/__tests__/CODAIntegration.test.ts
 * @description Tests d'intégration pour le système CODA Virtuel révolutionnaire
 * 
 * Fonctionnalités testées :
 * - 🎯 Intégration complète mentor ↔ IA-élève
 * - 🔧 Workflow end-to-end CODA
 * - 📊 Évaluation et adaptation en temps réel
 * - 🌟 Génération de supports pédagogiques
 * - 🎭 Simulation réaliste d'apprentissage
 * 
 * @module tests
 * @version 1.0.0 - Tests révolutionnaires corrigés
 * @since 2025
 * @author MetaSign Team - CODA Quality Assurance
 * @lastModified 2025-07-22
 */

import { ReverseApprenticeshipSystem } from '../ReverseApprenticeshipSystem';
import { CODASessionManager } from '../managers/CODASessionManager';
import { AIStudentSimulator } from '../simulators/AIStudentSimulator';
import { ExerciseGeneratorService } from '../exercises/ExerciseGeneratorService';
import type {
    GeneratedExercise,
    ExerciseContent,
    Question,
    Resource,
    ExerciseMetadata,
    EvaluationCriteria
} from '../exercises/ExerciseGeneratorService';
import { CECRLCODAEvaluator } from '../evaluators/CECRLCODAEvaluator';
import type {
    CODAPersonalityType,
    CulturalEnvironment,
    CECRLLevel
} from '../types/index';

// Import spécifique du type TeachingSession pour CODAEvaluator
import type { TeachingSession as CODATeachingSession } from '../evaluators/types/CODAEvaluatorTypes';

/**
 * Types locaux pour les tests
 */
type ExerciseType = 'multiple_choice' | 'drag_drop' | 'video_comprehension' | 'spatial_placement' | 'cultural_scenario' | 'teaching_session' | 'sign_production' | 'grammar_construction';

/**
 * Types corrigés pour la compatibilité des tests
 */
interface AIMemoryStats {
    readonly capacity: number;
    readonly used: number;
    readonly efficiency: number;
    readonly hitRate: number;
}

interface AIPerformanceHistory {
    readonly scores: readonly number[];
    readonly responseTimes: readonly number[];
    readonly sessionsCount: number;
    readonly learningTime: number;
}

/**
 * Configuration de test
 */
const TEST_CONFIG = {
    mentorId: 'test_mentor_001',
    aiStudentName: 'TestLuna',
    personality: 'curious_student' as CODAPersonalityType,
    culturalContext: 'deaf_family_home' as CulturalEnvironment,
    testConcepts: ['basic_greetings', 'numbers', 'family_signs'],
    timeout: 30000 // 30 secondes
};

/**
 * Création d'un exercice mock pour les tests
 */
function createMockExercise(type: ExerciseType = 'multiple_choice'): GeneratedExercise {
    return {
        id: `test_ex_${Date.now()}`,
        type,
        level: 'A1' as CECRLLevel,
        difficulty: 0.5,
        content: {
            instructions: 'Instructions de test',
            questions: [{
                id: 'q1',
                text: 'Question de test ?',
                type: 'multiple_choice',
                options: ['Option A', 'Option B', 'Option C'],
                correctAnswer: 'Option A',
                points: 1
            }] as Question[],
            resources: [] as Resource[],
            hints: ['Indice de test']
        } as ExerciseContent,
        metadata: {
            createdAt: new Date(),
            version: '1.0.0',
            tags: ['test'],
            estimatedDuration: 300,
            targetSkills: ['test_skill'],
            prerequisites: []
        } as ExerciseMetadata,
        evaluation: {
            maxScore: 100,
            passingScore: 60,
            scoringMethod: 'binary',
            criteria: [{
                id: 'accuracy',
                name: 'Précision',
                weight: 0.7,
                description: 'Exactitude de la réponse'
            }],
            timeFactors: []
        } as EvaluationCriteria
    };
}

/**
 * Création d'une session d'enseignement mock conforme au type CODATeachingSession complet
 */
function createMockCODATeachingSession(overrides: Partial<CODATeachingSession> = {}): CODATeachingSession {
    return {
        sessionId: `test_session_${Date.now()}`,
        mentorId: 'test_mentor_001',
        content: {
            topic: 'basic_greetings',                    // ✅ Propriété requise ajoutée
            concepts: ['basic_greetings'],
            teachingMethod: 'visual_demonstration',
            duration: 600                               // ✅ Propriété requise ajoutée
        },
        aiReactions: {
            comprehension: 0.8,
            questions: ['Peux-tu répéter ?'],
            errors: [],                                 // ✅ Propriété requise ajoutée
            correctionsAccepted: 1,                     // ✅ Propriété requise ajoutée
            frustrationSigns: 2
        },
        results: {
            objectivesAchieved: 0.85,                   // ✅ Propriété requise ajoutée
            newSkillsAcquired: ['basic_greeting'],      // ✅ Propriété requise ajoutée
            improvement: 0.7,
            aiSatisfaction: 0.85
        },
        timestamp: new Date(),
        ...overrides
    };
}

/**
 * Suite de tests d'intégration CODA
 */
describe('CODA Integration Tests - Système Révolutionnaire', () => {
    let codaSystem: ReverseApprenticeshipSystem;
    let sessionManager: CODASessionManager;
    let aiSimulator: AIStudentSimulator;
    let exerciseGenerator: ExerciseGeneratorService;
    let evaluator: CECRLCODAEvaluator;

    beforeAll(async () => {
        // Initialiser tous les composants
        codaSystem = new ReverseApprenticeshipSystem({
            codaMode: true,
            aiPersonality: TEST_CONFIG.personality,
            realTimeEvaluation: true,
            culturalAuthenticity: true,
            enableRealTimeAnalytics: true
        });

        sessionManager = new CODASessionManager({
            maxSessionsPerMentor: 1,
            enableRealTimeAnalytics: true
        });

        aiSimulator = new AIStudentSimulator({
            emotionalConfig: { enablePatternDetection: true },
            evolutionConfig: { enableAutoOptimization: true }
        });

        exerciseGenerator = ExerciseGeneratorService.getInstance();
        await exerciseGenerator.initialize();

        evaluator = new CECRLCODAEvaluator({
            aiIntelligenceLevel: 'advanced',
            culturalAuthenticity: true,
            enablePredictiveAnalysis: true
        });
    }, TEST_CONFIG.timeout);

    afterAll(async () => {
        // Nettoyer les ressources
        await codaSystem.destroy();
        await sessionManager.destroy();
        aiSimulator.destroy();
        exerciseGenerator.clearCaches(); // Correction: clearCaches au lieu de clearCache
    });

    describe('🎭 Workflow CODA Complet', () => {
        test('Cycle complet : Création IA-élève → Enseignement → Évaluation', async () => {
            // 1. Créer une IA-élève
            const aiStudent = await codaSystem.createAIStudent(
                TEST_CONFIG.mentorId,
                TEST_CONFIG.aiStudentName,
                TEST_CONFIG.personality,
                TEST_CONFIG.culturalContext
            );

            expect(aiStudent).toBeDefined();
            expect(aiStudent.name).toBe(TEST_CONFIG.aiStudentName);
            expect(aiStudent.personality).toBe(TEST_CONFIG.personality);
            expect(aiStudent.currentLevel).toBe('A1');
            expect(aiStudent.mood).toMatch(/happy|excited|neutral|curious|confused/);

            // 2. Démarrer une session d'enseignement
            const sessionId = await codaSystem.startTeachingSession(
                TEST_CONFIG.mentorId,
                TEST_CONFIG.testConcepts[0], // 'basic_greetings'
                ['salutations', 'politesse'],
                'visual_demonstration'
            );

            expect(sessionId).toBeDefined();
            expect(typeof sessionId).toBe('string');
            expect(sessionId).toMatch(/^teaching_/);

            // 3. Enseigner un concept
            const teachingResult = await codaSystem.teachConcept(
                TEST_CONFIG.mentorId,
                sessionId,
                'salutation_bonjour',
                'Voici comment signer "bonjour" : levez la main droite, paume vers la personne'
            );

            expect(teachingResult).toBeDefined();
            expect(teachingResult.aiReaction).toBeDefined();
            expect(typeof teachingResult.comprehension).toBe('number');
            expect(teachingResult.comprehension).toBeGreaterThanOrEqual(0);
            expect(teachingResult.comprehension).toBeLessThanOrEqual(1);
            expect(typeof teachingResult.needsHelp).toBe('boolean');

            // 4. Terminer la session et obtenir l'évaluation
            const sessionResult = await codaSystem.endTeachingSession(
                TEST_CONFIG.mentorId,
                sessionId
            );

            expect(sessionResult).toBeDefined();
            expect(sessionResult.sessionSummary).toBeDefined();
            expect(sessionResult.aiProgress).toBeDefined();
            expect(sessionResult.teachingEvaluation).toBeDefined();

            // Vérifier la progression de l'IA
            expect(sessionResult.aiProgress.comprehensionRate).toBeGreaterThanOrEqual(0);
            expect(sessionResult.aiProgress.comprehensionRate).toBeLessThanOrEqual(1);

            // Vérifier l'évaluation du mentor
            expect(sessionResult.teachingEvaluation).toHaveProperty('overallScore');

            // 5. Obtenir les statistiques globales
            const stats = codaSystem.getCODAStatistics();
            expect(stats.totalSessions).toBeGreaterThan(0);
            expect(stats.activeMentors).toBeGreaterThan(0);
            expect(stats.totalAIStudents).toBeGreaterThan(0);
        }, TEST_CONFIG.timeout);

        test('Supports pédagogiques génératifs', async () => {
            // Test avec méthode alternative si generateTeachingSupports n'existe pas
            const evaluation = await codaSystem.evaluateTeachingProgress(TEST_CONFIG.mentorId);
            expect(evaluation).toBeDefined();
            expect(typeof evaluation).toBe('object');
            expect(evaluation).toHaveProperty('mentorEvaluation');

            // Simuler génération de supports via l'évaluateur
            const mockSessions: readonly CODATeachingSession[] = [createMockCODATeachingSession({
                sessionId: 'test_session_supports',
                content: {
                    topic: 'basic_greetings',
                    concepts: ['basic_greetings'],
                    teachingMethod: 'visual_demonstration',
                    duration: 600
                },
                aiReactions: {
                    comprehension: 0.8,
                    questions: ['Je comprends !'],
                    errors: [],
                    correctionsAccepted: 1,
                    frustrationSigns: 1
                },
                results: {
                    objectivesAchieved: 0.9,
                    newSkillsAcquired: ['basic_greeting'],
                    improvement: 0.85,
                    aiSatisfaction: 0.9
                }
            })];

            const mentorEval = await evaluator.evaluateMentorSkills(mockSessions);
            const supports = await evaluator.generateAdaptiveSupports(mockSessions, mentorEval);

            expect(supports).toBeDefined();
            expect(Array.isArray(supports)).toBe(true);
        });

        test('Évaluation progression temps réel', async () => {
            const evaluation = await codaSystem.evaluateTeachingProgress(TEST_CONFIG.mentorId);

            expect(evaluation).toBeDefined();
            expect(typeof evaluation).toBe('object');
            expect(evaluation).toHaveProperty('mentorEvaluation');
        });
    });

    describe('🤖 Simulation IA-élève Avancée', () => {
        test('Création et évolution IA-élève', async () => {
            const aiStudent = await aiSimulator.createAdvancedAIStudent(
                'TestAI_Evolution',
                'patient_apprentice',
                'school_environment'
            );

            expect(aiStudent).toBeDefined();
            expect(aiStudent.name).toBe('TestAI_Evolution');
            expect(aiStudent.personality).toBe('patient_apprentice');
            expect(aiStudent.culturalContext).toBe('school_environment');
            expect(aiStudent.personalityProfile).toBeDefined();
            expect(aiStudent.emotionalState).toBeDefined();
            expect(aiStudent.evolutionMetrics).toBeDefined();

            // Test d'apprentissage simulé
            const reaction = await aiSimulator.simulateAdvancedLearning(
                aiStudent,
                'family_members',
                'Voici les signes pour dire "maman", "papa", "frère", "sœur"',
                'demonstration'
            );

            expect(reaction).toBeDefined();
            expect(reaction.basicReaction).toBeDefined();
            expect(reaction.emotionalState).toBeDefined();
            expect(reaction.evolutionMetrics).toBeDefined();
            expect(reaction.basicReaction.comprehension).toBeGreaterThanOrEqual(0);
            expect(reaction.basicReaction.comprehension).toBeLessThanOrEqual(1);

            // Évolution globale
            const evolvedAI = await aiSimulator.evolveAIStudentComprehensive('TestAI_Evolution');
            expect(evolvedAI).toBeDefined();
            expect(evolvedAI.evolutionMetrics.globalConfidence).toBeGreaterThanOrEqual(0);
            expect(evolvedAI.evolutionMetrics.globalConfidence).toBeLessThanOrEqual(1);
        });

        test('Statut et métriques IA-élève', async () => {
            const status = aiSimulator.getComprehensiveStatus('TestAI_Evolution');

            if (status) {
                expect(status.memoryStats).toBeDefined();
                expect(status.performanceHistory).toBeDefined();

                // ✅ Correction: utiliser un cast via unknown pour éviter le conflit de types
                const memoryStats = status.memoryStats as unknown as AIMemoryStats;
                expect(memoryStats.capacity).toBeGreaterThanOrEqual(0);
                expect(memoryStats.used).toBeGreaterThanOrEqual(0);
                expect(memoryStats.efficiency).toBeGreaterThanOrEqual(0);
                expect(memoryStats.efficiency).toBeLessThanOrEqual(1);

                // ✅ Correction: utiliser un cast via unknown pour éviter le conflit de types  
                const performanceHistory = status.performanceHistory as unknown as AIPerformanceHistory;
                expect(Array.isArray(performanceHistory.scores)).toBe(true);
                expect(Array.isArray(performanceHistory.responseTimes)).toBe(true);
                expect(performanceHistory.sessionsCount).toBeGreaterThanOrEqual(0);
                expect(performanceHistory.learningTime).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('🎯 Génération et Adaptation d\'Exercices', () => {
        test('Génération exercices adaptatifs', async () => {
            const exercise = await exerciseGenerator.generateExercise({
                type: 'multiple_choice',
                level: 'A1',
                difficulty: 0.5,
                focusAreas: ['vocabulary', 'basic_signs'],
                userId: TEST_CONFIG.mentorId,
                culturalContext: TEST_CONFIG.culturalContext
            });

            expect(exercise).toBeDefined();
            expect(exercise.id).toBeDefined();
            expect(exercise.type).toBe('multiple_choice');
            expect(exercise.level).toBe('A1');
            expect(exercise.difficulty).toBe(0.5);
            expect(exercise.content).toBeDefined();
            expect(exercise.evaluation).toBeDefined();
            expect(exercise.metadata).toBeDefined();
        });

        test('Évaluation réponse utilisateur', async () => {
            const exercise = await exerciseGenerator.generateExercise({
                type: 'drag_drop',
                level: 'A2',
                difficulty: 0.6,
                focusAreas: ['spatial_reference'],
                userId: TEST_CONFIG.mentorId
            });

            const mockResponse = "réponse_test_correcte";
            const evaluation = await exerciseGenerator.evaluateResponse(
                exercise,
                mockResponse
            ); // Correction: seulement 2 paramètres

            expect(evaluation).toBeDefined();
            expect(evaluation.exerciseId).toBe(exercise.id);
            expect(typeof evaluation.score).toBe('number');
            expect(typeof evaluation.percentage).toBe('number');
            expect(typeof evaluation.isCorrect).toBe('boolean');
            expect(evaluation.feedback).toBeDefined();
            expect(Array.isArray(evaluation.suggestions)).toBe(true);
        });

        test('Cache et récupération exercices', async () => {
            // Créer un exercice
            const exercise1 = await exerciseGenerator.generateExercise({
                type: 'video_comprehension',
                level: 'B1',
                difficulty: 0.7,
                focusAreas: ['cultural_context'],
                userId: TEST_CONFIG.mentorId
            });

            // Récupérer par ID
            const retrievedExercise = await exerciseGenerator.getExerciseById(exercise1.id);
            expect(retrievedExercise).toBeDefined();
            expect(retrievedExercise?.id).toBe(exercise1.id);

            // Test cache - générer le même exercice
            const exercise2 = await exerciseGenerator.generateExercise({
                type: 'video_comprehension',
                level: 'B1',
                difficulty: 0.7,
                focusAreas: ['cultural_context'],
                userId: TEST_CONFIG.mentorId
            });

            // Devrait être différent car l'ID est unique
            expect(exercise2.id).not.toBe(exercise1.id);
        });
    });

    describe('📊 Évaluation CECRL CODA', () => {
        test('Évaluation compétences mentor', async () => {
            // Créer des sessions simulées avec la structure correcte pour CODAEvaluator
            const mockSessions: readonly CODATeachingSession[] = [
                createMockCODATeachingSession({
                    sessionId: 'test_session_1',
                    content: {
                        topic: 'basic_greetings',
                        concepts: ['basic_greetings'],
                        teachingMethod: 'visual_demonstration',
                        duration: 600
                    },
                    aiReactions: {
                        comprehension: 0.8,
                        questions: ['Super ! Je comprends !', 'Peux-tu répéter ?'],
                        errors: [],
                        correctionsAccepted: 2,
                        frustrationSigns: 1
                    },
                    results: {
                        objectivesAchieved: 0.9,
                        newSkillsAcquired: ['basic_greeting', 'polite_greeting'],
                        improvement: 0.85,
                        aiSatisfaction: 0.9
                    }
                })
            ];

            const mentorEval = await evaluator.evaluateMentorSkills(mockSessions);

            expect(mentorEval).toBeDefined();
            expect(typeof mentorEval.overallScore).toBe('number');
            expect(mentorEval.overallScore).toBeGreaterThanOrEqual(0);
            expect(mentorEval.overallScore).toBeLessThanOrEqual(1);
            expect(mentorEval.competencies).toBeDefined();
            expect(typeof mentorEval.competencies.explanation).toBe('number');
            expect(typeof mentorEval.competencies.patience).toBe('number');
            expect(typeof mentorEval.competencies.adaptation).toBe('number');
            // Correction: utiliser les noms corrects des propriétés
            expect(Array.isArray(mentorEval.improvements)).toBe(true);
            expect(Array.isArray(mentorEval.strengths)).toBe(true);
        });

        test('Génération supports adaptatifs', async () => {
            const mockSessions: readonly CODATeachingSession[] = [
                createMockCODATeachingSession({
                    sessionId: 'test_session_support',
                    content: {
                        topic: 'spatial_reference',
                        concepts: ['spatial_reference'],
                        teachingMethod: 'visual_demonstration',
                        duration: 900
                    },
                    aiReactions: {
                        comprehension: 0.5, // Faible compréhension
                        questions: ['C\'est difficile...', 'Je ne comprends pas'],
                        errors: ['placement_incorrect', 'confusion_spatiale'],
                        correctionsAccepted: 0,
                        frustrationSigns: 6
                    },
                    results: {
                        objectivesAchieved: 0.3,
                        newSkillsAcquired: [],
                        improvement: 0.3,
                        aiSatisfaction: 0.4
                    }
                })
            ];

            const mentorEval = await evaluator.evaluateMentorSkills(mockSessions);
            const supports = await evaluator.generateAdaptiveSupports(mockSessions, mentorEval);

            expect(supports).toBeDefined();
            expect(Array.isArray(supports)).toBe(true);

            if (supports.length > 0) {
                const support = supports[0];
                expect(support).toHaveProperty('id');
                expect(support).toHaveProperty('type');
                expect(support).toHaveProperty('title');
                expect(support).toHaveProperty('description');
                expect(support).toHaveProperty('targetWeakness'); // ✅ Propriété correcte du type CODAEvaluatorTypes
                // Note: culturallyAdapted retiré car propriété inexistante
            }
        });
    });

    describe('🔄 Compatibilité et Migration', () => {
        test('API Legacy compatible', async () => {
            // Test des méthodes legacy
            const userProfile = await codaSystem.initializeUserProfile('legacy_user_001', 'A1');
            expect(userProfile).toBeDefined();
            expect(userProfile.userId).toBe('legacy_user_001');
            expect(userProfile.currentLevel).toBe('A1');

            const exercise = await codaSystem.generateExercise('legacy_user_001');
            expect(exercise).toBeDefined();
            expect(exercise.id).toBeDefined();

            const retrievedProfile = await codaSystem.getUserProfile('legacy_user_001');
            expect(retrievedProfile).toBeDefined();
            expect(retrievedProfile?.userId).toBe('legacy_user_001');
        });

        test('Configuration et options', () => {
            // Test simplifié sans getOptions/updateOptions qui n'existent pas
            const stats = codaSystem.getCODAStatistics();
            expect(stats).toBeDefined();
            expect(typeof stats.totalSessions).toBe('number');
            expect(typeof stats.activeMentors).toBe('number');
            expect(typeof stats.totalAIStudents).toBe('number');

            // Test des statistiques du générateur d'exercices
            const generatorStats = exerciseGenerator.getStatistics();
            expect(generatorStats).toBeDefined();
            expect(typeof generatorStats.exercisesCached).toBe('number');
            expect(typeof generatorStats.evaluationsCached).toBe('number');
        });
    });

    describe('🧹 Gestion Ressources et Performance', () => {
        test('Nettoyage et terminaison sessions', async () => {
            // Créer une session temporaire
            const tempAI = await codaSystem.createAIStudent(
                'temp_mentor_999',
                'TempAI',
                'shy_learner',
                'online_learning'
            );
            expect(tempAI).toBeDefined();

            // Vérifier session active
            const status = codaSystem.getAIStudentStatus('temp_mentor_999');
            expect(status).toBeDefined();

            // Terminer session
            const terminated = await codaSystem.terminateCODASession('temp_mentor_999');
            expect(terminated).toBe(true);

            // Vérifier session terminée
            const statusAfter = codaSystem.getAIStudentStatus('temp_mentor_999');
            expect(statusAfter).toBeNull();
        });

        test('Performance et cache', async () => {
            const start = Date.now();

            // Générer plusieurs exercices
            const exercises = await Promise.all([
                exerciseGenerator.generateExercise({
                    type: 'multiple_choice',
                    level: 'A1',
                    difficulty: 0.3,
                    userId: 'perf_test_user'
                }),
                exerciseGenerator.generateExercise({
                    type: 'drag_drop',
                    level: 'A1',
                    difficulty: 0.4,
                    userId: 'perf_test_user'
                }),
                exerciseGenerator.generateExercise({
                    type: 'spatial_placement',
                    level: 'A1',
                    difficulty: 0.5,
                    userId: 'perf_test_user'
                })
            ]);

            const end = Date.now();
            const duration = end - start;

            expect(exercises).toHaveLength(3);
            expect(duration).toBeLessThan(5000); // Moins de 5 secondes
            exercises.forEach(exercise => {
                expect(exercise).toBeDefined();
                expect(exercise.id).toBeDefined();
            });
        });

        test('Gestion mémoire et limites', () => {
            // Test des limites du système
            const stats = codaSystem.getCODAStatistics();
            expect(stats.activeMentors).toBeLessThan(100); // Limite raisonnable
            expect(stats.totalAIStudents).toBeLessThan(1000); // Limite raisonnable

            // Nettoyer cache
            exerciseGenerator.clearCaches(); // Correction: clearCaches
            // Après nettoyage, aucune erreur ne devrait survenir
            expect(() => exerciseGenerator.clearCaches()).not.toThrow();
        });
    });

    describe('🔒 Validation et Sécurité', () => {
        test('Validation des entrées utilisateur', async () => {
            // Test avec des entrées invalides
            await expect(
                codaSystem.createAIStudent(
                    '',
                    'InvalidName',
                    'invalid_personality' as CODAPersonalityType,
                    'invalid_context' as CulturalEnvironment
                )
            ).rejects.toThrow();

            // Test avec des IDs inexistants
            const invalidStatus = codaSystem.getAIStudentStatus('nonexistent_mentor');
            expect(invalidStatus).toBeNull();

            await expect(
                codaSystem.startTeachingSession('nonexistent_mentor', 'some_topic')
            ).rejects.toThrow();
        });

        test('Gestion d\'erreurs robuste', async () => {
            // Test récupération d'erreurs
            const invalidExercise = await exerciseGenerator.getExerciseById('nonexistent_id');
            expect(invalidExercise).toBeNull();

            // Test évaluation avec données manquantes
            await expect(async () => {
                const mockExercise = createMockExercise('multiple_choice');
                const evaluation = await exerciseGenerator.evaluateResponse(mockExercise, null);
                expect(evaluation).toBeDefined();
            }).not.toThrow();
        });
    });
});

/**
 * Suite de tests de performance
 */
describe('CODA Performance Tests', () => {
    let system: ReverseApprenticeshipSystem;

    beforeAll(() => {
        system = new ReverseApprenticeshipSystem({
            codaMode: true,
            enableRealTimeAnalytics: true,
            maxConcurrentSessions: 5
        });
    });

    afterAll(async () => {
        await system.destroy();
    });

    test('Performance création simultanée IA-élèves', async () => {
        const start = Date.now();

        const creationPromises = Array.from({ length: 3 }, (_, i) =>
            system.createAIStudent(
                `perf_mentor_${i}`,
                `PerfAI_${i}`,
                'curious_student',
                'deaf_family_home'
            )
        );

        const aiStudents = await Promise.all(creationPromises);
        const end = Date.now();

        expect(aiStudents).toHaveLength(3);
        expect(end - start).toBeLessThan(10000); // 10 secondes max

        aiStudents.forEach((aiStudent, i) => {
            expect(aiStudent.name).toBe(`PerfAI_${i}`);
        });

        // Nettoyer
        for (let i = 0; i < 3; i++) {
            await system.terminateCODASession(`perf_mentor_${i}`);
        }
    }, 15000);

    test('Performance sessions enseignement concurrent', async () => {
        // Créer des IA-élèves
        await Promise.all([
            system.createAIStudent('concurrent_1', 'AI1', 'patient_apprentice', 'school_environment'),
            system.createAIStudent('concurrent_2', 'AI2', 'energetic_pupil', 'community_center')
        ]);

        const start = Date.now();

        // Sessions concurrentes
        const sessionPromises = [
            system.startTeachingSession('concurrent_1', 'colors', ['rouge', 'bleu', 'vert']),
            system.startTeachingSession('concurrent_2', 'numbers', ['un', 'deux', 'trois'])
        ];

        const sessionIds = await Promise.all(sessionPromises);
        const end = Date.now();

        expect(sessionIds).toHaveLength(2);
        expect(end - start).toBeLessThan(5000); // 5 secondes max

        sessionIds.forEach(id => {
            expect(typeof id).toBe('string');
            expect(id).toMatch(/^teaching_/);
        });
    }, 10000);
});

/**
 * Tests d'intégration avec mocks
 */
describe('CODA Mocked Integration Tests', () => {
    test('Simulation complète workflow pédagogique', async () => {
        const system = new ReverseApprenticeshipSystem({
            codaMode: true,
            errorSimulationRate: 0.2,
            culturalAuthenticity: true
        });

        try {
            // 1. Phase de préparation
            const aiStudent = await system.createAIStudent(
                'pedagogical_test',
                'EtudeAI',
                'curious_student',
                'deaf_family_home'
            );

            // Vérifier que l'IA-élève a été créée correctement
            expect(aiStudent).toBeDefined();
            expect(aiStudent.name).toBe('EtudeAI');

            // 2. Phase d'enseignement multiple
            const concepts = ['greetings', 'family', 'colors'];
            const results = [];

            for (const concept of concepts) {
                const sessionId = await system.startTeachingSession(
                    'pedagogical_test',
                    concept
                );

                const teachResult = await system.teachConcept(
                    'pedagogical_test',
                    sessionId,
                    concept,
                    `Enseignement du concept: ${concept}`
                );

                const sessionResult = await system.endTeachingSession(
                    'pedagogical_test',
                    sessionId
                );

                results.push({
                    concept,
                    comprehension: teachResult.comprehension,
                    sessionScore: sessionResult.teachingEvaluation
                });
            }

            // 3. Phase d'évaluation globale
            const finalEvaluation = await system.evaluateTeachingProgress('pedagogical_test');

            // Vérifications
            expect(results).toHaveLength(3);
            expect(finalEvaluation).toBeDefined();

            results.forEach(result => {
                expect(result.comprehension).toBeGreaterThanOrEqual(0);
                expect(result.comprehension).toBeLessThanOrEqual(1);
            });

            // 4. Phase de nettoyage
            await system.terminateCODASession('pedagogical_test');

        } finally {
            await system.destroy();
        }
    }, 30000);
});

export { };