/**
 * Définitions de types pour le système spatial LSF
 * 
 * @file src/ai/specialized/spatial/types.ts
 */

import { SpatialVector } from '@spatial/types/SpatialTypes';

/**
 * Point 3D pour les positions dans l'espace
 */
export type Point3D = SpatialVector;

/**
 * Vecteur 3D pour les orientations
 */
export type Vector3D = SpatialVector;

/**
 * Types d'entrée LSF
 */
export enum LSFInputType {
  TEXT_CONVERSION = 'text_conversion',
  SIGN_RECOGNITION = 'sign_recognition',
  STRUCTURE_DEFINITION = 'structure_definition',
  SPATIAL_QUERY = 'spatial_query'
}

/**
 * Entrée pour l'analyse LSF
 */
export interface LSFInput {
  type: LSFInputType;
  data: string | Record<string, unknown>;
  culturalContext?: CulturalContext;
  options?: {
    detailLevel?: 'basic' | 'standard' | 'detailed';
    includeSpatialMap?: boolean;
    includeGraph?: boolean;
    optimizeForDisplay?: boolean;
  };
}

/**
 * Contexte culturel pour la génération de structures LSF
 */
export interface CulturalContext {
  region: string;
  formalityLevel: number; // 0-1, où 1 est le plus formel
  context?: 'educational' | 'conversational' | 'narrative' | 'technical' | 'custom';
  dialectVariation?: string;
  customProperties?: Record<string, unknown>;
}

/**
 * Types de composants spatiaux
 */
export enum SpatialComponentType {
  ZONE = 'zone',
  PROFORME = 'proforme',
  POINTING = 'pointing',
  TRANSITION = 'transition',
  GAZE = 'gaze',
  EXPRESSION = 'expression',
  ORIENTATION = 'orientation',
  MOVEMENT = 'movement'
}

/**
 * Composant spatial de base
 */
export interface SpatialComponent {
  id: string;
  type: SpatialComponentType;
  position?: Point3D;
  startTime?: number;
  endTime?: number;
  intensity?: number; // 0-1
  properties: Record<string, unknown>;
}

/**
 * Types de relations spatiales
 */
export enum SpatialRelationType {
  TEMPORAL = 'temporal',
  SPATIAL = 'spatial',
  SEMANTIC = 'semantic',
  CAUSAL = 'causal',
  STRUCTURAL = 'structural'
}

/**
 * Relation entre composants spatiaux
 */
export interface SpatialRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: SpatialRelationType;
  strength: number; // 0-1
  properties: Record<string, unknown>;
}

/**
 * Graphe spatial
 */
export interface SpatialGraph {
  nodes: SpatialComponent[];
  edges: SpatialRelation[];
  properties: Record<string, unknown>;
}

/**
 * Métadonnées d'analyse
 */
export interface AnalysisMetadata {
  processingTime: number;
  confidenceScore: number; // 0-1
  modelVersion: string;
  warnings: string[];
  suggestions: string[];
  statistics: {
    componentCount: number;
    relationCount: number;
    complexityScore: number; // 0-1
    coherenceScore: number; // 0-1
  };
}

/**
 * Résultat d'analyse spatiale
 */
export interface SpatialAnalysis {
  id: string;
  components: SpatialComponent[];
  relations: SpatialRelation[];
  graph?: SpatialGraph;
  metadata: AnalysisMetadata;
}

/**
 * Zone spatiale
 */
export interface SpatialZone {
  id: string;
  name: string;
  position: Point3D;
  size: {
    width: number;
    height: number;
    depth: number;
  };
  type: 'standard' | 'reference' | 'focus' | 'peripheral';
  components: string[]; // IDs des composants dans cette zone
}

/**
 * Configuration de doigt pour une forme de main
 */
export interface FingerConfig {
  finger: string;
  bend: number; // 0-1, où 0 est droit et 1 est plié
  spread: number; // 0-1, où 0 est serré et 1 est écarté
}

/**
 * Configuration d'une forme de main
 */
export interface HandshapeConfig {
  type: string;
  fingers: FingerConfig[];
  tension: number; // 0-1, où 0 est détendu et 1 est tendu
}

/**
 * Proforme (configuration manuelle)
 * Version étendue pour correspondre à l'implémentation existante
 */
export interface Proforme {
  id: string;
  name?: string;
  handshape: HandshapeConfig;
  orientation?: {
    palm: string;
    fingers: string;
  };
  defaultPosition?: Point3D;
  position?: Point3D; // Position actuelle (peut être différente de defaultPosition)
  represents: string; // Concept principal représenté
  associatedConcepts?: string[]; // Liste de concepts associés
  properties?: Record<string, unknown>;
  culturalContext?: string[]; // Contextes culturels dans lesquels cette proforme est utilisée
}

/**
 * Structure spatiale dans le système spécialisé
 */
export interface SpatialStructure {
  id: string;
  zones: SpatialZone[];
  proformes: Proforme[];
  components: SpatialComponent[];
  relations: SpatialRelation[];
  layout?: Record<string, unknown>; // Disposition spécifique
  metadata: {
    createdAt: number;
    culturalContext: CulturalContext;
    coherenceScore: number; // 0-1
    complexityScore: number; // 0-1
    optimizationLevel: number; // 0-1
    statistics: {
      zoneCount: number;
      proformeCount: number;
      componentCount: number;
      relationCount: number;
    };
  };
}

/**
 * Types de zones dans le système spécialisé
 */
export enum ZoneType {
  NEUTRAL = 'neutral',
  REFERENTIAL = 'referential',
  DESCRIPTIVE = 'descriptive',
  EMOTIONAL = 'emotional',
  GRAMMATICAL = 'grammatical'
}

/**
 * Types de relation dans le système spécialisé
 */
export enum RelationshipType {
  CONTAINS = 'contains',
  OVERLAPS = 'overlaps',
  ADJACENT = 'adjacent',
  DISTANT = 'distant',
  DERIVED_FROM = 'derived_from'
}

/**
 * Erreur de structure spatiale
 */
export class SpatialStructureError extends Error {
  code: string;
  details: Record<string, unknown> | undefined;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'SpatialStructureError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Zone dans le système spatial
 */
export interface Zone {
  id: string;
  type: ZoneType;
  center: Point3D;
  radius?: number;
  vertices?: Point3D[];
  metadata?: Record<string, unknown>;
}

/**
 * Relation spatiale entre zones
 */
export interface SpatialZoneRelationship {
  sourceZone: string;
  targetZone: string;
  type: RelationshipType;
  intensity: number; // 0-1
}

/**
 * Structure spatiale simplifiée
 */
export interface SpecializedSpatialStructure {
  zones: Zone[];
  relationships: SpatialZoneRelationship[];
  defaults: {
    defaultZone: string;
    neutralPoint: Point3D;
  };
}

/**
 * Modification spatiale
 */
export interface SpatialModification {
  targetZone: string;
  operation: 'expand' | 'contract' | 'move' | 'rotate' | 'distort';
  parameters: SpatialModificationParameters;
}

/**
 * Paramètres de modification spatiale
 */
export interface SpatialModificationParameters {
  factor?: number;
  direction?: Point3D;
  angle?: number;
  [key: string]: unknown;
}

/**
 * Contexte spatial spécialisé
 */
export interface SpecializedSpatialContext {
  baseStructure: SpecializedSpatialStructure;
  modifications: SpatialModification[];
  activeZones: string[];
  previousReferences?: {
    zone: string;
    importance: number; // 0-1
    time: number; // timestamp
  }[];
}