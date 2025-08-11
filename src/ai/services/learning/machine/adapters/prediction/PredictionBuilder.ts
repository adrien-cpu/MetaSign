// src/ai/learning/adapters/prediction/PredictionBuilder.ts

import { LoggerFactory } from '@ai/utils/LoggerFactory';
import { LearningContext } from '@ai/learning/types';
import { UserFeatures } from '@ai/learning/types/prediction-types';
import { EngagementPredictionModel, FrustrationPredictionModel } from '@ai/learning/models/PredictiveModels';
import { AdaptationPredictions } from '@ai/learning/types/learning-interfaces';

/**
 * Service responsable de la construction des prédictions
 */
export class PredictionBuilder {
    private readonly logger = LoggerFactory.getLogger('PredictionBuilder');
    private readonly engagementModel: EngagementPredictionModel;
    private readonly frustrationModel: FrustrationPredictionModel;

    /**
     * Crée une instance du builder de prédictions
     * 
     * @param engagementModel Modèle de prédiction d'engagement
     * @param frustrationModel Modèle de prédiction de frustration
     */
    constructor(
        engagementModel: EngagementPredictionModel,
        frustrationModel: FrustrationPredictionModel
    ) {
        this.engagementModel = engagementModel;
        this.frustrationModel = frustrationModel;
    }

    /**
     * Construit les caractéristiques utilisateur à partir du contexte
     */
    public buildUserFeatures(context: LearningContext): UserFeatures {
        // Création de valeurs temporelles par défaut si manquantes
        const now = new Date();
        const timeOfDay = context.timestamp ?? now;
        const lastActivityTimestamp = context.lastActivityTime ?? context.timestamp ?? now;

        return {
            userId: context.userId,
            timeSpent: context.totalTimeSpent ?? context.timeSpent ?? 0,
            sessionCount: context.sessionCount ?? 0,
            completionRate: context.completionRate ?? 0,
            averageScore: context.averageScore ?? 0,
            clickRate: context.interactionRate ?? 0,
            pauseFrequency: context.pauseFrequency ?? 0,
            timeOfDay,
            dayOfWeek: timeOfDay.getDay(),
            errorRate: context.errorRate ?? 0,
            timePerTaskTrend: context.timePerTaskTrend ?? 0,
            clickFrequency: context.clickFrequency ?? 0,
            helpRequests: context.helpRequests ?? 0,
            taskAbandonment: context.abandonmentRate ?? 0,
            navigationPatternScore: context.navigationConsistency ?? 0,
            inputRevisions: context.inputCorrections ?? 0,
            lastActivityTimestamp
        };
    }

    /**
     * Génère les prédictions d'engagement et de frustration
     * 
     * @param userFeatures Caractéristiques utilisateur
     * @returns Prédictions générées ou undefined en cas d'erreur
     */
    public async generatePredictions(userFeatures: UserFeatures): Promise<AdaptationPredictions | undefined> {
        try {
            // Obtenir les prédictions des modèles
            const engagementPrediction = await this.engagementModel.predict(userFeatures);
            const frustrationPrediction = this.frustrationModel.predict(userFeatures);

            // Construire l'objet de prédictions
            return {
                engagement: {
                    predictedEngagement: engagementPrediction.predictedEngagement,
                    confidence: engagementPrediction.confidence ?? 0.8,
                    factors: ["timeSpent", "interactionRate", "completionRate"], // Valeurs par défaut
                    timestamp: new Date()
                },
                frustration: {
                    score: frustrationPrediction.score,
                    level: this.getFrustrationLevel(frustrationPrediction.score),
                    confidence: frustrationPrediction.confidence ?? 0.75,
                    contributingFactors: ["errorRate", "timePerTask"], // Valeurs par défaut
                    recommendedInterventions: ["paceAdjustment"], // Valeurs par défaut
                    timestamp: new Date()
                }
            };
        } catch (error) {
            this.logger.error('Error generating predictions', {
                error: error instanceof Error ? error.message : String(error)
            });
            return undefined;
        }
    }

    /**
     * Détermine le niveau de frustration textuel à partir du score
     */
    private getFrustrationLevel(score: number): string {
        if (score < 0.3) return "low";
        if (score < 0.6) return "medium";
        return "high";
    }
}