/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/benchmarks/PerformanceBenchmarks.ts
 * @description Suite de benchmarks de performance pour le système émotionnel CODA
 * 
 * Système de benchmarks refactorisé selon le Guide de refactorisation MetaSign.
 * Respecte le principe de responsabilité unique et les seuils de complexité.
 * 
 * @module PerformanceBenchmarks
 * @version 3.2.0 - Refactorisation conforme au guide MetaSign
 * @since 2025
 * @author MetaSign Team - Performance Engineering Division
 * @requires Node.js v18+
 * @requires TypeScript v5+
 */

import type {
    EmotionGenerationParams,
    EmotionalState,
    PrimaryEmotion
} from '../types/EmotionalTypes';

import { createEmotionalSystem } from '../index';

// ================== INTERFACES ET TYPES ==================

/**
 * Résultat d'un benchmark de performance
 * @interface BenchmarkResult
 */
export interface BenchmarkResult {
    readonly name: string;
    readonly operations: number;
    readonly totalTime: number;
    readonly avgTime: number;
    readonly opsPerSecond: number;
    readonly memoryUsed: number;
    readonly memoryPerOp: number;
    readonly timestamp: Date;
    readonly status: 'success' | 'warning' | 'error';
    readonly metadata: Record<string, unknown>;
}

/**
 * Configuration d'un benchmark
 * @interface BenchmarkConfig
 */
export interface BenchmarkConfig {
    readonly operations: number;
    readonly warmupCycles: number;
    readonly collectMemoryStats: boolean;
    readonly verbose: boolean;
    readonly operationTimeout: number;
    readonly forceGC: boolean;
}

/**
 * Configuration par défaut
 */
export const DEFAULT_BENCHMARK_CONFIG: BenchmarkConfig = {
    operations: 1000,
    warmupCycles: 50,
    collectMemoryStats: true,
    verbose: false,
    operationTimeout: 10000,
    forceGC: true
} as const;

// ================== CLASSES MOCK ==================

/**
 * Mock de EmotionalPatternDetector
 * @internal
 */
class MockEmotionalPatternDetector {
    async analyzePatterns(states: EmotionalState[]): Promise<unknown> {
        await this.simulateProcessing();
        return {
            patternCount: states.length,
            dominantEmotion: states[0]?.primaryEmotion || 'joy',
            confidence: Math.random()
        };
    }

    private async simulateProcessing(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    }
}

/**
 * Mock de EmotionalTransitionManager
 * @internal
 */
class MockEmotionalTransitionManager {
    async calculateTransition(fromState: EmotionalState, toState: EmotionalState): Promise<unknown> {
        await this.simulateTransitionCalculation();
        return {
            transitionTime: Math.random() * 1000,
            smoothness: Math.random(),
            intensity: Math.abs(fromState.intensity - toState.intensity)
        };
    }

    private async simulateTransitionCalculation(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
    }
}

/**
 * Mock de EmotionalHistoryManager
 * @internal
 */
class MockEmotionalHistoryManager {
    private historyStore = new Map<string, EmotionalState[]>();

    async addState(studentId: string, state: EmotionalState): Promise<void> {
        const history = this.historyStore.get(studentId) || [];
        history.push(state);
        this.historyStore.set(studentId, history);
        await this.simulateStorageOperation();
    }

    async searchHistory(
        studentId: string,
        criteria: { emotions: string[]; minIntensity: number; limit: number }
    ): Promise<EmotionalState[]> {
        const history = this.historyStore.get(studentId) || [];
        await this.simulateSearchOperation();
        return this.filterHistory(history, criteria);
    }

    private async simulateStorageOperation(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2));
    }

    private async simulateSearchOperation(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 15));
    }

    private filterHistory(
        history: EmotionalState[],
        criteria: { emotions: string[]; minIntensity: number; limit: number }
    ): EmotionalState[] {
        return history
            .filter(state =>
                criteria.emotions.includes(state.primaryEmotion) &&
                state.intensity >= criteria.minIntensity
            )
            .slice(0, criteria.limit);
    }
}

// ================== CLASSE PRINCIPALE ==================

/**
 * Suite de benchmarks de performance pour le système émotionnel
 * 
 * Responsabilité unique: Orchestration des benchmarks de performance
 * Respecte les seuils: < 20 méthodes, < 300 lignes par classe
 * 
 * @class PerformanceBenchmarkSuite
 */
export class PerformanceBenchmarkSuite {
    private readonly config: BenchmarkConfig;
    private readonly mockDetector: MockEmotionalPatternDetector;
    private readonly mockTransitionManager: MockEmotionalTransitionManager;
    private readonly mockHistoryManager: MockEmotionalHistoryManager;

