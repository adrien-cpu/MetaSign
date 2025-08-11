// src/ai/types/expressions.ts

/**
 * Configuration pour le traitement des expressions
 */
export interface ExpressionConfig {
    /**
     * Active la compression des expressions
     */
    compress?: boolean;

    /**
     * Niveau de compression (1-10)
     */
    compressionLevel?: number;

    /**
     * Active la mise en cache des résultats
     */
    cache?: boolean;

    /**
     * Configuration du timing
     */
    timing?: TimingConfig;
}

/**
 * Configuration du timing pour les expressions
 */
export interface TimingConfig {
    /**
     * Durée totale souhaitée (ms)
     */
    totalDuration?: number;

    /**
     * Durée minimale par expression (ms)
     */
    minDuration?: number;

    /**
     * Durée maximale par expression (ms)
     */
    maxDuration?: number;

    /**
     * Type de synchronisation
     */
    syncType?: 'sequential' | 'parallel' | 'overlap';

    /**
     * Temps de chevauchement pour le mode 'overlap' (ms)
     */
    overlapTime?: number;
}

/**
 * Métadonnées pour une expression
 */
export interface ExpressionMetadata {
    /**
     * Type d'expression
     */
    type?: string;

    /**
     * Priorité de l'expression (1-10)
     */
    priority?: number;

    /**
     * Intensité de l'expression (0.0-1.0)
     */
    intensity?: number;

    /**
     * Contexte culturel de l'expression
     */
    culturalContext?: string[];

    /**
     * Propriétés supplémentaires
     */
    [key: string]: unknown;
}

/**
 * Paramètres d'une expression
 */
export interface ExpressionParameters {
    /**
     * Paramètres pour les sourcils
     */
    eyebrows?: Record<string, number>;

    /**
     * Paramètres pour les yeux
     */
    eyes?: Record<string, number>;

    /**
     * Paramètres pour la bouche
     */
    mouth?: Record<string, number>;

    /**
     * Paramètres pour la tête
     */
    head?: Record<string, number>;

    /**
     * Paramètres pour le corps
     */
    body?: Record<string, number>;

    /**
     * Paramètres pour les mains
     */
    hands?: Record<string, number | string>;

    /**
     * Paramètres supplémentaires
     */
    [key: string]: unknown;
}

/**
 * Expression LSF de base
 */
export interface Expression {
    /**
     * Identifiant unique de l'expression
     */
    id: string;

    /**
     * Paramètres de l'expression
     */
    parameters: ExpressionParameters;

    /**
     * Durée recommandée (ms)
     */
    duration?: number;

    /**
     * Métadonnées de l'expression
     */
    metadata?: ExpressionMetadata;
}

/**
 * Expression planifiée avec timing
 */
export interface ScheduledExpression extends Expression {
    /**
     * Temps de début (ms)
     */
    startTime: number;

    /**
     * Temps de fin (ms)
     */
    endTime: number;

    /**
     * Fonction d'interpolation
     */
    easing?: string;
}

/**
 * Frame d'animation pour le rendu
 */
export interface ExpressionFrame {
    /**
     * Identifiant de l'expression
     */
    id: string;

    /**
     * Temps de début (ms)
     */
    start: number;

    /**
     * Temps de fin (ms)
     */
    end: number;

    /**
     * Paramètres de l'expression
     */
    parameters: ExpressionParameters;

    /**
     * Métadonnées supplémentaires
     */
    [key: string]: unknown;
}

/**
 * Résultat du traitement des expressions
 */
export interface ExpressionResult {
    /**
     * Frames générées pour l'animation
     */
    frames: ExpressionFrame[];

    /**
     * Métadonnées du résultat
     */
    metadata: {
        /**
         * Durée totale (ms)
         */
        duration: number;

        /**
         * Nombre d'expressions
         */
        expressionCount: number;

        /**
         * Indique si les expressions ont été optimisées
         */
        optimized: boolean;

        /**
         * Timestamp de génération
         */
        timestamp: number;

        /**
         * Métadonnées supplémentaires
         */
        [key: string]: unknown;
    };
}