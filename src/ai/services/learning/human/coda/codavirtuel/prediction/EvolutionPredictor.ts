/**
 * @file src/ai/services/learning/human/coda/codavirtuel/prediction/EvolutionPredictor.ts
 * @description Système de prédiction d'évolution pour les IA-élèves basé sur l'analyse des tendances
 * 
 * @module EvolutionPredictor
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Evolutionary AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    EvolutionMetrics,
    EvolutionEvent,
    EvolutionPrediction,
    EvolutionFactors
} from '@/ai/services/learning/human/coda/codavirtuel/types/evolution.types';

/**
 * Interface pour les données de tendance d'une métrique
 */
export interface MetricTrend {
    readonly metric: keyof EvolutionMetrics;
    readonly currentValue: number;
    readonly trend: number; // Changement par unité de temps
    readonly confidence: number;
    readonly dataPoints: number;
}

/**
 * Interface pour les paramètres de prédiction
 */
export interface PredictionParameters {
    readonly timeHorizon: number; // En heures
    readonly confidenceThreshold: number;
    readonly trendSmoothingFactor: number;
    readonly maxPredictionValue: number;
    readonly minPredictionValue: number;
}

/**
 * Prédicteur d'évolution des IA-élèves
 * 
 * @class EvolutionPredictor
 * @description Analyse les tendances historiques et génère des prédictions 
 * d'évolution pour les métriques des IA-élèves.
 */
export class EvolutionPredictor {
    /**
     * Logger pour le prédicteur
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('EvolutionPredictor_v3');

    /**
     * Paramètres de prédiction par défaut
     * @private
     * @readonly
     */
    private readonly defaultParameters: PredictionParameters = {
        timeHorizon: 24,
        confidenceThreshold: 0.6,
        trendSmoothingFactor: 0.7,
        maxPredictionValue: 1.0,
        minPredictionValue: 0.0
    };

    /**
     * Cache des tendances calculées
     * @private
     */
    private readonly trendCache: Map<string, Map<keyof EvolutionMetrics, MetricTrend>> = new Map();

    /**
     * Timestamp du dernier calcul de tendances par étudiant
     * @private
     */
    private readonly lastTrendCalculation: Map<string, Date> = new Map();

    /**
     * Durée de validité du cache en millisecondes (30 minutes)
     * @private
     * @readonly
     */
    private readonly cacheValidityMs = 30 * 60 * 1000;

    /**
     * Constructeur du prédicteur
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('🔮 Prédicteur d\'évolution initialisé');
    }

    /**
     * Génère des prédictions d'évolution pour un étudiant
     * 
     * @method predictEvolution
     * @param {string} studentId - ID de l'IA-élève
     * @param {EvolutionMetrics} currentMetrics - Métriques actuelles
     * @param {readonly EvolutionEvent[]} history - Historique des événements
     * @param {Partial<PredictionParameters>} [parameters] - Paramètres de prédiction personnalisés
     * @returns {Promise<readonly EvolutionPrediction[]>} Prédictions d'évolution
     * @public
     */
    public async predictEvolution(
        studentId: string,
        currentMetrics: EvolutionMetrics,
        history: readonly EvolutionEvent[],
        parameters?: Partial<PredictionParameters>
    ): Promise<readonly EvolutionPrediction[]> {
        try {
            const params = { ...this.defaultParameters, ...parameters };

            this.logger.debug('Génération prédictions évolution', {
                studentId,
                timeHorizon: params.timeHorizon,
                historyLength: history.length
            });

            if (history.length < 3) {
                this.logger.warn('Historique insuffisant pour prédictions fiables', {
                    studentId,
                    historyLength: history.length
                });
                return [];
            }

            // Calculer ou récupérer les tendances
            const trends = await this.calculateMetricTrends(studentId, currentMetrics, history);

            // Générer les prédictions
            const predictions = this.generatePredictions(trends, params);

            // Filtrer selon le seuil de confiance
            const filteredPredictions = predictions.filter(
                pred => pred.confidence >= params.confidenceThreshold
            );

            this.logger.info('Prédictions générées', {
                studentId,
                totalPredictions: predictions.length,
                filteredPredictions: filteredPredictions.length
            });

            return filteredPredictions;
        } catch (error) {
            this.logger.error('Erreur génération prédictions', { studentId, error });
            return [];
        }
    }

    /**
     * Prédit l'évolution d'une métrique spécifique
     * 
     * @method predictMetricEvolution
     * @param {string} studentId - ID de l'IA-élève
     * @param {keyof EvolutionMetrics} metric - Métrique à prédire
     * @param {number} currentValue - Valeur actuelle
     * @param {readonly EvolutionEvent[]} history - Historique des événements
     * @param {number} timeHorizon - Horizon temporel en heures
     * @returns {EvolutionPrediction | null} Prédiction ou null si impossible
     * @public
     */
    public predictMetricEvolution(
        studentId: string,
        metric: keyof EvolutionMetrics,
        currentValue: number,
        history: readonly EvolutionEvent[],
        timeHorizon: number
    ): EvolutionPrediction | null {
        try {
            const trend = this.calculateMetricTrend(metric, history);

            if (!trend || trend.confidence < this.defaultParameters.confidenceThreshold) {
                return null;
            }

            const prediction = this.createPredictionFromTrend(trend, timeHorizon);

            this.logger.debug('Prédiction métrique individuelle', {
                studentId,
                metric,
                currentValue,
                predictedValue: prediction.predictedValue,
                confidence: prediction.confidence
            });

            return prediction;
        } catch (error) {
            this.logger.error('Erreur prédiction métrique', { studentId, metric, error });
            return null;
        }
    }