    constructor(config?: Partial<BenchmarkConfig>) {
        this.config = { ...DEFAULT_BENCHMARK_CONFIG, ...config };
        this.mockDetector = new MockEmotionalPatternDetector();
        this.mockTransitionManager = new MockEmotionalTransitionManager();
        this.mockHistoryManager = new MockEmotionalHistoryManager();
    }

    /**
     * Exécute tous les benchmarks principaux
     * @public
     */
    public async runAllBenchmarks(): Promise<readonly BenchmarkResult[]> {
        console.log('🚀 BENCHMARKS SYSTÈME ÉMOTIONNEL METASIGN\n');

        const results: BenchmarkResult[] = [];
        const benchmarks = this.getBenchmarkDefinitions();

        for (const benchmark of benchmarks) {
            console.log(`${benchmark.icon} ${benchmark.description}...`);
            try {
                const result = await benchmark.execute();
                results.push(result);
            } catch (error) {
                console.error(`Erreur dans ${benchmark.name}:`, error);
                results.push(this.createErrorResult(benchmark.name, error));
            }
        }

        console.log('\n✅ Benchmarks terminés!\n');
        return results;
    }

    /**
     * Affiche les résultats des benchmarks
     * @public
     */
    public displayResults(results: readonly BenchmarkResult[]): void {
        if (results.length === 0) {
            console.log('Aucun résultat à afficher.\n');
            return;
        }

        this.displayResultsTable(results);
        this.displaySummary(results);
    }

    // ================== MÉTHODES PRIVÉES ==================

    private getBenchmarkDefinitions() {
        return [
            {
                name: 'Génération États Émotionnels',
                icon: '⚡',
                description: 'Benchmark génération d\'états émotionnels',
                execute: () => this.benchmarkEmotionGeneration()
            },
            {
                name: 'Détection Patterns',
                icon: '🔍',
                description: 'Benchmark détection de patterns',
                execute: () => this.benchmarkPatternDetection()
            },
            {
                name: 'Transitions Émotionnelles',
                icon: '🌊',
                description: 'Benchmark transitions émotionnelles',
                execute: () => this.benchmarkEmotionalTransitions()
            },
            {
                name: 'Gestion Historique',
                icon: '📊',
                description: 'Benchmark gestion d\'historique',
                execute: () => this.benchmarkHistoryManagement()
            }
        ];
    }

    private async benchmarkEmotionGeneration(): Promise<BenchmarkResult> {
        const system = createEmotionalSystem();
        const studentId = 'benchmark-emotion-student';
        const testParams = this.createTestParams('benchmark_emotion_generation');

        return this.executeBenchmark(
            'Génération États Émotionnels',
            () => system.generateEmotionalState(studentId, testParams),
            { testType: 'emotion_generation' }
        );
    }

    private async benchmarkPatternDetection(): Promise<BenchmarkResult> {
        const testStates = this.generateTestStates(200);

        return this.executeBenchmark(
            'Détection Patterns',
            () => this.mockDetector.analyzePatterns(testStates),
            { testType: 'pattern_detection', statesCount: testStates.length }
        );
    }

    private async benchmarkEmotionalTransitions(): Promise<BenchmarkResult> {
        const fromState = this.createTestEmotionalState('joy', 0.8);
        const toState = this.createTestEmotionalState('trust', 0.6);

        return this.executeBenchmark(
            'Transitions Émotionnelles',
            () => this.mockTransitionManager.calculateTransition(fromState, toState),
            { testType: 'emotional_transitions' }
        );
    }

    private async benchmarkHistoryManagement(): Promise<BenchmarkResult> {
        const studentId = 'benchmark-history-student';

        // Pré-remplir l'historique
        const testStates = this.generateTestStates(100);
        for (const state of testStates) {
            await this.mockHistoryManager.addState(studentId, state);
        }

        return this.executeBenchmark(
            'Gestion Historique',
            () => this.mockHistoryManager.searchHistory(studentId, {
                emotions: ['joy', 'trust'],
                minIntensity: 0.5,
                limit: 20
            }),
            { testType: 'history_management' }
        );
    }

    private async executeBenchmark(
        name: string,
        operation: () => Promise<unknown>,
        metadata: Record<string, unknown>
    ): Promise<BenchmarkResult> {
        const timestamp = new Date();

        try {
            // Phase de réchauffement
            await this.warmupPhase(operation);

            // Mesure des performances
            const { totalTime, memoryUsed } = await this.measurePerformance(operation);

            const avgTime = totalTime / this.config.operations;
            const opsPerSecond = this.config.operations / (totalTime / 1000);
            const memoryPerOp = memoryUsed / this.config.operations;

            return {
                name,
                operations: this.config.operations,
                totalTime,
                avgTime,
                opsPerSecond,
                memoryUsed,
                memoryPerOp,
                timestamp,
                status: this.determineStatus(opsPerSecond),
                metadata
            };
        } catch (error) {
            return this.createErrorResult(name, error);
        }
    }

