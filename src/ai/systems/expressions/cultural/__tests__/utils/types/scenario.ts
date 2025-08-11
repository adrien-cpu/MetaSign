//src/ai/system/expressions/cultural/__tests__/utils/types/scenario.ts
// Types fortement typés avec unions discriminées
export type Region = 'PARIS' | 'TOULOUSE' | 'MARSEILLE' | string;
export type Generation = 'ELDER' | 'ADULT' | 'YOUTH';
export type EmergencyIntensity = 'CRITICAL' | 'HIGH' | 'MODERATE';
export type TimePressure = 'EXTREME' | 'SIGNIFICANT' | 'NORMAL';
export type CulturalWeight = 'HIGH' | 'MEDIUM' | 'MODERATE' | 'LOW';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CulturalContext {
    region: Region;
    generation: Generation;
    dialect_markers?: string[];
    cultural_specifics?: string[];
    community_traits?: string[];
}

export interface EmergencyType {
    type: string;
    intensity: EmergencyIntensity;
}

export interface EmergencyDetails {
    type: EmergencyType;
    time_pressure: TimePressure;
    clarity_requirements: string;
    cultural_preservation: string;
}

export interface RegionalElements {
    dialect_markers: string[];
    cultural_specifics: string[];
    community_traits: string[];
}

export interface GenerationalElements {
    respect_markers: string[];
    cultural_weight: CulturalWeight;
    adaptation_flexibility: CulturalWeight;
}

export interface CommunityElements {
    traits: string[];
    values: string[];
    practices: string[];
}

export interface CulturalMetadata {
    authenticity_level: number;
    respect_level: number;
    preservation_level: number;
}

export interface CulturalElements {
    regional: RegionalElements;
    generational: GenerationalElements;
    community: CommunityElements;
    metadata: CulturalMetadata;
}

export interface ExpectedOutcomes {
    cultural_integrity: number;
    emergency_response: number;
    overall_effectiveness: number;
}

export interface TestParameters {
    cultural_context: {
        region: Region;
        generation: Generation;
        dialect_markers?: string[];
        cultural_specifics?: string[];
        community_traits?: string[];
    };
    emergency_type: {
        type: string;
        intensity: EmergencyIntensity;
    };
}

export interface TestScenario {
    context: CulturalContext;
    emergency: EmergencyDetails;
    culturalElements: CulturalElements;
    expectedOutcomes: ExpectedOutcomes;
}

export interface PerformanceData {
    response_time?: number;
    clarity?: number;
    effectiveness?: number;
}

export interface TestResults {
    cultural_integrity: number;
    emergency_response: number;
    overall_effectiveness: number;
    performance_metrics: PerformanceData;
}