// src/ai/types/lsf.ts
import { SpatialVector, Vector3 } from '@ai/spatial/types';

/**
 * Données relatives à un geste en LSF
 */
export interface GestureData {
    /** Identifiant unique du geste */
    id: string;
    /** Type de geste */
    type: string;
    /** Durée du geste en millisecondes */
    duration: number;
    /** Position de départ */
    startPosition: Vector3;
    /** Position d'arrivée */
    endPosition: Vector3;
    /** Paramètres supplémentaires */
    parameters?: Record<string, unknown>;
}

/**
 * Données relatives à une expression en LSF
 */
export interface ExpressionData {
    /** Identifiant unique de l'expression */
    id: string;
    /** Type d'expression */
    type: string;
    /** Intensité de l'expression (0-1) */
    intensity: number;
    /** Paramètres spécifiques à l'expression */
    parameters?: Record<string, unknown>;
}

/**
 * Informations de timing pour la LSF
 */
export interface TimingInfo {
    /** Durée totale en millisecondes */
    totalDuration: number;
    /** Points clés temporels */
    keyPoints: Array<{
        /** Position temporelle en millisecondes */
        time: number;
        /** Description du point clé */
        description: string;
        /** Type de point clé */
        type: 'start' | 'transition' | 'hold' | 'end' | string;
    }>;
    /** Tempo global (battements par minute) */
    tempo?: number;
}

/**
 * Données de mouvement
 */
export interface MovementData {
    /** Type de mouvement */
    type: 'linear' | 'curve' | 'bounce' | 'circular' | string;
    /** Courbe de vitesse */
    speedCurve?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | string;
    /** Points de contrôle du mouvement (si applicable) */
    controlPoints?: Vector3[];
    /** Paramètres supplémentaires */
    parameters?: Record<string, unknown>;
}

/**
 * Configuration de main pour la LSF
 */
export interface HandComponent {
    /** Quelle main (droite, gauche, les deux) */
    which: 'right' | 'left' | 'both';
    /** Forme de la main */
    shape: string;
    /** Orientation de la paume */
    palmOrientation: Vector3;
    /** Position dans l'espace */
    position: Vector3;
    /** Données de mouvement */
    movement?: MovementData;
    /** Contact avec une autre partie du corps */
    contact?: {
        /** Point de contact */
        target: string;
        /** Type de contact */
        type: 'touch' | 'grasp' | 'brush' | string;
        /** Pression du contact (0-1) */
        pressure?: number;
    };
}

/**
 * Résultat LSF complet
 */
export interface LSFResult {
    /** Liste des gestes */
    gestures: GestureData[];
    /** Liste des expressions */
    expressions: ExpressionData[];
    /** Informations de timing */
    timing: TimingInfo;
}

/**
 * Expression LSF complète
 */
export interface LSFExpression {
    /** Identifiant unique */
    id: string;
    /** Type d'expression */
    type: string;
    /** Composante de tête */
    head?: HeadComponent;
    /** Composante des yeux */
    eyes?: EyeComponent;
    /** Composante des sourcils */
    eyebrows?: EyebrowComponent;
    /** Composante du corps */
    body?: BodyComponent;
    /** Composantes des mains */
    hands?: HandComponent[];
}

/**
 * Configuration de la tête
 */
export interface HeadComponent {
    /** Rotation de la tête */
    rotation: Vector3;
    /** Position de la tête */
    position: Vector3;
    /** Mouvement de la tête */
    movement: MovementData;
}

/**
 * Configuration des yeux
 */
export interface EyeComponent {
    /** Direction du regard */
    gaze: Vector3;
    /** Degré d'ouverture des yeux (0-1) */
    openness: number;
}

/**
 * Configuration des sourcils
 */
export interface EyebrowComponent {
    /** Position des sourcils */
    position: Vector3;
    /** Forme des sourcils */
    shape: string;
}

/**
 * Configuration du corps
 */
export interface BodyComponent {
    /** Posture du corps */
    posture: string;
    /** Niveau de tension musculaire (0-1) */
    tension: number;
}

/**
 * Intensité du modèle prosodique
 */
export enum ProsodicIntensity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    VARIABLE = 'variable'
}

