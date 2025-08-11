// src/ai/learning/models/PredictiveModels.ts

import {
    UserFeatures,
    PredictionResult,
    UserInteractionHistory,
    EngagementPrediction,
    FrustrationPrediction,
    DifficultyCurve,
    OptimalPathPrediction,
    ModelTrainingStats
} from '../../types/prediction-types';
import { LoggerFactory } from '@ai/utils/LoggerFactory';

/**
 * Modèles prédictifs pour l'adaptation dynamique de l'expérience d'apprentissage.
 * Ce module comprend plusieurs modèles spécialisés qui analysent les comportements
 * passés pour anticiper les besoins futurs et adapter l'expérience en conséquence.
 * 
 * @module PredictiveModels
 */

/**
 * Modèle de prédiction d'engagement pour anticiper l'intérêt et l'implication de l'utilisateur
 * dans les activités d'apprentissage futures.
 */
export class EngagementPredictionModel {
    private readonly logger = LoggerFactory.getLogger('EngagementPredictionModel');
    private modelState: Map<string, number[]> = new Map();
    private lastTrainingDate?: Date;
    private trainingStats?: ModelTrainingStats;
    private readonly decayFactor = 0.85; // Facteur d'atténuation pour les observations plus anciennes

    /**
     * Prédit le niveau d'engagement futur d'un utilisateur
     * 
     * @param userFeatures - Caractéristiques de l'utilisateur et de son contexte d'apprentissage
     * @returns Prédiction d'engagement avec niveau de confiance
     */
    public async predict(userFeatures: UserFeatures): Promise<EngagementPrediction> {
        this.logger.debug('Predicting engagement', { userId: userFeatures.userId });

        // Vérifier si le modèle a été entraîné
        if (!this.lastTrainingDate) {
            this.logger.warn('Model not trained yet, returning default prediction');
            return {
                predictedEngagement: 0.5, // Valeur neutre par défaut
                confidence: 0.3,
                factors: ['default_prediction'],
                timestamp: new Date()
            };
        }

        try {
            // Extraire les caractéristiques les plus pertinentes pour la prédiction
            const features = this.extractPredictiveFeatures(userFeatures);

            // Appliquer l'algorithme de prédiction
            const engagementScore = this.calculateEngagementScore(features, userFeatures.userId);

            // Évaluer la confiance basée sur la quantité et la qualité des données
            const confidence = this.calculateConfidence(features, userFeatures.userId);

            // Identifier les facteurs influençant la prédiction
            const factors = this.identifyInfluentialFactors(features, engagementScore);

            return {
                predictedEngagement: engagementScore,
                confidence,
                factors,
                timestamp: new Date()
            };
        } catch (error) {
            this.logger.error('Error predicting engagement', { error, userId: userFeatures.userId });

            // Retourner une prédiction par défaut en cas d'erreur
            return {
                predictedEngagement: 0.5,
                confidence: 0.2,
                factors: ['error_recovery'],
                timestamp: new Date(),
                error: 'Prediction error occurred'
            };
        }
    }

