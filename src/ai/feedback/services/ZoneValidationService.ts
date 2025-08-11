// src/ai/feedback/services/ZoneValidationService.ts

// Correction des chemins d'importation avec les alias tsconfig
import {
  ISpatialValidator,
  ZoneDefinition,
  SpatialRelationship,
  Position3D,
  Boundaries,
  ZoneConstraint
} from '@ai/feedback/validators/interfaces/ISpatialValidator';
import { ValidationResult, ValidationIssue } from '@ai/feedback/types/validation';
// Importation de LSFExpression avec le bon chemin
import { LSFExpression } from '@ai/systems/expressions/emotions/types/LSFExpression';
import { ZoneUsage, ZoneValidationOptions } from '@ai/feedback/types/zone-validation';
import { ConstraintValidator } from '@ai/feedback/validators/constraints/ConstraintValidator';

// Interface pour le contexte de position
interface PositionContext {
  handshape?: string;
  movement?: string;
  [key: string]: unknown;
}

// Interface pour la configuration de zone
interface ZoneConfig {
  handshape?: string;
  movement?: string;
  position?: Position3D;
  [key: string]: unknown;
}

// Interface de localisation
interface LocationContext {
  // Définition explicite de LocationContext basée sur les erreurs
  locationId?: string;
  coordinates?: {
    x: number;
    y: number;
    z: number;
  };
  context?: Record<string, unknown>;
}

// Extension des options de validation pour inclure la gestion du cache
interface ExtendedZoneValidationOptions extends ZoneValidationOptions {
  cacheResults?: boolean;
}

/**
 * Service de validation de zones pour la LSF
 * Implémente des fonctionnalités avancées de validation spatiale
 */
export class ZoneValidationService implements ISpatialValidator {
  private zoneDefinitions: ZoneDefinition[];
  private spatialRelationships: SpatialRelationship[];
  private constraintValidator: ConstraintValidator;
  private options: ExtendedZoneValidationOptions;
  private cachedResults: Map<string, ValidationResult>;

  /**
   * Constructeur du service de validation de zones
   * @param zoneDefinitions Définitions des zones à utiliser
   * @param spatialRelationships Relations entre les zones
   * @param options Options de configuration
   */
  constructor(
    zoneDefinitions: ZoneDefinition[],
    spatialRelationships: SpatialRelationship[],
    options: ExtendedZoneValidationOptions = {}
  ) {
    this.zoneDefinitions = zoneDefinitions;
    this.spatialRelationships = spatialRelationships;
    this.constraintValidator = new ConstraintValidator();
    this.cachedResults = new Map<string, ValidationResult>();
    this.options = {
      strictBoundaries: true,
      toleranceThreshold: 0.1,
      validateHandshapes: true,
      validateMovements: true,
      cacheResults: true,
      ...options
    };
  }

