// src/ai/api/multimodal/types/modalities.ts

// Pour GestureData.parameters
export interface GestureData {
    id: string;
    startTime: number;
    endTime: number;
    type: string;
    parameters: Record<string, unknown>; // Remplacer any par unknown
}

export interface FacialData {
    expressions: Array<{
        type: string;
        intensity: number;
        timestamp: number;
    }>;
    gazeDirection?: {
        x: number;
        y: number;
        z: number;
    };
}

export interface SpatialData {
    position: {
        x: number;
        y: number;
        z: number;
    };
    orientation: {
        pitch: number;
        yaw: number;
        roll: number;
    };
}

export interface AudioData {
    buffer: ArrayBuffer;
    sampleRate: number;
    duration: number;
}

export interface VocalMetadata {
    pitch: number[];
    intensity: number[];
    timing: {
        start: number;
        end: number;
    }[];
}

// Pour Timeline.markers.data
export interface Timeline {
    startTime: number;
    endTime: number;
    markers: Array<{
        timestamp: number;
        type: string;
        data: Record<string, unknown>; // Remplacer any par Record<string, unknown>
    }>;
}

export interface SecurityStatus {
    level: 'low' | 'medium' | 'high';
    issues: string[];
    timestamp: number;
}

export interface ComplianceReport {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
    timestamp: number;
}

// Pour ContextData.preferences
export interface ContextData {
    environment: string;
    participants: string[];
    situation: string;
    preferences: Record<string, unknown>; // Remplacer any par unknown
}

export interface AlignedLSF {
    gestures: Array<{
        gesture: GestureData;
        timing: {
            start: number;
            peak: number;
            end: number;
        };
    }>;
}

export interface AlignedVocal {
    segments: Array<{
        text: string;
        timing: {
            start: number;
            end: number;
        };
    }>;
}

export interface TemporalMarker {
    timestamp: number;
    type: 'gesture' | 'vocal' | 'sync';
    reference: string;
}