// src/ai/systems/expressions/grammar/LSFContextValidator.ts
import { LSFExpression } from '../lsf/LSFGrammarSystem';
import { TransitionSequence, TransitionStep } from './LSFTransitionSystem';

export class LSFContextValidator {
  // Règles de continuité du discours LSF
  private readonly DISCOURSE_RULES = {
    TOPIC_MARKING: {
      requiresSpatialConsistency: true,
      allowsMultipleTopics: false,
      requiresEyeGazeAlignment: true
    },
    ROLE_SHIFT: {
      preservesReferencePoints: true,
      requiresBodyShift: true,
      maintainsCharacteristics: true
    },
    CONDITIONAL_SPACE: {
      maintainsHypotheticalSpace: true,
      requiresMarkedBoundary: true
    }
  };

  async validateTransitionContext(
    sequence: TransitionSequence,
    discourseContext: DiscourseContext
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Valider la continuité spatiale
    const spatialIssues = await this.validateSpatialContinuity(
      sequence,
      discourseContext
    );
    issues.push(...spatialIssues);

    // Valider la cohérence du rôle
    const roleIssues = await this.validateRoleConsistency(
      sequence,
      discourseContext
    );
    issues.push(...roleIssues);

    // Valider le maintien du topic
    const topicIssues = await this.validateTopicMaintenance(
      sequence,
      discourseContext
    );
    issues.push(...topicIssues);

    return {
      isValid: issues.length === 0,
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private async validateSpatialContinuity(
    sequence: TransitionSequence,
    context: DiscourseContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (context.spatialReferences) {
      for (const step of sequence.steps) {
        const referencePoints = this.extractReferencePoints(step.expression);
        
        if (!this.areSpatialReferencesConsistent(
          referencePoints,
          context.spatialReferences
        )) {
          issues.push({
            type: 'SPATIAL_INCONSISTENCY',
            severity: 'error',
            message: 'Spatial reference points are not maintained during transition',
            step: sequence.steps.indexOf(step),
            details: {
              expected: context.spatialReferences,
              found: referencePoints
            }
          });
        }
      }
    }

    return issues;
  }

  private async validateRoleConsistency(
    sequence: TransitionSequence,
    context: DiscourseContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (context.currentRole) {
      let previousAlignment = this.extractRoleAlignment(
        sequence.steps[0].expression
      );

      for (const step of sequence.steps.slice(1)) {
        const currentAlignment = this.extractRoleAlignment(step.expression);
        
        if (!this.isRoleTransitionValid(
          previousAlignment,
          currentAlignment,
          context.currentRole
        )) {
          issues.push({
            type: 'ROLE_SHIFT_ERROR',
            severity: 'error',
            message: 'Invalid role transition detected',
            step: sequence.steps.indexOf(step),
            details: {
              role: context.currentRole,
              previousAlignment,
              currentAlignment
            }
          });
        }
        
        previousAlignment = currentAlignment;
      }
    }

    return issues;
  }

  private async validateTopicMaintenance(
    sequence: TransitionSequence,
    context: DiscourseContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (context.activeTopic) {
      for (const step of sequence.steps) {
        const topicMarkers = this.extractTopicMarkers(step.expression);
        
        if (!this.areTopicMarkersValid(topicMarkers, context.activeTopic)) {
          issues.push({
            type: 'TOPIC_MAINTENANCE_ERROR',
            severity: 'warning',
            message: 'Topic marking not properly maintained',
            step: sequence.steps.indexOf(step),
            details: {
              topic: context.activeTopic,
              foundMarkers: topicMarkers
            }
          });
        }
      }
    }

    return issues;
  }

  private extractReferencePoints(expression: LSFExpression): SpatialReference[] {
    // Extraire les points de référence de l'expression
    const references: SpatialReference[] = [];
    
    if (expression.head?.position) {
      references.push({
        type: 'HEAD',
        position: expression.head.position
      });
    }

    if (expression.eyebrows?.raisedSide) {
      references.push({
        type: 'EYEBROW_REFERENCE',
        side: expression.eyebrows.raisedSide
      });
    }

    return references;
  }

  private extractRoleAlignment(expression: LSFExpression): RoleAlignment {
    return {
      headTilt: expression.head?.tilt || 0,
      gazeDirection: expression.eyes?.focus || 'neutral',
      bodyShift: expression.body?.shift || 0
    };
  }

  private extractTopicMarkers(expression: LSFExpression): TopicMarker[] {
    const markers: TopicMarker[] = [];

    if (expression.eyebrows?.raised) {
      markers.push({
        type: 'EYEBROW_RAISE',
        intensity: expression.eyebrows.intensity
      });
    }

    if (expression.head?.forward) {
      markers.push({
        type: 'HEAD_FORWARD',
        intensity: expression.head.forward
      });
    }

    return markers;
  }

  private areSpatialReferencesConsistent(
    current: SpatialReference[],
    expected: SpatialReference[]
  ): boolean {
    for (const ref of expected) {
      const matchingRef = current.find(r => r.type === ref.type);
      if (!matchingRef || !this.isReferenceWithinTolerance(matchingRef, ref)) {
        return false;
      }
    }
    return true;
  }

  private isReferenceWithinTolerance(
    ref1: SpatialReference,
    ref2: SpatialReference,
    tolerance: number = 0.2
  ): boolean {
    if ('position' in ref1 && 'position' in ref2) {
      return Math.abs(ref1.position - ref2.position) <= tolerance;
    }
    return ref1.side === ref2.side;
  }

  private isRoleTransitionValid(
    previous: RoleAlignment,
    current: RoleAlignment,
    role: Role
  ): boolean {
    // Vérifier que la transition de rôle est naturelle et maintient les caractéristiques
    const tiltDifference = Math.abs(current.headTilt - previous.headTilt);
    const isGazeConsistent = current.gazeDirection === role.expectedGaze;
    const isShiftAppropriate = Math.abs(current.bodyShift - role.expectedShift) <= 0.2;

    return tiltDifference <= 0.3 && isGazeConsistent && isShiftAppropriate;
  }

  private areTopicMarkersValid(
    markers: TopicMarker[],
    topic: Topic
  ): boolean {
    // Vérifier que les marqueurs de topic sont correctement maintenus
    const hasRequiredRaise = markers.some(
      m => m.type === 'EYEBROW_RAISE' && m.intensity >= 0.5
    );
    const hasForwardTilt = markers.some(
      m => m.type === 'HEAD_FORWARD' && m.intensity >= 0.3
    );

    return topic.requiresEmphasis ? (hasRequiredRaise && hasForwardTilt) : true;
  }

  private generateRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];

    for (const issue of issues) {
      switch (issue.type) {
        case 'SPATIAL_INCONSISTENCY':
          recommendations.push(
            'Maintenir les points de référence spatiaux plus stables pendant la transition'
          );
          break;
        case 'ROLE_SHIFT_ERROR':
          recommendations.push(
            'Adoucir la transition de rôle avec des mouvements plus graduels'
          );
          break;
        case 'TOPIC_MAINTENANCE_ERROR':
          recommendations.push(
            'Renforcer les marqueurs de topic pendant toute la séquence'
          );
          break;
      }
    }

    return recommendations;
  }
}

// Types
interface DiscourseContext {
  spatialReferences?: SpatialReference[];
  currentRole?: Role;
  activeTopic?: Topic;
  environment?: 'formal' | 'casual';
}

interface SpatialReference {
  type: 'HEAD' | 'EYEBROW_REFERENCE';
  position?: number;
  side?: 'left' | 'right';
}

interface RoleAlignment {
  headTilt: number;
  gazeDirection: string;
  bodyShift: number;
}

interface TopicMarker {
  type: 'EYEBROW_RAISE' | 'HEAD_FORWARD';
  intensity: number;
}

interface Role {
  expectedGaze: string;
  expectedShift: number;
}

interface Topic {
  requiresEmphasis: boolean;
}

interface ValidationIssue {
  type: string;
  severity: 'error' | 'warning';
  message: string;
  step: number;
  details: any;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  recommendations: string[];
}