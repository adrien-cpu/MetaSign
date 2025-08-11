/**
 * @file src/ai/services/learning/metrics/utils/MetricsUtils.ts
 * @description Utilitaires pour les métriques d'apprentissage
 * @module MetricsUtils
 * @requires @/ai/services/learning/metrics/types/MetricsTypes
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module fournit des fonctions utilitaires pour le traitement des métriques
 * d'apprentissage, y compris le nettoyage, la validation et les transformations.
 */

import { MetricHistoryEntry } from '../types/MetricsTypes';

/**
 * Nettoie l'historique des métriques en conservant un nombre limité d'entrées
 * 
 * @function cleanupHistory
 * @param {MetricHistoryEntry[]} history - Historique des métriques
 * @param {number} [maxEntries=100] - Nombre maximum d'entrées à conserver
 * @returns {MetricHistoryEntry[]} Historique nettoyé
 * @public
 */
export function cleanupHistory(
    history: MetricHistoryEntry[],
    maxEntries = 100
): MetricHistoryEntry[] {
    if (history.length <= maxEntries) {
        return history;
    }

    // Trier par date décroissante
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Conserver les N plus récentes
    return history.slice(0, maxEntries);
}

/**
 * Valide une valeur de métrique selon son type attendu
 * 
 * @function validateMetricValue
 * @param {unknown} value - Valeur à valider
 * @param {string} type - Type attendu
 * @returns {boolean} Vrai si la valeur est valide
 * @public
 */
export function validateMetricValue(value: unknown, type: string): boolean {
    switch (type) {
        case 'number':
            return typeof value === 'number' && !isNaN(value);

        case 'string':
            return typeof value === 'string';

        case 'boolean':
            return typeof value === 'boolean';

        case 'object':
            return typeof value === 'object' && value !== null;

        case 'array':
            return Array.isArray(value);

        case 'date':
            return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));

        default:
            return true; // Accepter toute valeur si le type n'est pas spécifié
    }
}

/**
 * Formate une valeur de métrique pour l'affichage
 * 
 * @function formatMetricValue
 * @param {unknown} value - Valeur à formater
 * @param {string} [unit] - Unité de mesure
 * @param {number} [precision] - Précision pour les nombres
 * @returns {string} Valeur formatée
 * @public
 */
export function formatMetricValue(
    value: unknown,
    unit?: string,
    precision?: number
): string {
    if (value === undefined || value === null) {
        return 'N/A';
    }

    if (typeof value === 'number') {
        // Formater le nombre avec la précision spécifiée
        const formattedNumber = precision !== undefined
            ? value.toFixed(precision)
            : value.toString();

        // Ajouter l'unité si spécifiée
        return unit ? `${formattedNumber} ${unit}` : formattedNumber;
    }

    if (value instanceof Date) {
        return value.toLocaleString();
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
}

/**
 * Calcule des statistiques de base sur un ensemble de valeurs
 * 
 * @function calculateStatistics
 * @param {number[]} values - Valeurs à analyser
 * @returns {{ min: number; max: number; avg: number; median: number; stdDev: number }} Statistiques
 * @public
 */
export function calculateStatistics(values: number[]): {
    min: number;
    max: number;
    avg: number;
    median: number;
    stdDev: number;
} {
    if (values.length === 0) {
        return {
            min: 0,
            max: 0,
            avg: 0,
            median: 0,
            stdDev: 0
        };
    }

    // Valeurs min et max
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Moyenne
    const sum = values.reduce((total, val) => total + val, 0);
    const avg = sum / values.length;

    // Médiane
    const sortedValues = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sortedValues.length / 2);
    const median = sortedValues.length % 2 === 0
        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
        : sortedValues[mid];

    // Écart-type
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const variance = squaredDiffs.reduce((total, val) => total + val, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
        min,
        max,
        avg,
        median,
        stdDev
    };
}

/**
 * Détecte les valeurs aberrantes dans un ensemble de valeurs
 * 
 * @function detectOutliers
 * @param {number[]} values - Valeurs à analyser
 * @param {number} [threshold=1.5] - Seuil pour la détection (méthode IQR)
 * @returns {number[]} Indices des valeurs aberrantes
 * @public
 */
export function detectOutliers(values: number[], threshold = 1.5): number[] {
    if (values.length < 4) {
        return [];
    }

    // Trier les valeurs
    const sortedValues = [...values].sort((a, b) => a - b);

    // Calculer les quartiles
    const q1Index = Math.floor(sortedValues.length * 0.25);
    const q3Index = Math.floor(sortedValues.length * 0.75);

    const q1 = sortedValues[q1Index];
    const q3 = sortedValues[q3Index];

    // Calculer l'écart interquartile (IQR)
    const iqr = q3 - q1;

    // Définir les limites
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;

    // Détecter les valeurs aberrantes
    return values.reduce((indices, value, index) => {
        if (value < lowerBound || value > upperBound) {
            indices.push(index);
        }
        return indices;
    }, [] as number[]);
}

/**
 * Normalise un ensemble de valeurs sur une plage spécifiée
 * 
 * @function normalizeValues
 * @param {number[]} values - Valeurs à normaliser
 * @param {number} [min=0] - Minimum de la plage cible
 * @param {number} [max=1] - Maximum de la plage cible
 * @returns {number[]} Valeurs normalisées
 * @public
 */
export function normalizeValues(values: number[], min = 0, max = 1): number[] {
    if (values.length === 0) {
        return [];
    }

    // Trouver les valeurs min et max actuelles
    const currentMin = Math.min(...values);
    const currentMax = Math.max(...values);

    // Si toutes les valeurs sont identiques, renvoyer la moyenne de la plage cible
    if (currentMin === currentMax) {
        return values.map(() => (min + max) / 2);
    }

    // Normaliser les valeurs
    return values.map(value => {
        const normalized = (value - currentMin) / (currentMax - currentMin);
        return normalized * (max - min) + min;
    });
}

/**
 * Agrège un ensemble de valeurs selon une fonction spécifiée
 * 
 * @function aggregateValues
 * @param {unknown[]} values - Valeurs à agréger
 * @param {string} aggregation - Fonction d'agrégation
 * @returns {unknown} Valeur agrégée
 * @public
 */
export function aggregateValues(
    values: unknown[],
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last'
): unknown {
    if (values.length === 0) {
        return null;
    }

    // Filtrer les valeurs numériques
    const numericValues = values.filter(val => typeof val === 'number') as number[];

    switch (aggregation) {
        case 'sum':
            return numericValues.reduce((total, val) => total + val, 0);

        case 'avg':
            if (numericValues.length === 0) return null;
            return numericValues.reduce((total, val) => total + val, 0) / numericValues.length;

        case 'min':
            if (numericValues.length === 0) return null;
            return Math.min(...numericValues);

        case 'max':
            if (numericValues.length === 0) return null;
            return Math.max(...numericValues);

        case 'count':
            return values.length;

        case 'first':
            return values[0];

        case 'last':
            return values[values.length - 1];

        default:
            return null;
    }
}