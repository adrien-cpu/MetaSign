// src/ai/feedback/types/zone-validation.ts

import { Position3D } from '../validators/interfaces/ISpatialValidator';
// Suppression des imports non utilisés : ZoneDefinition, ZoneConstraint, ValidationIssue

/**
 * Représente l'utilisation d'une zone spatiale par une expression LSF
 */
export interface ZoneUsage {
    position: Position3D;
    duration: number;
    elements: string[];
    handshapes?: string[];
    movements?: string[];
}

/**
 * Représente une transition entre deux zones spatiales
 */
export interface ZoneTransition {
    fromZone: string;
    toZone: string;
    duration: number;
    path: Position3D[];
    handshapes?: string[];
    movements?: string[];
}

/**
 * Statistiques d'utilisation pour une zone spatiale spécifique
 */
export interface ZoneUsageStats {
    usageCount: number;
    occupancyRate: number;
    violations: Array<{
        type: string;
        count: number;
    }>;
    handshapeDistribution?: Record<string, number>;
    movementDistribution?: Record<string, number>;
    averageDuration?: number;
}

/**
 * Résultat de l'analyse d'utilisation des zones sur plusieurs expressions LSF
 */
export interface ZoneUtilizationAnalysis {
    totalUsage: number;
    zoneStats: Array<{
        zoneId: string;
        stats: ZoneUsageStats;
    }>;
    commonViolations: Array<{
        type: string;
        frequency: number;
        examples: string[];
    }>;
    recommendations: Array<{
        type: string;
        description: string;
        priority: number;
    }>;
    heatmap?: {
        zones: Record<string, number>;  // Identifier la fréquence d'utilisation des zones
        transitions: Record<string, number>;  // Fréquence des transitions entre zones
    };
}

/**
 * Résultat de validation d'une contrainte spécifique
 */
export interface ConstraintValidationResult {
    isValid: boolean;
    severity: 'low' | 'medium' | 'high';
    reason: string;
    // Remplacé "any" par un type plus précis
    context?: Record<string, unknown>;
}

/**
 * Options de configuration pour la validation de zone
 */
export interface ZoneValidationOptions {
    strictBoundaries?: boolean;  // Si vrai, les positions doivent être strictement à l'intérieur des limites
    toleranceThreshold?: number; // Seuil de tolérance pour les validations de positionnement
    validateHandshapes?: boolean; // Si vrai, valide les formes de main
    validateMovements?: boolean;  // Si vrai, valide les mouvements
    culturalContext?: string[];   // Contexte culturel à prendre en compte
    educationalMode?: boolean;    // Mode éducatif avec validations plus pédagogiques
    // Remplacé "any" par un type plus précis
    contextualData?: Record<string, unknown>; // Données contextuelles supplémentaires
}