import { FeedbackEntry, ValidationResult } from '../types';
import { CulturalContext } from '../../emotions/types/contextual';
import { LSFCulturalSpecificsSystem } from '../../specialized/cultural/LSFCulturalSpecificsSystem';

export class CulturalValidator {
  constructor(
    private culturalSystem: LSFCulturalSpecificsSystem
  ) {}

  async validate(feedback: FeedbackEntry): Promise<ValidationResult> {
    const culturalContext = await this.extractCulturalContext(feedback);
    
    const validations = await Promise.all([
      this.validateCulturalNorms(feedback, culturalContext),
      this.validateRegionalVariations(feedback, culturalContext),
      this.validateSocialContext(feedback, culturalContext),
      this.validateCommunityStandards(feedback, culturalContext)
    ]);

    return this.aggregateValidations(validations);
  }

  private async validateCulturalNorms(feedback: FeedbackEntry, context: CulturalContext) {
    const normValidation = await this.culturalSystem.validateNorms(feedback.content, context);
    
    return {
      isValid: normValidation.score >= 0.8,
      issues: normValidation.violations.map(v => ({
        type: 'cultural_norm',
        severity: this.mapSeverity(v.impact),
        description: v.description
      })),
      score: normValidation.score
    };
  }

  private async validateRegionalVariations(feedback: FeedbackEntry, context: CulturalContext) {
    const regionalValidation = await this.culturalSystem.validateRegionalFit(feedback.content, context);
    
    return {
      isValid: regionalValidation.score >= 0.75,
      issues: regionalValidation.mismatches.map(m => ({
        type: 'regional_variation',
        severity: this.mapSeverity(m.significance),
        description: m.explanation
      })),
      score: regionalValidation.score
    };
  }

  private async validateSocialContext(feedback: FeedbackEntry, context: CulturalContext) {
    const socialValidation = await this.culturalSystem.validateSocialAppropriateness(feedback.content, context);
    
    return {
      isValid: socialValidation.score >= 0.7,
      issues: socialValidation.concerns.map(c => ({
        type: 'social_context',
        severity: this.mapSeverity(c.importance),
        description: c.detail
      })),
      score: socialValidation.score
    };
  }

  private async validateCommunityStandards(feedback: FeedbackEntry, context: CulturalContext) {
    const standardsValidation = await this.culturalSystem.validateCommunityStandards(feedback.content, context);
    
    return {
      isValid: standardsValidation.score >= 0.85,
      issues: standardsValidation.deviations.map(d => ({
        type: 'community_standard',
        severity: this.mapSeverity(d.criticality),
        description: d.explanation
      })),
      score: standardsValidation.score
    };
  }

  private async extractCulturalContext(feedback: FeedbackEntry): Promise<CulturalContext> {
    return {
      region: feedback.metadata.context,
      formalityLevel: this.determineFormalityLevel(feedback),
      specificRules: await this.culturalSystem.getSpecificRules(feedback.metadata.context)
    };
  }

  private mapSeverity(level: number): 'low' | 'medium' | 'high' {
    if (level < 0.3) return 'low';
    if (level < 0.7) return 'medium';
    return 'high';
  }

  private aggregateValidations(validations: ValidationResult[]): ValidationResult {
    const allIssues = validations.flatMap(v => v.issues);
    const averageScore = validations.reduce((sum, v) => sum + v.score, 0) / validations.length;

    return {
      isValid: validations.every(v => v.isValid),
      issues: allIssues,
      score: averageScore
    };
  }

  private determineFormalityLevel(feedback: FeedbackEntry): number {
    const context = feedback.metadata.context.toLowerCase();
    if (context.includes('formal') || context.includes('professional')) return 1;
    if (context.includes('casual') || context.includes('informal')) return 0;
    return 0.5;
  }
}