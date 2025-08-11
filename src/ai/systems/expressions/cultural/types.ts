// src/ai/systems/expressions/cultural/types.ts
export interface CulturalRules {
    GAZE_PATTERNS: {
        DIALOGUE: GazeDialogueRules;
        SPATIAL_REFERENCE: GazeSpatialRules;
    };
    SIGNING_SPACE: {
        ZONES: SigningZones;
    };
    FACIAL_GRAMMAR: FacialGrammarRules;
    REGIONAL_VARIANTS: RegionalVariants;
}

export interface GazeDialogueRules {
    REQUIRED: {
        directContact: boolean;
        breakPatterns: string[];
        minDuration: number;
    };
    PROHIBITED: {
        prolongedAvoidance: boolean;
        randomShifts: boolean;
    };
}

export interface GazeSpatialRules {
    SEQUENCE: string[];
    TIMING: { anticipation: number };
}

export interface SigningZones {
    TEMPORAL: {
        past: CoordinateRange;
        present: CoordinateRange;
        future: CoordinateRange;
    };
    REFERENTIAL: {
        minDistance: number;
        maxSources: number;
    };
}

export interface CoordinateRange {
    x: [number, number];
    y: [number, number];
}

/**
 * Règles grammaticales relatives aux expressions faciales en LSF
 */
export interface FacialGrammarRules {
    MODIFIERS: {
        intensifiers: FacialModifier[];
        negation: FacialModifier[];
        question: FacialModifier[];
    };
    SYNTACTIC: {
        topicMarker: FacialPattern;
        conditionalMarker: FacialPattern;
        relativeClauses: FacialPattern;
    };
    EMOTIONAL: {
        primary: Record<string, FacialPattern>;
        complex: Record<string, FacialPattern>;
    };
}

/**
 * Définit un modifieur facial spécifique
 */
export interface FacialModifier {
    name: string;
    components: string[];
    intensity: number;
    duration: number;
}

/**
 * Définit un pattern facial complet
 */
export interface FacialPattern {
    name: string;
    eyebrows: string;
    eyes: string;
    cheeks: string;
    mouth: string;
    timing: {
        onset: number;
        hold: number;
        release: number;
    };
}

/**
 * Variantes régionales des signes
 */
export interface RegionalVariants {
    REGIONS: string[];
    DIALECTAL_DIFFERENCES: {
        [region: string]: {
            lexical: DialectalDifference[];
            grammatical: DialectalDifference[];
            prosodic: DialectalDifference[];
        }
    };
    PREFERENCE_SETTINGS: {
        defaultRegion: string;
        allowMixing: boolean;
        adaptToUser: boolean;
    };
}

/**
 * Différence dialectale spécifique
 */
export interface DialectalDifference {
    feature: string;
    standardForm: string;
    regionalForm: string;
    usage: {
        frequency: number;
        contexts: string[];
    };
}

export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    score: number;
}

export interface ValidationIssue {
    type: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    details: ValidationIssueDetails;
}

/**
 * Détails structurés d'un problème de validation
 */
export interface ValidationIssueDetails {
    code?: string;
    location?: {
        component: string;
        position?: {
            x?: number;
            y?: number;
            z?: number;
        };
        timeframe?: {
            start: number;
            end: number;
        };
    };
    relatedRules?: string[];
    suggestions?: string[];
    context?: Record<string, unknown>;
}