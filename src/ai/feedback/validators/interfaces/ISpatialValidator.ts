// src/ai/feedback/validators/interfaces/ISpatialValidator.ts

import { ValidationResult } from '@ai/feedback/types/validation';
import { LSFExpression } from '@ai/systems/expressions/emotions/types/LSFExpression';

export interface ReferencePoint {
  id: string;
  position: Position3D;
  stability: number;
  // autres propriétés nécessaires
}

export interface SpatialRelationship {
  source: string;
  target: string;
  type: string;
}

/**
 * Représente une position dans un espace 3D
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Définit les limites d'une zone spatiale dans les trois dimensions
 */
export interface Boundaries {
  x: [number, number]; // [min, max]
  y: [number, number]; // [min, max]
  z: [number, number]; // [min, max]
}

/**
 * Types de contraintes applicables aux zones
 */
export type ZoneConstraintType = 'duration' | 'movement' | 'handshape' | 'orientation' | 'custom';

/**
 * Contrainte applicable à une zone spatiale
 */
export interface ZoneConstraint {
  id?: string;                                      // Identifiant optionnel de la contrainte
  type: ZoneConstraintType;                         // Type de contrainte
  value: unknown;                                   // Valeur de la contrainte (typée selon l'utilisation)
  severity: 'low' | 'medium' | 'high';              // Sévérité de la violation de cette contrainte
  description: string;                              // Description de la contrainte
  property?: string;                                // Propriété concernée par la contrainte
  expectedValue?: unknown;                          // Valeur attendue
  tolerance?: number;                               // Tolérance autorisée
  errorMessage?: string;                            // Message d'erreur en cas de non-respect
  zoneId?: string;                                  // ID de la zone associée
}

/**
 * Définition complète d'une zone spatiale dans le système LSF
 */
export interface ZoneDefinition {
  id: string;                                       // Identifiant unique de la zone
  name: string;                                     // Nom lisible de la zone
  description?: string;                             // Description optionnelle
  boundaries: Boundaries;                           // Limites spatiales de la zone
  allowedHandshapes?: string[];                     // Formes de main autorisées dans cette zone
  allowedMovements?: string[];                      // Mouvements autorisés dans cette zone
  minDuration?: number;                             // Durée minimale d'utilisation (en ms)
  maxDuration?: number;                             // Durée maximale d'utilisation (en ms)
  priority: number;                                 // Priorité de la zone (résolution de conflits)
  constraints: ZoneConstraint[];                    // Contraintes applicables à cette zone
}

/**
 * Types de relations entre zones spatiales
 */
export type SpatialRelationshipType =
  | 'adjacent'
  | 'overlaps'
  | 'disjoint'
  | 'contains'
  | 'custom'
  | 'above'
  | 'below'
  | 'leftOf'
  | 'rightOf'
  | 'inFrontOf'
  | 'behind'
  | 'inside'
  | 'outside'
  | 'touching'
  | 'near'
  | 'far'
  | 'aligned'
  | 'centered';

/**
 * Relation entre deux zones spatiales
 */
export interface SpatialRelationship {
  id: string;                                       // Identifiant de la relation
  source: string;                                   // ID de la zone/élément source
  target: string;                                   // ID de la zone/élément cible
  type: SpatialRelationshipType;                    // Type de relation
  description?: string;                             // Description optionnelle
  parameters?: Record<string, unknown>;             // Paramètres additionnels
  rules?: {                                         // Règles optionnelles pour cette relation
    allowedTransitions: boolean;                    // Transitions autorisées entre les zones
    minTransitionDuration?: number;                 // Durée minimale de transition
    maxTransitionDuration?: number;                 // Durée maximale de transition
    allowedHandshapes?: string[];                   // Formes de main autorisées en transition
    contextualRequirements?: string[];              // Exigences contextuelles
  };
  metadata?: {                                      // Métadonnées optionnelles
    description?: string;                           // Description détaillée
    culturalRelevance?: string[];                   // Pertinence culturelle
    examples?: string[];                            // Exemples d'utilisation
  };
}

