/**
 * src/ai/api/common/validation/types/LSFTypes.ts
 * @file LSFTypes.ts
 * @description
 * Définit les types et interfaces utilisés pour la validation des expressions en Langue des Signes Française (LSF).
 * Inclut les règles de validation syntaxiques, sémantiques et culturelles, ainsi que les structures de données
 * pour représenter les expressions LSF.
 */

import { ErrorSeverity } from './ValidationTypes';

/**
 * Interface de base pour les règles de validation.
 */
export interface BaseValidationRule {
    /**
     * Identifiant unique de la règle.
     */
    id: string;

    /**
     * Description de la règle.
     */
    description: string;

    /**
     * Niveau de sévérité de la violation de cette règle.
     */
    severity: ErrorSeverity;

    /**
     * Message d'erreur en cas de violation.
     */
    errorMessage: string;

    /**
     * Indique si la règle est activée.
     */
    isEnabled: boolean;

    /**
     * Catégorie de la règle (facultatif).
     */
    category?: string;

    /**
     * Poids de la règle dans le processus de validation (facultatif).
     */
    weight?: number;
}

/**
 * Représente une expression en Langue des Signes Française (LSF).
 */
export interface LSFExpression {
    /**
     * Identifiant unique de l'expression.
     */
    id: string;

    /**
     * Type de l'expression (ex. : signe, composé, classificateur, dactylologie).
     */
    type: 'sign' | 'compound' | 'classifier' | 'fingerspelling';

    /**
     * Valeur textuelle ou représentation de l'expression.
     */
    value: string;

    /**
     * Paramètres associés à l'expression, tels que la forme de la main, la localisation, etc.
     */
    parameters: {
        handShape?: string | undefined;
        location?: string | undefined;
        movement?: string | undefined;
        orientation?: string | undefined;
        nonManual?: {
            facial?: string[] | undefined;
            head?: string[] | undefined;
            body?: string[] | undefined;
        } | undefined;
    };

    /**
     * Informations temporelles associées à l'expression.
     */
    timing: {
        start: number;
        duration: number;
        transitions?: {
            in?: number | undefined;
            out?: number | undefined;
        } | undefined;
    };

    /**
     * Contexte culturel, linguistique ou spatial associé à l'expression (facultatif).
     */
    context?: {
        cultural?: string[] | undefined;
        linguistic?: string[] | undefined;
        spatial?: {
            zone: string;
            reference?: string | undefined;
        } | undefined;
    } | undefined;

    /**
     * Métadonnées supplémentaires associées à l'expression (facultatif).
     */
    metadata?: Record<string, unknown> | undefined;
}

/**
 * Type représentant les différents types de règles syntaxiques en LSF.
 */
export type LSFSyntaxRuleType = 'sequence' | 'spatial' | 'temporal' | 'grammatical';

/**
 * Représente une règle syntaxique pour la validation des expressions LSF.
 */
export interface LSFSyntaxRule extends BaseValidationRule {
    /**
     * Type de la règle syntaxique (ex. : séquence, spatial, temporel, grammatical).
     */
    type: LSFSyntaxRuleType;

    /**
     * Conditions à vérifier pour valider la règle.
     */
    conditions: Array<(expr: LSFExpression) => boolean>;
}

/**
 * Représente une règle sémantique pour la validation des expressions LSF.
 */
export interface LSFSemanticRule extends BaseValidationRule {
    /**
     * Contexte dans lequel la règle s'applique.
     */
    context: string[];

    /**
     * Fonction de validation pour vérifier si l'expression respecte la règle.
     * 
     * @param expr Expression LSF à valider.
     * @param metadata Métadonnées supplémentaires pour la validation.
     * @returns `true` si la règle est respectée, sinon `false`.
     */
    validate: (expr: LSFExpression, metadata: Record<string, unknown>) => boolean;
}

/**
 * Représente une règle culturelle pour la validation des expressions LSF.
 */
export interface LSFCulturalRule extends BaseValidationRule {
    /**
     * Régions dans lesquelles la règle s'applique.
     */
    region: string[];

    /**
     * Contexte culturel dans lequel la règle s'applique.
     */
    context: string[];

    /**
     * Alternatives possibles pour respecter la règle (facultatif).
     */
    alternatives?: string[] | undefined;

    /**
     * Fonction de validation pour vérifier si l'expression respecte la règle.
     * 
     * @param expr Expression LSF à valider.
     * @returns `true` si la règle est respectée, sinon `false`.
     */
    validate: (expr: LSFExpression) => boolean;
}

/**
 * Type de mapping pour faciliter la conversion entre les types de règles LSF.
 */
export interface LSFRuleTypeMapping {
    /**
     * Règles syntaxiques.
     */
    syntax: LSFSyntaxRule;

    /**
     * Règles sémantiques.
     */
    semantic: LSFSemanticRule;

    /**
     * Règles culturelles.
     */
    cultural: LSFCulturalRule;
}