/**
 * @file src/ai/services/learning/metrics/processors/MasteryMetricsProcessor.ts
 * @description Processeur de métriques de maîtrise d'apprentissage
 * @module MasteryMetricsProcessor
 * @requires @/ai/services/learning/metrics/types/DetailedMetricsTypes
 * @requires @/ai/services/learning/metrics/calculators/MetricsCalculator
 * @requires @/ai/services/learning/metrics/processors/PerformanceMetricsProcessor
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module traite les métriques de maîtrise des compétences d'apprentissage
 * et met à jour les profils utilisateurs en conséquence.
 */

import { DetailedMasteryMetrics } from '../types/DetailedMetricsTypes';
import { MetricsCalculator } from '../calculators/MetricsCalculator';
import { ExtendedExerciseResult } from './PerformanceMetricsProcessor';

/**
 * Options du processeur de métriques de maîtrise
 * @interface MasteryProcessorOptions
 */
interface MasteryProcessorOptions {
    /**
     * Seuil de maîtrise
     */
    masteryThreshold?: number;

    /**
     * Seuil de faiblesse
     */
    weaknessThreshold?: number;

    /**
     * Nombre minimum d'exercices pour évaluer la maîtrise
     */
    minExercisesForMastery?: number;

    /**
     * Facteur d'oubli pour la courbe d'oubli
     */
    forgettingFactor?: number;
}

/**
 * Processeur de métriques de maîtrise d'apprentissage
 * 
 * @class MasteryMetricsProcessor
 * @description Analyse les résultats d'exercices et met à jour les métriques de maîtrise
 */
export class MasteryMetricsProcessor {
    /**
     * Calculateur de métriques
     * @private
     * @readonly
     */
    private readonly calculator: MetricsCalculator;

    /**
     * Seuil de maîtrise
     * @private
     * @readonly
     */
    private readonly masteryThreshold: number;

    /**
     * Seuil de faiblesse
     * @private
     * @readonly
     */
    private readonly weaknessThreshold: number;

    /**
     * Nombre minimum d'exercices pour évaluer la maîtrise
     * @private
     * @readonly
     */
    private readonly minExercisesForMastery: number;

    /**
     * Facteur d'oubli
     * @private
     * @readonly
     */
    private readonly forgettingFactor: number;

    /**
     * Constructeur du processeur
     * 
     * @constructor
     * @param {MasteryProcessorOptions} [options={}] - Options de configuration
     */
    constructor(options: MasteryProcessorOptions = {}) {
        this.calculator = new MetricsCalculator({
            forgettingFactor: options.forgettingFactor
        });

        this.masteryThreshold = options.masteryThreshold ?? 0.8;
        this.weaknessThreshold = options.weaknessThreshold ?? 0.4;
        this.minExercisesForMastery = options.minExercisesForMastery ?? 5;
        this.forgettingFactor = options.forgettingFactor ?? 0.9;
    }

    /**
     * Met à jour les métriques de maîtrise
     * 
     * @method updateMetrics
     * @param {DetailedMasteryMetrics} mastery - Métriques actuelles
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @returns {DetailedMasteryMetrics} Métriques mises à jour
     * @public
     */
    public updateMetrics(
        mastery: DetailedMasteryMetrics,
        result: ExtendedExerciseResult
    ): DetailedMasteryMetrics {
        // Créer une copie des métriques actuelles
        const updatedMastery = { ...mastery };

        // Mettre à jour les niveaux de maîtrise
        this.updateSkillMasteryLevels(updatedMastery, result);

        // Mettre à jour les compétences maîtrisées et faibles
        this.updateMasteredAndWeaknessSkills(updatedMastery);

        // Mettre à jour les courbes d'oubli
        this.updateForgettingCurves(updatedMastery, result);

        // Mettre à jour les taux de rétention
        this.updateRetentionRates(updatedMastery);

        // Mettre à jour la cohérence des performances
        this.updatePerformanceConsistency(updatedMastery, result);

        // Mettre à jour les taux d'acquisition
        this.updateSkillAcquisitionRates(updatedMastery, result);

        return updatedMastery;
    }

    /**
     * Met à jour les niveaux de maîtrise des compétences
     * 
     * @method updateSkillMasteryLevels
     * @param {DetailedMasteryMetrics} mastery - Métriques de maîtrise
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updateSkillMasteryLevels(
        mastery: DetailedMasteryMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Initialiser les niveaux de maîtrise si nécessaire
        if (!mastery.skillMasteryLevels) {
            mastery.skillMasteryLevels = {};
        }

        // Mettre à jour les niveaux de maîtrise pour chaque compétence
        for (const skill of result.skills) {
            const skillScore = result.skillScores[skill] || 0;

            if (!mastery.skillMasteryLevels[skill]) {
                mastery.skillMasteryLevels[skill] = skillScore;
            } else {
                // Utiliser une moyenne pondérée avec plus de poids pour les résultats récents
                mastery.skillMasteryLevels[skill] = this.calculator.calculateExponentialMovingAverage(
                    mastery.skillMasteryLevels[skill],
                    skillScore,
                    0.3 // Alpha: 30% de poids pour la nouvelle valeur
                );
            }
        }
    }

    /**
     * Met à jour les compétences maîtrisées et faibles
     * 
     * @method updateMasteredAndWeaknessSkills
     * @param {DetailedMasteryMetrics} mastery - Métriques de maîtrise
     * @private
     */
    private updateMasteredAndWeaknessSkills(mastery: DetailedMasteryMetrics): void {
        // Réinitialiser les listes
        mastery.masteredSkills = [];
        mastery.weaknessSkills = [];

        // Examiner chaque compétence
        for (const [skill, level] of Object.entries(mastery.skillMasteryLevels)) {
            if (level >= this.masteryThreshold) {
                mastery.masteredSkills.push(skill);
            } else if (level <= this.weaknessThreshold) {
                mastery.weaknessSkills.push(skill);
            }
        }

        // Mettre à jour le compteur de compétences maîtrisées
        mastery.masteredSkillsCount = mastery.masteredSkills.length;
    }

