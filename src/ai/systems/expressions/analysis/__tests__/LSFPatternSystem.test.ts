// src/ai/systems/expressions/analysis/__tests__/LSFPatternSystem.test.ts
import { LSFPatternAnalyzer } from '@/ai/systems/expressions/analysis/LSFPatternAnalyzer';
import { LSFPatternValidator } from '@/ai/systems/expressions/analysis/LSFPatternValidator';
import { LSFPatternOptimizer } from '@/ai/systems/expressions/analysis/LSFPatternOptimizer';
import { LSFExpression as GrammarLSFExpression } from '@/ai/systems/expressions/lsf/LSFGrammarSystem';
import { LSFExpression as TypesLSFExpression } from '@/ai/types';

// Adaptateur pour convertir entre les deux types LSFExpression
function adaptExpression(expressions: GrammarLSFExpression[]): TypesLSFExpression[] {
  // Cette fonction convertit les expressions du format LSFGrammarSystem vers le format attendu
  // par les analyseurs qui utilisent le type dans @/ai/types
  return expressions as unknown as TypesLSFExpression[];
}

// Fonctions helper pour générer des données de test - déclarées en dehors des blocs de test pour
// être accessibles partout
function generateRepetitiveExpressions(count: number): GrammarLSFExpression[] {
  return Array(count).fill(null).map(() => ({
    eyebrows: { position: 0.8, tension: 0.3, intensity: 0.7 },
    head: { tilt: 0.2, forward: 0.3 },
    mouth: { shape: 'neutral', tension: 0.2 }
  }));
}

function generateAlternatingExpressions(count: number): GrammarLSFExpression[] {
  const baseExpr1 = {
    eyebrows: { position: 0.8, tension: 0.3, intensity: 0.7 },
    head: { tilt: 0.2, forward: 0.3 },
    mouth: { shape: 'neutral', tension: 0.2 }
  };

  const baseExpr2 = {
    eyebrows: { position: -0.8, tension: 0.3, intensity: 0.7 },
    head: { tilt: -0.2, forward: 0.3 },
    mouth: { shape: 'neutral', tension: 0.2 }
  };

  return Array(count).fill(null).map((_, i) =>
    i % 2 === 0 ? baseExpr1 : baseExpr2
  );
}

function generateCircularExpressions(count: number): GrammarLSFExpression[] {
  const radius = 0.3;
  return Array(count).fill(null).map((_, i) => {
    const angle = (i / count) * 2 * Math.PI;
    return {
      eyebrows: { position: 0, tension: 0.2, intensity: 0.5 },
      head: {
        tilt: radius * Math.cos(angle),
        forward: radius * Math.sin(angle)
      },
      mouth: { shape: 'neutral', tension: 0.2 }
    };
  });
}

function generateAsymmetricAlternation(count: number): GrammarLSFExpression[] {
  const baseExpr1 = {
    eyebrows: { position: 0.9, tension: 0.4, intensity: 0.8 },
    head: { tilt: 0.3, forward: 0.4 },
    mouth: { shape: 'neutral', tension: 0.3 }
  };

  const baseExpr2 = {
    eyebrows: { position: -0.7, tension: 0.2, intensity: 0.6 }, // Asymétrie intentionnelle
    head: { tilt: -0.1, forward: 0.2 },
    mouth: { shape: 'neutral', tension: 0.1 }
  };

  return Array(count).fill(null).map((_, i) =>
    i % 2 === 0 ? baseExpr1 : baseExpr2
  );
}

function generateIrregularRepetition(count: number): GrammarLSFExpression[] {
  const baseExpr = {
    eyebrows: { position: 0.8, tension: 0.3, intensity: 0.7 },
    head: { tilt: 0.2, forward: 0.3 },
    mouth: { shape: 'neutral', tension: 0.2 }
  };

  return Array(count).fill(null).map(() => ({
    ...baseExpr,
    timing: { // Ajout d'irrégularités temporelles
      duration: 300 + Math.random() * 200,
      easing: 'easeInOut'
    }
  }));
}

function generateRoughCircularMotion(count: number): GrammarLSFExpression[] {
  const radius = 0.3;
  return Array(count).fill(null).map((_, i) => {
    const angle = (i / count) * 2 * Math.PI;
    const noise = (Math.random() - 0.5) * 0.2; // Ajout de bruit
    return {
      eyebrows: { position: 0, tension: 0.2, intensity: 0.5 },
      head: {
        tilt: radius * Math.cos(angle) + noise,
        forward: radius * Math.sin(angle) + noise
      },
      mouth: { shape: 'neutral', tension: 0.2 }
    };
  });
}

function generateComplexPattern(): GrammarLSFExpression[] {
  return [
    ...generateRepetitiveExpressions(2),
    ...generateCircularExpressions(4),
    ...generateAlternatingExpressions(2)
  ];
}

