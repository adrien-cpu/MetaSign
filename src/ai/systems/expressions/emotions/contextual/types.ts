// src/ai/systems/expressions/emotions/contextual/types.ts

import { CulturalContext } from '@ai/specialized/spatial/types';

/**
 * Informations contextuelles utilisées pour l'adaptation émotionnelle
 */
export interface ContextualInformation {
  /** Contexte social */
  social: SocialContext;
  /** Contexte narratif */
  narrative: NarrativeContext;
  /** Contexte culturel */
  cultural: CulturalContext;
  /** Contexte temporel */
  temporal: TemporalContext;
}

/**
 * Contexte social pour l'adaptation émotionnelle
 */
export interface SocialContext {
  /** Cadre social (professionnel, intime, etc.) */
  setting: string;
  /** Niveau de formalité (0.0-1.0) */
  formalityLevel: number;
  /** Dynamiques relationnelles */
  relationshipDynamics?: {
    /** Niveau d'intimité (0.0-1.0) */
    intimacy: number;
    /** Hiérarchie */
    hierarchy?: string;
    /** Niveau de familiarité (0.0-1.0) */
    familiarity?: number;
  };
  /** Facteurs environnementaux */
  environmentalFactors?: {
    /** Niveau de distraction (0.0-1.0) */
    distractionLevel: number;
    /** Niveau d'affluence (0.0-1.0) */
    crowdedness?: number;
    /** Niveau de bruit (0.0-1.0) */
    noise?: number;
  };
  /** Informations sur les participants */
  participants?: {
    /** Nombre de participants */
    count: number;
    /** Niveau de familiarité avec les participants (0.0-1.0) */
    familiarity?: number;
    /** Niveau de diversité des participants (0.0-1.0) */
    diversity?: number;
  };
}

/**
 * Contexte narratif pour l'adaptation émotionnelle
 */
export interface NarrativeContext {
  /** Type de narration */
  type: 'dramatic' | 'comedic' | 'instructional' | 'informative' | 'personal' | string;
  /** Éléments de l'histoire */
  storyElements?: {
    /** Ton narratif */
    tone: string;
    /** Thème */
    theme?: string;
    /** Rythme */
    pace?: string;
  };
  /** Arcs émotionnels */
  emotionalArcs?: Array<{
    /** Nom de l'arc */
    name: string;
    /** Intensité de l'arc (0.0-1.0) */
    intensity: number;
    /** Durée de l'arc */
    duration: number;
  }>;
}

/**
 * Contexte temporel pour l'adaptation émotionnelle
 */
export interface TemporalContext {
  /** Durée globale disponible */
  duration: number;
  /** Motifs temporels */
  timingPatterns: Array<{
    /** Type de motif */
    type: string;
    /** Durée du motif */
    duration: number;
    /** Fréquence du motif */
    frequency?: number;
  }>;
  /** Séquence temporelle */
  sequence?: string[];
}

/**
 * État émotionnel
 */
export interface EmotionState {
  /** Type d'émotion (joie, tristesse, etc.) */
  type: string;
  /** Intensité globale (0.0-1.0) */
  intensity: number;
  /** Composantes émotionnelles */
  components: {
    /** Expressions faciales */
    facial: {
      /** Expression des sourcils */
      eyebrows: string;
      /** Expression des yeux */
      eyes: string;
      /** Expression de la bouche */
      mouth: string;
      /** Intensité faciale (0.0-1.0) */
      intensity: number;
    };
    /** Expressions gestuelles */
    gestural: {
      /** Expressions des mains */
      hands: string;
      /** Expressions des bras */
      arms: string;
      /** Expressions du corps */
      body: string;
      /** Intensité gestuelle (0.0-1.0) */
      intensity: number;
    };
    /** Intensité globale des composantes (0.0-1.0) */
    intensity: number;
  };
  /** Dynamiques temporelles */
  dynamics: {
    /** Durée de l'expression (secondes) */
    duration: number;
    /** Type de transition */
    transition: 'abrupt' | 'gradual' | 'smooth';
    /** Séquence d'expressions */
    sequence: string[];
  };
  /** Métadonnées supplémentaires */
  metadata: {
    /** Source de l'émotion */
    source?: string;
    /** Niveau de confiance (0.0-1.0) */
    confidence?: number;
    /** Informations d'adaptation contextuelle */
    contextualAdaptation?: {
      /** Source de l'adaptation */
      source: string;
      /** Type d'adaptation */
      adaptationType: string;
      /** Score de confiance (0.0-1.0) */
      confidenceScore: number;
    };
  };
}

/**
 * Émotion adaptée au contexte avec métadonnées
 */
export interface AdaptedEmotion {
  /** État émotionnel adapté */
  emotion: EmotionState;
  /** Métadonnées d'adaptation */
  metadata: {
    /** Scores de pertinence contextuelle */
    contextualRelevance: AdaptationScores;
    /** Score de qualité d'adaptation (0.0-1.0) */
    adaptationQuality: number;
    /** Scores d'authenticité culturelle */
    culturalAuthenticity: AuthenticityScores;
  };
}

/**
 * Plan d'adaptation émotionnelle
 */
export interface AdaptationPlan {
  /** Facteur de modulation d'intensité */
  intensityModulation: number;
  /** Ajustements d'expression */
  expressionAdjustments: ExpressionAdjustments;
  /** Modifications temporelles */
  temporalModifications: TemporalModifications;
}

/**
 * Ajustements d'expression pour l'adaptation
 */
export interface ExpressionAdjustments {
  /** Ajustements faciaux */
  facial: FacialAdjustments;
  /** Ajustements gestuels */
  gestural: GesturalAdjustments;
  /** Ajustements posturaux */
  postural: PosturalAdjustments;
}

