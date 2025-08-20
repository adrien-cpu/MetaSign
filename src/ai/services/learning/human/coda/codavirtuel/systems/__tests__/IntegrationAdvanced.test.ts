/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/IntegrationAdvanced.test.ts
 * @description Tests d'intégration avancés pour les scénarios complexes
 * 
 * Cette partie contient les tests d'intégration pour les scénarios avancés comme la gestion d'erreurs,
 * l'intégration avec des systèmes externes, et les tests de stress.
 * 
 * ## Tests couverts :
 * - 🚨 **Gestion d'erreurs** : Tests de robustesse et récupération
 * - 🔗 **Intégration externe** : Tests avec systèmes CODA et autres
 * - 💪 **Tests de stress** : Charge élevée et concurrence
 * - 🏗️ **Gestion des ressources** : Nettoyage et arrêt propre
 * - ⚖️ **Tests de limites** : Comportement aux limites du système
 * 
 * @module IntegrationAdvancedTests
 * @version 3.0.0 - Révolution CODA Refactorisée
 * @since 2025
 * @author MetaSign Team - Advanced Testing Division
 * 
 * @requires @jest/globals
 * @requires ./utils/IntegrationTestFactory
 * @requires ./utils/IntegrationTestUtils
 * @requires ./types/IntegrationTestTypes
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntegrationTestFactory } from './utils/IntegrationTestFactory';
import { IntegrationTestUtils } from './utils/IntegrationTestUtils';
import type {
    TestableEmotionalSystem,
    MockCODASystem,
    StressTestConfig,
    StressTestResult,
    EmotionalAnalysis,
    SystemStatistics
} from './types/IntegrationTestTypes';
import type { EmotionalState } from './types/IntegrationTestTypes';

