// src/ai/pyramid/types/explorer.ts

import { PyramidData } from './index';

/**
 * Types des modèles de prédiction
 */
export interface PredictionModel {
    type: 'timeSeries' | 'nlp' | 'reinforcement' | 'bayesian' | 'lstm';
    confidence: number;
    parameters?: Record<string, unknown>;
}

/**
 * Structure des prédictions générées
 */
export interface Prediction {
    prediction: string;
    confidence: number;
    horizon: string;
    timestamp: number;
}

/**
 * Types de prédictions par domaine
 */
export interface Predictions {
    userBehavior?: Prediction;
    linguisticTrends?: Prediction;
    interactionPatterns?: Prediction;
    culturalContext?: Prediction;
    technologicalTrends?: Prediction;
    [key: string]: Prediction | undefined;
}

/**
 * Métadonnées du niveau explorateur
 */
export interface ExplorerMetadata {
    processId: string;
    processingTimestamp: number;
    confidence: number;
}

/**
 * Structure de données traitées par le niveau explorateur
 */
export interface ExplorerProcessedData {
    predictions: Predictions;
    innovationPatterns: string[];
    explorerMetadata: ExplorerMetadata;
    [key: string]: unknown;
}

/**
 * Structure de l'événement émis lors du traitement des données
 */
export interface ExplorerEvent {
    level: string;
    action: string;
    data: ExplorerProcessedData;
}

/**
 * Type spécifique pour les entrées de données
 */
export type ExplorerInputData = Record<string, unknown>;