/**
 * Constantes globales pour le module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/constants.ts
 * @module ai/services/learning/types
 * @description Constantes, configurations par défaut et valeurs de référence
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-06-28
 */

import type { InteractionServiceConfig } from './interaction';
import { InteractionType, LearningLevel, LearningDifficulty, LearningMode } from './base';

/**
 * Constantes pour le module d'apprentissage
 * @const LEARNING_CONSTANTS
 */
export const LEARNING_CONSTANTS = {
    /** Types d'interactions valides */
    VALID_INTERACTION_TYPES: Object.values(InteractionType),

    /** Configuration par défaut du service d'interaction */
    DEFAULT_INTERACTION_SERVICE_CONFIG: {
        maxCacheSize: 1000,
        retentionTime: 24 * 60 * 60 * 1000, // 24 heures
        cleanupInterval: 60 * 60 * 1000, // 1 heure
        enableAutoAggregation: true,
        performanceThreshold: 2000, // 2 secondes
        batchSize: 100,
        maxFlushDelay: 30000 // 30 secondes
    } as const satisfies InteractionServiceConfig,

    /** Niveaux CECRL valides */
    VALID_CECRL_LEVELS: Object.values(LearningLevel),

    /** Difficultés valides */
    VALID_DIFFICULTIES: Object.values(LearningDifficulty),

    /** Modes d'apprentissage valides */
    VALID_LEARNING_MODES: Object.values(LearningMode),

    /** Seuils de performance */
    PERFORMANCE_THRESHOLDS: {
        EXCELLENT: 0.9,
        GOOD: 0.75,
        AVERAGE: 0.6,
        NEEDS_IMPROVEMENT: 0.4
    } as const,

    /** Limites système */
    SYSTEM_LIMITS: {
        MAX_SESSION_DURATION: 4 * 60 * 60 * 1000, // 4 heures
        MAX_INTERACTIONS_PER_SESSION: 1000,
        MAX_CACHE_ENTRIES: 10000,
        MIN_INTERACTION_DURATION: 100 // 100ms
    } as const,

    /** Types d'appareils supportés */
    SUPPORTED_DEVICE_TYPES: ['desktop', 'tablet', 'mobile', 'tv', 'vr', 'other'] as const,

    /** Systèmes d'exploitation supportés */
    SUPPORTED_OS: ['windows', 'macos', 'linux', 'ios', 'android', 'other'] as const,

    /** Messages d'erreur standardisés */
    ERROR_MESSAGES: {
        VALIDATION: {
            INVALID_INTERACTION: 'Structure d\'interaction invalide',
            INVALID_USER_ID: 'Identifiant utilisateur invalide',
            INVALID_ACTIVITY_ID: 'Identifiant d\'activité invalide',
            INVALID_DURATION: 'Durée d\'interaction invalide',
            INVALID_TIMESTAMP: 'Horodatage invalide',
            FUTURE_TIMESTAMP: 'La date d\'interaction ne peut pas être dans le futur',
            NEGATIVE_DURATION: 'La durée d\'interaction ne peut pas être négative',
            INVALID_TYPE: 'Type d\'interaction invalide',
            INVALID_DEVICE_INFO: 'Informations d\'appareil invalides',
            INVALID_DETAILS: 'Détails d\'interaction invalides'
        },
        SERVICE: {
            INITIALIZATION_FAILED: 'Échec de l\'initialisation du service',
            CACHE_OVERFLOW: 'Débordement du cache d\'interactions',
            PERSISTENCE_FAILED: 'Échec de la persistance des données',
            RETRIEVAL_FAILED: 'Échec de la récupération des données',
            CLEANUP_FAILED: 'Échec du nettoyage automatique'
        }
    } as const,

    /** Formats de données */
    DATE_FORMATS: {
        ISO_DATE: 'YYYY-MM-DD',
        ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
        DISPLAY_DATE: 'DD/MM/YYYY',
        DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm:ss'
    } as const,

    /** Patterns de validation */
    VALIDATION_PATTERNS: {
        USER_ID: /^[a-zA-Z0-9_-]{1,50}$/,
        ACTIVITY_ID: /^[a-zA-Z0-9_-]{1,100}$/,
        SESSION_ID: /^[a-zA-Z0-9_-]{1,100}$/
    } as const,

    /** Métriques de performance par défaut */
    DEFAULT_METRICS: {
        CACHE_HIT_RATIO_TARGET: 0.8, // 80% de hits
        RESPONSE_TIME_TARGET: 100, // 100ms
        SUCCESS_RATE_TARGET: 0.95, // 95% de succès
        ERROR_RATE_THRESHOLD: 0.05 // 5% d'erreurs max
    } as const,

    /** Configuration de pagination */
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 50,
        MAX_PAGE_SIZE: 1000,
        MIN_PAGE_SIZE: 1
    } as const,

    /** TTL (Time To Live) par défaut */
    DEFAULT_TTL: {
        INTERACTION_CACHE: 60 * 60 * 1000, // 1 heure
        STATISTICS_CACHE: 10 * 60 * 1000, // 10 minutes
        USER_SESSION: 2 * 60 * 60 * 1000, // 2 heures
        TEMPORARY_DATA: 5 * 60 * 1000 // 5 minutes
    } as const,

    /** Limites de taux (rate limiting) */
    RATE_LIMITS: {
        INTERACTIONS_PER_MINUTE: 100,
        INTERACTIONS_PER_HOUR: 1000,
        STATISTICS_REQUESTS_PER_MINUTE: 10,
        CACHE_CLEANUP_INTERVAL: 60 * 1000 // 1 minute
    } as const,

    /** Seuils d'alertes */
    ALERT_THRESHOLDS: {
        HIGH_ERROR_RATE: 0.1, // 10% d'erreurs
        LOW_SUCCESS_RATE: 0.8, // Moins de 80% de succès
        HIGH_RESPONSE_TIME: 1000, // Plus de 1 seconde
        CACHE_MEMORY_USAGE: 0.9, // 90% de la mémoire cache utilisée
        UNUSUAL_ACTIVITY_COUNT: 1000 // Plus de 1000 interactions par session
    } as const
} as const;

