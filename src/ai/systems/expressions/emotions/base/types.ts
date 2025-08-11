// src/ai/systems/expressions/emotions/base/types.ts
import { LSFExpression } from '../lsf/types';

// Réexporter LSFExpression avec la syntaxe correcte pour isolatedModules
export type { LSFExpression };

// Types pour les entrées émotionnelles
export interface EmotionInput {
  /** Type d'émotion */
  type: string;

  /** Intensité de l'émotion (0.0 à 1.0) */
  intensity: number;

  /** Valence de l'émotion (-1.0 à 1.0) */
  valence?: number;

  /** Durée de l'émotion en millisecondes */
  duration?: number;

  /** Contexte émotionnel */
  context?: {
    social?: string;
    formalityLevel?: number;
  };

  /** Nuances émotionnelles */
  nuances?: EmotionalNuances;
}

export interface EmotionalNuances {
  /** Subtilité de l'expression (0.0 à 1.0) */
  subtlety?: number;

  /** Prépondérance faciale vs corporelle (0.0 = corps, 1.0 = visage) */
  facialVsBodyEmphasis?: number;

  /** Émotion secondaire à mélanger */
  secondaryEmotion?: {
    type: string;
    blendRatio: number;
  };
}

// Contexte émotionnel étendu utilisé dans l'intégration
export interface EmotionalContext {
  /** Objectif de la communication */
  purpose: 'TRANSLATION' | 'TEACHING' | 'CONVERSATION';

  /** Intensité émotionnelle souhaitée */
  intensity: 'low' | 'medium' | 'high';

  /** Niveau de formalité (0.0 à 1.0) */
  formalityLevel: number;

  /** Contexte culturel */
  culturalContext?: string;
}

// Métadonnées sur l'émotion
export interface EmotionMetadata {
  /** Intensité de l'émotion */
  intensity: number;

  /** Valence de l'émotion */
  valence: number;

  /** Authenticité de l'expression (0.0 à 1.0) */
  authenticity: number;

  /** Précision culturelle (0.0 à 1.0) - optionnelle */
  culturalAccuracy?: number;

  /** Expressivité (0.0 à 1.0) - optionnelle */
  expressiveness?: number;
}

// Composant émotionnel
export interface EmotionComponent {
  /** Intensité de la composante (0.0 à 1.0) */
  intensity: number;

  /** Timing spécifique à cette composante */
  timing: {
    onset: number;
    hold: number;
    release: number;
  };

  /** Paramètres spécifiques à cette composante */
  parameters: Record<string, number>;
}

// Résultat de l'analyse d'émotion
export interface AnalyzedEmotion {
  /** Type d'émotion de base */
  baseType: string;

  /** Intensité calibrée (0.0 à 1.0) */
  calibratedIntensity: number;

  /** Composantes faciales de l'émotion */
  facialComponents: {
    eyebrows: EmotionComponent;
    eyes: EmotionComponent;
    mouth: EmotionComponent;
    nose?: EmotionComponent; // Ajouté pour harmoniser avec l'autre déclaration
    head?: EmotionComponent;
  };

  /** Composantes corporelles de l'émotion */
  bodyComponents: {
    shoulders?: EmotionComponent;
    arms?: EmotionComponent;
    posture?: EmotionComponent;
    movement?: EmotionComponent;
  };

  /** Temporalité de l'expression */
  timing: {
    onset: number;
    apex: number;
    offset: number;
    totalDuration: number;
  };

  /** Métriques de qualité de l'expression émotionnelle */
  metrics: {
    authenticity: number;
    culturalAccuracy: number;
    expressiveness: number;
  };
}

// Résultat final de l'émotionnel
export interface EmotionResult {
  /** Expression LSF générée */
  expression: LSFExpression;

  /** Métriques de qualité */
  metrics: {
    authenticity: number;
    culturalAccuracy: number;
    expressiveness: number;
    coherence: number;
  };

  /** Problèmes détectés */
  issues: string[];

  /** Succès de la génération */
  success: boolean;
}