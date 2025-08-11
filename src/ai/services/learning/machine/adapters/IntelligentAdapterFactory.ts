//src/ai/learning/adapters/IntelligentAdapterFactory.ts
import { LoggerFactory } from '@ai/utils/LoggerFactory';
import { EngagementPredictionModel, FrustrationPredictionModel } from '../models/PredictiveModels';
import { EthicalValidator } from '../ethics/EthicalValidator';
import { IntelligentAdapter } from '../../services/learning/personalization/IntelligentAdapter';

/**
 * Factory pour créer et configurer l'adaptateur intelligent
 */
export class IntelligentAdapterFactory {
    private static readonly logger = LoggerFactory.getLogger('IntelligentAdapterFactory');

    /**
     * Crée une instance de l'adaptateur intelligent avec les dépendances nécessaires
     * 
     * @returns Instance configurée de l'adaptateur intelligent
     */
    public static createAdapter(): IntelligentAdapter {
        this.logger.debug('Creating IntelligentAdapter instance');

        try {
            // Création des dépendances
            const engagementModel = this.createEngagementModel();
            const frustrationModel = this.createFrustrationModel();
            const ethicalValidator = this.createEthicalValidator();

            // Création de l'adaptateur
            return new IntelligentAdapter(
                engagementModel,
                frustrationModel,
                ethicalValidator
            );
        } catch (error) {
            this.logger.error('Error creating IntelligentAdapter', {
                error: error instanceof Error ? error.message : String(error)
            });

            // Lancer l'erreur pour permettre à l'appelant de la gérer
            throw error;
        }
    }

    /**
     * Crée un modèle de prédiction d'engagement
     */
    private static createEngagementModel(): EngagementPredictionModel {
        this.logger.debug('Creating EngagementPredictionModel');

        // Cette implémentation pourrait être remplacée par une création
        // plus sophistiquée avec injection de dépendances
        return new EngagementPredictionModel();
    }

    /**
     * Crée un modèle de prédiction de frustration
     */
    private static createFrustrationModel(): FrustrationPredictionModel {
        this.logger.debug('Creating FrustrationPredictionModel');

        return new FrustrationPredictionModel();
    }

    /**
     * Crée un validateur éthique
     */
    private static createEthicalValidator(): EthicalValidator {
        this.logger.debug('Creating EthicalValidator');

        return new EthicalValidator();
    }
}