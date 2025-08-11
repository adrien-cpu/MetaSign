//src / ai / types / lsf / extended.ts
import { LSFExpression } from '@ai-types/lsf';

/**
 * Extension du type LSFExpression avec des propriétés détaillées
 * pour l'analyse de feedback.
 */
export interface LSFExpressionExtended extends LSFExpression {
    /**
     * Composantes manuelles de l'expression
     */
    manual?: {
        /** Configuration de la main */
        handshape?: string;
        /** Type de mouvement */
        movement?: string;
        /** Emplacement de signation */
        location?: string;
        /** Orientation de la main */
        orientation?: string;
    };

    /**
     * Composantes non-manuelles de l'expression
     */
    nonManual?: {
        /** Expressions faciales */
        facial?: Record<string, unknown>;
        /** Mouvements de la tête */
        head?: Record<string, unknown>;
        /** Posture corporelle */
        body?: Record<string, unknown>;
    };

    /**
     * Composantes spatiales de l'expression
     */
    spatial?: {
        /** Structure spatiale utilisée */
        structure?: Record<string, unknown>;
        /** Points de référence spatiaux */
        references?: Record<string, unknown>;
        /** Plans spatiaux utilisés */
        planes?: Record<string, unknown>;
    };

    /** Données de timing de l'expression */
    timing?: Record<string, unknown>;

    /** Données de séquençage */
    sequence?: Record<string, unknown>;

    /** Données sur les transitions */
    transitions?: Record<string, unknown>;

    /** Contexte de l'expression */
    context?: string;
}
