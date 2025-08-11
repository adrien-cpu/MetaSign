/**
 * Types pour la gestion des variantes dialectales en LSF
 */

/**
 * Structure pour les données d'analyse de gestes
 */
export interface GestureFrame {
    timestamp: number;
    keypoints: Record<string, { x: number; y: number; z: number; confidence: number }>;
    metadata?: Record<string, unknown>;
}

/**
 * Résultat de détection d'origine régionale
 */
export interface DetectionResult {
    region: string;
    confidence: number;
    alternativeRegions?: Array<{ region: string; confidence: number }>;
    metadata?: Record<string, unknown>;
}

/**
 * Contexte régional pour l'adaptation des expressions
 */
export interface RegionalContext {
    region: string;
    userPreference?: string;
    audience?: string;
    formalityLevel?: 'formal' | 'informal' | 'neutral';
    purpose?: 'educational' | 'conversational' | 'official';
    metadata?: Record<string, unknown>;
}

/**
 * Métadonnées d'une variante dialectale
 */
export interface VariantMetadata {
    source: 'community' | 'expert' | 'rule' | 'automatic';
    confidence: number;
    lastUpdated: number;
    ruleId?: string;
    contributorId?: string;
    validatedBy?: string[];
    usageCount?: number;
}

/**
 * Variante dialectale complète
 */
export interface DialectVariant {
    id: string;
    originalId: string;
    region: string;
    type: 'substitution' | 'modification' | 'addition' | 'omission';
    substitutionType?: string;
    parameters: Record<string, unknown>;
    metadata?: VariantMetadata;
}

/**
 * Règle de substitution pour générer des variantes
 */
export interface SubstitutionRule {
    id: string;
    type: string;
    pattern: RegExp | string;
    parameters?: Record<string, unknown>;
    contextConditions?: Record<string, unknown>;
    confidence?: number;
    priority?: number;
}

/**
 * Résultat de validation d'une variante
 */
export interface ValidationResult {
    /** La variante est-elle valide ? */
    isValid: boolean;

    /** Niveau de confiance de la validation (0 à 1) */
    confidence: number;

    /** Raison de l'invalidation (si isValid est false) */
    reason?: string;

    /** La variante a-t-elle été validée par un locuteur natif ? */
    validatedByNative?: boolean;

    /** Correctifs suggérés si la variante est invalide */
    suggestedFixes?: Record<string, unknown>;
}

/**
 * Feedback de validation par un locuteur natif
 */
export interface ValidationFeedback {
    isValid: boolean;
    confidence: number; // 0.0 à 1.0, à quel point le validateur est sûr
    frequency: number; // 0.0 à 1.0, fréquence d'utilisation observée
    naturalness: number; // 0.0 à 1.0, à quel point l'expression semble naturelle
    alternativeSuggestion?: string;
    comment?: string;
    tags?: string[];
}

/**
 * Changement d'expression pour une variante dialectale
 */
export interface ExpressionChange {
    originalId: string;
    replacementId: string;
    confidence: number;
    validatedByNative: boolean;
}

/**
 * Structure complète des variations dialectales
 */
export interface DialectVariation {
    region: string;
    expressionChanges: ExpressionChange[];
    culturalNotes: string | undefined;
}

/**
 * Options de cache pour les variantes
 */
export interface CacheOptions {
    strategy: 'memory' | 'persistent';
    ttl: number;
    maxSize: number;
    cleanupInterval: number;
}

/**
 * Signaux utilisés pour la détection d'origine
 */
export interface OriginSignal {
    type: OriginSignalType;
    value: string;
    weight: number; // 0.0 à 1.0
}

/**
 * Types de signaux pour la détection d'origine
 */
export enum OriginSignalType {
    IPLocation = 'ip-location',
    BrowserLanguage = 'browser-language',
    UserPreference = 'user-preference',
    PreviousInteractions = 'previous-interactions',
    LinguisticPatterns = 'linguistic-patterns',
    ExplicitDeclaration = 'explicit-declaration'
}

/**
 * Interface pour les résultats de détection d'origine
 */
export interface OriginConfidence {
    region: string;
    confidence: number; // 0.0 à 1.0
    signals: OriginSignal[];
}

/**
 * Contexte d'utilisation des variantes
 */
export enum VariantContext {
    Formal = 'formal',
    Informal = 'informal',
    Academic = 'academic',
    Professional = 'professional',
    Everyday = 'everyday',
    Slang = 'slang',
    Historical = 'historical',
    Literary = 'literary',
    Technical = 'technical',
    Youth = 'youth',
    Elder = 'elder'
}