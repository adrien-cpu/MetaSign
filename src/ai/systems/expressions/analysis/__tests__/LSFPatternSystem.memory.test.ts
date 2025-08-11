// src/ai/systems/expressions/analysis/__tests__/LSFPatternSystem.memory.test.ts
import { LSFPatternAnalyzer } from '../LSFPatternAnalyzer';
import { LSFPatternOptimizer } from '../LSFPatternOptimizer';
import { LSFExpression } from '../../lsf/LSFGrammarSystem';

describe('LSF Pattern System Memory Management', () => {
  let analyzer: LSFPatternAnalyzer;
  let optimizer: LSFPatternOptimizer;
  let memorySnapshots: MemorySnapshot[] = [];

  beforeEach(() => {
    analyzer = new LSFPatternAnalyzer();
    optimizer = new LSFPatternOptimizer();
    memorySnapshots = [];
  });

  const MEMORY_THRESHOLDS = {
    MAX_HEAP_GROWTH: 50 * 1024 * 1024, // 50MB max growth
    LEAK_THRESHOLD: 1024 * 1024, // 1MB acceptable retained memory
    GC_THRESHOLD: 10 * 1024 * 1024 // 10MB before expecting GC
  };

  interface MemorySnapshot {
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  }

  function takeMemorySnapshot(): MemorySnapshot {
    const memory = process.memoryUsage();
    return {
      timestamp: Date.now(),
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external
    };
  }

  async function waitForGC() {
    if (global.gc) {
      global.gc();
    }
    // Attendre que le GC fasse son travail
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  describe('Memory Leaks Detection', () => {
    test('should not leak memory during repeated pattern analysis', async () => {
      const iterations = 100;
      const initialSnapshot = takeMemorySnapshot();

      for (let i = 0; i < iterations; i++) {
        const expressions = generateLongExpressionSequence(50);
        await analyzer.analyzePattern(expressions, {
          intent: 'MEMORY_TEST',
          environment: 'test',
          importance: 0.8
        });

        if (i % 10 === 0) {
          memorySnapshots.push(takeMemorySnapshot());
          await waitForGC();
        }
      }

      const finalSnapshot = takeMemorySnapshot();
      await waitForGC();
      const afterGCSnapshot = takeMemorySnapshot();

      // Vérifier la croissance de la mémoire
      const finalGrowth = afterGCSnapshot.heapUsed - initialSnapshot.heapUsed;
      expect(finalGrowth).toBeLessThan(MEMORY_THRESHOLDS.LEAK_THRESHOLD);

      // Analyser la tendance de la mémoire
      const memoryTrend = analyzeMemoryTrend(memorySnapshots);
      expect(memoryTrend.isStable).toBe(true);
    });

    test('should release memory after large pattern processing', async () => {
      const largeExpressions = generateLongExpressionSequence(1000);
      const initialSnapshot = takeMemorySnapshot();

      await analyzer.analyzePattern(largeExpressions, {
        intent: 'MEMORY_TEST',
        environment: 'test',
        importance: 0.8
      });

      const peakSnapshot = takeMemorySnapshot();
      await waitForGC();
      const finalSnapshot = takeMemorySnapshot();

      // Vérifier que la mémoire est libérée
      const memoryRetained = finalSnapshot.heapUsed - initialSnapshot.heapUsed;
      expect(memoryRetained).toBeLessThan(MEMORY_THRESHOLDS.LEAK_THRESHOLD);

      // Vérifier le pic mémoire
      const peakGrowth = peakSnapshot.heapUsed - initialSnapshot.heapUsed;
      expect(peakGrowth).toBeLessThan(MEMORY_THRESHOLDS.MAX_HEAP_GROWTH);
    });
  });

  describe('Memory Pressure Handling', () => {
    test('should handle memory pressure during optimization', async () => {
      const memoryIntensivePattern = {
        type: 'CIRCULAR',
        sequence: generateLongExpressionSequence(500),
        radius: 0.3,
        smoothness: 0.7,
        confidence: 0.8
      };

      const snapshots: MemorySnapshot[] = [];
      const initialSnapshot = takeMemorySnapshot();
      snapshots.push(initialSnapshot);

      // Optimiser sous pression mémoire
      for (let i = 0; i < 5; i++) {
        await optimizer.optimizePattern(
          memoryIntensivePattern,
          { isValid: true, issues: [], confidence: 0.8, suggestions: [] },
          {
            importance: 0.8,
            performance: { targetFPS: 60, maxLatency: 16 },
            cultural: { formalityLevel: 0.7 }
          }
        );

        snapshots.push(takeMemorySnapshot());
        
        if (i % 2 === 0) {
          // Simuler une pression mémoire additionnelle
          const pressure = generateMemoryPressure(20 * 1024 * 1024); // 20MB
          snapshots.push(takeMemorySnapshot());
          pressure.release();
        }

        await waitForGC();
      }

      const finalSnapshot = takeMemorySnapshot();
      snapshots.push(finalSnapshot);

      // Analyser la gestion de la mémoire
      const memoryManagement = analyzeMemoryManagement(snapshots);
      expect(memoryManagement.handledPressure).toBe(true);
      expect(memoryManagement.recoveredEfficiently).toBe(true);
    });

    test('should maintain performance under memory constraints', async () => {
      const baselineExpressions = generateLongExpressionSequence(100);
      const baselineTime = await measureProcessingTime(baselineExpressions);

      // Créer une contrainte mémoire
      const memoryConstraint = generateMemoryPressure(100 * 1024 * 1024); // 100MB
      const constrainedTime = await measureProcessingTime(baselineExpressions);
      memoryConstraint.release();

      // La performance ne doit pas se dégrader significativement
      expect(constrainedTime).toBeLessThan(baselineTime * 2);
    });
  });

  // Fonctions utilitaires
  function generateLongExpressionSequence(length: number): LSFExpression[] {
    return Array(length).fill(null).map((_, i) => ({
      eyebrows: {
        position: Math.sin(i * 0.1),
        tension: Math.cos(i * 0.1)
      },
      head: {
        tilt: Math.sin(i * 0.2),
        forward: Math.cos(i * 0.2)
      },
      mouth: {
        shape: 'neutral',
        tension: Math.abs(Math.sin(i * 0.3))
      }
    }));
  }

  function generateMemoryPressure(bytes: number) {
    const pressure = new Array(bytes).fill(0);
    return {
      data: pressure,
      release: () => pressure.length = 0
    };
  }

  async function measureProcessingTime(expressions: LSFExpression[]): Promise<number> {
    const start = performance.now();
    await analyzer.analyzePattern(expressions, {
      intent: 'BENCHMARK',
      environment: 'test',
      importance: 0.5
    });
    return performance.now() - start;
  }

  function analyzeMemoryTrend(snapshots: MemorySnapshot[]) {
    if (snapshots.length < 2) return { isStable: true };

    const growthRates = snapshots.slice(1).map((snapshot, i) => {
      const previous = snapshots[i];
      return (snapshot.heapUsed - previous.heapUsed) / 
             (snapshot.timestamp - previous.timestamp);
    });

    const averageGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    return {
      isStable: Math.abs(averageGrowth) < 1024, // Moins de 1KB/ms de croissance
      averageGrowth
    };
  }

  function analyzeMemoryManagement(snapshots: MemorySnapshot[]) {
    const peakUsage = Math.max(...snapshots.map(s => s.heapUsed));
    const finalUsage = snapshots[snapshots.length - 1].heapUsed;
    const initialUsage = snapshots[0].heapUsed;

    return {
      handledPressure: (peakUsage - initialUsage) < MEMORY_THRESHOLDS.MAX_HEAP_GROWTH,
      recoveredEfficiently: (finalUsage - initialUsage) < MEMORY_THRESHOLDS.LEAK_THRESHOLD
    };
  }
});