// src/ai/feedback/validators/specialized/ProformeValidator.ts
import {
  IProformeValidator,
  ProformeDefinition,
  SpatialRelationship,
  ZoneConstraint,
  Position3D
} from '@ai-types/feedback/validators/interfaces/ISpatialValidator';
import {
  ValidationResult,
  ValidationIssue,
  ValidationMetadata
} from '@ai-types/feedback/validation';
import { LSFExpression, LSFElement, LSFSequence, LSFElementPosition } from '@ai-types/systems/expressions/emotions/lsf';

// Interface pour la configuration du validateur
interface ValidatorConfig {
  toleranceThreshold?: number;
  strictValidation?: boolean;
  acceptPartialMatches?: boolean;
  contextRules?: Record<string, string[]>;
  [key: string]: unknown;
}

// Interface pour les données d'expression génériques
interface ExpressionData {
  [key: string]: unknown;
  elements?: LSFElement[];
  positions?: LSFElementPosition[];
  sequences?: LSFSequence[];
  metadata?: Record<string, unknown>;
}

export class ProformeValidator implements IProformeValidator {
  private proformes: Map<string, ProformeDefinition>;
  private compatibilityMatrix: Map<string, Set<string>>;
  private config: ValidatorConfig = {
    toleranceThreshold: 0.2,
    strictValidation: false,
    acceptPartialMatches: true
  };

  constructor(proformeDefinitions: ProformeDefinition[]) {
    this.proformes = new Map(proformeDefinitions.map(def => [def.id, def]));
    this.compatibilityMatrix = this.buildCompatibilityMatrix(proformeDefinitions);
  }

  async validate(entry: LSFExpression | Record<string, unknown>): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Extraction des données pertinentes
    const content = entry as ExpressionData;
    const metadata = content.metadata;

    // Validation de la structure de base
    if (!content || typeof content !== 'object') {
      issues.push({
        type: 'invalid_content',
        severity: 'high',
        description: 'La structure du contenu est invalide'
      });
      return {
        isValid: false,
        issues,
        score: 0
      };
    }

