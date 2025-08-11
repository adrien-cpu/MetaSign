/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/benchmarks/PerformanceBenchmarks.ts
 * @description Benchmarks de performance complets pour le système émotionnel révolutionnaire
 * 
 * Benchmarks inclus :
 * - ⚡ Performance de génération d'états émotionnels
 * - 🔍 Performance de détection de patterns
 * - 🌊 Performance des transitions émotionnelles
 * - 📊 Performance de gestion d'historique
 * - 💾 Utilisation mémoire et optimisations
 * - 🔄 Performance sous charge concurrent
 * 
 * @module PerformanceBenchmarks
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Performance Engineering Division
 */

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
    EmotionalState,
    CompleteEmotionalAnalysis
} from '../types/EmotionalTypes';

/**
 * Résultat d'un benchmark de performance
 */
export interface BenchmarkResult {
    /** Nom du benchmark */
    readonly name: string;
    /** Nombre d'opérations effectuées */
    readonly operations: number;
    /** Temps total d'exécution (ms) */
    readonly totalTime: number;
    /** Temps moyen par opération (ms) */
    readonly avgTime: number;
    /** Opérations par seconde */
    readonly opsPerSecond: number;
    /** Utilisation mémoire (bytes) */
    readonly memoryUsed: number;
    /** Mémoire par opération (bytes) */
    readonly memoryPerOp: number;
    /** Métadonnées additionnelles */
    readonly metadata: Record<string, unknown>;
}

/**
 * Configuration d'un benchmark
 */
export interface BenchmarkConfig {
    /** Nombre d'opérations à effectuer */
    readonly operations: number;
    /** Nombre de cycles de réchauffement */
    readonly warmupCycles: number;
    /** Collecter les métriques mémoire */
    readonly collectMemoryStats: boolean;
    /** Afficher les résultats détaillés */
    readonly verbose: boolean;
}

/**
 * Suite de benchmarks de performance pour le système émotionnel
 * 
 * @class PerformanceBenchmarkSuite
 * @description Exécute des benchmarks complets pour mesurer et optimiser
 * les performances du système émotionnel MetaSign.
 * 
 * @example
 * ```typescript
 * const benchmarks = new PerformanceBenchmarkSuite();
 * 
 * // Exécuter tous les benchmarks
 * const results = await benchmarks.runAllBenchmarks();
 * 
 * // Afficher les résultats
 * benchmarks.displayResults(results);
 * 
 * // Benchmark spécifique
 * const emotionGenResult = await benchmarks.benchmarkEmotionGeneration({
 *   operations: 1000,
 *   warmupCycles: 50,
 *   collectMemoryStats: true,
 *   verbose: true
 * });
 * ```
 */
export class PerformanceBenchmarkSuite {
    private readonly config: BenchmarkConfig;

    /**
     * Constructeur de la suite de benchmarks
     * 
     * @constructor
     * @param {Partial<BenchmarkConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<BenchmarkConfig>) {
        this.config = {
            operations: 1000,
            warmupCycles: 50,
            collectMemoryStats: true,
            verbose: false,
            ...config
        };
    }

    /**
     * Exécute tous les benchmarks de performance
     * 
     * @method runAllBenchmarks
     * @async
     * @returns {Promise<readonly BenchmarkResult[]>} Résultats de tous les benchmarks
     * @public
     */
    public async runAllBenchmarks(): Promise<readonly BenchmarkResult[]> {
        console.log('🚀 === BENCHMARKS SYSTÈME ÉMOTIONNEL METASIGN ===\n');
        console.log(`Configuration: ${this.config.operations} opérations, ${this.config.warmupCycles} cycles de réchauffement\n`);

        const results: BenchmarkResult[] = [];

        // 1. Benchmark génération d'états émotionnels
        console.log('⚡ Benchmark génération d\'états émotionnels...');
        results.push(await this.benchmarkEmotionGeneration());

        // 2. Benchmark détection de patterns
        console.log('🔍 Benchmark détection de patterns...');
        results.push(await this.benchmarkPatternDetection());

        // 3. Benchmark transitions émotionnelles
        console.log('🌊 Benchmark transitions émotionnelles...');
        results.push(await this.benchmarkEmotionalTransitions());

        // 4. Benchmark gestion d'historique
        console.log('📊 Benchmark gestion d\'historique...');
        results.push(await this.benchmarkHistoryManagement());

        // 5. Benchmark analyse complète
        console.log('🧠 Benchmark analyse complète...');
        results.push(await this.benchmarkCompleteAnalysis());

        // 6. Benchmark charge concurrente
        console.log('🔄 Benchmark charge concurrente...');
        results.push(await this.benchmarkConcurrentLoad());

        // 7. Benchmark configurations différentes
        console.log('⚙️ Benchmark configurations multiples...');
        results.push(await this.benchmarkMultipleConfigurations());

        console.log('\n✅ Tous les benchmarks terminés!\n');
        return results;
    }

