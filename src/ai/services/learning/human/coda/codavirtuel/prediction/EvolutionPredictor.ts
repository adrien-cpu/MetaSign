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
     * @param {keyof EvolutionMetrics} metricKey - La métrique à analyser
     * @param {readonly EvolutionEvent[]} history - Historique des événements
     * @returns {MetricTrend | null} La tendance calculée ou null si impossible
     */
    private calculateMetricTrend(
        metricKey: keyof EvolutionMetrics,
        history: readonly EvolutionEvent[]
    ): MetricTrend | null {
        const relevantEvents = history
            .filter(event => event.affectedMetric === metricKey)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        if (relevantEvents.length < 2) {
            return null;
        }

        // Calculer la tendance linéaire
        const firstEvent = relevantEvents[0];
        const lastEvent = relevantEvents[relevantEvents.length - 1];

        const timeDiff = lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime();
        const valueDiff = lastEvent.newValue - firstEvent.previousValue;

        if (timeDiff === 0) {
            return null;
        }

        // Tendance par heure
        const trend = (valueDiff / timeDiff) * (60 * 60 * 1000);

        // Calculer la confiance basée sur la cohérence des changements
        const confidence = this.calculateTrendConfidence(relevantEvents);

        return {
            metric: metricKey,
            currentValue: lastEvent.newValue,
            trend,
            confidence,
            dataPoints: relevantEvents.length
        };
    }

    /**
     * Calcule la confiance dans une tendance
     * @private
     */
    private calculateTrendConfidence(events: readonly EvolutionEvent[]): number {
        if (events.length < 2) {
            return 0;
        }

        let consistentChanges = 0;
        let totalChanges = 0;

        for (let i = 1; i < events.length; i++) {
            const prevChange = events[i - 1].newValue - events[i - 1].previousValue;
            const currentChange = events[i].newValue - events[i].previousValue;

            // Vérifier si les changements vont dans la même direction
            if ((prevChange > 0 && currentChange > 0) || (prevChange < 0 && currentChange < 0) ||
                (prevChange === 0 && currentChange === 0)) {
                consistentChanges++;
            }
            totalChanges++;
        }

        const consistency = totalChanges > 0 ? consistentChanges / totalChanges : 0;

        // Ajuster selon le nombre de points de données
        const dataQualityFactor = Math.min(1, events.length / 5);

        return consistency * dataQualityFactor;
    }

    /**
     * Génère des prédictions à partir des tendances
     * @private
     */
    private generatePredictions(
        trends: Map<keyof EvolutionMetrics, MetricTrend>,
        parameters: PredictionParameters
    ): EvolutionPrediction[] {
        const predictions: EvolutionPrediction[] = [];

        trends.forEach((trend) => {
            const prediction = this.createPredictionFromTrend(trend, parameters.timeHorizon);

            // Appliquer le lissage
            const smoothedConfidence = this.applyConfidenceSmoothing(
                prediction.confidence,
                parameters.trendSmoothingFactor
            );

            const smoothedPrediction: EvolutionPrediction = {
                ...prediction,
                confidence: smoothedConfidence,
                predictedValue: Math.max(
                    parameters.minPredictionValue,
                    Math.min(parameters.maxPredictionValue, prediction.predictedValue)
                )
            };

            predictions.push(smoothedPrediction);
        });

        return predictions;
    }

    /**
     * Crée une prédiction à partir d'une tendance
     * @private
     */
    private createPredictionFromTrend(trend: MetricTrend, timeHorizon: number): EvolutionPrediction {
        const predictedChange = trend.trend * timeHorizon;
        const predictedValue = Math.max(0, Math.min(1, trend.currentValue + predictedChange));

        // Facteurs influençants basés sur la tendance
        const influencingFactors = this.deriveInfluencingFactorsFromTrend(trend);

        // Ajuster la confiance selon l'horizon temporel
        const timeHorizonFactor = Math.max(0.1, 1 - (timeHorizon / 168)); // Diminue sur 1 semaine
        const adjustedConfidence = trend.confidence * timeHorizonFactor;

        return {
            metric: trend.metric,
            predictedValue,
            confidence: adjustedConfidence,
            influencingFactors,
            timeHorizon
        };
    }

    /**
     * Dérive les facteurs influençants à partir d'une tendance
     * @private
     */
    private deriveInfluencingFactorsFromTrend(trend: MetricTrend): readonly string[] {
        const factors: string[] = [];

        // Analyser la direction de la tendance
        if (trend.trend > 0.01) {
            factors.push('Tendance positive forte');
        } else if (trend.trend > 0) {
            factors.push('Tendance positive modérée');
        } else if (trend.trend < -0.01) {
            factors.push('Tendance négative forte');
        } else if (trend.trend < 0) {
            factors.push('Tendance négative modérée');
        } else {
            factors.push('Tendance stable');
        }

        // Analyser la qualité des données
        if (trend.dataPoints >= 10) {
            factors.push('Données historiques riches');
        } else if (trend.dataPoints >= 5) {
            factors.push('Données historiques modérées');
        } else {
            factors.push('Données historiques limitées');
        }

        // Analyser la confiance
        if (trend.confidence > 0.8) {
            factors.push('Confiance élevée dans la tendance');
        } else if (trend.confidence > 0.6) {
            factors.push('Confiance modérée dans la tendance');
        } else {
            factors.push('Confiance faible dans la tendance');
        }

        // Analyser la valeur actuelle
        if (trend.currentValue > 0.8) {
            factors.push('Niveau actuel élevé');
        } else if (trend.currentValue < 0.3) {
            factors.push('Niveau actuel faible - potentiel d\'amélioration');
        }

        return factors;
    }

    /**
     * Applique un lissage à la confiance
     * @private
     */
    private applyConfidenceSmoothing(confidence: number, smoothingFactor: number): number {
        // Applique un lissage exponentiel pour éviter les fluctuations extrêmes
        const smoothed = confidence * smoothingFactor + (1 - smoothingFactor) * 0.5;
        return Math.max(0, Math.min(1, smoothed));
    }

    /**
     * Nettoie le cache des tendances obsolètes
     * @private
     */
    private cleanupCache(): void {
        const now = Date.now();
        const studentsToRemove: string[] = [];

        this.lastTrendCalculation.forEach((timestamp, studentId) => {
            if (now - timestamp.getTime() > this.cacheValidityMs * 2) {
                studentsToRemove.push(studentId);
            }
        });

        studentsToRemove.forEach(studentId => {
            this.trendCache.delete(studentId);
            this.lastTrendCalculation.delete(studentId);
        });

        if (studentsToRemove.length > 0) {
            this.logger.debug('Cache nettoyé', {
                removedEntries: studentsToRemove.length
            });
        }
    }

    /**
     * Démarre le processus de nettoyage automatique du cache
     * @private
     */
    private startCacheCleanup(): void {
        setInterval(() => {
            this.cleanupCache();
        }, this.cacheValidityMs); // Nettoyer toutes les 30 minutes
    }

    /**
     * Analyse l'exactitude des prédictions précédentes par rapport aux résultats réels
     * 
     * @method analyzePredictionAccuracyOverTime
     * @param {string} studentId - ID de l'IA-élève
     * @param {readonly EvolutionPrediction[]} historicalPredictions - Prédictions historiques
     * @param {EvolutionMetrics} actualMetrics - Métriques réelles observées
     * @returns {Record<keyof EvolutionMetrics, number>} Précision par métrique
     * @public
     */
    public analyzePredictionAccuracyOverTime(
        studentId: string,
        historicalPredictions: readonly EvolutionPrediction[],
        actualMetrics: EvolutionMetrics
    ): Record<keyof EvolutionMetrics, number> {
        const accuracyByMetric: Partial<Record<keyof EvolutionMetrics, number>> = {};

        // Grouper les prédictions par métrique
        const predictionsByMetric = new Map<keyof EvolutionMetrics, EvolutionPrediction[]>();

        historicalPredictions.forEach(prediction => {
            if (!predictionsByMetric.has(prediction.metric)) {
                predictionsByMetric.set(prediction.metric, []);
            }
            predictionsByMetric.get(prediction.metric)!.push(prediction);
        });

        // Calculer la précision pour chaque métrique
        for (const [metric, predictions] of predictionsByMetric) {
            const actualValue = actualMetrics[metric];
            const totalAccuracy = predictions.reduce((sum, prediction) => {
                const error = Math.abs(actualValue - prediction.predictedValue);
                const maxPossibleError = Math.max(actualValue, prediction.predictedValue, 0.1);
                const accuracy = Math.max(0, 1 - (error / maxPossibleError));
                return sum + accuracy;
            }, 0);
            accuracyByMetric[metric] = predictions.length > 0 ? totalAccuracy / predictions.length : 0;
        }


        this.logger.debug('Analyse précision prédictions par métrique', {
            studentId,
            metricsAnalyzed: Object.keys(accuracyByMetric).length
        });

        return accuracyByMetric as Record<keyof EvolutionMetrics, number>;
    }

    /**
     * Optimise automatiquement les paramètres de prédiction basés sur l'historique
     * 
     * @method optimizePredictionParameters
     * @param {string} studentId - ID de l'IA-élève
     * @param {Record<keyof EvolutionMetrics, number>} accuracyHistory - Historique de précision
     * @returns {Partial<PredictionParameters>} Paramètres optimisés
     * @public
     */
    public optimizePredictionParameters(
        studentId: string,
        accuracyHistory: Record<keyof EvolutionMetrics, number>
    ): Partial<PredictionParameters> {
        const averageAccuracy = Object.values(accuracyHistory).reduce((sum, acc) => sum + acc, 0) /
            Object.values(accuracyHistory).length;

        // Créer directement l'objet avec les valeurs optimisées
        let optimizedParams: Partial<PredictionParameters>;

        // Ajuster les paramètres basés sur la précision
        if (averageAccuracy > 0.8) {
            // Excellente précision : paramètres permissifs
            optimizedParams = {
                confidenceThreshold: 0.5,
                trendSmoothingFactor: 0.8,
                timeHorizon: 48
            };
        } else if (averageAccuracy < 0.6) {
            // Précision faible : paramètres conservateurs
            optimizedParams = {
                confidenceThreshold: 0.8,
                trendSmoothingFactor: 0.6,
                timeHorizon: 12
            };
        } else {
            // Précision moyenne : paramètres standards
            optimizedParams = {
                confidenceThreshold: 0.7,
                trendSmoothingFactor: 0.7,
                timeHorizon: 24
            };
        }

        this.logger.info('Paramètres prédiction optimisés', {
            studentId,
            averageAccuracy: averageAccuracy.toFixed(3),
            optimizedParams
        });

        return optimizedParams;
    }

    /**
     * Nettoie les ressources et arrête les processus automatiques
     * 
     * @method shutdown
     * @returns {void}
     * @public
     */
    public shutdown(): void {
        // Nettoyer les caches
        this.trendCache.clear();
        this.lastTrendCalculation.clear();

        this.logger.info('🛑 Prédicteur d\'évolution arrêté');
    }
}