describe('LSF Pattern System', () => {
  let analyzer: LSFPatternAnalyzer;
  let validator: LSFPatternValidator;
  let optimizer: LSFPatternOptimizer;

  beforeEach(() => {
    analyzer = new LSFPatternAnalyzer();
    validator = new LSFPatternValidator();
    optimizer = new LSFPatternOptimizer();
  });

  describe('Pattern Detection', () => {
    test('should detect simple repetition pattern', async () => {
      const expressions = generateRepetitiveExpressions(3);
      const context = { intent: 'EMPHASIS', environment: 'formal', importance: 0.8 };

      const analysis = await analyzer.analyzePattern(adaptExpression(expressions), context);

      expect(analysis.patterns).toHaveLength(1);
      expect(analysis.patterns[0].type).toBe('REPETITION');
      expect(analysis.patterns[0].count).toBe(3);
    });

    test('should detect alternating pattern', async () => {
      const expressions = generateAlternatingExpressions(4);
      const context = { intent: 'COMPARISON', environment: 'formal', importance: 0.7 };

      const analysis = await analyzer.analyzePattern(adaptExpression(expressions), context);

      expect(analysis.patterns).toHaveLength(1);
      expect(analysis.patterns[0].type).toBe('ALTERNATION');
      expect(analysis.patterns[0].count).toBe(2);
    });

    test('should detect circular motion pattern', async () => {
      const expressions = generateCircularExpressions(8);
      const context = { intent: 'CONTINUOUS', environment: 'casual', importance: 0.6 };

      const analysis = await analyzer.analyzePattern(adaptExpression(expressions), context);

      expect(analysis.patterns).toHaveLength(1);
      expect(analysis.patterns[0].type).toBe('CIRCULAR');
      expect(analysis.patterns[0].smoothness).toBeGreaterThan(0.8);
    });
  });

  describe('Pattern Validation', () => {
    test('should validate correct repetition pattern', async () => {
      const pattern = {
        type: 'REPETITION',
        sequence: adaptExpression(generateRepetitiveExpressions(3)),
        count: 3,
        confidence: 0.9
      };

      const context = {
        intent: 'EMPHASIS',
        environment: 'formal',
        culturalContext: 'standard',
      };

      const validation = await validator.validatePattern(pattern, context);

      expect(validation.isValid).toBe(true);
      expect(validation.confidence).toBeGreaterThan(0.8);
      expect(validation.issues).toHaveLength(0);
    });

    test('should detect invalid alternation symmetry', async () => {
      const pattern = {
        type: 'ALTERNATION',
        sequence: adaptExpression(generateAsymmetricAlternation(4)),
        count: 2,
        confidence: 0.7
      };

      const context = {
        intent: 'COMPARISON',
        environment: 'formal',
        culturalContext: 'standard',
      };

      const validation = await validator.validatePattern(pattern, context);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContainEqual(
        expect.objectContaining({
          type: 'ASYMMETRY_ERROR'
        })
      );
    });

    test('should validate circular motion fluidity', async () => {
      const pattern = {
        type: 'CIRCULAR',
        sequence: adaptExpression(generateCircularExpressions(8)),
        radius: 0.3,
        smoothness: 0.75,
        confidence: 0.85
      };

      const context = {
        intent: 'CONTINUOUS',
        environment: 'casual',
        culturalContext: 'standard',
      };

      const validation = await validator.validatePattern(pattern, context);

      expect(validation.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'FLUIDITY_ERROR'
          })
        ])
      );
    });
  });

  describe('Pattern Optimization', () => {
    test('should optimize repetition rhythm', async () => {
      const pattern = {
        type: 'REPETITION',
        sequence: adaptExpression(generateIrregularRepetition(3)),
        count: 3,
        confidence: 0.7
      };

      const validation = {
        isValid: false,
        issues: [{
          type: 'RHYTHM_ERROR',
          severity: 'high',
          message: 'Irregular rhythm'
        }],
        confidence: 0.7,
        suggestions: []
      };

      const context = {
        importance: 0.8,
        performance: {
          targetFPS: 60,
          maxLatency: 16
        },
        cultural: {
          formalityLevel: 0.7
        }
      };

      const optimized = await optimizer.optimizePattern(pattern, validation, context);

      expect(optimized.improvements.fluidity).toBeGreaterThan(0.8);
      expect(optimized.improvements.naturalness).toBeGreaterThan(0.75);
      expect(optimized.metadata.optimizationScore).toBeGreaterThan(0.8);
    });

    test('should optimize circular motion smoothness', async () => {
      const pattern = {
        type: 'CIRCULAR',
        sequence: adaptExpression(generateRoughCircularMotion(8)),
        radius: 0.3,
        smoothness: 0.6,
        confidence: 0.7
      };

      const validation = {
        isValid: false,
        issues: [{
          type: 'FLUIDITY_ERROR',
          severity: 'medium',
          message: 'Motion not smooth enough'
        }],
        confidence: 0.7,
        suggestions: []
      };

      const context = {
        importance: 0.7,
        performance: {
          targetFPS: 60,
          maxLatency: 16
        },
        cultural: {
          formalityLevel: 0.6
        }
      };

      const optimized = await optimizer.optimizePattern(pattern, validation, context);

      expect(optimized.improvements.fluidity).toBeGreaterThan(0.85);
      expect(optimized.pattern.smoothness).toBeGreaterThan(0.8);
    });
  });
});

