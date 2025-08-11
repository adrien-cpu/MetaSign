/**
 * src/ai/services/learning/personalization/IntelligentAdapter.ts
 * @description Adaptateur intelligent qui utilise des modèles prédictifs pour optimiser
 * dynamiquement l'expérience d'apprentissage en fonction du contexte et des besoins spécifiques de l'utilisateur.
 
**/


import { LoggerFactory } from '@ai/utils/LoggerFactory';
import { EngagementPredictionModel, FrustrationPredictionModel } from '@ai/learning/models/PredictiveModels';
import { EthicalValidator } from '@ai/learning/ethics/EthicalValidator';
import {
    LearningContext,
    UserProfile,
} from '@ai/learning/types';
import { UserFeatures } from '@ai/learning/types/prediction-types';
import { IIntelligentAdapter } from '@ai/learning/interfaces/IIntelligentAdapter';
import {
    Adaptation
} from '@ai/learning/types/AdaptedContent';
import {
    AdaptationContext,
    AdaptationMetadata,
    LearningAdaptation
} from '@ai/learning/types/learning-interfaces';

// Importation des nouveaux composants
import { IAdaptationStrategy, AdaptationStrategyFactory, AdaptationStrategySelector } from './strategies';
import { PredictionBuilder } from '../../../learning/adapters/prediction';
import { AdaptationValidatorService } from '../../../learning/adapters/validation';
import { FallbackService } from '../../../learning/adapters/fallback';

/**
 * Adaptateur intelligent qui utilise des modèles prédictifs pour optimiser
 * dynamiquement l'expérience d'apprentissage en fonction du contexte et
 * des besoins spécifiques de l'utilisateur.
 */
export class IntelligentAdapter implements IIntelligentAdapter {
    private readonly logger = LoggerFactory.getLogger('IntelligentAdapter');

    // Services spécialisés
    private readonly predictionBuilder: PredictionBuilder;
    private readonly validatorService: AdaptationValidatorService;
    private readonly strategySelector: AdaptationStrategySelector;
    private readonly fallbackService: FallbackService;

    // Registre des stratégies d'adaptation
    private readonly adaptationStrategies: Map<string, IAdaptationStrategy>;

    /**
     * Crée une nouvelle instance de l'adaptateur intelligent
     * 
     * @param engagementModel - Modèle de prédiction d'engagement
     * @param frustrationModel - Modèle de prédiction de frustration
     * @param ethicalValidator - Validateur éthique pour les adaptations
     */
    constructor(
        engagementModel: EngagementPredictionModel,
        frustrationModel: FrustrationPredictionModel,
        ethicalValidator: EthicalValidator
    ) {
        // Initialiser les services spécialisés
        this.predictionBuilder = new PredictionBuilder(engagementModel, frustrationModel);
        this.validatorService = new AdaptationValidatorService(ethicalValidator);
        this.strategySelector = new AdaptationStrategySelector();
        this.fallbackService = new FallbackService();

        // Initialiser les stratégies d'adaptation
        this.adaptationStrategies = AdaptationStrategyFactory.createDefaultStrategies();
    }

