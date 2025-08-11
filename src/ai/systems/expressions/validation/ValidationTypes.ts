// src/ai/systems/expressions/validation/ValidationTypes.ts

export type MouthShape =
    | 'neutral'
    | 'smile'
    | 'frown'
    | 'open'
    | 'closed'
    | 'pursed'
    | 'stretched';

export interface ValidationRule {
    eyebrows: EyebrowRule;
    eyes: EyeRule;
    mouth: MouthRule;
}

export interface EyebrowRule {
    minPosition: number;
    maxTension: number;
}

export interface EyeRule {
    minOpenness: number;
    allowedDirections: Array<'left' | 'right' | 'forward' | 'up' | 'down'>;
}

export interface MouthRule {
    allowedShapes: MouthShape[];
}

export interface ValidationResult {
    isValid: boolean;
    issues?: ValidationIssue[];
    error?: string;
}

export interface ValidationIssue {
    component: 'eyebrows' | 'eyes' | 'mouth';
    message: string;
    severity: 'warning' | 'error';
}