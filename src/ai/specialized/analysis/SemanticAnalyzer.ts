/**
 * @file src/ai/specialized/analysis/SemanticAnalyzer.ts
 * @description Analyseur sémantique avancé pour la LSF et la traduction multimodale
 * @module ai/specialized/analysis
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

// Types et interfaces pour l'analyse sémantique
/**
 * Structure sémantique d'une expression LSF
 */
export interface SemanticStructure {
  readonly nodes: SemanticNode[];
  readonly relations: ConceptualRelation[];
  readonly confidence: number;
  readonly metadata: SemanticMetadata;
}

/**
 * Nœud sémantique dans le graphe conceptuel
 */
export interface SemanticNode {
  readonly id: string;
  readonly concept: string;
  readonly type: 'entity' | 'action' | 'attribute' | 'relation';
  readonly confidence: number;
  readonly spatialMarkers?: SpatialMarker[];
  readonly temporalMarkers?: TemporalMarker[];
}

/**
 * Graphe sémantique représentant les relations conceptuelles
 */
export class SemanticGraph {
  private nodes: Map<string, SemanticNode> = new Map();
  private edges: Map<string, ConceptualRelation[]> = new Map();

  /**
   * Ajoute un nœud au graphe
   */
  addNode(node: SemanticNode): void {
    this.nodes.set(node.id, node);
    if (!this.edges.has(node.id)) {
      this.edges.set(node.id, []);
    }
  }

  /**
   * Récupère tous les nœuds du graphe
   */
  getNodes(): SemanticNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Ajoute une relation entre deux nœuds
   */
  addRelation(fromId: string, toId: string, relation: ConceptualRelation): void {
    if (!this.edges.has(fromId)) {
      this.edges.set(fromId, []);
    }
    
    // Use toId to set the target property of the relation
    const relationWithTarget = {
      ...relation,
      target: toId
    };
    
    this.edges.get(fromId)!.push(relationWithTarget);
  }
}

/**
 * Relation conceptuelle entre entités sémantiques
 */
export interface ConceptualRelation {
  readonly type: 'causal' | 'temporal' | 'spatial' | 'semantic' | 'pragmatic';
  readonly source: string;
  readonly target: string;
  readonly strength: number;
  readonly confidence: number;
}

/**
 * Marqueur spatial dans l'espace de signation
 */
export interface SpatialMarker {
  readonly type: 'location' | 'direction' | 'orientation';
  readonly coordinates: { x: number; y: number; z: number };
  readonly confidence: number;
}

/**
 * Marqueur temporel dans le discours
 */
export interface TemporalMarker {
  readonly type: 'past' | 'present' | 'future' | 'duration' | 'frequency';
  readonly timestamp: number;
  readonly confidence: number;
}

/**
 * Marqueurs spatio-temporels combinés
 */
export interface SpatioTemporalMarkers {
  readonly spatial: SpatialMarker[];
  readonly temporal: TemporalMarker[];
  readonly relations: ConceptualRelation[];
}

/**
 * Unité sémantique élémentaire
 */
export interface SemanticUnit {
  readonly id: string;
  readonly content: string;
  readonly type: 'lexical' | 'grammatical' | 'gestural' | 'spatial';
  readonly semanticAttributes: Record<string, unknown>;
}

/**
 * Résultat de l'analyse sémantique
 */
export interface SemanticAnalysis {
  readonly graph: SemanticGraph;
  readonly relations: ConceptualRelation[];
  readonly markers: SpatioTemporalMarkers;
  readonly context: ContextualInformation;
  readonly metadata: AnalysisMetadata;
}

/**
 * Analyse contextualisée
 */
export interface ContextualizedAnalysis {
  readonly graph: SemanticGraph;
  readonly relations: ConceptualRelation[];
  readonly markers: SpatioTemporalMarkers;
  readonly context: ContextualInformation;
}

/**
 * Informations contextuelles
 */
export interface ContextualInformation {
  readonly discourse: DiscourseContext;
  readonly situational: SituationalContext;
  readonly cultural: CulturalContext;
}

/**
 * Contexte discursif
 */
