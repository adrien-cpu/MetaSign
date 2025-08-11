// src/ai/specialized/grammar/types.ts

// Structure grammaticale
export interface GrammaticalStructure {
  type: GrammaticalType;
  components: GrammaticalComponent[];
  relations: GrammaticalRelation[];
  context: GrammaticalContext;
}

export type GrammaticalType =
  | 'ASSERTION'
  | 'QUESTION'
  | 'NEGATION'
  | 'CONDITION'
  | 'COMPARISON'
  | 'DESCRIPTION';

export interface GrammaticalComponent {
  id: string;
  type: ComponentType;
  value: ComponentValue;
  properties: ComponentProperties;
}

export type ComponentValue =
  | string
  | number
  | boolean
  | SignParameter
  | SignLocation
  | SignMovement;

export interface SignParameter {
  handshape: string;
  orientation: string;
  location: SignLocation;
  movement: SignMovement;
  nonManual?: NonManualFeature[];
}

export interface SignLocation {
  x: number;
  y: number;
  z: number;
  bodyReference?: string;
  area?: string;
}

export interface SignMovement {
  path: string;
  direction: string;
  speed: number;
  repetition: number;
}

export interface NonManualFeature {
  type: string;
  intensity: number;
  timing: ComponentTiming;
}

export type ComponentType =
  | 'MANUAL'          // Composants manuels
  | 'NON_MANUAL'      // Composants non manuels
  | 'SPATIAL'         // Composants spatiaux
  | 'TEMPORAL'        // Composants temporels
  | 'MODIFIER'        // Modificateurs
  | 'FACIAL'
  | 'GAZE'
  | 'HEAD'
  | 'POSTURE';


// Types pour les règles grammaticales
export type ConditionType =
  | 'PRESENCE'
  | 'ABSENCE'
  | 'SEQUENCE'
  | 'SIMULTANEITY'
  | 'CONSISTENCY'
  | 'COMPATIBILITY';

export type ActionType =
  | 'ENFORCE'
  | 'SUGGEST'
  | 'TRANSFORM'
  | 'VALIDATE'
  | 'NOTIFY';

// Type pour les exceptions de règles
export interface RuleException {
  condition: RuleCondition;
  priority: number;
  description: string;
}

// Règles grammaticales
export interface GrammaticalRule {
  id: string;
  type: RuleType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  exceptions?: RuleException[];
  priority: number;
  critical: boolean;
  validate(structure: GrammaticalStructure): Promise<RuleValidationResult>;
}

export type RuleType =
  | 'SPATIAL_ORGANIZATION'    // Organisation spatiale
  | 'TEMPORAL_SEQUENCE'       // Séquence temporelle
  | 'NON_MANUAL_MARKING'      // Marquage non manuel
  | 'AGREEMENT'              // Accord grammatical
  | 'ROLE_SHIFT'            // Transfert personnel
  | 'CLASSIFIER_USE';        // Utilisation des proformes

export interface RuleCondition {
  type: ConditionType;
  target: string | string[];
  predicate: (value: ComponentValue) => boolean;
}

export interface RuleAction {
  type: ActionType;
  apply(context: RuleContext): Promise<void>;
}

export interface RuleContext {
  structure: GrammaticalStructure;
  component?: GrammaticalComponent;
  relation?: GrammaticalRelation;
  metadata?: Record<string, unknown>;
}

export interface ValidationError {
  type: string;
  message: string;
  details: ValidationErrorDetails;
}