  /**
   * Valide une expression LSF par rapport aux zones définies
   * @param expression Expression à valider
   */
  async validate(expression: LSFExpression): Promise<ValidationResult> {
    // Vérifier le cache si activé
    if (this.options.cacheResults && expression.id) {
      const cachedResult = this.cachedResults.get(expression.id);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const issues: ValidationIssue[] = [];

    // Extraction des positions
    const positions = this.extractPositions(expression);

    // Extraction des configurations et mouvements
    const handshapes = this.extractHandshapes(expression);
    const movements = this.extractMovements(expression);

    // Validation des positions par rapport aux zones
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const matchingZone = this.findZoneForPosition(position);

      if (!matchingZone) {
        issues.push({
          type: 'position_outside_zones',
          severity: 'medium',
          description: `Position ${JSON.stringify(position)} does not belong to any defined zone`,
          context: { position }
        });
        continue;
      }

      // Création d'un objet ZoneUsage pour la validation
      const zoneUsage: ZoneUsage = {
        position,
        duration: 200, // Valeur par défaut
        elements: movements.slice(Math.max(0, i - 1), i + 1),
        handshapes: handshapes.slice(Math.max(0, i - 1), i + 1)
      };

      // Validation des contraintes de la zone
      if (this.options.validateHandshapes || this.options.validateMovements) {
        const zoneValidation = await this.constraintValidator.validateZoneUsage(zoneUsage, matchingZone);
        if (!zoneValidation.isValid) {
          issues.push(...zoneValidation.issues);
        }
      }
    }

    // Validation des transitions entre zones
    if (positions.length > 1) {
      let previousZone: ZoneDefinition | null = null;

      for (const position of positions) {
        const currentZone = this.findZoneForPosition(position);

        if (previousZone && currentZone && previousZone.id !== currentZone.id) {
          // Vérification des relations entre zones
          const relationshipValid = this.validateZoneTransition(previousZone, currentZone);
          if (!relationshipValid.isValid) {
            issues.push(...relationshipValid.issues);
          }
        }

        previousZone = currentZone;
      }
    }

    // Création du résultat de validation
    const result: ValidationResult = {
      isValid: issues.length === 0,
      issues,
      score: this.calculateValidationScore(issues),
      metadata: {
        validatedAt: Date.now(),
        validatedBy: 'ZoneValidationService',
        validationContext: {
          expressionId: expression.id || 'unknown',
          timestamp: this.getExpressionTimestamp(expression),
          options: this.options
        }
      }
    };

    // Mise en cache du résultat si activé
    if (this.options.cacheResults && expression.id) {
      this.cachedResults.set(expression.id, result);
    }

    return result;
  }

