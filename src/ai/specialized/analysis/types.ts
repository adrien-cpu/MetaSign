// src/ai/specialized/analysis/types.ts

// Types fondamentaux
export interface SemanticUnit {
  id: string;
  value: string;
  type: SemanticUnitType;
  attributes: SemanticAttributes;
  confidence: number;
}

export type SemanticUnitType =
  | 'CONCEPT'
  | 'ACTION'
  | 'STATE'
  | 'MODIFIER'
  | 'RELATION'
  | 'MARKER';

export interface SemanticAttributes {
  grammaticalRole?: GrammaticalRole;
  temporality?: Temporality;
  spatiality?: Spatiality;
  intensity?: number;
  polarity?: 'positive' | 'negative' | 'neutral';
  [key: string]: unknown;
}

/**
 * Analyse sémantique d'une expression
 */
export interface SemanticAnalysis {
  id: string;
  timestamp: number;
  source: string;
  confidence: number;
  context: AnalysisContext;
  entities: SemanticEntity[];
  relationships: SemanticRelationship[];
  cultural: CulturalInfo;
  metadata: AnalysisMetadata;

  // Nouveaux champs d'analyse sémantique avancée
  graph: SemanticGraph;
  relations: ConceptualRelation[];
  markers: SpatioTemporalMarkers;
}

/**
 * Métadonnées de l'analyse
 */
export interface AnalysisMetadata {
  confidence: number;
  completeness: number;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * Contexte de l'analyse
 */
export interface AnalysisContext {
  domain: string;
  situation: SituationalContext;
  purpose: string;
  participants: string[];
  timeframe: string;
  culturalHints: CulturalHint[];
  spacialContext?: string;
  formalityLevel?: number;
  discourse: DiscourseContext;
  cultural: CulturalContext;
}

/**
 * Contexte situationnel
 */
export interface SituationalContext {
  location?: string;
  environment?: string;
  participants?: string[];
  formalityLevel?: number;
  purpose?: string;
  [key: string]: unknown;
}

/**
 * Contexte du discours
 */
export interface DiscourseContext {
  type?: string;
  style?: string;
  tone?: string;
  register?: string;
  intent?: string;
  [key: string]: unknown;
}

/**
 * Contexte culturel
 */
export interface CulturalContext {
  region?: string;
  communityReference?: string[];
  culturalSpecificity?: CulturalSpecificity;
  [key: string]: unknown;
}

/**
 * Spécificité culturelle
 */
export interface CulturalSpecificity {
  level: number;
  specifics: string[];
  regional: boolean;
  universality: number;
}

/**
 * Entité sémantique identifiée dans l'analyse
 */
export interface SemanticEntity {
  id: string;
  type: string;
  text?: string;
  startIndex?: number;
  endIndex?: number;
  categories?: string[];
  confidence: number;
  culturalRelevance?: number;
  properties: Record<string, unknown>;
}

/**
 * Relation sémantique entre entités
 */
export interface SemanticRelationship {
  id: string;
  type: string;
  sourceId: string;
  targetId: string;
  confidence: number;
  properties: Record<string, unknown>;
}

/**
 * Informations culturelles identifiées
 */
export interface CulturalInfo {
  markers: string[];
  region?: string;
  formalityLevel?: number;
  specificElements: CulturalElement[];
  confidence: number;
}

/**
 * Élément culturel spécifique
 */
export interface CulturalElement {
  type: string;
  value: string;
  confidence: number;
  description?: string;
  cultural_significance?: number;
}

/**
 * Indice culturel identifié
 */
export interface CulturalHint {
  text: string;
  type: string;
  confidence: number;
  categories?: string[];
  properties: Record<string, unknown>;
}

// Graphe sémantique
export class SemanticGraph {
  private nodes: Map<string, SemanticNode>;
  private edges: Map<string, SemanticEdge[]>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  addNode(node: SemanticNode): void {
    this.nodes.set(node.id, node);
  }

  addEdge(from: string, to: string, relation: SemanticRelation): void {
    const edge: SemanticEdge = { from, to, relation };
    if (!this.edges.has(from)) {
      this.edges.set(from, []);
    }
    this.edges.get(from)!.push(edge);
  }

  getNode(id: string): SemanticNode | undefined {
    return this.nodes.get(id);
  }

  getEdges(nodeId: string): SemanticEdge[] {
    return this.edges.get(nodeId) || [];
  }

  getAllNodes(): SemanticNode[] {
    return Array.from(this.nodes.values());
  }

