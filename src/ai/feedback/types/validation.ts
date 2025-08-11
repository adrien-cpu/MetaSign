// src/ai/feedback/types/validation.ts

import { ZoneDefinition } from '@ai/feedback/validators/interfaces/ISpatialValidator';

/**
 * Type définissant les niveaux de sévérité pour les problèmes de validation
 */
export type ValidationSeverity = 'low' | 'medium' | 'high';

/**
 * Interface pour le contexte de localisation
 */
export interface LocationContext {
  /**
   * Nom ou identifiant de l'élément
   */
  elementId?: string;

  /**
   * Index de l'élément dans une collection
   */
  index?: number;

  /**
   * Chemin vers l'élément
   */
  path?: string;

  /**
   * Timestamps pour les événements temporels
   */
  timestamp?: number;

  /**
   * Durée de l'événement
   */
  duration?: number;

  /**
   * Coordonnées spatiales
   */
  coordinates?: {
    x?: number;
    y?: number;
    z?: number;
  };

  /**
   * Informations de ligne et colonne pour les textes
   */
  textPosition?: {
    start?: {
      line: number;
      column: number;
    };
    end?: {
      line: number;
      column: number;
    };
  };

  /**
   * Nom du fichier
   */
  fileName?: string;

  /**
   * Données contextuelles additionnelles
   */
  contextData?: Record<string, unknown>;
}

/**
 * Interface définissant un problème de validation
 */
export interface ValidationIssue {
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
   * Localisation spatiale du problème (optionnelle)
   */
  location?: {
    x?: number;
    y?: number;
    z?: number;
  } | LocationContext;

  /**
   * Code d'erreur (optionnel)
   */
  code?: string;

  /**
   * Suggestions de correction (optionnelles)
   */
  suggestions?: string[];

  /**
   * Données contextuelles
   */
  context?: Record<string, unknown>;
}

/**
 * Interface définissant le résultat d'une validation
 */
export interface ValidationResult {
  /**
   * Indique si la validation est réussie
   */
  isValid: boolean;

  /**
   * Liste des problèmes identifiés
   */
  issues: ValidationIssue[];

  /**
   * Score de qualité (0.0 à 1.0)
   */
  score: number;

  /**
   * Métadonnées additionnelles (optionnelles)
   */
  metadata?: {
    timestamp?: number;
    validator?: string;
    version?: string;
    executionTime?: number;
    validatedAt?: number;
    validatedBy?: string;
    validationContext?: Record<string, unknown>;
  };
}

// Types pour la validation spatiale LSF
export interface SpatialValidationConfig {
  toleranceThreshold: number;
  zoneDefinitions: ZoneDefinition[]; // Utilise l'interface unifiée
  handshapeConfigurations: HandshapeConfiguration[];
  movementPatterns: MovementPattern[];
  checkZoneViolations: boolean;
  checkHandshapeConsistency: boolean;
  checkMovementCoherence: boolean;
}

export interface HandshapeConfiguration {
  id: string;
  name: string;
  compatibleWith: string[];
  incompatibleWith: string[];
  validZones: string[];
  defaultOrientation: string;
}

export interface MovementPattern {
  id: string;
  name: string;
  pattern: string;
  compatibleHandshapes: string[];
  validZones: string[];
}

// Interfaces pour le processus de validation
export interface ValidationProcess {
  id: string;
  startTime: number;
  endTime?: number;
  validator: string;
  context: Record<string, unknown>;
  steps: ValidationStep[];
  result?: ValidationResult;
}

export interface ValidationStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  issues?: ValidationIssue[];
  data?: Record<string, unknown>;
}

// Types pour les stratégies de validation
export enum ValidationStrategy {
  STRICT = 'strict',
  LENIENT = 'lenient',
  CONTEXTUAL = 'contextual',
  EDUCATIONAL = 'educational',
  PROFESSIONAL = 'professional'
}

export interface ValidationOptions {
  strategy: ValidationStrategy;
  contextData?: Record<string, unknown>;
  thresholds?: {
    minValidScore: number;
    warningThreshold: number;
    errorThreshold: number;
  };
  focusAreas?: string[];
}