  /**
   * Vérifie la présence et extrait une propriété de l'objet, avec un accès sécurisé
   * @param obj Objet à vérifier
   * @param path Chemin d'accès à la propriété, séparé par des points
   * @param defaultValue Valeur par défaut si la propriété n'existe pas
   */
  private getProperty<T>(obj: unknown, path: string, defaultValue: T): T {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }

    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }

      // Utiliser la notation d'index pour l'accès aux propriétés
      current = (current as Record<string, unknown>)[part];

      if (current === undefined) {
        return defaultValue;
      }
    }

    return current as T;
  }

  /**
   * Extrait les positions d'une expression LSF
   * @param expression Expression LSF
   */
  private extractPositions(expression: LSFExpression): Position3D[] {
    // Initialiser un tableau vide pour les positions extraites
    const positions: Position3D[] = [];

    try {
      // Utiliser getProperty pour un accès sécurisé aux propriétés
      const elements = this.getProperty<unknown[]>(expression, 'elements', []);
      const positionData = this.getProperty<unknown[]>(expression, 'positionData', []);
      const spatialData = this.getProperty<unknown[]>(expression, 'spatialData', []);
      const features = this.getProperty<unknown[]>(expression, 'features', []);

      // Extraction à partir de positionData
      if (Array.isArray(positionData) && positionData.length > 0) {
        for (const data of positionData) {
          const position = this.extractPosition3D(data);
          if (position) positions.push(position);
        }
      }

      // Extraction à partir de spatialData
      if (Array.isArray(spatialData) && spatialData.length > 0) {
        for (const data of spatialData) {
          const position = this.extractPosition3D(data);
          if (position) positions.push(position);
        }
      }

      // Extraction à partir des éléments
      if (Array.isArray(elements) && elements.length > 0) {
        for (const element of elements) {
          if (element && typeof element === 'object') {
            // Essayer différentes propriétés pour les positions
            let pos: Position3D | null = null;

            // Vérifier pour la propriété position directe
            pos = this.extractPosition3D(element) || pos;

            // Vérifier pour spatial.coordinates
            const spatial = this.getProperty<Record<string, unknown>>(element, 'spatial', {});
            pos = this.extractPosition3D(spatial) || pos;

            // Vérifier pour coord3d
            const coord = this.getProperty<Record<string, unknown>>(element, 'coord3d', {});
            pos = this.extractPosition3D(coord) || pos;

            if (pos) positions.push(pos);
          }
        }
      }

      // Extraction à partir des features
      if (Array.isArray(features) && features.length > 0) {
        for (const feature of features) {
          if (feature && typeof feature === 'object') {
            const featureType = this.getProperty<string>(feature, 'type', '');
            if (featureType === 'spatial') {
              const data = this.getProperty<Record<string, unknown>>(feature, 'data', {});
              const position = this.extractPosition3D(data);
              if (position) positions.push(position);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error extracting positions:", error);
    }

    // Si aucune position n'a été trouvée, retourner une position par défaut pour éviter des erreurs
    if (positions.length === 0) {
      positions.push({ x: 0, y: 0, z: 0 });
    }

    return positions;
  }

  /**
   * Extrait une position 3D d'un objet quelconque
   * @param obj Objet source contenant les données de position
   */
  private extractPosition3D(obj: unknown): Position3D | null {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    // Vérifier différentes structures possibles
    const objRecord = obj as Record<string, unknown>;

    // Cas 1: L'objet contient directement x, y, z
    if ('x' in objRecord && 'y' in objRecord && 'z' in objRecord) {
      const x = objRecord.x;
      const y = objRecord.y;
      const z = objRecord.z;

      if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
        return { x, y, z };
      }

      // Tenter de convertir en nombre
      if (x !== undefined && y !== undefined && z !== undefined) {
        return {
          x: Number(x),
          y: Number(y),
          z: Number(z)
        };
      }
    }

    // Cas 2: Les coordonnées sont dans une propriété coordinates
    if ('coordinates' in objRecord && objRecord.coordinates && typeof objRecord.coordinates === 'object') {
      const coords = objRecord.coordinates as Record<string, unknown>;
      if ('x' in coords && 'y' in coords && 'z' in coords) {
        return {
          x: Number(coords.x),
          y: Number(coords.y),
          z: Number(coords.z)
        };
      }
    }

    // Cas 3: Les coordonnées sont dans une propriété position
    if ('position' in objRecord && objRecord.position && typeof objRecord.position === 'object') {
      const position = objRecord.position as Record<string, unknown>;
      if ('x' in position && 'y' in position && 'z' in position) {
        return {
          x: Number(position.x),
          y: Number(position.y),
          z: Number(position.z)
        };
      }
    }

    return null;
  }

  /**
   * Crée un contexte de localisation à partir d'une position
   * @param position Position 3D
   */
  private createLocationContext(position: Position3D): LocationContext {
    return {
      coordinates: {
        x: position.x,
        y: position.y,
        z: position.z
      },
      context: {
        spatial: true,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Extrait les configurations de main d'une expression LSF
   * @param expression Expression LSF
   */
  private extractHandshapes(expression: LSFExpression): string[] {
    // Initialiser un tableau vide pour les formes de main extraites
    const handshapes: string[] = [];

    try {
      // Utiliser getProperty pour un accès sécurisé aux propriétés
      const elements = this.getProperty<unknown[]>(expression, 'elements', []);
      const handshapeData = this.getProperty<unknown[]>(expression, 'handshapes', []);
      const handConfigs = this.getProperty<unknown[]>(expression, 'handConfigurations', []);
      const manualFeatures = this.getProperty<unknown[]>(expression, 'manualFeatures', []);

      // Extraction à partir de handshapes/handConfigurations
      for (const data of [...handshapeData, ...handConfigs]) {
        if (typeof data === 'string') {
          handshapes.push(data);
        } else if (data && typeof data === 'object') {
          const typeValue = this.getProperty<string>(data, 'type', '');
          if (typeValue) {
            handshapes.push(typeValue);
          }
        }
      }

      // Extraction à partir de manualFeatures
      if (Array.isArray(manualFeatures) && manualFeatures.length > 0) {
        for (const feature of manualFeatures) {
          if (feature && typeof feature === 'object') {
            const config = this.getProperty<unknown>(feature, 'configuration', null);
            if (typeof config === 'string') {
              handshapes.push(config);
            } else if (config && typeof config === 'object') {
              const configType = this.getProperty<string>(config, 'type', '');
              if (configType) {
                handshapes.push(configType);
              }
            }
          }
        }
      }

      // Extraction à partir des éléments
      if (Array.isArray(elements) && elements.length > 0) {
        for (const element of elements) {
          if (element && typeof element === 'object') {
            // Vérifier différentes propriétés possibles pour les formes de main
            const possibleProps = ['config', 'handConfig', 'configuration', 'handConfiguration'];

            for (const prop of possibleProps) {
              const value = this.getProperty<unknown>(element, prop, null);
              if (typeof value === 'string' && value) {
                handshapes.push(value);
                break; // Un seul ajout par élément
              }
            }

            // Vérifier dans la propriété manual si elle existe
            const manual = this.getProperty<Record<string, unknown>>(element, 'manual', {});
            if (Object.keys(manual).length > 0) {
              for (const prop of possibleProps) {
                const value = this.getProperty<unknown>(manual, prop, null);
                if (typeof value === 'string' && value) {
                  handshapes.push(value);
                  break; // Un seul ajout par élément
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error extracting handshapes:", error);
    }

    return handshapes;
  }

  /**
   * Extrait les mouvements d'une expression LSF
   * @param expression Expression LSF
   */
  private extractMovements(expression: LSFExpression): string[] {
    // Initialiser un tableau vide pour les mouvements extraits
    const movements: string[] = [];

    try {
      // Utiliser getProperty pour un accès sécurisé aux propriétés
      const elements = this.getProperty<unknown[]>(expression, 'elements', []);
      const movementData = this.getProperty<unknown[]>(expression, 'movements', []);
      const movementSeqs = this.getProperty<unknown[]>(expression, 'movementSequences', []);
      const dynamicFeatures = this.getProperty<unknown[]>(expression, 'dynamicFeatures', []);

      // Extraction à partir de movements/movementSequences
      for (const data of [...movementData, ...movementSeqs]) {
        if (typeof data === 'string') {
          movements.push(data);
        } else if (data && typeof data === 'object') {
          const typeValue = this.getProperty<string>(data, 'type', '');
          if (typeValue) {
            movements.push(typeValue);
          }
        }
      }

      // Extraction à partir de dynamicFeatures
      if (Array.isArray(dynamicFeatures) && dynamicFeatures.length > 0) {
        for (const feature of dynamicFeatures) {
          if (feature && typeof feature === 'object') {
            const move = this.getProperty<unknown>(feature, 'movement', null);
            if (typeof move === 'string') {
              movements.push(move);
            } else if (move && typeof move === 'object') {
              const moveType = this.getProperty<string>(move, 'type', '');
              if (moveType) {
                movements.push(moveType);
              }
            }
          }
        }
      }

      // Extraction à partir des éléments
      if (Array.isArray(elements) && elements.length > 0) {
        for (const element of elements) {
          if (element && typeof element === 'object') {
            // Vérifier différentes propriétés possibles pour les mouvements
            const possibleProps = ['move', 'movement', 'moveType', 'motionType'];

            for (const prop of possibleProps) {
              const value = this.getProperty<unknown>(element, prop, null);
              if (typeof value === 'string' && value) {
                movements.push(value);
                break; // Un seul ajout par élément
              }
            }

            // Vérifier dans la propriété dynamic si elle existe
            const dynamic = this.getProperty<Record<string, unknown>>(element, 'dynamic', {});
            if (Object.keys(dynamic).length > 0) {
              for (const prop of possibleProps) {
                const value = this.getProperty<unknown>(dynamic, prop, null);
                if (typeof value === 'string' && value) {
                  movements.push(value);
                  break; // Un seul ajout par élément
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error extracting movements:", error);
    }

    return movements;
  }

  /**
   * Obtient l'horodatage d'une expression LSF
   * @param expression Expression LSF
   */
  private getExpressionTimestamp(expression: LSFExpression): number {
    let timestamp = Date.now();

    try {
      // Utiliser getProperty pour un accès sécurisé aux propriétés
      const metaTimestamp = this.getProperty<number>(expression, 'metadata.timestamp', 0);
      const metaCreated = this.getProperty<number>(expression, 'metadata.created', 0);
      const metaDate = this.getProperty<number>(expression, 'metadata.date', 0);
      const exprTimestamp = this.getProperty<number>(expression, 'timestamp', 0);

      // Utiliser la première valeur valide trouvée
      if (exprTimestamp > 0) {
        timestamp = exprTimestamp;
      } else if (metaTimestamp > 0) {
        timestamp = metaTimestamp;
      } else if (metaCreated > 0) {
        timestamp = metaCreated;
      } else if (metaDate > 0) {
        timestamp = metaDate;
      }
    } catch (error) {
      console.error("Error extracting timestamp:", error);
    }

    return timestamp;
  }

  /**
   * Vérifie si une position est valide dans un contexte spatial donné
   * @param position Position à vérifier
   * @param context Contexte supplémentaire pour la validation
   */
  isValidPosition(position: Position3D, context?: PositionContext): boolean {
    const matchingZone = this.findZoneForPosition(position);
    if (!matchingZone) return false;

    // Vérification du contexte si fourni
    if (context) {
      // Vérification des formes de main
      if (context.handshape && matchingZone.allowedHandshapes) {
        if (!matchingZone.allowedHandshapes.includes(context.handshape)) {
          return false;
        }
      }

      // Vérification des mouvements
      if (context.movement && matchingZone.allowedMovements) {
        if (!matchingZone.allowedMovements.includes(context.movement)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Vérifie si les zones spécifiées sont compatibles entre elles
   * @param zone1Id ID de la première zone
   * @param zone2Id ID de la deuxième zone
   */
  areZonesCompatible(zone1Id: string, zone2Id: string): boolean {
    // Recherche d'une relation entre les zones
    const relationship = this.spatialRelationships.find(
      rel => (rel.source === zone1Id && rel.target === zone2Id) ||
        (rel.source === zone2Id && rel.target === zone1Id)
    );

    // Si aucune relation n'est définie, vérifier si les zones sont adjacentes
    if (!relationship) {
      const zone1 = this.zoneDefinitions.find(z => z.id === zone1Id);
      const zone2 = this.zoneDefinitions.find(z => z.id === zone2Id);

      if (!zone1 || !zone2) return false;

      return this.areZonesAdjacent(zone1, zone2);
    }

    // Si la relation est du type 'disjoint', les zones ne sont pas compatibles
    if (relationship.type === 'disjoint') return false;

    // Si la relation a des règles de transition
    if (relationship.rules) {
      return relationship.rules.allowedTransitions === true;
    }

    // Par défaut, considérer les zones comme compatibles
    return true;
  }

  /**
   * Obtient les zones valides pour une configuration spécifique
   * @param config Configuration de zone
   */
  getValidZones(config: ZoneConfig): string[] {
    const validZones: string[] = [];

    for (const zone of this.zoneDefinitions) {
      let isValid = true;

      // Vérification des formes de main
      if (config.handshape && zone.allowedHandshapes) {
        if (!zone.allowedHandshapes.includes(config.handshape)) {
          isValid = false;
        }
      }

      // Vérification des mouvements
      if (config.movement && zone.allowedMovements) {
        if (!zone.allowedMovements.includes(config.movement)) {
          isValid = false;
        }
      }

      // Vérification de la position
      if (config.position) {
        if (!this.isWithinBoundaries(config.position, zone.boundaries)) {
          isValid = false;
        }
      }

      if (isValid) {
        validZones.push(zone.id);
      }
    }

    return validZones;
  }

  /**
   * Configure le service avec les paramètres spécifiés
   * @param options Options de configuration
   */
  configure(options: ExtendedZoneValidationOptions): void {
    this.options = {
      ...this.options,
      ...options
    };

    // Vider le cache si les options changent
    if (options.cacheResults === false) {
      this.cachedResults.clear();
    }
  }

  /**
   * Valide une zone par son ID avec les contraintes spécifiées
   * @param zoneId ID de la zone à valider
   * @param constraints Contraintes à appliquer
   * @param expression Expression LSF associée (optionnelle)
   * @returns Résultat de validation
   */
  async validateZone(
    zoneId: string,
    constraints: ZoneConstraint[] = [],
    expression?: LSFExpression
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Trouver la zone par son ID
    const zone = this.zoneDefinitions.find(z => z.id === zoneId);

    if (!zone) {
      return {
        isValid: false,
        issues: [
          {
            type: 'zone_not_found',
            severity: 'high',
            description: `Zone with ID ${zoneId} not found`,
            context: { zoneId }
          }
        ],
        score: 0
      };
    }

    // Vérifier que les limites de la zone sont correctement définies
    if (!zone.boundaries ||
      !Array.isArray(zone.boundaries.x) || zone.boundaries.x.length !== 2 ||
      !Array.isArray(zone.boundaries.y) || zone.boundaries.y.length !== 2 ||
      !Array.isArray(zone.boundaries.z) || zone.boundaries.z.length !== 2) {
      issues.push({
        type: 'invalid_zone_boundaries',
        severity: 'high',
        description: `Zone ${zone.id} has invalid boundaries`,
        context: { zoneId: zone.id }
      });
    }

    // Vérifier que la zone a un nom valide
    if (!zone.name || zone.name.trim() === '') {
      issues.push({
        type: 'invalid_zone_name',
        severity: 'medium',
        description: `Zone ${zone.id} has an invalid name`,
        context: { zoneId: zone.id }
      });
    }

    // Vérifier les contraintes spécifiées
    for (const constraint of constraints) {
      // Vérification des formes de main autorisées
      if (constraint.type === 'handshape' && zone.allowedHandshapes) {
        const constraintValue = String(constraint.value || '');
        if (!zone.allowedHandshapes.includes(constraintValue)) {
          issues.push({
            type: 'handshape_not_allowed',
            severity: 'medium',
            description: `Handshape ${constraintValue} is not allowed in zone ${zone.name}`,
            context: {
              zoneId: zone.id,
              constraintType: constraint.type,
              constraintValue
            }
          });
        }
      }

      // Vérification des mouvements autorisés
      if (constraint.type === 'movement' && zone.allowedMovements) {
        const constraintValue = String(constraint.value || '');
        if (!zone.allowedMovements.includes(constraintValue)) {
          issues.push({
            type: 'movement_not_allowed',
            severity: 'medium',
            description: `Movement ${constraintValue} is not allowed in zone ${zone.name}`,
            context: {
              zoneId: zone.id,
              constraintType: constraint.type,
              constraintValue
            }
          });
        }
      }
    }

    // Validation supplémentaire si une expression est fournie
    if (expression) {
      // Vérifier que les positions de l'expression sont dans la zone
      const positions = this.extractPositions(expression);

      for (const position of positions) {
        if (!this.isWithinBoundaries(position, zone.boundaries)) {
          issues.push({
            type: 'position_outside_zone',
            severity: 'high',
            description: `Position ${JSON.stringify(position)} is outside zone ${zone.name}`,
            context: {
              zoneId: zone.id,
              position
            }
          });
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateValidationScore(issues)
    };
  }

  /**
   * Valide une relation entre zones
   * @param relationship Relation à valider
   */
  async validateRelationship(
    relationship: SpatialRelationship
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Vérifier que les zones source et cible existent
    const sourceZone = this.zoneDefinitions.find(z => z.id === relationship.source);
    const targetZone = this.zoneDefinitions.find(z => z.id === relationship.target);

    if (!sourceZone) {
      issues.push({
        type: 'invalid_source_zone',
        severity: 'high',
        description: `Relationship ${relationship.id || 'unknown'} references non-existent source zone ${relationship.source}`,
        context: { relationshipId: relationship.id, sourceZoneId: relationship.source }
      });
    }

    if (!targetZone) {
      issues.push({
        type: 'invalid_target_zone',
        severity: 'high',
        description: `Relationship ${relationship.id || 'unknown'} references non-existent target zone ${relationship.target}`,
        context: { relationshipId: relationship.id, targetZoneId: relationship.target }
      });
    }

    // Si les deux zones existent, vérifier que la relation est cohérente
    if (sourceZone && targetZone) {
      // Si relation de type adjacente, vérifier que les zones sont réellement adjacentes
      if (relationship.type === 'adjacent' && !this.areZonesAdjacent(sourceZone, targetZone)) {
        issues.push({
          type: 'invalid_adjacency',
          severity: 'medium',
          description: `Zones ${sourceZone.id} and ${targetZone.id} are marked as adjacent but are not actually adjacent`,
          context: {
            relationshipId: relationship.id,
            sourceZoneId: relationship.source,
            targetZoneId: relationship.target
          }
        });
      }

      // Vérifier la cohérence des règles de transition
      if (relationship.rules && relationship.type === 'disjoint' && relationship.rules.allowedTransitions) {
        issues.push({
          type: 'inconsistent_rules',
          severity: 'medium',
          description: `Relationship ${relationship.id || 'unknown'} is marked as disjoint but allows transitions`,
          context: { relationshipId: relationship.id }
        });
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateValidationScore(issues)
    };
  }

  /**
   * Purge le cache des résultats de validation
   */
  clearCache(): void {
    this.cachedResults.clear();
  }

  /**
   * Invalide une entrée spécifique du cache
   * @param expressionId ID de l'expression à invalider
   */
  invalidateCacheEntry(expressionId: string): boolean {
    return this.cachedResults.delete(expressionId);
  }

  /**
   * Trouve la zone correspondant à une position donnée
   * @param position Position à tester
   */
  private findZoneForPosition(position: Position3D): ZoneDefinition | null {
    // Trier les zones par priorité (ordre décroissant)
    const sortedZones = [...this.zoneDefinitions].sort((a, b) => b.priority - a.priority);

    // Trouver la première zone correspondante
    for (const zone of sortedZones) {
      if (this.isWithinBoundaries(position, zone.boundaries)) {
        return zone;
      }
    }

    return null;
  }

  /**
   * Vérifie si une position est à l'intérieur des limites d'une zone
   * @param position Position à vérifier
   * @param boundaries Limites de la zone
   */
  private isWithinBoundaries(position: Position3D, boundaries: Boundaries): boolean {
    // Si le mode strict est désactivé, appliquer le seuil de tolérance
    if (!this.options.strictBoundaries) {
      const threshold = this.options.toleranceThreshold || 0;
      return (
        position.x >= boundaries.x[0] - threshold && position.x <= boundaries.x[1] + threshold &&
        position.y >= boundaries.y[0] - threshold && position.y <= boundaries.y[1] + threshold &&
        position.z >= boundaries.z[0] - threshold && position.z <= boundaries.z[1] + threshold
      );
    }

    // Mode strict
    return (
      position.x >= boundaries.x[0] && position.x <= boundaries.x[1] &&
      position.y >= boundaries.y[0] && position.y <= boundaries.y[1] &&
      position.z >= boundaries.z[0] && position.z <= boundaries.z[1]
    );
  }

  /**
   * Vérifie si deux zones sont adjacentes
   * @param zone1 Première zone
   * @param zone2 Deuxième zone
   */
  private areZonesAdjacent(zone1: ZoneDefinition, zone2: ZoneDefinition): boolean {
    const b1 = zone1.boundaries;
    const b2 = zone2.boundaries;

    // Deux zones sont adjacentes si elles partagent au moins une face
    const xAdjacent = (Math.abs(b1.x[1] - b2.x[0]) < 0.001 || Math.abs(b1.x[0] - b2.x[1]) < 0.001) &&
      this.rangesOverlap(b1.y, b2.y) &&
      this.rangesOverlap(b1.z, b2.z);

    const yAdjacent = (Math.abs(b1.y[1] - b2.y[0]) < 0.001 || Math.abs(b1.y[0] - b2.y[1]) < 0.001) &&
      this.rangesOverlap(b1.x, b2.x) &&
      this.rangesOverlap(b1.z, b2.z);

    const zAdjacent = (Math.abs(b1.z[1] - b2.z[0]) < 0.001 || Math.abs(b1.z[0] - b2.z[1]) < 0.001) &&
      this.rangesOverlap(b1.x, b2.x) &&
      this.rangesOverlap(b1.y, b2.y);

    return xAdjacent || yAdjacent || zAdjacent;
  }

  /**
   * Vérifie si deux plages de valeurs se chevauchent
   * @param range1 Première plage
   * @param range2 Deuxième plage
   */
  private rangesOverlap(range1: [number, number], range2: [number, number]): boolean {
    return range1[0] <= range2[1] && range2[0] <= range1[1];
  }

  /**
   * Valide une transition entre deux zones
   * @param fromZone Zone de départ
   * @param toZone Zone d'arrivée
   */
  private validateZoneTransition(fromZone: ZoneDefinition, toZone: ZoneDefinition): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Recherche d'une relation entre les zones
    const relationship = this.spatialRelationships.find(
      rel => (rel.source === fromZone.id && rel.target === toZone.id) ||
        (rel.source === toZone.id && rel.target === fromZone.id)
    );

    // Si une relation existe, valider selon les règles
    if (relationship) {
      if (relationship.type === 'disjoint') {
        issues.push({
          type: 'invalid_transition',
          severity: 'high',
          description: `Transition between disjoint zones: ${fromZone.name} to ${toZone.name}`,
          context: { fromZone: fromZone.id, toZone: toZone.id, relationType: relationship.type }
        });
      }

      // Vérification des règles spécifiques si elles existent
      if (relationship.rules && !relationship.rules.allowedTransitions) {
        issues.push({
          type: 'disallowed_transition',
          severity: 'high',
          description: `Transitions not allowed between zones: ${fromZone.name} to ${toZone.name}`,
          context: { fromZone: fromZone.id, toZone: toZone.id }
        });
      }
    }
    // Si aucune relation n'est définie, vérifier si les zones sont adjacentes
    else if (!this.areZonesAdjacent(fromZone, toZone)) {
      issues.push({
        type: 'non_adjacent_transition',
        severity: 'medium',
        description: `Transition between non-adjacent zones: ${fromZone.name} to ${toZone.name}`,
        context: { fromZone: fromZone.id, toZone: toZone.id }
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateValidationScore(issues)
    };
  }

  /**
   * Calcule un score de validation basé sur les problèmes détectés
   * @param issues Problèmes détectés
   */
  private calculateValidationScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) return 1.0;

    const weights: Record<string, number> = {
      high: 0.4,
      medium: 0.2,
      low: 0.1
    };

    const weightedSum = issues.reduce((sum, issue) => {
      // Vérifier que issue.severity est une clé valide dans weights
      const severity = typeof issue.severity === 'string' &&
        (issue.severity in weights) ?
        issue.severity as keyof typeof weights :
        'low';
      return sum + weights[severity];
    }, 0);

    return Math.max(0, 1 - weightedSum);
  }
}