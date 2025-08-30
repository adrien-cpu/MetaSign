/**
 * @file src/ai/services/learning/human/evaluation/integration/EvaluationServiceRegistration.ts
 * @description Service d'enregistrement avancé pour les évaluateurs de compréhension
 * 
 * Fonctionnalités :
 * - 🔧 Enregistrement automatique des services d'évaluation
 * - 📊 Gestion du cycle de vie des évaluateurs
 * - 🔄 Support des mises à jour de configuration
 * - ⚡ Gestion d'erreurs robuste
 * - 📝 Logging détaillé des opérations
 * - 🎯 Support de multiples services simultanés
 * 
 * @module EvaluationServiceRegistration
 * @version 2.0.0 - Version améliorée
 * @since 2025
 * @author MetaSign Team
 */

import { LearningServiceRegistry } from '@/ai/services/learning/registry/LearningServiceRegistry';
import { ServiceDescription } from '@/ai/services/learning/registry/interfaces/ServiceDescription';
import { ComprehensionEvaluator } from '../ComprehensionEvaluator';
import { EvaluationConfig } from '../types';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/** Interface étendue pour EvaluationConfig avec propriétés optionnelles */
interface ExtendedEvaluationConfig extends EvaluationConfig {
    readonly evaluationType?: string;
}

/** Interface pour les évaluateurs avec méthodes communes */
interface EvaluatorService {
    evaluate?: (...args: unknown[]) => unknown;
    cleanup?: () => Promise<void> | void;
    [key: string]: unknown;
}

/** Interface pour le statut d'un service enregistré */
interface RegisteredService {
    readonly id: string;
    readonly evaluator: ComprehensionEvaluator & EvaluatorService;
    readonly config: ExtendedEvaluationConfig;
    readonly registeredAt: Date;
}

/** Options pour l'enregistrement de service */
export interface ServiceRegistrationOptions {
    readonly autoStart?: boolean;
    readonly healthCheckInterval?: number;
    readonly retryAttempts?: number;
}

/**
 * @class EvaluationServiceRegistration
 * @description Gestionnaire avancé pour l'enregistrement et le cycle de vie des services d'évaluation
 * 
 * Améliorations v2.0 :
 * - Support de multiples services simultanés
 * - Gestion d'erreurs robuste avec retry automatique
 * - Monitoring et logging détaillé
 * - Mise à jour dynamique des configurations
 * - Nettoyage automatique des ressources
 */
export class EvaluationServiceRegistration {
    private readonly logger = LoggerFactory.getLogger('EvaluationServiceRegistration');
    private readonly registry: LearningServiceRegistry;
    private readonly registeredServices = new Map<string, RegisteredService>();
    private serviceCounter = 0;

    /**
     * @constructor
     * @param registry Registre des services d'apprentissage
     */
    constructor(registry: LearningServiceRegistry) {
        this.registry = registry;
        this.logger.info('🔧 EvaluationServiceRegistration initialisé');
    }

