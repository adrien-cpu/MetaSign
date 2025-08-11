/**
 * @file src/ai/services/learning/registry/registry/LearningServiceRegistry.ts
 * @description Registre centralisé des services d'apprentissage
 * @module LearningServiceRegistry
 * @requires @/ai/services/learning/registry/interfaces/ServiceDescription
 * @requires @/ai/utils/LoggerFactory
 * @version 2.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module implémente un registre centralisé pour tous les services du module 
 * d'apprentissage, permettant leur découverte, leur surveillance et leur gestion.
 */

import {
    ServiceDescription,
    ServiceHealth,
    ServiceRegistryConfig,
    BaseService
} from '@/ai/services/learning/registry/interfaces/ServiceDescription';
import { DependencyManager } from '@/ai/services/learning/registry/managers/DependencyManager';
import { EventManager, EventData } from '@/ai/services/learning/registry/managers/EventManager';
import { HealthCheckManager } from '@/ai/services/learning/registry/managers/HealthCheckManager';
import { RecoveryManager } from '@/ai/services/learning/registry/managers/RecoveryManager';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Type des écouteurs d'événements de registre
 */
type RegistryEventListener = (event: string, data?: EventData) => void;

/**
 * Registre centralisé des services d'apprentissage
 * 
 * @class LearningServiceRegistry
 * @description Permet l'enregistrement, la découverte et la gestion 
 * des services du module d'apprentissage.
 * 
 * @example
 * ```typescript
 * // Obtenir le registre
 * const registry = LearningServiceRegistry.getInstance();
 * 
 * // Enregistrer un service
 * registry.registerService({
 *   id: 'myService',
 *   name: 'Mon Service',
 *   version: '1.0.0',
 *   description: 'Description de mon service',
 *   instance: new MyService()
 * });
 * 
 * // Récupérer un service
 * const myService = registry.getService<MyService>('myService');
 * ```
 */
export class LearningServiceRegistry {
    /**
     * Instance unique (singleton)
     * @private
     * @static
     */
    private static instance?: LearningServiceRegistry;

    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('LearningServiceRegistry');

    /**
     * Registre des services
     * @private
     */
    private services: Map<string, ServiceDescription>;

    /**
     * Gestionnaire de dépendances
     * @private
     * @readonly
     */
    private readonly dependencyManager: DependencyManager;

    /**
     * Gestionnaire d'événements
     * @private
     * @readonly
     */
    private readonly eventManager: EventManager;

    /**
     * Gestionnaire de vérification de santé
     * @private
     * @readonly
     */
    private readonly healthCheckManager: HealthCheckManager;

    /**
     * Gestionnaire de récupération
     * @private
     * @readonly
     */
    private readonly recoveryManager: RecoveryManager;

    /**
     * Écouteurs d'événements
     * @private
     */
    private eventListeners: Map<string, RegistryEventListener[]>;

    /**
     * Configuration du registre
     * @private
     * @readonly
     */
    private readonly config: ServiceRegistryConfig;

    /**
     * Constructeur du registre de services
     * 
     * @constructor
     * @param {Partial<ServiceRegistryConfig>} [config={}] - Configuration optionnelle
     * @private
     */
    private constructor(config: Partial<ServiceRegistryConfig> = {}) {
        this.services = new Map<string, ServiceDescription>();
        this.eventListeners = new Map<string, RegistryEventListener[]>();

        // Configuration par défaut
        this.config = {
            autoRecover: config.autoRecover ?? true,
            healthCheckInterval: config.healthCheckInterval ?? 60000, // 1 minute
            maxRecoveryAttempts: config.maxRecoveryAttempts ?? 3,
            serviceTimeout: config.serviceTimeout ?? 5000 // 5 secondes
        };

        // Initialiser les managers
        this.dependencyManager = new DependencyManager();
        this.eventManager = new EventManager();
        this.healthCheckManager = new HealthCheckManager(
            this.config.healthCheckInterval,
            this.handleServiceUnhealthy.bind(this)
        );
        this.recoveryManager = new RecoveryManager(
            this.config.maxRecoveryAttempts,
            this.handleServiceRecovered.bind(this),
            this.handleServiceUnrecoverable.bind(this)
        );

        this.logger.info('LearningServiceRegistry initialisé');
    }

    /**
     * Obtient l'instance unique du registre (singleton)
     * 
     * @method getInstance
     * @static
     * @param {Partial<ServiceRegistryConfig>} [config={}] - Configuration optionnelle
     * @returns {LearningServiceRegistry} Instance unique du registre
     * @public
     */
    public static getInstance(config: Partial<ServiceRegistryConfig> = {}): LearningServiceRegistry {
        if (!LearningServiceRegistry.instance) {
            LearningServiceRegistry.instance = new LearningServiceRegistry(config);
        }
        return LearningServiceRegistry.instance;
    }

