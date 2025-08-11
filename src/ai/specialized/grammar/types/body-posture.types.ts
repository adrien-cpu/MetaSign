// src/ai/specialized/grammar/types/body-posture.types.ts

/**
 * Types de directions pour l'inclinaison du tronc
 */
export type InclinationDirection = 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT';

/**
 * Types d'axes pour la rotation du tronc
 */
export type RotationAxis = 'VERTICAL' | 'HORIZONTAL';

/**
 * Types de transferts de rôle
 */
export type RoleType = 'CHARACTER' | 'NARRATOR' | 'OBSERVER';

/**
 * Types de perspectives
 */
export type Perspective = 'INTERNAL' | 'EXTERNAL';

/**
 * Types de côtés pour les mouvements d'épaules
 */
export type ShoulderSide = 'LEFT' | 'RIGHT' | 'BOTH';

/**
 * Types de mouvements d'épaules
 */
export type ShoulderMovementType = 'RAISE' | 'LOWER' | 'FORWARD' | 'BACKWARD';

/**
 * Types de contextes grammaticaux
 */
export type GrammaticalContextType = 'NEUTRAL' | 'EMPHASIS' | 'QUESTION' | 'STATEMENT';

/**
 * Types de portée grammaticale
 */
export type GrammaticalScope = 'LOCAL' | 'GLOBAL';

/**
 * Types de fonction grammaticale
 */
export type GrammaticalFunctionType = 'NEUTRAL' | 'EMPHASIS' | 'CONTRAST' | 'TOPIC_SHIFT';

/**
 * Données d'inclinaison du tronc
 */
export interface InclinationData {
    direction: InclinationDirection;
    angle: number;
    intensity: number;
}

/**
 * Données de rotation du tronc
 */
export interface RotationData {
    axis: RotationAxis;
    angle: number;
    speed: number;
}

/**
 * Transfert de rôle
 */
export interface RoleTransfer {
    type: RoleType;
    intensity: number;
    perspective: Perspective;
}

/**
 * Données de timing pour les postures
 */
export interface PostureTiming {
    start: number;
    duration: number;
    transitionIn: number;
    transitionOut: number;
}

/**
 * Mouvement d'épaule
 */
export interface ShoulderMovement {
    type: ShoulderMovementType;
    amplitude: number;
    speed: number;
}

/**
 * Fonction grammaticale
 */
export interface GrammaticalFunction {
    type: GrammaticalFunctionType;
    strength: number;
    scope: GrammaticalScope;
}

/**
 * Posture du tronc
 */
export interface TrunkPosture {
    inclination: InclinationData;
    rotation: RotationData;
    role?: RoleTransfer;
    timing: PostureTiming;
}

/**
 * Posture des épaules
 */
export interface ShoulderPosture {
    side: ShoulderSide;
    elevation: number;
    movement: ShoulderMovement;
    timing: PostureTiming;
}

/**
 * Transfert de poids
 */
export interface WeightShift {
    direction: InclinationDirection;
    amplitude: number;
    timing: PostureTiming;
    function?: GrammaticalFunction;
}

/**
 * Motif de symétrie pour les mouvements d'épaules
 */
export interface SymmetryPattern {
    time: number;
    isSymmetric: boolean;
    leftCount: number;
    rightCount: number;
    bothCount: number;
}

/**
 * Règle d'inclinaison
 */
export interface InclinationRule {
    direction: InclinationDirection;
    minAngle: number;
    maxAngle: number;
    minIntensity: number;
    maxIntensity: number;
}

/**
 * Règle de rotation
 */
export interface RotationRule {
    axis: RotationAxis;
    minAngle: number;
    maxAngle: number;
    minSpeed: number;
    maxSpeed: number;
}

/**
 * Règle de transfert de rôle
 */
export interface RoleTransferRule {
    type: RoleType;
    minIntensity: number;
    maxIntensity: number;
    allowedPerspectives: Perspective[];
}

/**
 * Règle d'élévation
 */
export interface ElevationRule {
    minElevation: number;
    maxElevation: number;
    context: GrammaticalContextType;
}

/**
 * Règle de mouvement
 */
export interface MovementRule {
    type: ShoulderMovementType;
    minAmplitude: number;
    maxAmplitude: number;
    minSpeed: number;
    maxSpeed: number;
}

/**
 * Règle de symétrie
 */
export interface SymmetryRule {
    context: GrammaticalContextType;
    requireSymmetry: boolean;
}

/**
 * Règle d'amplitude
 */
export interface AmplitudeRule {
    direction: InclinationDirection;
    minAmplitude: number;
    maxAmplitude: number;
}

/**
 * Règle de timing
 */
export interface TimingRule {
    minDuration: number;
    maxDuration: number;
    minTransitionIn: number;
    maxTransitionIn: number;
    minTransitionOut: number;
    maxTransitionOut: number;
}

/**
 * Règle de fonction
 */
export interface FunctionRule {
    type: GrammaticalFunctionType;
    minStrength: number;
    maxStrength: number;
    allowedScopes: GrammaticalScope[];
}

/**
 * Classe d'erreur spécifique pour les validations de posture corporelle
 */
export class BodyPostureError extends Error {
    constructor(message: string, public originalError?: unknown) {
        super(message);
        this.name = 'BodyPostureError';
    }
}