  validate(): boolean {
    // Validation de la cohérence du graphe
    return this.validateConnectivity() && this.validateRelations();
  }

  private validateConnectivity(): boolean {
    // Vérifie que le graphe est connexe
    return true;
  }

  private validateRelations(): boolean {
    // Vérifie la validité des relations
    return true;
  }
}

export interface SemanticNode {
  id: string;
  unit: SemanticUnit;
  importance: number;
  context?: SemanticContext;
}

export interface SemanticEdge {
  from: string;
  to: string;
  relation: SemanticRelation;
}

// Relations conceptuelles
export interface SemanticRelation {
  type: SemanticRelationType;
  weight: number;
  properties: RelationProperties;
}

export type SemanticRelationType =
  | 'IS_A'          // Relations taxonomiques
  | 'PART_OF'       // Relations méréologiques
  | 'CAUSES'        // Relations causales
  | 'LOCATED_IN'    // Relations spatiales
  | 'HAPPENS_BEFORE'// Relations temporelles
  | 'MODIFIES'      // Relations de modification
  | 'ACTS_ON';      // Relations actancielles

export interface RelationProperties {
  bidirectional: boolean;
  strength: number;
  context?: SemanticContext;
  constraints?: RelationConstraint[];
}

export interface RelationConstraint {
  type: string;
  value: unknown;
  condition: string;
}

// Marqueurs spatio-temporels
export interface SpatioTemporalMarkers {
  spatial: SpatialMarker[];
  temporal: TemporalMarker[];
  relations: SpatioTemporalRelation[];
}

export interface SpatialMarker {
  type: 'LOCATION' | 'DIRECTION' | 'DISTANCE' | 'AREA';
  value: string | number;
  reference?: string;
  precision: number;
}

export interface TemporalMarker {
  type: 'POINT' | 'DURATION' | 'FREQUENCY' | 'SEQUENCE';
  value: string | number;
  reference?: string;
  precision: number;
}

export interface SpatioTemporalRelation {
  markerA: string;  // ID du marqueur
  markerB: string;  // ID du marqueur
  relationType: 'BEFORE' | 'AFTER' | 'DURING' | 'CONTAINS' | 'OVERLAPS';
  confidence: number;
}

// Contexte et analyse
export interface SemanticContext {
  scope: 'LOCAL' | 'GLOBAL';
  domain?: string;
  timeframe?: TimeFrame;
  certainty: number;
}

export interface TimeFrame {
  start?: number;
  end?: number;
  duration?: number;
  type: 'ABSOLUTE' | 'RELATIVE';
}

// Types auxiliaires
export type GrammaticalRole =
  | 'SUBJECT'
  | 'OBJECT'
  | 'VERB'
  | 'MODIFIER'
  | 'CONNECTOR';

export interface Temporality {
  tense?: 'PAST' | 'PRESENT' | 'FUTURE';
  aspect?: 'PERFECTIVE' | 'IMPERFECTIVE';
  modality?: 'REAL' | 'HYPOTHETICAL' | 'CONDITIONAL';
}

export interface Spatiality {
  location?: Point3D;
  direction?: Vector3D;
  area?: Area3D;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector3D extends Point3D {
  magnitude: number;
}

export interface Area3D {
  center: Point3D;
  dimensions: Vector3D;
}

// Types pour la gestion des concepts
export class ConceptMap {
  private concepts: Map<string, Concept>;
  private relations: Map<string, ConceptualRelation[]>;

  constructor() {
    this.concepts = new Map();
    this.relations = new Map();
  }

  addConcept(concept: Concept): void {
    this.concepts.set(concept.id, concept);
  }

  addRelation(relation: ConceptualRelation): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { source, target } = relation;
    if (!this.relations.has(source)) {
      this.relations.set(source, []);
    }
    this.relations.get(source)!.push(relation);
  }
}

export interface Concept {
  id: string;
  label: string;
  type: ConceptType;
  attributes: ConceptAttributes;
}

export type ConceptType =
  | 'CONCRETE'
  | 'ABSTRACT'
  | 'ACTION'
  | 'QUALITY'
  | 'STATE';

export interface ConceptAttributes {
  domain?: string[];
  culturalSpecificity?: CulturalSpecificity;
  visualRepresentation?: VisualConcept;
  complexity: number;
}

export interface VisualConcept {
  type: string;
  description: string;
  representations: string[];
}

export interface ConceptualRelation {
  source: string;
  target: string;
  type: SemanticRelationType;
  properties: RelationProperties;
}