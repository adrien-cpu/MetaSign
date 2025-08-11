// src/ai/types/systems/expressions/emotions/lsf.ts

/**
 * Type pour les éléments LSF
 */
export interface LSFElement {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
}

/**
 * Type pour les positions des éléments LSF
 */
export interface LSFElementPosition {
    id: string;
    position: Position3D;
    timestamp?: number;
}

/**
 * Type pour les séquences temporelles
 */
export interface LSFSequence {
    id: string;
    elements?: string[];
    duration?: number;
    startTime?: number;
    endTime?: number;
}

/**
 * Type pour la position en 3D
 */
export interface Position3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Interface pour les expressions LSF
 */
export interface LSFExpression {
    id?: string;
    elements?: LSFElement[];
    positions?: LSFElementPosition[];
    sequences?: LSFSequence[];
    handshapes?: {
        right?: string;
        left?: string;
    };
    orientations?: {
        right?: string;
        left?: string;
    };
    movements?: string[];
    metadata?: Record<string, unknown>;
}

/**
 * Types des contraintes pour la validation
 */
export interface ZoneConstraint {
    type: 'duration' | 'movement' | 'handshape' | 'orientation' | 'custom';
    property?: string;
    value?: string | number | boolean;
    severity: 'high' | 'medium' | 'low';
    description?: string;
}

/**
 * Types pour les relations spatiales
 */
export interface SpatialRelationship {
    source: string;
    target: string;
    type: string;
}

/**
 * Définition d'une proforme
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