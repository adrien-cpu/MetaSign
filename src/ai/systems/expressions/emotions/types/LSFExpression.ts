// src/ai/systems/expressions/emotions/types/LSFExpression.ts

/**
 * Type représentant une expression en Langue des Signes Française
 */
export interface LSFExpression {
    /**
     * Identifiant unique de l'expression
     */
    id: string;

    /**
     * Éléments de base de l'expression
     */
    elements?: Array<{
        id?: string;
        type?: string;
        properties?: Record<string, unknown>;
    }>;

    /**
     * Séquences temporelles de l'expression
     */
    sequences?: Array<{
        id?: string;
        start?: number;
        duration?: number;
        elements?: string[];
    }>;

    /**
     * Positions spatiales des éléments de l'expression
     */
    positions?: Array<{
        id?: string;
        position?: { x: number; y: number; z: number };
        orientation?: { x: number; y: number; z: number };
        scale?: number;
    }>;

    /**
     * Significations sémantiques des éléments de l'expression
     */
    meanings?: Array<{
        id?: string;
        value?: string;
        context?: string[];
        relations?: string[];
    }>;

    /**
     * Métadonnées supplémentaires
     */
    metadata?: {
        createdAt?: number;
        modifiedAt?: number;
        author?: string;
        version?: string;
        locale?: string;
        tags?: string[];
    };
}