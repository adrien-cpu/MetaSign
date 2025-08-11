// src/ai/feedback/validators/specialized/CoherenceValidator.ts

import { ValidationResult, ValidationIssue, ValidationSeverity } from '@ai/feedback/types/validation';
import { LSFExpression } from '@ai/systems/expressions/emotions/types/LSFExpression';
import { SpatialRelationship } from '@ai/feedback/validators/interfaces/ISpatialValidator';
import {
  SeverityWeights,
  ValidationParams,
  CoherenceRule,
  CoherenceConstraint
} from '@ai/feedback/validators/types';

interface StructuralElement {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  position: number;
}

interface TemporalSequence {
  id: string;
  start: number;
  duration: number;
  elements: string[];
}

interface SpatialConfiguration {
  id: string;
  position: { x: number; y: number; z: number };
  orientation: { x: number; y: number; z: number };
  scale: number;
}

interface SemanticElement {
  id: string;
  meaning: string;
  context: string[];
  relations: string[];
}

interface CoherenceAnalysis {
  isCoherent: boolean;
  incoherenceLevel: number;
  reason: string;
}

interface ConstraintEvaluation {
  satisfied: boolean;
  deviation: number;
  reason: string;
}

export class CoherenceValidator {
  private readonly severityMap: Record<ValidationSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3
  };

  constructor(
    private readonly coherenceRules: CoherenceRule[],
    private readonly relationships: SpatialRelationship[]
  ) { }

  async validate(expression: LSFExpression): Promise<ValidationResult> {
    const validations = await Promise.all([
      this.validateStructuralCoherence(expression),
      this.validateTemporalCoherence(expression),
      this.validateSpatialCoherence(expression),
      this.validateSemanticCoherence(expression)
    ]);

    return this.aggregateResults(validations);
  }

  private async validateStructuralCoherence(expression: LSFExpression): Promise<ValidationResult> {
    const issues: ValidationParams[] = [];
    const structuralElements = this.extractStructuralElements(expression);

    for (const element of structuralElements) {
      const structuralRules = this.getMatchingRules(element.id, 'structural');
      for (const rule of structuralRules) {
        const analysis = this.analyzeStructuralCoherence(element, rule);
        if (!analysis.isCoherent) {
          issues.push(this.createIssue('structural_coherence', analysis));
        }
      }
    }

    return this.createValidationResult(issues, this.calculateScore(issues));
  }

  private async validateTemporalCoherence(expression: LSFExpression): Promise<ValidationResult> {
    const issues: ValidationParams[] = [];
    const temporalSequences = this.extractTemporalSequences(expression);

    for (const sequence of temporalSequences) {
      const temporalRules = this.getMatchingRules(sequence.id, 'temporal');
      for (const rule of temporalRules) {
        const analysis = this.analyzeTemporalCoherence(sequence, rule);
        if (!analysis.isCoherent) {
          issues.push(this.createIssue('temporal_coherence', analysis));
        }
      }
    }

    return this.createValidationResult(issues, this.calculateScore(issues));
  }

  private async validateSpatialCoherence(expression: LSFExpression): Promise<ValidationResult> {
    const issues: ValidationParams[] = [];
    const spatialConfigurations = this.extractSpatialConfigurations(expression);

    for (const config of spatialConfigurations) {
      const spatialRules = this.getMatchingRules(config.id, 'spatial');
      const spatialRelations = this.findRelatedSpatialRelationships(config.id);

      for (const rule of spatialRules) {
        const analysis = this.analyzeSpatialCoherence(config, rule, spatialRelations);
        if (!analysis.isCoherent) {
          issues.push(this.createIssue('spatial_coherence', analysis));
        }
      }
    }

    return this.createValidationResult(issues, this.calculateScore(issues));
  }

  private async validateSemanticCoherence(expression: LSFExpression): Promise<ValidationResult> {
    const issues: ValidationParams[] = [];
    const semanticElements = this.extractSemanticElements(expression);

    for (const element of semanticElements) {
      const semanticRules = this.getMatchingRules(element.id, 'semantic');
      for (const rule of semanticRules) {
        const analysis = this.analyzeSemanticCoherence(element, rule);
        if (!analysis.isCoherent) {
          issues.push(this.createIssue('semantic_coherence', analysis));
        }
      }
    }

    return this.createValidationResult(issues, this.calculateScore(issues));
  }

  private findRelatedSpatialRelationships(elementId: string): SpatialRelationship[] {
    return this.relationships.filter(rel =>
      rel.source === elementId || rel.target === elementId
    );
  }

  private getMatchingRules(elementId: string, propertyType: string): CoherenceRule[] {
    return this.coherenceRules.filter(rule =>
      rule.elements.includes(elementId) &&
      rule.constraints.some(constraint => constraint.property === propertyType)
    );
  }

  private createIssue(type: string, analysis: CoherenceAnalysis): ValidationParams {
    return {
      type,
      severity: this.calculateSeverity(analysis.incoherenceLevel),
      description: analysis.reason,
      location: { x: 0, y: 0, z: 0 } // Valeur par défaut
    };
  }

  private createValidationResult(issues: ValidationParams[], score: number): ValidationResult {
    // Conversion des ValidationParams en ValidationIssue pour compatibilité
    const validationIssues: ValidationIssue[] = issues.map(issue => ({
      type: issue.type,
      severity: issue.severity,
      description: issue.description,
      location: issue.location as { x?: number; y?: number; z?: number }
    }));

    return {
      isValid: issues.length === 0,
      issues: validationIssues,
      score
    };
  }

  private calculateScore(issues: ValidationParams[]): number {
    if (issues.length === 0) return 1.0;

    return Math.max(0, 1 - issues.reduce((sum, issue) => {
      return sum + SeverityWeights[issue.severity] || 0.1;
    }, 0));
  }

  private calculateSeverity(incoherenceLevel: number): ValidationSeverity {
    if (incoherenceLevel < 0.3) return 'low';
    if (incoherenceLevel < 0.7) return 'medium';
    return 'high';
  }

  private aggregateResults(results: ValidationResult[]): ValidationResult {
    const allIssues = results.flatMap(r => r.issues);
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      isValid: results.every(r => r.isValid),
      issues: this.prioritizeIssues(allIssues),
      score: averageScore
    };
  }

  private prioritizeIssues(issues: ValidationIssue[]): ValidationIssue[] {
    return issues
      .sort((a, b) => {
        const severityA = this.severityMap[a.severity as ValidationSeverity] || 0;
        const severityB = this.severityMap[b.severity as ValidationSeverity] || 0;
        return severityB - severityA;
      })
      .slice(0, 10);
  }

  private analyzeStructuralCoherence(
    element: StructuralElement,
    rule: CoherenceRule
  ): CoherenceAnalysis {
    return this.analyzeCoherence(element, rule, 'structural', this.evaluateConstraint.bind(this));
  }

  private analyzeTemporalCoherence(
    sequence: TemporalSequence,
    rule: CoherenceRule
  ): CoherenceAnalysis {
    return this.analyzeCoherence(
      sequence,
      rule,
      'temporal',
      this.evaluateTemporalConstraint.bind(this)
    );
  }

  private analyzeSpatialCoherence(
    config: SpatialConfiguration,
    rule: CoherenceRule,
    relations: SpatialRelationship[]
  ): CoherenceAnalysis {
    const evaluator = (element: SpatialConfiguration, constraint: CoherenceConstraint) =>
      this.evaluateSpatialConstraint(element, constraint, relations);
    return this.analyzeCoherence(config, rule, 'spatial', evaluator);
  }

  private analyzeSemanticCoherence(
    element: SemanticElement,
    rule: CoherenceRule
  ): CoherenceAnalysis {
    return this.analyzeCoherence(
      element,
      rule,
      'semantic',
      this.evaluateSemanticConstraint.bind(this)
    );
  }

  private analyzeCoherence<T>(
    element: T,
    rule: CoherenceRule,
    propertyType: string,
    evaluator: (element: T, constraint: CoherenceConstraint) => ConstraintEvaluation
  ): CoherenceAnalysis {
    const constraints = rule.constraints.filter(constraint => constraint.property === propertyType);
    let isCoherent = true;
    let incoherenceLevel = 0;
    const reasons: string[] = [];

    for (const constraint of constraints) {
      const evaluation = evaluator(element, constraint);
      if (!evaluation.satisfied) {
        isCoherent = false;
        incoherenceLevel = Math.max(incoherenceLevel, evaluation.deviation);
        reasons.push(evaluation.reason);
      }
    }

    return {
      isCoherent,
      incoherenceLevel,
      reason: reasons.join('; ')
    };
  }

  // Méthodes d'extraction avec implémentation basique
  private extractStructuralElements(expression: LSFExpression): StructuralElement[] {
    console.log(`Extracting structural elements from expression ${expression.id}`);
    // Simulation d'extraction d'éléments
    return expression.elements?.map((el, index) => ({
      id: el.id ?? `element-${index}`,
      type: el.type ?? 'unknown',
      properties: el.properties ?? {},
      position: index
    })) || [];
  }

  private extractTemporalSequences(expression: LSFExpression): TemporalSequence[] {
    console.log(`Extracting temporal sequences from expression ${expression.id}`);
    // Simulation d'extraction de séquences temporelles
    return expression.sequences?.map((seq, index) => ({
      id: seq.id ?? `sequence-${index}`,
      start: seq.start ?? 0,
      duration: seq.duration ?? 1000,
      elements: seq.elements ?? []
    })) || [];
  }

  private extractSpatialConfigurations(expression: LSFExpression): SpatialConfiguration[] {
    console.log(`Extracting spatial configurations from expression ${expression.id}`);
    // Simulation d'extraction de configurations spatiales
    return expression.positions?.map((pos, index) => ({
      id: pos.id ?? `config-${index}`,
      position: pos.position ?? { x: 0, y: 0, z: 0 },
      orientation: pos.orientation ?? { x: 0, y: 0, z: 0 },
      scale: pos.scale ?? 1
    })) || [];
  }

  private extractSemanticElements(expression: LSFExpression): SemanticElement[] {
    console.log(`Extracting semantic elements from expression ${expression.id}`);
    // Simulation d'extraction d'éléments sémantiques
    return expression.meanings?.map((meaning, index) => ({
      id: meaning.id ?? `meaning-${index}`,
      meaning: meaning.value ?? '',
      context: meaning.context ?? [],
      relations: meaning.relations ?? []
    })) || [];
  }

  // Méthodes d'évaluation avec implémentation basique
  private evaluateConstraint(
    element: StructuralElement,
    constraint: CoherenceConstraint
  ): ConstraintEvaluation {
    // Vérification de base pour les contraintes structurelles
    console.log(`Evaluating structural constraint for element ${element.id}`);
    const propertyValue = element.properties[constraint.property as string];
    const constraintValue = constraint.value;

    let satisfied = false;

    switch (constraint.operator) {
      case 'equals':
        satisfied = propertyValue === constraintValue;
        break;
      case 'contains':
        satisfied = Array.isArray(propertyValue) &&
          propertyValue.includes(constraintValue);
        break;
      default:
        satisfied = true; // Par défaut, considéré comme satisfait
    }

    return {
      satisfied,
      deviation: satisfied ? 0 : 0.5,
      reason: satisfied ? '' : `Property ${constraint.property} does not match constraint`
    };
  }

  private evaluateTemporalConstraint(
    sequence: TemporalSequence,
    constraint: CoherenceConstraint
  ): ConstraintEvaluation {
    // Vérification de base pour les contraintes temporelles
    console.log(`Evaluating temporal constraint for sequence ${sequence.id}`);

    let satisfied = false;
    let deviation = 0;
    let reason = '';

    switch (constraint.property) {
      case 'duration':
        const minDuration = constraint.value as number;
        satisfied = sequence.duration >= minDuration;
        deviation = satisfied ? 0 : (minDuration - sequence.duration) / minDuration;
        reason = satisfied ? '' : `Sequence duration ${sequence.duration}ms is less than required ${minDuration}ms`;
        break;
      case 'elements':
        const minElements = constraint.value as number;
        satisfied = sequence.elements.length >= minElements;
        deviation = satisfied ? 0 : (minElements - sequence.elements.length) / minElements;
        reason = satisfied ? '' : `Sequence has ${sequence.elements.length} elements, minimum required is ${minElements}`;
        break;
      default:
        satisfied = true;
    }

    return { satisfied, deviation, reason };
  }

  private evaluateSpatialConstraint(
    config: SpatialConfiguration,
    constraint: CoherenceConstraint,
    relations: SpatialRelationship[]
  ): ConstraintEvaluation {
    // Vérification de base pour les contraintes spatiales
    console.log(`Evaluating spatial constraint for configuration ${config.id} with ${relations.length} relationships`);

    let satisfied = false;
    let deviation = 0;
    let reason = '';

    switch (constraint.property) {
      case 'distance':
        // Vérifier la distance entre les éléments
        if (relations.length > 0) {
          const maxDistance = constraint.value as number;
          let maxActualDistance = 0;

          // Utiliser correctement la variable relation pour calculer chaque distance
          for (let i = 0; i < relations.length; i++) {
            const relatedPosition = this.calculateRelatedPosition(relations[i], config);
            const distance = this.calculateDistance(config.position, relatedPosition);
            maxActualDistance = Math.max(maxActualDistance, distance);
          }

          satisfied = maxActualDistance <= maxDistance;
          deviation = satisfied ? 0 : (maxActualDistance - maxDistance) / maxDistance;
          reason = satisfied ? '' : `Maximum distance ${maxActualDistance.toFixed(2)} exceeds limit ${maxDistance}`;
        } else {
          satisfied = true; // Pas de relations, pas de contrainte
        }
        break;
      default:
        satisfied = true;
    }

    return { satisfied, deviation, reason };
  }

  // Méthode utilitaire pour calculer une position relative
  private calculateRelatedPosition(relation: SpatialRelationship, config: SpatialConfiguration): { x: number, y: number, z: number } {
    // Simulation: création d'une position relative en fonction du type de relation
    const basePosition = { ...config.position };

    switch (relation.type) {
      case 'above':
        return { ...basePosition, y: basePosition.y + 2 };
      case 'below':
        return { ...basePosition, y: basePosition.y - 2 };
      case 'leftOf':
        return { ...basePosition, x: basePosition.x - 2 };
      case 'rightOf':
        return { ...basePosition, x: basePosition.x + 2 };
      case 'inFrontOf':
        return { ...basePosition, z: basePosition.z + 2 };
      case 'behind':
        return { ...basePosition, z: basePosition.z - 2 };
      default:
        // Simuler une position aléatoire mais déterministe basée sur l'ID
        const randomOffset = relation.id.charCodeAt(0) % 5;
        return {
          x: basePosition.x + randomOffset,
          y: basePosition.y + randomOffset,
          z: basePosition.z + randomOffset
        };
    }
  }

  // Méthode utilitaire pour calculer la distance euclidienne
  private calculateDistance(pos1: { x: number, y: number, z: number }, pos2: { x: number, y: number, z: number }): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) +
      Math.pow(pos2.y - pos1.y, 2) +
      Math.pow(pos2.z - pos1.z, 2)
    );
  }

  private evaluateSemanticConstraint(
    element: SemanticElement,
    constraint: CoherenceConstraint
  ): ConstraintEvaluation {
    // Vérification de base pour les contraintes sémantiques
    console.log(`Evaluating semantic constraint for element ${element.id} with meaning "${element.meaning}"`);

    let satisfied = false;
    let deviation = 0;
    let reason = '';

    switch (constraint.property) {
      case 'context':
        const requiredContext = constraint.value as string;
        satisfied = element.context.includes(requiredContext);
        deviation = satisfied ? 0 : 0.7;
        reason = satisfied ? '' : `Required context "${requiredContext}" not found in element contexts`;
        break;
      case 'meaning':
        const expectedMeaning = constraint.value as string;
        satisfied = element.meaning.includes(expectedMeaning);
        deviation = satisfied ? 0 : 0.8;
        reason = satisfied ? '' : `Element meaning "${element.meaning}" does not include expected "${expectedMeaning}"`;
        break;
      default:
        satisfied = true;
    }

    return { satisfied, deviation, reason };
  }
}