export interface DiscourseContext {
  readonly topic: string;
  readonly participants: string[];
  readonly register: 'formal' | 'informal' | 'academic' | 'colloquial';
}

/**
 * Contexte situationnel
 */
export interface SituationalContext {
  readonly location: string;
  readonly timeOfDay: string;
  readonly socialSetting: string;
}

/**
 * Contexte culturel
 */
export interface CulturalContext {
  readonly community: 'deaf' | 'hearing' | 'mixed';
  readonly region: string;
  readonly traditions: string[];
  readonly values: Record<string, unknown>;
}

/**
 * Analyse spatiale pour la LSF
 */
export interface SpatialAnalysis {
  readonly handConfiguration: string;
  readonly movement: string;
  readonly location: string;
  readonly orientation: string;
  readonly facialExpression: string;
}

/**
 * Traduction entre langues/modalités
 */
export interface Translation {
  readonly source: string;
  readonly target: string;
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
  readonly confidence: number;
}

/**
 * Métadonnées sémantiques
 */
export interface SemanticMetadata {
  readonly processingTime: number;
  readonly modelVersion: string;
  readonly features: string[];
}

/**
 * Métadonnées d'analyse
 */
export interface AnalysisMetadata {
  readonly confidence: number;
  readonly completeness: number;
  readonly timestamp: number;
}

/**
 * Patron sémantique
 */
export interface SemanticPattern {
  readonly pattern: string;
  readonly type: string;
  readonly confidence: number;
  test(content: string): boolean;
}

/**
 * Carte conceptuelle
 */
export class ConceptMap {
  private concepts: Map<string, ConceptNode> = new Map();
  private relations: Map<string, ConceptualRelation[]> = new Map();

  /**
   * Ajoute un concept à la carte
   */
  addConcept(id: string, concept: ConceptNode): void {
    this.concepts.set(id, concept);
  }

  /**
   * Récupère un concept par son ID
   */
  getConcept(id: string): ConceptNode | undefined {
    return this.concepts.get(id);
  }

  /**
   * Ajoute une relation entre deux concepts
   */
  addRelation(fromId: string, toId: string, relation: ConceptualRelation): void {
    if (!this.relations.has(fromId)) {
      this.relations.set(fromId, []);
    }
    this.relations.get(fromId)!.push({
      ...relation,
      target: toId
    });
  }

  /**
   * Récupère les relations d'un concept
   */
  getRelations(conceptId: string): ConceptualRelation[] {
    return this.relations.get(conceptId) || [];
  }
}

/**
 * Nœud conceptuel dans la carte
 */
export interface ConceptNode {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly properties: Record<string, unknown>;
}

/**
 * Erreur de cohérence sémantique
 */
export class SemanticCoherenceError extends Error {
  constructor(message: string, public context: { score: number; analysis: ContextualizedAnalysis }) {
    super(message);
    this.name = 'SemanticCoherenceError';
  }
}

/**
 * Analyseur sémantique avancé pour la LSF et la traduction multimodale
 * 
 * @class SemanticAnalyzer
 * @description Effectue une analyse sémantique approfondie des expressions LSF et gère la traduction contextuelle
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * @example
 * ```typescript
 * const analyzer = new SemanticAnalyzer();
 * const analysis = await analyzer.analyze("Bonjour, comment allez-vous ?");
 * console.log(`Confiance: ${analysis.metadata.confidence}`);
 * ```
 */
export class SemanticAnalyzer {
  private readonly conceptNetwork: ConceptMap;
  private readonly semanticRules: Map<string, SemanticRule>;
  private readonly contextMemory: ContextualMemory;
  private readonly COHERENCE_THRESHOLD = 0.7;

  /**
   * Constructeur de l'analyseur sémantique
   * 
   * @constructor
   * @description Initialise l'analyseur avec les réseaux conceptuels et les règles sémantiques
   */
  constructor() {
    this.conceptNetwork = new ConceptMap();
    this.semanticRules = this.initializeSemanticRules();
    this.contextMemory = new ContextualMemory();
  }

