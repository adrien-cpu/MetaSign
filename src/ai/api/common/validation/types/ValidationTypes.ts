/**
 * src/ai/api/common/validation/types/ValidationTypes.ts
 * @file ValidationTypes.ts
 * @description
 * Fournit les types et interfaces utilisés dans le système de validation, y compris les erreurs,
 * avertissements, métadonnées, résultats et options de validation.
 */

/**
 * Niveaux de sévérité des erreurs.
 */
export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * Représente une erreur de validation.
 */
export interface ValidationError {
    /**
     * Code d'erreur unique.
     */
    code: string;

    /**
     * Message d'erreur explicatif.
     */
    message: string;

    /**
     * Sévérité de l'erreur.
     */
    severity: ErrorSeverity | 'error' | 'warning' | 'info';

    /**
     * Champ concerné par l'erreur (facultatif).
     */
    field?: string;

    /**
     * Horodatage de l'erreur (facultatif).
     */
    timestamp?: number;

    /**
     * Détails supplémentaires sur l'erreur (facultatif).
     */
    details?: unknown | Record<string, unknown>;

    /**
     * Contexte dans lequel l'erreur s'est produite (facultatif).
     */
    context?: Record<string, unknown>;
}

/**
 * Représente un avertissement de validation.
 */
export interface ValidationWarning {
    /**
     * Code d'avertissement unique.
     */
    code: string;

    /**
     * Message d'avertissement explicatif.
     */
    message: string;

    /**
     * Impact de l'avertissement.
     */
    impact: 'low' | 'medium' | 'high';

    /**
     * Suggestion pour résoudre l'avertissement (facultatif).
     */
    suggestion?: string;

    /**
     * Horodatage de l'avertissement (facultatif).
     */
    timestamp?: number;

    /**
     * Contexte dans lequel l'avertissement s'est produit (facultatif).
     */
    context?: Record<string, unknown>;

    /**
     * Détails supplémentaires sur l'avertissement (facultatif).
     */
    details?: unknown;
}

/**
 * Métadonnées associées à une validation.
 */
export interface ValidationMetadata {
    /**
     * Moment où la validation a été effectuée (facultatif).
     */
    validatedAt?: number;

    /**
     * Durée de la validation en millisecondes (facultatif).
     */
    duration?: number;

    /**
     * Identifiant du validateur (facultatif).
     */
    validator?: string;

    /**
     * Version du validateur (facultatif).
     */
    version?: string;

    /**
     * Configuration utilisée pour la validation (facultatif).
     */
    configuration?: {
        rules?: {
            syntax?: number;
            semantic?: number;
            cultural?: number;
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };

    /**
     * Contexte de validation (facultatif).
     */
    context?: {
        environment?: string;
        userContext?: Record<string, unknown>;
        systemContext?: Record<string, unknown>;
        [key: string]: unknown;
    };

    /**
     * Propriétés additionnelles (facultatif).
     */
    [key: string]: unknown;
}

/**
 * Définit le résultat d'une validation.
 */
export interface ValidationResult<T = unknown> {
    /**
     * Indique si la validation a réussi.
     */
    success: boolean;

    /**
     * Alias pour la compatibilité arrière.
     * @deprecated Utiliser `success` à la place.
     */
    isValid?: boolean;

    /**
     * Données validées (facultatif).
     */
    data?: T;

    /**
     * Erreurs rencontrées lors de la validation (facultatif).
     */
    errors?: ValidationError[];

    /**
     * Avertissements rencontrés lors de la validation (facultatif).
     */
    warnings?: ValidationWarning[];

    /**
     * Métadonnées associées à la validation (facultatif).
     */
    metadata?: ValidationMetadata;
}

/**
 * Options configurables pour la validation.
 */
export interface ValidationOptions {
    /**
     * Ignorer la validation syntaxique (facultatif).
     */
    skipSyntaxValidation?: boolean;

    /**
     * Ignorer la validation sémantique (facultatif).
     */
    skipSemanticValidation?: boolean;

    /**
     * Ignorer la validation culturelle (facultatif).
     */
    skipCulturalValidation?: boolean;

    /**
     * Sévérité minimale des erreurs à signaler (facultatif).
     */
    minErrorSeverity?: ErrorSeverity;

    /**
     * Contexte de validation (facultatif).
     */
    context?: ValidationContext;
}

/**
 * Contexte de validation pour stocker des informations additionnelles.
 */
export interface ValidationContext {
    /**
     * Identifiant de l'utilisateur (facultatif).
     */
    userId?: string;

    /**
     * Identifiant de session (facultatif).
     */
    sessionId?: string;

    /**
     * Identifiant de requête (facultatif).
     */
    requestId?: string;

    /**
     * Horodatage de la requête (facultatif).
     */
    timestamp?: number;

    /**
     * Environnement dans lequel la validation est effectuée (ex. : "dev", "test", "prod").
     */
    environment?: string;

    /**
     * Propriétés additionnelles (facultatif).
     */
    [key: string]: unknown;
}