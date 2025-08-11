import { FeedbackEntry } from '@ai-types/feedback';
import { LSFExpression } from '@ai-types/lsf';

/**
 * Type pour le résultat de validation
 */
export interface ValidationResult {
  isValid: boolean;
  messages: string[];
  score: number;
}

/**
 * Type pour le contexte culturel
 */
export interface CulturalContext {
  region: string;
  demographicFactors: DemographicFactors;
  socialParameters: SocialParameters;
  communityGuidelines: CommunityGuidelines;
}

/**
 * Facteurs démographiques pour la validation culturelle
 */
export interface DemographicFactors {
  ageGroup: string[];
  educationLevel: string[];
  culturalBackground: string[];
}

/**
 * Paramètres sociaux pour la validation culturelle
 */
export interface SocialParameters {
  formalityLevel: number;
  relationshipType: string;
  contextType: string;
  expectedBehaviors: string[];
}

/**
 * Directives communautaires pour la validation culturelle
 */
export interface CommunityGuidelines {
  acceptablePractices: string[];
  prohibitedBehaviors: string[];
  recommendedAdaptations: Record<string, string[]>;
}

/**
 * Interface pour les validateurs culturels qui évaluent les expressions LSF
 * selon des critères culturels et linguistiques.
 */
export interface ICulturalValidator {
  /**
   * Valide le contexte culturel d'une expression LSF
   * @param expression Expression LSF à valider
   * @returns Notes culturelles
   */
  validateCulturalContext(expression: LSFExpression): Promise<string[]>;

  /**
   * Vérifie si une expression est valide dans son contexte culturel
   * @param expression Expression LSF
   * @returns Validité de l'expression
   */
  isValid(expression: LSFExpression): Promise<boolean>;

  /**
   * Évalue le score culturel d'une expression
   * @param expression Expression LSF
   * @returns Score entre 0 et 1
   */
  getCulturalScore(expression: LSFExpression): Promise<number>;

  /**
   * Valide les normes culturelles d'un feedback
   * @param feedback Entrée de feedback
   * @param context Contexte culturel
   * @returns Résultat de validation
   */
  validateCulturalNorms(feedback: FeedbackEntry, context: CulturalContext): Promise<ValidationResult>;

  /**
   * Valide les variations régionales d'un feedback
   * @param feedback Entrée de feedback
   * @param context Contexte culturel
   * @returns Résultat de validation
   */
  validateRegionalVariations(feedback: FeedbackEntry, context: CulturalContext): Promise<ValidationResult>;

  /**
   * Valide le contexte social d'un feedback
   * @param feedback Entrée de feedback
   * @param context Contexte culturel
   * @returns Résultat de validation
   */
  validateSocialContext(feedback: FeedbackEntry, context: CulturalContext): Promise<ValidationResult>;

  /**
   * Valide la conformité aux standards communautaires
   * @param feedback Entrée de feedback
   * @param context Contexte culturel
   * @returns Résultat de validation
   */
  validateCommunityStandards(feedback: FeedbackEntry, context: CulturalContext): Promise<ValidationResult>;
}