    /**
     * Évalue la précision des prédictions précédentes
     * 
     * @method evaluatePredictionAccuracy
     * @param {readonly EvolutionPrediction[]} predictions - Prédictions à évaluer
     * @param {EvolutionMetrics} actualMetrics - Métriques réelles observées
     * @returns {number} Score de précision (0-1)
     * @public
     */
    public evaluatePredictionAccuracy(
        predictions: readonly EvolutionPrediction[],
        actualMetrics: EvolutionMetrics
    ): number {
        if (predictions.length === 0) {
            return 0;
        }

        let totalAccuracy = 0;
        let validPredictions = 0;

        for (const prediction of predictions) {
            const actualValue = actualMetrics[prediction.metric];
            const predictedValue = prediction.predictedValue;

            // Calculer l'erreur relative
            const error = Math.abs(actualValue - predictedValue);
            const maxError = Math.max(actualValue, predictedValue, 0.1); // Éviter division par 0
            const accuracy = Math.max(0, 1 - (error / maxError));

            totalAccuracy += accuracy;
            validPredictions++;
        }

        const overallAccuracy = validPredictions > 0 ? totalAccuracy / validPredictions : 0;

        this.logger.debug('Évaluation précision prédictions', {
            predictionsCount: predictions.length,
            validPredictions,
            overallAccuracy: overallAccuracy.toFixed(3)
        });

        return overallAccuracy;
    }

    /**
     * Identifie les facteurs influençant les prédictions
     * 
     * @method identifyInfluencingFactors
     * @param {keyof EvolutionMetrics} metric - Métrique à analyser
     * @param {readonly EvolutionEvent[]} history - Historique des événements
     * @param {EvolutionFactors} factors - Facteurs d'évolution
     * @returns {readonly string[]} Facteurs influençants identifiés
     * @public
     */
    public identifyInfluencingFactors(
        metric: keyof EvolutionMetrics,
        history: readonly EvolutionEvent[],
        factors: EvolutionFactors
    ): readonly string[] {
        const influencingFactors: string[] = [];

        // Analyser l'historique des événements
        const relevantEvents = history.filter(event => event.affectedMetric === metric);
        const eventTypes = new Set(relevantEvents.map(event => event.eventType));

        eventTypes.forEach(eventType => {
            influencingFactors.push(`Événements de type: ${eventType}`);
        });

        // Analyser les expériences d'apprentissage
        if (factors.recentExperiences.length > 0) {
            const avgSuccessRate = factors.recentExperiences.reduce(
                (sum, exp) => sum + exp.successRate, 0
            ) / factors.recentExperiences.length;

            if (avgSuccessRate > 0.7) {
                influencingFactors.push('Expériences d\'apprentissage positives');
            } else if (avgSuccessRate < 0.4) {
                influencingFactors.push('Difficultés d\'apprentissage');
            }
        }

        // Analyser les interactions sociales
        if (factors.socialInteractions.length > 0) {
            const avgQuality = factors.socialInteractions.reduce(
                (sum, int) => sum + int.quality, 0
            ) / factors.socialInteractions.length;

            if (avgQuality > 0.7) {
                influencingFactors.push('Interactions sociales de qualité');
            }
        }

        // Analyser le feedback
        const positiveFeedback = factors.feedbackHistory.filter(fb => fb.type === 'positive').length;
        const negativeFeedback = factors.feedbackHistory.filter(fb => fb.type === 'corrective').length;

        if (positiveFeedback > negativeFeedback) {
            influencingFactors.push('Feedback majoritairement positif');
        } else if (negativeFeedback > positiveFeedback) {
            influencingFactors.push('Feedback correctionnel fréquent');
        }

        // Analyser le temps d'apprentissage
        if (factors.totalLearningTime > 10000) { // Plus de 10 heures
            influencingFactors.push('Temps d\'apprentissage élevé');
        }

        return influencingFactors;
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Calcule les tendances pour toutes les métriques
     * @private
     */
    private async calculateMetricTrends(
        studentId: string,
        currentMetrics: EvolutionMetrics,
        history: readonly EvolutionEvent[]
    ): Promise<Map<keyof EvolutionMetrics, MetricTrend>> {
        // Vérifier le cache
        const lastCalculation = this.lastTrendCalculation.get(studentId);
        const cachedTrends = this.trendCache.get(studentId);

        if (lastCalculation && cachedTrends &&
            Date.now() - lastCalculation.getTime() < this.cacheValidityMs) {
            this.logger.debug('Utilisation cache tendances', { studentId });
            return cachedTrends;
        }

        // Calculer les nouvelles tendances
        const trends = new Map<keyof EvolutionMetrics, MetricTrend>();

        for (const metric of Object.keys(currentMetrics) as Array<keyof EvolutionMetrics>) {
            const trend = this.calculateMetricTrend(metric, history);
            if (trend) {
                trends.set(metric, trend);
            }
        }

        // Mettre à jour le cache
        this.trendCache.set(studentId, trends);
        this.lastTrendCalculation.set(studentId, new Date());

        this.logger.debug('Tendances calculées et mises en cache', {
            studentId,
            trendsCount: trends.size
        });

        return trends;
    }

    /**
     * Calcule la tendance pour une métrique spécifique
     * @private
     */
    private calculateMetricTrend(
        metric: keyof EvolutionMetrics,
        history: readonly EvolutionEvent[]
    ): MetricTrend | null {
        const relevantEvents = history
            .filter(event => event.affectedMetric === metric)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        if