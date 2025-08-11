// src/ai/systems/expressions/analysis/LSFPatternAnalyzer.ts
import type { LSFExpression, PatternContext, DetectedPattern, PatternAnalysis } from '../../../types';

interface ExpressionValues {
  [key: string]: number;
}

interface Point {
  x: number;
  y: number;
}

export class LSFPatternAnalyzer {
  private readonly PATTERN_RULES = {
    REPETITION: {
      minRepetitions: 2,
      maxRepetitions: 5,
      requiredSimilarity: 0.9
    },
    ALTERNATION: {
      minCycles: 2,
      maxCycles: 4,
      symmetryThreshold: 0.85
    },
    CIRCULAR: {
      minRadius: 0.1,
      maxRadius: 0.8,
      smoothnessThreshold: 0.9
    }
  };

  async analyzePattern(
    expressions: LSFExpression[],
    context: PatternContext
  ): Promise<PatternAnalysis> {
    const patterns: DetectedPattern[] = [];

    // Analyser les répétitions
    const repetitions = await this.detectRepetitions(expressions);
    patterns.push(...repetitions);

    // Analyser les alternances
    const alternations = await this.detectAlternations(expressions);
    patterns.push(...alternations);

    // Analyser les mouvements circulaires
    const circularMotions = await this.detectCircularMotions(expressions);
    patterns.push(...circularMotions);

    return {
      patterns,
      metadata: this.generateMetadata(patterns, context),
      suggestedOptimizations: this.generateOptimizations(patterns)
    };
  }

  private async detectRepetitions(
    expressions: LSFExpression[]
  ): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    let currentSequence: LSFExpression[] = [];

    for (let i = 1; i < expressions.length; i++) {
      const similarity = this.calculateExpressionSimilarity(
        expressions[i],
        expressions[i - 1]
      );

      if (similarity >= this.PATTERN_RULES.REPETITION.requiredSimilarity) {
        currentSequence.push(expressions[i - 1]);
      } else if (currentSequence.length >= this.PATTERN_RULES.REPETITION.minRepetitions) {
        patterns.push({
          type: 'REPETITION',
          sequence: [...currentSequence],
          count: currentSequence.length,
          confidence: this.calculatePatternConfidence(currentSequence)
        });
        currentSequence = [];
      }
    }

