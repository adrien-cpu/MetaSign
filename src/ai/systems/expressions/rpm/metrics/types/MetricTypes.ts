// src/ai/systems/expressions/rpm/metrics/types/MetricTypes.ts

/**
 * Types de tags possibles pour les métriques
 */
export type MetricTagValue = string | number | boolean;

export interface SystemMetrics {
    name: string;
    timestamp: number;
    value: number;
    unit: string;
    /** Tags avec des valeurs de types limités */
    tags: Record<string, MetricTagValue>;
    source: string;
    type: 'gauge' | 'counter' | 'timer' | 'histogram';
}

export interface MetricData {
    min: number;
    max: number;
    avg: number;
    sum: number;
    count: number;
    lastUpdate: number;
}

export interface TimeFrame {
    start: number;
    end: number;
    interval?: string;
}

export interface MetricQuery {
    timeFrame: TimeFrame;
    /** Filtres avec des valeurs de chaînes simples ou tableaux de chaînes */
    filters?: Record<string, string | string[]>;
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

export interface MetricValidation {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
}

export interface MetricTransformation {
    type: 'scale' | 'offset' | 'rate' | 'delta';
    value: number;
}

/**
 * Interface pour les métadonnées de métrique
 */
export interface MetricMetadata {
    /** Descriptions ou informations supplémentaires */
    description?: string;
    /** Niveau de criticité */
    criticality?: 'low' | 'medium' | 'high';
    /** Limites ou seuils associés */
    thresholds?: {
        warning?: number;
        critical?: number;
    };
    /** Propriétés de configuration supplémentaires */
    config?: Record<string, MetricTagValue>;
}