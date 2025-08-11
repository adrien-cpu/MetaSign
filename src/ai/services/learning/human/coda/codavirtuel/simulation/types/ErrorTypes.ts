/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/types/ErrorTypes.ts
 * @description Types pour le simulateur d'erreurs du système d'apprentissage LSF
 * @author MetaSign
 * @version 1.1.0
 */

import { ErrorCategory, ErrorType } from '../../types';

/**
 * Catégories d'erreurs possibles lors de la simulation
 */
export enum ErrorCategoryType {
    HAND_CONFIGURATION = 'configuration_main',
    LOCATION = 'emplacement',
    MOVEMENT = 'mouvement',
    ORIENTATION = 'orientation',
    FACIAL_EXPRESSION = 'expression_faciale',
    RHYTHM = 'rythme',
    SYNTACTIC_SPACE = 'espace_syntaxique',
    SIGN_ORDER = 'ordre_signes',
    SPATIAL_REFERENCE = 'references_spatiales',
    PROFORME = 'proformes'
}

/**
 * Types de transformation d'erreurs
 */
export enum ErrorTransformationType {
    // Transformations génériques
    INTENSITY = 'intensite',
    OMISSION = 'omission',
    SUBSTITUTION = 'substitution',

    // Transformations de mouvement
    AMPLITUDE = 'amplitude',
    DIRECTION = 'direction',
    REPETITION = 'repetition',

    // Transformations d'expressions faciales
    DESYNCHRONIZATION = 'desynchronisation',

    // Transformations de rythme
    ACCELERATION = 'acceleration',
    DECELERATION = 'ralentissement',
    INAPPROPRIATE_PAUSE = 'pause_inadequate',
    HESITATION = 'hesitation',
    FLUIDITY = 'fluidite',

    // Transformations d'espace syntaxique
    ZONE_CONFUSION = 'confusion_zones',
    REFERENCE_VIOLATION = 'non_respect_references',
    REDUCED_SPACE = 'espace_reduit',
    RANDOM_PLACEMENT = 'placement_aleatoire',
    LOCATION_OMISSION = 'oubli_localisation',

    // Transformations d'ordre des signes
    INVERSION = 'inversion',
    SUPERFLUOUS_ADDITION = 'ajout_superflu',
    UNNECESSARY_REPETITION = 'repetition_inutile',
    FRENCH_STRUCTURE = 'structure_calquee_francais',

    // Transformations de références spatiales
    AMBIGUOUS_REFERENCE = 'reference_ambigue',
    INCONSISTENT_REFERENCE = 'incoherence_reference',
    REFERENCE_OMISSION = 'oubli_reference',
    PRONOUN_CONFUSION = 'confusion_pronoms',
    SPATIAL_REORGANIZATION = 'reorganisation_spatiale',

    // Transformations de proformes
    INAPPROPRIATE_PROFORME = 'proforme_inapproprie',
    PROFORME_CONFUSION = 'confusion_proformes',
    EXCESSIVE_SIMPLIFICATION = 'simplification_excessive',
    PROFORME_OMISSION = 'omission_proforme',
    INCONSISTENT_USAGE = 'inconsistance_usage'
}

/**
 * Type pour une transformation d'erreur
 */
export type ErrorTransformation = {
    // Pour les transformations génériques de substitution
    from?: string;
    to?: string;

    // Pour les transformations avec un facteur
    factor?: number;

    // Pour les transformations de direction/rotation
    rotation?: string;
    degrees?: number;

    // Pour les transformations avec offset
    offset?: number;

    // Pour tous les types de transformation
    type?: ErrorTransformationType;
    probability: number;
};

/**
 * Type pour une transformation par défaut
 */
export type DefaultErrorTransformation = {
    severity: number;
    description: string;
};

/**
 * Type pour une catégorie d'erreur dans le catalogue
 */
export type ErrorCatalogEntry = {
    transformations: ErrorTransformation[];
    defaultTransformation: DefaultErrorTransformation;
};

/**
 * Type pour le catalogue complet d'erreurs
 */
export type ErrorCatalogType = Record<string, ErrorCatalogEntry>;

/**
 * Type pour une erreur appliquée
 */
export type AppliedError = {
    type: string;
    transformation: string | ErrorTransformation;
    severity?: number;
    description?: string;
    timestamp: string;
};

/**
 * Options pour la simulation d'erreurs
 */
export interface ErrorSimulationOptions {
    /** Taux d'erreurs à simuler (0-1) */
    errorRate: number;

    /** Domaines de faiblesse à cibler */
    weaknessAreas: string[];

    /** Niveau d'apprentissage de l'utilisateur */
    learnerLevel: string;

    /** Types d'erreurs à privilégier (optionnel) */
    preferredErrorTypes?: ErrorType[];

    /** Paramètres à privilégier (optionnel) */
    preferredParamTypes?: string[];
}

/**
 * Configuration pour la simulation d'erreurs
 */
export interface ErrorSimulationConfig {
    /**
     * Taux global d'erreur (0-1)
     */
    errorRate: number;

    /**
     * Types d'erreurs à simuler
     */
    errorTypes: string[];

    /**
     * IDs des concepts que l'utilisateur maîtrise (ne génère pas d'erreurs)
     */
    userMasteredConcepts: string[];

    /**
     * Distribution par catégorie (optionnel)
     */
    categoryDistribution?: Record<ErrorCategory, number>;

    /**
     * Fréquence par niveau CECRL (optionnel)
     */
    levelFrequency?: Record<string, number>;

    /**
     * Seuil de détection attendu (optionnel)
     */
    expectedDetectionThreshold?: number;

    /**
     * Modèles d'erreurs prédéfinis (optionnel)
     */
    errorPatterns?: Array<{
        category: string;
        pattern: string;
        examples: string[];
        frequency: number;
    }>;
}