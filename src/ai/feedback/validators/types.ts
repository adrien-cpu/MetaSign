// src/ai/feedback/validators/types.ts

import { ValidationSeverity, LocationContext } from '@ai/feedback/types/validation';

/**
 * Pondérations pour les différents niveaux de sévérité
 */
export const SeverityWeights: Record<ValidationSeverity, number> = {
  low: 0.1,
  medium: 0.3,
  high: 0.6
};

/**
 * Interface de base pour les paramètres de validation
 */
export interface ValidationParams {
  /**
   * Type de problème
   */
  type: string;

  /**
   * Niveau de sévérité
   */
  severity: ValidationSeverity;

  /**
   * Description du problème
   */
  description: string;

  /**
   * Localisation du problème
   * Peut être une simple position 3D ou un contexte de localisation complet
   */
  location?: {
    x?: number;
    y?: number;
    z?: number;
  } | LocationContext;

  /**
   * Code d'erreur
   */
  code?: string;

  /**
   * Suggestions de correction
   */
  suggestions?: string[];
}

/**
 * Types de validation possibles
 */
export type ValidationType =
  | 'syntax'
  | 'grammar'
  | 'semantic'
  | 'spatial'
  | 'temporal'
  | 'cultural'
  | 'technical'
  | 'coherence';

/**
 * Catégories d'éléments validables
 */
export type ValidationCategory =
  | 'sign'
  | 'expression'
  | 'sentence'
  | 'discourse'
  | 'interaction'
  | 'animation';

/**
 * Options pour la configuration des validateurs
 */
export interface ValidatorOptions {
  /**
   * Niveau de sévérité minimum à considérer
   */
  minSeverity?: ValidationSeverity;

  /**
   * Nombre maximum de problèmes à rapporter
   */
  maxIssues?: number;

  /**
   * Types de validation à effectuer
   */
  validationTypes?: ValidationType[];

  /**
   * Catégories d'éléments à valider
   */
  categories?: ValidationCategory[];

  /**
   * Score minimum pour considérer une validation comme réussie
   */
  minAcceptableScore?: number;

  /**
   * Générer des suggestions de correction
   */
  generateSuggestions?: boolean;
}

/**
 * Configuration pour l'agrégation de validations multiples
 */
export interface AggregationConfig {
  /**
   * Stratégie d'agrégation
   */
  strategy: 'worst' | 'average' | 'weighted';

  /**
   * Pondérations par type de validation (pour la stratégie 'weighted')
   */
  weights?: Record<ValidationType, number>;

  /**
   * Priorité des problèmes pour l'affichage
   */
  issuePriority?: ValidationSeverity[];
}

/**
 * Types de fonctions de validation
 */
export type ValidatorFunction<T> = (item: T) => ValidationParams[];
export type AsyncValidatorFunction<T> = (item: T) => Promise<ValidationParams[]>;

/**
 * Interface pour les règles de cohérence
 */
export interface CoherenceRule {
  elements: string[];
  constraints: CoherenceConstraint[];
}

/**
 * Interface pour les contraintes de cohérence
 */
export interface CoherenceConstraint {
  property: string;
  value: unknown;
  operator: string;
  threshold?: number;
}