// src/ai/specialized/spatial/geometry/types.ts
export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface Area3D {
    min: Point3D;
    max: Point3D;
}