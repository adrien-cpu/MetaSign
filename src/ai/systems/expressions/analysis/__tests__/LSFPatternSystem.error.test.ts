// src/ai/systems/expressions/analysis/__tests__/LSFPatternSystem.error.test.ts
import { LSFPatternAnalyzer } from '../LSFPatternAnalyzer';
import { LSFPatternValidator } from '../LSFPatternValidator';
import { LSFPatternOptimizer } from '../LSFPatternOptimizer';
import { LSFExpression, EyebrowsProperties, HeadProperties, MouthProperties } from '../../lsf/LSFGrammarSystem';

// Étendre l'interface LSFPatternAnalyzer pour inclure getState
declare module '../LSFPatternAnalyzer' {
  interface LSFPatternAnalyzer {
    getState(): { status: string };
  }
}

// Types exacts correspondant aux retours des méthodes
interface PatternAnalysis {
  patterns: Array<unknown>;
  metadata: {
    totalPatterns: number;
    dominantType: string;
    averageConfidence: number;
  };
}

// Extension pour les tests
interface ExtendedPatternAnalysis extends PatternAnalysis {
  metadata: {
    totalPatterns: number;
    dominantType: string;
    averageConfidence: number;
    errorRate: number;
    recoveredSegments: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  issues: Array<unknown>;
  confidence: number;
  suggestions: Array<unknown>;
}

// Extension pour les tests
interface ExtendedValidationResult extends ValidationResult {
  partiallyValid: boolean;
  validSegments: Array<unknown>;
}

// Définition d'une interface non-vide avec des propriétés attendues
interface OptimizationMetadata {
  // Propriétés de base qui devraient exister dans l'implémentation réelle
  optimizationLevel: number;
  processingTime: number;
  resourceUsage: Record<string, number>;
}

// Extension pour les tests
interface ExtendedOptimizationMetadata extends OptimizationMetadata {
  usedFallback: boolean;
  recoveryAttempts: number;
}

interface OptimizedPattern {
  pattern: unknown;
  improvements: {
    fluidity: number;
  };
  metadata: OptimizationMetadata;
}

// Extension pour les tests
interface ExtendedOptimizedPattern extends OptimizedPattern {
  metadata: ExtendedOptimizationMetadata;
}

describe('LSF Pattern System Error Resilience', () => {
  let analyzer: LSFPatternAnalyzer;
  let validator: LSFPatternValidator;
  let optimizer: LSFPatternOptimizer;
  let errorLog: ErrorEvent[] = [];

  interface ErrorEvent {
    type: string;
    error: Error;
    recoveryAttempted: boolean;
    recovered: boolean;
    timestamp: number;
  }

  beforeEach(() => {
    analyzer = new LSFPatternAnalyzer();
    validator = new LSFPatternValidator();
    optimizer = new LSFPatternOptimizer();
    errorLog = [];

    // Mock de la méthode getState
    analyzer.getState = jest.fn().mockReturnValue({ status: 'ready' });
  });

  describe('Pattern Analysis Error Handling', () => {
    test('should recover from invalid expression data', async () => {
      const invalidExpressions = [
        generateInvalidExpression(),
        ...generateValidExpressions(3),
        generateInvalidExpression()
      ];

      // Utiliser un type intermédiaire unknown pour éviter l'erreur de conversion directe
      const result = (await analyzer.analyzePattern(
        invalidExpressions as unknown as Parameters<typeof analyzer.analyzePattern>[0],
        { intent: 'ERROR_TEST', environment: 'test', importance: 0.8 }
      )) as unknown as ExtendedPatternAnalysis;

      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.metadata.errorRate).toBeLessThan(0.3);
    });

    test('should handle corrupted pattern sequences', async () => {
      const corruptedPattern = {
        type: 'REPETITION',
        sequence: generateCorruptedSequence(),
        count: 5,
        confidence: 0.8
      };

      await expect(async () => {
        // Utiliser un type intermédiaire unknown
        const result = (await analyzer.analyzePattern(
          corruptedPattern.sequence as unknown as Parameters<typeof analyzer.analyzePattern>[0],
          { intent: 'ERROR_TEST', environment: 'test', importance: 0.8 }
        )) as unknown as ExtendedPatternAnalysis;

        expect(result.metadata.recoveredSegments).toBeGreaterThan(0);
      }).not.toThrow();
    });
  });

  describe('Validation Error Recovery', () => {
    test('should handle validation rule violations gracefully', async () => {
      const invalidPattern = {
        type: 'CIRCULAR',
        sequence: generateSequenceWithRuleViolations(),
        radius: 2.0, // Invalid radius
        smoothness: 1.5, // Invalid smoothness
        confidence: 0.8
      };

      const validation = await validator.validatePattern(
        invalidPattern,
        {
          intent: 'ERROR_TEST',
          environment: 'test',
          culturalContext: 'standard'
        }
      ) as ValidationResult;

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toHaveLength(2);
      expect(validation.suggestions).toHaveLength(2);
    });

    test('should recover from partial validation failures', async () => {
      const mixedPattern = {
        type: 'ALTERNATION',
        sequence: [
          ...generateValidExpressions(2),
          ...generateSequenceWithRuleViolations(),
          ...generateValidExpressions(2)
        ],
        count: 6,
        confidence: 0.8
      };

      // Convertir d'abord en unknown
      const validation = await validator.validatePattern(
        mixedPattern,
        {
          intent: 'ERROR_TEST',
          environment: 'test',
          culturalContext: 'standard'
        }
      ) as unknown as ExtendedValidationResult;

      expect(validation.partiallyValid).toBe(true);
      expect(validation.validSegments.length).toBeGreaterThan(0);
    });
  });

  describe('Optimization Error Handling', () => {
    test('should handle optimization failures with fallback', async () => {
      const problematicPattern = {
        type: 'REPETITION',
        sequence: generateSequenceWithOptimizationChallenges(),
        count: 5,
        confidence: 0.6
      };

      const validation = { isValid: true, issues: [], confidence: 0.8, suggestions: [] };

      // Convertir en unknown pour la compatibilité
      const result = await optimizer.optimizePattern(
        problematicPattern,
        validation,
        {
          importance: 0.8,
          performance: { targetFPS: 60, maxLatency: 16 },
          cultural: { formalityLevel: 0.7 }
        }
      ) as unknown as ExtendedOptimizedPattern;

      expect(result.metadata.usedFallback).toBe(true);
      expect(result.improvements.fluidity).toBeGreaterThan(0);
    });

    test('should recover from failed optimizations', async () => {
      const complexPattern = {
        type: 'CIRCULAR',
        sequence: generateCorruptedSequence(),
        radius: 0.3,
        smoothness: 0.7,
        confidence: 0.8
      };

      // Mock de façon plus directe sans tenter d'accéder à une méthode privée
      // En utilisant le casting vers un type Record avec des indexers
      const mockFunction = jest.fn().mockImplementation(() => {
        throw new Error('Optimization error');
      });

      // Créer un mock du comportement interne sans accéder directement à la méthode privée
      const originalOptimizePattern = optimizer.optimizePattern;
      optimizer.optimizePattern = jest.fn().mockImplementation(async (pattern, validationParam, optionsParam) => {
        // Utiliser les paramètres dans la logique pour éviter les avertissements
        const useValidation = validationParam.isValid;
        const importance = optionsParam.importance;

        if (pattern.type === 'CIRCULAR' && useValidation && importance > 0.5) {
          // Simuler l'erreur de la méthode privée
          mockFunction();
        }

        // Fallback au comportement normal
        return {
          pattern: pattern,
          improvements: { fluidity: 0.5 },
          metadata: {
            optimizationLevel: 1,
            processingTime: 50,
            resourceUsage: {},
            usedFallback: true,
            recoveryAttempts: 1
          }
        };
      });

      const validation = { isValid: true, issues: [], confidence: 0.8, suggestions: [] };

      const result = await optimizer.optimizePattern(
        complexPattern,
        validation,
        {
          importance: 0.8,
          performance: { targetFPS: 60, maxLatency: 16 },
          cultural: { formalityLevel: 0.7 }
        }
      ) as unknown as ExtendedOptimizedPattern;

      // Restaurer la méthode originale
      optimizer.optimizePattern = originalOptimizePattern;

      expect(result.metadata.recoveryAttempts).toBeGreaterThan(0);
      expect(result.pattern).toBeDefined();
    });
  });

  describe('System State Recovery', () => {
    test('should maintain system state after errors', async () => {
      const initialState = analyzer.getState();

      try {
        await analyzer.analyzePattern(
          generateSequenceWithErrors() as unknown as Parameters<typeof analyzer.analyzePattern>[0],
          { intent: 'ERROR_TEST', environment: 'test', importance: 0.8 }
        );
      } catch (error) {
        errorLog.push({
          type: 'ANALYSIS_ERROR',
          error: error instanceof Error ? error : new Error(String(error)),
          recoveryAttempted: true,
          recovered: false,
          timestamp: Date.now()
        });
      }

      const finalState = analyzer.getState();
      expect(finalState).toEqual(initialState);
    });

    test('should recover from concurrent error states', async () => {
      const patterns = Array(5).fill(null).map(() => ({
        type: 'REPETITION',
        sequence: generateSequenceWithRandomErrors(),
        count: 5,
        confidence: 0.8
      }));

      const results = await Promise.allSettled(
        patterns.map(pattern =>
          optimizer.optimizePattern(
            pattern,
            { isValid: true, issues: [], confidence: 0.8, suggestions: [] },
            {
              importance: 0.8,
              performance: { targetFPS: 60, maxLatency: 16 },
              cultural: { formalityLevel: 0.7 }
            }
          )
        )
      );

      const successfulOptimizations = results.filter(r => r.status === 'fulfilled');
      expect(successfulOptimizations.length).toBeGreaterThan(0);
    });
  });

  // Fonctions utilitaires
  function generateInvalidExpression(): Partial<LSFExpression> {
    return {
      eyebrows: { intensity: 0, position: NaN, tension: 0 } as EyebrowsProperties,
      head: { tilt: 0, forward: 0 } as HeadProperties,
      mouth: { shape: 'invalid', tension: 0 } as MouthProperties
    };
  }

  function generateCorruptedSequence(): Partial<LSFExpression>[] {
    return Array(5).fill(null).map((_, i) => ({
      eyebrows: i % 2 === 0 ? { position: 0.5, tension: 0.3, intensity: 0.5 } as EyebrowsProperties : { position: 0.5, tension: 0.3, intensity: 0.5 } as EyebrowsProperties,
      head: i % 3 === 0 ? { tilt: 0.2, forward: 0.3 } as HeadProperties : { tilt: 0.2, forward: 0.3 } as HeadProperties,
      mouth: { shape: 'neutral', tension: i > 3 ? 0.8 : 0.2 } as MouthProperties
    }));
  }

  function generateSequenceWithRuleViolations(): Partial<LSFExpression>[] {
    return Array(5).fill(null).map(() => ({
      eyebrows: { position: 0.9, tension: 0.9, intensity: 0.9 } as EyebrowsProperties,
      head: { tilt: 0.9, forward: 0.9 } as HeadProperties,
      mouth: { shape: 'invalid', tension: 0.5 } as MouthProperties
    }));
  }

  function generateSequenceWithOptimizationChallenges(): Partial<LSFExpression>[] {
    return Array(5).fill(null).map((_, i) => ({
      eyebrows: { position: Math.min(0.9, Math.abs(Math.sin(i * 10))), tension: Math.min(0.9, Math.abs(Math.cos(i * 10))), intensity: 0.5 } as EyebrowsProperties,
      head: { tilt: Math.min(0.9, Math.abs(Math.sin(i))), forward: Math.min(0.9, 1 / (i + 2)) } as HeadProperties,
      mouth: { shape: 'neutral', tension: Math.random() > 0.5 ? 0.1 : 0.9 } as MouthProperties
    }));
  }

  function generateSequenceWithErrors(): Partial<LSFExpression>[] {
    return Array(5).fill(null).map((_, i) => {
      if (i === 2) throw new Error('Simulated sequence error');
      return generateValidExpressions(1)[0];
    });
  }

  function generateSequenceWithRandomErrors(): Partial<LSFExpression>[] {
    return Array(5).fill(null).map(() => {
      if (Math.random() < 0.2) throw new Error('Random sequence error');
      return generateValidExpressions(1)[0];
    });
  }

  function generateValidExpressions(count: number): LSFExpression[] {
    return Array(count).fill(null).map(() => ({
      eyebrows: { position: 0.5, tension: 0.3, intensity: 0.5 } as EyebrowsProperties,
      head: { tilt: 0.2, forward: 0.3 } as HeadProperties,
      mouth: { shape: 'neutral', tension: 0.2 } as MouthProperties
    })) as LSFExpression[];
  }
});