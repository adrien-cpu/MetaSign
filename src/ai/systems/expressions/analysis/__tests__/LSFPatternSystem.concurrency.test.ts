// src/ai/systems/expressions/analysis/__tests__/LSFPatternSystem.concurrency.test.ts
import { LSFPatternAnalyzer } from '../LSFPatternAnalyzer';
import { LSFPatternValidator } from '../LSFPatternValidator';
import { LSFPatternOptimizer } from '../LSFPatternOptimizer';
import { LSFExpression } from '../../lsf/LSFGrammarSystem';

describe('LSF Pattern System Concurrency', () => {
  let analyzer: LSFPatternAnalyzer;
  let validator: LSFPatternValidator;
  let optimizer: LSFPatternOptimizer;
  
  // Moniteur d'exécution concurrente
  const executionMonitor = {
    activeOperations: 0,
    maxConcurrentOps: 0,
    completedOperations: 0,
    errors: [] as Error[],
    
    startOperation() {
      this.activeOperations++;
      this.maxConcurrentOps = Math.max(this.maxConcurrentOps, this.activeOperations);
    },
    
    endOperation(error?: Error) {
      this.activeOperations--;
      this.completedOperations++;
      if (error) this.errors.push(error);
    },

    reset() {
      this.activeOperations = 0;
      this.maxConcurrentOps = 0;
      this.completedOperations = 0;
      this.errors = [];
    }
  };

  beforeEach(() => {
    analyzer = new LSFPatternAnalyzer();
    validator = new LSFPatternValidator();
    optimizer = new LSFPatternOptimizer();
    executionMonitor.reset();
  });

  describe('Parallel Pattern Analysis', () => {
    test('should handle multiple concurrent pattern analyses', async () => {
      const patterns = Array(10).fill(null).map((_, i) => 
        generateConcurrentPattern(i % 3 as 0 | 1 | 2)
      );

      const analysisPromises = patterns.map(async pattern => {
        executionMonitor.startOperation();
        try {
          const result = await analyzer.analyzePattern(pattern, {
            intent: 'CONCURRENT_TEST',
            environment: 'test',
            importance: 0.8
          });
          return result;
        } catch (error) {
          executionMonitor.endOperation(error as Error);
          throw error;
        } finally {
          executionMonitor.endOperation();
        }
      });

      const results = await Promise.all(analysisPromises);
      
      expect(executionMonitor.maxConcurrentOps).toBeGreaterThan(1);
      expect(executionMonitor.errors).toHaveLength(0);
      expect(results).toHaveLength(patterns.length);
    });

    test('should maintain pattern isolation during concurrent analysis', async () => {
      const sharedContext = { sharedData: new Set<string>() };
      const patterns = Array(5).fill(null).map(() => generateLongPattern(20));

      await Promise.all(patterns.map(async (pattern, index) => {
        executionMonitor.startOperation();
        try {
          const result = await analyzer.analyzePattern(pattern, {
            intent: `CONCURRENT_TEST_${index}`,
            environment: 'test',
            importance: 0.8
          });
          
          // Vérifier l'isolation
          const patternKey = `pattern_${index}`;
          expect(sharedContext.sharedData.has(patternKey)).toBe(false);
          sharedContext.sharedData.add(patternKey);
          
          return result;
        } finally {
          executionMonitor.endOperation();
        }
      }));
    });
  });

  describe('Concurrent Validation', () => {
    test('should handle concurrent validation requests', async () => {
      const patterns = Array(5).fill(null).map((_, i) => ({
        type: 'REPETITION' as const,
        sequence: generateConcurrentPattern(i % 3 as 0 | 1 | 2),
        count: 5,
        confidence: 0.8
      }));

      const validationPromises = patterns.map(async pattern => {
        executionMonitor.startOperation();
        try {
          const result = await validator.validatePattern(pattern, {
            intent: 'CONCURRENT_TEST',
            environment: 'test',
            culturalContext: 'standard'
          });
          return result;
        } finally {
          executionMonitor.endOperation();
        }
      });

      const results = await Promise.all(validationPromises);
      expect(results).toHaveLength(patterns.length);
      expect(executionMonitor.maxConcurrentOps).toBeGreaterThan(1);
    });

    test('should maintain validation state isolation', async () => {
      const validationStates = new Map<string, boolean>();
      const patterns = Array(5).fill(null).map((_, i) => ({
        type: 'CIRCULAR' as const,
        sequence: generateConcurrentPattern(i % 3 as 0 | 1 | 2),
        radius: 0.3,
        smoothness: 0.7,
        confidence: 0.8
      }));

      await Promise.all(patterns.map(async (pattern, index) => {
        const validationKey = `validation_${index}`;
        const result = await validator.validatePattern(pattern, {
          intent: 'CONCURRENT_TEST',
          environment: 'test',
          culturalContext: 'standard'
        });
        validationStates.set(validationKey, result.isValid);
      }));

      // Vérifier que chaque validation a son propre état
      expect(validationStates.size).toBe(patterns.length);
    });
  });

  describe('Concurrent Optimization', () => {
    test('should handle concurrent optimization requests', async () => {
      const patterns = Array(5).fill(null).map((_, i) => ({
        type: 'REPETITION' as const,
        sequence: generateConcurrentPattern(i % 3 as 0 | 1 | 2),
        count: 5,
        confidence: 0.8
      }));

      const optimizationPromises = patterns.map(async pattern => {
        executionMonitor.startOperation();
        try {
          return await optimizer.optimizePattern(
            pattern,
            { isValid: true, issues: [], confidence: 0.8, suggestions: [] },
            {
              importance: 0.8,
              performance: { targetFPS: 60, maxLatency: 16 },
              cultural: { formalityLevel: 0.7 }
            }
          );
        } finally {
          executionMonitor.endOperation();
        }
      });

      const results = await Promise.all(optimizationPromises);
      expect(results).toHaveLength(patterns.length);
      results.forEach(result => {
        expect(result.improvements.fluidity).toBeGreaterThan(0);
      });
    });

    test('should manage resource contention during optimization', async () => {
      const heavyPatterns = Array(3).fill(null).map(() => ({
        type: 'CIRCULAR' as const,
        sequence: generateLongPattern(100),
        radius: 0.3,
        smoothness: 0.7,
        confidence: 0.8
      }));

      const resourceUsage = new Set<string>();
      const optimizationPromises = heavyPatterns.map(async (pattern, index) => {
        const resourceKey = `resource_${index}`;
        executionMonitor.startOperation();
        
        try {
          // Vérifier les ressources
          expect(resourceUsage.has(resourceKey)).toBe(false);
          resourceUsage.add(resourceKey);

          const result = await optimizer.optimizePattern(
            pattern,
            { isValid: true, issues: [], confidence: 0.8, suggestions: [] },
            {
              importance: 0.8,
              performance: { targetFPS: 60, maxLatency: 16 },
              cultural: { formalityLevel: 0.7 }
            }
          );

          resourceUsage.delete(resourceKey);
          return result;
        } finally {
          executionMonitor.endOperation();
        }
      });

      await Promise.all(optimizationPromises);
      expect(resourceUsage.size).toBe(0);
    });
  });

  describe('Full Pipeline Concurrency', () => {
    test('should handle complete concurrent processing pipelines', async () => {
      const patterns = Array(3).fill(null).map((_, i) => 
        generateConcurrentPattern(i as 0 | 1 | 2)
      );

      const pipelinePromises = patterns.map(async expressions => {
        executionMonitor.startOperation();
        try {
          // 1. Analyse
          const analysis = await analyzer.analyzePattern(expressions, {
            intent: 'CONCURRENT_TEST',
            environment: 'test',
            importance: 0.8
          });

          // 2. Validation
          const validation = await validator.validatePattern(
            analysis.patterns[0],
            {
              intent: 'CONCURRENT_TEST',
              environment: 'test',
              culturalContext: 'standard'
            }
          );

          // 3. Optimisation
          const optimization = await optimizer.optimizePattern(
            analysis.patterns[0],
            validation,
            {
              importance: 0.8,
              performance: { targetFPS: 60, maxLatency: 16 },
              cultural: { formalityLevel: 0.7 }
            }
          );

          return optimization;
        } finally {
          executionMonitor.endOperation();
        }
      });

      const results = await Promise.all(pipelinePromises);
      expect(results).toHaveLength(patterns.length);
      expect(executionMonitor.errors).toHaveLength(0);
    });
  });

  // Fonctions utilitaires
  function generateConcurrentPattern(type: 0 | 1 | 2): LSFExpression[] {
    switch (type) {
      case 0:
        return generateRepetitivePattern(5);
      case 1:
        return generateAlternatingPattern(6);
      case 2:
        return generateCircularPattern(8);
      default:
        return generateRepetitivePattern(5);
    }
  }

  function generateRepetitivePattern(count: number): LSFExpression[] {
    return Array(count).fill(null).map(() => ({
      eyebrows: { position: 0.8, tension: 0.3 },
      head: { tilt: 0.2, forward: 0.3 },
      mouth: { shape: 'neutral', tension: 0.2 }
    }));
  }

  function generateAlternatingPattern(count: number): LSFExpression[] {
    return Array(count).fill(null).map((_, i) => ({
      eyebrows: { position: i % 2 === 0 ? 0.8 : -0.8, tension: 0.3 },
      head: { tilt: i % 2 === 0 ? 0.2 : -0.2, forward: 0.3 },
      mouth: { shape: 'neutral', tension: 0.2 }
    }));
  }

  function generateCircularPattern(count: number): LSFExpression[] {
    return Array(count).fill(null).map((_, i) => ({
      eyebrows: { position: Math.sin(i * Math.PI / 4), tension: 0.3 },
      head: { 
        tilt: 0.3 * Math.cos(i * Math.PI / 4),
        forward: 0.3 * Math.sin(i * Math.PI / 4)
      },
      mouth: { shape: 'neutral', tension: 0.2 }
    }));
  }

  function generateLongPattern(length: number): LSFExpression[] {
    return Array(length).fill(null).map((_, i) => ({
      eyebrows: { position: Math.sin(i * 0.1), tension: Math.cos(i * 0.1) },
      head: { tilt: Math.sin(i * 0.2), forward: Math.cos(i * 0.2) },
      mouth: { shape: 'neutral', tension: Math.abs(Math.sin(i * 0.3)) }
    }));
  }
});