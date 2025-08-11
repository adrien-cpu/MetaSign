/**
 * @file src/ai/services/learning/metrics/calculators/MetricsCalculator.ts
 * @description Calculateur de métriques d'apprentissage
 * @module MetricsCalculator
 * @requires @/ai/services/learning/metrics/types/DetailedMetricsTypes
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module fournit des fonctions de calcul pour les différentes métriques d'apprentissage,
 * notamment les moyennes, les tendances et les prédictions.
 */

import { LevelHistoryEntry } from '../types/DetailedMetricsTypes';

/**
 * Configuration du calculateur
 * @interface MetricsCalculatorOptions
 */
interface MetricsCalculatorOptions {
    /**
     * Taille de la fenêtre glissante (nombre d'échantillons)
     */
    rollingWindowSize?: number;

    /**
     * Poids initial pour les moyennes pondérées
     */
    initialWeight?: number;

    /**
     * Facteur d'oubli pour les moyennes exponentielles
     */
    forgettingFactor?: number;

    /**
     * Seuil de détection des anomalies (en écarts-types)
     */
    anomalyThreshold?: number;
}

/**
 * Calculateur de métriques d'apprentissage
 * 
 * @class MetricsCalculator
 * @description Fournit des méthodes de calcul pour les différentes métriques
 * d'apprentissage utilisées dans le système.
 */
export class MetricsCalculator {
    /**
     * Taille de la fenêtre glissante
     * @private
     * @readonly
     */
    private readonly rollingWindowSize: number;

    /**
     * Poids initial pour les moyennes pondérées
     * @private
     * @readonly
     */
    private readonly initialWeight: number;

    /**
     * Facteur d'oubli pour les moyennes exponentielles
     * @private
     * @readonly
     */
    private readonly forgettingFactor: number;

    /**
     * Seuil de détection des anomalies
     * @private
     * @readonly
     */
    private readonly anomalyThreshold: number;

    /**
     * Constructeur du calculateur de métriques
     * 
     * @constructor
     * @param {MetricsCalculatorOptions} [options={}] - Options de configuration
     */
    constructor(options: MetricsCalculatorOptions = {}) {
        this.rollingWindowSize = options.rollingWindowSize ?? 20;
        this.initialWeight = options.initialWeight ?? 0.7;
        this.forgettingFactor = options.forgettingFactor ?? 0.9;
        this.anomalyThreshold = options.anomalyThreshold ?? 2.0;
    }

    /**
     * Calcule une moyenne glissante
     * 
     * @method calculateRollingAverage
     * @param {number[]} values - Valeurs à moyenner
     * @param {number} [windowSize] - Taille de la fenêtre (par défaut: this.rollingWindowSize)
     * @returns {number} Moyenne glissante
     * @public
     */
    public calculateRollingAverage(values: number[], windowSize?: number): number {
        const window = windowSize ?? this.rollingWindowSize;

        if (values.length === 0) {
            return 0;
        }

        const start = Math.max(0, values.length - window);
        let sum = 0;

        for (let i = start; i < values.length; i++) {
            sum += values[i];
        }

        return sum / (values.length - start);
    }

    /**
     * Met à jour une moyenne glissante avec une nouvelle valeur
     * 
     * @method updateRollingAverage
     * @param {number} currentAverage - Moyenne actuelle
     * @param {number} newValue - Nouvelle valeur
     * @param {number} [historySize=10] - Taille de l'historique simulé
     * @returns {number} Moyenne mise à jour
     * @public
     */
    public updateRollingAverage(currentAverage: number, newValue: number, historySize = 10): number {
        // Si c'est la première valeur, la retourner directement
        if (currentAverage === 0 || historySize <= 1) {
            return newValue;
        }

        // Simuler l'ajout d'une valeur à une fenêtre de taille historySize
        return currentAverage + (newValue - currentAverage) / historySize;
    }

    /**
     * Calcule une moyenne pondérée
     * 
     * @method calculateWeightedAverage
     * @param {Array<{ value: number; weight: number }>} weightedValues - Valeurs pondérées
     * @returns {number} Moyenne pondérée
     * @public
     */
    public calculateWeightedAverage(weightedValues: Array<{ value: number; weight: number }>): number {
        if (weightedValues.length === 0) {
            return 0;
        }

        let sum = 0;
        let weightSum = 0;

        for (const { value, weight } of weightedValues) {
            sum += value * weight;
            weightSum += weight;
        }

        return weightSum > 0 ? sum / weightSum : 0;
    }

    /**
     * Calcule une moyenne exponentielle mobile
     * 
     * @method calculateExponentialMovingAverage
     * @param {number} currentEMA - EMA actuelle
     * @param {number} newValue - Nouvelle valeur
     * @param {number} [alpha] - Facteur de lissage (par défaut: 1 - this.forgettingFactor)
     * @returns {number} EMA mise à jour
     * @public
     */
    public calculateExponentialMovingAverage(
        currentEMA: number,
        newValue: number,
        alpha?: number
    ): number {
        const a = alpha ?? (1 - this.forgettingFactor);
        return a * newValue + (1 - a) * currentEMA;
    }

