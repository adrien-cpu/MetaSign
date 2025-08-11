/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/types/SpaceTransformationTypes.ts
 * @description Types et interfaces pour les transformations d'espace syntaxique
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

/**
 * Contexte de transformation pour l'espace syntaxique
 */
export interface SpaceTransformationContext {
    /** Type de transformation à appliquer */
    transformationType: string;

    /** Sévérité de la transformation (0-1) */
    severity: number;

    /** Facteur multiplicateur pour certaines transformations */
    factor?: number;

    /** Précision originale avant transformation */
    originalAccuracy: number;

    /** Contexte linguistique de la transformation */
    linguisticContext: Record<string, unknown>;

    /** Indique si les aspects sémantiques doivent être préservés */
    preserveSemantics: boolean;

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Résultat d'une transformation d'espace syntaxique
 */
export interface SpaceTransformationResult {
    /** Succès de la transformation */
    success: boolean;

    /** Score d'impact de la transformation */
    impactScore: number;

    /** Précision après transformation */
    finalAccuracy: number;

    /** Messages de diagnostic */
    diagnostics: string[];

    /** Métriques de performance */
    performanceMetrics: SpacePerformanceMetrics;
}

/**
 * Métriques de performance pour les transformations d'espace
 */
export interface SpacePerformanceMetrics {
    /** Temps d'exécution en millisecondes */
    executionTime: number;

    /** Mémoire utilisée en octets */
    memoryUsage: number;

    /** Nombre d'opérations effectuées */
    operationCount: number;

    /** Efficacité de la transformation (0-1) */
    efficiency: number;
}

/**
 * Configuration pour les stratégies de transformation d'espace
 */
export interface SpaceStrategyConfig {
    /** Seuil minimum de précision acceptable */
    minAccuracyThreshold: number;

    /** Facteur de dégradation maximal */
    maxDegradationFactor: number;

    /** Préservation sémantique activée */
    semanticPreservation: boolean;

    /** Validation linguistique stricte */
    strictValidation: boolean;

    /** Configuration spécifique par stratégie */
    strategySpecific: Record<string, unknown>;
}

/**
 * Types de zones spatiales en LSF
 */
export enum SpatialZoneType {
    NEUTRAL = 'NEUTRAL',
    DOMINANT_SIDE = 'DOMINANT_SIDE',
    NON_DOMINANT_SIDE = 'NON_DOMINANT_SIDE',
    CENTER = 'CENTER',
    UPPER = 'UPPER',
    LOWER = 'LOWER',
    PERIPHERAL = 'PERIPHERAL'
}

/**
 * Types de références spatiales
 */
export enum SpatialReferenceType {
    DEICTIC = 'DEICTIC',           // Références déictiques (ici, là)
    ANAPHORIC = 'ANAPHORIC',       // Références anaphoriques (reprises)
    TOPOGRAPHIC = 'TOPOGRAPHIC',   // Références topographiques
    CLASSIFIER = 'CLASSIFIER'      // Références par classificateurs
}

/**
 * Niveaux de dégradation spatiale
 */
export enum DegradationLevel {
    MINIMAL = 'MINIMAL',     // Dégradation légère
    MODERATE = 'MODERATE',   // Dégradation modérée
    SEVERE = 'SEVERE',       // Dégradation importante
    CRITICAL = 'CRITICAL'    // Dégradation critique
}

/**
 * Interface pour les validateurs d'espace syntaxique
 */
export interface ISpatialValidator {
    /** Valide la cohérence spatiale */
    validateSpatialCoherence(space: Record<string, unknown>): boolean;

    /** Valide les références spatiales */
    validateSpatialReferences(space: Record<string, unknown>): boolean;

    /** Valide les contraintes linguistiques */
    validateLinguisticConstraints(space: Record<string, unknown>): boolean;
}

/**
 * Interface pour les analyseurs d'impact spatial
 */
export interface ISpatialImpactAnalyzer {
    /** Analyse l'impact d'une transformation */
    analyzeTransformationImpact(
        before: Record<string, unknown>,
        after: Record<string, unknown>
    ): SpaceTransformationResult;

    /** Calcule le score de dégradation */
    calculateDegradationScore(
        originalAccuracy: number,
        finalAccuracy: number
    ): number;
}

/**
 * Options de configuration pour les transformations spatiales
 */
export interface SpatialTransformationOptions {
    /** Préservation des aspects grammaticaux */
    preserveGrammaticalAspects?: boolean;

    /** Maintien de la cohérence narrative */
    maintainNarrativeCoherence?: boolean;

    /** Respect des contraintes phonologiques */
    respectPhonologicalConstraints?: boolean;

    /** Adaptation au niveau d'apprentissage */
    adaptToLearningLevel?: boolean;

    /** Configuration personnalisée */
    customSettings?: Record<string, unknown>;
}