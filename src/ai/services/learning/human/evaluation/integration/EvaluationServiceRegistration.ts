/**
 * @file src/ai/services/learning/human/evaluation/integration/EvaluationServiceRegistration.ts
 * @description Service d'enregistrement pour les évaluateurs de compréhension
 */

import { LearningServiceRegistry } from '@/ai/services/learning/registry/LearningServiceRegistry';
import { ComprehensionEvaluator } from '../ComprehensionEvaluator';
import { EvaluationConfig } from '../types';

/**
 * @class EvaluationServiceRegistration
 * @description Gère l'enregistrement et le désenregistrement des services d'évaluation dans le registre
 */
export class EvaluationServiceRegistration {
    private registry: LearningServiceRegistry;
    private registeredServiceId: string | null = null;

    /**
     * @constructor
     * @param registry Registre des services d'apprentissage
     */
    constructor(registry: LearningServiceRegistry) {
        this.registry = registry;
    }

    /**
     * Enregistre un service d'évaluation dans le registre
     * @param config Configuration du service d'évaluation
     * @returns Identifiant du service enregistré
     */
    public async registerEvaluationService(config: EvaluationConfig): Promise<string> {
        // Créer un nouvel évaluateur de compréhension
        const evaluator = new ComprehensionEvaluator(config);

        // Générer un identifiant unique pour le service
        const serviceId = `evaluation_service_${Date.now()}`;

        // Enregistrer le service dans le registre
        this.registry.registerService(serviceId, evaluator);

        // Stocker l'identifiant pour pouvoir désenregistrer le service plus tard
        this.registeredServiceId = serviceId;

        return serviceId;
    }

    /**
     * Désenregistre le service d'évaluation du registre
     * @returns Vrai si le service a été désenregistré avec succès
     */
    public async unregisterService(): Promise<boolean> {
        if (!this.registeredServiceId) {
            return false;
        }

        const success = this.registry.unregisterService(this.registeredServiceId);

        if (success) {
            this.registeredServiceId = null;
        }

        return success;
    }
}