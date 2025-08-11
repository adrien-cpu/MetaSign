// src/ai/systems/expressions/analysis/__tests__/LSFPatternSystem.bench.ts
import { LSFPatternAnalyzer } from '../LSFPatternAnalyzer';
import { LSFPatternValidator } from '../LSFPatternValidator';
import { LSFPatternOptimizer } from '../LSFPatternOptimizer';
import { LSFExpression } from '../../lsf/LSFGrammarSystem';

describe('LSF Pattern System Performance', () => {
  let analyzer: LSFPatternAnalyzer;
  let validator: LSFPatternValidator;
  let optimizer: LSFPatternOptimizer;

  beforeEach(() => {
    analyzer = new LSFPatternAnalyzer();
    validator = new LSFPatternValidator();
    optimizer = new LSFPatternOptimizer();
  });

  // Métriques de performance attendues
  const PERFORMANCE_THRESHOLDS = {
    PATTERN_ANALYSIS: 50, // ms
    PATTERN_VALIDATION: 30, // ms
    PATTERN_OPTIMIZATION: 100, // ms
    MEMORY_USAGE_LIMIT: 50 * 1024 * 1024, // 50MB
    MAX_HEAP_USAGE: 100 * 1024 * 1024 // 100MB
  };

  describe('Processing Time Benchmarks', () => {
    test('should analyze patterns within time threshold', async () => {
      const expressions = generateLargeExpressionSet(100);
      const context = { intent: 'BENCHMARK', environment: 'test', importance: 0.5 };
      
      const startTime = performance.now();
      await analyzer.analyzePattern(expressions, context);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PATTERN_ANALYSIS);
    });

    test('should validate patterns efficiently', async () => {
      const pattern = {
        type: 'REPETITION',
        sequence: generateLargeExpressionSet(50),
        count: 50,
        confidence: 0.8
      };

      const context = {
        intent: 'BENCHMARK',
        environment: 'test',
        culturalContext: 'standard'
      };

      const startTime = performance.now();
      await validator.validatePattern(pattern, context);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PATTERN_VALIDATION);
    });

    test('should optimize patterns within time limit', async () => {
      const pattern = {
        type: 'CIRCULAR',
        sequence: generateLargeExpressionSet(50),
        radius: 0.3,
        smoothness: 0.7,
        confidence: 0.8
      };

      const validation = await validator.validatePattern(pattern, {
        intent: 'BENCHMARK',
        environment: 'test',
        culturalContext: 'standard'
      });

      const startTime = performance.now();
      await optimizer.optimizePattern(pattern, validation, {
        importance: 0.8,
        performance: { targetFPS: 60, maxLatency: 16 },
        cultural: { formalityLevel: 0.7 }
      });
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PATTERN_OPTIMIZATION);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should handle large expression sets within memory limits', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const largeSet = generateLargeExpressionSet(500);
      
      await analyzer.analyzePattern(largeSet, {
        intent: 'BENCHMARK',
        environment: 'test',
        importance: 0.5
      });

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryUsed = finalMemory - initialMemory;

      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE_LIMIT);
    });

    test('should maintain stable memory usage during optimization', async () => {
      const pattern = {
        type: 'REPETITION',
        sequence: generateLargeExpressionSet(200),
        count: 200,
        confidence: 0.8
      };

      const validation = await validator.validatePattern(pattern, {
        intent: 'BENCHMARK',
        environment: 'test',
        culturalContext: 'standard'
      });

      const initialMemory = process.memoryUsage().heapUsed;
      
      await optimizer.optimizePattern(pattern, validation, {
        importance: 0.8,
        performance: { targetFPS: 60, maxLatency: 16 },
        cultural: { formalityLevel: 0.7 }
      });

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDelta = Math.abs(finalMemory - initialMemory);

      expect(memoryDelta).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE_LIMIT);
    });
  });

  describe('Stress Tests', () => {
    test('should handle concurrent pattern processing', async () => {
      const patterns = Array(10).fill(null).map(() => ({
        type: 'REPETITION',
        sequence: generateLargeExpressionSet(50),
        count: 50,
        confidence: 0.8
      }));

      const startTime = performance.now();
      await Promise.all(patterns.map(pattern => 
        optimizer.optimizePattern(
          pattern,
          { isValid: true, issues: [], confidence: 0.8, suggestions: [] },
          {
            importance: 0.8,
            performance: { targetFPS: 60, maxLatency: 16 },
            cultural: { formalityLevel: 0.7 }
          }
        )
      ));
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.PATTERN_OPTIMIZATION * 3);
    });

    test('should maintain performance under continuous load', async () => {
      const iterations = 50;
      const timings: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        await analyzer.analyzePattern(
          generateLargeExpressionSet(20),
          { intent: 'BENCHMARK', environment: 'test', importance: 0.5 }
        );

        timings.push(performance.now() - startTime);
      }

      // Vérifier la stabilité des performances
      const averageTime = timings.reduce((a, b) => a + b) / iterations;
      const maxDeviation = Math.max(...timings.map(t => Math.abs(t - averageTime)));
      
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PATTERN_ANALYSIS);
      expect(maxDeviation).toBeLessThan(PERFORMANCE_THRESHOLDS.PATTERN_ANALYSIS * 0.5);
    });

    test('should recover from memory pressure', async () => {
      const largePatterns = Array(20).fill(null).map(() => ({
        type: 'CIRCULAR',
        sequence: generateLargeExpressionSet(100),
        radius: 0.3,
        smoothness: 0.7,
        confidence: 0.8
      }));

      // Simuler une pression mémoire
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (const pattern of largePatterns) {
        await optimizer.optimizePattern(
          pattern,
          { isValid: true, issues: [], confidence: 0.8, suggestions: [] },
          {
            importance: 0.8,
            performance: { targetFPS: 60, maxLatency: 16 },
            cultural: { formalityLevel: 0.7 }
          }
        );

        // Vérifier que la mémoire ne s'accumule pas
        const currentMemory = process.memoryUsage().heapUsed;
        expect(currentMemory - initialMemory).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_HEAP_USAGE);
      }
    });
  });

  // Fonctions utilitaires
  function generateLargeExpressionSet(size: number): LSFExpression[] {
    return Array(size).fill(null).map((_, i) => ({
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
      },
      timing: {
        duration: 300 + Math.sin(i * 0.1) * 50,
        easing: 'easeInOut'
      }
    }));
  }
});