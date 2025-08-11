// src/ai/specialized/spatial/SpatialStructureManager.ts

import { ISpatialStructureManager } from '@spatial/types/interfaces/SpatialInterfaces';
import { SpatialAnalyzer } from './analyzers/SpatialAnalyzer';
import {
  MultiLevelCache,
  CacheLevel,
  EvictionPolicy,
  PreloadStrategy
} from '@spatial/cache';
import {
  CulturalContext,
  LSFInput,
  SpatialAnalysis,
  SpatialStructure,
  SpatialStructureError,
  SpatialZone,
  Proforme,
  SpatialComponent,
  SpatialRelation,
  SpatialComponentType,
  SpatialRelationType
} from './types';

/**
 * Gestionnaire de structures spatiales spécialisé pour la LSF
 * Implémente l'interface ISpatialStructureManager
 */
export class SpatialStructureManager implements ISpatialStructureManager {
  private analyzer: SpatialAnalyzer;
  private cache: MultiLevelCache<SpatialStructure | SpatialAnalysis>;

  /**
   * Construit un gestionnaire de structures spatiales
   */
  constructor() {
    this.analyzer = new SpatialAnalyzer();

    // Initialiser le cache pour optimiser les performances
    this.cache = new MultiLevelCache({
      levels: {
        l1: {
          maxSize: 100,
          evictionPolicy: EvictionPolicy.LRU,
          ttl: 60000 // 1 minute
        },
        l2: {
          maxSize: 500,
          evictionPolicy: EvictionPolicy.LFU,
          ttl: 300000 // 5 minutes
        },
        predictive: {
          maxSize: 200,
          evictionPolicy: EvictionPolicy.ADAPTIVE,
          ttl: 600000, // 10 minutes
          preloadStrategy: PreloadStrategy.PATTERN
        }
      },
      metrics: {
        enabled: true,
        detailedStats: true
      }
    });
  }

  /**
   * Génère une structure spatiale à partir d'un contexte culturel
   * @param context Contexte culturel
   * @returns Structure spatiale générée
   */
  public async generateSpatialStructure(context: CulturalContext): Promise<SpatialStructure> {
    // Clé de cache
    const cacheKey = `structure_${context.region}_${context.formalityLevel}_${context.context || 'default'}`;

    // Vérifier si la structure est déjà en cache
    const cachedStructure = this.cache.get(cacheKey) as SpatialStructure | undefined;
    if (cachedStructure) {
      return cachedStructure;
    }

    try {
      const now = Date.now();

      // Générer les zones spatiales
      const zones = await this.generateSpatialZones(context);

      // Générer les proformes
      const proformes = await this.generateProformes(context);

      // Générer les composants
      const components = await this.generateComponents(context, zones, proformes);

      // Générer les relations
      const relations = this.generateRelations(components);

      // Créer la structure complète
      const structure: SpatialStructure = {
        id: `structure_${now}_${Math.random().toString(36).substring(2, 9)}`,
        zones,
        proformes,
        components,
        relations,
        layout: {
          version: '1.0',
          optimizationLevel: 'standard'
        },
        metadata: {
          createdAt: now,
          culturalContext: context,
          coherenceScore: 0.9, // Valeur exemple
          complexityScore: 0.7, // Valeur exemple
          optimizationLevel: 0.8, // Valeur exemple
          statistics: {
            zoneCount: zones.length,
            proformeCount: proformes.length,
            componentCount: components.length,
            relationCount: relations.length
          }
        }
      };

      // Mettre en cache pour accès futurs
      this.cache.set(cacheKey, structure, CacheLevel.L2);

      return structure;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new SpatialStructureError(
        `Failed to generate spatial structure: ${errorMessage}`,
        'GENERATION_ERROR'
      );
    }
  }