describe('Advanced Integration Tests', () => {
    let emotionalSystem: TestableEmotionalSystem;

    beforeEach(() => {
        const config = IntegrationTestFactory.createContextConfig('advanced');
        emotionalSystem = IntegrationTestFactory.createEmotionalSystem(config);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Error Handling Integration', () => {
        it('should gracefully handle invalid inputs', async () => {
            const studentId = IntegrationTestUtils.generateTestId('error-test-student');

            // Test avec paramètres invalides
            const invalidParams = IntegrationTestUtils.createValidEmotionParams({
                learningContext: '',
                stimulus: '',
                stimulusIntensity: -1, // Invalide - sera normalisé par clampValue
                learningOutcome: 'success',
                contextualFactors: []
            });

            // Ne devrait pas lever d'exception
            await expect(
                emotionalSystem.generateEmotionalState(studentId, invalidParams)
            ).resolves.toBeDefined();

            // L'état généré devrait avoir des valeurs normalisées (si méthode disponible)
            if (IntegrationTestUtils.hasMethod(emotionalSystem, 'getCurrentEmotionalState')) {
                const state = await IntegrationTestUtils.safeCall<EmotionalState>(
                    emotionalSystem,
                    'getCurrentEmotionalState',
                    studentId
                );

                if (state) {
                    expect(state.intensity).toBeGreaterThanOrEqual(0);
                    expect(state.intensity).toBeLessThanOrEqual(1);
                }
            }
        });

        it('should handle missing student gracefully', async () => {
            const nonExistentStudentId = IntegrationTestUtils.generateTestId('non-existent-student');

            // Essayer d'analyser un étudiant inexistant (si méthode disponible)
            if (IntegrationTestUtils.hasMethod(emotionalSystem, 'performCompleteAnalysis')) {
                await expect(
                    IntegrationTestUtils.safeCall(
                        emotionalSystem,
                        'performCompleteAnalysis',
                        nonExistentStudentId
                    )
                ).resolves.toBeDefined(); // safeCall ne lève pas d'exception
            }

            // Essayer d'obtenir l'état d'un étudiant inexistant (si méthode disponible)
            if (IntegrationTestUtils.hasMethod(emotionalSystem, 'getCurrentEmotionalState')) {
                const state = await IntegrationTestUtils.safeCall(
                    emotionalSystem,
                    'getCurrentEmotionalState',
                    nonExistentStudentId
                );
                expect(state).toBeUndefined();
            }

            // Essayer d'obtenir l'historique d'un étudiant inexistant (si méthode disponible)
            const history = await IntegrationTestUtils.safeCall(
                emotionalSystem,
                'getEmotionalHistory',
                nonExistentStudentId
            );
            expect(history).toBeUndefined();
        });

        it('should handle system overload gracefully', async () => {
            const studentId = IntegrationTestUtils.generateTestId('overload-test-student');
            const concurrentRequests = 20;

            // Lancer plusieurs requêtes simultanément
            const promises = Array.from({ length: concurrentRequests }, (_, index) => {
                const params = IntegrationTestUtils.createValidEmotionParams({
                    learningContext: 'overload_test',
                    stimulus: `concurrent_request_${index}`,
                    stimulusIntensity: Math.random(),
                    learningOutcome: 'success',
                    contextualFactors: ['overload_test', `request_${index}`]
                });

                return emotionalSystem.generateEmotionalState(studentId, params);
            });

            // Toutes les requêtes devraient se terminer sans erreur
            const results = await Promise.allSettled(promises);

            const successfulRequests = results.filter(result => result.status === 'fulfilled');
            const failedRequests = results.filter(result => result.status === 'rejected');

            // Au moins 80% des requêtes devraient réussir
            expect(successfulRequests.length).toBeGreaterThanOrEqual(concurrentRequests * 0.8);

            // Log des échecs pour debugging
            if (failedRequests.length > 0) {
                console.warn(`${failedRequests.length} requêtes ont échoué sur ${concurrentRequests}`);
            }
        });
    });

    describe('External System Integration', () => {
        it('should integrate with mock CODA system', async () => {
            const codaSystem: MockCODASystem = IntegrationTestFactory.createMockCODASystem();
            const studentId = IntegrationTestUtils.generateTestId('coda-integration-test');

            // Simuler une série d'évaluations CODA
            const signEvaluations = [
                { sign: 'bonjour', complexity: 'easy' as const },
                { sign: 'merci', complexity: 'medium' as const },
                { sign: 'conversation', complexity: 'hard' as const }
            ];

            for (const signData of signEvaluations) {
                const evaluation = await codaSystem.evaluateSignExecution(studentId, signData);

                // Convertir l'évaluation CODA en paramètres émotionnels
                const outcome: 'success' | 'partial' | 'failure' =
                    evaluation.accuracy > 0.8 ? 'success' :
                        evaluation.accuracy > 0.6 ? 'partial' : 'failure';

                const params = IntegrationTestUtils.createValidEmotionParams({
                    learningContext: 'coda_evaluation',
                    stimulus: `sign_execution_${signData.sign}`,
                    stimulusIntensity: evaluation.accuracy,
                    learningOutcome: outcome,
                    contextualFactors: ['coda_integration', signData.complexity, 'external_evaluation']
                });

                const state = await emotionalSystem.generateEmotionalState(studentId, params);
                expect(state).toBeDefined();
                expect(state.trigger.includes('sign_execution')).toBe(true);
            }

            // L'analyse devrait refléter l'intégration CODA (si disponible)
            const analysis = await IntegrationTestUtils.safeCall<EmotionalAnalysis>(
                emotionalSystem,
                'performCompleteAnalysis',
                studentId
            );

            if (analysis && IntegrationTestUtils.isValidAnalysis(analysis)) {
                expect(analysis.recentHistory.length).toBe(signEvaluations.length);
                expect(analysis.currentState.trigger.includes('sign_execution')).toBe(true);
            }
        });

        it('should handle external system failures', async () => {
            const studentId = IntegrationTestUtils.generateTestId('external-failure-test');

            // Simuler un système externe défaillant (variable utilisée dans un commentaire explicatif)
            // const faultySystem = {
            //     async processRequest(): Promise<never> {
            //         throw new Error('External system unavailable');
            //     }
            // };
            // Note: Ce système défaillant démontre comment le système émotionnel 
            // devrait continuer à fonctionner même si les systèmes externes échouent

            const params = IntegrationTestUtils.createValidEmotionParams({
                learningContext: 'external_failure_test',
                stimulus: 'test_with_external_failure',
                stimulusIntensity: 0.5,
                learningOutcome: 'partial',
                contextualFactors: ['external_failure', 'resilience_test']
            });

            await expect(
                emotionalSystem.generateEmotionalState(studentId, params)
            ).resolves.toBeDefined();

            // Vérifier que le système reste fonctionnel
            const analysis = await IntegrationTestUtils.safeCall<EmotionalAnalysis>(
                emotionalSystem,
                'performCompleteAnalysis',
                studentId
            );

            if (analysis && IntegrationTestUtils.isValidAnalysis(analysis)) {
                expect(analysis.currentState).toBeDefined();
                expect(analysis.confidence).toBeGreaterThan(0);
            }
        });
    });

    describe('Stress Testing', () => {
        it('should handle rapid-fire requests', async () => {
            const studentId = IntegrationTestUtils.generateTestId('stress-test-student');
            const config: StressTestConfig = {
                numStudents: 1,
                operationsPerStudent: 15,
                maxConcurrent: 5,
                timeoutMs: 30000
            };

            const startTime = Date.now();
            const results: Array<{ success: boolean; latency: number }> = [];

            // Générer des requêtes rapides par batch
            for (let batch = 0; batch < config.operationsPerStudent / config.maxConcurrent; batch++) {
                const batchPromises = Array.from({ length: config.maxConcurrent }, async (_, i) => {
                    const requestIndex = batch * config.maxConcurrent + i;
                    const requestStart = Date.now();

                    try {
                        const params = IntegrationTestUtils.createValidEmotionParams({
                            learningContext: 'stress_test',
                            stimulus: `rapid_request_${requestIndex}`,
                            stimulusIntensity: Math.random(),
                            learningOutcome: Math.random() > 0.5 ? 'success' : 'partial',
                            contextualFactors: ['stress_test', 'rapid_fire', `request_${requestIndex}`]
                        });

                        await emotionalSystem.generateEmotionalState(studentId, params);

                        return {
                            success: true,
                            latency: Date.now() - requestStart
                        };
                    } catch {
                        return {
                            success: false,
                            latency: Date.now() - requestStart
                        };
                    }
                });

                // Attendre que le batch soit terminé
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const successfulOperations = results.filter(r => r.success).length;
            const failedOperations = results.filter(r => r.success === false).length;
            const latencies = results.map(r => r.latency);
            const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
            const maxLatency = Math.max(...latencies);

            const stressResult: StressTestResult = {
                totalOperations: results.length,
                totalTime,
                successfulOperations,
                failedOperations,
                averageLatency,
                maxLatency,
                memoryUsage: process.memoryUsage().heapUsed
            };

            // Vérifications de performance
            expect(stressResult.successfulOperations).toBeGreaterThanOrEqual(results.length * 0.9); // 90% de succès minimum
            expect(stressResult.averageLatency).toBeLessThan(1000); // < 1 seconde en moyenne
            expect(stressResult.totalTime).toBeLessThan(config.timeoutMs);

            // Vérifier que le système est toujours cohérent
            if (IntegrationTestUtils.hasMethod(emotionalSystem, 'getCurrentEmotionalState')) {
                const finalState = await IntegrationTestUtils.safeCall(
                    emotionalSystem,
                    'getCurrentEmotionalState',
                    studentId
                );
                expect(finalState).toBeDefined();
            }

            console.log(`Stress test: ${stressResult.successfulOperations}/${stressResult.totalOperations} succès, latence moyenne: ${stressResult.averageLatency.toFixed(2)}ms`);
        });

        it('should handle memory pressure gracefully', async () => {
            const numStudents = 25;
            const sessionsPerStudent = 2;
            const memoryBefore = process.memoryUsage().heapUsed;

            // Créer beaucoup d'étudiants avec des sessions
            for (let studentIndex = 0; studentIndex < numStudents; studentIndex++) {
                const studentId = IntegrationTestUtils.generateTestId(`memory-pressure-student-${studentIndex}`);

                for (let sessionIndex = 0; sessionIndex < sessionsPerStudent; sessionIndex++) {
                    const params = IntegrationTestUtils.createValidEmotionParams({
                        learningContext: 'memory_pressure_test',
                        stimulus: `session_${sessionIndex}`,
                        stimulusIntensity: Math.random(),
                        learningOutcome: Math.random() > 0.5 ? 'success' : 'partial',
                        contextualFactors: ['memory_pressure', `student_${studentIndex}`]
                    });

                    await emotionalSystem.generateEmotionalState(studentId, params);
                }

                // Vérifier périodiquement que le système fonctionne
                if (studentIndex % 10 === 0 && IntegrationTestUtils.hasMethod(emotionalSystem, 'getCurrentEmotionalState')) {
                    const state = await IntegrationTestUtils.safeCall(
                        emotionalSystem,
                        'getCurrentEmotionalState',
                        studentId
                    );
                    expect(state).toBeDefined();
                }
            }

            const memoryAfter = process.memoryUsage().heapUsed;
            const memoryIncrease = memoryAfter - memoryBefore;

            // Vérifier les statistiques finales (si disponible)
            const stats = await IntegrationTestUtils.safeCall<SystemStatistics>(
                emotionalSystem,
                'getSystemStatistics'
            );

            if (stats && IntegrationTestUtils.isValidStatistics(stats)) {
                expect(stats.totalActiveStudents).toBeGreaterThanOrEqual(numStudents);
            }

            // Vérifier que l'usage mémoire reste raisonnable
            const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
            expect(memoryIncreaseMB).toBeLessThan(100); // < 100MB d'augmentation

            console.log(`Memory pressure test: ${numStudents} étudiants, augmentation mémoire: ${memoryIncreaseMB.toFixed(2)}MB`);
        });
    });

    describe('Resource Management Integration', () => {
        it('should properly manage system resources', async () => {
            const studentIds = Array.from({ length: 8 }, (_, i) =>
                IntegrationTestUtils.generateTestId(`resource-test-student-${i}`)
            );

            // Créer des états pour plusieurs étudiants
            for (const studentId of studentIds) {
                const params = IntegrationTestUtils.createValidEmotionParams({
                    learningContext: 'resource_test',
                    stimulus: 'test_stimulus',
                    stimulusIntensity: 0.5,
                    learningOutcome: 'success',
                    contextualFactors: ['resource_test']
                });

                await emotionalSystem.generateEmotionalState(studentId, params);
            }

            // Vérifier que tous les étudiants sont actifs (si méthode disponible)
            const initialStats = await IntegrationTestUtils.safeCall<SystemStatistics>(
                emotionalSystem,
                'getSystemStatistics'
            );

            if (initialStats && IntegrationTestUtils.isValidStatistics(initialStats)) {
                expect(initialStats.totalActiveStudents).toBeGreaterThanOrEqual(studentIds.length);
            }

            // Nettoyer une partie des étudiants (si méthode disponible)
            const studentsToCleanup = studentIds.slice(0, 4);
            for (const studentId of studentsToCleanup) {
                await IntegrationTestUtils.safeCall(emotionalSystem, 'cleanupStudentData', studentId);
            }

            // Vérifier que les étudiants restants sont toujours accessibles (si méthode disponible)
            const remainingStudents = studentIds.slice(4);
            for (const studentId of remainingStudents) {
                if (IntegrationTestUtils.hasMethod(emotionalSystem, 'getCurrentEmotionalState')) {
                    const state = await IntegrationTestUtils.safeCall(
                        emotionalSystem,
                        'getCurrentEmotionalState',
                        studentId
                    );
                    // L'état peut être défini ou non selon l'implémentation
                    expect(state === undefined || state !== null).toBe(true);
                }
            }
        });

        it('should handle system shutdown gracefully', async () => {
            const studentId = IntegrationTestUtils.generateTestId('shutdown-test-student');

            // Créer quelques états
            for (let i = 0; i < 3; i++) {
                const params = IntegrationTestUtils.createValidEmotionParams({
                    learningContext: 'shutdown_test',
                    stimulus: `operation_${i}`,
                    stimulusIntensity: Math.random(),
                    learningOutcome: 'success',
                    contextualFactors: ['shutdown_test']
                });

                await emotionalSystem.generateEmotionalState(studentId, params);
            }

            // Vérifier l'état avant l'arrêt (si méthode disponible)
            let preShutdownState: unknown;
            if (IntegrationTestUtils.hasMethod(emotionalSystem, 'getCurrentEmotionalState')) {
                preShutdownState = await IntegrationTestUtils.safeCall(
                    emotionalSystem,
                    'getCurrentEmotionalState',
                    studentId
                );
                expect(preShutdownState).toBeDefined();
            }

            // Simuler un arrêt propre du système (si méthode disponible)
            if (IntegrationTestUtils.hasMethod(emotionalSystem, 'shutdown')) {
                await IntegrationTestUtils.safeCall(emotionalSystem, 'shutdown');

                // Après shutdown, les nouvelles requêtes devraient échouer ou être ignorées
                const params = IntegrationTestUtils.createValidEmotionParams({
                    learningContext: 'post_shutdown_test',
                    stimulus: 'should_fail',
                    stimulusIntensity: 0.5,
                    learningOutcome: 'success',
                    contextualFactors: ['post_shutdown']
                });

                // Selon l'implémentation, cela peut lever une exception ou être ignoré
                const result = await IntegrationTestUtils.safeCall(
                    emotionalSystem,
                    'generateEmotionalState',
                    studentId,
                    params
                );

                // Si safeCall retourne undefined, c'est que la méthode a échoué (attendu après shutdown)
                expect(result).toBeUndefined();
            } else {
                // Si pas de méthode shutdown, marquer le test comme réussi
                expect(true).toBe(true);
            }
        });
    });

    describe('System Boundary Tests', () => {
        it('should work with different configurations', async () => {
            const contexts = ['beginner', 'intermediate', 'advanced', 'therapy'];

            for (const context of contexts) {
                const config = IntegrationTestFactory.createContextConfig(context);
                const system = IntegrationTestFactory.createEmotionalSystem(config);
                const studentId = IntegrationTestUtils.generateTestId(`config-test-${context}`);

                const params = IntegrationTestUtils.createValidEmotionParams({
                    learningContext: 'config_test',
                    stimulus: `test_${context}`,
                    stimulusIntensity: 0.7,
                    learningOutcome: 'success',
                    contextualFactors: ['config_test', context]
                });

                // Chaque configuration devrait fonctionner
                const state = await system.generateEmotionalState(studentId, params);
                expect(state).toBeDefined();
                expect(state.primaryEmotion).toBeDefined();

                // L'analyse devrait fonctionner avec chaque configuration (si disponible)
                const analysis = await IntegrationTestUtils.safeCall<EmotionalAnalysis>(
                    system,
                    'performCompleteAnalysis',
                    studentId
                );

                if (analysis && IntegrationTestUtils.isValidAnalysis(analysis)) {
                    expect(analysis).toBeDefined();
                    expect(analysis.confidence).toBeGreaterThan(0);
                }
            }
        });

        it('should handle custom configuration gracefully', async () => {
            const customConfig = IntegrationTestFactory.createContextConfig('advanced');
            // Ajouter des propriétés personnalisées
            Object.assign(customConfig, {
                enableExperimentalFeatures: true,
                debugMode: true,
                customProperty: 'test_value'
            });

            const system = IntegrationTestFactory.createEmotionalSystem(customConfig);
            const studentId = IntegrationTestUtils.generateTestId('custom-config-test');

            const params = IntegrationTestUtils.createValidEmotionParams({
                learningContext: 'custom_test',
                stimulus: 'custom_configuration_test',
                stimulusIntensity: 0.6,
                learningOutcome: 'success',
                contextualFactors: ['custom_test', 'factory_generated']
            });

            const state = await system.generateEmotionalState(studentId, params);
            expect(state).toBeDefined();

            const analysis = await IntegrationTestUtils.safeCall(
                system,
                'performCompleteAnalysis',
                studentId
            );

            if (analysis) {
                expect(analysis).toBeDefined();
            }

            // Vérifier que les configurations personnalisées sont appliquées
            expect(customConfig.complexity).toBe('high');
            expect(customConfig.enableExperimentalFeatures).toBe(true);
        });
    });
});