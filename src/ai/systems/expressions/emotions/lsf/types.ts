// src/ai/systems/expressions/emotions/lsf/types.ts

/**
 * Interface pour les propriétés des composants d'expression
 * Représente un ensemble de valeurs numériques pour différents paramètres
 */
export interface ExpressionComponentProperties {
  [key: string]: number;
}

/**
 * Interface pour la position 3D
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Interface pour le timing d'une expression
 */
export interface TimingComponent {
  /** Durée totale en millisecondes */
  duration: number;

  /** Temps de début de l'expression en millisecondes */
  onset: number;

  /** Temps de maintien à l'intensité maximale en millisecondes */
  hold?: number;

  /** Temps de relâchement de l'expression en millisecondes */
  release?: number;

  /** Propriétés additionnelles de timing */
  additionalTiming?: Record<string, number>;
}

/**
 * Interface pour les composants manuels (signes)
 */
export interface ManualComponent {
  /** Forme de la main */
  handShape: string;

  /** Orientation de la main */
  orientation: string;

  /** Mouvement de la main */
  movement: string;

  /** Position de la main */
  location: Position3D;
}

/**
 * Type pour les métadonnées de l'expression
 */
export interface LSFExpressionMetadata {
  /** Authenticité de l'expression (0.0 à 1.0) */
  authenticity?: number;

  /** Précision culturelle de l'expression (0.0 à 1.0) */
  culturalAccuracy?: number;

  /** Expressivité de l'expression (0.0 à 1.0) */
  expressiveness?: number;

  /** Adaptation sociale de l'expression */
  socialAdaptation?: number;

  /** Autres métadonnées dynamiques */
  [key: string]: number | string | boolean | undefined;
}

/**
 * Interface principale pour une expression LSF complète
 */
export interface LSFExpression {
  // Composantes faciales
  /** Propriétés des sourcils */
  eyebrows: ExpressionComponentProperties;

  /** Propriétés des yeux */
  eyes: ExpressionComponentProperties;

  /** Propriétés de la bouche */
  mouth: ExpressionComponentProperties;

  /** Propriétés de la tête (optionnel) */
  head?: ExpressionComponentProperties;

  // Composantes corporelles
  /** Propriétés du corps */
  body: {
    /** Posture du corps */
    posture?: ExpressionComponentProperties;

    /** Mouvement du corps */
    movement?: ExpressionComponentProperties;
  };

  // Composantes manuelles (optionnel)
  /** Composant manuel pour les signes */
  manual?: ManualComponent;

  // Timing et métadonnées
  /** Configuration temporelle de l'expression */
  timing: TimingComponent;

  /** Intensité globale de l'expression (0.0 à 1.0) */
  intensity: number;

  /** Type d'émotion exprimée */
  emotionType: string;

  /** Métadonnées additionnelles */
  metadata?: LSFExpressionMetadata;

  // Index signature pour permettre l'indexation dynamique tout en restant typé
  [key: string]:
  | ExpressionComponentProperties
  | ManualComponent
  | TimingComponent
  | LSFExpressionMetadata
  | number
  | string
  | { posture?: ExpressionComponentProperties; movement?: ExpressionComponentProperties; }
  | undefined;
}

// Alias pour la compatibilité avec le code existant
export type LSFSign = LSFExpression;