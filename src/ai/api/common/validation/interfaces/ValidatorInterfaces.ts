/**
 * src/ai/api/common/validation/interfaces/ValidationInterfaces.ts
 * @file ValidatorInterfaces.ts
 * @description
 * Définit les interfaces pour les systèmes de validation, y compris les contextes de validation,
 * les résultats de validation, et les systèmes spécifiques tels que les expressions, la grammaire,
 * l'éthique et la sécurité.
 */

import { ErrorSeverity } from '../types/ValidationTypes';

/**
 * Interface représentant le contexte d'une validation.
 */
export interface IValidationContext {
    /**
     * Horodatage de la validation.
     */
    timestamp: number;

    /**
     * Environnement dans lequel la validation est effectuée (ex. : "production", "test").
     */
    environment: string;

    /**
     * Type de validation (expression, grammaire, éthique ou sécurité).
     */
    type: 'expression' | 'grammar' | 'ethics' | 'security';

    /**
     * Métadonnées supplémentaires associées au contexte de validation.
     */
    metadata?: Record<string, unknown>;
}

/**
 * Interface représentant le résultat d'une validation.
 */
export interface IValidationResult {
    /**
     * Indique si la validation a réussi.
     */
    isValid: boolean;

    /**
     * Liste des erreurs rencontrées lors de la validation.
     */
    errors: Array<{
        /**
         * Code unique de l'erreur.
         */
        code: string;

        /**
         * Message décrivant l'erreur.
         */
        message: string;

        /**
         * Sévérité de l'erreur.
         */
        severity: ErrorSeverity;

        /**
         * Contexte supplémentaire associé à l'erreur.
         */
        context?: Record<string, unknown>;
    }>;

    /**
     * Liste des avertissements rencontrés lors de la validation (facultatif).
     */
    warnings?: Array<{
        /**
         * Code unique de l'avertissement.
         */
        code: string;

        /**
         * Message décrivant l'avertissement.
         */
        message: string;

        /**
         * Suggestion pour résoudre l'avertissement (facultatif).
         */
        suggestion?: string;
    }>;

    /**
     * Métadonnées associées au résultat de la validation.
     */
    metadata: {
        /**
         * Horodatage de la validation.
         */
        validatedAt: number;

        /**
         * Durée de la validation en millisecondes.
         */
        duration: number;

        /**
         * Nom ou identifiant du validateur utilisé.
         */
        validator: string;
    };
}

/**
 * Interface pour le système de validation des expressions.
 */
export interface IExpressionSystem {
    /**
     * Valide une expression donnée dans un contexte spécifique.
     * 
     * @param context Contexte de validation.
     * @returns Résultat de la validation.
     */
    validateExpression(context: IValidationContext): Promise<IValidationResult>;

    /**
     * Valide une séquence d'expressions dans un contexte spécifique.
     * 
     * @param expressions Liste des expressions à valider.
     * @param context Contexte de validation.
     * @returns Résultat de la validation.
     */
    validateSequence(expressions: unknown[], context: IValidationContext): Promise<IValidationResult>;
}

/**
 * Interface pour le système de validation de la grammaire LSF.
 */
export interface ILSFGrammarSystem {
    /**
     * Valide la grammaire dans un contexte spécifique.
     * 
     * @param context Contexte de validation.
     * @returns Résultat de la validation.
     */
    validateGrammar(context: IValidationContext): Promise<IValidationResult>;

    /**
     * Valide la structure des éléments dans un contexte spécifique.
     * 
     * @param elements Liste des éléments à valider.
     * @param context Contexte de validation.
     * @returns Résultat de la validation.
     */
    validateStructure(elements: unknown[], context: IValidationContext): Promise<IValidationResult>;
}

/**
 * Interface pour le système de vérification de l'éthique.
 */
export interface IEthicsChecker {
    /**
     * Valide un contexte selon des règles éthiques.
     * 
     * @param context Contexte de validation.
     * @returns Résultat de la validation.
     */
    validate(context: IValidationContext): Promise<IValidationResult>;

    /**
     * Vérifie la conformité à une liste de règles éthiques.
     * 
     * @param rules Liste des règles à vérifier.
     * @returns `true` si toutes les règles sont respectées, sinon `false`.
     */
    checkCompliance(rules: string[]): Promise<boolean>;
}