    // Analyse du contenu pour validation des proformes
    try {
      // Validation spatiale
      const spatialIssues = await this.validateSpatialAttributes(content);
      issues.push(...spatialIssues);

      // Validation des handshapes si la propriété existe
      if ('handshapes' in content && content.handshapes) {
        const handshapeIssues = await this.validateHandshapes(content.handshapes);
        issues.push(...handshapeIssues);
      }

      // Validation des orientations si la propriété existe
      if ('orientations' in content && content.orientations) {
        const orientationIssues = await this.validateOrientations(content.orientations);
        issues.push(...orientationIssues);
      }

      // Validation des mouvements si la propriété existe
      if ('movements' in content && content.movements) {
        const movementIssues = await this.validateMovements(content.movements);
        issues.push(...movementIssues);
      }

      // Validation contextuelle si des métadonnées de contexte sont fournies
      if (metadata && 'context' in metadata) {
        const contextData = metadata.context as Record<string, unknown>;
        const contextIssues = await this.validateContextualRules(content, contextData);
        issues.push(...contextIssues);
      }

      // Calcul du score de validation
      const score = this.calculateValidationScore(issues);

      // Préparer les métadonnées de validation
      const validationMetadata: ValidationMetadata = {
        validatedAt: Date.now(),
        validatedBy: 'ProformeValidator',
      };

      // Ajouter le contexte de validation si disponible
      if (metadata && 'context' in metadata) {
        validationMetadata.validationContext = metadata.context as Record<string, unknown>;
      }

      return {
        isValid: issues.length === 0,
        issues,
        score,
        metadata: validationMetadata
      };
    } catch (error) {
      issues.push({
        type: 'validation_error',
        severity: 'high',
        description: `Erreur lors de la validation: ${error instanceof Error ? error.message : String(error)}`
      });

      return {
        isValid: false,
        issues,
        score: 0
      };
    }
  }

  async validateRelationship(
    relationship: SpatialRelationship,
    expression: LSFExpression
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Vérifier si les éléments source et cible existent
    const sourceExists = this.elementExists(relationship.source, expression);
    const targetExists = this.elementExists(relationship.target, expression);

    if (!sourceExists) {
      issues.push({
        type: 'missing_source',
        severity: 'high',
        description: `L'élément source "${relationship.source}" n'existe pas dans l'expression`
      });
    }

    if (!targetExists) {
      issues.push({
        type: 'missing_target',
        severity: 'high',
        description: `L'élément cible "${relationship.target}" n'existe pas dans l'expression`
      });
    }

    // Si les deux éléments existent, on peut valider la relation
    if (sourceExists && targetExists) {
      // Vérifier le type de relation
      const validRelationTypes = [
        'above', 'below', 'leftOf', 'rightOf', 'inFrontOf', 'behind',
        'inside', 'outside', 'touching', 'near', 'far', 'aligned', 'centered'
      ];

      if (!validRelationTypes.includes(relationship.type)) {
        issues.push({
          type: 'invalid_relation_type',
          severity: 'medium',
          description: `Type de relation "${relationship.type}" non valide`
        });
      }

      // Vérifier les positions relatives des éléments
      const sourcePos = this.getElementPosition(relationship.source, expression);
      const targetPos = this.getElementPosition(relationship.target, expression);

      if (sourcePos && targetPos) {
        if (!this.validateRelativePositions(sourcePos, targetPos, relationship.type)) {
          issues.push({
            type: 'invalid_relative_position',
            severity: 'medium',
            description: `La relation spatiale "${relationship.type}" n'est pas respectée entre les éléments`
          });
        }
      }
    }

    // Calcul du score de validation
    const score = this.calculateValidationScore(issues);

    return {
      isValid: issues.length === 0,
      issues,
      score
    };
  }

  async validateZone(
    zoneId: string,
    constraints: ZoneConstraint[],
    expression: LSFExpression
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Vérifier si la zone existe dans l'expression
    const zoneElements = this.findElementsInZone(zoneId, expression);

    if (zoneElements.length === 0) {
      issues.push({
        type: 'empty_zone',
        severity: 'medium',
        description: `La zone "${zoneId}" ne contient aucun élément`
      });
    }

    // Vérifier chaque contrainte
    for (const constraint of constraints) {
      // Vérifier le type de contrainte
      switch (constraint.type) {
        case 'duration':
          if (!this.validateDurationConstraint(zoneElements, constraint, expression)) {
            issues.push({
              type: 'duration_constraint_violation',
              severity: constraint.severity,
              description: constraint.description || `Violation de la contrainte de durée dans la zone "${zoneId}"`
            });
          }
          break;

        case 'movement':
          if (!this.validateMovementConstraint(zoneElements, constraint, expression)) {
            issues.push({
              type: 'movement_constraint_violation',
              severity: constraint.severity,
              description: constraint.description || `Violation de la contrainte de mouvement dans la zone "${zoneId}"`
            });
          }
          break;

        case 'handshape':
          if (!this.validateHandshapeConstraint(zoneElements, constraint, expression)) {
            issues.push({
              type: 'handshape_constraint_violation',
              severity: constraint.severity,
              description: constraint.description || `Violation de la contrainte de configuration des mains dans la zone "${zoneId}"`
            });
          }
          break;

        case 'orientation':
          if (!this.validateOrientationConstraint(zoneElements, constraint, expression)) {
            issues.push({
              type: 'orientation_constraint_violation',
              severity: constraint.severity,
              description: constraint.description || `Violation de la contrainte d'orientation dans la zone "${zoneId}"`
            });
          }
          break;

        case 'custom':
          if (!this.validateCustomConstraint(zoneElements, constraint, expression)) {
            issues.push({
              type: 'custom_constraint_violation',
              severity: constraint.severity,
              description: constraint.description || `Violation de la contrainte personnalisée dans la zone "${zoneId}"`
            });
          }
          break;

        default:
          issues.push({
            type: 'unknown_constraint_type',
            severity: 'medium',
            description: `Type de contrainte inconnu: "${constraint.type}"`
          });
      }
    }

    // Calcul du score de validation
    const score = this.calculateValidationScore(issues);

    return {
      isValid: issues.length === 0,
      issues,
      score
    };
  }

  isValidPosition(position: Position3D, context?: Record<string, unknown>): boolean {
    // Vérifier que les coordonnées sont dans des limites raisonnables
    const isInRange = (val: number, min = -100, max = 100) => val >= min && val <= max;

    const basicCheck = isInRange(position.x) && isInRange(position.y) && isInRange(position.z);

    // Si un contexte est fourni, effectuer des vérifications supplémentaires
    if (context && basicCheck) {
      // Vérifier les contraintes supplémentaires basées sur le contexte
      if (context.minX !== undefined && position.x < Number(context.minX)) return false;
      if (context.maxX !== undefined && position.x > Number(context.maxX)) return false;
      if (context.minY !== undefined && position.y < Number(context.minY)) return false;
      if (context.maxY !== undefined && position.y > Number(context.maxY)) return false;
      if (context.minZ !== undefined && position.z < Number(context.minZ)) return false;
      if (context.maxZ !== undefined && position.z > Number(context.maxZ)) return false;

      // Vérifier les zones interdites si spécifiées
      if (context.forbiddenZones && Array.isArray(context.forbiddenZones)) {
        for (const zone of context.forbiddenZones as Array<{ min: Position3D, max: Position3D }>) {
          if (
            position.x >= zone.min.x && position.x <= zone.max.x &&
            position.y >= zone.min.y && position.y <= zone.max.y &&
            position.z >= zone.min.z && position.z <= zone.max.z
          ) {
            return false; // Position dans une zone interdite
          }
        }
      }
    }

    return basicCheck;
  }

  areZonesCompatible(zone1: string, zone2: string): boolean {
    // Liste des combinaisons de zones incompatibles
    const incompatibleZonePairs = [
      ['visage', 'jambes'],
      ['bouche', 'pieds'],
      ['zone_neutre_haute', 'zone_neutre_basse'],
      // Autres combinaisons incompatibles
    ];

    // Vérifier si la paire est dans la liste des incompatibles
    for (const [z1, z2] of incompatibleZonePairs) {
      if ((zone1 === z1 && zone2 === z2) || (zone1 === z2 && zone2 === z1)) {
        return false;
      }
    }

    return true;
  }

  getValidZones(config: Record<string, unknown>): string[] {
    const validZones: string[] = [];

    // Zones de base toujours valides
    const baseZones = ['zone_neutre', 'torse', 'espace_frontal'];
    validZones.push(...baseZones);

    // Zones conditionnelles selon la configuration
    if ('handshape' in config && config.handshape) {
      const handshape = config.handshape as string;

      // Certaines configurations de mains ne sont valides que dans certaines zones
      if (['index', 'cornes', 'pouce'].includes(handshape)) {
        validZones.push('visage', 'tête');
      }

      if (['main_plate', 'poing', 'moufle'].includes(handshape)) {
        validZones.push('bras', 'jambes');
      }
    }

    // Ajouter des zones basées sur le contexte d'utilisation
    if ('context' in config && typeof config.context === 'string') {
      const context = config.context as string;

      if (context === 'dialogue') {
        validZones.push('bouche', 'expression');
      } else if (context === 'description') {
        validZones.push('espace_périphérique');
      }
    }

    return validZones;
  }

  configure(options: ValidatorConfig): void {
    // Fusionner les options fournies avec la configuration par défaut
    this.config = {
      ...this.config,
      ...options
    };

    // Appliquer des règles spécifiques selon les options
    if (options.strictValidation) {
      // En mode strict, désactiver les correspondances partielles
      this.config.acceptPartialMatches = false;
    }

    // Initialiser des règles de contexte personnalisées si fournies
    if (options.contextRules) {
      this.config.contextRules = options.contextRules;
    }
  }

  async checkCompatibility(proformeId1: string, proformeId2: string): Promise<ValidationResult> {
    const proforme1 = this.proformes.get(proformeId1);
    const proforme2 = this.proformes.get(proformeId2);

    if (!proforme1 || !proforme2) {
      return {
        isValid: false,
        issues: [{
          type: 'proforme_not_found',
          severity: 'high',
          description: `Une ou plusieurs proformes non trouvées: ${!proforme1 ? proformeId1 : ''} ${!proforme2 ? proformeId2 : ''}`
        }],
        score: 0
      };
    }

    const issues: ValidationIssue[] = [];

    // Vérifier la compatibilité directe
    if (proforme1.incompatibles.includes(proformeId2) || proforme2.incompatibles.includes(proformeId1)) {
      issues.push({
        type: 'direct_incompatibility',
        severity: 'high',
        description: `Les proformes ${proformeId1} et ${proformeId2} sont directement incompatibles`
      });
    }

    // Vérifier la compatibilité des zones
    const compatibleZones = proforme1.validZones.some(zone => proforme2.validZones.includes(zone));
    if (!compatibleZones) {
      issues.push({
        type: 'zone_incompatibility',
        severity: 'medium',
        description: `Aucune zone commune entre les proformes ${proformeId1} et ${proformeId2}`
      });
    }

    // Vérifier la compatibilité des mouvements
    const hasCompatibleMovements = this.checkMovementCompatibility(proforme1, proforme2);
    if (!hasCompatibleMovements) {
      issues.push({
        type: 'movement_incompatibility',
        severity: 'medium',
        description: `Mouvements incompatibles entre les proformes ${proformeId1} et ${proformeId2}`
      });
    }

    // Calculer le score de compatibilité
    const score = this.calculateValidationScore(issues);

    return {
      isValid: issues.length === 0,
      issues,
      score
    };
  }

  getProformeDefinition(id: string): ProformeDefinition | undefined {
    return this.proformes.get(id);
  }

  async validateProformeUsage(proformeId: string, context: Record<string, unknown>): Promise<ValidationResult> {
    const proformeDefinition = this.proformes.get(proformeId);

    if (!proformeDefinition) {
      return {
        isValid: false,
        issues: [{
          type: 'proforme_not_found',
          severity: 'high',
          description: `Proforme non trouvée: ${proformeId}`
        }],
        score: 0
      };
    }

    const issues: ValidationIssue[] = [];

    // Valider le contexte d'utilisation
    if (proformeDefinition.contextualRules?.requiredContext) {
      const missingContexts = proformeDefinition.contextualRules.requiredContext.filter(
        requiredCtx => !context || !this.hasContext(context, requiredCtx)
      );

      if (missingContexts.length > 0) {
        issues.push({
          type: 'missing_required_context',
          severity: 'medium',
          description: `Contexte requis manquant pour la proforme ${proformeId}: ${missingContexts.join(', ')}`
        });
      }
    }

    if (proformeDefinition.contextualRules?.forbiddenContext) {
      const forbiddenContextsPresent = proformeDefinition.contextualRules.forbiddenContext.filter(
        forbiddenCtx => context && this.hasContext(context, forbiddenCtx)
      );

      if (forbiddenContextsPresent.length > 0) {
        issues.push({
          type: 'forbidden_context_present',
          severity: 'high',
          description: `Contexte interdit présent pour la proforme ${proformeId}: ${forbiddenContextsPresent.join(', ')}`
        });
      }
    }

    // Valider les règles conditionnelles de mouvement
    if ('movement' in context && context.movement && proformeDefinition.contextualRules?.conditionalMovements) {
      const matchingCondition = proformeDefinition.contextualRules.conditionalMovements.find(
        condition => this.hasContext(context, condition.context)
      );

      if (matchingCondition && !matchingCondition.allowedMovements.includes(context.movement as string)) {
        issues.push({
          type: 'invalid_conditional_movement',
          severity: 'medium',
          description: `Mouvement invalide pour le contexte donné dans la proforme ${proformeId}`
        });
      }
    }

    // Calculer le score de validation
    const score = this.calculateValidationScore(issues);

    return {
      isValid: issues.length === 0,
      issues,
      score
    };
  }

  // Méthodes privées d'implémentation

  private buildCompatibilityMatrix(proformeDefinitions: ProformeDefinition[]): Map<string, Set<string>> {
    const matrix = new Map<string, Set<string>>();

    for (const proforme of proformeDefinitions) {
      const compatibles = new Set<string>();

      // Tous les proformes sont compatibles par défaut sauf ceux explicitement incompatibles
      for (const otherProforme of proformeDefinitions) {
        if (proforme.id !== otherProforme.id && !proforme.incompatibles.includes(otherProforme.id)) {
          compatibles.add(otherProforme.id);
        }
      }

      matrix.set(proforme.id, compatibles);
    }

    return matrix;
  }

  private async validateSpatialAttributes(content: ExpressionData): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Validation des attributs spatiaux
    if (!('locations' in content) || !content.locations || !Array.isArray(content.locations) || content.locations.length === 0) {
      issues.push({
        type: 'missing_locations',
        severity: 'high',
        description: 'Aucune information de localisation fournie'
      });
      return issues;
    }

    // Vérifier chaque location
    for (let i = 0; i < content.locations.length; i++) {
      const location = content.locations[i];

      if (!location || typeof location !== 'object' ||
        !('x' in location) || !('y' in location) || !('z' in location)) {
        issues.push({
          type: 'invalid_location_format',
          severity: 'high',
          description: `Format de localisation invalide à l'index ${i}`
        });
        continue;
      }

      // Vérifier si la position est valide
      const pos = location as Position3D;
      if (!this.isValidPosition(pos)) {
        issues.push({
          type: 'invalid_position',
          severity: 'medium',
          description: `Position invalide à l'index ${i}: (${pos.x}, ${pos.y}, ${pos.z})`
        });
      }
    }

    return issues;
  }

  private async validateHandshapes(handshapes: unknown): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (!handshapes || typeof handshapes !== 'object') {
      issues.push({
        type: 'invalid_handshapes',
        severity: 'high',
        description: 'Format de configuration des mains invalide'
      });
      return issues;
    }

    const hsObj = handshapes as Record<string, unknown>;

    // Vérifier les handshapes droite et gauche
    if (!('right' in hsObj) && !('left' in hsObj)) {
      issues.push({
        type: 'missing_handshapes',
        severity: 'high',
        description: 'Aucune configuration de main fournie (droite ou gauche)'
      });
    }

    // Vérifier la validité des configurations de main
    if ('right' in hsObj && hsObj.right && !this.isValidHandshape(String(hsObj.right))) {
      issues.push({
        type: 'invalid_right_handshape',
        severity: 'medium',
        description: `Configuration de main droite invalide: ${hsObj.right}`
      });
    }

    if ('left' in hsObj && hsObj.left && !this.isValidHandshape(String(hsObj.left))) {
      issues.push({
        type: 'invalid_left_handshape',
        severity: 'medium',
        description: `Configuration de main gauche invalide: ${hsObj.left}`
      });
    }

    return issues;
  }

  private async validateOrientations(orientations: unknown): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (!orientations || typeof orientations !== 'object') {
      issues.push({
        type: 'invalid_orientations',
        severity: 'high',
        description: 'Format d\'orientation des mains invalide'
      });
      return issues;
    }

    const oriObj = orientations as Record<string, unknown>;

    // Vérifier les orientations droite et gauche
    if ('right' in oriObj && oriObj.right && !this.isValidOrientation(String(oriObj.right))) {
      issues.push({
        type: 'invalid_right_orientation',
        severity: 'medium',
        description: `Orientation de main droite invalide: ${oriObj.right}`
      });
    }

    if ('left' in oriObj && oriObj.left && !this.isValidOrientation(String(oriObj.left))) {
      issues.push({
        type: 'invalid_left_orientation',
        severity: 'medium',
        description: `Orientation de main gauche invalide: ${oriObj.left}`
      });
    }

    return issues;
  }

  private async validateMovements(movements: unknown): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (!movements || !Array.isArray(movements)) {
      issues.push({
        type: 'invalid_movements',
        severity: 'high',
        description: 'Format de mouvements invalide'
      });
      return issues;
    }

    if (movements.length === 0) {
      issues.push({
        type: 'missing_movements',
        severity: 'medium',
        description: 'Aucun mouvement fourni'
      });
      return issues;
    }

    // Vérifier chaque mouvement
    for (let i = 0; i < movements.length; i++) {
      const movement = movements[i];

      if (!this.isValidMovement(String(movement))) {
        issues.push({
          type: 'invalid_movement',
          severity: 'medium',
          description: `Mouvement invalide à l'index ${i}: ${movement}`
        });
      }
    }

    return issues;
  }

  private async validateContextualRules(
    content: ExpressionData,
    context: Record<string, unknown>
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Exemple de vérification de règles contextuelles spécifiques
    // Vérifier la cohérence entre le contexte et les éléments du contenu

    // 1. Vérifier si le contexte nécessite des configurations de main spécifiques
    if (context.setting === 'formal' && 'handshapes' in content && content.handshapes) {
      const handshapes = content.handshapes as Record<string, unknown>;
      const formalHandshapes = ['B', 'A', 'S', 'G', 'O'];

      if ('right' in handshapes && handshapes.right && !formalHandshapes.includes(String(handshapes.right))) {
        issues.push({
          type: 'contextual_handshape',
          severity: 'medium',
          description: 'Configuration de main droite inappropriée pour un contexte formel'
        });
      }

      if ('left' in handshapes && handshapes.left && !formalHandshapes.includes(String(handshapes.left))) {
        issues.push({
          type: 'contextual_handshape',
          severity: 'medium',
          description: 'Configuration de main gauche inappropriée pour un contexte formel'
        });
      }
    }

    // 2. Vérifier les règles de mouvement contextuel
    if (context.audience === 'children' && 'movements' in content && content.movements) {
      const movements = content.movements as string[];
      const complexMovements = ['zigzag', 'cross', 'repetitive'];

      const hasComplexMovements = movements.some(m => complexMovements.includes(m));
      if (hasComplexMovements && context.level === 'beginner') {
        issues.push({
          type: 'contextual_movement',
          severity: 'medium',
          description: 'Mouvements trop complexes pour des débutants enfants'
        });
      }
    }

    return issues;
  }

  private isValidHandshape(handshape: string): boolean {
    // Vérifier si la configuration de main est valide
    // Liste des configurations valides selon les standards LSF
    const validHandshapes = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'bec_de_canard', 'main_plate', 'poing', 'cornes', 'index', 'petit_crochet', 'grand_crochet', 'pouce', 'moufle'
      // Autres configurations spécifiques
    ];

    return validHandshapes.includes(handshape);
  }

  private isValidOrientation(orientation: string): boolean {
    // Vérifier si l'orientation est valide
    const validOrientations = [
      'up', 'down', 'left', 'right', 'forward', 'backward',
      'palm_up', 'palm_down', 'palm_left', 'palm_right', 'palm_forward', 'palm_backward'
    ];

    return validOrientations.includes(orientation);
  }

  private isValidMovement(movement: string): boolean {
    // Vérifier si le mouvement est valide
    const validMovements = [
      'straight', 'arc', 'circle', 'zigzag', 'wave', 'cross',
      'contact', 'alternating', 'symmetrical', 'repetitive',
      'approach', 'separate', 'twist', 'bend', 'turn'
    ];

    return validMovements.includes(movement);
  }

  private checkMovementCompatibility(proforme1: ProformeDefinition, proforme2: ProformeDefinition): boolean {
    // Vérifier s'il existe au moins un mouvement compatible entre les deux proformes
    return proforme1.movement.some(m1 => proforme2.movement.includes(m1));
  }

  private hasContext(context: Record<string, unknown>, requiredContext: string): boolean {
    // Vérifier si le contexte spécifié est présent dans le contexte fourni
    if (!context) return false;

    // Prise en charge de notations avec points (ex: "situation.formal")
    const contextPath = requiredContext.split('.');
    let currentContext: Record<string, unknown> = context;

    for (const path of contextPath) {
      if (typeof currentContext !== 'object' || currentContext === null || !(path in currentContext)) {
        return false;
      }
      currentContext = currentContext[path] as Record<string, unknown>;
    }

    return true;
  }

  private calculateValidationScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) return 1.0;

    // Pondération des problèmes par sévérité
    const weights = {
      high: 0.4,
      medium: 0.2,
      low: 0.1
    };

    // Calculer la somme pondérée des problèmes
    const totalWeight = issues.reduce((sum, issue) => {
      const weight = weights[issue.severity as keyof typeof weights] || 0.1;
      return sum + weight;
    }, 0);

    // Limiter le score entre 0 et 1
    return Math.max(0, Math.min(1, 1 - totalWeight));
  }

  // Méthodes auxiliaires pour les validations spécifiques

  private elementExists(elementId: string, expression: LSFExpression): boolean {
    // Vérifier si un élément existe dans l'expression
    if (!expression.elements) return false;

    return expression.elements.some(el => el.id === elementId);
  }

  private getElementPosition(elementId: string, expression: LSFExpression): Position3D | null {
    // Trouver la position d'un élément dans l'expression
    if (!expression.positions) return null;

    const position = expression.positions.find(pos => pos.id === elementId);
    if (!position || !position.position) return null;

    return position.position;
  }

  private validateRelativePositions(
    sourcePos: Position3D,
    targetPos: Position3D,
    relationType: string
  ): boolean {
    // Vérifier si les positions relatives correspondent au type de relation
    switch (relationType) {
      case 'above':
        return sourcePos.y > targetPos.y;
      case 'below':
        return sourcePos.y < targetPos.y;
      case 'leftOf':
        return sourcePos.x < targetPos.x;
      case 'rightOf':
        return sourcePos.x > targetPos.x;
      case 'inFrontOf':
        return sourcePos.z > targetPos.z;
      case 'behind':
        return sourcePos.z < targetPos.z;
      case 'near':
        const distance = Math.sqrt(
          Math.pow(sourcePos.x - targetPos.x, 2) +
          Math.pow(sourcePos.y - targetPos.y, 2) +
          Math.pow(sourcePos.z - targetPos.z, 2)
        );
        return distance < 5; // Seuil arbitraire de proximité
      default:
        return true; // Types de relation plus complexes non implémentés
    }
  }

  private findElementsInZone(zoneId: string, expression: LSFExpression): string[] {
    // Recherche d'éléments dans une zone
    const elementsInZone: string[] = [];

    // On suppose que les éléments ont une propriété zone ou sont associés à une zone
    if (expression.elements) {
      for (const element of expression.elements) {
        if (element.properties && 'zone' in element.properties && element.properties.zone === zoneId) {
          elementsInZone.push(element.id || '');
        }
      }
    }

    return elementsInZone;
  }

  private validateDurationConstraint(
    elementIds: string[],
    constraint: ZoneConstraint,
    expression: LSFExpression
  ): boolean {
    // Vérifier les contraintes de durée dans une zone
    // On suppose qu'il y a des séquences temporelles pour les éléments
    if (!expression.sequences || !elementIds.length) return true;

    // Récupérer toutes les séquences associées aux éléments de la zone
    const relevantSequences = expression.sequences.filter(seq =>
      seq.elements && seq.elements.some(id => elementIds.includes(id))
    );

    if (!relevantSequences.length) return true;

    // Calculer la durée totale des éléments dans la zone
    const totalDuration = relevantSequences.reduce((sum, seq) => sum + (seq.duration || 0), 0);

    // Vérifier selon le type de contrainte
    const value = Number(constraint.value);
    if (isNaN(value)) return true;

    // On suppose que la contrainte définit une durée minimale ou maximale
    const property = constraint.property || '';
    if (property.includes('min')) {
      return totalDuration >= value;
    } else if (property.includes('max')) {
      return totalDuration <= value;
    }

    return true;
  }

  private validateMovementConstraint(
    elementIds: string[],
    constraint: ZoneConstraint,
    expression: LSFExpression
  ): boolean {
    // Implementation de la validation des contraintes de mouvement
    if (!expression.movements || !elementIds.length) return true;

    // Récupérer les mouvements associés aux éléments
    const movementProperty = constraint.property || '';
    const movementValue = String(constraint.value || '');

    // Vérifier la présence/absence des mouvements selon la contrainte
    if (movementProperty === 'required' && movementValue) {
      // Vérifier si le mouvement requis est présent
      return expression.movements.some(movement =>
        movement === movementValue &&
        movement !== undefined
      );
    } else if (movementProperty === 'forbidden' && movementValue) {
      // Vérifier qu'aucun mouvement interdit n'est présent
      return !expression.movements.some(movement =>
        movement === movementValue
      );
    }

    return true;
  }

  private validateHandshapeConstraint(
    elementIds: string[],
    constraint: ZoneConstraint,
    expression: LSFExpression
  ): boolean {
    // Implémentation de la validation des contraintes de configuration des mains
    if (!expression.handshapes || !elementIds.length) return true;

    const handshapeProperty = constraint.property || '';
    const handshapeValue = String(constraint.value || '');

    // Vérification selon le type de contrainte
    if (handshapeProperty === 'required') {
      // Vérifier si la configuration requise est utilisée
      return 'right' in expression.handshapes && expression.handshapes.right === handshapeValue ||
        'left' in expression.handshapes && expression.handshapes.left === handshapeValue;
    } else if (handshapeProperty === 'forbidden') {
      // Vérifier qu'aucune configuration interdite n'est utilisée
      return !('right' in expression.handshapes && expression.handshapes.right === handshapeValue) &&
        !('left' in expression.handshapes && expression.handshapes.left === handshapeValue);
    }

    return true;
  }

  private validateOrientationConstraint(
    elementIds: string[],
    constraint: ZoneConstraint,
    expression: LSFExpression
  ): boolean {
    // Implémentation de la validation des contraintes d'orientation
    if (!expression.orientations || !elementIds.length) return true;

    const orientationProperty = constraint.property || '';
    const orientationValue = String(constraint.value || '');

    // Vérification selon le type de contrainte
    if (orientationProperty === 'required') {
      // Vérifier si l'orientation requise est utilisée
      return 'right' in expression.orientations && expression.orientations.right === orientationValue ||
        'left' in expression.orientations && expression.orientations.left === orientationValue;
    } else if (orientationProperty === 'forbidden') {
      // Vérifier qu'aucune orientation interdite n'est utilisée
      return !('right' in expression.orientations && expression.orientations.right === orientationValue) &&
        !('left' in expression.orientations && expression.orientations.left === orientationValue);
    }

    return true;
  }

  private validateCustomConstraint(
    elementIds: string[],
    constraint: ZoneConstraint,
    expression: LSFExpression
  ): boolean {
    // Implémentation de la validation des contraintes personnalisées
    if (!elementIds.length) return true;

    const customProperty = constraint.property || '';
    const customValue = constraint.value;

    // Vérification basée sur le type de contrainte personnalisée
    switch (customProperty) {
      case 'element_count':
        // Vérifier le nombre d'éléments dans la zone
        return elementIds.length === Number(customValue);

      case 'max_elements':
        // Vérifier que le nombre d'éléments ne dépasse pas la limite
        return elementIds.length <= Number(customValue);

      case 'min_elements':
        // Vérifier que le nombre d'éléments atteint le minimum requis
        return elementIds.length >= Number(customValue);

      case 'symmetry_required':
        // Vérifier la symétrie des éléments (implémentation simplifiée)
        if (customValue === true || customValue === 'true') {
          return this.checkSymmetry(elementIds, expression);
        }
        return true;

      default:
        // Contrainte personnalisée non reconnue, on considère qu'elle est satisfaite
        return true;
    }
  }

  private checkSymmetry(elementIds: string[], expression: LSFExpression): boolean {
    // Implémentation simplifiée pour vérifier la symétrie
    // Une implémentation complète nécessiterait une analyse plus approfondie des positions et mouvements

    // Vérifier si nous avons un nombre pair d'éléments (condition de base pour la symétrie)
    if (elementIds.length % 2 !== 0) return false;

    // Vérifier la symétrie des positions si disponibles
    if (expression.positions) {
      // Implémentation simplifiée - une vérification réelle serait plus complexe
      return true;
    }

    return true;
  }
}