// Tests additionnels pour les cas limites et complexes
describe('LSF Pattern Edge Cases', () => {
  let analyzer: LSFPatternAnalyzer;
  let validator: LSFPatternValidator;

  beforeEach(() => {
    analyzer = new LSFPatternAnalyzer();
    validator = new LSFPatternValidator();
  });

  test('should handle minimal pattern length', async () => {
    const expressions = generateRepetitiveExpressions(2); // Longueur minimale
    const context = { intent: 'BASIC', environment: 'casual', importance: 0.5 };

    const analysis = await analyzer.analyzePattern(adaptExpression(expressions), context);
    expect(analysis.patterns).toHaveLength(1);
  });

  test('should handle pattern interruption', async () => {
    const expressions = [...generateRepetitiveExpressions(2), {
      // Expression interruptive
      eyebrows: { position: 0, tension: 0, intensity: 0 },
      head: { tilt: 0, forward: 0 },
      mouth: { shape: 'neutral', tension: 0 }
    }, ...generateRepetitiveExpressions(2)];

    const context = { intent: 'COMPLEX', environment: 'formal', importance: 0.8 };

    const analysis = await analyzer.analyzePattern(adaptExpression(expressions), context);
    expect(analysis.patterns).toHaveLength(2);
  });

  test('should detect nested patterns', async () => {
    const expressions = [
      ...generateCircularExpressions(4),
      ...generateRepetitiveExpressions(2),
      ...generateCircularExpressions(4)
    ];

    const context = { intent: 'COMPOUND', environment: 'formal', importance: 0.9 };

    const analysis = await analyzer.analyzePattern(adaptExpression(expressions), context);
    expect(analysis.patterns.length).toBeGreaterThan(1);
  });

  test('should handle extreme expression values', async () => {
    const extremeExpression = {
      eyebrows: { position: 1, tension: 1, intensity: 1 },
      head: { tilt: 1, forward: 1 },
      mouth: { shape: 'extreme', tension: 1 }
    };

    const pattern = {
      type: 'REPETITION',
      sequence: adaptExpression(Array(3).fill(extremeExpression)),
      count: 3,
      confidence: 0.5
    };

    const context = {
      intent: 'EMPHASIS',
      environment: 'formal',
      culturalContext: 'standard'
    };

    const validation = await validator.validatePattern(pattern, context);
    expect(validation.isValid).toBe(false);
    expect(validation.issues).toContainEqual(
      expect.objectContaining({
        type: 'INTENSITY_ERROR'
      })
    );
  });
});

describe('LSF Pattern Integration Tests', () => {
  let analyzer: LSFPatternAnalyzer;
  let validator: LSFPatternValidator;
  let optimizer: LSFPatternOptimizer;

  beforeEach(() => {
    analyzer = new LSFPatternAnalyzer();
    validator = new LSFPatternValidator();
    optimizer = new LSFPatternOptimizer();
  });

  test('should handle full pattern lifecycle', async () => {
    // 1. Analyse initiale
    const expressions = generateComplexPattern();
    const context = { intent: 'COMPLEX', environment: 'formal', importance: 0.9 };

    const analysis = await analyzer.analyzePattern(adaptExpression(expressions), context);
    expect(analysis.patterns.length).toBeGreaterThan(0);

    // 2. Validation
    const validation = await validator.validatePattern(
      analysis.patterns[0],
      {
        intent: 'COMPLEX',
        environment: 'formal',
        culturalContext: 'standard'
      }
    );

    // 3. Optimisation
    const optimized = await optimizer.optimizePattern(
      analysis.patterns[0],
      validation,
      {
        importance: 0.9,
        performance: { targetFPS: 60, maxLatency: 16 },
        cultural: { formalityLevel: 0.8 }
      }
    );

    // Vérifications
    expect(validation.confidence).toBeGreaterThan(0);
    expect(optimized.improvements.fluidity).toBeGreaterThan(0);
    expect(optimized.metadata.optimizationScore).toBeGreaterThan(0);
  });
});