/**
 * Ajustements des expressions faciales
 */
export interface FacialAdjustments {
  /** Plage d'expression (restreinte, complète) */
  range: string;
  /** Intensité faciale (0.0-1.0) */
  intensity: number;
  /** Niveau de contrôle */
  control: string;
  /** Emphase sur certaines parties */
  emphasis: {
    /** Emphase sur les sourcils */
    eyebrows: string;
    /** Emphase sur la bouche */
    mouth: string;
    /** Emphase sur les yeux */
    eyes: string;
  };
}

/**
 * Ajustements gestuels
 */
export interface GesturalAdjustments {
  /** Amplitude des gestes */
  amplitude: string;
  /** Précision des gestes */
  precision: string;
  /** Utilisation de l'espace */
  space: string;
  /** Alignement culturel */
  cultural_alignment: string;
}

/**
 * Ajustements posturaux
 */
export interface PosturalAdjustments {
  /** Niveau de formalité */
  formality: string;
  /** Alignement corporel */
  alignment: string;
  /** Niveau de tension */
  tension: string;
  /** Liberté de mouvement */
  movement_freedom: string;
}

/**
 * Modifications temporelles pour l'adaptation
 */
export interface TemporalModifications {
  /** Modification de durée */
  duration: DurationModification;
  /** Modification des transitions */
  transitions: TransitionModification;
  /** Modification du rythme */
  rhythm: RhythmModification;
}

/**
 * Modification de durée
 */
export interface DurationModification {
  /** Durée de base */
  base: number;
  /** Durée ajustée */
  adjusted: number;
  /** Facteur d'ajustement */
  factor: number;
  /** Raison de l'ajustement */
  reason: string;
}

/**
 * Modification des transitions
 */
export interface TransitionModification {
  /** Style de transition */
  style: string;
  /** Vitesse de transition */
  speed: string;
  /** Fluidité de transition */
  smoothness: string;
}

/**
 * Modification du rythme
 */
export interface RhythmModification {
  /** Rythme de base */
  base: string;
  /** Influence culturelle */
  cultural_overlay: string;
  /** Motif rythmique */
  pattern: string;
  /** Variations rythmiques */
  variations: string;
}

/**
 * Scores d'adaptation pour l'évaluation
 */
export interface AdaptationScores {
  /** Score global */
  overall: number;
  /** Score d'adaptation sociale */
  social: number;
  /** Score d'adaptation narrative */
  narrative: number;
  /** Score d'adaptation culturelle */
  cultural: number;
}

/**
 * Scores d'authenticité pour l'évaluation
 */
export interface AuthenticityScores {
  /** Score global */
  overall: number;
  /** Score d'expressivité */
  expressiveness: number;
  /** Score de pertinence */
  appropriateness: number;
  /** Score de cohérence */
  coherence: number;
}

/**
 * Analyse de contexte complète
 */
export interface ContextAnalysis {
  /** Analyse des facteurs sociaux */
  socialFactors: SocialFactorsAnalysis;
  /** Analyse des éléments narratifs */
  narrativeElements: NarrativeElementsAnalysis;
  /** Analyse des considérations culturelles */
  culturalConsiderations: CulturalConsiderationsAnalysis;
  /** Analyse des patterns temporels */
  temporalPatterns: TemporalPatternsAnalysis;
}

/**
 * Analyse des facteurs sociaux
 */
export interface SocialFactorsAnalysis {
  /** Niveau de formalité */
  formalityLevel: number;
  /** Contexte social */
  setting: string;
  /** Analyse des dynamiques relationnelles */
  relationshipDynamics: Record<string, unknown>;
  /** Analyse des facteurs environnementaux */
  environmentalFactors: Record<string, unknown>;
}

/**
 * Analyse des éléments narratifs
 */
export interface NarrativeElementsAnalysis {
  /** Éléments de l'histoire */
  storyElements: {
    /** Ton narratif */
    tone: string;
    /** Autres propriétés */
    [key: string]: unknown;
  };
  /** Analyse des arcs émotionnels */
  emotionalArcs: Array<Record<string, unknown>>;
  /** Type de narration */
  narrativeType?: string;
  /** Caractéristiques narratives */
  narrativeCharacteristics?: Record<string, unknown>;
}

/**
 * Analyse des considérations culturelles
 */
export interface CulturalConsiderationsAnalysis {
  /** Région culturelle */
  region?: string;
  /** Normes culturelles applicables */
  culturalNorms: string[];
  /** Éléments traditionnels */
  traditionalElements: Record<string, unknown>;
  /** Adaptations spécifiques */
  adaptations?: Record<string, unknown>;
}

/**
 * Analyse des patterns temporels
 */
export interface TemporalPatternsAnalysis {
  /** Patterns temporels analysés */
  timingPatterns: Array<{
    /** Type de pattern */
    type: string;
    /** Durée du pattern */
    duration: number;
    /** Autres propriétés */
    [key: string]: unknown;
  }>;
  /** Contraintes temporelles */
  constraints?: Record<string, unknown>;
  /** Rythme temporel */
  temporalRhythm?: Record<string, unknown>;
}

/**
 * Résultat de validation
 */
export interface ValidationResult {
  /** Validité globale */
  valid: boolean;
  /** Problèmes identifiés */
  issues: ValidationIssue[];
  /** Score de validation (0.0-1.0) */
  score: number;
}

/**
 * Problème de validation
 */
export interface ValidationIssue {
  /** Code du problème */
  code: string;
  /** Niveau de sévérité */
  severity: 'error' | 'warning' | 'info';
  /** Message descriptif */
  message: string;
  /** Détails supplémentaires */
  details: Record<string, unknown>;
}

// Réexporter le type CulturalContext pour l'utilisateur
export type { CulturalContext };