export interface ValidationErrorDetails {
  componentId?: string;
  relationId?: string;
  ruleId?: string;
  expected?: string | number | boolean;
  actual?: string | number | boolean;
  location?: SignLocation;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface ValidationDetails {
  // Propriétés originales
  spatialAnalysis?: SpatialAnalysisResult;
  temporalAnalysis?: TemporalAnalysisResult;
  nonManualAnalysis?: NonManualAnalysisResult;
  ruleAnalysis?: RuleAnalysisResult;
  timestamp: number;

  // Propriétés pour la validation non-manuelle
  message?: string;
  errorDetails?: ValidationDetails;
  facialComponents?: {
    eyebrows?: unknown;
    cheeks?: unknown;
    mouth?: unknown;
    combinations?: unknown;
  };
  gazeComponents?: {
    direction?: unknown;
    intensity?: unknown;
    shifts?: unknown;
  };
  headComponents?: {
    nods?: unknown;
    rotations?: unknown;
    tilts?: unknown;
  };
  postureComponents?: {
    trunk?: unknown;
    shoulders?: unknown;
    weightShifts?: unknown;
  };

  // Propriétés pour les références croisées
  facial?: ValidationDetails;
  gaze?: ValidationDetails;
  head?: ValidationDetails;
  posture?: ValidationDetails;
  metadata?: {
    timestamp?: number;
    version?: string;
  };

  // Index signature pour les propriétés dynamiques supplémentaires
  [key: string]: unknown;
}

export interface SpatialAnalysisResult {
  coherence: number;
  utilization: number;
  conflicts: string[];
}

export interface TemporalAnalysisResult {
  sequenceValidity: number;
  timing: number;
  conflicts: string[];
}

export interface NonManualAnalysisResult {
  consistency: number;
  appropriateness: number;
  conflicts: string[];
}

export interface RuleAnalysisResult {
  passedRules: string[];
  failedRules: string[];
  warnings: string[];
}

export interface RuleValidationResult {
  isValid: boolean;
  score: number;
  rule: string;
  details?: {
    context: RuleContext;
    violations?: RuleViolation[];
    suggestions?: Suggestion[];
  };
}

// Relations grammaticales
export interface GrammaticalRelation {
  type: RelationType;
  source: string;
  target: string;
  properties: RelationProperties;
}

export type RelationType =
  | 'AGREEMENT'          // Accord
  | 'MODIFICATION'       // Modification
  | 'DEPENDENCY'         // Dépendance
  | 'SEQUENCE'          // Séquence
  | 'COORDINATION';      // Coordination

export interface RelationProperties {
  strength: number;
  bidirectional: boolean;
  constraints?: RelationConstraint[];
}

// Contexte grammatical
export interface GrammaticalContext {
  discourse: DiscourseContext;
  spatial: SpatialContext;
  temporal: TemporalContext;
  participants: ParticipantContext[];
}

export interface SpatialContext {
  signingSpace: SigningSpace;
  referencePoints: ReferencePoint[];
  currentFocus?: string;
}

export interface SigningSpace {
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  boundaries: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
}

export interface ReferencePoint {
  id: string;
  location: SignLocation;
  associatedEntity: string;
  active: boolean;
}

export interface TemporalContext {
  timeReference: 'PAST' | 'PRESENT' | 'FUTURE';
  aspectualMarking: 'PERFECTIVE' | 'IMPERFECTIVE' | 'ITERATIVE' | 'NONE';
  timeline: TimelineMarker[];
}

export interface TimelineMarker {
  id: string;
  position: number;
  event: string;
  reference: boolean;
}

export interface ParticipantContext {
  id: string;
  role: 'SIGNER' | 'ADDRESSEE' | 'REFERENCED';
  location?: SignLocation;
  features?: Record<string, string | number | boolean>;
}

export interface DiscourseContext {
  type: DiscourseType;
  register: Register;
  topic?: string;
}

export type DiscourseType =
  | 'NARRATIVE'
  | 'DESCRIPTIVE'
  | 'ARGUMENTATIVE'
  | 'INSTRUCTIVE';

export type Register =
  | 'FORMAL'
  | 'SEMI_FORMAL'
  | 'INFORMAL'
  | 'INTIMATE';

// Phrase LSF
export interface LSFSentence {
  components: LSFComponent[];
  structure: GrammaticalStructure;
  metadata: SentenceMetadata;
}

export interface LSFComponent {
  type: ComponentType;
  content: ComponentContent;
  timing: ComponentTiming;
  emphasis?: number;
}

export type ComponentContent =
  | SignParameter
  | NonManualFeature
  | SpatialMarker
  | TemporalMarker;

export interface SpatialMarker {
  location: SignLocation;
  reference: string;
  type: 'LOCUS' | 'DIRECTION' | 'AREA';
}

export interface TemporalMarker {
  position: number;
  duration: number;
  type: 'POINT' | 'INTERVAL' | 'SEQUENCE';
}

export interface ComponentTiming {
  start: number;
  duration: number;
  sequence?: number;
}

// Types utilitaires
export interface RuleViolation {
  rule: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
  location?: SignLocation;
}

export interface Suggestion {
  type: 'CORRECTION' | 'IMPROVEMENT';
  description: string;
  impact: number;
}

export interface ComponentProperties {
  mandatory: boolean;
  repeatable: boolean;
  modifiable: boolean;
  constraints: ComponentConstraint[];
}

export interface ComponentConstraint {
  type: string;
  value: ConstraintValue;
  severity: 'MANDATORY' | 'RECOMMENDED';
}

export type ConstraintValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, string | number | boolean>;

export interface RelationConstraint {
  type: string;
  condition: ConstraintCondition;
  enforcement: 'STRICT' | 'FLEXIBLE';
}

export interface ConstraintCondition {
  property: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'NOT_CONTAINS';
  value: string | number | boolean;
}

export interface SentenceMetadata {
  complexity: number;
  register: Register;
  culturalContext: string[];
  timestamp: number;
}

// Validation
export interface ValidationResult {
  isValid: boolean;
  score: number;
  details: ValidationDetails;
  errors?: ValidationError[];
}

// Interface pour extension de GrammaticalStructure pour la validation non-manuelle
export interface NonManualGrammaticalStructure extends Omit<GrammaticalStructure, 'components'> {
  components: NonManualComponent[];
}

export interface NonManualComponent {
  type: ComponentType;
  value: Record<string, unknown>;
  timing: {
    duration: number;
    start?: number;
    end?: number;
  };
}

export interface FacialComponentValue {
  intensity: number;
  configuration: string;
  // Autres propriétés spécifiques...
}

export interface GazeComponentValue {
  direction: string;
  intensity: number;
  target?: string;
  // Autres propriétés spécifiques...
}

export interface HeadComponentValue {
  movement: string;
  intensity: number;
  // Autres propriétés spécifiques...
}

export interface PostureComponentValue {
  position: string;
  tension: number;
  // Autres propriétés spécifiques...
}