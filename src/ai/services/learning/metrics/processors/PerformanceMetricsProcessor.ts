/**
 * @file src/ai/services/learning/metrics/processors/PerformanceMetricsProcessor.ts
 * @description Processeur de métriques de performance d'apprentissage
 * @module PerformanceMetricsProcessor
 * @requires @/ai/services/learning/metrics/types/DetailedMetricsTypes
 * @requires @/ai/services/learning/metrics/calculators/MetricsCalculator
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module traite les métriques de performance des exercices d'apprentissage
 * et met à jour les profils utilisateurs en conséquence.
 */

import { DetailedPerformanceMetrics } from '../types/DetailedMetricsTypes';
import { MetricsCalculator } from '../calculators/MetricsCalculator';

/**
 * Résultat d'exercice étendu avec métadonnées
 * @interface ExtendedExerciseResult
 */
export interface ExtendedExerciseResult {
    /**
     * ID de l'exercice
     */
    exerciseId: string;

    /**
     * Type d'exercice
     */
    exerciseType: string;

    /**
     * Score (0-1)
     */
    score: number;

    /**
     * Temps passé (en secondes)
     */
    timeSpent: number;

    /**
     * Compétences évaluées
     */
    skills: string[];

    /**
     * Scores par compétence
     */
    skillScores: Record<string, number>;

    /**
     * Nombre de tentatives
     */
    attempts: number;

    /**
     * Types d'erreurs commises
     */
    errorTypes: string[];

    /**
     * Horodatage
     */
    timestamp: Date;

    /**
     * Données supplémentaires
     */
    metadata?: Record<string, unknown>;
}

/**
 * Options du processeur de métriques de performance
 * @interface PerformanceProcessorOptions
 */
interface PerformanceProcessorOptions {
    /**
     * Seuil de réussite
     */
    successThreshold?: number;

    /**
     * Taille de la fenêtre glissante
     */
    rollingWindowSize?: number;

    /**
     * Nombre maximum de scores récents à conserver
     */
    maxRecentScores?: number;
}

/**
 * Processeur de métriques de performance d'apprentissage
 * 
 * @class PerformanceMetricsProcessor
 * @description Analyse les résultats d'exercices et met à jour les métriques de performance
 */
export class PerformanceMetricsProcessor {
    /**
     * Calculateur de métriques
     * @private
     * @readonly
     */
    private readonly calculator: MetricsCalculator;

    /**
     * Seuil de réussite
     * @private
     * @readonly
     */
    private readonly successThreshold: number;

    /**
     * Taille de la fenêtre glissante
     * @private
     * @readonly
     */
    private readonly rollingWindowSize: number;

    /**
     * Nombre maximum de scores récents
     * @private
     * @readonly
     */
    private readonly maxRecentScores: number;

    /**
     * Constructeur du processeur
     * 
     * @constructor
     * @param {PerformanceProcessorOptions} [options={}] - Options de configuration
     */
    constructor(options: PerformanceProcessorOptions = {}) {
        this.calculator = new MetricsCalculator({
            rollingWindowSize: options.rollingWindowSize
        });

        this.successThreshold = options.successThreshold ?? 0.6;
        this.rollingWindowSize = options.rollingWindowSize ?? 20;
        this.maxRecentScores = options.maxRecentScores ?? 10;
    }

    /**
     * Met à jour les métriques de performance
     * 
     * @method updateMetrics
     * @param {DetailedPerformanceMetrics} performance - Métriques actuelles
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @returns {DetailedPerformanceMetrics} Métriques mises à jour
     * @public
     */
    public updateMetrics(
        performance: DetailedPerformanceMetrics,
        result: ExtendedExerciseResult
    ): DetailedPerformanceMetrics {
        // Créer une copie des métriques actuelles
        const updatedPerformance = { ...performance };

        // Mettre à jour le nombre total d'exercices
        updatedPerformance.totalExercisesCompleted += 1;

        // Mettre à jour les scores récents
        this.updateRecentScores(updatedPerformance, result);

        // Mettre à jour les taux de réussite
        this.updateSuccessRates(updatedPerformance, result);

        // Mettre à jour les temps moyens
        this.updateAverageTimes(updatedPerformance, result);

        // Mettre à jour les taux d'erreur
        this.updateErrorRates(updatedPerformance, result);

        // Mettre à jour le nombre moyen de tentatives
        this.updateAverageAttempts(updatedPerformance, result);

        // Calculer la tendance de performance
        this.calculatePerformanceTrend(updatedPerformance);

        return updatedPerformance;
    }