    /**
     * Benchmark de génération d'états émotionnels
     */
    public async benchmarkEmotionGeneration(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult> {
        const benchConfig = { ...this.config, ...config };
        const system = createEmotionalSystem();
        const studentId = 'benchmark-emotion-student';

        // Préparer les paramètres de test
        const testParams: EmotionGenerationParams = {
            learningContext: 'benchmark_test',
            stimulus: 'benchmark_emotion_generation',
            stimulusIntensity: 0.7,
            learningOutcome: 'success',
            contextualFactors: ['benchmark', 'performance_test']
        };

        return await this.runBenchmark(
            'Génération États Émotionnels',
            benchConfig,
            async () => {
                await system.generateEmotionalState(studentId, testParams);
            },
            {
                testType: 'emotion_generation',
                systemConfig: 'default'
            }
        );
    }

    /**
     * Benchmark de détection de patterns
     */
    public async benchmarkPatternDetection(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult> {
        const benchConfig = { ...this.config, ...config };
        const detector = new EmotionalPatternDetector();

        // Préparer des données de test
        const testStates = this.generateTestEmotionalStates(200);

        return await this.runBenchmark(
            'Détection Patterns',
            benchConfig,
            async () => {
                await detector.analyzePatterns(testStates);
            },
            {
                testType: 'pattern_detection',
                statesCount: testStates.length
            }
        );
    }

    /**
     * Benchmark des transitions émotionnelles
     */
    public async benchmarkEmotionalTransitions(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult> {
        const benchConfig = { ...this.config, ...config };
        const transitionManager = new EmotionalTransitionManager();

        // Préparer des états de test
        const fromState = this.createTestEmotionalState('joy', 0.8);
        const toState = this.createTestEmotionalState('trust', 0.6);

        return await this.runBenchmark(
            'Transitions Émotionnelles',
            benchConfig,
            async () => {
                await transitionManager.calculateTransition(fromState, toState);
            },
            {
                testType: 'emotional_transitions',
                fromEmotion: fromState.primaryEmotion,
                toEmotion: toState.primaryEmotion
            }
        );
    }

    /**
     * Benchmark de gestion d'historique
     */
    public async benchmarkHistoryManagement(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult> {
        const benchConfig = { ...this.config, ...config };
        const historyManager = new EmotionalHistoryManager();
        const studentId = 'benchmark-history-student';

        // Pré-remplir l'historique
        const testStates = this.generateTestEmotionalStates(100);
        for (const state of testStates) {
            await historyManager.addState(studentId, state);
        }

        return await this.runBenchmark(
            'Gestion Historique',
            benchConfig,
            async () => {
                await historyManager.searchHistory(studentId, {
                    emotions: ['joy', 'trust'],
                    minIntensity: 0.5,
                    limit: 20
                });
            },
            {
                testType: 'history_management',
                preloadedStates: testStates.length
            }
        );
    }

    /**
     * Benchmark d'analyse complète
     */
    public async benchmarkCompleteAnalysis(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult> {
        const benchConfig = { ...this.config, ...config };
        const system = createEmotionalSystem();
        const studentId = 'benchmark-analysis-student';

        // Préparer un historique riche
        for (let i = 0; i < 50; i++) {
            const params: EmotionGenerationParams = {
                learningContext: 'benchmark_preparation',
                stimulus: `preparation_${i}`,
                stimulusIntensity: Math.random(),
                learningOutcome: Math.random() > 0.3 ? 'success' : 'partial',
                contextualFactors: ['benchmark', 'preparation']
            };
            await system.generateEmotionalState(studentId, params);
        }

        return await this.runBenchmark(
            'Analyse Complète',
            benchConfig,
            async () => {
                await system.performCompleteAnalysis(studentId);
            },
            {
                testType: 'complete_analysis',
                historySizePrep: 50
            }
        );
    }

    /**
     * Benchmark de charge concurrente
     */
    public async benchmarkConcurrentLoad(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult> {
        const benchConfig = { ...this.config, operations: Math.floor(this.config.operations / 10), ...config };
        const system = createEmotionalSystem();
        const concurrentStudents = 10;

        const testParams: EmotionGenerationParams = {
            learningContext: 'concurrent_benchmark',
            stimulus: 'concurrent_test',
            stimulusIntensity: 0.6,
            learningOutcome: 'success',
            contextualFactors: ['concurrent', 'benchmark']
        };

        return await this.runBenchmark(
            'Charge Concurrente',
            benchConfig,
            async () => {
                const promises = Array.from({ length: concurrentStudents }, (_, i) =>
                    system.generateEmotionalState(`concurrent_student_${i}`, testParams)
                );
                await Promise.all(promises);
            },
            {
                testType: 'concurrent_load',
                concurrentStudents,
                totalOperationsPerCycle: concurrentStudents
            }
        );
    }

    /**
     * Benchmark avec configurations multiples
     */
    public async benchmarkMultipleConfigurations(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult> {
        const benchConfig = { ...this.config, operations: Math.floor(this.config.operations / 4), ...config };

        const configs = [
            PRESET_CONFIGS.BEGINNER,
            PRESET_CONFIGS.ADVANCED,
            PRESET_CONFIGS.ADHD,
            PRESET_CONFIGS.THERAPY
        ];

        const testParams: EmotionGenerationParams = {
            learningContext: 'config_benchmark',
            stimulus: 'config_test',
            stimulusIntensity: 0.7,
            learningOutcome: 'success',
            contextualFactors: ['config', 'benchmark']
        };

        return await this.runBenchmark(
            'Configurations Multiples',
            benchConfig,
            async () => {
                for (let i = 0; i < configs.length; i++) {
                    const system = createEmotionalSystem(configs[i].systemConfig);
                    await system.generateEmotionalState(`config_student_${i}`, testParams);
                }
            },
            {
                testType: 'multiple_configurations',
                configCount: configs.length,
                operationsPerCycle: configs.length
            }
        );
    }

    /**
     * Exécute un benchmark individuel
     */
    private async runBenchmark(
        name: string,
        config: BenchmarkConfig,
        operation: () => Promise<void>,
        metadata: Record<string, unknown> = {}
    ): Promise<BenchmarkResult> {
        const initialMemory = config.collectMemoryStats ? process.memoryUsage().heapUsed : 0;

        // Phase de réchauffement
        if (config.warmupCycles > 0) {
            for (let i = 0; i < config.warmupCycles; i++) {
                await operation();
            }
        }

        // Force garbage collection si disponible
        if (global.gc) {
            global.gc();
        }

        const startMemory = config.collectMemoryStats ? process.memoryUsage().heapUsed : 0;
        const startTime = process.hrtime.bigint();

        // Exécution du benchmark
        for (let i = 0; i < config.operations; i++) {
            await operation();
        }

        const endTime = process.hrtime.bigint();
        const endMemory = config.collectMemoryStats ? process.memoryUsage().heapUsed : 0;

        // Calculs de performance
        const totalTimeNs = Number(endTime - startTime);
        const totalTimeMs = totalTimeNs / 1_000_000;
        const avgTimeMs = totalTimeMs / config.operations;
        const opsPerSecond = 1000 / avgTimeMs;
        const memoryUsed = Math.max(0, endMemory - startMemory);
        const memoryPerOp = memoryUsed / config.operations;

        const result: BenchmarkResult = {
            name,
            operations: config.operations,
            totalTime: totalTimeMs,
            avgTime: avgTimeMs,
            opsPerSecond,
            memoryUsed,
            memoryPerOp,
            metadata: {
                ...metadata,
                warmupCycles: config.warmupCycles,
                collectMemoryStats: config.collectMemoryStats
            }
        };

        if (config.verbose) {
            this.displaySingleResult(result);
        }

        return result;
    }

    /**
     * Affiche les résultats de tous les benchmarks
     */
    public displayResults(results: readonly BenchmarkResult[]): void {
        console.log('📊 === RÉSULTATS DES BENCHMARKS ===\n');

        // Tableau des résultats
        console.log('┌─────────────────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
        console.log('│ Benchmark                       │ Opérations  │ Temps Moy.  │ Ops/Sec     │ Mémoire/Op  │');
        console.log('├─────────────────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');

        results.forEach(result => {
            const name = result.name.padEnd(31);
            const ops = result.operations.toString().padStart(11);
            const avgTime = `${result.avgTime.toFixed(2)}ms`.padStart(11);
            const opsPerSec = Math.round(result.opsPerSecond).toString().padStart(11);
            const memoryPerOp = this.formatBytes(result.memoryPerOp).padStart(11);

            console.log(`│ ${name} │ ${ops} │ ${avgTime} │ ${opsPerSec} │ ${memoryPerOp} │`);
        });

        console.log('└─────────────────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘\n');

        // Statistiques globales
        const totalOps = results.reduce((sum, r) => sum + r.operations, 0);
        const totalTime = results.reduce((sum, r) => sum + r.totalTime, 0);
        const totalMemory = results.reduce((sum, r) => sum + r.memoryUsed, 0);
        const avgOpsPerSec = results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length;

        console.log('📈 Statistiques globales :');
        console.log(`   Total opérations : ${totalOps.toLocaleString()}`);
        console.log(`   Temps total : ${totalTime.toFixed(0)}ms`);
        console.log(`   Mémoire totale : ${this.formatBytes(totalMemory)}`);
        console.log(`   Performance moyenne : ${Math.round(avgOpsPerSec)} ops/sec`);

        // Recommandations de performance
        console.log('\n💡 Recommandations :');
        this.generatePerformanceRecommendations(results);

        // Top performers
        console.log('\n🏆 Meilleurs performances :');
        const sortedBySpeed = [...results].sort((a, b) => b.opsPerSecond - a.opsPerSecond);
        const sortedByMemory = [...results].sort((a, b) => a.memoryPerOp - b.memoryPerOp);

        console.log(`   Plus rapide : ${sortedBySpeed[0].name} (${Math.round(sortedBySpeed[0].opsPerSecond)} ops/sec)`);
        console.log(`   Plus économe : ${sortedByMemory[0].name} (${this.formatBytes(sortedByMemory[0].memoryPerOp)}/op)`);

        console.log('');
    }

    /**
     * Affiche le résultat d'un benchmark individuel
     */
    private displaySingleResult(result: BenchmarkResult): void {
        console.log(`   ✅ ${result.name}:`);
        console.log(`      ${result.operations} opérations en ${result.totalTime.toFixed(0)}ms`);
        console.log(`      Moyenne: ${result.avgTime.toFixed(2)}ms/op`);
        console.log(`      Performance: ${Math.round(result.opsPerSecond)} ops/sec`);
        console.log(`      Mémoire: ${this.formatBytes(result.memoryPerOp)}/op`);
        console.log('');
    }

    /**
     * Génère des recommandations de performance
     */
    private generatePerformanceRecommendations(results: readonly BenchmarkResult[]): void {
        const recommendations: string[] = [];

        // Analyser les performances
        const avgOpsPerSec = results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length;
        const slowBenchmarks = results.filter(r => r.opsPerSecond < avgOpsPerSec * 0.5);
        const memoryIntensive = results.filter(r => r.memoryPerOp > 50000); // > 50KB par opération

        if (slowBenchmarks.length > 0) {
            recommendations.push(`Optimiser les benchmarks lents: ${slowBenchmarks.map(b => b.name).join(', ')}`);
        }

        if (memoryIntensive.length > 0) {
            recommendations.push(`Réduire l'utilisation mémoire pour: ${memoryIntensive.map(b => b.name).join(', ')}`);
        }

        // Recommandations générales
        if (avgOpsPerSec > 1000) {
            recommendations.push('Excellentes performances générales - Envisager des optimisations avancées');
        } else if (avgOpsPerSec > 500) {
            recommendations.push('Bonnes performances - Quelques optimisations possibles');
        } else {
            recommendations.push('Performances à améliorer - Prioriser l\'optimisation');
        }

        // Recommandations spécifiques par type
        const patternDetection = results.find(r => r.name.includes('Patterns'));
        if (patternDetection && patternDetection.opsPerSecond < 100) {
            recommendations.push('Optimiser les algorithmes de détection de patterns');
        }

        const concurrentLoad = results.find(r => r.name.includes('Concurrente'));
        if (concurrentLoad && concurrentLoad.opsPerSecond < avgOpsPerSec * 0.8) {
            recommendations.push('Améliorer la gestion de la charge concurrente');
        }

        if (recommendations.length === 0) {
            recommendations.push('Performances optimales - Système bien optimisé');
        }

        recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
    }

    // ================== MÉTHODES UTILITAIRES ==================

    /**
     * Génère des états émotionnels de test
     */
    private generateTestEmotionalStates(count: number): EmotionalState[] {
        const emotions: Array<import('../types/EmotionalTypes').PrimaryEmotion> = [
            'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation'
        ];

        return Array.from({ length: count }, (_, i) => {
            const emotion = emotions[i % emotions.length];
            return this.createTestEmotionalState(emotion, Math.random());
        });
    }

    /**
     * Crée un état émotionnel de test
     */
    private createTestEmotionalState(
        emotion: import('../types/EmotionalTypes').PrimaryEmotion,
        intensity: number
    ): EmotionalState {
        const valence = this.getEmotionValence(emotion);

        return {
            primaryEmotion: emotion,
            intensity,
            secondaryEmotions: new Map(),
            valence,
            arousal: intensity,
            trigger: `test_trigger_${emotion}`,
            timestamp: new Date(),
            expectedDuration: 3000
        };
    }

    /**
     * Obtient la valence d'une émotion
     */
    private getEmotionValence(emotion: import('../types/EmotionalTypes').PrimaryEmotion): number {
        const valenceMap = {
            'joy': 0.9, 'trust': 0.7, 'anticipation': 0.5,
            'surprise': 0.0, 'sadness': -0.7, 'fear': -0.6,
            'anger': -0.8, 'disgust': -0.5
        };
        return valenceMap[emotion];
    }

    /**
     * Formate les bytes en unités lisibles
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

/**
 * Classe utilitaire pour benchmarks spécialisés
 * 
 * @class SpecializedBenchmarks
 * @description Benchmarks spécialisés pour des cas d'usage spécifiques
 */
export class SpecializedBenchmarks {
    /**
     * Benchmark de stress test mémoire
     */
    public static async memoryStressTest(operations: number = 10000): Promise<BenchmarkResult> {
        const system = createEmotionalSystem();
        const studentId = 'memory-stress-student';

        const testParams: EmotionGenerationParams = {
            learningContext: 'memory_stress',
            stimulus: 'stress_test',
            stimulusIntensity: 0.5,
            learningOutcome: 'success',
            contextualFactors: ['stress_test', 'memory']
        };

        const suite = new PerformanceBenchmarkSuite({
            operations,
            warmupCycles: 100,
            collectMemoryStats: true,
            verbose: true
        });

        return await suite.runBenchmark(
            'Stress Test Mémoire',
            suite['config'],
            async () => {
                await system.generateEmotionalState(studentId, testParams);
            },
            {
                testType: 'memory_stress',
                targetOperations: operations
            }
        );
    }

    /**
     * Benchmark de latence sous charge
     */
    public static async latencyUnderLoad(): Promise<BenchmarkResult[]> {
        const results: BenchmarkResult[] = [];
        const loadLevels = [1, 5, 10, 25, 50, 100];

        for (const load of loadLevels) {
            const system = createEmotionalSystem();
            const suite = new PerformanceBenchmarkSuite({
                operations: 100,
                warmupCycles: 10,
                collectMemoryStats: false,
                verbose: false
            });

            const result = await suite.runBenchmark(
                `Latence Charge ${load}`,
                suite['config'],
                async () => {
                    const promises = Array.from({ length: load }, (_, i) => {
                        const params: EmotionGenerationParams = {
                            learningContext: 'latency_test',
                            stimulus: `load_${load}_op_${i}`,
                            stimulusIntensity: 0.6,
                            learningOutcome: 'success',
                            contextualFactors: ['latency_test', `load_${load}`]
                        };
                        return system.generateEmotionalState(`latency_student_${i}`, params);
                    });
                    await Promise.all(promises);
                },
                {
                    testType: 'latency_under_load',
                    loadLevel: load,
                    concurrentOperations: load
                }
            );

            results.push(result);
        }

        return results;
    }

    /**
     * Benchmark de dégradation des performances
     */
    public static async performanceDegradationTest(): Promise<BenchmarkResult[]> {
        const system = createEmotionalSystem();
        const results: BenchmarkResult[] = [];
        const sessionSizes = [10, 50, 100, 500, 1000];

        for (const sessionSize of sessionSizes) {
            const studentId = `degradation_student_${sessionSize}`;

            // Préparer l'historique
            for (let i = 0; i < sessionSize; i++) {
                const params: EmotionGenerationParams = {
                    learningContext: 'degradation_prep',
                    stimulus: `prep_${i}`,
                    stimulusIntensity: Math.random(),
                    learningOutcome: Math.random() > 0.5 ? 'success' : 'partial',
                    contextualFactors: ['degradation_test', 'preparation']
                };
                await system.generateEmotionalState(studentId, params);
            }

            // Benchmark avec historique préparé
            const suite = new PerformanceBenchmarkSuite({
                operations: 100,
                warmupCycles: 10,
                collectMemoryStats: true,
                verbose: false
            });

            const result = await suite.runBenchmark(
                `Historique ${sessionSize}`,
                suite['config'],
                async () => {
                    await system.performCompleteAnalysis(studentId);
                },
                {
                    testType: 'performance_degradation',
                    historySize: sessionSize
                }
            );

            results.push(result);
        }

        return results;
    }
}

/**
 * Fonction principale pour exécuter tous les benchmarks
 * 
 * @function runCompleteBenchmarkSuite
 * @async
 * @returns {Promise<void>}
 */
export async function runCompleteBenchmarkSuite(): Promise<void> {
    console.log('🚀 === SUITE COMPLÈTE DE BENCHMARKS METASIGN ===\n');

    try {
        // 1. Benchmarks principaux
        const mainSuite = new PerformanceBenchmarkSuite({
            operations: 1000,
            warmupCycles: 50,
            collectMemoryStats: true,
            verbose: false
        });

        const mainResults = await mainSuite.runAllBenchmarks();
        mainSuite.displayResults(mainResults);

        // 2. Tests spécialisés
        console.log('🔬 === TESTS SPÉCIALISÉS ===\n');

        console.log('💾 Test de stress mémoire...');
        const memoryStress = await SpecializedBenchmarks.memoryStressTest(5000);
        console.log(`   Résultat: ${Math.round(memoryStress.opsPerSecond)} ops/sec, ${mainSuite['formatBytes'](memoryStress.memoryPerOp)}/op\n`);

        console.log('⏱️ Test de latence sous charge...');
        const latencyResults = await SpecializedBenchmarks.latencyUnderLoad();
        latencyResults.forEach(result => {
            const load = result.metadata.loadLevel;
            console.log(`   Charge ${load}: ${result.avgTime.toFixed(2)}ms/op`);
        });
        console.log('');

        console.log('📉 Test de dégradation des performances...');
        const degradationResults = await SpecializedBenchmarks.performanceDegradationTest();
        degradationResults.forEach(result => {
            const historySize = result.metadata.historySize;
            console.log(`   Historique ${historySize}: ${result.avgTime.toFixed(2)}ms/op`);
        });

        console.log('\n✅ Suite de benchmarks terminée avec succès!');
        console.log('📊 Consultez les résultats ci-dessus pour les optimisations.\n');

    } catch (error) {
        console.error('❌ Erreur lors des benchmarks:', error);
    }
}

// Export des utilitaires
export {
    PerformanceBenchmarkSuite,
    SpecializedBenchmarks,
    runCompleteBenchmarkSuite
};

export type {
    BenchmarkResult,
    BenchmarkConfig
};