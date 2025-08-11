/**
 * @file src/ai/services/learning/registry/ServiceAdapter.ts
 * @description Adaptateur pour les services d'apprentissage permettant de standardiser
 * l'interaction avec différents services du module d'apprentissage
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { ServiceHealth, ServiceDescription } from '../interfaces';
import { ServiceStatus } from '../interfaces/types';

/**
 * Interface définissant la configuration de l'adaptateur de service
 */
interface ServiceAdapterConfig<T> {
    /**
     * Nom du service
     */
    name: string;

    /**
     * Description du service
     */
    description: string;

    /**
     * Version du service
     */
    version: string;

    /**
     * Type de service
     */
    type: string;

    /**
     * Dépendances du service
     */
    dependencies: string[];

    /**
     * Instance du service
     */
    instance: T;

    /**
     * Fonction de vérification de santé
     */
    healthCheck: () => Promise<{ status: string; details?: string }>;

    /**
     * Description des méthodes exposées
     */
    methods: Record<string, { description: string; parameters: string[] }>;
}

/**
 * @interface ServiceSummary
 * @description Interface interne pour les informations détaillées d'un service
 */
interface ServiceSummary {
    /** Nom du service */
    name: string;
    /** Description textuelle du service */
    description: string;
    /** Version du service */
    version: string;
    /** Type du service */
    type: string;
    /** Dépendances du service */
    dependencies: string[];
    /** Informations sur les méthodes du service */
    methods: Record<string, { description: string; parameters: string[] }>;
    /** Nom de la classe d'implémentation */
    className: string;
}

/**
 * @class ServiceAdapter
 * @description Adaptateur générique pour les services d'apprentissage, permettant
 * d'uniformiser l'accès aux services et leur surveillance
 * @template T - Type de service adapté
 */
export class ServiceAdapter<T extends object> {
    private readonly logger = LoggerFactory.getLogger('ServiceAdapter');
    private readonly config: ServiceAdapterConfig<T>;
    private readonly instance: T;

    /**
     * @constructor
     * @param {ServiceAdapterConfig<T>} config - Configuration de l'adaptateur
     */
    constructor(config: ServiceAdapterConfig<T>) {
        this.config = config;
        this.instance = config.instance;
        this.logger.info(`ServiceAdapter created for ${config.name} v${config.version}`);
    }

    /**
     * @method getServiceName
     * @returns {string} - Nom du service
     * @description Récupère le nom du service adapté
     */
    public getServiceName(): string {
        return this.config.name;
    }

    /**
     * @method getServiceType
     * @returns {string} - Type du service
     * @description Récupère le type du service adapté
     */
    public getServiceType(): string {
        return this.config.type;
    }

    /**
     * @method getInstanceName
     * @private
     * @returns {string} - Nom de la classe de l'instance
     * @description Récupère le nom de la classe de l'instance de manière sécurisée
     */
    private getInstanceName(): string {
        // Vérifier si instance existe et a un constructeur
        if (this.instance && typeof this.instance === 'object') {
            const proto = Object.getPrototypeOf(this.instance);
            if (proto && proto.constructor && proto.constructor.name) {
                return proto.constructor.name;
            }
        }
        return this.config.name; // Retourner un nom par défaut
    }

    /**
     * @method getServiceSummary
     * @returns {ServiceSummary} - Description détaillée du service
     * @description Récupère un résumé complet des informations du service, 
     * incluant description, méthodes et nom de classe
     */
    public getServiceSummary(): ServiceSummary {
        return {
            name: this.config.name,
            description: this.config.description,
            version: this.config.version,
            type: this.config.type,
            dependencies: this.config.dependencies,
            methods: this.config.methods,
            className: this.getInstanceName()
        };
    }

    /**
     * @method getDescription
     * @param {string} serviceId - Identifiant unique du service
     * @returns {ServiceDescription} - Description du service conforme à l'interface
     * @description Récupère la description formelle du service conformément à l'interface ServiceDescription
     */
    public getDescription(serviceId: string): ServiceDescription {
        return {
            id: serviceId,
            name: this.config.name,
            version: this.config.version,
            type: this.config.type,
            dependencies: this.config.dependencies,
            instance: this.instance,
            registeredAt: new Date(),
            status: 'active' as ServiceStatus // Valeur par défaut
        };
    }

    /**
     * @method getServiceInstance
     * @returns {T} - Instance du service
     * @description Récupère l'instance du service
     */
    public getServiceInstance(): T {
        return this.instance;
    }

    /**
     * @method invoke
     * @async
     * @param {string} methodName - Nom de la méthode à invoquer
     * @param {...unknown[]} args - Arguments de la méthode
     * @returns {Promise<unknown>} - Résultat de l'invocation
     * @description Invoque une méthode sur l'instance du service
     */
    public async invoke(methodName: string, ...args: unknown[]): Promise<unknown> {
        try {
            if (!(methodName in this.instance)) {
                throw new Error(`Method ${methodName} not found in service ${this.config.name}`);
            }

            this.logger.debug(`Invoking ${methodName} on ${this.config.name}`);
            // Utilisation de Record<string, unknown> au lieu de Record<string, any>
            const method = (this.instance as Record<string, unknown>)[methodName];
            if (typeof method !== 'function') {
                throw new Error(`${methodName} is not a function in service ${this.config.name}`);
            }

            const result = await method.apply(this.instance, args);
            return result;
        } catch (error) {
            this.logger.error(`Error invoking ${methodName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * @method checkHealth
     * @async
     * @returns {Promise<ServiceHealth>} - État de santé du service
     * @description Vérifie l'état de santé du service
     */
    public async checkHealth(): Promise<ServiceHealth> {
        try {
            const result = await this.config.healthCheck();
            return {
                healthy: result.status === 'healthy',
                message: result.details || 'Service is operational',
                timestamp: new Date() // Ajout de l'horodatage requis
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during health check';
            this.logger.error(`Health check failed: ${errorMessage}`);
            return {
                healthy: false,
                message: `Health check failed: ${errorMessage}`,
                timestamp: new Date() // Ajout de l'horodatage requis
            };
        }
    }
}