  /**
   * Analyse sémantique complète d'une entrée textuelle
   * 
   * @param input - Le texte à analyser
   * @returns Promise<SemanticAnalysis> - Analyse sémantique complète avec graphe, relations et marqueurs
   * @throws {SemanticAnalysisError} Erreur lors de l'analyse sémantique
   * 
   * @example
   * ```typescript
   * const analysis = await analyzer.analyze("Le chat mange la souris");
   * console.log(analysis.graph.getNodes().length); // Nombre de nœuds sémantiques
   * ```
   */
  async analyze(input: string): Promise<SemanticAnalysis> {
    try {
      // Décomposition en unités sémantiques
      const semanticUnits = await this.decompose(input);

      // Construction du graphe sémantique
      const semanticGraph = await this.buildSemanticGraph(semanticUnits);

      // Analyse des relations conceptuelles
      const conceptualRelations = await this.analyzeConceptualRelations(semanticGraph);

      // Identification des marqueurs spatiaux-temporels
      const spatioTemporalMarkers = await this.identifySpatioTemporalMarkers(semanticGraph);

      // Application du contexte
      const contextualizedAnalysis = await this.applyContext(
        semanticGraph,
        conceptualRelations,
        spatioTemporalMarkers
      );

      // Validation de la cohérence sémantique
      await this.validateSemanticCoherence(contextualizedAnalysis);

      return this.buildAnalysisResult(contextualizedAnalysis);
    } catch (error) {
      throw new SemanticAnalysisError('Failed to analyze input', error);
    }
  }

  /**
   * Génère une structure sémantique enrichie à partir de l'analyse spatiale et du contexte culturel
   * 
   * @param spatialAnalysis - Analyse spatiale de la LSF
   * @param culturalContext - Contexte culturel pour l'enrichissement
   * @returns Promise<SemanticStructure> - Structure sémantique complète et enrichie
   * 
   * @example
   * ```typescript
   * const structure = await analyzer.generateSemanticStructure(spatialAnalysis, culturalContext);
   * console.log(`Nombre de nœuds: ${structure.nodes.length}`);
   * ```
   */
  async generateSemanticStructure(
    spatialAnalysis: SpatialAnalysis,
    culturalContext: CulturalContext
  ): Promise<SemanticStructure> {
    // Création de la structure sémantique depuis la LSF
    const baseStructure = await this.extractBaseSemanticStructure(spatialAnalysis);
    
    // Enrichissement avec le contexte culturel
    const enrichedStructure = await this.enrichWithCulturalContext(
      baseStructure,
      culturalContext
    );

    // Validation de la structure finale
    await this.validateSemanticStructure(enrichedStructure);

    return enrichedStructure;
  }

  /**
   * Mesure la préservation sémantique dans une traduction
   * 
   * @param translation - Traduction à évaluer
   * @returns Promise<number> - Score de préservation (0-1)
   * 
   * @example
   * ```typescript
   * const score = await analyzer.measurePreservation(translation);
   * console.log(`Préservation: ${(score * 100).toFixed(1)}%`);
   * ```
   */
  async measurePreservation(translation: Translation): Promise<number> {
    const sourceSemantics = await this.analyze(translation.source);
    const targetSemantics = await this.analyze(translation.target);

    return this.calculateSemanticPreservation(sourceSemantics, targetSemantics);
  }

  private async decompose(input: string): Promise<SemanticUnit[]> {
    // Tokenization sémantique avancée
    const tokens = await this.tokenize(input);

    // Identification des unités sémantiques
    const units = await this.identifySemanticUnits(tokens);

    // Enrichissement avec les attributs sémantiques
    return this.enrichWithSemanticAttributes(units);
  }

  private async buildSemanticGraph(units: SemanticUnit[]): Promise<SemanticGraph> {
    const graph = new SemanticGraph();

    // Construction des nœuds
    for (const unit of units) {
      const node = await this.createSemanticNode(unit);
      graph.addNode(node);
    }

    // Établissement des relations
    await this.establishSemanticRelations(graph);

    // Validation de la structure du graphe
    await this.validateGraphStructure(graph);

    return graph;
  }

