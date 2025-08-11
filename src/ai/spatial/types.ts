//src/ai/spatial/types.ts

/**
 * Type pour les vecteurs 3D (alias pour compatibilité)
 */
export type Vector3 = SpatialVector;

/**
 * Rotation en degrés ou radians
 */
export interface Rotation {
    /** Rotation autour de l'axe X (pitch) */
    x: number;
    /** Rotation autour de l'axe Y (yaw) */
    y: number;
    /** Rotation autour de l'axe Z (roll) */
    z: number;
    /** Unité de mesure (degrés par défaut) */
    unit?: 'degrees' | 'radians';
}

/**
 * Position dans l'espace 3D
 */
export interface Position {
    /** Position sur l'axe X */
    x: number;
    /** Position sur l'axe Y */
    y: number;
    /** Position sur l'axe Z */
    z: number;
    /** Unité de mesure (mètres par défaut) */
    unit?: 'meters' | 'centimeters' | 'normalized';
}

/**
 * Type pour les coordonnées 2D
 */
export interface Coordinate2D {
    /** Coordonnée X */
    x: number;
    /** Coordonnée Y */
    y: number;
}

/**
 * Type pour une transformation dans l'espace 3D
 */
export interface Transform3D {
    /** Position */
    position: Position;
    /** Rotation */
    rotation: Rotation;
    /** Échelle (facteur multiplicatif, 1.0 = taille normale) */
    scale?: {
        x: number;
        y: number;
        z: number;
    };
}

/**
 * Interface définissant un vecteur spatial 3D
 */
export interface SpatialVector {
    /** Coordonnée sur l'axe X */
    x: number;

    /** Coordonnée sur l'axe Y */
    y: number;

    /** Coordonnée sur l'axe Z */
    z: number;
}

/**
 * Interface définissant une rotation spatiale 3D
 */
export interface SpatialRotation {
    /** Rotation autour de l'axe X en degrés */
    x: number;

    /** Rotation autour de l'axe Y en degrés */
    y: number;

    /** Rotation autour de l'axe Z en degrés */
    z: number;
}

/**
 * Interface définissant une transformation spatiale complète
 */
export interface SpatialTransform {
    /** Position dans l'espace */
    position: SpatialVector;

    /** Rotation dans l'espace */
    rotation: SpatialRotation;

    /** Échelle (1.0 = taille normale) */
    scale: SpatialVector;
}
