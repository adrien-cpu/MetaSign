// src/ai/systems/expressions/emotions/contextual-emotions.types.ts
// Types autonomes pour les émotions contextuelles sans dépendances externes

// Types pour les composants émotionnels
export interface EmotionalComponents {
  facial: {
    eyebrows: {
      raised?: number;
      lowered?: number;
      inner?: number;
      outer?: number;
    };
    mouth: {
      smiling?: number;
      open?: number;
      corners?: number;
      tightened?: number;
      round?: number;
    };
    eyes: {
      openness?: number;
      squint?: number;
      widen?: number;
    };
  };
  body: {
    posture: {
      openness?: number;
      tension?: number;
    };
    movement: {
      speed?: number;
      amplitude?: number;
      tension?: number;
      trembling?: number;
      suddenness?: number;
    };
  };
  hand: {
    tension?: number;
    speed?: number;
    fluidity?: number;
    trembling?: number;
    suddenness?: number;
  };
}

// Types pour la dynamique émotionnelle
export interface EmotionalDynamics {
  onset: {
    speed: number; // 0-1, 0 = slow, 1 = immediate
    pattern: 'gradual' | 'sudden' | 'stepped';
  };
  sustain: {
    duration: number; // milliseconds
    stability: number; // 0-1, 0 = fluctuating, 1 = stable
  };
  decay: {
    speed: number; // 0-1, 0 = slow, 1 = immediate
    pattern: 'gradual' | 'sudden' | 'stepped';
  };
  transition: {
    blending: number; // 0-1, 0 = sequential, 1 = full blending
    sequencing: 'emotion-first' | 'syntax-first' | 'simultaneous';
  };
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

export interface EmotionalAdaptation {
  intensity: number; // 0-1 base intensity
  spatialExpansion: number; // 0-1, expansion factor
  temporalModification: number; // 0-1, modification factor
}

export interface ContextualEmotionConfig {
  emotion: string;
  intensity: number;
  adaptation: EmotionalAdaptation;
  dynamics: EmotionalDynamics;
  components: EmotionalComponents;
}

export interface ContextualEmotionRequest {
  baseEmotion: string;
  baseIntensity: number;
  social?: SocialContext;
  narrative?: NarrativeContext;
  temporal?: TemporalContext;
  adaptations?: {
    spatialWeight?: number; // 0-1
    temporalWeight?: number; // 0-1
    expressiveWeight?: number; // 0-1
  };
  constraints?: {
    maxIntensity?: number;
    minIntensity?: number;
    mustPreserveForm?: boolean;
    allowBlending?: boolean;
  };
}

export interface EmotionalTransition {
  from: string;
  to: string;
  duration: number;
  pattern: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'stepped';
  points?: TransitionPoint[];
}

export interface ContextualizedEmotion {
  emotion: string;
  calculatedIntensity: number;
  components: EmotionalComponents;
  dynamics: EmotionalDynamics;
  spatialAdjustments: {
    expansionFactor: number;
    zoneModifications: Record<string, number>;
  };
  temporalAdjustments: {
    durationFactor: number;
    onsetModifier: number;
    decayModifier: number;
  };
  metaData: {
    contextInfluence: number; // 0-1, how much context affected the result
    dominantContextFactor: string; // which context had most influence
    validationScore: number; // 0-1, validation quality
  };
}