  private async analyzeConceptualRelations(
    graph: SemanticGraph
  ): Promise<ConceptualRelation[]> {
    const relations: ConceptualRelation[] = [];

    // Analyse des relations directes
    const directRelations = await this.findDirectRelations(graph);
    relations.push(...directRelations);

    // Analyse des relations implicites
    const implicitRelations = await this.inferImplicitRelations(graph);
    relations.push(...implicitRelations);

    // Validation des relations
    await this.validateConceptualRelations(relations);

    return relations;
  }

  private async identifySpatioTemporalMarkers(
    graph: SemanticGraph
  ): Promise<SpatioTemporalMarkers> {
    // Identification des marqueurs spatiaux
    const spatialMarkers = await this.identifySpatialMarkers(graph);

    // Identification des marqueurs temporels
    const temporalMarkers = await this.identifyTemporalMarkers(graph);

    // Analyse des relations spatio-temporelles
    const relations = await this.analyzeSpatioTemporalRelations(
      spatialMarkers,
      temporalMarkers
    );

    return {
      spatial: spatialMarkers,
      temporal: temporalMarkers,
      relations
    };
  }

  private async applyContext(
    graph: SemanticGraph,
    relations: ConceptualRelation[],
    markers: SpatioTemporalMarkers
  ): Promise<ContextualizedAnalysis> {
    // Application du contexte discursif
    const withDiscourseContext = await this.applyDiscourseContext(graph);

    // Application du contexte situationnel
    const withSituationalContext = await this.applySituationalContext(
      withDiscourseContext,
      relations
    );

    // Application du contexte spatio-temporel
    return this.applySpatioTemporalContext(
      withSituationalContext,
      markers
    );
  }

  private async validateSemanticCoherence(
    analysis: ContextualizedAnalysis
  ): Promise<void> {
    const coherenceScore = await this.calculateCoherenceScore(analysis);
    
    if (coherenceScore < this.COHERENCE_THRESHOLD) {
      throw new SemanticCoherenceError(
        'Semantic coherence below threshold',
        { score: coherenceScore, analysis }
      );
    }
  }

  private buildAnalysisResult(
    analysis: ContextualizedAnalysis
  ): SemanticAnalysis {
    return {
      graph: analysis.graph,
      relations: analysis.relations,
      markers: analysis.markers,
      context: analysis.context,
      metadata: {
        confidence: this.calculateConfidence(analysis),
        completeness: this.assessCompleteness(analysis),
        timestamp: Date.now()
      }
    };
  }

  // ===== MÉTHODES PRIVÉES MANQUANTES =====

  /**
   * Initialise les règles sémantiques pour l'analyse
   * 
   * @private
   * @returns {Map<string, SemanticRule>} Map des règles sémantiques
   */
  private initializeSemanticRules(): Map<string, SemanticRule> {
    const rules = new Map<string, SemanticRule>();
    
    // Règle pour les entités
    rules.set('entity', {
      type: 'entity',
      pattern: /\b[A-Z][a-z]+\b/g,
      weight: 1.0,
      apply: async (input: string) => ({ type: 'entity', matches: input.match(/\b[A-Z][a-z]+\b/g) || [] })
    });

    // Règle pour les actions
    rules.set('action', {
      type: 'action',
      pattern: /\b(faire|aller|venir|donner|prendre)\b/gi,
      weight: 0.9,
      apply: async (input: string) => ({ type: 'action', matches: input.match(/\b(faire|aller|venir|donner|prendre)\b/gi) || [] })
    });

    return rules;
  }

  /**
   * Extrait la structure sémantique de base depuis l'analyse spatiale LSF
   * 
   * @private
   * @param {SpatialAnalysis} spatialAnalysis - Analyse spatiale LSF
   * @returns {Promise<SemanticStructure>} Structure sémantique de base
   */
  private async extractBaseSemanticStructure(spatialAnalysis: SpatialAnalysis): Promise<SemanticStructure> {
    const nodes: SemanticNode[] = [];
    
    // Créer des nœuds depuis les composants spatiaux
    if (spatialAnalysis.handConfiguration) {
      nodes.push({
        id: 'hand_config',
        concept: spatialAnalysis.handConfiguration,
        type: 'attribute',
        confidence: 0.8
      });
    }

    if (spatialAnalysis.movement) {
      nodes.push({
        id: 'movement',
        concept: spatialAnalysis.movement,
        type: 'action',
        confidence: 0.9
      });
    }

    return {
      nodes,
      relations: [],
      confidence: 0.75,
      metadata: {
        processingTime: Date.now(),
        modelVersion: '1.0',
        features: ['spatial', 'gestural']
      }
    };
  }

