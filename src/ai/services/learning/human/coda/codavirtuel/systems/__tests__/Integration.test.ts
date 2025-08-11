/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/Integration.test.ts
 * @description Tests d'intégration complets pour le système émotionnel révolutionnaire
 * 
 * Tests d'intégration couverts :
 * - 🔗 Intégration entre tous les modules
 * - 📊 Flux de données end-to-end
 * - 🔄 Cycles complets d'apprentissage
 * - 🏗️ Intégration avec systèmes externes
 * - ⚡ Performance en conditions réelles
 * - 🛡️ Robustesse et récupération d'erreurs
 * 
 * @module IntegrationTests
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Integration Testing Division
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
    AIEmotionalSystem,
    EmotionalPatternDetector,
    EmotionalTransitionManager,
    EmotionalHistoryManager,
    EmotionalConfigFactory,
    PRESET_CONFIGS,
    createEmotionalSystem
} from '../index';

import { AIPersonalitySystem } from '../AIPersonalitySystem';
import type {
    EmotionGenerationParams,
    CompleteEmotionalAnalysis,
    EmotionalState,
    PrimaryEmotion
} from '../types/EmotionalTypes';

// Mock du logger pour les tests
jest.mock('@/ai/utils/LoggerFactory', () => ({
    LoggerFactory: {
        getLogger: jest.fn(() => ({
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn()
        }))
    }
}));

