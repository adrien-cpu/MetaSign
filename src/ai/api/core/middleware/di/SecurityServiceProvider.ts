// src/ai/api/core/middleware/di/SecurityServiceProvider.ts

import { IServiceProvider, ServiceFactory } from './types';
import { Logger } from '@api/common/monitoring/LogService';

/**
 * Type pour les services enregistrés dans le fournisseur
 */
export type ServiceType = unknown;

/**
 * Fournisseur de services pour l'injection de dépendances
 */
export class SecurityServiceProvider implements IServiceProvider {
    private readonly factories: Map<string, ServiceFactory<ServiceType>> = new Map();
    private readonly instances: Map<string, ServiceType> = new Map();
    private readonly logger: Logger;
    private readonly isSingleton: Map<string, boolean> = new Map();

    /**
     * Crée un nouveau fournisseur de services
     */
    constructor() {
        this.logger = new Logger('SecurityServiceProvider');
    }

    /**
     * Enregistre un service
     * @param key Clé du service
     * @param factory Fabrique du service
     */
    public register<T>(key: string, factory: ServiceFactory<T>): void {
        this.factories.set(key, factory as ServiceFactory<ServiceType>);
        this.isSingleton.set(key, false);
        this.logger.debug(`Registered service: ${key}`);
    }

    /**
     * Enregistre un singleton
     * @param key Clé du service
     * @param factory Fabrique du service
     */
    public registerSingleton<T>(key: string, factory: ServiceFactory<T>): void {
        this.factories.set(key, factory as ServiceFactory<ServiceType>);
        this.isSingleton.set(key, true);
        this.logger.debug(`Registered singleton service: ${key}`);
    }

    /**
     * Récupère un service
     * @param key Clé du service
     * @returns Instance du service
     */
    public get<T>(key: string): T {
        if (!this.factories.has(key)) {
            this.logger.error(`Service not registered: ${key}`);
            throw new Error(`Service not registered: ${key}`);
        }

        const isSingleton = this.isSingleton.get(key) || false;

        if (isSingleton && this.instances.has(key)) {
            return this.instances.get(key) as T;
        }

        const factory = this.factories.get(key) as ServiceFactory<T>;
        const instance = factory();

        if (isSingleton) {
            this.instances.set(key, instance as ServiceType);
        }

        return instance;
    }

    /**
     * Vérifie si un service est enregistré
     * @param key Clé du service
     * @returns true si le service est enregistré
     */
    public has(key: string): boolean {
        return this.factories.has(key);
    }

    /**
     * Réinitialise toutes les instances singleton
     */
    public resetSingletons(): void {
        this.instances.clear();
        this.logger.debug('All singleton instances reset');
    }

    /**
     * Supprime un service
     * @param key Clé du service
     */
    public remove(key: string): void {
        this.factories.delete(key);
        this.instances.delete(key);
        this.isSingleton.delete(key);
        this.logger.debug(`Service removed: ${key}`);
    }
}