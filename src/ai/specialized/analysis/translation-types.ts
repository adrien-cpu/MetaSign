// src/ai/specialized/analysis/translation-types.ts

import { CulturalMarker, AdaptedElement } from '../cultural/types';

/**
 * Interface définissant une traduction avec ses métadonnées culturelles
 */
export interface Translation {
    id: string;
    sourceContent: string;
    targetContent: string;
    culturalMarkers: CulturalMarker[];
    adaptations: AdaptedElement[];
    metadata: TranslationMetadata;
}

/**
 * Métadonnées associées à une traduction
 */
export interface TranslationMetadata {
    accuracy: number;
    culturalRelevance: number;
    timestamp: number;
    culturalRegion?: string;
    formalityLevel?: number;
    translationType?: 'LSF_TO_TEXT' | 'TEXT_TO_LSF' | 'LSF_TO_LSF';
    confidence?: number;
    processingTime?: number;
}

/**
 * Types d'entrée pour une requête de traduction
 */
export type TranslationInput = TextTranslationInput | LSFTranslationInput;

/**
 * Entrée pour une traduction textuelle
 */
export interface TextTranslationInput {
    type: 'TEXT';
    content: string;
    targetType: 'LSF';
    options?: TranslationOptions;
}

/**
 * Entrée pour une traduction LSF
 */
export interface LSFTranslationInput {
    type: 'LSF';
    content: string | Record<string, unknown>;
    targetType: 'TEXT' | 'LSF';
    options?: TranslationOptions;
}

/**
 * Options pour personnaliser une traduction
 */
export interface TranslationOptions {
    region?: string;
    formalityLevel?: number;
    preserveCulturalMarkers?: boolean;
    includeExplanations?: boolean;
    validateOutput?: boolean;
}