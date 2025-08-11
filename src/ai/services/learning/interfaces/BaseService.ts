/**
 * @file src/ai/services/learning/interfaces/BaseService.ts
 * @description Interfaces de base pour les services du système d'apprentissage
 * Définit les contrats que doivent respecter tous les services MetaSign
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// ================================
// INTERFACES DE SERVICE DE BASE
// ================================

/**
 * État de santé d'un service
 */
export type ServiceHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Informations sur la santé d'un service
 */
export interface ServiceHealth {
    readonly status: ServiceHealthStatus;
    readonly timestamp: Date;
    readonly uptime?: number;
    readonly lastError?: string;
    readonly metrics?: Readonly<Record<string, unknown>>;
}

/**
 * Configuration de base pour un service
 */
export interface BaseServiceConfig {
    readonly enableHealthChecks?: boolean;
    readonly healthCheckInterval?: number;
    readonly enableMetrics?: boolean;
    readonly logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Interface de base que doivent implémenter tous les services
 * Compatible avec exactOptionalPropertyTypes: true
 */
export interface BaseService {
    /**
     * Initialise le service
     * @returns Promise qui se résout quand l'initialisation est terminée
     */
    initialize(): Promise<void>;

    /**
     * Arrête proprement le service
     * @returns Promise qui se résout quand l'arrêt est terminé
     */
    destroy(): Promise<void>;

    /**
     * Vérifie l'état de santé du service
     * @returns État de santé actuel
     */
    getHealth(): ServiceHealth;

    /**
     * Nom unique du service
     */
    readonly serviceName: string;

    /**
     * Version du service
     */
    readonly version: string;

    /**
     * Indique si le service est initialisé
     */
    readonly isInitialized: boolean;
}

/**
 * Configuration de service LSF
 */
export interface LSFServiceConfig extends BaseServiceConfig {
    readonly lsfSpecific: {
        readonly dialectSupport: readonly string[];
        readonly culturalContext: boolean;
        readonly signRecognition: boolean;
        readonly realTimeVideo: boolean;
    };
}

// ================================
// ADAPTATEUR DE SERVICE
// ================================

/**
 * Adaptateur pour les services existants qui n'implémentent pas BaseService
 */
export class ServiceAdapter<T = unknown> implements BaseService {
    private readonly wrappedService: T;
    private readonly _serviceName: string;
    private readonly _version: string;
    private _isInitialized = false;
    private _health: ServiceHealth;

    /**
     * Crée un adaptateur pour un service existant
     * @param service Service à adapter
     * @param serviceName Nom du service
     * @param version Version du service
     */
    constructor(service: T, serviceName: string, version = '1.0.0') {
        this.wrappedService = service;
        this._serviceName = serviceName;
        this._version = version;
        this._health = {
            status: 'unknown',
            timestamp: new Date()
        };
    }

    public get serviceName(): string {
        return this._serviceName;
    }

    public get version(): string {
        return this._version;
    }

    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    /**
     * Initialise le service adapté
     */
    public async initialize(): Promise<void> {
        try {
            // Essayer d'appeler initialize si elle existe
            if (this.hasMethod('initialize')) {
                await this.callServiceMethod('initialize');
            }

            this._isInitialized = true;
            this._health = {
                status: 'healthy',
                timestamp: new Date()
            };
        } catch (error) {
            this._health = {
                status: 'unhealthy',
                timestamp: new Date(),
                lastError: error instanceof Error ? error.message : 'Unknown error'
            };
            throw error;
        }
    }

    /**
     * Détruit le service adapté
     */
    public async destroy(): Promise<void> {
        try {
            // Essayer d'appeler destroy si elle existe
            if (this.hasMethod('destroy')) {
                await this.callServiceMethod('destroy');
            }

            this._isInitialized = false;
            this._health = {
                status: 'unhealthy',
                timestamp: new Date()
            };
        } catch (error) {
            this._health = {
                status: 'unhealthy',
                timestamp: new Date(),
                lastError: error instanceof Error ? error.message : 'Unknown error'
            };
            throw error;
        }
    }

    /**
     * Récupère l'état de santé
     */
    public getHealth(): ServiceHealth {
        return { ...this._health };
    }

    /**
     * Récupère le service adapté
     */
    public getWrappedService(): T {
        return this.wrappedService;
    }

    /**
     * Vérifie si le service a une méthode donnée
     * @param methodName Nom de la méthode
     * @private
     */
    private hasMethod(methodName: string): boolean {
        return this.wrappedService !== null &&
            typeof this.wrappedService === 'object' &&
            typeof (this.wrappedService as Record<string, unknown>)[methodName] === 'function';
    }

    /**
     * Appelle une méthode du service de manière sécurisée
     * @param methodName Nom de la méthode
     * @private
     */
    private async callServiceMethod(methodName: string): Promise<unknown> {
        if (!this.wrappedService || typeof this.wrappedService !== 'object') {
            return;
        }

        const method = (this.wrappedService as Record<string, unknown>)[methodName];
        if (typeof method === 'function') {
            return await (method as () => Promise<unknown>).call(this.wrappedService);
        }
    }
}

// ================================
// FACTORY DE SERVICES
// ================================

/**
 * Factory pour créer des adaptateurs de service
 */
export class ServiceAdapterFactory {
    /**
     * Crée un adaptateur pour un service existant
     * @param service Service à adapter
     * @param serviceName Nom du service
     * @param version Version du service
     * @returns Service adapté compatible avec BaseService
     */
    static createAdapter<T>(
        service: T,
        serviceName: string,
        version?: string
    ): ServiceAdapter<T> {
        return new ServiceAdapter(service, serviceName, version);
    }

    /**
     * Vérifie si un objet implémente BaseService
     * @param obj Objet à vérifier
     * @returns True si l'objet implémente BaseService
     */
    static implementsBaseService(obj: unknown): obj is BaseService {
        return obj !== null &&
            typeof obj === 'object' &&
            typeof (obj as Record<string, unknown>).initialize === 'function' &&
            typeof (obj as Record<string, unknown>).destroy === 'function' &&
            typeof (obj as Record<string, unknown>).getHealth === 'function' &&
            typeof (obj as Record<string, unknown>).serviceName === 'string' &&
            typeof (obj as Record<string, unknown>).version === 'string' &&
            typeof (obj as Record<string, unknown>).isInitialized === 'boolean';
    }
}

// ================================
// CONSTANTES DE SERVICE
// ================================

/**
 * Méthodes requises pour BaseService
 */
export const BASE_SERVICE_METHODS = [
    'initialize',
    'destroy',
    'getHealth'
] as const;

/**
 * Propriétés requises pour BaseService
 */
export const BASE_SERVICE_PROPERTIES = [
    'serviceName',
    'version',
    'isInitialized'
] as const;