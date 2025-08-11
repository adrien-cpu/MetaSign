// src/ai/systems/expressions/situations/educational/special_needs/adaptations/types/supplementary.types.ts

import {
    CustomRecord,
    AdaptationIntensity,
    FatigueLevel,
    PerformanceLevel,
    FocusType,
    PriorityType
} from './adaptation-types';

/**
 * Interface pour les accommodations d'apprentissage
 */
export interface Accommodations {
    /** Liste des types d'accommodations */
    accommodations: string[];
    /** Niveau d'accommodation (1-5) */
    level?: number;
    /** Métadonnées d'accommodation */
    metadata?: { [key: string]: unknown };
}

/**
 * Interface pour les optimisations environnementales
 */
export interface Optimizations {
    /** Liste des types d'optimisations */
    optimizations: string[];
    /** Priorité des optimisations */
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    /** Métadonnées d'optimisation */
    metadata?: { [key: string]: unknown };
}

/**
 * Interface pour l'historique d'adaptation
 */
export interface AdaptationHistory {
    /** Liste des adaptations appliquées */
    adaptations: Array<{
        /** Type d'adaptation */
        type: string;
        /** Timestamp d'application */
        timestamp: number;
        /** Efficacité mesurée */
        effectiveness: number;
    }>;
    /** Statistiques d'utilisation */
    statistics: {
        /** Nombre total d'adaptations */
        totalAdaptations: number;
        /** Efficacité moyenne */
        averageEffectiveness: number;
        /** Types les plus utilisés */
        mostUsedTypes: string[];
    };
}

/**
 * Interface pour les préférences d'apprentissage
 */
export interface LearningPreferences {
    /** Modalité préférée */
    preferredModality: string;
    /** Rythme préféré */
    preferredPace: AdaptationIntensity;
    /** Niveau de détail préféré */
    detailLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    /** Préférences de support cognitif */
    cognitiveSupport: {
        /** Niveau global de support */
        level: number;
        /** Types de support préférés */
        preferredTypes: string[];
    };
}

/**
 * Interface pour les profils de performance
 */
export interface PerformanceProfile {
    /** Niveau global de performance */
    globalLevel: PerformanceLevel;
    /** Domaines de force */
    strengths: string[];
    /** Domaines à améliorer */
    areasToImprove: string[];
    /** Historique de performances */
    history: Array<{
        /** Timestamp de l'évaluation */
        timestamp: number;
        /** Score obtenu */
        score: number;
        /** Domaine évalué */
        domain: string;
    }>;
}

/**
 * Interface pour les recommandations ciblées
 */
export interface TargetedRecommendation {
    /** ID de recommandation */
    id: string;
    /** Type de focus */
    focusType: FocusType;
    /** Priorité */
    priority: PriorityType;
    /** Description */
    description: string;
    /** Raison */
    rationale: string;
    /** Métriques attendues */
    expectedMetrics: {
        /** Impact prévu */
        impact: number;
        /** Effort requis */
        effort: number;
        /** Efficacité à long terme */
        longTermEffectiveness: number;
    };
}

export type {
    CustomRecord as Record,
    AdaptationIntensity,
    FatigueLevel,
    PerformanceLevel,
    FocusType,
    PriorityType
};