/**
 * @file src/ai/services/learning/registry/managers/HealthCheckManager.ts
 * @description Gestionnaire de vérification de santé des services
 * @module HealthCheckManager
 * @requires @/ai/services/learning/registry/interfaces/ServiceDescription
 * @requires @/ai/utils/LoggerFactory
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module gère la vérification périodique de l'état de santé des services
 * enregistrés dans le registre de services d'apprentissage.
 */

import { ServiceHealth, BaseService } from '@/ai/services/learning/registry/interfaces/ServiceDescription';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Type de callback pour les services défaillants
 */
type UnhealthyServiceCallback = (serviceId: string, health: ServiceHealth) => void;

/**
 * Gestionnaire de vérification de santé des services
 * 
 * @class HealthCheckManager
 * @description Gère la vérification périodique de l'état de santé des services
 * et notifie en cas de problème.
 */
export class HealthCheckManager {
    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('HealthCheckManager');

    /**
     * Services à surveiller
     * @private
     */
    private services: Map<string, BaseService | Record<string, unknown>>;

    /**
     * États de santé des services
     * @private
     */
    private healthStatus: Map<string, ServiceHealth>;

    /**
     * Intervalle de vérification (en ms)
     * @private
     * @readonly
     */
    private readonly checkInterval: number;

    /**
     * Callback pour les services défaillants
     * @private
     * @readonly
     */
    private readonly unhealthyCallback: UnhealthyServiceCallback;

    /**
     * ID de l'intervalle de vérification
     * @private
     */
    private intervalId?: NodeJS.Timeout;

    /**
     * Constructeur du gestionnaire de vérification de santé
     * 
     * @constructor
     * @param {number} checkInterval - Intervalle de vérification (en ms)
     * @param {UnhealthyServiceCallback} unhealthyCallback - Callback pour les services défaillants
     */
    constructor(
        checkInterval: number,
        unhealthyCallback: UnhealthyServiceCallback
    ) {
        this.services = new Map<string, BaseService | Record<string, unknown>>();
        this.healthStatus = new Map<string, ServiceHealth>();
        this.checkInterval = checkInterval;
        this.unhealthyCallback = unhealthyCallback;
    }

    /**
     * Enregistre un service pour la surveillance
     * 
     * @method registerService
     * @param {string} serviceId - Identifiant du service
     * @param {BaseService | Record<string, unknown>} instance - Instance du service
     * @public
     */
    public registerService(serviceId: string, instance: BaseService | Record<string, unknown>): void {
        this.services.set(serviceId, instance);

        // Initialiser l'état de santé
        this.healthStatus.set(serviceId, {
            isHealthy: true,
            status: 'starting',
            message: 'Service is starting'
        });

        this.logger.info(`Service ${serviceId} registered for health monitoring`);
    }

    /**
     * Désenregistre un service de la surveillance
     * 
     * @method unregisterService
     * @param {string} serviceId - Identifiant du service
     * @public
     */
    public unregisterService(serviceId: string): void {
        this.services.delete(serviceId);
        this.healthStatus.delete(serviceId);

        this.logger.info(`Service ${serviceId} unregistered from health monitoring`);
    }

    /**
     * Vérifie l'état de santé d'un service
     * 
     * @method checkServiceHealth
     * @param {string} serviceId - Identifiant du service
     * @returns {Promise<ServiceHealth>} État de santé du service
     * @public
     * @async
     */
    public async checkServiceHealth(serviceId: string): Promise<ServiceHealth> {
        if (!this.services.has(serviceId)) {
            return {
                isHealthy: false,
                status: 'not_found',
                message: `Service ${serviceId} not found`
            };
        }

        const instance = this.services.get(serviceId);
        let health: ServiceHealth;

        try {
            // Vérifier si le service a une méthode de vérification de santé
            if (instance && 'checkHealth' in instance && typeof instance.checkHealth === 'function') {
                health = await instance.checkHealth();
            } else {
                // Vérification de santé par défaut
                health = {
                    isHealthy: true,
                    status: 'healthy',
                    message: 'Service is healthy'
                };
            }

            // Ajouter l'horodatage
            health.lastChecked = new Date();

            // Mettre à jour l'état de santé
            this.healthStatus.set(serviceId, health);

            // Notifier si le service est défaillant
            if (!health.isHealthy) {
                this.unhealthyCallback(serviceId, health);
            }

            return health;
        } catch (error) {
            // En cas d'erreur lors de la vérification
            health = {
                isHealthy: false,
                status: 'unhealthy',
                message: `Error checking health: ${error instanceof Error ? error.message : String(error)}`,
                lastChecked: new Date(),
                details: {
                    error: error instanceof Error
                        ? {
                            message: error.message,
                            name: error.name,
                            stack: error.stack
                        }
                        : String(error)
                }
            };

            // Mettre à jour l'état de santé
            this.healthStatus.set(serviceId, health);

            // Notifier
            this.unhealthyCallback(serviceId, health);

            return health;
        }
    }

    /**
     * Vérifie l'état de santé de tous les services
     * 
     * @method checkAllServicesHealth
     * @returns {Promise<Map<string, ServiceHealth>>} États de santé des services
     * @public
     * @async
     */
    public async checkAllServicesHealth(): Promise<Map<string, ServiceHealth>> {
        const results = new Map<string, ServiceHealth>();

        // Vérifier chaque service
        for (const serviceId of this.services.keys()) {
            const health = await this.checkServiceHealth(serviceId);
            results.set(serviceId, health);
        }

        return results;
    }

    /**
     * Vérifie si un service est en bonne santé
     * 
     * @method isServiceHealthy
     * @param {string} serviceId - Identifiant du service
     * @returns {boolean} Vrai si le service est en bonne santé
     * @public
     */
    public isServiceHealthy(serviceId: string): boolean {
        if (!this.healthStatus.has(serviceId)) {
            return false;
        }

        return this.healthStatus.get(serviceId)!.isHealthy;
    }

    /**
     * Obtient l'état de santé d'un service
     * 
     * @method getServiceHealth
     * @param {string} serviceId - Identifiant du service
     * @returns {ServiceHealth | undefined} État de santé du service
     * @public
     */
    public getServiceHealth(serviceId: string): ServiceHealth | undefined {
        return this.healthStatus.get(serviceId);
    }

    /**
     * Démarre la surveillance périodique
     * 
     * @method startMonitoring
     * @public
     */
    public startMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(async () => {
            await this.checkAllServicesHealth();
        }, this.checkInterval);

        this.logger.info(`Health monitoring started with interval of ${this.checkInterval}ms`);
    }

    /**
     * Arrête la surveillance périodique
     * 
     * @method stopMonitoring
     * @public
     */
    public stopMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;

            this.logger.info('Health monitoring stopped');
        }
    }

    /**
     * Obtient le nombre de services surveillés
     * 
     * @method getServiceCount
     * @returns {number} Nombre de services
     * @public
     */
    public getServiceCount(): number {
        return this.services.size;
    }

    /**
     * Obtient le nombre de services défaillants
     * 
     * @method getUnhealthyServiceCount
     * @returns {number} Nombre de services défaillants
     * @public
     */
    public getUnhealthyServiceCount(): number {
        let count = 0;

        for (const health of this.healthStatus.values()) {
            if (!health.isHealthy) {
                count++;
            }
        }

        return count;
    }
}