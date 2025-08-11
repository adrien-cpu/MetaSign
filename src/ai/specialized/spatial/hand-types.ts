// src/ai/specialized/spatial/hand-types.ts
export interface HandShape {
    configuration: FingerConfiguration;
    orientation: Orientation;
    location: Point3D;
}

export interface FingerConfiguration {
    thumb: FingerPosition;
    index: FingerPosition;
    middle: FingerPosition;
    ring: FingerPosition;
    pinky: FingerPosition;
}

export interface Orientation {
    palm: Vector3D;
    fingers: Vector3D;
}

export type FingerPosition = 'extended' | 'bent' | 'closed';