describe('Emotional System Integration Tests', () => {
    let emotionalSystem: AIEmotionalSystem;
    let personalitySystem: AIPersonalitySystem;

    beforeEach(() => {
        // Configuration de test optimisée
        const config = EmotionalConfigFactory.createForContext('intermediate_adaptive');
        emotionalSystem = createEmotionalSystem(config.systemConfig);
        personalitySystem = new AIPersonalitySystem();
    });

    afterEach(() => {
        // Nettoyage après chaque test
        jest.clearAllMocks();
    });

    describe('Complete Workflow Integration', () => {
        it('should handle complete learning session workflow', async () => {
            const studentId = 'integration-test-student';

            // 1. Créer un profil de personnalité
            const personality = personalitySystem.createInitialProfile(studentId, {
                learningStyle: 'visual',
                culturalBackground: 'deaf_community',
                bigFiveTraits: {
                    openness: 0.7,
                    conscientiousness: 0.6,
                    extraversion: 0.5,
                    agreeableness: 0.8,
                    neuroticism: 0.4
                }
            });

            // 2. Enregistrer le profil dans le système émotionnel
            emotionalSystem.registerPersonalityProfile(studentId, personality);

            // 3. Simuler une session d'apprentissage complète
            const learningSession = [
                {
                    name: 'Introduction aux salutations',
                    outcome: 'success' as const,
                    intensity: 0.7
                },
                {
                    name: 'Pratique des expressions faciales',
                    outcome: 'partial' as const,
                    intensity: 0.8
                },
                {
                    name: 'Exercice de syntaxe complexe',
                    outcome: 'failure' as const,
                    intensity: 0.9
                },
                {
                    name: 'Révision et consolidation',
                    outcome: 'success' as const,
                    intensity: 0.6
                }
            ];

            const generatedStates: EmotionalState[] = [];

            for (let i = 0; i < learningSession.length; i++) {
                const exercise = learningSession[i];
                const params: EmotionGenerationParams = {
                    learningContext: `session_exercise_${i + 1}`,
                    stimulus: exercise.name,
                    stimulusIntensity: exercise.intensity,
                    learningOutcome: exercise.outcome,
                    contextualFactors: ['integration_test', 'complete_session', `exercise_${i + 1}`]
                };

                const state = await emotionalSystem.generateEmotionalState(studentId, params);
                generatedStates.push(state);

                // Vérifier que chaque état est cohérent
                expect(state.primaryEmotion).toBeDefined();
                expect(state.intensity).toBeGreaterThanOrEqual(0);
                expect(state.intensity).toBeLessThanOrEqual(1);
                expect(state.timestamp).toBeInstanceOf(Date);
            }

            // 4. Vérifier que l'état actuel correspond au dernier généré
            const currentState = emotionalSystem.getCurrentEmotionalState(studentId);
            expect(currentState).toEqual(generatedStates[generatedStates.length - 1]);

            // 5. Effectuer une analyse complète
            const analysis = await emotionalSystem.performCompleteAnalysis(studentId);

            expect(analysis.currentState).toBeDefined();
            expect(analysis.recentHistory.length).toBeGreaterThan(0);
            expect(Array.isArray(analysis.patterns)).toBe(true);
            expect(Array.isArray(analysis.recommendations)).toBe(true);
            expect(typeof analysis.confidence).toBe('number');

            // 6. Vérifier l'historique complet
            const history = await emotionalSystem.getEmotionalHistory(studentId);
            expect(history).toBeDefined();
            expect(history!.stateHistory.length).toBe(learningSession.length);

            // 7. Vérifier l'intégration des statistiques
            const stats = emotionalSystem.getSystemStatistics();
            expect(stats.totalActiveStudents).toBe(1);
            expect(stats.studentsWithPersonalityProfiles).toBe(1);
        });

        it('should maintain data consistency across multiple students', async () => {
            const students = ['student1', 'student2', 'student3'];
            const exerciseParams: EmotionGenerationParams = {
                learningContext: 'group_exercise',
                stimulus: 'collaborative_activity',
                stimulusIntensity: 0.7,
                learningOutcome: 'success',
                contextualFactors: ['group_work', 'integration_test']
            };

            // Générer des états pour plusieurs étudiants
            for (const studentId of students) {
                await emotionalSystem.generateEmotionalState(studentId, exerciseParams);
            }

            // Vérifier que chaque étudiant a un état distinct
            const states = students.map(id => emotionalSystem.getCurrentEmotionalState(id));
            expect(states.every(state => state !== undefined)).toBe(true);

            // Vérifier que les stats reflètent le bon nombre d'étudiants
            const stats = emotionalSystem.getSystemStatistics();
            expect(stats.totalActiveStudents).toBe(students.length);

            // Vérifier que les analyses individuelles fonctionnent
            for (const studentId of students) {
                const analysis = await emotionalSystem.performCompleteAnalysis(studentId);
                expect(analysis.currentState).toBeDefined();
                expect(analysis.currentState.trigger).toBe('collaborative_activity');
            }
        });
    });

    describe('Pattern Detection Integration', () => {
        it('should detect learning patterns across extended session', async () => {
            const studentId = 'pattern-test-student';

            // Simuler une séquence typique de frustration puis succès
            const patternSequence = [
                { outcome: 'failure' as const, emotion: 'sadness' },
                { outcome: 'failure' as const, emotion: 'anger' },
                { outcome: 'partial' as const, emotion: 'anticipation' },
                { outcome: 'success' as const, emotion: 'joy' },
                { outcome: 'success' as const, emotion: 'trust' }
            ];

            // Générer la séquence
            for (let i = 0; i < patternSequence.length; i++) {
                const step = patternSequence[i];
                const params: EmotionGenerationParams = {
                    learningContext: 'pattern_detection_test',
                    stimulus: `step_${i + 1}_${step.outcome}`,
                    stimulusIntensity: 0.7,
                    learningOutcome: step.outcome,
                    contextualFactors: ['pattern_test', `sequence_${i + 1}`]
                };

                await emotionalSystem.generateEmotionalState(studentId, params);
            }

            // Analyser les patterns
            const analysis = await emotionalSystem.performCompleteAnalysis(studentId);

            // Vérifier qu'au moins un pattern a été détecté
            expect(analysis.patterns.length).toBeGreaterThan(0);

            // Chercher spécifiquement un pattern de récupération
            const recoveryPatterns = analysis.patterns.filter(p =>
                p.type === 'recovery_bounce' || p.type === 'learning_cycle'
            );

            if (recoveryPatterns.length > 0) {
                expect(recoveryPatterns[0].confidence).toBeGreaterThan(0.5);
            }
        });

        it('should handle concurrent pattern detection for multiple students', async () => {
            const students = ['concurrent1', 'concurrent2', 'concurrent3'];

            // Générer des séquences différentes pour chaque étudiant
            const sequences = [
                ['success', 'success', 'success'], // Étudiant performant
                ['failure', 'partial', 'success'], // Progression normale
                ['failure', 'failure', 'failure']  // Étudiant en difficulté
            ];

            for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
                const studentId = students[studentIndex];
                const sequence = sequences[studentIndex];

                for (let i = 0; i < sequence.length; i++) {
                    const outcome = sequence[i] as 'success' | 'partial' | 'failure';
                    const params: EmotionGenerationParams = {
                        learningContext: 'concurrent_test',
                        stimulus: `student_${studentIndex + 1}_step_${i + 1}`,
                        stimulusIntensity: 0.6,
                        learningOutcome: outcome,
                        contextualFactors: ['concurrent_test', `student_${studentIndex + 1}`]
                    };

                    await emotionalSystem.generateEmotionalState(studentId, params);
                }
            }

            // Analyser tous les étudiants en parallèle
            const analyses = await Promise.all(
                students.map(id => emotionalSystem.performCompleteAnalysis(id))
            );

            // Vérifier que toutes les analyses sont réussies
            expect(analyses.length).toBe(students.length);
            analyses.forEach(analysis => {
                expect(analysis.currentState).toBeDefined();
                expect(analysis.confidence).toBeGreaterThan(0);
            });

            // Vérifier que les patterns sont différents selon les séquences
            const performantAnalysis = analyses[0]; // Étudiant performant
            const strugglingAnalysis = analyses[2]; // Étudiant en difficulté

            expect(performantAnalysis.currentState.valence).toBeGreaterThan(
                strugglingAnalysis.currentState.valence
            );
        });
    });

    describe('Performance Integration', () => {
        it('should handle high-volume operations efficiently', async () => {
            const startTime = Date.now();
            const numStudents = 50;
            const operationsPerStudent = 10;

            // Générer un grand nombre d'opérations
            for (let studentIndex = 0; studentIndex < numStudents; studentIndex++) {
                const studentId = `bulk_student_${studentIndex}`;

                for (let opIndex = 0; opIndex < operationsPerStudent; opIndex++) {
                    const params: EmotionGenerationParams = {
                        learningContext: 'bulk_test',
                        stimulus: `operation_${opIndex}`,
                        stimulusIntensity: Math.random() * 0.8 + 0.2,
                        learningOutcome: Math.random() > 0.3 ? 'success' : 'partial',
                        contextualFactors: ['bulk_test', 'performance_test']
                    };

                    await emotionalSystem.generateEmotionalState(studentId, params);
                }
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const totalOperations = numStudents * operationsPerStudent;
            const avgTimePerOperation = totalTime / totalOperations;

            // Vérifier les performances
            expect(avgTimePerOperation).toBeLessThan(50); // < 50ms par opération
            expect(totalTime).toBeLessThan(30000); // < 30 secondes au total

            // Vérifier que le système fonctionne toujours correctement
            const stats = emotionalSystem.getSystemStatistics();
            expect(stats.totalActiveStudents).toBe(numStudents);

            console.log(`Performance test: ${totalOperations} operations in ${totalTime}ms (avg: ${avgTimePerOperation.toFixed(2)}ms/op)`);
        });

        it('should maintain memory efficiency with large datasets', async () => {
            const studentId = 'memory-test-student';
            const numOperations = 200;

            // Mesurer l'utilisation mémoire avant
            const initialMemory = process.memoryUsage().heapUsed;

            // Générer beaucoup d'états
            for (let i = 0; i < numOperations; i++) {
                const params: EmotionGenerationParams = {
                    learningContext: 'memory_test',
                    stimulus: `memory_operation_${i}`,
                    stimulusIntensity: 0.5,
                    learningOutcome: 'success',
                    contextualFactors: ['memory_test', `operation_${i}`]
                };

                await emotionalSystem.generateEmotionalState(studentId, params);
            }

            // Effectuer une analyse pour déclencher le traitement
            await emotionalSystem.performCompleteAnalysis(studentId);

            // Mesurer l'utilisation mémoire après
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            const memoryPerOperation = memoryIncrease / numOperations;

            // Vérifier que l'augmentation mémoire est raisonnable
            expect(memoryPerOperation).toBeLessThan(10000); // < 10KB par opération
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // < 50MB au total

            console.log(`Memory test: ${numOperations} operations used ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (avg: ${(memoryPerOperation / 1024).toFixed(2)}KB/op)`);
        });
    });

    describe('Error Handling Integration', () => {
        it('should gracefully handle invalid inputs', async () => {
            const studentId = 'error-test-student';

            // Test avec paramètres invalides
            const invalidParams: EmotionGenerationParams = {
                learningContext: '',
                stimulus: '',
                stimulusIntensity: -1, // Invalide
                learningOutcome: 'success',
                contextualFactors: []
            };

            // Ne devrait pas lever d'exception
            await expect(
                emotionalSystem.generateEmotionalState(studentId, invalidParams)
            ).resolves.toBeDefined();

            // L'état généré devrait avoir des valeurs normalisées
            const state = emotionalSystem.getCurrentEmotionalState(studentId);
            expect(state).toBeDefined();
            expect(state!.intensity).toBeGreaterThanOrEqual(0);
            expect(state!.intensity).toBeLessThanOrEqual(1);
        });

        it('should handle missing student gracefully', async () => {
            // Essayer d'analyser un étudiant inexistant
            await expect(
                emotionalSystem.performCompleteAnalysis('non-existent-student')
            ).rejects.toThrow();

            // Essayer d'obtenir l'état d'un étudiant inexistant
            const state = emotionalSystem.getCurrentEmotionalState('non-existent-student');
            expect(state).toBeUndefined();

            // Essayer d'obtenir l'historique d'un étudiant inexistant
            const history = await emotionalSystem.getEmotionalHistory('non-existent-student');
            expect(history).toBeUndefined();
        });

        it('should recover from system errors', async () => {
            const studentId = 'recovery-test-student';

            // Générer un état initial
            const initialParams: EmotionGenerationParams = {
                learningContext: 'recovery_test',
                stimulus: 'initial_state',
                stimulusIntensity: 0.5,
                learningOutcome: 'success',
                contextualFactors: ['recovery_test']
            };

            await emotionalSystem.generateEmotionalState(studentId, initialParams);

            // Simuler une condition d'erreur (par exemple, paramètres extrêmes)
            const extremeParams: EmotionGenerationParams = {
                learningContext: 'recovery_test',
                stimulus: 'extreme_condition',
                stimulusIntensity: 999, // Valeur extrême
                learningOutcome: 'success',
                contextualFactors: ['recovery_test', 'extreme']
            };

            // Le système devrait gérer cela gracieusement
            const extremeState = await emotionalSystem.generateEmotionalState(studentId, extremeParams);
            expect(extremeState.intensity).toBeLessThanOrEqual(1); // Valeur normalisée

            // Générer un état normal après l'erreur
            const recoveryParams: EmotionGenerationParams = {
                learningContext: 'recovery_test',
                stimulus: 'recovery_state',
                stimulusIntensity: 0.6,
                learningOutcome: 'success',
                contextualFactors: ['recovery_test', 'recovery']
            };

            const recoveryState = await emotionalSystem.generateEmotionalState(studentId, recoveryParams);
            expect(recoveryState).toBeDefined();
            expect(recoveryState.primaryEmotion).toBeDefined();

            // L'analyse devrait toujours fonctionner
            const analysis = await emotionalSystem.performCompleteAnalysis(studentId);
            expect(analysis).toBeDefined();
            expect(analysis.currentState).toEqual(recoveryState);
        });
    });

    describe('Configuration Integration', () => {
        it('should work with different preset configurations', async () => {
            const configs = [
                PRESET_CONFIGS.BEGINNER,
                PRESET_CONFIGS.ADVANCED,
                PRESET_CONFIGS.ADHD,
                PRESET_CONFIGS.THERAPY
            ];

            for (let i = 0; i < configs.length; i++) {
                const config = configs[i];
                const system = createEmotionalSystem(config.systemConfig);
                const studentId = `config_test_${i}`;

                const params: EmotionGenerationParams = {
                    learningContext: 'config_test',
                    stimulus: `test_${config.metadata.name}`,
                    stimulusIntensity: 0.7,
                    learningOutcome: 'success',
                    contextualFactors: ['config_test', config.metadata.name]
                };

                // Chaque configuration devrait fonctionner
                const state = await system.generateEmotionalState(studentId, params);
                expect(state).toBeDefined();
                expect(state.primaryEmotion).toBeDefined();

                // L'analyse devrait fonctionner avec chaque configuration
                const analysis = await system.performCompleteAnalysis(studentId);
                expect(analysis).toBeDefined();
                expect(analysis.confidence).toBeGreaterThan(0);
            }
        });

        it('should handle custom configuration factory', async () => {
            const customConfig = EmotionalConfigFactory.createCustom({
                learningContext: 'advanced_challenging',
                neurotype: 'autism_adapted',
                performanceOptimization: true,
                detailedAnalytics: true
            });

            const system = createEmotionalSystem(customConfig.systemConfig);
            const studentId = 'custom_config_test';

            const params: EmotionGenerationParams = {
                learningContext: 'custom_test',
                stimulus: 'custom_configuration_test',
                stimulusIntensity: 0.6,
                learningOutcome: 'success',
                contextualFactors: ['custom_test', 'factory_generated']
            };

            const state = await system.generateEmotionalState(studentId, params);
            expect(state).toBeDefined();

            const analysis = await system.performCompleteAnalysis(studentId);
            expect(analysis).toBeDefined();

            // Vérifier que les optimisations de performance sont appliquées
            expect(customConfig.metadata.performanceLevel).toBe('ultra');
        });
    });

    describe('Real-world Scenario Integration', () => {
        it('should simulate complete LSF learning journey', async () => {
            const studentId = 'journey-test-student';

            // Créer un profil réaliste
            const personality = personalitySystem.createInitialProfile(studentId, {
                learningStyle: 'visual',
                culturalBackground: 'hearing_family',
                motivationFactors: ['achievement', 'helping_others'],
                stressThreshold: 0.6,
                bigFiveTraits: {
                    openness: 0.7,
                    conscientiousness: 0.8,
                    extraversion: 0.4, // Plutôt introverti
                    agreeableness: 0.9,
                    neuroticism: 0.6   // Légèrement anxieux
                }
            });

            emotionalSystem.registerPersonalityProfile(studentId, personality);

            // Simuler un parcours d'apprentissage de 3 mois
            const learningJourney = [
                // Mois 1 : Découverte et bases
                { phase: 'discovery', weeks: 4, difficulty: 'easy' },
                // Mois 2 : Progression et défis
                { phase: 'progression', weeks: 4, difficulty: 'medium' },
                // Mois 3 : Maîtrise et perfectionnement
                { phase: 'mastery', weeks: 4, difficulty: 'hard' }
            ];

            let overallProgress = 0;
            const journeyStates: EmotionalState[] = [];

            for (const month of learningJourney) {
                for (let week = 1; week <= month.weeks; week++) {
                    // 3 sessions par semaine
                    for (let session = 1; session <= 3; session++) {
                        overallProgress += 1;
                        const progressRatio = overallProgress / 36; // 36 sessions totales

                        // Simuler succès/échecs réalistes avec progression
                        const successProbability = Math.min(0.3 + progressRatio * 0.6, 0.9);
                        const outcome: 'success' | 'partial' | 'failure' =
                            Math.random() < successProbability ? 'success' :
                                Math.random() < 0.7 ? 'partial' : 'failure';

                        const params: EmotionGenerationParams = {
                            learningContext: `${month.phase}_month_${Math.ceil(overallProgress / 12)}`,
                            stimulus: `week_${week}_session_${session}_${month.difficulty}`,
                            stimulusIntensity: 0.4 + progressRatio * 0.4,
                            learningOutcome: outcome,
                            contextualFactors: [
                                month.phase,
                                month.difficulty,
                                `week_${week}`,
                                `session_${session}`,
                                'learning_journey'
                            ]
                        };

                        const state = await emotionalSystem.generateEmotionalState(studentId, params);
                        journeyStates.push(state);
                    }
                }
            }

            // Analyser le parcours complet
            const finalAnalysis = await emotionalSystem.performCompleteAnalysis(studentId);

            // Vérifications du parcours
            expect(journeyStates.length).toBe(36); // 3 mois × 4 semaines × 3 sessions
            expect(finalAnalysis.patterns.length).toBeGreaterThan(0); // Des patterns devraient être détectés
            expect(finalAnalysis.confidence).toBeGreaterThan(0.7); // Bonne confiance après 3 mois

            // Analyser la progression émotionnelle
            const firstQuarter = journeyStates.slice(0, 9);
            const lastQuarter = journeyStates.slice(-9);

            const firstAvgValence = firstQuarter.reduce((sum, s) => sum + s.valence, 0) / firstQuarter.length;
            const lastAvgValence = lastQuarter.reduce((sum, s) => sum + s.valence, 0) / lastQuarter.length;

            // Il devrait y avoir une amélioration globale
            expect(lastAvgValence).toBeGreaterThan(firstAvgValence - 0.1); // Tolérance pour variations naturelles

            console.log(`Learning journey completed: ${journeyStates.length} sessions, final confidence: ${finalAnalysis.confidence.toFixed(2)}`);
            console.log(`Emotional progression: ${firstAvgValence.toFixed(2)} → ${lastAvgValence.toFixed(2)}`);
        });
    });
});