    /**
     * Calcule la vitesse de progression
     * 
     * @method calculateProgressionSpeed
     * @param {LevelHistoryEntry[]} levelHistory - Historique des niveaux
     * @returns {number} Vitesse en niveaux par mois
     * @public
     */
    public calculateProgressionSpeed(levelHistory: LevelHistoryEntry[]): number {
        if (levelHistory.length < 2) {
            return 0;
        }

        // Convertir les niveaux en valeurs numériques si nécessaire
        const numericLevels = levelHistory.map((entry, index) => {
            return {
                level: this.convertLevelToNumeric(entry.level),
                timestamp: entry.achievedAt.getTime(),
                index
            };
        });

        // Trier par date
        numericLevels.sort((a, b) => a.timestamp - b.timestamp);

        // Calculer les déltas
        const totalLevelDelta = numericLevels[numericLevels.length - 1].level - numericLevels[0].level;
        const totalTimeDelta = (numericLevels[numericLevels.length - 1].timestamp - numericLevels[0].timestamp) / (1000 * 60 * 60 * 24 * 30); // en mois

        return totalTimeDelta > 0 ? totalLevelDelta / totalTimeDelta : 0;
    }

    /**
     * Estime la progression dans un niveau
     * 
     * @method estimateLevelProgress
     * @param {Record<string, number>} skillScores - Scores par compétence
     * @returns {number} Progression estimée (0-1)
     * @public
     */
    public estimateLevelProgress(skillScores: Record<string, number>): number {
        const scores = Object.values(skillScores);

        if (scores.length === 0) {
            return 0;
        }

        // Calculer la moyenne des scores
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        // Limiter entre 0 et 1
        return Math.max(0, Math.min(1, average));
    }

    /**
     * Calcule l'écart-type
     * 
     * @method calculateStandardDeviation
     * @param {number[]} values - Valeurs
     * @returns {number} Écart-type
     * @public
     */
    public calculateStandardDeviation(values: number[]): number {
        if (values.length < 2) {
            return 0;
        }

        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / values.length;

        return Math.sqrt(variance);
    }

    /**
     * Détecte les anomalies dans une série de valeurs
     * 
     * @method detectAnomalies
     * @param {number[]} values - Série de valeurs
     * @param {number} [threshold] - Seuil en écarts-types (par défaut: this.anomalyThreshold)
     * @returns {number[]} Indices des anomalies
     * @public
     */
    public detectAnomalies(values: number[], threshold?: number): number[] {
        const thresh = threshold ?? this.anomalyThreshold;
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const stdDev = this.calculateStandardDeviation(values);

        if (stdDev === 0) {
            return [];
        }

        return values.reduce((indices, value, index) => {
            if (Math.abs(value - mean) > thresh * stdDev) {
                indices.push(index);
            }
            return indices;
        }, [] as number[]);
    }

    /**
     * Calcule une tendance linéaire
     * 
     * @method calculateLinearTrend
     * @param {Array<{ x: number; y: number }>} points - Points (x,y)
     * @returns {{ slope: number; intercept: number }} Pente et ordonnée à l'origine
     * @public
     */
    public calculateLinearTrend(points: Array<{ x: number; y: number }>): { slope: number; intercept: number } {
        if (points.length < 2) {
            return { slope: 0, intercept: 0 };
        }

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        for (const point of points) {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumXX += point.x * point.x;
        }

        const n = points.length;
        const denominator = n * sumXX - sumX * sumX;

        if (denominator === 0) {
            return { slope: 0, intercept: sumY / n };
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    /**
     * Prédit une valeur future
     * 
     * @method predictFutureValue
     * @param {number[]} values - Historique des valeurs
     * @param {number} stepsAhead - Nombre de pas dans le futur
     * @returns {number} Valeur prédite
     * @public
     */
    public predictFutureValue(values: number[], stepsAhead: number): number {
        if (values.length < 2) {
            return values.length === 1 ? values[0] : 0;
        }

        const points = values.map((y, i) => ({ x: i, y }));
        const { slope, intercept } = this.calculateLinearTrend(points);

        return slope * (values.length + stepsAhead) + intercept;
    }

    /**
     * Calcule le taux de rétention basé sur la courbe d'oubli
     * 
     * @method calculateRetentionRate
     * @param {number} initialStrength - Force initiale (0-1)
     * @param {number} daysSinceLastPractice - Jours écoulés depuis la dernière pratique
     * @returns {number} Taux de rétention estimé (0-1)
     * @public
     */
    public calculateRetentionRate(initialStrength: number, daysSinceLastPractice: number): number {
        // Modèle simplifié basé sur la courbe d'oubli d'Ebbinghaus
        const decayRate = 0.1 * (1 - initialStrength);
        return initialStrength * Math.exp(-decayRate * daysSinceLastPractice);
    }

    /**
     * Convertit un niveau textuel en valeur numérique
     * 
     * @method convertLevelToNumeric
     * @param {string} level - Niveau (ex: 'A1', 'B2', 'C1')
     * @returns {number} Valeur numérique
     * @private
     */
    private convertLevelToNumeric(level: string): number {
        // Format attendu: lettre (A/B/C) + chiffre (1/2)
        if (level.length >= 2) {
            const letter = level.charAt(0).toUpperCase();
            const number = parseInt(level.charAt(1), 10);

            if (['A', 'B', 'C'].includes(letter) && [1, 2].includes(number)) {
                // A1=1, A2=2, B1=3, B2=4, C1=5, C2=6
                const letterValue = letter.charCodeAt(0) - 'A'.charCodeAt(0);
                return 1 + letterValue * 2 + (number - 1);
            }
        }

        // Valeur par défaut ou conversion numérique directe si possible
        return isNaN(Number(level)) ? 0 : Number(level);
    }
}