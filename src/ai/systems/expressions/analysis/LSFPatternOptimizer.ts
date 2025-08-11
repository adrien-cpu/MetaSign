// src/ai/systems/expressions/analysis/LSFPatternOptimizer.ts
import { LSFExpression } from '../lsf/LSFGrammarSystem';
import { DetectedPattern } from './LSFPatternAnalyzer';
import { ValidationResult } from './LSFPatternValidator';

export class LSFPatternOptimizer {
  private readonly OPTIMIZATION_PARAMETERS = {
    REPETITION: {
      speedAdjustment: 0.15,
      rhythmStabilization: 0.2,
      emphasisBoost: 0.3
    },
    ALTERNATION: {
      symmetryCorrection: 0.25,
      timingRegularization: 0.2,
      transitionSmoothing: 0.3
    },
    CIRCULAR: {
      radiusNormalization: 0.2,
      smoothingFactor: 0.3,
      centroidStabilization: 0.25
    }
  };

  async optimizePattern(
    pattern: DetectedPattern,
    validation: ValidationResult,
    context: OptimizationContext
  ): Promise<OptimizedPattern> {
    // Créer une copie pour l'optimisation
    const optimizedPattern = this.clonePattern(pattern);

    // Appliquer les optimisations selon le type
    switch (pattern.type) {
      case 'REPETITION':
        await this.optimizeRepetition(optimizedPattern, validation);
        break;
      case 'ALTERNATION':
        await this.optimizeAlternation(optimizedPattern, validation);
        break;
      case 'CIRCULAR':
        await this.optimizeCircularMotion(optimizedPattern, validation);
        break;
    }

    // Post-traitement pour la fluidité
    await this.applyFluidityOptimizations(optimizedPattern, context);

    // Vérifier les améliorations
    const improvements = this.measureImprovements(pattern, optimizedPattern);

    return {
      pattern: optimizedPattern,
      improvements,
      metadata: this.generateOptimizationMetadata(improvements)
    };
  }

  private async optimizeRepetition(
    pattern: DetectedPattern,
    validation: ValidationResult
  ): Promise<void> {
    const params = this.OPTIMIZATION_PARAMETERS.REPETITION;

    if (this.hasIssue(validation, 'RHYTHM_ERROR')) {
      await this.normalizeRepetitionSpeed(pattern, params.speedAdjustment);
    }

    if (this.hasIssue(validation, 'IRREGULARITY')) {
      await this.stabilizeRhythm(pattern, params.rhythmStabilization);
    }

    if (this.hasIssue(validation, 'MISSING_EMPHASIS')) {
      await this.enhanceEmphasis(pattern, params.emphasisBoost);
    }
  }

  private async optimizeAlternation(
    pattern: DetectedPattern,
    validation: ValidationResult
  ): Promise<void> {
    const params = this.OPTIMIZATION_PARAMETERS.ALTERNATION;

    if (this.hasIssue(validation, 'ASYMMETRY_ERROR')) {
      await this.balanceAlternation(pattern, params.symmetryCorrection);
    }

    if (this.hasIssue(validation, 'TIMING_ERROR')) {
      await this.regularizeTiming(pattern, params.timingRegularization);
    }

    await this.smoothTransitions(pattern, params.transitionSmoothing);
  }

  private async optimizeCircularMotion(
    pattern: DetectedPattern,
    validation: ValidationResult
  ): Promise<void> {
    const params = this.OPTIMIZATION_PARAMETERS.CIRCULAR;

    if (this.hasIssue(validation, 'GEOMETRY_ERROR')) {
      await this.normalizeCircularity(pattern, params.radiusNormalization);
    }

    if (this.hasIssue(validation, 'FLUIDITY_ERROR')) {
      await this.smoothCircularMotion(pattern, params.smoothingFactor);
    }

    await this.stabilizeCentroid(pattern, params.centroidStabilization);
  }

  private async normalizeRepetitionSpeed(
    pattern: DetectedPattern,
    adjustmentFactor: number
  ): Promise<void> {
    const sequence = pattern.sequence;
    const avgDuration = this.calculateAverageDuration(sequence);
    
    // Ajuster chaque répétition vers la durée moyenne
    for (let i = 0; i < sequence.length; i++) {
      const duration = this.getExpressionDuration(sequence[i]);
      const adjustment = (avgDuration - duration) * adjustmentFactor;
      
      sequence[i] = await this.adjustExpressionTiming(
        sequence[i],
        duration + adjustment
      );
    }
  }

  private async stabilizeRhythm(
    pattern: DetectedPattern,
    stabilizationFactor: number
  ): Promise<void> {
    const sequence = pattern.sequence;
    const intervals = this.calculateIntervals(sequence);
    const targetInterval = this.calculateOptimalInterval(intervals);

    for (let i = 1; i < sequence.length; i++) {
      const currentInterval = intervals[i - 1];
      const adjustment = (targetInterval - currentInterval) * stabilizationFactor;
      
      sequence[i] = await this.adjustExpressionTiming(
        sequence[i],
        sequence[i - 1].timing.duration + targetInterval + adjustment
      );
    }
  }

  private async enhanceEmphasis(
    pattern: DetectedPattern,
    emphasisFactor: number
  ): Promise<void> {
    const sequence = pattern.sequence;
    const peakIndices = this.findEmphasisPeaks(sequence);

    for (const index of peakIndices) {
      sequence[index] = await this.amplifyEmphasis(
        sequence[index],
        emphasisFactor
      );
    }
  }

