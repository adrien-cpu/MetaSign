// src/ai/types/validators.ts

/**
 * Types de sévérité pour la validation
 */
export type ValidationSeverity = 'low' | 'medium' | 'high';

/**
 * Informations sur l'emplacement d'une validation
 */
export interface ValidationLocation {
    // Emplacement précis pour le debugging
    start?: number;
    end?: number;
    line?: number;
    column?: number;

    // Chemin pour naviguer dans les structures de données
    path?: string[];
    index?: number;
    property?: string;
    value?: unknown;
    context?: Record<string, unknown>;
}

/**
 * Configuration pour les validateurs
 */
export interface ValidationConfig {
    severity: ValidationSeverity;
    threshold: number;
    constraints: ValidationConstraint[];
}

/**
 * Contraintes utilisées dans la validation
 */
export interface ValidationConstraint {
    type: string;
    value: unknown;
    tolerance?: number;
}

/**
 * Options pour personnaliser le comportement des validateurs
 */
export interface ValidationOptions {
    strictMode: boolean;
    context: Record<string, unknown>;
}

/**
 * Interface commune pour tous les validateurs
 */
export interface IValidator {
    validate(data: unknown, options: ValidationOptions): ValidationResult;
}

/**
 * Poids associés aux différents niveaux de sévérité
 */
export const SeverityWeights: Record<ValidationSeverity, number> = {
    low: 0.1,
    medium: 0.2,
    high: 0.4
};

/**
 * Types de problèmes de validation possibles
 */
export type ValidationIssueType = 'rhythm' | 'synchronization' | 'transition' | 'pattern' | 'grammar' | 'emotion' | 'cultural';

/**
 * Problème de validation identifié
 */
export interface ValidationIssue {
    // Identifiant unique du type d'erreur
    code: string;

    // Type catégorisé du problème
    type: ValidationIssueType;

    // Description du problème
    message: string;

    // Niveau de gravité
    severity: ValidationSeverity;

    // Localisation du problème
    location: ValidationLocation;

    // Composant concerné (optionnel)
    component?: string;

    // Contexte supplémentaire (pour le debugging)
    context?: Record<string, unknown>;
}

/**
 * Paramètres pour la création d'un problème de validation
 */
export interface ValidationParams {
    code?: string;
    type: ValidationIssueType;
    severity: ValidationSeverity;
    location?: ValidationLocation;
    context?: Record<string, unknown>;
}

/**
 * Métriques de validation pour l'analyse de performance
 */
export interface ValidationMetrics {
    accuracy: number;
    confidence: number;
    performance: number;
    timestamp?: number;
}

/**
 * Résultat complet d'une validation
 */
export interface ValidationResult {
    // Indique si la validation est réussie
    isValid: boolean;

    // Liste des problèmes identifiés
    issues: ValidationIssue[];

    // Score de qualité (0-100)
    score: number;

    // Métriques détaillées (optionnelles)
    metrics?: ValidationMetrics;
}

/**
 * Fabrique de validateurs
 */
export interface IValidatorFactory {
    createValidator(type: string, config: ValidationConfig): IValidator;
}

/**
 * Contexte de validation pour le partage d'état
 */
export interface IValidationContext {
    getCurrentState(): Record<string, unknown>;
    getPreviousState(): Record<string, unknown>;
    getValidationHistory(): ValidationResult[];
}

/**
 * Interface pour les observateurs de validation
 */
export interface IValidationObserver {
    onValidationComplete(result: ValidationResult): void;
    onValidationIssue(issue: ValidationIssue): void;
}

/**
 * Options d'optimisation pour la validation
 */
export interface ValidationOptimizationOptions {
    parallelProcessing: boolean;
    batchSize?: number;
    prioritizeCritical: boolean;
    cacheResults: boolean;
    timeoutMs?: number;
}