// src/ai/types/geometry.ts

/**
 * Représente un vecteur dans un espace tridimensionnel
 */
export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Représente une rotation dans un espace tridimensionnel
 */
export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * Calcule la distance entre deux points 3D
 */
export function calculateDistance(a: Vector3D, b: Vector3D): number {
    return Math.sqrt(
        Math.pow(b.x - a.x, 2) +
        Math.pow(b.y - a.y, 2) +
        Math.pow(b.z - a.z, 2)
    );
}

/**
 * Normalise un vecteur 3D
 */
export function normalizeVector(v: Vector3D): Vector3D {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length === 0) {
        return { x: 0, y: 0, z: 0 };
    }
    return {
        x: v.x / length,
        y: v.y / length,
        z: v.z / length
    };
}

/**
 * Calcule le produit scalaire entre deux vecteurs
 */
export function dotProduct(a: Vector3D, b: Vector3D): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Calcule le produit vectoriel entre deux vecteurs
 */
export function crossProduct(a: Vector3D, b: Vector3D): Vector3D {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}