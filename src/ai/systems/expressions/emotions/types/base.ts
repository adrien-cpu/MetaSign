//src/ai/systems/expressions/emotions/types/base.ts
// Types fondamentaux pour les émotions
export interface EmotionState {
  type: string;
  intensity: number;
  components: EmotionalComponents;
  dynamics: EmotionalDynamics;
}

export interface EmotionalComponents {
  facial: FacialExpression;
  gestural: GesturalExpression;
  intensity: number;
}

export interface EmotionalDynamics {
  duration: number;
  transition: TransitionType;
  sequence: EmotionalComponents[];
}

export interface FacialExpression {
  eyebrows: string;
  eyes: string;
  mouth: string;
  intensity: number;
}

export interface GesturalExpression {
  hands: string;
  arms: string;
  body: string;
  intensity: number;
}

export type TransitionType = 'smooth' | 'abrupt' | 'gradual';

// Types de base pour l'intégration
export interface BaseEmotion {
  id: string;
  name: string;
  category: string;
  valence: number;
  arousal: number;
  dominance: number;
}

export interface EmotionMapping {
  emotion: BaseEmotion;
  components: EmotionalComponents;
  dynamics: EmotionalDynamics;
}