  private async balanceAlternation(
    pattern: DetectedPattern,
    correctionFactor: number
  ): Promise<void> {
    const sequence = pattern.sequence;
    const pairs = this.groupIntoPairs(sequence);
    
    for (const [first, second] of pairs) {
      const asymmetry = this.calculateAsymmetry(first, second);
      if (asymmetry > 0.1) {
        const correction = this.calculateSymmetryCorrection(first, second, correctionFactor);
        this.applySymmetryCorrection(first, second, correction);
      }
    }
  }

  private async smoothCircularMotion(
    pattern: DetectedPattern,
    smoothingFactor: number
  ): Promise<void> {
    const points = pattern.sequence.map(expr => this.extractMotionPoint(expr));
    const smoothedPoints = this.applySavitzkyGolaySmoothing(points);
    
    // Mettre à jour les expressions avec les points lissés
    for (let i = 0; i < pattern.sequence.length; i++) {
      pattern.sequence[i] = await this.updateExpressionFromPoint(
        pattern.sequence[i],
        smoothedPoints[i]
      );
    }
  }

  private async stabilizeCentroid(
    pattern: DetectedPattern,
    stabilizationFactor: number
  ): Promise<void> {
    const points = pattern.sequence.map(expr => this.extractMotionPoint(expr));
    const centroid = this.calculateCentroid(points);
    const normalizedPoints = this.normalizeToCentroid(points, centroid, stabilizationFactor);

    // Appliquer les corrections
    for (let i = 0; i < pattern.sequence.length; i++) {
      pattern.sequence[i] = await this.updateExpressionFromPoint(
        pattern.sequence[i],
        normalizedPoints[i]
      );
    }
  }

  private groupIntoPairs(sequence: LSFExpression[]): [LSFExpression, LSFExpression][] {
    const pairs: [LSFExpression, LSFExpression][] = [];
    for (let i = 0; i < sequence.length - 1; i += 2) {
      pairs.push([sequence[i], sequence[i + 1]]);
    }
    return pairs;
  }

  private calculateAsymmetry(
    expr1: LSFExpression, 
    expr2: LSFExpression
  ): number {
    const components = ['head', 'eyebrows', 'mouth'];
    let totalAsymmetry = 0;
    let totalComponents = 0;

    for (const component of components) {
      if (expr1[component] && expr2[component]) {
        totalAsymmetry += this.calculateComponentAsymmetry(
          expr1[component],
          expr2[component]
        );
        totalComponents++;
      }
    }

    return totalComponents > 0 ? totalAsymmetry / totalComponents : 0;
  }

  private applySavitzkyGolaySmoothing(points: Point3D[]): Point3D[] {
    const windowSize = 5; // Taille de la fenêtre glissante
    const degree = 2; // Degré polynomial
    const smoothed: Point3D[] = [];

    for (let i = 0; i < points.length; i++) {
      const window = this.getWindow(points, i, windowSize);
      const smoothedPoint = this.savitzkyGolayFilter(window, degree);
      smoothed.push(smoothedPoint);
    }

    return smoothed;
  }

  private calculateComponentAsymmetry(
    comp1: any,
    comp2: any
  ): number {
    let asymmetry = 0;
    let totalProperties = 0;

    for (const prop in comp1) {
      if (typeof comp1[prop] === 'number' && typeof comp2[prop] === 'number') {
        asymmetry += Math.abs(comp1[prop] + comp2[prop]); // Mesure de l'asymétrie
        totalProperties++;
      }
    }

    return totalProperties > 0 ? asymmetry / totalProperties : 0;
  }

  private async applyFluidityOptimizations(
    pattern: DetectedPattern,
    context: OptimizationContext
  ): Promise<void> {
    // Lissage des transitions entre expressions
    for (let i = 1; i < pattern.sequence.length; i++) {
      const transition = await this.optimizeTransition(
        pattern.sequence[i - 1],
        pattern.sequence[i],
        context
      );
      
      pattern.sequence[i - 1] = transition.from;
      pattern.sequence[i] = transition.to;
    }

    // Ajustement global de la fluidité
    const fluidityFactor = this.calculateFluidityFactor(context);
    for (const expression of pattern.sequence) {
      await this.enhanceExpressionFluidity(expression, fluidityFactor);
    }
  }

  private measureImprovements(
    original: DetectedPattern,
    optimized: DetectedPattern
  ): PatternImprovements {
    return {
      fluidity: this.comparePatternFluidity(original, optimized),
      precision: this.comparePatternPrecision(original, optimized),
      naturalness: this.comparePatternNaturalness(original, optimized),
      efficiency: this.comparePatternEfficiency(original, optimized)
    };
  }

  private generateOptimizationMetadata(
    improvements: PatternImprovements
  ): OptimizationMetadata {
    const overallImprovement = this.calculateOverallImprovement(improvements);
    
    return {
      optimizationScore: overallImprovement,
      timeComplexity: this.estimateTimeComplexity(improvements),
      spaceComplexity: this.estimateSpaceComplexity(improvements),
      confidence: this.calculateOptimizationConfidence(improvements)
    };
  }
}

interface OptimizationContext {
  importance: number;
  performance: {
    targetFPS: number;
    maxLatency: number;
  };
  cultural: {
    regionalVariant?: string;
    formalityLevel: number;
  };
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface PatternImprovements {
  fluidity: number;
  precision: number;
  naturalness: number;
  efficiency: number;
}

interface OptimizedPattern {
  pattern: DetectedPattern;
  improvements: PatternImprovements;
  metadata: OptimizationMetadata;
}

interface OptimizationMetadata {
  optimizationScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  confidence: number;
}