    return patterns;
  }

  private async detectAlternations(
    expressions: LSFExpression[]
  ): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    let currentCycle: LSFExpression[] = [];

    for (let i = 2; i < expressions.length; i += 2) {
      const isAlternating = this.checkAlternationPattern(
        expressions.slice(i - 2, i + 1)
      );

      if (isAlternating) {
        currentCycle.push(...expressions.slice(i - 2, i));
      } else if (currentCycle.length >= this.PATTERN_RULES.ALTERNATION.minCycles * 2) {
        patterns.push({
          type: 'ALTERNATION',
          sequence: currentCycle,
          count: currentCycle.length / 2,
          confidence: this.calculateAlternationConfidence(currentCycle)
        });
        currentCycle = [];
      }
    }

    return patterns;
  }

  private async detectCircularMotions(
    expressions: LSFExpression[]
  ): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    let currentMotion: LSFExpression[] = [];

    for (let i = 3; i < expressions.length; i++) {
      const isCircular = this.checkCircularMotion(
        expressions.slice(i - 3, i + 1)
      );

      if (isCircular) {
        currentMotion.push(expressions[i]);
      } else if (currentMotion.length >= 4) {
        patterns.push({
          type: 'CIRCULAR',
          sequence: currentMotion,
          radius: this.calculateCircularRadius(currentMotion),
          smoothness: this.calculateMotionSmoothness(currentMotion),
          confidence: this.calculateCircularConfidence(currentMotion)
        });
        currentMotion = [];
      }
    }

    return patterns;
  }

  private calculateExpressionSimilarity(
    expr1: LSFExpression,
    expr2: LSFExpression
  ): number {
    let similarityScore = 0;
    let totalComponents = 0;

    const components = ['eyebrows', 'head', 'mouth'] as const;
    for (const component of components) {
      const comp1 = expr1[component];
      const comp2 = expr2[component];

      if (comp1 && comp2) {
        // Vérifier que les composants sont des objets valides avec des propriétés numériques
        const validComp1 = this.ensureExpressionValues(comp1);
        const validComp2 = this.ensureExpressionValues(comp2);

        similarityScore += this.compareComponentValues(validComp1, validComp2);
        totalComponents++;
      }
    }

    return totalComponents > 0 ? similarityScore / totalComponents : 0;
  }

  /**
   * S'assure que l'objet est un ExpressionValues valide
   * @param obj Objet à valider
   * @returns Objet ExpressionValues valide
   */
  private ensureExpressionValues(obj: unknown): ExpressionValues {
    if (typeof obj !== 'object' || obj === null) {
      return {} as ExpressionValues;
    }

    // Créer un nouvel objet qui correspond à l'interface ExpressionValues
    const result: ExpressionValues = {};

    // Copier uniquement les propriétés numériques
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'number') {
        result[key] = value;
      }
    }

    return result;
  }

  private compareComponentValues(
    values1: ExpressionValues,
    values2: ExpressionValues
  ): number {
    let similarity = 0;
    let totalProperties = 0;

    for (const prop in values1) {
      if (prop in values2) {
        similarity += 1 - Math.abs(values1[prop] - values2[prop]);
        totalProperties++;
      }
    }

    return totalProperties > 0 ? similarity / totalProperties : 0;
  }

  private calculateExpressionDifference(
    expr1: LSFExpression,
    expr2: LSFExpression
  ): Record<string, number> {
    const diff: Record<string, number> = {};

    for (const component in expr1) {
      const value1 = expr1[component];
      const value2 = expr2[component];

      if (typeof value1 === 'object' && value1 !== null &&
        typeof value2 === 'object' && value2 !== null) {

        const values1 = Object.values(value1);
        const values2 = Object.values(value2);

        if (values1.length > 0 && values2.length > 0) {
          const firstValue = values1[0];
          const secondValue = values2[0];

          if (typeof firstValue === 'number' && typeof secondValue === 'number') {
            diff[component] = secondValue - firstValue;
          }
        }
      }
    }

    return diff;
  }

  private checkAlternationPattern(sequence: LSFExpression[]): boolean {
    if (sequence.length < 3) return false;

    const firstDiff = this.calculateExpressionDifference(sequence[0], sequence[1]);
    const secondDiff = this.calculateExpressionDifference(sequence[1], sequence[2]);

    return this.areOppositeMovements(firstDiff, secondDiff);
  }

  private areOppositeMovements(
    diff1: Record<string, number>,
    diff2: Record<string, number>
  ): boolean {
    for (const component in diff1) {
      if (diff2[component] && Math.abs(diff1[component] + diff2[component]) < 0.1) {
        return true;
      }
    }
    return false;
  }

  private checkCircularMotion(sequence: LSFExpression[]): boolean {
    if (sequence.length < 4) return false;

    const points = sequence.map(expression => this.extractMotionPoint(expression));
    return this.isCircularTrajectory(points);
  }

  private extractMotionPoint(expression: LSFExpression): Point {
    // Extraction des coordonnées x et y à partir de l'expression LSF
    // Par exemple, en utilisant la position des mains ou la tête
    const x = expression.handPosition?.x ?? 0;
    const y = expression.handPosition?.y ?? 0;
    return { x, y };
  }

  private isCircularTrajectory(points: Point[]): boolean {
    // Un cercle parfait aurait tous les points à la même distance du centre
    if (points.length < 4) return false;

    // Calculer le centre approximatif
    const center = this.calculateCenter(points);

    // Calculer la distance moyenne du centre
    const distances = points.map(p =>
      Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
    );

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;

    // Calculer la variance des distances
    const variance = distances.reduce((acc, d) => acc + Math.pow(d - avgDistance, 2), 0) / distances.length;

    // Si la variance est faible, les points sont probablement sur un cercle
    return variance < this.PATTERN_RULES.CIRCULAR.smoothnessThreshold;
  }

  private calculateCenter(points: Point[]): Point {
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    return {
      x: sumX / points.length,
      y: sumY / points.length
    };
  }

  private calculatePatternConfidence(sequence: LSFExpression[]): number {
    // Calcul de la confiance basé sur la cohérence des répétitions
    if (sequence.length < 2) return 0;

    let totalSimilarity = 0;

    for (let i = 1; i < sequence.length; i++) {
      totalSimilarity += this.calculateExpressionSimilarity(sequence[i], sequence[i - 1]);
    }

    return totalSimilarity / (sequence.length - 1);
  }

  private calculateAlternationConfidence(sequence: LSFExpression[]): number {
    // Calcul de la confiance pour les motifs d'alternance
    if (sequence.length < 4) return 0;

    let alternationScore = 0;
    const cycles = Math.floor(sequence.length / 2);

    for (let i = 0; i < cycles - 1; i++) {
      const firstCycleDiff = this.calculateExpressionDifference(
        sequence[i * 2], sequence[i * 2 + 1]
      );
      const secondCycleDiff = this.calculateExpressionDifference(
        sequence[(i + 1) * 2], sequence[(i + 1) * 2 + 1]
      );

      // Comparer la similarité entre les cycles
      let cycleSimScore = 0;
      let totalComps = 0;

      for (const comp in firstCycleDiff) {
        if (comp in secondCycleDiff) {
          cycleSimScore += 1 - Math.abs(firstCycleDiff[comp] - secondCycleDiff[comp]);
          totalComps++;
        }
      }

      alternationScore += totalComps > 0 ? cycleSimScore / totalComps : 0;
    }

    return cycles > 1 ? alternationScore / (cycles - 1) : 0;
  }

  private calculateCircularRadius(sequence: LSFExpression[]): number {
    const points = sequence.map(expr => this.extractMotionPoint(expr));
    const center = this.calculateCenter(points);

    // Calcul du rayon moyen
    const distances = points.map(p =>
      Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
    );

    return distances.reduce((a, b) => a + b, 0) / distances.length;
  }

  private calculateMotionSmoothness(sequence: LSFExpression[]): number {
    if (sequence.length < 3) return 0;

    // Calculer la régularité du mouvement en analysant les changements de direction
    let smoothnessScore = 0;

    for (let i = 1; i < sequence.length - 1; i++) {
      const prevDiff = this.calculateExpressionDifference(sequence[i - 1], sequence[i]);
      const nextDiff = this.calculateExpressionDifference(sequence[i], sequence[i + 1]);

      // Calculer la cohérence des mouvements
      let directionConsistency = 0;
      let totalDirections = 0;

      for (const comp in prevDiff) {
        if (comp in nextDiff) {
          // Vérifier si le mouvement continue dans la même direction
          const consistency = Math.sign(prevDiff[comp]) === Math.sign(nextDiff[comp]) ? 1 : 0;
          directionConsistency += consistency;
          totalDirections++;
        }
      }

      smoothnessScore += totalDirections > 0 ? directionConsistency / totalDirections : 0;
    }

    return sequence.length > 2 ? smoothnessScore / (sequence.length - 2) : 0;
  }

  private calculateCircularConfidence(sequence: LSFExpression[]): number {
    const points = sequence.map(expr => this.extractMotionPoint(expr));

    if (points.length < 4) return 0;

    // Calculer le centre du cercle
    const center = this.calculateCenter(points);

    // Calculer les distances au centre
    const distances = points.map(p =>
      Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
    );

    // Calculer la moyenne et l'écart-type des distances
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((acc, d) => acc + Math.pow(d - avgDistance, 2), 0) / distances.length;
    const stdDev = Math.sqrt(variance);

    // Normaliser l'écart-type par rapport à la distance moyenne
    const normalizedStdDev = stdDev / avgDistance;

    // Plus l'écart-type normalisé est bas, plus la confiance est élevée
    return Math.max(0, 1 - normalizedStdDev * 2);
  }

  private generateMetadata(
    patterns: DetectedPattern[],
    _context: PatternContext // Préfixé avec underscore pour indiquer qu'il n'est pas utilisé
  ): PatternAnalysis['metadata'] {
    // Le contexte pourrait être utilisé dans des implémentations futures
    // pour des ajustements de métadonnées basés sur le contexte

    return {
      totalPatterns: patterns.length,
      dominantType: this.findDominantType(patterns),
      averageConfidence: this.calculateAverageConfidence(patterns)
    };
  }

  private calculateContextualSignificance(
    patterns: DetectedPattern[],
    _context: PatternContext  // Préfixé avec underscore pour indiquer qu'il n'est pas utilisé
  ): number {
    // Calculer la pertinence des motifs détectés par rapport au contexte
    if (patterns.length === 0) return 0;

    let relevanceScore = 0;

    // Ajuster en fonction du contexte d'intention
    if (_context.intent) {
      // Facteur basé sur le type d'intention
      const intentTypeMap: Record<string, number> = {
        'question': 0.8,
        'statement': 0.6,
        'command': 0.7,
        'exclamation': 0.9
      };

      const intentFactor = intentTypeMap[_context.intent] || 0.5;
      relevanceScore += intentFactor;
    }

    return Math.min(1, relevanceScore);
  }

  private findDominantType(patterns: DetectedPattern[]): string {
    if (patterns.length === 0) return 'NONE';

    // Compter les occurrences de chaque type
    const typeCounts: Record<string, number> = {};

    for (const pattern of patterns) {
      typeCounts[pattern.type] = (typeCounts[pattern.type] || 0) + 1;
    }

    // Trouver le type le plus fréquent
    let dominantType = 'NONE';
    let maxCount = 0;

    for (const type in typeCounts) {
      if (typeCounts[type] > maxCount) {
        maxCount = typeCounts[type];
        dominantType = type;
      }
    }

    return dominantType;
  }

  private calculateAverageConfidence(patterns: DetectedPattern[]): number {
    if (patterns.length === 0) return 0;

    const totalConfidence = patterns.reduce(
      (sum, pattern) => sum + (pattern.confidence || 0),
      0
    );

    return totalConfidence / patterns.length;
  }

  private generateOptimizations(patterns: DetectedPattern[]): string[] {
    const optimizations: string[] = [];

    if (patterns.length === 0) {
      return ['Aucune optimisation nécessaire'];
    }

    // Analyser les types de motifs détectés
    const patternTypes = patterns.map(p => p.type);
    const hasRepetition = patternTypes.includes('REPETITION');
    const hasAlternation = patternTypes.includes('ALTERNATION');
    const hasCircular = patternTypes.includes('CIRCULAR');

    // Générer des optimisations basées sur les motifs détectés
    if (hasRepetition) {
      optimizations.push('Optimiser les répétitions en utilisant des boucles d\'animation');
    }

    if (hasAlternation) {
      optimizations.push('Utiliser des transitions bidirectionnelles pour les motifs d\'alternance');
    }

    if (hasCircular) {
      optimizations.push('Appliquer des courbes de Bézier pour fluidifier les mouvements circulaires');
    }

    // Analyser la confiance globale
    const avgConfidence = this.calculateAverageConfidence(patterns);
    if (avgConfidence < 0.7) {
      optimizations.push('Affiner les seuils de détection pour améliorer la précision');
    }

    return optimizations;
  }
}