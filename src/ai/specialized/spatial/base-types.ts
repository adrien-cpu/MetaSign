// src/ai/specialized/spatial/base-types.ts
export interface Dimensions {
    width: number;
    height: number;
    depth: number;
}

export interface Zone {
    id: string;
    bounds: BoundingBox;
    type: ZoneType;
}

export interface Reference {
    id: string;
    position: Point3D;
    type: ReferenceType;
}

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export interface BoundingBox {
    min: Point3D;
    max: Point3D;
}