  /**
   * Enrichit la structure avec le contexte culturel
   * 
   * @private
   * @param {SemanticStructure} baseStructure - Structure de base
   * @param {CulturalContext} culturalContext - Contexte culturel
   * @returns {Promise<SemanticStructure>} Structure enrichie
   */
  private async enrichWithCulturalContext(
    baseStructure: SemanticStructure, 
    culturalContext: CulturalContext
  ): Promise<SemanticStructure> {
    // Ajout des concepts spécifiques à la communauté sourde
    const culturalNodes: SemanticNode[] = [];
    
    if (culturalContext.community === 'deaf') {
      culturalNodes.push({
        id: 'cultural_deaf',
        concept: 'deaf_community_marker',
        type: 'attribute',
        confidence: 0.7
      });
    }

    return {
      ...baseStructure,
      nodes: [...baseStructure.nodes, ...culturalNodes],
      confidence: Math.min(1.0, baseStructure.confidence + 0.1)
    };
  }

  /**
   * Valide la structure sémantique
   * 
   * @private
   * @param {SemanticStructure} structure - Structure à valider
   * @returns {Promise<void>}
   */
  private async validateSemanticStructure(structure: SemanticStructure): Promise<void> {
    if (structure.nodes.length === 0) {
      throw new Error('Structure sémantique vide');
    }
    
    if (structure.confidence < 0.5) {
      throw new Error('Confiance de la structure trop faible');
    }
  }

  /**
   * Calcule la préservation sémantique entre deux analyses
   * 
   * @private
   * @param {SemanticAnalysis} source - Analyse source
   * @param {SemanticAnalysis} target - Analyse cible
   * @returns {number} Score de préservation (0-1)
   */
  private calculateSemanticPreservation(source: SemanticAnalysis, target: SemanticAnalysis): number {
    // Comparaison simple basée sur le nombre de nœuds conservés
    const sourceNodes = source.graph.getNodes().length;
    const targetNodes = target.graph.getNodes().length;
    
    if (sourceNodes === 0) return 1.0;
    
    const preservation = Math.min(targetNodes / sourceNodes, 1.0);
    return Math.max(0, preservation);
  }

  /**
   * Tokenise l'entrée en unités lexicales
   * 
   * @private
   * @param {string} input - Texte d'entrée
   * @returns {Promise<string[]>} Tokens
   */
  private async tokenize(input: string): Promise<string[]> {
    // Tokenisation simple par espaces et ponctuation
    return input.toLowerCase()
      .split(/[\s\p{P}]+/u)
      .filter(token => token.length > 0);
  }

  /**
   * Identifie les unités sémantiques depuis les tokens
   * 
   * @private
   * @param {string[]} tokens - Tokens d'entrée
   * @returns {Promise<SemanticUnit[]>} Unités sémantiques
   */
  private async identifySemanticUnits(tokens: string[]): Promise<SemanticUnit[]> {
    return tokens.map((token, index) => ({
      id: `unit_${index}`,
      content: token,
      type: this.classifyToken(token),
      semanticAttributes: { length: token.length, position: index }
    }));
  }

  /**
   * Classifie un token selon son type sémantique
   * 
   * @private
   * @param {string} token - Token à classifier
   * @returns {'lexical' | 'grammatical' | 'gestural' | 'spatial'} Type du token
   */
  private classifyToken(token: string): 'lexical' | 'grammatical' | 'gestural' | 'spatial' {
    // Classification simple
    if (['le', 'la', 'les', 'un', 'une', 'de', 'du', 'des'].includes(token)) {
      return 'grammatical';
    }
    return 'lexical';
  }