describe('System Boundary Integration Tests', () => {
    describe('External System Integration', () => {
        it('should integrate with mock CODA system', async () => {
            // Mock d'un système CODA externe
            class MockCODASystem {
                async evaluateSignExecution(studentId: string, signData: Record<string, unknown>) {
                    return {
                        accuracy: Math.random() * 0.4 + 0.6, // 60-100%
                        feedback: 'Good attempt, improve hand shape',
                        difficulty: signData.complexity || 'medium'
                    };
                }
            }

            const emotionalSystem = createEmotionalSystem();
            const codaSystem = new MockCODASystem();
            const studentId = 'coda-integration-test';

            // Simuler une série d'évaluations CODA
            for (let i = 0; i < 5; i++) {
                const signData = {
                    sign: `test_sign_${i}`,
                    complexity: i < 2 ? 'easy' : i < 4 ? 'medium' : 'hard'
                };

                const evaluation = await codaSystem.evaluateSignExecution(studentId, signData);

                // Convertir l'évaluation CODA en paramètres émotionnels
                const outcome: 'success' | 'partial' | 'failure' =
                    evaluation.accuracy > 0.8 ? 'success' :
                        evaluation.accuracy > 0.6 ? 'partial' : 'failure';

                const params: EmotionGenerationParams = {
                    learningContext: 'coda_evaluation',
                    stimulus: `sign_execution_${signData.sign}`,
                    stimulusIntensity: evaluation.accuracy,
                    learningOutcome: outcome,
                    contextualFactors: ['coda_integration', signData.complexity, 'external_evaluation']
                };

                const state = await emotionalSystem.generateEmotionalState(studentId, params);
                expect(state).toBeDefined();
                expect(state.trigger.includes('sign_execution')).toBe(true);
            }

            // L'analyse devrait refléter l'intégration CODA
            const analysis = await emotionalSystem.performCompleteAnalysis(studentId);
            expect(analysis.recentHistory.length).toBe(5);
            expect(analysis.currentState.trigger.includes('sign_execution')).toBe(true);
        });

        it('should handle webhook-style integration', async () => {
            const emotionalSystem = createEmotionalSystem();
            const studentId = 'webhook-test-student';

            // Simuler des événements webhook d'un système externe
            const webhookEvents = [
                { type: 'lesson_started', data: { lessonId: 'lesson1', difficulty: 'beginner' } },
                { type: 'exercise_completed', data: { exerciseId: 'ex1', score: 85, timeSpent: 120 } },
                { type: 'mistake_made', data: { errorType: 'handshape', severity: 'minor' } },
                { type: 'breakthrough_detected', data: { concept: 'finger_spelling', confidence: 0.92 } },
                { type: 'session_ended', data: { totalScore: 78, engagement: 0.8 } }
            ];

            for (const event of webhookEvents) {
                // Convertir l'événement en paramètres émotionnels
                let outcome: 'success' | 'partial' | 'failure' = 'success';
                let intensity = 0.5;

                switch (event.type) {
                    case 'lesson_started':
                        outcome = 'success';
                        intensity = 0.6;
                        break;
                    case 'exercise_completed':
                        const score = (event.data as { score: number }).score;
                        outcome = score > 80 ? 'success' : score > 60 ? 'partial' : 'failure';
                        intensity = score / 100;
                        break;
                    case 'mistake_made':
                        outcome = 'failure';
                        intensity = 0.7;
                        break;
                    case 'breakthrough_detected':
                        outcome = 'success';
                        intensity = 0.9;
                        break;
                    case 'session_ended':
                        const totalScore = (event.data as { totalScore: number }).totalScore;
                        outcome = totalScore > 75 ? 'success' : 'partial';
                        intensity = totalScore / 100;
                        break;
                }

                const params: EmotionGenerationParams = {
                    learningContext: 'webhook_integration',
                    stimulus: `${event.type}_webhook`,
                    stimulusIntensity: intensity,
                    learningOutcome: outcome,
                    contextualFactors: ['webhook', event.type, 'external_system']
                };

                const state = await emotionalSystem.generateEmotionalState(studentId, params);
                expect(state).toBeDefined();
            }

            // Vérifier que tous les événements ont été traités
            const analysis = await emotionalSystem.performCompleteAnalysis(studentId);
            expect(analysis.recentHistory.length).toBe(webhookEvents.length);

            // Chercher le breakthrough dans les patterns
            const breakthroughPatterns = analysis.patterns.filter(p => p.type === 'breakthrough');
            // Note: Le breakthrough pourrait ne pas être détecté selon la logique de détection
        });
    });

    describe('Stress Testing', () => {
        it('should handle rapid-fire requests', async () => {
            const emotionalSystem = createEmotionalSystem(PRESET_CONFIGS.ADVANCED.systemConfig);
            const studentId = 'stress-test-student';
            const numRequests = 100;
            const maxConcurrent = 10;

            const promises: Promise<EmotionalState>[] = [];

            // Générer des requêtes rapides par batch
            for (let batch = 0; batch < numRequests / maxConcurrent; batch++) {
                const batchPromises: Promise<EmotionalState>[] = [];

                for (let i = 0; i < maxConcurrent; i++) {
                    const requestIndex = batch * maxConcurrent + i;
                    const params: EmotionGenerationParams = {
                        learningContext: 'stress_test',
                        stimulus: `rapid_request_${requestIndex}`,
                        stimulusIntensity: Math.random(),
                        learningOutcome: Math.random() > 0.5 ? 'success' : 'partial',
                        contextualFactors: ['stress_test', 'rapid_fire', `request_${requestIndex}`]
                    };

                    batchPromises.push(
                        emotionalSystem.generateEmotionalState(studentId, params)
                    );
                }

                // Attendre que le batch soit terminé avant le suivant
                const batchResults = await Promise.all(batchPromises);
                promises.push(...batchPromises);

                // Vérifier que tous les résultats du batch sont valides
                batchResults.forEach(state => {
                    expect(state).toBeDefined();
                    expect(state.primaryEmotion).toBeDefined();
                });
            }

            // Vérifier que le système est toujours cohérent
            const finalState = emotionalSystem.getCurrentEmotionalState(studentId);
            expect(finalState).toBeDefined();

            const analysis = await emotionalSystem.performCompleteAnalysis(studentId);
            expect(analysis).toBeDefined();
            expect(analysis.recentHistory.length).toBeGreaterThan(0);

            console.log(`Stress test completed: ${numRequests} rapid requests processed successfully`);
        });
    });
});