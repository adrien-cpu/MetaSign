/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulators/__tests__/AIStudentSimulator.test.ts
 * @description Tests de validation pour le simulateur d'IA-élèves révolutionnaire refactorisé
 * 
 * Tests pour :
 * - 🧪 Création d'IA-élèves avec personnalités
 * - 🎯 Simulation d'apprentissage avancée
 * - 📊 Métriques et évolution
 * - 🔄 Intégration des systèmes
 * - 🛡️ Gestion d'erreurs et robustesse
 * 
 * @module AIStudentSimulatorTest
 * @version 1.0.1 - Version corrigée avec types valides
 * @since 2025
 * @author MetaSign Team - CODA Testing Suite
 * @lastModified 2025-08-06
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AIStudentSimulator } from '../AIStudentSimulator';
import type {
    AIStudentSimulatorConfig,
    ComprehensiveAIStatus,
    ComprehensiveAIReaction,
    AIStudentPersonalityType,
    CulturalEnvironment
} from '../../interfaces/index';

// Mock du logger pour les tests
jest.mock('@/ai/utils/LoggerFactory', () => ({
    LoggerFactory: {
        getLogger: jest.fn(() => ({
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        }))
    }
}));

describe('AIStudentSimulator - Tests de validation révolutionnaire', () => {
    let simulator: AIStudentSimulator;
    let testConfig: Partial<AIStudentSimulatorConfig>;

    beforeEach(() => {
        // Configuration de test optimisée
        testConfig = {
            personalityConfig: {
                enableDynamicEvolution: true,
                adaptationSpeed: 0.8,
                culturalInfluence: 0.7,
                emotionalVolatility: 0.5,
                evolutionThreshold: 0.2
            },
            memoryConfig: {
                naturalDecayRate: 0.02,
                consolidationThreshold: 0.6,
                enableAutoConsolidation: true,
                maxActiveMemories: 100
            },
            emotionalConfig: {
                baseVolatility: 0.4,
                enablePatternDetection: true,
                triggerSensitivity: 0.7,
                transitionSpeed: 1000,
                historyDepth: 50
            },
            evolutionConfig: {
                evolutionSensitivity: 0.8,
                enableAutoOptimization: true,
                baseEvolutionRate: 0.1,
                evolutionThreshold: 0.15,
                analysisDepth: 10
            },
            generalConfig: {
                enableAdvancedLogging: true,
                syncInterval: 5000,
                maxConcurrentStudents: 5,
                developmentMode: true
            }
        };

        simulator = new AIStudentSimulator(testConfig);
    });

    afterEach(() => {
        simulator.destroy();
    });

    describe('🎭 Création d\'IA-élèves', () => {
        it('devrait créer une IA-élève curieuse avec personnalité complète', async () => {
            // Arrange
            const name = 'Luna_Test';
            const personalityType: AIStudentPersonalityType = 'curious_student';
            const culturalContext: CulturalEnvironment = 'deaf_family_home';

            // Act
            const aiStudent = await simulator.createAdvancedAIStudent(
                name, personalityType, culturalContext
            );

            // Assert
            expect(aiStudent).toBeDefined();
            expect(aiStudent.name).toBe(name);
            expect(aiStudent.personality).toBe(personalityType);
            expect(aiStudent.culturalContext).toBe(culturalContext);
            expect(aiStudent.currentLevel).toBe('A1');
            expect(aiStudent.personalityProfile).toBeDefined();
            expect(aiStudent.emotionalState).toBeDefined();
            expect(aiStudent.evolutionMetrics).toBeDefined();
            expect(aiStudent.memoryStats).toBeDefined();
            expect(aiStudent.performanceHistory).toBeDefined();

            // Vérifier les traits de personnalité
            expect(aiStudent.personalityProfile.bigFiveTraits.openness).toBeGreaterThan(0.7);

            // Vérifier les préférences d'apprentissage (tableau de strings)
            expect(aiStudent.personalityProfile.learningPreferences).toBeDefined();
            expect(Array.isArray(aiStudent.personalityProfile.learningPreferences)).toBe(true);
            expect(aiStudent.personalityProfile.learningPreferences.length).toBeGreaterThan(0);

            // Vérifier que les préférences contiennent des éléments pertinents
            const hasVisualOrKinesthetic = aiStudent.personalityProfile.learningPreferences.some(
                pref => pref.includes('visual') || pref.includes('kinesthetic') || pref.includes('exploration')
            );
            expect(hasVisualOrKinesthetic).toBe(true);

            // Vérifier les faiblesses et forces initiales appropriées
            expect(aiStudent.weaknesses).toContain('basic_signs');
            expect(aiStudent.strengths).toContain('learning_enthusiasm');
        });

        it('devrait créer une IA-élève timide avec caractéristiques appropriées', async () => {
            // Arrange
            const personalityType: AIStudentPersonalityType = 'shy_learner';
            const culturalContext: CulturalEnvironment = 'school_environment';

            // Act
            const aiStudent = await simulator.createAdvancedAIStudent(
                'Shy_Test', personalityType, culturalContext
            );

            // Assert
            expect(aiStudent.personalityProfile.bigFiveTraits.extraversion).toBeLessThan(0.5);
            expect(aiStudent.personalityProfile.bigFiveTraits.agreeableness).toBeGreaterThan(0.8);
            expect(aiStudent.weaknesses).toContain('expression');
            expect(aiStudent.strengths).toContain('careful_observation');
        });

        it('devrait créer plusieurs IA-élèves avec personnalités distinctes', async () => {
            // Arrange
            const personalityTypes: AIStudentPersonalityType[] = [
                'curious_student', 'shy_learner', 'energetic_pupil', 'patient_apprentice'
            ];

            // Act
            const aiStudents: ComprehensiveAIStatus[] = [];
            for (let i = 0; i < personalityTypes.length; i++) {
                const student = await simulator.createAdvancedAIStudent(
                    `Test_${i}`, personalityTypes[i], 'community_center'
                );
                aiStudents.push(student);
            }

            // Assert
            expect(aiStudents).toHaveLength(4);

            // Vérifier que les personnalités sont distinctes
            const opennessValues = aiStudents.map(s => s.personalityProfile.bigFiveTraits.openness);
            const extraversionValues = aiStudents.map(s => s.personalityProfile.bigFiveTraits.extraversion);

            // Curious_student devrait avoir la plus haute ouverture
            expect(opennessValues[0]).toBeGreaterThan(opennessValues[1]);

            // Energetic_pupil devrait avoir la plus haute extraversion
            expect(extraversionValues[2]).toBeGreaterThan(extraversionValues[1]);
        });
    });

    describe('🎯 Simulation d\'apprentissage', () => {
        let aiStudent: ComprehensiveAIStatus;

        beforeEach(async () => {
            aiStudent = await simulator.createAdvancedAIStudent(
                'Learning_Test', 'curious_student', 'deaf_family_home'
            );
        });

        it('devrait simuler une réaction d\'apprentissage complète', async () => {
            // Arrange
            const concept = 'basic_greetings';
            const explanation = 'Voici comment signer "bonjour" en LSF';
            const teachingMethod = 'demonstration';

            // Act
            const reaction = await simulator.simulateAdvancedLearning(
                aiStudent, concept, explanation, teachingMethod
            );

            // Assert
            expect(reaction).toBeDefined();
            expect(reaction.basicReaction).toBeDefined();
            expect(reaction.basicReaction.comprehension).toBeGreaterThanOrEqual(0.1);
            expect(reaction.basicReaction.comprehension).toBeLessThanOrEqual(1.0);
            expect(reaction.basicReaction.confidence).toBeGreaterThanOrEqual(0.05);
            expect(reaction.basicReaction.confidence).toBeLessThanOrEqual(0.95);
            expect(reaction.basicReaction.reaction).toContain(aiStudent.name);
            expect(reaction.basicReaction.timestamp).toBeInstanceOf(Date);

            expect(reaction.emotionalState).toBeDefined();
            expect(reaction.evolutionMetrics).toBeDefined();
            expect(reaction.recalledMemories).toBeDefined();
            expect(reaction.improvementSuggestions).toBeDefined();
            expect(Array.isArray(reaction.improvementSuggestions)).toBe(true);

            expect(reaction.metadata).toBeDefined();
            expect(reaction.metadata.primarySystem).toBeDefined();
            expect(reaction.metadata.processingTime).toBeGreaterThan(0);
        });

        it('devrait adapter la réaction selon le niveau de compréhension', async () => {
            // Test avec concept simple (devrait avoir haute compréhension)
            const simpleConcept = 'hello_sign';
            const simpleExplanation = 'Lever la main pour dire bonjour';

            const simpleReaction = await simulator.simulateAdvancedLearning(
                aiStudent, simpleConcept, simpleExplanation
            );

            // Test avec concept complexe (devrait avoir plus faible compréhension)
            const complexConcept = 'complex_grammar_rules';
            const complexExplanation = 'Les règles grammaticales avancées de placement spatial avec références temporelles multiples et modificateurs aspectuels complexes';

            const complexReaction = await simulator.simulateAdvancedLearning(
                aiStudent, complexConcept, complexExplanation
            );

            // Assert
            expect(simpleReaction.basicReaction.comprehension)
                .toBeGreaterThan(complexReaction.basicReaction.comprehension);

            // Concept complexe devrait générer plus de suggestions d'amélioration
            expect(complexReaction.improvementSuggestions.length)
                .toBeGreaterThanOrEqual(simpleReaction.improvementSuggestions.length);
        });

        it('devrait générer des questions contextuelles pour IA curieuse', async () => {
            // Arrange
            const concept = 'family_signs';
            const explanation = 'Les signes pour désigner les membres de la famille';

            // Act - Simuler plusieurs apprentissages pour augmenter chances de questions
            const reactions: ComprehensiveAIReaction[] = [];
            for (let i = 0; i < 5; i++) {
                const reaction = await simulator.simulateAdvancedLearning(
                    aiStudent, `${concept}_${i}`, explanation
                );
                reactions.push(reaction);
            }

            // Assert - Au moins une réaction devrait contenir une question
            const reactionsWithQuestions = reactions.filter(r => r.question);
            expect(reactionsWithQuestions.length).toBeGreaterThan(0);

            if (reactionsWithQuestions.length > 0) {
                const questionReaction = reactionsWithQuestions[0];
                expect(questionReaction.question).toContain('family');
                expect(questionReaction.question).toMatch(/\?$/); // Finit par un point d'interrogation
            }
        });

        it('devrait générer des erreurs intelligentes pour faible compréhension', async () => {
            // Arrange - Utiliser concept très complexe pour forcer faible compréhension
            const complexConcept = 'advanced_spatial_grammar_with_temporal_aspects';
            const complexExplanation = 'Système complexe de références spatiales temporelles multidimensionnelles avec aspects grammaticaux avancés et modificateurs séquentiels';

            // Act - Simuler plusieurs fois pour forcer une erreur
            const reactions: ComprehensiveAIReaction[] = [];
            for (let i = 0; i < 10; i++) {
                const reaction = await simulator.simulateAdvancedLearning(
                    aiStudent, complexConcept, complexExplanation
                );
                reactions.push(reaction);
            }

            // Assert
            const reactionsWithErrors = reactions.filter(r => r.error);

            if (reactionsWithErrors.length > 0) {
                const errorReaction = reactionsWithErrors[0];
                expect(errorReaction.error).toContain(complexConcept);
                expect(errorReaction.basicReaction.comprehension).toBeLessThan(0.6);
            }
        });
    });

    describe('📊 Évolution et métriques', () => {
        let aiStudent: ComprehensiveAIStatus;

        beforeEach(async () => {
            aiStudent = await simulator.createAdvancedAIStudent(
                'Evolution_Test', 'patient_apprentice', 'mixed_hearing_family'
            );
        });

        it('devrait faire évoluer l\'IA après multiple apprentissages', async () => {
            // Arrange
            const initialConfidence = aiStudent.evolutionMetrics.globalConfidence;
            const initialProgress = aiStudent.progress;

            // Act - Simuler plusieurs apprentissages réussis
            const concepts = ['greetings', 'numbers', 'colors', 'family', 'food'];

            for (const concept of concepts) {
                await simulator.simulateAdvancedLearning(
                    aiStudent, concept, `Apprendre les signes pour ${concept}`
                );
            }

            // Évolution globale
            const evolvedStudent = await simulator.evolveAIStudentComprehensive(aiStudent.name);

            // Assert
            expect(evolvedStudent.evolutionMetrics.globalConfidence)
                .toBeGreaterThanOrEqual(initialConfidence);
            expect(evolvedStudent.progress).toBeGreaterThan(initialProgress);
            expect(evolvedStudent.totalLearningTime).toBeGreaterThan(0);
        });

        it('devrait maintenir la cohérence des métriques', async () => {
            // Act
            const reaction = await simulator.simulateAdvancedLearning(
                aiStudent, 'test_concept', 'Test explanation'
            );

            // Assert - Vérifier cohérence entre différentes métriques
            const comprehension = reaction.basicReaction.comprehension;
            const confidence = reaction.basicReaction.confidence;
            const emotionalState = reaction.emotionalState;

            // Haute compréhension devrait généralement corréler avec haute confiance
            if (comprehension > 0.7) {
                expect(confidence).toBeGreaterThan(0.3);
            }

            // État émotionnel devrait être cohérent avec performance
            if (comprehension > 0.8 && emotionalState.primaryEmotion === 'joy') {
                expect(emotionalState.valence).toBeGreaterThan(0);
            }
        });
    });

    describe('🛡️ Gestion d\'erreurs et robustesse', () => {
        it('devrait gérer gracieusement les IA-élèves inexistantes', () => {
            // Act & Assert
            const nonExistentStudent = simulator.getComprehensiveStatus('inexistent_student');
            expect(nonExistentStudent).toBeUndefined();

            // Évolution d'un étudiant inexistant devrait lever une erreur
            expect(async () => {
                await simulator.evolveAIStudentComprehensive('inexistent_student');
            }).rejects.toThrow();
        });

        it('devrait valider les paramètres d\'entrée', async () => {
            // Arrange
            const invalidPersonalityType = 'invalid_personality' as AIStudentPersonalityType;

            // Act & Assert - Devrait lever des erreurs pour paramètres invalides
            await expect(async () => {
                await simulator.createAdvancedAIStudent(
                    'Invalid_Test', invalidPersonalityType, 'school_environment'
                );
            }).rejects.toThrow();
        });

        it('devrait maintenir la stabilité avec concepts vides ou malformés', async () => {
            // Arrange
            const aiStudent = await simulator.createAdvancedAIStudent(
                'Stability_Test', 'curious_student', 'deaf_family_home'
            );

            // Act & Assert - Ne devrait pas crasher avec des entrées problématiques
            await expect(async () => {
                await simulator.simulateAdvancedLearning(aiStudent, '', '');
            }).not.toThrow();

            await expect(async () => {
                await simulator.simulateAdvancedLearning(
                    aiStudent,
                    'a'.repeat(1000), // Concept très long
                    'b'.repeat(5000)  // Explication très longue
                );
            }).not.toThrow();
        });
    });

    describe('🔄 Intégration des systèmes', () => {
        it('devrait coordonner tous les sous-systèmes efficacement', async () => {
            // Arrange
            const aiStudent = await simulator.createAdvancedAIStudent(
                'Integration_Test', 'energetic_pupil', 'community_center'
            );

            // Act
            const reaction = await simulator.simulateAdvancedLearning(
                aiStudent, 'integration_concept', 'Test d\'intégration des systèmes'
            );

            // Assert - Vérifier que tous les systèmes ont contribué
            expect(reaction.emotionalState).toBeDefined(); // Système émotionnel
            expect(reaction.recalledMemories).toBeDefined(); // Système de mémoire
            expect(reaction.evolutionMetrics).toBeDefined(); // Système d\'évolution
            expect(aiStudent.personalityProfile).toBeDefined(); // Système de personnalité

            // Métriques d\'intégration
            expect(reaction.metadata.influencingFactors).toContain('personality');
            expect(reaction.metadata.systemVersions).toBeDefined();
            expect(Object.keys(reaction.metadata.systemVersions)).toHaveLength(4);
        });

        it('devrait maintenir la synchronisation entre systèmes', async () => {
            // Arrange
            const aiStudent = await simulator.createAdvancedAIStudent(
                'Sync_Test', 'patient_apprentice', 'school_environment'
            );

            // Act - Apprentissages multiples pour tester synchronisation
            for (let i = 0; i < 3; i++) {
                await simulator.simulateAdvancedLearning(
                    aiStudent, `concept_${i}`, `Explication ${i}`
                );
            }

            // Attendre cycle de synchronisation
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert - L\'état devrait être cohérent
            const currentStatus = simulator.getComprehensiveStatus(aiStudent.name);
            expect(currentStatus).toBeDefined();
            expect(currentStatus!.memoryStats.totalMemories).toBeGreaterThan(0);
            expect(currentStatus!.totalLearningTime).toBeGreaterThan(0);
        });
    });

    describe('⚡ Performance et optimisation', () => {
        it('devrait traiter les simulations rapidement', async () => {
            // Arrange
            const aiStudent = await simulator.createAdvancedAIStudent(
                'Performance_Test', 'curious_student', 'deaf_family_home'
            );

            // Act
            const startTime = Date.now();
            await simulator.simulateAdvancedLearning(
                aiStudent, 'performance_concept', 'Test de performance'
            );
            const endTime = Date.now();

            // Assert - Simulation devrait prendre moins de 1 seconde
            const processingTime = endTime - startTime;
            expect(processingTime).toBeLessThan(1000);
        });

        it('devrait gérer multiple IA-élèves simultanément', async () => {
            // Arrange
            const studentPromises = [];
            for (let i = 0; i < 3; i++) {
                studentPromises.push(
                    simulator.createAdvancedAIStudent(
                        `Concurrent_${i}`, 'curious_student', 'deaf_family_home'
                    )
                );
            }

            const students = await Promise.all(studentPromises);

            // Act - Simulations simultanées
            const reactionPromises = students.map(student =>
                simulator.simulateAdvancedLearning(
                    student, 'concurrent_concept', 'Test simultané'
                )
            );

            const reactions = await Promise.all(reactionPromises);

            // Assert
            expect(reactions).toHaveLength(3);
            reactions.forEach(reaction => {
                expect(reaction.basicReaction.comprehension).toBeGreaterThanOrEqual(0.1);
                expect(reaction.metadata.processingTime).toBeGreaterThan(0);
            });
        });
    });
});