  /**
   * Enrichit les unités avec des attributs sémantiques
   * 
   * @private
   * @param {SemanticUnit[]} units - Unités à enrichir
   * @returns {SemanticUnit[]} Unités enrichies
   */
  private enrichWithSemanticAttributes(units: SemanticUnit[]): SemanticUnit[] {
    return units.map(unit => {
      const actionRule = this.semanticRules.get('action');
      let isVerb = false;
      
      if (actionRule?.pattern) {
        isVerb = actionRule.pattern.test(unit.content);
      }
      
      return {
        ...unit,
        semanticAttributes: {
          ...unit.semanticAttributes,
          isNoun: /^[A-Z]/.test(unit.content),
          isVerb
        }
      };
    });
  }

  /**
   * Crée un nœud sémantique depuis une unité
   * 
   * @private
   * @param {SemanticUnit} unit - Unité sémantique
   * @returns {Promise<SemanticNode>} Nœud créé
   */
  private async createSemanticNode(unit: SemanticUnit): Promise<SemanticNode> {
    return {
      id: unit.id,
      concept: unit.content,
      type: this.mapUnitTypeToNodeType(unit.type),
      confidence: 0.8
    };
  }

  /**
   * Mappe le type d'unité vers le type de nœud
   * 
   * @private
   * @param {string} unitType - Type d'unité
   * @returns {'entity' | 'action' | 'attribute' | 'relation'} Type de nœud
   */
  private mapUnitTypeToNodeType(unitType: string): 'entity' | 'action' | 'attribute' | 'relation' {
    switch (unitType) {
      case 'lexical': return 'entity';
      case 'gestural': return 'action';
      case 'spatial': return 'attribute';
      default: return 'relation';
    }
  }

  /**
   * Établit les relations sémantiques dans le graphe
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à enrichir
   * @returns {Promise<void>}
   */
  private async establishSemanticRelations(graph: SemanticGraph): Promise<void> {
    const nodes = graph.getNodes();
    
    // Créer des relations adjacentes simples
    for (let i = 0; i < nodes.length - 1; i++) {
      const relation: ConceptualRelation = {
        type: 'semantic',
        source: nodes[i].id,
        target: nodes[i + 1].id,
        strength: 0.5,
        confidence: 0.6
      };
      
      graph.addRelation(nodes[i].id, nodes[i + 1].id, relation);
    }
  }

  /**
   * Valide la structure du graphe sémantique
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à valider
   * @returns {Promise<void>}
   */
  private async validateGraphStructure(graph: SemanticGraph): Promise<void> {
    const nodes = graph.getNodes();
    if (nodes.length === 0) {
      throw new Error('Graphe sémantique vide');
    }
  }

  /**
   * Trouve les relations directes dans le graphe
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à analyser
   * @returns {Promise<ConceptualRelation[]>} Relations directes
   */
  private async findDirectRelations(graph: SemanticGraph): Promise<ConceptualRelation[]> {
    const relations: ConceptualRelation[] = [];
    const nodes = graph.getNodes();
    
    // Utiliser le concept network pour identifier les relations
    for (let i = 0; i < nodes.length - 1; i++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[i + 1];
      
      // Vérifier si les concepts sont liés dans le réseau
      const sourceConcept = this.conceptNetwork.getConcept(sourceNode.concept);
      if (sourceConcept) {
        relations.push({
          type: 'semantic',
          source: sourceNode.id,
          target: targetNode.id,
          strength: 0.7,
          confidence: 0.8
        });
      }
    }
    
    return relations;
  }

  /**
   * Infère des relations implicites dans le graphe
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à analyser
   * @returns {Promise<ConceptualRelation[]>} Relations implicites
   */
  private async inferImplicitRelations(graph: SemanticGraph): Promise<ConceptualRelation[]> {
    const relations: ConceptualRelation[] = [];
    const nodes = graph.getNodes();
    
    // Inférence simple : relier les entités aux actions
    const entities = nodes.filter(node => node.type === 'entity');
    const actions = nodes.filter(node => node.type === 'action');
    
    entities.forEach(entity => {
      actions.forEach(action => {
        relations.push({
          type: 'causal',
          source: entity.id,
          target: action.id,
          strength: 0.3,
          confidence: 0.5
        });
      });
    });
    
    return relations;
  }