    /**
     * Met à jour les scores récents
     * 
     * @method updateRecentScores
     * @param {DetailedPerformanceMetrics} performance - Métriques de performance
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updateRecentScores(
        performance: DetailedPerformanceMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Ajouter le nouveau score
        performance.recentScores.push({
            exerciseId: result.exerciseId,
            score: result.score,
            timestamp: result.timestamp
        });

        // Limiter la taille de l'historique
        if (performance.recentScores.length > this.maxRecentScores) {
            // Trier par date décroissante
            performance.recentScores.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            // Garder les N plus récents
            performance.recentScores = performance.recentScores.slice(0, this.maxRecentScores);
        }
    }

    /**
     * Met à jour les taux de réussite
     * 
     * @method updateSuccessRates
     * @param {DetailedPerformanceMetrics} performance - Métriques de performance
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updateSuccessRates(
        performance: DetailedPerformanceMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Considérer l'exercice comme réussi si le score est supérieur au seuil
        const isSuccess = result.score >= this.successThreshold;

        // Mettre à jour le taux de réussite global
        const currentSuccessCount = performance.successRate * performance.totalExercisesCompleted;
        const newSuccessCount = currentSuccessCount + (isSuccess ? 1 : 0);
        performance.successRate = newSuccessCount / performance.totalExercisesCompleted;

        // Mettre à jour le taux de réussite par type d'exercice
        const exerciseType = result.exerciseType;
        if (!performance.exerciseTypeSuccessRates[exerciseType]) {
            performance.exerciseTypeSuccessRates[exerciseType] = isSuccess ? 1 : 0;
        } else {
            performance.exerciseTypeSuccessRates[exerciseType] = this.calculator.updateRollingAverage(
                performance.exerciseTypeSuccessRates[exerciseType],
                isSuccess ? 1 : 0,
                this.rollingWindowSize
            );
        }

        // Mettre à jour le taux de réussite par compétence
        for (const skill of result.skills) {
            const skillScore = result.skillScores[skill] || 0;
            const skillSuccess = skillScore >= this.successThreshold;

            if (!performance.skillSuccessRates[skill]) {
                performance.skillSuccessRates[skill] = skillSuccess ? 1 : 0;
            } else {
                performance.skillSuccessRates[skill] = this.calculator.updateRollingAverage(
                    performance.skillSuccessRates[skill],
                    skillSuccess ? 1 : 0,
                    this.rollingWindowSize
                );
            }
        }
    }

    /**
     * Met à jour les temps moyens
     * 
     * @method updateAverageTimes
     * @param {DetailedPerformanceMetrics} performance - Métriques de performance
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updateAverageTimes(
        performance: DetailedPerformanceMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Mettre à jour le temps moyen global
        performance.averageTimePerExercise = this.calculator.updateRollingAverage(
            performance.averageTimePerExercise,
            result.timeSpent,
            performance.totalExercisesCompleted
        );

        // Mettre à jour le temps moyen par type d'exercice
        const exerciseType = result.exerciseType;
        if (!performance.exerciseTypeAverageTimes[exerciseType]) {
            performance.exerciseTypeAverageTimes[exerciseType] = result.timeSpent;
        } else {
            performance.exerciseTypeAverageTimes[exerciseType] = this.calculator.updateRollingAverage(
                performance.exerciseTypeAverageTimes[exerciseType],
                result.timeSpent,
                this.rollingWindowSize
            );
        }
    }

    /**
     * Met à jour les taux d'erreur
     * 
     * @method updateErrorRates
     * @param {DetailedPerformanceMetrics} performance - Métriques de performance
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updateErrorRates(
        performance: DetailedPerformanceMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Initialiser les taux d'erreur si nécessaire
        if (!performance.errorRates) {
            performance.errorRates = {};
        }

        // Mettre à jour les taux d'erreur
        for (const errorType of result.errorTypes) {
            if (!performance.errorRates[errorType]) {
                performance.errorRates[errorType] = 1;
            } else {
                performance.errorRates[errorType] = this.calculator.updateRollingAverage(
                    performance.errorRates[errorType],
                    1,
                    this.rollingWindowSize
                );
            }
        }

        // Mettre à jour les taux d'erreur pour les types non présents
        const allErrorTypes = Object.keys(performance.errorRates);
        for (const errorType of allErrorTypes) {
            if (!result.errorTypes.includes(errorType)) {
                performance.errorRates[errorType] = this.calculator.updateRollingAverage(
                    performance.errorRates[errorType],
                    0,
                    this.rollingWindowSize
                );
            }
        }
    }

    /**
     * Met à jour le nombre moyen de tentatives
     * 
     * @method updateAverageAttempts
     * @param {DetailedPerformanceMetrics} performance - Métriques de performance
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updateAverageAttempts(
        performance: DetailedPerformanceMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Mettre à jour le nombre moyen de tentatives
        if (result.score >= this.successThreshold) {
            performance.averageAttemptsUntilSuccess = this.calculator.updateRollingAverage(
                performance.averageAttemptsUntilSuccess,
                result.attempts,
                this.rollingWindowSize
            );
        }
    }

    /**
     * Calcule la tendance de performance
     * 
     * @method calculatePerformanceTrend
     * @param {DetailedPerformanceMetrics} performance - Métriques de performance
     * @private
     */
    private calculatePerformanceTrend(performance: DetailedPerformanceMetrics): void {
        if (performance.recentScores.length < 2) {
            performance.performanceTrend = 0;
            return;
        }

        // Trier les scores par date
        const sortedScores = [...performance.recentScores].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        // Convertir en points pour l'analyse de tendance
        const points = sortedScores.map((score, index) => ({
            x: index,
            y: score.score
        }));

        // Calculer la tendance linéaire
        const { slope } = this.calculator.calculateLinearTrend(points);

        // Normaliser la pente
        performance.performanceTrend = slope * this.rollingWindowSize;
    }
}