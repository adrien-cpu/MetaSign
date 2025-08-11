// src/ai/types.ts
// Fichier de types centralisé

export interface ExpressionComponentValues {
  [key: string]: number;
}

export interface FacialExpression {
  eyebrows?: ExpressionComponentValues;
  mouth?: ExpressionComponentValues;
  eyes?: ExpressionComponentValues;
  [key: string]: ExpressionComponentValues | undefined;
}

export interface EmotionConfig {
  type: string;
  intensity?: number;
  priority?: number;
  duration?: number;
}

export interface ExpressionResult {
  id: string;
  success: boolean;
  message: string;
}

// Types pour les configurations et mouvements des mains
export interface HandshapeConfiguration {
  tension?: number;
  openness?: number;
  spreadFingers?: number;
  thumbPosition?: number;
  fingerCurvature?: number;
  dominance?: number;
  [key: string]: number | undefined;
}

export interface HandshapeMovement {
  speed?: number;
  fluidity?: number;
  direction?: {
    x: number;
    y: number;
    z?: number;
  };
  path?: 'linear' | 'curved' | 'circular' | 'zigzag';
  repetition?: number;
  amplitude?: number;
  [key: string]: number | string | object | undefined;
}

// Types pour la posture et le mouvement du corps
export interface BodyPosture {
  openness?: number;
  tension?: number;
  tilt?: number;
  orientation?: number;
  [key: string]: number | undefined;
}

export interface BodyMovement {
  speed?: number;
  amplitude?: number;
  tension?: number;
  trembling?: number;
  suddenness?: number;
  direction?: {
    x: number;
    y: number;
    z?: number;
  };
  [key: string]: number | object | undefined;
}

// Type pour le timing
export interface TimingDetails {
  duration?: number;
  onset?: number;
  hold?: number;
  release?: number;
  repetition?: number;
  interval?: number;
  [key: string]: number | undefined;
}

export interface LSFExpression {
  eyebrows?: ExpressionComponentValues;
  mouth?: ExpressionComponentValues;
  eyes?: ExpressionComponentValues;
  handPosition?: { x: number; y: number; z?: number };
  handshape?: {
    configuration?: HandshapeConfiguration;
    movement?: HandshapeMovement;
  };
  location?: {
    coordinates?: { x: number; y: number; z?: number };
    zone?: string;
    reference?: string;
    [key: string]: string | object | undefined;
  };
  body?: {
    posture?: BodyPosture;
    movement?: BodyMovement;
  };
  timing?: TimingDetails;
  duration?: number;
  intensity?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LSFContext {
  expressions?: LSFExpression[];
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface PatternContext {
  intent: string;
  intensity?: number;
  environment?: string;
  audience?: string;
  constraints?: string[];
  [key: string]: string | number | string[] | undefined;
}

export interface DetectedPattern {
  type: string;
  sequence: LSFExpression[];
  count?: number;
  confidence?: number;
  radius?: number;
  smoothness?: number;
  frequency?: number;
  startIndex?: number;
  endIndex?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PatternAnalysis {
  patterns: DetectedPattern[];
  metadata: {
    totalPatterns: number;
    dominantType: string;
    averageConfidence: number;
  };
  suggestedOptimizations: string[];
}

export interface ComplianceReport {
  isCompliant: boolean;
  score: number;
  details: {
    laws: {
      protection: boolean;
      obedience: boolean;
      autoProtection: boolean;
    },
    regulatory: {
      gdpr: boolean;
      security: boolean;
    }
  };
  recommendations: string[];
}

// Types pour le contexte émotionnel
export interface SocialContext {
  participants: string[];
  relationship: string;
  formality: number; // 0-1
}

export interface NarrativeContext {
  currentTopic: string;
  emotionalValence: number; // -1 to 1
  importance: number; // 0-1
}

export interface TemporalContext {
  duration: number;
  precedingEmotion?: string;
  expectedEmotion?: string;
  transitionSpeed: number; // 0-1
}

export interface TransitionPoint {
  fromEmotion: string;
  toEmotion: string;
  timing: number; // milliseconds
  intensity: number; // 0-1
}

// Réexporter tous les types des modules spécialisés pour centraliser les types
export * from './systems/expressions/emotions/syntax/types';

// Extrait de src/ai/validation/types.ts ou consensus.ts

/**
 * Résultat d'un calcul de consensus
 */
export interface ConsensusResult {
  /**
   * Indique si le consensus a approuvé la validation
   */
  approved: boolean;

  /**
   * Niveau de consensus (de 0 à 1)
   */
  consensusLevel: number;

  /**
   * Nombre d'experts ayant participé
   */
  expertCount: number;

  /**
   * Nombre d'experts natifs ayant participé
   */
  nativeExpertsCount: number;

  /**
   * Nombre d'approbations
   */
  approvalCount: number;

  /**
   * Nombre de rejets
   */
  rejectionCount: number;

  /**
   * Date du calcul du consensus
   */
  consensusDate: Date;

  /**
   * Algorithme utilisé pour le calcul
   */
  algorithm: string;

  /**
   * Scores attribués par les experts (si disponibles)
   */
  expertScores?: number[];

  /**
   * Commentaires des experts
   */
  comments: string[];

  /**
   * Suggestions d'amélioration
   */
  suggestions: Array<{
    field: string;
    currentValue?: string;
    proposedValue: string;
    reason?: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
}