    /**
     * Génère des adaptations pour l'utilisateur en fonction des données d'entrée
     */
    public async generateAdaptations(
        context: LearningContext,
        userProfile: UserProfile
    ): Promise<Adaptation[]> {
        try {
            // Extraire les caractéristiques utilisateur et générer les prédictions
            const userFeatures = this.buildUserFeatures(context);
            const predictions = await this.predictionBuilder.generatePredictions(userFeatures);

            if (!predictions?.engagement || !predictions?.frustration) {
                throw new Error('Failed to generate predictions');
            }

            // Sélectionner les stratégies appropriées
            const selectedStrategies = this.strategySelector.selectStrategies(
                this.adaptationStrategies,
                predictions.engagement.predictedEngagement,
                predictions.frustration.score
            );

            // Appliquer les stratégies pour générer les adaptations
            const adaptations: Adaptation[] = [];

            for (const strategy of selectedStrategies) {
                try {
                    const adaptation = strategy.apply(context, userProfile);
                    adaptations.push(adaptation);
                } catch (error) {
                    this.logger.error(`Error applying strategy ${strategy.type}`, {
                        userId: context.userId,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            return adaptations.length > 0 ? adaptations : [this.fallbackService.getFallbackAdaptation()];
        } catch (error) {
            this.logger.error('Error generating adaptations', {
                userId: context.userId,
                error: error instanceof Error ? error.message : String(error)
            });
            return [this.fallbackService.getFallbackAdaptation()];
        }
    }

    /**
     * Évalue les adaptations proposées et retourne les adaptations validées
     */
    public async evaluateAdaptations(
        userId: string,
        context: LearningContext,
        adaptations: Adaptation[]
    ): Promise<Adaptation[]> {
        return this.validatorService.validateAdaptations(userId, context, adaptations);
    }

    /**
     * Met à jour le modèle d'adaptation basé sur le feedback
     */
    public async updateModel(
        userId: string,
        adaptationResults: Record<string, boolean>
    ): Promise<boolean> {
        try {
            this.logger.info('Updating adaptation model', {
                userId,
                adaptationCount: Object.keys(adaptationResults).length
            });

            const positiveCount = Object.values(adaptationResults).filter(v => v).length;

            // Pour un futur usage, on pourrait implémenter une vraie mise à jour des modèles ici
            this.logger.info('Adaptation feedback metrics', {
                userId,
                adaptationCount: Object.keys(adaptationResults).length,
                positiveCount,
                acceptanceRate: positiveCount / Object.keys(adaptationResults).length
            });

            // Implémentation future de la mise à jour du modèle
            return true;
        } catch (error) {
            this.logger.error('Error updating adaptation model', {
                userId,
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * Construit les caractéristiques utilisateur pour les prédictions
     */
    public buildUserFeatures(context: LearningContext): UserFeatures {
        return this.predictionBuilder.buildUserFeatures(context);
    }

    /**
     * Adapte l'expérience d'apprentissage en fonction du contexte et des besoins de l'utilisateur
     * 
     * @param context - Contexte d'apprentissage actuel
     * @param userProfile - Profil de l'utilisateur
     * @returns Résultat d'adaptation avec actions recommandées
     */
    public async adapt(
        context: LearningContext,
        userProfile: UserProfile
    ): Promise<LearningAdaptation> {
        this.logger.debug('Starting adaptation process', { userId: context.userId });

        try {
            // Mesurer le temps de début pour le calcul du temps de traitement
            const startTime = Date.now();

            // 1. Générer les adaptations
            const adaptations = await this.generateAdaptations(context, userProfile);

            // 2. Évaluer les adaptations
            const validatedAdaptations = await this.evaluateAdaptations(
                context.userId,
                context,
                adaptations
            );

            // 3. Obtenir les prédictions pour les inclure dans la réponse
            const userFeatures = this.buildUserFeatures(context);
            const predictions = await this.predictionBuilder.generatePredictions(userFeatures);

            // 4. Créer le contexte de résultat
            const now = new Date();
            const adaptationContext: AdaptationContext = {
                userId: context.userId,
                timestamp: now.getTime(),
                lastUpdate: now.getTime()
            };

            // 5. Calculer le niveau de confiance - moyenne pondérée des confiances de prédiction
            const engagementConfidence = predictions?.engagement?.confidence ?? 0.8;
            const frustrationConfidence = predictions?.frustration?.confidence ?? 0.75;
            const confidence = (engagementConfidence * 0.6 + frustrationConfidence * 0.4);

            // 6. Calculer le temps de traitement
            const processingTime = Date.now() - startTime;

            // 7. Construire les métadonnées
            const metadata: AdaptationMetadata = {
                adaptationCount: validatedAdaptations.length,
                confidence,
                processingTime
            };

            // 8. Construire le résultat final
            const learningAdaptation: LearningAdaptation = {
                adaptations: validatedAdaptations,
                context: adaptationContext,
                metadata,
                ...(predictions ? { predictions } : {})
            };

            return learningAdaptation;
        } catch (error) {
            this.logger.error('Error during adaptation process', {
                userId: context.userId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Fournir une adaptation minimale de secours en cas d'erreur
            return this.fallbackService.getFallbackAdaptationResult(
                context,
                error instanceof Error ? error.message : String(error)
            );
        }
    }
}