/**
 * Timing du modèle prosodique
 */
export enum ProsodicTiming {
    FASTER = 'faster',
    REGULAR = 'regular',
    SLOWER = 'slower',
    VARIABLE = 'variable'
}

/**
 * Modèle prosodique pour la Langue des Signes Française
 */
export interface ProsodicPattern {
    /** Identifiant unique du modèle */
    id: string;

    /** Nom du modèle */
    name: string;

    /** Intensité du mouvement */
    intensity: ProsodicIntensity;

    /** Timing du mouvement */
    timing: ProsodicTiming;

    /** Modificateur pour les transitions entre signes (multiplicateur) */
    transitionModifier: number;

    /** Amplitude spatiale du mouvement */
    spatialAmplitude: SpatialVector;

    /** Expression faciale associée (optionnelle) */
    facialExpression?: string;

    /** Contexte d'utilisation (optionnel) */
    context?: string[];
}

/**
 * Entité représentant un modèle prosodique qui peut être mis en avant
 * dans l'interface utilisateur ou favori
 */
export interface ProsodicFeature {
    /** Identifiant unique de la fonctionnalité */
    id: string;

    /** Identifiant du modèle prosodique référencé */
    patternId: string;

    /** Titre affiché dans l'interface */
    title: string;

    /** Description de la fonctionnalité */
    description: string;

    /** Indique si c'est un modèle favori */
    isFavorite: boolean;

    /** URL d'image pour l'icône (optionnel) */
    iconUrl?: string;
}

/**
 * Configuration d'un mouvement prosodique appliqué
 */
export interface ProsodicMovementConfig {
    /** Modèle prosodique utilisé */
    pattern: ProsodicPattern;

    /** Durée de base en millisecondes */
    baseTime: number;

    /** Intensité spécifique qui peut surcharger celle du modèle */
    overrideIntensity?: ProsodicIntensity;

    /** Modificateurs contextuels */
    contextualModifiers?: {
        /** Modificateur émotionnel */
        emotional?: number;
        /** Modificateur syntaxique */
        syntactic?: number;
    };
}

/**
 * Position des sourcils
 */
export enum EyebrowsPosition {
    RAISED = 'raised',
    LOWERED = 'lowered',
    FURROWED = 'furrowed',
    RAISED_INNER = 'raised_inner',
    RAISED_OUTER = 'raised_outer',
    NEUTRAL = 'neutral'
}

/**
 * Position des yeux
 */
export enum EyesPosition {
    OPEN = 'open',
    CLOSED = 'closed',
    NARROWED = 'narrowed',
    WIDE = 'wide',
    SQUINTED = 'squinted'
}

/**
 * Direction du regard
 */
export enum EyeDirection {
    FORWARD = 'forward',
    LEFT = 'left',
    RIGHT = 'right',
    UP = 'up',
    DOWN = 'down',
    UP_LEFT = 'up_left',
    UP_RIGHT = 'up_right',
    DOWN_LEFT = 'down_left',
    DOWN_RIGHT = 'down_right'
}

/**
 * Position de la bouche
 */
export enum MouthPosition {
    CLOSED = 'closed',
    OPEN = 'open',
    ROUNDED = 'rounded',
    STRETCHED = 'stretched',
    PURSED = 'pursed',
    SMILE = 'smile',
    FROWN = 'frown',
    NEUTRAL = 'neutral'
}

/**
 * Position des joues
 */
export enum CheeksPosition {
    NEUTRAL = 'neutral',
    PUFFED = 'puffed',
    SUCKED = 'sucked',
    RAISED = 'raised'
}

/**
 * Position de la tête
 */
export enum HeadPosition {
    NEUTRAL = 'neutral',
    TILTED_LEFT = 'tilted_left',
    TILTED_RIGHT = 'tilted_right',
    FORWARD = 'forward',
    BACKWARD = 'backward',
    TURNED_LEFT = 'turned_left',
    TURNED_RIGHT = 'turned_right',
    NOD = 'nod',
    SHAKE = 'shake'
}

/**
 * Type de mouvement de tête
 */