    private async warmupPhase(operation: () => Promise<unknown>): Promise<void> {
        for (let i = 0; i < this.config.warmupCycles; i++) {
            await operation();
        }

        if (this.config.forceGC && global.gc) {
            global.gc();
        }
    }

    private async measurePerformance(operation: () => Promise<unknown>): Promise<{
        totalTime: number;
        memoryUsed: number;
    }> {
        const startMemory = this.config.collectMemoryStats ? process.memoryUsage().heapUsed : 0;
        const startTime = process.hrtime.bigint();

        for (let i = 0; i < this.config.operations; i++) {
            await operation();
        }

        const endTime = process.hrtime.bigint();
        const endMemory = this.config.collectMemoryStats ? process.memoryUsage().heapUsed : 0;

        return {
            totalTime: Number(endTime - startTime) / 1_000_000,
            memoryUsed: Math.max(0, endMemory - startMemory)
        };
    }

    private determineStatus(opsPerSecond: number): 'success' | 'warning' | 'error' {
        if (opsPerSecond >= 100) return 'success';
        if (opsPerSecond >= 10) return 'warning';
        return 'error';
    }

    private createErrorResult(name: string, error: unknown): BenchmarkResult {
        return {
            name,
            operations: 0,
            totalTime: 0,
            avgTime: 0,
            opsPerSecond: 0,
            memoryUsed: 0,
            memoryPerOp: 0,
            timestamp: new Date(),
            status: 'error',
            metadata: {
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            }
        };
    }

    private createTestParams(stimulus: string): EmotionGenerationParams {
        return {
            learningContext: 'benchmark_test',
            stimulus,
            stimulusIntensity: 0.7,
            learningOutcome: 'success',
            contextualFactors: ['benchmark', 'performance_test']
        };
    }

    private generateTestStates(count: number): EmotionalState[] {
        const emotions: PrimaryEmotion[] = [
            'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation'
        ];

        return Array.from({ length: count }, (_, i) => {
            const emotion = emotions[i % emotions.length];
            return this.createTestEmotionalState(emotion, Math.random());
        });
    }

    private createTestEmotionalState(emotion: PrimaryEmotion, intensity: number): EmotionalState {
        return {
            primaryEmotion: emotion,
            intensity: Math.max(0, Math.min(1, intensity)),
            secondaryEmotions: new Map(),
            valence: this.getEmotionValence(emotion),
            arousal: intensity,
            trigger: `test_trigger_${emotion}`,
            timestamp: new Date(),
            expectedDuration: Math.floor(1000 + Math.random() * 5000)
        };
    }

    private getEmotionValence(emotion: PrimaryEmotion): number {
        const valenceMap: Record<PrimaryEmotion, number> = {
            'joy': 0.9, 'trust': 0.7, 'anticipation': 0.5, 'surprise': 0.0,
            'sadness': -0.7, 'fear': -0.6, 'anger': -0.8, 'disgust': -0.5
        };
        return valenceMap[emotion] || 0;
    }

    private displayResultsTable(results: readonly BenchmarkResult[]): void {
        console.log('📊 RÉSULTATS DES BENCHMARKS\n');
        console.log('┌─────────────────────────────┬─────────────┬─────────────┬─────────────┐');
        console.log('│ Benchmark                   │ Ops/Sec     │ Temps Moy.  │ Statut      │');
        console.log('├─────────────────────────────┼─────────────┼─────────────┼─────────────┤');

        results.forEach(result => {
            const name = result.name.padEnd(27);
            const opsPerSec = Math.round(result.opsPerSecond).toString().padStart(11);
            const avgTime = `${result.avgTime.toFixed(2)}ms`.padStart(11);
            const statusIcon = this.getStatusIcon(result.status).padStart(11);

            console.log(`│ ${name} │ ${opsPerSec} │ ${avgTime} │ ${statusIcon} │`);
        });

        console.log('└─────────────────────────────┴─────────────┴─────────────┴─────────────┘\n');
    }

    private getStatusIcon(status: string): string {
        const icons = { success: '✅', warning: '⚠️', error: '❌' };
        return icons[status as keyof typeof icons] || '❓';
    }

    private displaySummary(results: readonly BenchmarkResult[]): void {
        const successCount = results.filter(r => r.status === 'success').length;
        const totalOps = results.reduce((sum, r) => sum + r.operations, 0);

        console.log('📈 Résumé:');
        console.log(`   Réussis: ${successCount}/${results.length}`);
        console.log(`   Total opérations: ${totalOps.toLocaleString()}`);
        console.log('');
    }
}

// Les types sont déjà exportés via les déclarations d'interface ci-dessus