    /**
     * Enregistre un service dans le registre
     * 
     * @method registerService
     * @param {ServiceDescription} service - Description du service à enregistrer
     * @returns {boolean} Vrai si l'enregistrement a réussi
     * @public
     * @throws {Error} Si un service avec le même ID existe déjà
     */
    public registerService(service: ServiceDescription): boolean {
        // Vérifier si le service existe déjà
        if (this.services.has(service.id)) {
            throw new Error(`Service with ID ${service.id} already registered`);
        }

        // Ajouter le service au registre
        this.services.set(service.id, service);

        // Ajouter les dépendances
        if (service.dependencies && service.dependencies.length > 0) {
            this.dependencyManager.addDependencies(service.id, service.dependencies);
        }

        // Démarrer la surveillance de santé
        this.healthCheckManager.registerService(service.id, service.instance);

        // Publier l'événement d'enregistrement
        this.publishEvent('service.registered', {
            serviceId: service.id,
            serviceName: service.name,
            timestamp: new Date()
        });

        this.logger.info(`Service ${service.name} (${service.id}) enregistré`);

        return true;
    }

    /**
     * Désenregistre un service du registre
     * 
     * @method unregisterService
     * @param {string} serviceId - Identifiant du service à désenregistrer
     * @returns {boolean} Vrai si le désenregistrement a réussi
     * @public
     */
    public unregisterService(serviceId: string): boolean {
        // Vérifier si le service existe
        if (!this.services.has(serviceId)) {
            return false;
        }

        const service = this.services.get(serviceId);

        // Arrêter la surveillance de santé
        this.healthCheckManager.unregisterService(serviceId);

        // Supprimer les dépendances
        this.dependencyManager.removeDependencies(serviceId);

        // Supprimer le service du registre
        this.services.delete(serviceId);

        // Publier l'événement de désenregistrement
        this.publishEvent('service.unregistered', {
            serviceId,
            serviceName: service?.name,
            timestamp: new Date()
        });

        this.logger.info(`Service ${service?.name} (${serviceId}) désenregistré`);

        return true;
    }

    /**
     * Récupère un service du registre
     * 
     * @method getService
     * @template T - Type du service
     * @param {string} serviceId - Identifiant du service à récupérer
     * @returns {T | undefined} Instance du service ou undefined si non trouvé
     * @public
     */
    public getService<T extends BaseService>(serviceId: string): T | undefined {
        // Vérifier si le service existe
        if (!this.services.has(serviceId)) {
            return undefined;
        }

        const service = this.services.get(serviceId);

        // Vérifier si le service est en bonne santé
        if (service && this.healthCheckManager.isServiceHealthy(serviceId)) {
            return service.instance as T;
        }

        // Essayer de récupérer le service malgré son état de santé
        return service?.instance as T;
    }

    /**
     * Récupère tous les services du registre
     * 
     * @method getAllServices
     * @returns {ServiceDescription[]} Liste des services enregistrés
     * @public
     */
    public getAllServices(): ServiceDescription[] {
        return Array.from(this.services.values());
    }

    /**
     * Vérifie si un service est enregistré
     * 
     * @method hasService
     * @param {string} serviceId - Identifiant du service à vérifier
     * @returns {boolean} Vrai si le service est enregistré
     * @public
     */
    public hasService(serviceId: string): boolean {
        return this.services.has(serviceId);
    }

    /**
     * Vérifie l'état de santé d'un service
     * 
     * @method checkServiceHealth
     * @param {string} serviceId - Identifiant du service à vérifier
     * @returns {Promise<ServiceHealth>} État de santé du service
     * @public
     * @async
     */
    public async checkServiceHealth(serviceId: string): Promise<ServiceHealth> {
        // Vérifier si le service existe
        if (!this.services.has(serviceId)) {
            return {
                isHealthy: false,
                status: 'not_found',
                message: `Service ${serviceId} not found`
            };
        }

        // Vérifier l'état de santé
        return this.healthCheckManager.checkServiceHealth(serviceId);
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
        return this.healthCheckManager.checkAllServicesHealth();
    }

