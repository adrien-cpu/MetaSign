// src/ai/systems/expressions/emotions/syntax/types.ts

/**
 * Type étendu pour les besoins du contrôleur d'émotion/syntaxe
 * Avec ses propres propriétés pour éviter les conflits avec la structure LSFExpression existante
 */
export interface EmotionalLSFExpression {
  /** Propriétés originales de LSFExpression */
  id: string;
  type: string;

  /** Propriétés originales optionnelles */
  head?: unknown;
  hands?: unknown;
  body?: unknown;

  /** Propriétés étendues pour le contrôleur */
  /** Composante des sourcils */
  eyebrows?: CustomEyebrowComponent;

  /** Composante de la bouche */
  mouth?: CustomMouthComponent;

  /** Composante des yeux */
  eyes?: CustomEyeComponent;

  /** Configuration et mouvement des mains */
  handshape?: Handshape;

  /** Localisation spatiale */
  location?: Location;

  /** Paramètres temporels */
  timing?: Timing;

  /** Métadonnées supplémentaires */
  metadata?: Metadata;
}

// Utiliser EmotionalLSFExpression comme alias pour LSFExpression dans ce module
export type LSFExpression = EmotionalLSFExpression;

/**
 * Interface pour les composants des sourcils adaptée au contrôleur
 */
export interface CustomEyebrowComponent {
  position: number;
  shape: number;
  tension?: number;
  [key: string]: number | undefined;
}

/**
 * Interface pour les composants de la bouche adaptée au contrôleur
 */
export interface CustomMouthComponent {
  openness: number;
  shape: number;
  tension?: number;
  [key: string]: number | undefined;
}

/**
 * Interface pour les composants des yeux adaptée au contrôleur
 */
export interface CustomEyeComponent {
  gaze: number;
  openness: number;
  tension?: number;
  [key: string]: number | undefined;
}

/**
 * Interface pour les coordonnées spatiales
 */
export interface Coordinates {
  x: number;
  y: number;
  z?: number;
}

/**
 * Interface pour les références spatiales
 */
export interface SpatialReference {
  primary: Coordinates;
  secondary: Coordinates[];
}

/**
 * Interface pour la configuration des mains
 */
export interface HandshapeConfiguration {
  tension?: number;
  fingerCurvature?: number;
  [key: string]: unknown;
}

/**
 * Interface pour le mouvement des mains
 */
export interface HandshapeMovement {
  amplitude?: number;
  speed?: number;
  fluidity?: number;
  [key: string]: unknown;
}

/**
 * Interface pour la forme des mains
 */
export interface Handshape {
  configuration?: HandshapeConfiguration;
  movement?: HandshapeMovement;
  [key: string]: unknown;
}

/**
 * Interface pour l'emplacement spatial
 */
export interface Location {
  coordinates: Coordinates;
  zone?: string;
  reference?: string;
  reference_points?: SpatialReference;
  recovery?: string;
  [key: string]: unknown;
}

/**
 * Interface pour les paramètres temporels
 */
export interface Timing {
  duration?: number;
  onset?: number;
  hold?: number;
  release?: number;
  interval?: number;
  repetition?: number;
  [key: string]: unknown;
}

/**
 * Interface pour les métadonnées
 */
export interface Metadata {
  culturalContext?: string[];
  [key: string]: unknown;
}

/**
 * Types d'émotions supportés par le système
 */
export enum EmotionType {
  // Émotions de base (modèle de Ekman)
  ANGER = 'anger',
  DISGUST = 'disgust',
  FEAR = 'fear',
  JOY = 'joy',
  SADNESS = 'sadness',
  SURPRISE = 'surprise',

  // Émotions neutres et composées
  NEUTRAL = 'neutral',
  INTEREST = 'interest',
  CONFUSION = 'confusion',

  // États émotionnels complexes
  EMBARRASSMENT = 'embarrassment',
  PRIDE = 'pride',
  SHAME = 'shame',
  CONTEMPT = 'contempt'
}

/**
 * Interface pour les paramètres syntaxiques d'émotion
 */
export interface EmotionSyntaxParameters {
  /**
   * Type d'émotion
   */
  type: EmotionType;

  /**
   * Intensité de l'émotion (0.0 à 1.0)
   */
  intensity: number;

  /**
   * Durée de l'expression émotionnelle en millisecondes
   */
  duration?: number;

  /**
   * Composants expressifs spécifiques à accentuer
   */
  emphasis?: EmotionEmphasis;

  /**
   * Modulations culturelles pour adapter l'émotion au contexte
   */
  culturalModifiers?: string[];
}

/**
 * Composants expressifs à accentuer pour une émotion
 */
export interface EmotionEmphasis {
  /**
   * Accentuer les expressions faciales
   */
  facial?: boolean;

  /**
   * Accentuer les mouvements corporels
   */
  body?: boolean;

  /**
   * Accentuer les composants manuels (pour LSF)
   */
  manual?: boolean;

  /**
   * Priorités relatives d'accentuation (1-10)
   */
  priorities?: {
    facial?: number;
    body?: number;
    manual?: number;
  };
}

/**
 * Résultat du traitement syntaxique d'émotion
 */
export interface EmotionSyntaxResult {
  /**
   * Expression modifiée avec émotion intégrée
   */
  modifiedExpression: unknown;

  /**
   * Éléments syntaxiques ajoutés
   */
  syntaxElements: EmotionSyntaxElement[];

  /**
   * Métriques de modification
   */
  metrics: {
    /**
     * Niveau de modification (0.0 à 1.0)
     */
    modificationLevel: number;

    /**
     * Composants affectés
     */
    affectedComponents: string[];

    /**
     * Authenticité estimée (0.0 à 1.0)
     */
    authenticityScore: number;
  };
}

/**
 * Élément syntaxique émotionnel
 */
export interface EmotionSyntaxElement {
  /**
   * Composant expressif
   */
  component: string;

  /**
   * Paramètre modifié
   */
  parameter: string;

  /**
   * Valeur d'origine
   */
  originalValue: number | string;

  /**
   * Nouvelle valeur
   */
  newValue: number | string;

  /**
   * Facteur de modification
   */
  modificationFactor: number;
}

export interface ValidationIssue {
  type: 'SYNTACTIC' | 'TEMPORAL' | 'SPATIAL' | 'ETHICAL';
  severity: 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  score: number;
}

export interface SyntacticConstraint {
  name: string;
  value: string | number | boolean;
  priority?: number;
  source?: string;
}

export interface SyntacticContext {
  structure: string;
  complexity: number;
  constraints: SyntacticConstraint[];
}

export interface ControlledExpression {
  expression: LSFExpression;
  metadata: {
    syntacticControl: number;
    temporalControl: number;
    spatialControl: number;
    globalQuality: number;
    ethicsValidation?: number;
  };
}

export interface SystemeControleEthique {
  validate(expression: LSFExpression, emotion: EmotionType): Promise<boolean>;
  measureCompliance(expression: LSFExpression): Promise<number>;
}

export interface SystemeExpressions {
  applyExpression(expression: LSFExpression): Promise<boolean>;
  validateExpression(expression: LSFExpression): Promise<ValidationResult>;
}

export interface SystemeEmotionnel {
  applyEmotion(emotion: EmotionType, intensity: number): Promise<boolean>;
  validateEmotionalExpression(expression: LSFExpression, emotion: EmotionType): Promise<ValidationResult>;
}