export enum HeadMovementType {
    NOD = 'nod',
    SHAKE = 'shake',
    TILT = 'tilt',
    TURN = 'turn',
    CIRCLE = 'circle',
    NONE = 'none'
}

/**
 * Position de la main
 */
export interface HandPosition {
    configuration: HandConfiguration;
    orientation: HandOrientation;
    location: Location3D;
}

/**
 * Configuration de la main
 */
export enum HandConfiguration {
    FLAT = 'flat',
    FIST = 'fist',
    PINCH = 'pinch',
    POINT = 'point',
    OPEN = 'open',
    CLAW = 'claw',
    CUP = 'cup',
    SPREAD = 'spread'
}

/**
 * Orientation de la main
 */
export interface HandOrientation {
    palm: Orientation3D;
    fingers: Orientation3D;
}

/**
 * Orientation dans l'espace 3D
 */
export enum Orientation3D {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
    FORWARD = 'forward',
    BACKWARD = 'backward'
}

/**
 * Localisation dans l'espace 3D
 */
export interface Location3D {
    x: number;
    y: number;
    z: number;
    reference?: string;
}

/**
 * Interface de mouvement
 */
export interface Movement {
    path: MovementPath;
    type: MovementPathType;
    speed: number;
    repeat: number;
}

/**
 * Chemin de mouvement
 */
export enum MovementPath {
    LINEAR = 'linear',
    CIRCULAR = 'circular',
    ARC = 'arc',
    ZIGZAG = 'zigzag',
    WAVE = 'wave'
}

/**
 * Type de chemin de mouvement
 */
export enum MovementPathType {
    STRAIGHT = 'straight',
    CURVED = 'curved',
    COMPLEX = 'complex'
}

/**
 * Point de contact
 */
export interface ContactPoint {
    type: ContactType;
    location: ContactLocation;
    intensity: number;
}

/**
 * Type de contact
 */
export enum ContactType {
    TOUCH = 'touch',
    BRUSH = 'brush',
    STRIKE = 'strike',
    GRAB = 'grab',
    PINCH = 'pinch'
}

/**
 * Localisation du contact
 */
export enum ContactLocation {
    PALM = 'palm',
    BACK_OF_HAND = 'back_of_hand',
    FINGERTIP = 'fingertip',
    WRIST = 'wrist',
    CHEST = 'chest',
    FOREHEAD = 'forehead',
    CHIN = 'chin',
    CHEEK = 'cheek'
}

/**
 * Référence spatiale
 */
export interface SpatialReference {
    id: string;
    type: SpatialReferenceType;
    position: Location3D;
    lifetime: number;
    associatedSign?: string;
}

/**
 * Type de référence spatiale
 */
export enum SpatialReferenceType {
    PERSON = 'person',
    OBJECT = 'object',
    LOCATION = 'location',
    ABSTRACT = 'abstract',
    TEMPORAL = 'temporal'
}

/**
 * Marqueur temporel
 */
export interface TemporalMarker {
    id: string;
    type: TemporalMarkerType;
    timing: TimingInfo;
    associatedSigns: string[];
}

/**
 * Type de marqueur temporel
 */
export enum TemporalMarkerType {
    BEFORE = 'before',
    AFTER = 'after',
    DURING = 'during',
    FREQUENCY = 'frequency',
    DURATION = 'duration'
}

/**
 * Élément non-manuel
 */
export interface NonManualElement {
    id: string;
    type: NonManualElementType;
    intensity: number;
    duration: number;
    associatedSigns: string[];
}

/**
 * Type d'élément non-manuel
 */
export enum NonManualElementType {
    FACIAL = 'facial',
    HEAD = 'head',
    BODY = 'body',
    GAZE = 'gaze',
    MOUTHING = 'mouthing'
}

/**
 * Fonction grammaticale
 */
export enum GrammaticalFunction {
    SUBJECT = 'subject',
    OBJECT = 'object',
    VERB = 'verb',
    ADJECTIVE = 'adjective',
    ADVERB = 'adverb',
    QUESTION = 'question',
    NEGATION = 'negation',
    AFFIRMATION = 'affirmation',
    CONDITIONAL = 'conditional',
    TEMPORAL = 'temporal'
}