    /**
     * Ajoute un écouteur d'événements
     * 
     * @method addEventListener
     * @param {string} event - Nom de l'événement
     * @param {RegistryEventListener} listener - Fonction de rappel
     * @public
     */
    public addEventListener(event: string, listener: RegistryEventListener): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }

        this.eventListeners.get(event)!.push(listener);
    }

    /**
     * Supprime un écouteur d'événements
     * 
     * @method removeEventListener
     * @param {string} event - Nom de l'événement
     * @param {RegistryEventListener} listener - Fonction de rappel à supprimer
     * @public
     */
    public removeEventListener(event: string, listener: RegistryEventListener): void {
        if (!this.eventListeners.has(event)) {
            return;
        }

        const listeners = this.eventListeners.get(event)!;
        const index = listeners.indexOf(listener);

        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Publie un événement
     * 
     * @method publishEvent
     * @param {string} event - Nom de l'événement
     * @param {EventData} [data] - Données associées à l'événement
     * @private
     */
    private publishEvent(event: string, data?: EventData): void {
        // Notifier les écouteurs directs
        if (this.eventListeners.has(event)) {
            for (const listener of this.eventListeners.get(event)!) {
                try {
                    listener(event, data);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error(`Error in event listener for ${event}: ${errorMessage}`);
                }
            }
        }

        // Notifier via le gestionnaire d'événements
        this.eventManager.publishEvent(event, data);
    }

    /**
     * Gère un service détecté comme défaillant
     * 
     * @method handleServiceUnhealthy
     * @param {string} serviceId - Identifiant du service défaillant
     * @param {ServiceHealth} health - État de santé du service
     * @private
     */
    private handleServiceUnhealthy(serviceId: string, health: ServiceHealth): void {
        this.logger.warn(`Service ${serviceId} is unhealthy: ${health.message}`);

        // Publier l'événement de service défaillant
        this.publishEvent('service.unhealthy', {
            serviceId,
            health,
            timestamp: new Date()
        });

        // Tenter de récupérer le service si la récupération automatique est activée
        if (this.config.autoRecover) {
            const service = this.services.get(serviceId);
            if (service) {
                this.recoveryManager.attemptRecovery(serviceId, service.instance);
            }
        }
    }

    /**
     * Gère un service récupéré avec succès
     * 
     * @method handleServiceRecovered
     * @param {string} serviceId - Identifiant du service récupéré
     * @private
     */
    private handleServiceRecovered(serviceId: string): void {
        this.logger.info(`Service ${serviceId} recovered successfully`);

        // Publier l'événement de service récupéré
        this.publishEvent('service.recovered', {
            serviceId,
            timestamp: new Date()
        });
    }

    /**
     * Gère un service irrécupérable
     * 
     * @method handleServiceUnrecoverable
     * @param {string} serviceId - Identifiant du service irrécupérable
     * @private
     */
    private handleServiceUnrecoverable(serviceId: string): void {
        this.logger.error(`Service ${serviceId} is unrecoverable`);

        // Publier l'événement de service irrécupérable
        this.publishEvent('service.unrecoverable', {
            serviceId,
            timestamp: new Date()
        });

        // Désenregistrer le service
        this.unregisterService(serviceId);
    }

    /**
     * Démarre la surveillance de tous les services
     * 
     * @method startMonitoring
     * @public
     */
    public startMonitoring(): void {
        this.healthCheckManager.startMonitoring();
        this.logger.info('Service monitoring started');
    }

    /**
     * Arrête la surveillance de tous les services
     * 
     * @method stopMonitoring
     * @public
     */
    public stopMonitoring(): void {
        this.healthCheckManager.stopMonitoring();
        this.logger.info('Service monitoring stopped');
    }

    /**
     * Vérifie si les dépendances d'un service sont satisfaites
     * 
     * @method areDependenciesSatisfied
     * @param {string} serviceId - Identifiant du service à vérifier
     * @returns {boolean} Vrai si toutes les dépendances sont satisfaites
     * @public
     */
    public areDependenciesSatisfied(serviceId: string): boolean {
        return this.dependencyManager.areDependenciesSatisfied(serviceId, this.services);
    }

    /**
     * Recherche des services par type
     * 
     * @method findServicesByType
     * @param {string} type - Type de service à rechercher
     * @returns {ServiceDescription[]} Services correspondants au type
     * @public
     */
    public findServicesByType(type: string): ServiceDescription[] {
        return Array.from(this.services.values()).filter(service => service.type === type);
    }

    /**
     * Recherche des services par tags
     * 
     * @method findServicesByTags
     * @param {string[]} tags - Tags à rechercher
     * @param {boolean} [matchAll=false] - Vrai pour exiger tous les tags, faux pour au moins un
     * @returns {ServiceDescription[]} Services correspondants aux tags
     * @public
     */
    public findServicesByTags(tags: string[], matchAll = false): ServiceDescription[] {
        return Array.from(this.services.values()).filter(service => {
            if (!service.tags || service.tags.length === 0) {
                return false;
            }

            if (matchAll) {
                // Tous les tags doivent correspondre
                return tags.every(tag => service.tags!.includes(tag));
            } else {
                // Au moins un tag doit correspondre
                return tags.some(tag => service.tags!.includes(tag));
            }
        });
    }
}