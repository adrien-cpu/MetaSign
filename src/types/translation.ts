// src/types/translation.ts

/**
 * Interface for additional sign metadata
 */
export interface SignMetadata {
    /**
     * Difficulty level of the sign
     */
    difficulty?: 'easy' | 'medium' | 'hard';

    /**
     * Regional variants of the sign
     */
    regionalVariants?: string[];

    /**
     * Grammatical category
     */
    category?: string;

    /**
     * Comments about the sign
     */
    comments?: string;

    /**
     * Keywords related to the sign
     */
    tags?: string[];
}

/**
 * Interface representing a LSF sign
 */
export interface Sign {
    /**
     * Unique identifier for the sign
     */
    id: string;

    /**
     * Word or expression translated to LSF
     */
    word: string;

    /**
     * Temporal position of the sign in the sequence (in seconds)
     */
    timestamp: number;

    /**
     * URL of the sign's video
     */
    videoUrl: string;

    /**
     * Duration of the sign in seconds
     */
    duration?: number;

    /**
     * Additional metadata for the sign
     */
    metadata?: SignMetadata;
}

/**
 * Interface for translation options
 */
export interface TranslationOptions {
    /**
     * LSF dialect to use
     */
    dialect?: string;

    /**
     * Translation speed (1 = normal)
     */
    speed?: number;

    /**
     * Include facial expressions
     */
    includeExpressions?: boolean;

    /**
     * Preferred output format
     */
    outputFormat?: 'video' | 'animation' | 'steps';
}

/**
 * Interface for translation result
 */
export interface TranslationResult {
    /**
     * Original text
     */
    originalText: string;

    /**
     * List of signs in the translation
     */
    signs: Sign[];

    /**
     * Timestamp of the translation
     */
    timestamp: number;

    /**
     * Total duration of the translation
     */
    totalDuration: number;

    /**
     * Translation metadata
     */
    metadata?: {
        confidence: number;
        engine: string;
        warnings?: string[];
    };
}

/**
 * Type guard for Sign interface
 */
export function isSign(obj: unknown): obj is Sign {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'word' in obj &&
        'timestamp' in obj &&
        'videoUrl' in obj
    );
}

/**
 * Creates a sign with optional properties handled correctly
 */
export function createSign(params: {
    id: string;
    word: string;
    timestamp: number;
    videoUrl: string;
    duration?: number;
    metadata?: SignMetadata;
}): Sign {
    return {
        id: params.id,
        word: params.word,
        timestamp: params.timestamp,
        videoUrl: params.videoUrl,
        ...(params.duration !== undefined && { duration: params.duration }),
        ...(params.metadata !== undefined && { metadata: params.metadata })
    };
}

/**
 * Creates a default sign if no video URL is available
 */
export function createDefaultSign(params: Omit<Sign, 'videoUrl'>): Sign {
    return {
        ...params,
        videoUrl: '' // Or a default placeholder
    };
}

/**
 * Represents the comprehensive statistics for a translation
 */
export interface TranslationStats {
    /**
     * Accuracy rate of the translation (0-100%)
     */
    accuracyRate?: number;

    /**
     * Completeness rate of the translation (0-100%)
     */
    completenessRate?: number;

    /**
     * Consistency rate of terminology and style (0-100%)
     */
    consistencyRate?: number;

    /**
     * Complexity level of the translation (e.g., 'Simple', 'Intermediate', 'Complex')
     */
    complexityLevel?: 'Simple' | 'Intermediate' | 'Complex';

    /**
     * Total number of errors detected in the translation
     */
    errorCount?: number;

    /**
     * List of recommended improvements for the translation
     */
    recommendedImprovements?: string[];

    /**
     * Additional metadata or context for the translation
     */
    metadata?: Record<string, unknown>;
}