    /**
     * Met à jour les courbes d'oubli
     * 
     * @method updateForgettingCurves
     * @param {DetailedMasteryMetrics} mastery - Métriques de maîtrise
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updateForgettingCurves(
        mastery: DetailedMasteryMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Initialiser les courbes d'oubli si nécessaire
        if (!mastery.forgettingCurves) {
            mastery.forgettingCurves = {};
        }

        // Mettre à jour les courbes d'oubli pour chaque compétence
        for (const skill of result.skills) {
            const skillScore = result.skillScores[skill] || 0;
            const masteryLevel = mastery.skillMasteryLevels[skill] || 0;

            // Générer la courbe d'oubli pour cette compétence
            if (!mastery.forgettingCurves[skill]) {
                mastery.forgettingCurves[skill] = [];
            }

            // Réinitialiser la courbe existante
            mastery.forgettingCurves[skill] = [];

            // Générer des points pour la courbe (30 jours)
            for (let day = 0; day <= 30; day += 5) {
                mastery.forgettingCurves[skill].push({
                    daysFromLastPractice: day,
                    retentionRate: this.calculator.calculateRetentionRate(masteryLevel, day)
                });
            }
        }
    }

    /**
     * Met à jour les taux de rétention
     * 
     * @method updateRetentionRates
     * @param {DetailedMasteryMetrics} mastery - Métriques de maîtrise
     * @private
     */
    private updateRetentionRates(mastery: DetailedMasteryMetrics): void {
        // Initialiser les taux de rétention si nécessaire
        if (!mastery.retentionRates) {
            mastery.retentionRates = {};
        }

        // Calculer les taux de rétention pour chaque compétence
        for (const [skill, curve] of Object.entries(mastery.forgettingCurves)) {
            // Utiliser le taux de rétention à 7 jours comme indicateur
            const day7Point = curve.find(point => point.daysFromLastPractice === 5) ||
                curve[Math.floor(curve.length / 2)]; // Utiliser le point médian si 7 jours n'existe pas

            mastery.retentionRates[skill] = day7Point.retentionRate;
        }
    }

    /**
     * Met à jour la cohérence des performances
     * 
     * @method updatePerformanceConsistency
     * @param {DetailedMasteryMetrics} mastery - Métriques de maîtrise
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updatePerformanceConsistency(
        mastery: DetailedMasteryMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Initialiser la cohérence des performances si nécessaire
        if (!mastery.performanceConsistency) {
            mastery.performanceConsistency = {};
        }

        // Mettre à jour la cohérence pour chaque compétence
        for (const skill of result.skills) {
            const skillScore = result.skillScores[skill] || 0;
            const currentConsistency = mastery.performanceConsistency[skill] || 1.0;

            // Calculer la différence entre le score et le niveau de maîtrise
            const masteryLevel = mastery.skillMasteryLevels[skill] || 0;
            const difference = Math.abs(skillScore - masteryLevel);

            // Plus la différence est petite, plus la cohérence est élevée
            const newConsistency = 1.0 - difference;

            // Mettre à jour la cohérence avec une moyenne mobile exponentielle
            mastery.performanceConsistency[skill] = this.calculator.calculateExponentialMovingAverage(
                currentConsistency,
                newConsistency,
                0.2 // Alpha: 20% de poids pour la nouvelle valeur
            );
        }
    }

    /**
     * Met à jour les taux d'acquisition des compétences
     * 
     * @method updateSkillAcquisitionRates
     * @param {DetailedMasteryMetrics} mastery - Métriques de maîtrise
     * @param {ExtendedExerciseResult} result - Résultat d'exercice
     * @private
     */
    private updateSkillAcquisitionRates(
        mastery: DetailedMasteryMetrics,
        result: ExtendedExerciseResult
    ): void {
        // Initialiser les taux d'acquisition si nécessaire
        if (!mastery.skillAcquisitionRates) {
            mastery.skillAcquisitionRates = {};
        }

        // Mettre à jour les taux d'acquisition pour chaque compétence
        for (const skill of result.skills) {
            const skillScore = result.skillScores[skill] || 0;

            // Historique des scores non disponible ici, utiliser une heuristique
            const previousRate = mastery.skillAcquisitionRates[skill] || 0.01;

            // Si le score est supérieur au niveau de maîtrise, augmenter le taux d'acquisition
            const masteryLevel = mastery.skillMasteryLevels[skill] || 0;

            let newRate = previousRate;
            if (skillScore > masteryLevel) {
                // Progression plus rapide
                newRate = previousRate * 1.1;
            } else if (skillScore < masteryLevel * 0.8) {
                // Progression plus lente
                newRate = previousRate * 0.9;
            }

            // Limiter le taux entre 0.001 et 0.1
            newRate = Math.max(0.001, Math.min(0.1, newRate));

            mastery.skillAcquisitionRates[skill] = newRate;
        }
    }
}