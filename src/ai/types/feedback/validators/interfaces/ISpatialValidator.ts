// src/ai/types/feedback/validators/interfaces/ISpatialValidator.ts

import { LSFExpression } from '@ai-types/systems/expressions/emotions/lsf';
import { ValidationResult } from '@ai-types/feedback/validation';

/**
 * Interface pour la position en 3D
 */
export interface Position3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Interface pour les contraintes de zone
 */
export interface ZoneConstraint {
    type: 'duration' | 'movement' | 'handshape' | 'orientation' | 'custom';
    property?: string;
    value?: string | number | boolean;
    severity: 'high' | 'medium' | 'low';
    description?: string;
}

/**
 * Interface pour les relations spatiales
 */
export interface SpatialRelationship {
    source: string;
    target: string;
    type: string;
}

/**
 * Interface pour la définition des proformes
 */
export interface ProformeDefinition {
    id: string;
    name: string;
    description?: string;
    handshape: string;
    validZones: string[];
    incompatibles: string[];
    movement: string[];
    contextualRules?: {
        requiredContext?: string[];
        forbiddenContext?: string[];
        conditionalMovements?: Array<{
            context: string;
            allowedMovements: string[];
        }>;
    };
}

/**
 * Interface pour les validateurs de proformes
 */
export interface IProformeValidator {
    /**
     * Valide une expression LSF
     * @param entry Expression LSF ou objet à valider
     */
    validate(entry: LSFExpression | Record<string, unknown>): Promise<ValidationResult>;

    /**
     * Valide une relation spatiale dans une expression
     * @param relationship Relation spatiale à valider
     * @param expression Expression LSF dans laquelle valider la relation
     */
    validateRelationship(relationship: SpatialRelationship, expression: LSFExpression): Promise<ValidationResult>;

    /**
     * Valide une zone spécifique dans une expression
     * @param zoneId Identifiant de la zone
     * @param constraints Contraintes à vérifier pour la zone
     * @param expression Expression LSF dans laquelle valider la zone
     */
    validateZone(zoneId: string, constraints: ZoneConstraint[], expression: LSFExpression): Promise<ValidationResult>;

    /**
     * Vérifie si une position est valide
     * @param position Position à vérifier
     * @param context Contexte supplémentaire pour la validation
     */
    isValidPosition(position: Position3D, context?: Record<string, unknown>): boolean;

    /**
     * Vérifie si deux zones sont compatibles
     * @param zone1 Première zone
     * @param zone2 Seconde zone
     */
    areZonesCompatible(zone1: string, zone2: string): boolean;

    /**
     * Récupère les zones valides selon une configuration
     * @param config Configuration à utiliser
     */
    getValidZones(config: Record<string, unknown>): string[];

    /**
     * Configure le validateur
     * @param options Options de configuration
     */
    configure(options: Record<string, unknown>): void;

    /**
     * Vérifie la compatibilité entre deux proformes
     * @param proformeId1 ID de la première proforme
     * @param proformeId2 ID de la seconde proforme
     */
    checkCompatibility(proformeId1: string, proformeId2: string): Promise<ValidationResult>;

    /**
     * Récupère la définition d'une proforme
     * @param id ID de la proforme
     */
    getProformeDefinition(id: string): ProformeDefinition | undefined;

    /**
     * Valide l'utilisation d'une proforme dans un contexte donné
     * @param proformeId ID de la proforme
     * @param context Contexte d'utilisation
     */
    validateProformeUsage(proformeId: string, context: Record<string, unknown>): Promise<ValidationResult>;
}