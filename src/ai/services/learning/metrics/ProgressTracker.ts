/**
 * @file src/ai/services/learning/metrics/ProgressTracker.ts
 * @description Suivi de la progression d'apprentissage et des niveaux de maîtrise
 */

import { LoggerFactory } from '@utils/LoggerFactory';
import { IProgressTracker } from './interfaces/MetricsInterfaces';
import { MetricsStore } from './MetricsStore';

/**
 * Classe responsable du suivi de la progression d'apprentissage
 */
export class ProgressTracker implements IProgressTracker {
    private static instance: ProgressTracker;
    private readonly logger = LoggerFactory.getLogger('ProgressTracker');
    private readonly metricsStore: MetricsStore;

    // Cache des niveaux de maîtrise
    private conceptMasteryCache: Record<string, Record<string, number>> = {}; // userId -> conceptId -> mastery

    /**
     * @constructor
     * @private
     */
    private constructor() {
        this.logger.info('Initializing ProgressTracker...');
        this.metricsStore = MetricsStore.getInstance();
    }

    /**
     * Récupère ou crée l'instance du service (pattern Singleton)
     * @returns Instance unique du service
     */
    public static getInstance(): ProgressTracker {
        if (!ProgressTracker.instance) {
            ProgressTracker.instance = new ProgressTracker();
        }

        return ProgressTracker.instance;
    }

    /**
     * Calcule le niveau de maîtrise d'un concept pour un utilisateur
     * @param userId ID de l'utilisateur
     * @param conceptId ID du concept
     * @returns Niveau de maîtrise (0-1)
     */
    public getConceptMastery(userId: string, conceptId: string): number {
        // Vérifier d'abord dans le cache
        if (this.conceptMasteryCache[userId]?.[conceptId] !== undefined) {
            return this.conceptMasteryCache[userId][conceptId];
        }

        // Filtrer les métriques pour cet utilisateur et ce concept
        const conceptMetrics = this.metricsStore.getUserConceptMetrics(userId, conceptId);

        // Pas de métriques trouvées
        if (conceptMetrics.length === 0) {
            return 0;
        }

        // Métriques des 5 derniers exercices (les plus récents)
        const recentMetrics = conceptMetrics
            .sort((a, b) => b.completionDate.getTime() - a.completionDate.getTime())
            .slice(0, 5);

        // Facteurs pour le calcul de la maîtrise
        // - Scores récents (60%)
        // - Temps passé (20%)
        // - Constance dans les résultats (20%)

        // Calculer le score moyen récent
        const recentScoreAverage = recentMetrics.reduce((total, m) => total + m.score, 0) / recentMetrics.length;

        // Calculer l'efficacité du temps (score / temps)
        const timeEfficiency = recentMetrics.reduce((total, m) => total + (m.score / Math.max(1, m.timeSpent / 60)), 0) / recentMetrics.length;

        // Calculer la constance (écart-type inversé)
        const scoreVariance = this.calculateVariance(recentMetrics.map(m => m.score));
        const consistency = Math.max(0, 1 - Math.sqrt(scoreVariance));

        // Combinaison pondérée
        const mastery = (
            0.6 * recentScoreAverage +
            0.2 * timeEfficiency +
            0.2 * consistency
        );

        // Mise en cache
        this.updateConceptMastery(userId, conceptId, mastery);

        return mastery;
    }

    /**
     * Met à jour le niveau de maîtrise d'un concept pour un utilisateur
     * @param userId ID de l'utilisateur
     * @param conceptId ID du concept
     * @param score Score obtenu
     */
    public updateConceptMastery(userId: string, conceptId: string, score: number): void {
        // Initialisation du cache pour l'utilisateur si nécessaire
        if (!this.conceptMasteryCache[userId]) {
            this.conceptMasteryCache[userId] = {};
        }

        // Mise à jour de la valeur
        this.conceptMasteryCache[userId][conceptId] = score;
    }

    /**
     * Met à jour la progression avec un nouveau score
     * @param userId ID de l'utilisateur
     * @param conceptId ID du concept
     * @param newScore Nouveau score
     */
    public updateProgressWithNewScore(userId: string, conceptId: string, newScore: number): void {
        // Récupération de la progression actuelle
        const currentProgress = this.getConceptMastery(userId, conceptId);

        // Mise à jour de la progression avec une pondération
        // 70% ancienne valeur, 30% nouvelle valeur
        const updatedProgress = 0.7 * currentProgress + 0.3 * newScore;

        // Mise en cache
        this.updateConceptMastery(userId, conceptId, updatedProgress);
    }

    /**
     * Calcule le niveau global de l'utilisateur
     * @param userId ID de l'utilisateur
     * @returns Niveau de l'utilisateur
     */
    public calculateUserLevel(userId: string): number {
        // Récupérer tous les concepts pratiqués par l'utilisateur
        const practicedConcepts = this.metricsStore.getPracticedConcepts(userId);

        if (practicedConcepts.length === 0) {
            return 1; // Niveau de base
        }

        // Calculer l'expérience totale
        const experience = this.calculateTotalExperience(userId);

        // Formule simple : 1 niveau tous les 1000 points d'expérience
        return Math.max(1, Math.floor(experience / 1000) + 1);
    }

    /**
     * Calcule l'expérience totale d'un utilisateur
     * @param userId ID de l'utilisateur
     * @returns Expérience totale
     */
    public calculateTotalExperience(userId: string): number {
        const userMetrics = this.metricsStore.getUserMetrics(userId);

        // Calcul de l'expérience
        // 100 points par exercice, ajusté par le score
        return userMetrics.reduce((total, m) => total + 100 * m.score, 0);
    }

    /**
     * Vérifie si l'utilisateur a une série de jours consécutifs de pratique
     * @param userId ID de l'utilisateur
     * @param days Nombre de jours
     * @returns Vrai si l'utilisateur a la série
     */
    public hasLearningStreak(userId: string, days: number): boolean {
        const userMetrics = this.metricsStore.getUserMetrics(userId);

        if (userMetrics.length < days) {
            return false;
        }

        // Extraire les dates et les trier
        const dates = userMetrics.map(m => {
            const date = new Date(m.completionDate);
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        });

        // Compter les jours uniques
        const uniqueDates = new Set(dates);

        // Simuler la probabilité de streak
        // Dans une implémentation réelle, il faudrait vérifier les jours consécutifs
        return uniqueDates.size >= days;
    }

    /**
     * Compte le nombre de révisions d'un concept
     * @param userId ID de l'utilisateur
     * @param conceptId ID du concept
     * @returns Nombre de révisions
     */
    public countConceptRevisions(userId: string, conceptId: string): number {
        const conceptMetrics = this.metricsStore.getUserConceptMetrics(userId, conceptId);

        if (conceptMetrics.length === 0) {
            return 0;
        }

        // Extraire les dates uniques (par jour)
        const uniqueDays = new Set(
            conceptMetrics.map(m => {
                const date = new Date(m.completionDate);
                return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            })
        );

        return uniqueDays.size;
    }

    /**
     * Calcule la variance d'un ensemble de valeurs
     * @param values Valeurs
     * @returns Variance
     * @private
     */
    private calculateVariance(values: number[]): number {
        if (values.length <= 1) {
            return 0;
        }

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }
}