  /**
   * Valide les relations conceptuelles
   * 
   * @private
   * @param {ConceptualRelation[]} relations - Relations à valider
   * @returns {Promise<void>}
   */
  private async validateConceptualRelations(relations: ConceptualRelation[]): Promise<void> {
    for (const relation of relations) {
      if (relation.confidence < 0.3) {
        throw new Error(`Relation avec confiance trop faible: ${relation.confidence}`);
      }
    }
  }

  /**
   * Identifie les marqueurs spatiaux dans le graphe
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à analyser
   * @returns {Promise<SpatialMarker[]>} Marqueurs spatiaux
   */
  private async identifySpatialMarkers(graph: SemanticGraph): Promise<SpatialMarker[]> {
    const markers: SpatialMarker[] = [];
    const nodes = graph.getNodes();
    
    // Identifier les nœuds avec des marqueurs spatiaux
    nodes.forEach((node, index) => {
      if (node.spatialMarkers) {
        markers.push(...node.spatialMarkers);
      } else if (node.type === 'attribute') {
        // Créer un marqueur par défaut pour les attributs spatiaux
        markers.push({
          type: 'location',
          coordinates: { x: index, y: 0, z: 0 },
          confidence: 0.6
        });
      }
    });
    
    return markers;
  }

  /**
   * Identifie les marqueurs temporels dans le graphe
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à analyser
   * @returns {Promise<TemporalMarker[]>} Marqueurs temporels
   */
  private async identifyTemporalMarkers(graph: SemanticGraph): Promise<TemporalMarker[]> {
    const markers: TemporalMarker[] = [];
    const nodes = graph.getNodes();
    
    nodes.forEach((node, index) => {
      if (node.temporalMarkers) {
        markers.push(...node.temporalMarkers);
      } else if (node.type === 'action') {
        // Actions ont généralement des marqueurs temporels
        markers.push({
          type: 'present',
          timestamp: Date.now() + index * 1000,
          confidence: 0.7
        });
      }
    });
    
    return markers;
  }

  /**
   * Analyse les relations spatio-temporelles
   * 
   * @private
   * @param {SpatialMarker[]} spatialMarkers - Marqueurs spatiaux
   * @param {TemporalMarker[]} temporalMarkers - Marqueurs temporels
   * @returns {Promise<ConceptualRelation[]>} Relations spatio-temporelles
   */
  private async analyzeSpatioTemporalRelations(
    spatialMarkers: SpatialMarker[], 
    temporalMarkers: TemporalMarker[]
  ): Promise<ConceptualRelation[]> {
    const relations: ConceptualRelation[] = [];
    
    // Créer des relations entre marqueurs proches
    spatialMarkers.forEach((spatial, i) => {
      if (i < temporalMarkers.length) {
        relations.push({
          type: 'spatial',
          source: `spatial_${i}`,
          target: `temporal_${i}`,
          strength: 0.6,
          confidence: (spatial.confidence + temporalMarkers[i].confidence) / 2
        });
      }
    });
    
    return relations;
  }

  /**
   * Applique le contexte discursif
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à contextualiser
   * @returns {Promise<SemanticGraph>} Graphe avec contexte discursif
   */
  private async applyDiscourseContext(graph: SemanticGraph): Promise<SemanticGraph> {
    // Utiliser la mémoire contextuelle pour enrichir le graphe
    await this.contextMemory.store({
      type: 'discourse',
      graph: graph,
      timestamp: Date.now()
    });
    
    return graph;
  }

  /**
   * Applique le contexte situationnel
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à contextualiser
   * @param {ConceptualRelation[]} relations - Relations existantes
   * @returns {Promise<SemanticGraph>} Graphe avec contexte situationnel
   */
  private async applySituationalContext(
    graph: SemanticGraph, 
    relations: ConceptualRelation[]
  ): Promise<SemanticGraph> {
    // Enrichir avec les relations contextuelles
    relations.forEach(relation => {
      graph.addRelation(relation.source, relation.target, relation);
    });
    
    return graph;
  }