/**
 * Utilitaires pour les constantes d'apprentissage
 * @namespace LearningConstants
 */
export const LearningConstants = {
    /**
     * Vérifie si un type d'interaction est valide
     * @param type Type à vérifier
     * @returns true si le type est valide
     */
    isValidInteractionType(type: string): type is InteractionType {
        return LEARNING_CONSTANTS.VALID_INTERACTION_TYPES.includes(type as InteractionType);
    },

    /**
     * Vérifie si un niveau CECRL est valide
     * @param level Niveau à vérifier
     * @returns true si le niveau est valide
     */
    isValidCECRLevel(level: string): level is LearningLevel {
        return LEARNING_CONSTANTS.VALID_CECRL_LEVELS.includes(level as LearningLevel);
    },

    /**
     * Vérifie si une difficulté est valide
     * @param difficulty Difficulté à vérifier
     * @returns true si la difficulté est valide
     */
    isValidDifficulty(difficulty: string): difficulty is LearningDifficulty {
        return LEARNING_CONSTANTS.VALID_DIFFICULTIES.includes(difficulty as LearningDifficulty);
    },

    /**
     * Vérifie si un mode d'apprentissage est valide
     * @param mode Mode à vérifier
     * @returns true si le mode est valide
     */
    isValidLearningMode(mode: string): mode is LearningMode {
        return LEARNING_CONSTANTS.VALID_LEARNING_MODES.includes(mode as LearningMode);
    },

    /**
     * Obtient la configuration par défaut selon l'environnement
     * @param environment Environnement (development, test, production)
     * @returns Configuration adaptée à l'environnement
     */
    getEnvironmentConfig(environment: 'development' | 'test' | 'production' = 'production'): InteractionServiceConfig {
        const baseConfig = LEARNING_CONSTANTS.DEFAULT_INTERACTION_SERVICE_CONFIG;

        switch (environment) {
            case 'development':
                return {
                    ...baseConfig,
                    maxCacheSize: 100,
                    retentionTime: 60 * 60 * 1000, // 1 heure
                    cleanupInterval: 30 * 60 * 1000, // 30 minutes
                    performanceThreshold: 5000 // 5 secondes pour le dev
                };

            case 'test':
                return {
                    ...baseConfig,
                    maxCacheSize: 50,
                    retentionTime: 10 * 60 * 1000, // 10 minutes
                    cleanupInterval: 5 * 60 * 1000, // 5 minutes
                    enableAutoAggregation: false,
                    performanceThreshold: 1000 // 1 seconde pour les tests
                };

            case 'production':
            default:
                return baseConfig;
        }
    },

    /**
     * Formate une durée en format lisible
     * @param milliseconds Durée en millisecondes
     * @returns Chaîne formatée
     */
    formatDuration(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    },

    /**
     * Calcule un score de performance normalisé
     * @param score Score brut
     * @param maxScore Score maximum possible
     * @returns Score normalisé entre 0 et 1
     */
    normalizeScore(score: number, maxScore: number): number {
        if (maxScore <= 0) return 0;
        return Math.max(0, Math.min(1, score / maxScore));
    },

    /**
     * Détermine le niveau de performance basé sur un score
     * @param score Score normalisé (0-1)
     * @returns Niveau de performance
     */
    getPerformanceLevel(score: number): 'excellent' | 'good' | 'average' | 'needs_improvement' | 'poor' {
        if (score >= LEARNING_CONSTANTS.PERFORMANCE_THRESHOLDS.EXCELLENT) return 'excellent';
        if (score >= LEARNING_CONSTANTS.PERFORMANCE_THRESHOLDS.GOOD) return 'good';
        if (score >= LEARNING_CONSTANTS.PERFORMANCE_THRESHOLDS.AVERAGE) return 'average';
        if (score >= LEARNING_CONSTANTS.PERFORMANCE_THRESHOLDS.NEEDS_IMPROVEMENT) return 'needs_improvement';
        return 'poor';
    }
} as const;