  /**
   * Analyse une structure spatiale à partir d'une entrée LSF
   * @param input Entrée LSF à analyser
   * @returns Analyse spatiale
   */
  public async analyzeSpatialStructure(input: LSFInput): Promise<SpatialAnalysis> {
    // Clé de cache
    const inputHash = this.hashInput(input);
    const cacheKey = `analysis_${inputHash}`;

    // Vérifier si l'analyse est déjà en cache
    const cachedAnalysis = this.cache.get(cacheKey) as SpatialAnalysis | undefined;
    if (cachedAnalysis) {
      return cachedAnalysis;
    }

    try {
      // Utiliser l'analyseur pour traiter l'entrée
      const analysis = await this.analyzer.analyzeLSFInput(input);

      // Mettre en cache pour accès futurs
      this.cache.set(cacheKey, analysis, CacheLevel.L2);

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new SpatialStructureError(
        `Failed to analyze spatial structure: ${errorMessage}`,
        'ANALYSIS_ERROR'
      );
    }
  }

  /**
   * Valide la cohérence d'une structure spatiale
   * @param structure Structure spatiale à valider
   * @returns Résultat de la validation
   */
  public async validateSpatialStructure(structure: SpatialStructure): Promise<{
    isValid: boolean;
    issues: string[];
    score: number;
  }> {
    try {
      // Valider les zones
      const zoneIssues = this.validateZones(structure.zones);

      // Valider les proformes
      const proformeIssues = this.validateProformes(structure.proformes);

      // Valider les composants
      const componentIssues = this.validateComponents(structure.components);

      // Valider les relations
      const relationIssues = this.validateRelations(structure.relations, structure.components);

      // Combiner les problèmes
      const allIssues = [
        ...zoneIssues,
        ...proformeIssues,
        ...componentIssues,
        ...relationIssues
      ];

      // Calculer un score de validation
      const maxIssues = structure.zones.length + structure.proformes.length +
        structure.components.length + structure.relations.length;
      const score = maxIssues > 0 ? Math.max(0, 1 - (allIssues.length / maxIssues)) : 1;

      return {
        isValid: allIssues.length === 0,
        issues: allIssues,
        score
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new SpatialStructureError(
        `Failed to validate spatial structure: ${errorMessage}`,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Génère des zones spatiales basées sur le contexte culturel
   * @param _context Contexte culturel
   * @returns Zones spatiales générées
   */
  private async generateSpatialZones(_context: CulturalContext): Promise<SpatialZone[]> {
    // Implémentation d'exemple : créer des zones standard
    const zones: SpatialZone[] = [];

    // Zone principale (au centre)
    zones.push({
      id: 'zone_main',
      name: 'Zone principale',
      position: { x: 0, y: 0, z: 0 },
      size: { width: 2, height: 2, depth: 2 },
      type: 'standard',
      components: []
    });

    // Zone de référence (à gauche)
    zones.push({
      id: 'zone_reference',
      name: 'Zone de référence',
      position: { x: -2, y: 0, z: 0 },
      size: { width: 1.5, height: 2, depth: 1.5 },
      type: 'reference',
      components: []
    });

    // Zone descriptive (à droite) - noter le type corrigé
    zones.push({
      id: 'zone_descriptive',
      name: 'Zone descriptive',
      position: { x: 2, y: 0, z: 0 },
      size: { width: 1.5, height: 2, depth: 1.5 },
      type: 'standard', // Modifié de 'descriptive' à 'standard' pour correspondre aux types acceptés
      components: []
    });

    // Zone focus (en avant)
    zones.push({
      id: 'zone_focus',
      name: 'Zone focus',
      position: { x: 0, y: 0, z: 1.5 },
      size: { width: 1, height: 1, depth: 1 },
      type: 'focus',
      components: []
    });

    return zones;
  }

  /**
   * Génère des proformes (configurations manuelles) basées sur le contexte
   * @param _context Contexte culturel
   * @returns Proformes générées
   */
  private async generateProformes(_context: CulturalContext): Promise<Proforme[]> {
    // Implémentation d'exemple : créer des proformes standard
    const proformes: Proforme[] = [];

    // Proforme "index"
    proformes.push({
      id: 'proforme_index',
      name: 'Index',
      handshape: 'index_extended',
      orientation: {
        palm: 'down',
        fingers: 'forward'
      },
      associatedConcepts: ['pointer', 'personne', 'direction'],
      properties: {
        usage: 'common',
        difficulty: 'easy',
        priority: 'high'
      }
    });

    // Proforme "main plate"
    proformes.push({
      id: 'proforme_flat',
      name: 'Main plate',
      handshape: 'flat_hand',
      orientation: {
        palm: 'down',
        fingers: 'forward'
      },
      associatedConcepts: ['surface', 'livre', 'table'],
      properties: {
        usage: 'common',
        difficulty: 'easy',
        priority: 'medium'
      }
    });

    // Proforme "pince"
    proformes.push({
      id: 'proforme_pincer',
      name: 'Pince',
      handshape: 'pincer',
      orientation: {
        palm: 'in',
        fingers: 'up'
      },
      associatedConcepts: ['petit objet', 'précision', 'manipulation'],
      properties: {
        usage: 'specific',
        difficulty: 'medium',
        priority: 'medium'
      }
    });

    return proformes;
  }

  /**
   * Génère des composants spatiaux basés sur le contexte et les zones
   * @param context Contexte culturel
   * @param zones Zones spatiales
   * @param proformes Proformes disponibles
   * @returns Composants générés
   */
  private async generateComponents(
    context: CulturalContext,
    zones: SpatialZone[],
    proformes: Proforme[]
  ): Promise<SpatialComponent[]> {
    // Implémentation d'exemple : créer des composants dans les différentes zones
    const components: SpatialComponent[] = [];

    // Composant "sujet" dans la zone de référence
    const subjectZone = zones.find(z => z.id === 'zone_reference');
    if (subjectZone) {
      components.push({
        id: 'comp_subject',
        type: SpatialComponentType.ZONE,
        position: { ...subjectZone.position },
        properties: {
          name: 'Sujet',
          grammaticalRole: 'subject',
          importance: 0.9,
          zone: subjectZone.id
        }
      });

      // Ajouter le composant à la zone
      subjectZone.components.push('comp_subject');
    }

    // Composant "action" dans la zone principale
    const mainZone = zones.find(z => z.id === 'zone_main');
    if (mainZone) {
      components.push({
        id: 'comp_action',
        type: SpatialComponentType.MOVEMENT,
        position: { ...mainZone.position },
        properties: {
          name: 'Action',
          grammaticalRole: 'verb',
          importance: 0.8,
          zone: mainZone.id
        }
      });

      // Ajouter le composant à la zone
      mainZone.components.push('comp_action');
    }

    // Composant "objet" dans la zone descriptive
    const objectZone = zones.find(z => z.id === 'zone_descriptive');
    if (objectZone) {
      components.push({
        id: 'comp_object',
        type: SpatialComponentType.ZONE,
        position: { ...objectZone.position },
        properties: {
          name: 'Objet',
          grammaticalRole: 'object',
          importance: 0.7,
          zone: objectZone.id
        }
      });

      // Ajouter le composant à la zone
      objectZone.components.push('comp_object');
    }

    // Composant "regard" associé à l'action
    if (mainZone) {
      components.push({
        id: 'comp_gaze',
        type: SpatialComponentType.GAZE,
        position: { ...mainZone.position, y: mainZone.position.y + 0.5 },
        properties: {
          name: 'Regard',
          target: 'comp_object',
          importance: 0.6,
          zone: mainZone.id
        }
      });

      // Ajouter le composant à la zone
      mainZone.components.push('comp_gaze');
    }

    // Composant "proforme" pour l'objet
    if (objectZone) {
      const objectProforme = proformes.find(p => p.name === 'Main plate');
      if (objectProforme) {
        components.push({
          id: 'comp_proforme',
          type: SpatialComponentType.PROFORME,
          position: { ...objectZone.position, y: objectZone.position.y - 0.3 },
          properties: {
            name: 'Proforme objet',
            proformeId: objectProforme.id,
            importance: 0.7,
            zone: objectZone.id
          }
        });

        // Ajouter le composant à la zone
        objectZone.components.push('comp_proforme');
      }
    }

    return components;
  }

  /**
   * Génère des relations entre les composants
   * @param components Composants spatiaux
   * @returns Relations générées
   */
  private generateRelations(components: SpatialComponent[]): SpatialRelation[] {
    const relations: SpatialRelation[] = [];

    // Relation sujet -> action
    const subject = components.find(c => c.id === 'comp_subject');
    const action = components.find(c => c.id === 'comp_action');

    if (subject && action) {
      relations.push({
        id: 'rel_subject_action',
        sourceId: subject.id,
        targetId: action.id,
        type: SpatialRelationType.SEMANTIC,
        strength: 0.9,
        properties: {
          name: 'Sujet-Action',
          type: 'grammatical',
          importance: 'high'
        }
      });
    }

    // Relation action -> objet
    const object = components.find(c => c.id === 'comp_object');

    if (action && object) {
      relations.push({
        id: 'rel_action_object',
        sourceId: action.id,
        targetId: object.id,
        type: SpatialRelationType.SEMANTIC,
        strength: 0.8,
        properties: {
          name: 'Action-Objet',
          type: 'grammatical',
          importance: 'high'
        }
      });
    }

    // Relation regard -> objet
    const gaze = components.find(c => c.id === 'comp_gaze');

    if (gaze && object) {
      relations.push({
        id: 'rel_gaze_object',
        sourceId: gaze.id,
        targetId: object.id,
        type: SpatialRelationType.SPATIAL,
        strength: 0.7,
        properties: {
          name: 'Regard-Objet',
          type: 'directional',
          importance: 'medium'
        }
      });
    }

    // Relation objet -> proforme
    const proforme = components.find(c => c.id === 'comp_proforme');

    if (object && proforme) {
      relations.push({
        id: 'rel_object_proforme',
        sourceId: object.id,
        targetId: proforme.id,
        type: SpatialRelationType.STRUCTURAL,
        strength: 0.9,
        properties: {
          name: 'Objet-Proforme',
          type: 'representational',
          importance: 'high'
        }
      });
    }

    return relations;
  }

  /**
   * Valide les zones spatiales
   * @param zones Zones à valider
   * @returns Problèmes détectés
   */
  private validateZones(zones: SpatialZone[]): string[] {
    const issues: string[] = [];

    // Vérifier que chaque zone a un ID
    zones.forEach((zone, index) => {
      if (!zone.id) {
        issues.push(`Zone at index ${index} has no ID`);
      }

      // Vérifier que les zones ont des positions
      if (!zone.position) {
        issues.push(`Zone "${zone.id || index}" has no position`);
      }

      // Vérifier que les tailles sont valides
      if (!zone.size || zone.size.width <= 0 || zone.size.height <= 0 || zone.size.depth <= 0) {
        issues.push(`Zone "${zone.id || index}" has invalid size`);
      }
    });

    // Vérifier les chevauchements
    for (let i = 0; i < zones.length; i++) {
      const zone1 = zones[i];
      for (let j = i + 1; j < zones.length; j++) {
        const zone2 = zones[j];

        if (this.checkZoneOverlap(zone1, zone2)) {
          issues.push(`Zones "${zone1.id}" and "${zone2.id}" overlap significantly`);
        }
      }
    }

    return issues;
  }

  /**
   * Vérifie si deux zones se chevauchent
   * @param zone1 Première zone
   * @param zone2 Seconde zone
   * @returns true si les zones se chevauchent
   */
  private checkZoneOverlap(zone1: SpatialZone, zone2: SpatialZone): boolean {
    // Calcul simplifié des distances
    const dx = Math.abs(zone1.position.x - zone2.position.x);
    const dy = Math.abs(zone1.position.y - zone2.position.y);
    const dz = Math.abs(zone1.position.z - zone2.position.z);

    // Demi-dimensions
    const size1 = zone1.size;
    const size2 = zone2.size;

    const overlapX = dx < (size1.width / 2 + size2.width / 2) * 0.7;
    const overlapY = dy < (size1.height / 2 + size2.height / 2) * 0.7;
    const overlapZ = dz < (size1.depth / 2 + size2.depth / 2) * 0.7;

    return overlapX && overlapY && overlapZ;
  }

  /**
   * Valide les proformes
   * @param proformes Proformes à valider
   * @returns Problèmes détectés
   */
  private validateProformes(proformes: Proforme[]): string[] {
    const issues: string[] = [];

    // Vérifier que chaque proforme a un ID
    proformes.forEach((proforme, index) => {
      if (!proforme.id) {
        issues.push(`Proforme at index ${index} has no ID`);
      }

      // Vérifier que les proformes ont des noms
      if (!proforme.name) {
        issues.push(`Proforme "${proforme.id || index}" has no name`);
      }

      // Vérifier que les formes de main sont définies
      if (!proforme.handshape) {
        issues.push(`Proforme "${proforme.id || index}" has no handshape`);
      }

      // Vérifier que l'orientation est complète
      if (!proforme.orientation || !proforme.orientation.palm || !proforme.orientation.fingers) {
        issues.push(`Proforme "${proforme.id || index}" has incomplete orientation`);
      }
    });

    return issues;
  }

  /**
   * Valide les composants spatiaux
   * @param components Composants à valider
   * @returns Problèmes détectés
   */
  private validateComponents(components: SpatialComponent[]): string[] {
    const issues: string[] = [];

    // Vérifier que chaque composant a un ID
    components.forEach((comp, index) => {
      if (!comp.id) {
        issues.push(`Component at index ${index} has no ID`);
      }

      // Vérifier que les composants ont un type
      if (!comp.type) {
        issues.push(`Component "${comp.id || index}" has no type`);
      }

      // Vérifier que les propriétés ne sont pas vides
      if (!comp.properties || Object.keys(comp.properties).length === 0) {
        issues.push(`Component "${comp.id || index}" has no properties`);
      }
    });

    return issues;
  }

  /**
   * Valide les relations spatiales
   * @param relations Relations à valider
   * @param components Composants existants
   * @returns Problèmes détectés
   */
  private validateRelations(relations: SpatialRelation[], components: SpatialComponent[]): string[] {
    const issues: string[] = [];
    const componentIds = new Set(components.map(c => c.id));

    // Vérifier que chaque relation a un ID
    relations.forEach((relation, index) => {
      if (!relation.id) {
        issues.push(`Relation at index ${index} has no ID`);
      }

      // Vérifier que les relations référencent des composants existants
      if (!componentIds.has(relation.sourceId)) {
        issues.push(`Relation "${relation.id || index}" references non-existent source component "${relation.sourceId}"`);
      }

      if (!componentIds.has(relation.targetId)) {
        issues.push(`Relation "${relation.id || index}" references non-existent target component "${relation.targetId}"`);
      }

      // Vérifier que le type de relation est valide
      if (!relation.type) {
        issues.push(`Relation "${relation.id || index}" has no type`);
      }

      // Vérifier que la force est entre 0 et 1
      if (relation.strength < 0 || relation.strength > 1) {
        issues.push(`Relation "${relation.id || index}" has invalid strength ${relation.strength} (must be between 0 and 1)`);
      }
    });

    return issues;
  }

  /**
   * Crée un hash simple pour une entrée LSF
   * @param input Entrée LSF
   * @returns Hash de l'entrée
   */
  private hashInput(input: LSFInput): string {
    // Conversion simplifiée pour un identifiant de cache
    let inputStr = `type:${input.type}`;

    if (typeof input.data === 'string') {
      inputStr += `;data:${input.data}`;
    } else {
      inputStr += `;data:${JSON.stringify(input.data).substring(0, 100)}`;
    }

    if (input.culturalContext) {
      inputStr += `;region:${input.culturalContext.region};level:${input.culturalContext.formalityLevel}`;
    }

    // Hash simple - remplacer par une fonction de hachage cryptographique si nécessaire
    let hash = 0;
    for (let i = 0; i < inputStr.length; i++) {
      const char = inputStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en entier 32 bits
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * Récupère des statistiques sur le cache
   * @returns Statistiques du cache
   */
  public getCacheStats(): Record<string, unknown> {
    // Convertir les statistiques de cache en Record<string, unknown>
    const stats = this.cache.getStats();
    return { ...stats } as Record<string, unknown>;
  }

  /**
   * Vide le cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}