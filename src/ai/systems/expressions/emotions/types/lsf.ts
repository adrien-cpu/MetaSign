//ssrc/ai/systems/expressions/emotions/types/lsf.ts
export interface LSFExpression {
  manual: ManualComponent;
  nonManual: NonManualComponent;
  spatial: SpatialComponent;
  temporal: TemporalComponent;
}

export interface ManualComponent {
  handShape: string;
  orientation: string;
  location: string;
  movement: string;
}

export interface NonManualComponent {
  facial: FacialMarkers;
  head: HeadMovements;
  body: BodyPosture;
}

export interface SpatialComponent {
  signingSpace: string;
  referencePoints: string[];
  planeOfArticulation: string;
}

export interface TemporalComponent {
  duration: number;
  speed: number;
  repetition: number;
}

export interface FacialMarkers {
  eyebrows: string;
  eyes: string;
  cheeks: string;
  mouth: string;
}

export interface HeadMovements {
  tilt: string;
  nod: string;
  shake: string;
}

export interface BodyPosture {
  shoulders: string;
  trunk: string;
  tension: number;
}

export interface LSFConfiguration {
  handshape: HandshapeConfig;
  orientation: OrientationConfig;
  location: LocationConfig;
  movement: MovementConfig;
}

export interface HandshapeConfig {
  base: string;
  fingers: FingerConfig[];
  tension: number;
}

export interface FingerConfig {
  finger: string;
  position: string;
  contact?: string;
}

export interface OrientationConfig {
  palm: string;
  fingers: string;
  rotation: number;
}

export interface LocationConfig {
  mainLocation: string;
  specificLocation?: string;
  distance: number;
}

export interface MovementConfig {
  path: string;
  manner: string;
  repetition: number;
  speed: number;
}