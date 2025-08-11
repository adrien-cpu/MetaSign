// src/ai/specialized/analysis/spatial-types.ts

import { CulturalMarker } from '../cultural/types';

/**
 * Interface définissant l'analyse spatiale des expressions LSF
 */
export interface SpatialAnalysis {
    id: string;
    elements: SpatialElement[];
    relationships: SpatialRelationship[];
    culturalMarkers: CulturalMarker[];
    metadata: Record<string, unknown>;
}

/**
 * Élément spatial identifié dans l'analyse
 */
export interface SpatialElement {
    id: string;
    type: string;
    position: Position3D;
    orientation: Orientation;
    properties: Record<string, unknown>;
}

/**
 * Relation spatiale entre deux éléments
 */
export interface SpatialRelationship {
    id: string;
    sourceId: string;
    targetId: string;
    type: string;
    properties: Record<string, unknown>;
}

/**
 * Position dans l'espace 3D
 */
export interface Position3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Orientation dans l'espace 3D
 */
export interface Orientation {
    pitch: number;
    yaw: number;
    roll: number;
}