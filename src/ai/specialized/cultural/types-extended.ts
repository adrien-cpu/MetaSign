// src/ai/specialized/cultural/types-extended.ts

// Utiliser import type
import type { FormalityLevel } from './types';

// Types pour les règles culturelles
export interface CulturalRule {
    id: string;
    name: string;
    description: string;
    applicableRegions: string[];
    formalityRange: [number, number]; // [min, max]
    priority: number;
    contexts: string[];
    condition: (element: CulturalElement, context: CulturalContext) => boolean;
    apply: (element: CulturalElement, context: CulturalContext) => Promise<AdaptedElement>;
}

// Types pour la validation
export interface ElementValidation {
    culturalAccuracy: number;
    regionalFit: number;
    formalityMatch: number;
    overallValidity: number;
}

export interface ValidationResults {
    authenticity: number;
    coherence: number;
    regionalAccuracy: number;
}

export interface ValidationErrorResults extends ValidationResults {
    failedChecks: string[];
    recommendations: string[];
}

export enum ValidationStatus {
    VALID = 'VALID',
    INVALID = 'INVALID',
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL'
}

// Types pour le contexte culturel
export interface CulturalContext {
    region: string;
    formalityLevel: FormalityLevel;
    markers: unknown[]; // À typer correctement
    specifics: CulturalSpecifics;
    timestamp: number;
}

export interface CulturalSpecifics {
    deafCultureMarkers: DeafCultureMarker[];
    regionalVariations: RegionalVariation[];
    customPractices: CustomPractice[];
    historicalContext?: HistoricalContext;
}

export interface DeafCultureMarker {
    type: string;
    expression: string;
    importance: number;
    context: {
        community: string[];
        modernUsage: Array<{
            context: string[];
            frequency: number;
            trend: string;
        }>;
        preservation: {
            status: string;
            efforts: string[];
            documentation: {
                level: string;
                sources: string[];
                lastUpdate: number;
            };
        };
    };
}

export interface RegionalVariation {
    region: string;
    characteristics: Array<{
        type: string;
        description: string;
        prevalence: number;
        validation: {
            isValid: boolean;
            confidence: number;
            validatedBy: string[];
            lastValidation: number;
        };
    }>;
    influences: Array<{
        type: string;
        description: string;
        impact: number;
        sources: string[];
    }>;
    usage: {
        communities: string[];
        contexts: string[];
        evolution: {
            trend: string;
            documentation: {
                level: string;
                sources: string[];
                lastUpdate: number;
            };
        };
    };
}

export interface CustomPractice {
    name: string;
    description: string;
    origin: string[];
    importance: number;
    contexts: string[];
    validation: {
        isValid: boolean;
        confidence: number;
        validatedBy: string[];
        lastValidation: number;
    };
}

export interface HistoricalContext {
    period: string;
    significance: number;
    references: string[];
}

// Types pour l'adaptation
export interface CulturalElement {
    id: string;
    type: string; // ElementType
    content: unknown;
    culturalSignificance: number;
    validation: ElementValidation;
}

export interface AdaptedElement {
    original: CulturalElement;
    adaptations: Adaptation[];
    validation: ElementValidation;
}

export interface Adaptation {
    type: string; // AdaptationType
    changes: Change[];
    rationale: string;
    confidence: number;
}

export type AdaptationType = 'CULTURAL' | 'REGIONAL' | 'FORMAL' | 'CONTEXTUAL';

export interface Change {
    property: string;
    from: unknown;
    to: unknown;
    reason: string;
}

// Types pour les erreurs
export interface AdaptationErrorContext {
    operation: string;
    errorDetails: unknown;
}