  /**
   * Applique le contexte spatio-temporel
   * 
   * @private
   * @param {SemanticGraph} graph - Graphe à contextualiser
   * @param {SpatioTemporalMarkers} markers - Marqueurs spatio-temporels
   * @returns {ContextualizedAnalysis} Analyse contextualisée
   */
  private applySpatioTemporalContext(
    graph: SemanticGraph, 
    markers: SpatioTemporalMarkers
  ): ContextualizedAnalysis {
    return {
      graph,
      relations: markers.relations,
      markers,
      context: {
        discourse: {
          topic: 'general',
          participants: ['user'],
          register: 'informal'
        },
        situational: {
          location: 'digital',
          timeOfDay: 'now',
          socialSetting: 'conversation'
        },
        cultural: {
          community: 'mixed',
          region: 'france',
          traditions: [],
          values: {}
        }
      }
    };
  }

  /**
   * Calcule le score de cohérence sémantique
   * 
   * @private
   * @param {ContextualizedAnalysis} analysis - Analyse à évaluer
   * @returns {Promise<number>} Score de cohérence (0-1)
   */
  private async calculateCoherenceScore(analysis: ContextualizedAnalysis): Promise<number> {
    const nodeCount = analysis.graph.getNodes().length;
    const relationCount = analysis.relations.length;
    
    if (nodeCount === 0) return 0;
    
    // Score basé sur la densité de relations
    const density = relationCount / Math.max(1, nodeCount * (nodeCount - 1) / 2);
    return Math.min(1, density + 0.5);
  }

  /**
   * Calcule la confiance de l'analyse
   * 
   * @private
   * @param {ContextualizedAnalysis} analysis - Analyse à évaluer
   * @returns {number} Score de confiance (0-1)
   */
  private calculateConfidence(analysis: ContextualizedAnalysis): number {
    const nodes = analysis.graph.getNodes();
    if (nodes.length === 0) return 0;
    
    const avgConfidence = nodes.reduce((sum, node) => sum + node.confidence, 0) / nodes.length;
    return Math.min(1, avgConfidence);
  }

  /**
   * Évalue la complétude de l'analyse
   * 
   * @private
   * @param {ContextualizedAnalysis} analysis - Analyse à évaluer
   * @returns {number} Score de complétude (0-1)
   */
  private assessCompleteness(analysis: ContextualizedAnalysis): number {
    const hasNodes = analysis.graph.getNodes().length > 0;
    const hasRelations = analysis.relations.length > 0;
    const hasMarkers = analysis.markers.spatial.length > 0 || analysis.markers.temporal.length > 0;
    
    let completeness = 0;
    if (hasNodes) completeness += 0.4;
    if (hasRelations) completeness += 0.3;
    if (hasMarkers) completeness += 0.3;
    
    return completeness;
  }
}

// ===== TYPES COMPLÉMENTAIRES =====

/**
 * Règle sémantique pour l'analyse
 */
interface SemanticRule {
  readonly type: string;
  readonly pattern: RegExp | SemanticPattern;
  readonly weight: number;
  apply(input: string): Promise<{ type: string; matches: string[] }>;
}

/**
 * Mémoire contextuelle pour le stockage des contextes
 */
class ContextualMemory {
  private contexts: Map<string, ContextEntry> = new Map();

  /**
   * Stocke un contexte en mémoire
   * 
   * @param {ContextEntry} context - Contexte à stocker
   * @returns {Promise<void>}
   */
  async store(context: ContextEntry): Promise<void> {
    const key = `${context.type}_${context.timestamp}`;
    this.contexts.set(key, context);
  }

  /**
   * Récupère un contexte depuis la mémoire
   * 
   * @param {string} key - Clé du contexte
   * @returns {Promise<ContextEntry | undefined>} Contexte récupéré
   */
  async retrieve(key: string): Promise<ContextEntry | undefined> {
    return this.contexts.get(key);
  }
}

/**
 * Entrée de contexte en mémoire
 */
interface ContextEntry {
  readonly type: string;
  readonly graph?: SemanticGraph;
  readonly timestamp: number;
}

/**
 * Erreur d'analyse sémantique
 */
class SemanticAnalysisError extends Error {
  constructor(message: string, public context: unknown) {
    super(message);
    this.name = 'SemanticAnalysisError';
  }
}