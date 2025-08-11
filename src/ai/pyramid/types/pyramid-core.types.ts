/**
 * Types fondamentaux pour le système de la pyramide IA
 * Ce fichier définit les interfaces principales utilisées pour le traitement des données
 * dans la pyramide, ainsi que les structures de métriques de performance
 */

/**
 * Interface de base pour toutes les données traitées par la pyramide
 * Toutes les données passant par la pyramide doivent étendre cette interface
 */
export interface PyramidData {
    id?: string;
    timestamp?: number;
    [key: string]: unknown;
}

/**
 * Statut du résultat de traitement
 */
export enum ProcessingStatus {
    SUCCESS = 'success',
    ERROR = 'error',
    PARTIAL = 'partial',
    PENDING = 'pending'
}

/**
 * Métadonnées associées au traitement
 */
export interface PyramidMetadata {
    // Chemin de traitement (ordre des niveaux traversés)
    processingPath: string[];

    // Temps de traitement total en ms
    processingTime: number;

    // Niveau de départ
    sourceLevel: string;

    // Niveau cible/final
    targetLevel: string;

    // Message d'erreur en cas d'échec
    error?: string;

    // Attributs supplémentaires optionnels
    [key: string]: unknown;
}

/**
 * Options de traitement
 */
export interface ProcessingOptions {
    // Priorité du traitement (plus élevé = plus prioritaire)
    priority?: number;

    // Délai maximal d'exécution en ms
    timeout?: number;

    // Niveaux à ignorer pendant le traitement
    skipLevels?: string[];

    // Paramètres spécifiques aux niveaux
    levelOptions?: Record<string, unknown>;

    // Force le retraitement même si en cache
    forceReprocess?: boolean;

    // Attributs supplémentaires optionnels
    [key: string]: unknown;
}

/**
 * Structure du résultat de traitement
 */
export interface ProcessingResult<T extends PyramidData> {
    // Données résultantes du traitement
    data: T;

    // Métadonnées associées au traitement
    metadata: PyramidMetadata;

    // Statut du traitement
    status: ProcessingStatus;
}

/**
 * Structure des métriques de performance de la pyramide
 */
export interface PyramidMetrics {
    // Temps de traitement moyen (ms)
    processingTime: {
        upward: number;
        downward: number;
    };

    // Taux de réussite (0-1)
    successRate: {
        upward: number;
        downward: number;
    };

    // Débit (requêtes par seconde)
    throughput: {
        upward: number;
        downward: number;
    };
}