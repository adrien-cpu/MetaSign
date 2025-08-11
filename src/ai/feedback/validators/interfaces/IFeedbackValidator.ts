import { FeedbackEntry } from '../../types';
import { ValidationResult } from '../../../types/validators';

export interface IFeedbackValidator {
  /**
   * Valide un feedback donné
   * @param feedback L'entrée de feedback à valider
   * @returns Le résultat de la validation
   */
  validate(feedback: FeedbackEntry): Promise<ValidationResult>;

  /**
   * Valide un aspect spécifique du feedback
   * @param feedback L'entrée de feedback à valider
   * @param aspect L'aspect spécifique à valider
   * @returns Le résultat de la validation
   */
  validateAspect(feedback: FeedbackEntry, aspect: string): Promise<ValidationResult>;

  /**
   * Vérifie si un feedback est valide pour un contexte spécifique
   * @param feedback L'entrée de feedback à vérifier
   * @param context Le contexte de validation
   * @returns Le résultat de la validation
   */
  validateContext(feedback: FeedbackEntry, context: FeedbackContext): Promise<ValidationResult>;
}

export interface FeedbackContext {
  type: string;
  constraints: FeedbackConstraint[];
  requirements: FeedbackRequirement[];
}

export interface FeedbackConstraint {
  type: string;
  value: unknown;
  severity: 'low' | 'medium' | 'high';
}

export interface FeedbackRequirement {
  type: string;
  condition: string;
  mandatory: boolean;
}