/**
 * Définition d'une proforme (représentation iconique en LSF)
 */
export interface ProformeDefinition {
  id: string;                                       // Identifiant unique de la proforme
  name: string;                                     // Nom de la proforme
  handshape: string;                                // Forme de main associée
  orientation: string[];                            // Orientations possibles
  movement: string[];                               // Mouvements possibles
  validZones: string[];                             // Zones valides pour cette proforme
  incompatibles: string[];                          // Proformes incompatibles
  contextualRules?: {                               // Règles contextuelles
    requiredContext?: string[];                     // Contexte requis
    forbiddenContext?: string[];                    // Contexte interdit
    conditionalMovements?: {                        // Mouvements conditionnels
      context: string;                              // Contexte spécifique
      allowedMovements: string[];                   // Mouvements autorisés dans ce contexte
    }[];
  };
  metadata?: {                                      // Métadonnées
    culturalContext?: string[];                     // Contexte culturel
    usageExamples?: string[];                       // Exemples d'utilisation
    difficulty?: 'beginner' | 'intermediate' | 'advanced'; // Niveau de difficulté
    category?: string;                              // Catégorie
  };
}

/**
 * Interface de base pour les validateurs spatiaux
 */
export interface ISpatialValidator {
  /**
   * Valide les aspects spatiaux d'une expression LSF
   * @param expression L'expression à valider
   * @returns Le résultat de la validation
   */
  validate(expression: LSFExpression): Promise<ValidationResult>;

  /**
   * Valide une relation spatiale spécifique
   * @param relationship La relation à valider
   * @param expression L'expression contenant la relation
   * @returns Le résultat de la validation
   */
  validateRelationship(relationship: SpatialRelationship, expression: LSFExpression): Promise<ValidationResult>;

  /**
   * Valide une zone spatiale
   * @param zoneId Identifiant de la zone à valider
   * @param constraints Contraintes à appliquer à la zone
   * @param expression L'expression contenant la zone
   * @returns Le résultat de la validation
   */
  validateZone(zoneId: string, constraints: ZoneConstraint[], expression: LSFExpression): Promise<ValidationResult>;

  /**
   * Vérifie si une position est valide dans un contexte spatial donné
   * @param position Position à vérifier
   * @param context Contexte spatial
   * @returns true si la position est valide, false sinon
   */
  isValidPosition?(position: Position3D, context?: unknown): boolean;

  /**
   * Vérifie si les zones spécifiées sont compatibles entre elles
   * @param zone1 Première zone
   * @param zone2 Seconde zone
   * @returns true si les zones sont compatibles, false sinon
   */
  areZonesCompatible?(zone1: string, zone2: string): boolean;

  /**
   * Obtient les zones valides pour une configuration spécifique
   * @param config Configuration spatiale
   * @returns Liste des zones valides
   */
  getValidZones?(config: unknown): string[];

  /**
   * Configure le validateur avec les paramètres spécifiés
   * @param options Options de configuration
   */
  configure?(options: unknown): void;
}

/**
 * Interface spécifique pour la validation des proformes
 */
export interface IProformeValidator extends ISpatialValidator {
  /**
   * Vérifie la compatibilité entre deux proformes
   * @param proformeId1 ID de la première proforme
   * @param proformeId2 ID de la seconde proforme
   * @returns Résultat de la validation de compatibilité
   */
  checkCompatibility(proformeId1: string, proformeId2: string): Promise<ValidationResult>;

  /**
   * Obtient une définition de proforme par son ID
   * @param id ID de la proforme
   * @returns Définition de la proforme ou undefined si non trouvée
   */
  getProformeDefinition(id: string): ProformeDefinition | undefined;

  /**
   * Valide l'utilisation d'une proforme dans un contexte donné
   * @param proformeId ID de la proforme
   * @param context Contexte d'utilisation
   * @returns Résultat de la validation
   */
  validateProformeUsage(proformeId: string, context: unknown): Promise<ValidationResult>;
}