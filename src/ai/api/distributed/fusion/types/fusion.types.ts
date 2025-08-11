/**
 * src/ai/api/disttributed/types/FusionTypes.ts
 * @file FusionTypes.ts
 * @description Types pour la fusion de résultats dans un système distribué
 * Types pour le système de fusion
 */
import { ProcessingResult, DistributedResult, ResultMetadata } from '@distributed/types/DistributedTypes';

/**
 * Type pour les stratégies de fusion
 */
export type FusionStrategy = (data: unknown[], confidences: number[]) => unknown;

/**
 * Options pour la fusion de résultats
 */
export interface FusionOptions {
    /**
     * Stratégie de fusion à utiliser
     */
    strategy?: string;

    /**
     * Niveau d'optimisation à appliquer aux résultats
     */
    optimizationLevel?: 'none' | 'minimal' | 'standard' | 'aggressive';

    /**
     * Délai d'attente maximal pour la fusion (ms)
     */
    timeout?: number;

    /**
     * Nombre maximum de résultats à fusionner
     */
    maxResults?: number;
}

/**
 * Interface étendue pour les résultats de traitement
 */
export interface EnhancedProcessingResult extends ProcessingResult {
    /**
     * Données du résultat
     */
    data: unknown;

    /**
     * Niveau de confiance (0-1)
     */
    confidence: number;

    /**
     * Source du résultat
     */
    source?: string;

    /**
     * Signature de vérification
     */
    signature?: string;

    /**
     * Horodatage de création
     */
    timestamp?: number;

    /**
     * Temps de traitement (ms)
     */
    processingTime?: number;

    /**
     * Métadonnées additionnelles
     */
    metadata?: Record<string, unknown>;
}

/**
 * Interface étendue pour les résultats distribués
 */
export interface EnhancedDistributedResult extends DistributedResult {
    /**
     * Horodatage de fusion
     */
    timestamp: number;

    /**
     * Sources des résultats fusionnés
     */
    sources: string[];

    /**
     * Temps total de traitement (ms)
     */
    processingTime: number;
}