    /**
     * Enregistre un service d'évaluation dans le registre avec gestion d'erreurs avancée
     * @param config Configuration du service d'évaluation
     * @param options Options d'enregistrement (optionnel)
     * @returns Identifiant du service enregistré
     * @throws Error si l'enregistrement échoue
     */
    public async registerEvaluationService(
        config: ExtendedEvaluationConfig, 
        options: ServiceRegistrationOptions = {}
    ): Promise<string> {
        try {
            this.logger.info('📝 Début d\'enregistrement du service d\'évaluation', { config });

            // Créer un nouvel évaluateur de compréhension
            const evaluator = new ComprehensionEvaluator(config) as ComprehensionEvaluator & EvaluatorService;
            await this.validateEvaluator(evaluator);

            // Générer un identifiant unique pour le service
            const serviceId = this.generateServiceId();

            // Créer la description du service
            const serviceDescription: ServiceDescription = {
                id: serviceId,
                name: `ComprehensionEvaluator-${this.serviceCounter}`,
                version: '2.0.0',
                description: `Service d'évaluation de compréhension configuré avec ${config.evaluationType || 'default'}`,
                instance: evaluator as unknown as ServiceDescription['instance'],
                metadata: {
                    evaluationType: config.evaluationType,
                    configuredAt: new Date().toISOString(),
                    autoStart: options.autoStart ?? true
                }
            };

            // Enregistrer le service dans le registre avec retry
            await this.registerWithRetry(serviceDescription, options.retryAttempts ?? 3);

            // Stocker les informations du service
            this.registeredServices.set(serviceId, {
                id: serviceId,
                evaluator,
                config,
                registeredAt: new Date()
            });

            this.logger.info('✅ Service d\'évaluation enregistré avec succès', {
                serviceId,
                totalServices: this.registeredServices.size
            });

            return serviceId;
        } catch (error) {
            this.logger.error('❌ Échec de l\'enregistrement du service d\'évaluation', { error, config });
            throw new Error(`Failed to register evaluation service: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Désenregistre un service d'évaluation spécifique du registre
     * @param serviceId Identifiant du service à désenregistrer
     * @returns Vrai si le service a été désenregistré avec succès
     */
    public async unregisterService(serviceId: string): Promise<boolean> {
        try {
            if (!this.registeredServices.has(serviceId)) {
                this.logger.warn('⚠️ Tentative de désenregistrement d\'un service inexistant', { serviceId });
                return false;
            }

            const service = this.registeredServices.get(serviceId)!;
            
            // Nettoyer les ressources de l'évaluateur
            await this.cleanupEvaluator(service.evaluator);

            // Désenregistrer du registre
            const success = this.registry.unregisterService(serviceId);

            if (success) {
                this.registeredServices.delete(serviceId);
                this.logger.info('✅ Service d\'évaluation désenregistré avec succès', {
                    serviceId,
                    remainingServices: this.registeredServices.size
                });
            } else {
                this.logger.error('❌ Échec du désenregistrement du service', { serviceId });
            }

            return success;
        } catch (error) {
            this.logger.error('❌ Erreur lors du désenregistrement', { serviceId, error });
            return false;
        }
    }

    /**
     * Désenregistre tous les services d'évaluation
     * @returns Nombre de services désenregistrés avec succès
     */
    public async unregisterAllServices(): Promise<number> {
        const serviceIds = Array.from(this.registeredServices.keys());
        let successCount = 0;

        for (const serviceId of serviceIds) {
            if (await this.unregisterService(serviceId)) {
                successCount++;
            }
        }

        this.logger.info('🧹 Nettoyage complet des services', {
            totalServices: serviceIds.length,
            successCount,
            failureCount: serviceIds.length - successCount
        });

        return successCount;
    }

    /**
     * Obtient la liste des services enregistrés
     * @returns Liste des services avec leurs informations
     */
    public getRegisteredServices(): ReadonlyArray<Readonly<RegisteredService>> {
        return Array.from(this.registeredServices.values());
    }

    /**
     * Met à jour la configuration d'un service existant
     * @param serviceId Identifiant du service
     * @param newConfig Nouvelle configuration
     * @returns Vrai si la mise à jour a réussi
     */
    public async updateServiceConfig(serviceId: string, newConfig: ExtendedEvaluationConfig): Promise<boolean> {
        try {
            const service = this.registeredServices.get(serviceId);
            if (!service) {
                this.logger.warn('⚠️ Service introuvable pour mise à jour', { serviceId });
                return false;
            }

            // Créer un nouvel évaluateur avec la nouvelle config
            const newEvaluator = new ComprehensionEvaluator(newConfig) as ComprehensionEvaluator & EvaluatorService;
            await this.validateEvaluator(newEvaluator);

            // Nettoyer l'ancien évaluateur
            await this.cleanupEvaluator(service.evaluator);

            // Mettre à jour le service
            this.registeredServices.set(serviceId, {
                ...service,
                evaluator: newEvaluator,
                config: newConfig
            });

            this.logger.info('🔄 Configuration du service mise à jour', { serviceId });
            return true;
        } catch (error) {
            this.logger.error('❌ Échec de mise à jour de configuration', { serviceId, error });
            return false;
        }
    }

    // ==================== MÉTHODES PRIVÉES ====================

    private generateServiceId(): string {
        return `evaluation_service_${++this.serviceCounter}_${Date.now()}`;
    }

    private async validateEvaluator(evaluator: ComprehensionEvaluator & EvaluatorService): Promise<void> {
        // Validation basique de l'évaluateur
        if (!evaluator || typeof evaluator.evaluate !== 'function') {
            throw new Error('Invalid evaluator instance');
        }
    }

    private async registerWithRetry(
        serviceDescription: ServiceDescription, 
        maxAttempts: number
    ): Promise<void> {
        let attempts = 0;
        let lastError: Error | null = null;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                const success = this.registry.registerService(serviceDescription);
                if (success) {
                    return;
                }
                throw new Error('Registration returned false');
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                if (attempts < maxAttempts) {
                    this.logger.warn(`⚠️ Tentative d'enregistrement ${attempts}/${maxAttempts} échouée, retry...`, { error });
                    await this.sleep(Math.pow(2, attempts - 1) * 1000); // Backoff exponentiel
                }
            }
        }

        throw new Error(`Failed to register service after ${maxAttempts} attempts: ${lastError?.message}`);
    }

    private async cleanupEvaluator(evaluator: ComprehensionEvaluator & EvaluatorService): Promise<void> {
        try {
            // Si l'évaluateur a une méthode de nettoyage, l'appeler
            if (evaluator.cleanup && typeof evaluator.cleanup === 'function') {
                await evaluator.cleanup();
            }
        } catch (error) {
            this.logger.warn('⚠️ Erreur lors du nettoyage de l\'évaluateur', { error });
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Nettoie toutes les ressources lors de la destruction de l'instance
     */
    public async dispose(): Promise<void> {
        this.logger.info('🧹 Nettoyage de EvaluationServiceRegistration');
        await this.unregisterAllServices();
    }
}