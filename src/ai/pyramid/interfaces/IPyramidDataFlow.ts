// src/ai/pyramid/interfaces/IPyramidDataFlow.ts

import { PyramidLevelType } from '../types';

/**
 * Définit la structure de données de base pour les entrées/sorties de la pyramide
 */
export interface PyramidData {
    // Champs communs à toutes les données
    timestamp: number;
    source: string;
    version: string;

    // Identifiant optionnel
    id?: string;

    // Données spécifiques
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
 * Options pour le traitement des données
 */
export interface ProcessingOptions {
    // Priorité du traitement
    priority?: 'low' | 'normal' | 'high';

    // Délai maximal d'exécution en ms
    timeout?: number;

    // Conservation des métadonnées
    retainMetadata?: boolean;

    // Contexte additionnel
    context?: Record<string, unknown>;

    // Niveaux à ignorer pendant le traitement
    skipLevels?: PyramidLevelType[];

    // Paramètres spécifiques aux niveaux
    levelOptions?: Record<string, unknown>;

    // Force le retraitement même si en cache
    forceReprocess?: boolean;

    // Autres options
    [key: string]: unknown;
}

/**
 * Métadonnées associées au traitement
 */
export interface PyramidMetadata {
    // Chemin de traitement (ordre des niveaux traversés)
    processingPath: PyramidLevelType[];

    // Niveaux traversés
    processedBy?: PyramidLevelType[];

    // Temps de traitement total en ms
    processingTime: number;

    // Niveau de départ
    sourceLevel: PyramidLevelType;

    // Niveau cible/final
    targetLevel: PyramidLevelType;

    // Transformations appliquées
    transformations?: string[];

    // Horodatage de fin de traitement
    completedAt?: number;

    // Message d'erreur en cas d'échec
    error?: string;

    // Attributs supplémentaires
    [key: string]: unknown;
}

/**
 * Résultat du traitement des données dans la pyramide
 */
export interface ProcessingResult<T extends PyramidData> {
    // Données après traitement
    data: T;

    // Métadonnées sur le traitement
    metadata: PyramidMetadata;

    // Statut du traitement
    status: ProcessingStatus;

    // Erreurs éventuelles
    errors?: {
        level: PyramidLevelType;
        code: string;
        message: string;
    }[];
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

/**
 * Interface définissant les opérations de flux de données entre les niveaux de la pyramide.
 * Permet une communication bidirectionnelle à travers la structure pyramidale.
 */
export interface IPyramidDataFlow {
    /**
     * Traite les données en remontant la pyramide (de la base vers le sommet)
     * @param data Données à traiter
     * @param sourceLevel Niveau d'où proviennent les données
     * @param options Options de traitement
     * @returns Données traitées après passage par les niveaux supérieurs
     */
    processUp<T extends PyramidData>(
        data: T,
        sourceLevel: PyramidLevelType,
        options?: ProcessingOptions
    ): Promise<ProcessingResult<T>>;

    /**
     * Traite les données en descendant la pyramide (du sommet vers la base)
     * @param data Données à traiter
     * @param sourceLevel Niveau d'où proviennent les données
     * @param options Options de traitement
     * @returns Données traitées après passage par les niveaux inférieurs
     */
    processDown<T extends PyramidData>(
        data: T,
        sourceLevel: PyramidLevelType,
        options?: ProcessingOptions
    ): Promise<ProcessingResult<T>>;

    /**
     * Vérifie si un niveau est disponible pour le traitement
     * @param level Niveau à vérifier
     * @returns true si le niveau est disponible
     */
    isLevelAvailable(level: PyramidLevelType): boolean;

    /**
     * Obtient la liste de tous les niveaux actifs dans la pyramide
     * @returns Liste des niveaux actifs
     */
    getActiveLevels(): PyramidLevelType[];
}