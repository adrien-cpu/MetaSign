/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/services/SpatialAnalysisServiceTypes.ts
 * @description Types fallback pour SpatialAnalysisService
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

/**
 * Interface pour une zone référentielle LSF
 */
export interface LSFReferentialZone {
    /** Identifiant unique de la zone */
    id: string;

    /** Nom de la zone */
    name: string;

    /** Zone établie ou non */
    established: boolean;

    /** Fréquence d'utilisation (0-1) */
    usage_frequency: number;

    /** Consistance de la zone (0-1) */
    consistency: number;

    /** Rôle sémantique */
    semanticRole: string;

    /** Coordonnées de la zone */
    coordinates: {
        x: [number, number];
        y: [number, number];
        z: [number, number];
    };
}