    /**
     * Entraîne le modèle prédictif à partir des données historiques d'interaction
     * 
     * @param historicalData - Historique des interactions utilisateur
     * @returns Statistiques d'entraînement du modèle
     */
    public async train(historicalData: UserInteractionHistory[]): Promise<ModelTrainingStats> {
        this.logger.info('Training engagement prediction model', {
            dataPoints: historicalData.length
        });

        try {
            // Réinitialiser ou mettre à jour l'état du modèle
            const userIds = new Set(historicalData.map(data => data.userId));

            // Pour chaque utilisateur, calculer les coefficients du modèle
            for (const userId of userIds) {
                const userData = historicalData.filter(data => data.userId === userId);
                this.updateModelForUser(userId, userData);
            }

            // Mettre à jour les métadonnées du modèle
            this.lastTrainingDate = new Date();

            // Calculer les statistiques d'entraînement
            const accuracy = this.evaluateModelAccuracy(historicalData);

            this.trainingStats = {
                trainedAt: this.lastTrainingDate,
                sampleSize: historicalData.length,
                accuracy,
                userCount: userIds.size,
                convergenceIterations: 1, // Simplification pour cette implémentation
                meanSquaredError: 1 - accuracy
            };

            this.logger.info('Model training completed', {
                accuracy,
                userCount: userIds.size
            });

            return this.trainingStats;
        } catch (error) {
            this.logger.error('Error training model', { error });
            throw new Error(`Failed to train engagement model: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Extrait les caractéristiques prédictives des données utilisateur
     */
    private extractPredictiveFeatures(userFeatures: UserFeatures): number[] {
        // Convertir les caractéristiques utilisateur en vecteur numérique pour la prédiction
        const features: number[] = [
            // Facteurs temporels normalisés
            userFeatures.timeSpent ? Math.min(userFeatures.timeSpent / 3600, 1) : 0.5,
            userFeatures.sessionCount ? Math.min(userFeatures.sessionCount / 10, 1) : 0.5,

            // Facteurs de performance normalisés
            userFeatures.completionRate ?? 0.5,
            userFeatures.averageScore ? userFeatures.averageScore / 100 : 0.5,

            // Facteurs d'interaction normalisés
            userFeatures.clickRate ? Math.min(userFeatures.clickRate / 50, 1) : 0.5,
            userFeatures.pauseFrequency ? Math.min(userFeatures.pauseFrequency, 1) : 0.5,

            // Facteurs contextuels (convertis en valeurs numériques)
            userFeatures.timeOfDay
                ? (new Date(userFeatures.timeOfDay).getHours() % 24) / 24
                : 0.5,
            userFeatures.dayOfWeek
                ? (new Date(userFeatures.timeOfDay || Date.now()).getDay() % 7) / 7
                : 0.5,

            // Constante de biais
            1.0
        ];

        return features;
    }

    /**
     * Met à jour le modèle pour un utilisateur spécifique basé sur ses données
     */
    private updateModelForUser(userId: string, userData: UserInteractionHistory[]): void {
        if (userData.length === 0) return;

        // Initialiser ou récupérer les coefficients existants pour cet utilisateur
        const existingCoefficients = this.modelState.get(userId) || Array(9).fill(0.5);
        const newCoefficients = [...existingCoefficients];

        // Trier les données par date pour donner plus d'importance aux plus récentes
        userData.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Calculer les nouveaux coefficients avec un facteur d'apprentissage
        userData.forEach((data, index) => {
            // Appliquer un facteur de décroissance pour donner plus de poids aux données récentes
            const learningRate = 0.05 * Math.pow(this.decayFactor, userData.length - index - 1);

            const features = this.extractPredictiveFeatures({
                userId,
                timeSpent: data.sessionDuration,
                sessionCount: data.sessionCount,
                completionRate: data.completionRate,
                averageScore: data.averageScore,
                clickRate: data.interactionRate,
                pauseFrequency: data.pauseFrequency,
                timeOfDay: data.timestamp,
                dayOfWeek: new Date(data.timestamp).getDay()
            });

            // Utiliser l'engagement observé comme cible pour l'apprentissage
            const target = data.observedEngagement || 0.5;

            // Prédiction avec les coefficients actuels
            const prediction = this.calculateWeightedSum(features, newCoefficients);

            // Ajuster les coefficients en fonction de l'erreur (approche simplifiée)
            for (let i = 0; i < newCoefficients.length; i++) {
                const error = target - prediction;
                newCoefficients[i] += learningRate * error * features[i];

                // Limiter les coefficients à une plage raisonnable
                newCoefficients[i] = Math.max(-2, Math.min(2, newCoefficients[i]));
            }
        });

        // Mettre à jour le modèle pour cet utilisateur
        this.modelState.set(userId, newCoefficients);
    }

    /**
     * Calcule un score d'engagement basé sur les caractéristiques et les coefficients du modèle
     */
    private calculateEngagementScore(features: number[], userId: string): number {
        // Récupérer les coefficients pour cet utilisateur, ou utiliser des valeurs par défaut
        const coefficients = this.modelState.get(userId) || Array(features.length).fill(0.5);

        // Calculer la somme pondérée
        const weightedSum = this.calculateWeightedSum(features, coefficients);

        // Appliquer une fonction sigmoïde pour limiter le résultat entre 0 et 1
        return this.sigmoid(weightedSum);
    }

    /**
     * Calcule une somme pondérée des caractéristiques avec les coefficients
     */
    private calculateWeightedSum(features: number[], coefficients: number[]): number {
        return features.reduce((sum, feature, index) => {
            return sum + feature * (coefficients[index] || 0.5);
        }, 0);
    }

    /**
     * Applique une fonction sigmoïde pour normaliser les valeurs entre 0 et 1
     */
    private sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * Calcule le niveau de confiance de la prédiction
     */
    private calculateConfidence(features: number[], userId: string): number {
        // Facteurs influençant la confiance:
        // 1. Quantité de données d'entraînement pour cet utilisateur
        const dataQuantityFactor = this.modelState.has(userId) ? 0.8 : 0.3;

        // 2. Qualité et complétude des caractéristiques
        const featureQualityFactor = features.filter(f => f !== 0.5).length / features.length;

        // 3. Récence de l'entraînement
        const trainingRecencyFactor = this.lastTrainingDate
            ? Math.max(0.3, 1 - (Date.now() - this.lastTrainingDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
            : 0.3;

        // Calculer la confiance globale (moyenne pondérée)
        return 0.5 * dataQuantityFactor + 0.3 * featureQualityFactor + 0.2 * trainingRecencyFactor;
    }

    /**
     * Identifie les facteurs qui influencent le plus la prédiction
     */
    private identifyInfluentialFactors(features: number[], prediction: number): string[] {
        const factors: string[] = [];
        const featureNames = [
            'time_spent', 'session_count', 'completion_rate', 'average_score',
            'click_rate', 'pause_frequency', 'time_of_day', 'day_of_week', 'bias'
        ];

        // Identifier les 3 caractéristiques les plus importantes
        const featureImportance = features.map((value, index) => ({
            name: featureNames[index],
            importance: Math.abs(value - 0.5) // Écart par rapport à la valeur neutre
        }));

        // Trier par importance décroissante et prendre les 3 premières
        const topFactors = featureImportance
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 3)
            .map(f => f.name);

        factors.push(...topFactors);

        // Ajouter des facteurs basés sur la valeur de prédiction
        if (prediction > 0.7) {
            factors.push('high_engagement_predicted');
        } else if (prediction < 0.3) {
            factors.push('low_engagement_predicted');
        } else {
            factors.push('moderate_engagement_predicted');
        }

        return factors;
    }

    /**
     * Évalue la précision du modèle sur les données historiques
     */
    private evaluateModelAccuracy(historicalData: UserInteractionHistory[]): number {
        if (historicalData.length === 0) return 0.5;

        let correctPredictions = 0;
        let totalPredictions = 0;

        // Pour chaque point de données, comparer la prédiction avec l'observation
        for (const data of historicalData) {
            if (data.observedEngagement === undefined) continue;

            const features = this.extractPredictiveFeatures({
                userId: data.userId,
                timeSpent: data.sessionDuration,
                sessionCount: data.sessionCount,
                completionRate: data.completionRate,
                averageScore: data.averageScore,
                clickRate: data.interactionRate,
                pauseFrequency: data.pauseFrequency,
                timeOfDay: data.timestamp,
                dayOfWeek: new Date(data.timestamp).getDay()
            });

            const prediction = this.calculateEngagementScore(features, data.userId);

            // Considérer une prédiction comme correcte si elle est à 0.2 près de l'observation
            if (Math.abs(prediction - data.observedEngagement) <= 0.2) {
                correctPredictions++;
            }

            totalPredictions++;
        }

        return totalPredictions > 0 ? correctPredictions / totalPredictions : 0.5;
    }
}

/**
 * Modèle de prédiction de frustration pour détecter et anticiper les difficultés
 * des apprenants et intervenir de manière préventive.
 */
export class FrustrationPredictionModel {
    private readonly logger = LoggerFactory.getLogger('FrustrationPredictionModel');
    private modelState: Map<string, number[]> = new Map();
    private lastTrainingDate?: Date;
    private readonly frustrationIndicators = [
        'repeated_errors',
        'increasing_time_per_task',
        'rapid_clicks',
        'help_seeking',
        'abandonment',
        'erratic_navigation',
        'input_backtracking'
    ];

    /**
     * Prédit le niveau de frustration potentiel d'un utilisateur
     * 
     * @param userFeatures - Caractéristiques comportementales de l'utilisateur
     * @returns Prédiction du niveau de frustration avec facteurs contribuants
     */
    public predict(userFeatures: UserFeatures): FrustrationPrediction {
        try {
            this.logger.debug('Predicting frustration', { userId: userFeatures.userId });

            // Extraire et calculer les indicateurs de frustration
            const indicators = this.extractFrustrationIndicators(userFeatures);

            // Calculer le score global de frustration (approche adaptative)
            let frustrationScore = 0;
            const contributingFactors: string[] = [];

            // Appliquer les coefficients spécifiques à l'utilisateur si disponibles
            const userCoefficients = this.modelState.get(userFeatures.userId);

            if (userCoefficients && userCoefficients.length >= indicators.length) {
                // Utiliser les coefficients personnalisés
                frustrationScore = indicators.reduce((score, value, index) => {
                    const contribution = value * userCoefficients[index];
                    if (contribution > 0.1) {
                        contributingFactors.push(this.frustrationIndicators[index]);
                    }
                    return score + contribution;
                }, 0);

                // Normaliser le score
                frustrationScore = Math.min(1, Math.max(0, frustrationScore));
            } else {
                // Utiliser l'approche par défaut avec poids égaux
                const weights = Array(indicators.length).fill(1 / indicators.length);

                frustrationScore = indicators.reduce((score, value, index) => {
                    const contribution = value * weights[index];
                    if (contribution > 0.1) {
                        contributingFactors.push(this.frustrationIndicators[index]);
                    }
                    return score + contribution;
                }, 0);
            }

            // Déterminer le niveau de confiance
            const confidence = this.calculateConfidence(userFeatures);

            // Classer le niveau de frustration
            let level: 'low' | 'medium' | 'high' | 'critical';
            if (frustrationScore < 0.3) level = 'low';
            else if (frustrationScore < 0.5) level = 'medium';
            else if (frustrationScore < 0.75) level = 'high';
            else level = 'critical';

            // Générer des recommandations d'intervention
            const interventions = this.recommendInterventions(level, contributingFactors);

            return {
                score: frustrationScore,
                level,
                confidence,
                contributingFactors,
                recommendedInterventions: interventions,
                timestamp: new Date()
            };
        } catch (error) {
            this.logger.error('Error predicting frustration', { error, userId: userFeatures.userId });

            // Fournir une prédiction par défaut en cas d'erreur
            return {
                score: 0.3,
                level: 'medium',
                confidence: 0.4,
                contributingFactors: ['default_recovery'],
                recommendedInterventions: ['provide_guidance'],
                timestamp: new Date(),
                error: 'Prediction error occurred'
            };
        }
    }

    /**
     * Entraîne le modèle à partir des données historiques
     * 
     * @param historicalData - Historique d'interactions avec observations de frustration
     */
    public async train(historicalData: UserInteractionHistory[]): Promise<void> {
        this.logger.info('Training frustration prediction model', {
            dataPoints: historicalData.length
        });

        try {
            // Regrouper les données par utilisateur
            const userGroups = new Map<string, UserInteractionHistory[]>();

            historicalData.forEach(data => {
                if (!userGroups.has(data.userId)) {
                    userGroups.set(data.userId, []);
                }
                userGroups.get(data.userId)?.push(data);
            });

            // Pour chaque utilisateur, calculer les coefficients optimaux
            for (const [userId, userData] of userGroups.entries()) {
                // Ne traiter que les données avec observations de frustration
                const trainingData = userData.filter(data => data.observedFrustration !== undefined);

                if (trainingData.length < 5) {
                    this.logger.debug('Insufficient training data for user', {
                        userId,
                        dataPoints: trainingData.length
                    });
                    continue;
                }

                // Calcul des coefficients par optimisation simple
                const coefficients = this.learnCoefficients(trainingData);
                this.modelState.set(userId, coefficients);
            }

            this.lastTrainingDate = new Date();
            this.logger.info('Frustration model training completed', {
                usersProcessed: userGroups.size
            });
        } catch (error) {
            this.logger.error('Error training frustration model', { error });
            throw new Error(`Failed to train frustration model: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Extrait les indicateurs de frustration à partir des données utilisateur
     */
    private extractFrustrationIndicators(userFeatures: UserFeatures): number[] {
        const indicators: number[] = [];

        // 1. Erreurs répétées (normalisé entre 0-1)
        const repeatedErrors = userFeatures.errorRate
            ? Math.min(userFeatures.errorRate / 0.5, 1)
            : 0;
        indicators.push(repeatedErrors);

        // 2. Temps croissant par tâche
        const timePerTask = userFeatures.timePerTaskTrend
            ? Math.max(0, Math.min(userFeatures.timePerTaskTrend, 1))
            : 0;
        indicators.push(timePerTask);

        // 3. Clics rapides/multiples (signe d'impatience)
        const rapidClicks = userFeatures.clickFrequency
            ? Math.min(userFeatures.clickFrequency / 3, 1)
            : 0;
        indicators.push(rapidClicks);

        // 4. Recherche d'aide
        const helpSeeking = userFeatures.helpRequests
            ? Math.min(userFeatures.helpRequests / 5, 1)
            : 0;
        indicators.push(helpSeeking);

        // 5. Abandon de tâches
        const abandonment = userFeatures.taskAbandonment ?? 0;
        indicators.push(abandonment);

        // 6. Navigation erratique
        const erraticNavigation = userFeatures.navigationPatternScore
            ? 1 - Math.min(userFeatures.navigationPatternScore, 1)
            : 0;
        indicators.push(erraticNavigation);

        // 7. Retours en arrière dans les saisies
        const inputBacktracking = userFeatures.inputRevisions
            ? Math.min(userFeatures.inputRevisions / 10, 1)
            : 0;
        indicators.push(inputBacktracking);

        return indicators;
    }

    /**
     * Calcule la confiance dans la prédiction
     */
    private calculateConfidence(userFeatures: UserFeatures): number {
        // Facteurs affectant la confiance

        // 1. Quantité de données disponibles
        const dataCompletenessScore = Object.values(userFeatures).filter(v => v !== undefined).length /
            Object.keys(userFeatures).length;

        // 2. Personnalisation du modèle pour l'utilisateur
        const personalizationScore = this.modelState.has(userFeatures.userId) ? 1.0 : 0.6;

        // 3. Récence des données
        const recencyScore = userFeatures.lastActivityTimestamp
            ? Math.max(0.5, 1 - ((Date.now() - new Date(userFeatures.lastActivityTimestamp).getTime()) / (24 * 60 * 60 * 1000)) / 7)
            : 0.5;

        // Combinaison pondérée des facteurs
        return 0.4 * dataCompletenessScore + 0.4 * personalizationScore + 0.2 * recencyScore;
    }

    /**
     * Recommande des interventions basées sur le niveau de frustration
     */
    private recommendInterventions(
        level: 'low' | 'medium' | 'high' | 'critical',
        factors: string[]
    ): string[] {
        const interventions: string[] = [];

        // Interventions communes à tous les niveaux
        interventions.push('monitor_closely');

        // Interventions spécifiques au niveau
        switch (level) {
            case 'low':
                // Interventions légères et préventives
                interventions.push('subtle_encouragement');
                break;

            case 'medium':
                // Soutien modéré
                interventions.push('offer_guidance');
                interventions.push('provide_examples');

                // Interventions basées sur les facteurs spécifiques
                if (factors.includes('repeated_errors')) {
                    interventions.push('simplify_next_task');
                }
                if (factors.includes('increasing_time_per_task')) {
                    interventions.push('offer_hints');
                }
                break;

            case 'high':
                // Intervention plus active
                interventions.push('suggest_break');
                interventions.push('provide_detailed_help');
                interventions.push('adjust_difficulty');

                // Interventions basées sur les facteurs spécifiques
                if (factors.includes('abandonment')) {
                    interventions.push('offer_alternative_path');
                }
                if (factors.includes('help_seeking')) {
                    interventions.push('proactive_guidance');
                }
                break;

            case 'critical':
                // Intervention immédiate
                interventions.push('immediate_assistance');
                interventions.push('significant_simplification');
                interventions.push('direct_intervention');
                interventions.push('change_activity_completely');
                break;
        }

        return interventions;
    }

    /**
     * Apprend les coefficients optimaux à partir des données d'entraînement
     */
    private learnCoefficients(trainingData: UserInteractionHistory[]): number[] {
        // Initialiser les coefficients avec des valeurs uniformes
        const numIndicators = this.frustrationIndicators.length;
        const coefficients = Array(numIndicators).fill(1 / numIndicators);

        // Approche d'apprentissage simplifiée (gradient descent)
        const learningRate = 0.05;
        const iterations = 100;

        for (let iter = 0; iter < iterations; iter++) {
            let totalError = 0;

            for (const data of trainingData) {
                if (data.observedFrustration === undefined) continue;

                // Extraire les indicateurs de frustration
                const features = this.extractFrustrationIndicators({
                    userId: data.userId,
                    errorRate: data.errorRate,
                    timePerTaskTrend: data.timePerTaskTrend,
                    clickFrequency: data.clickFrequency,
                    helpRequests: data.helpRequests,
                    taskAbandonment: data.taskAbandonment,
                    navigationPatternScore: data.navigationPatternScore,
                    inputRevisions: data.inputRevisions,
                    lastActivityTimestamp: data.timestamp
                });

                // Calculer la prédiction actuelle
                const prediction = features.reduce((sum, value, index) =>
                    sum + value * coefficients[index], 0);

                // Calculer l'erreur
                const error = data.observedFrustration - prediction;
                totalError += Math.abs(error);

                // Ajuster les coefficients
                for (let i = 0; i < coefficients.length; i++) {
                    if (i < features.length) {
                        coefficients[i] += learningRate * error * features[i];

                        // Limiter les coefficients à des valeurs positives et normalisées
                        coefficients[i] = Math.max(0, coefficients[i]);
                    }
                }
            }

            // Normaliser les coefficients pour qu'ils somment à 1
            const sum = coefficients.reduce((s, c) => s + c, 0);
            if (sum > 0) {
                for (let i = 0; i < coefficients.length; i++) {
                    coefficients[i] /= sum;
                }
            }

            // Arrêt anticipé si l'erreur est suffisamment faible
            if (totalError / trainingData.length < 0.1) {
                break;
            }
        }

        return coefficients;
    }
}