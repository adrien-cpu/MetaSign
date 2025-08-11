/**
 * @file src/ai/services/learning/registry/interfaces/ServiceRegistryConfig.ts
 * @description Interface pour la configuration du registre de services
 */

/**
 * @interface ServiceRegistryConfig
 * @description Configuration du registre de services
 */
export interface ServiceRegistryConfig {
    /** Vérification des dépendances activée */
    checkDependencies: boolean;
    /** Expiration de l'enregistrement (en secondes) */
    registrationTTL?: number;
    /** Intervalle de vérification de santé (en secondes) */
    healthCheckInterval?: number;
    /** Circuit breaker activé */
    circuitBreakerEnabled?: boolean;
    /** Mode découverte automatique activé */
    autoDiscoveryEnabled?: boolean;
    /** Nombre maximal de tentatives de reconnexion pour un service */
    maxReconnectAttempts?: number;
    /** Délai entre les tentatives de reconnexion (en secondes) */
    reconnectDelaySeconds?: number;
    /** Activation du mode haute disponibilité */
    highAvailabilityMode?: boolean;
}

/**
 * Configuration par défaut du registre
 */
export const DEFAULT_REGISTRY_CONFIG: ServiceRegistryConfig = {
    checkDependencies: true,
    registrationTTL: 3600, // 1 heure
    healthCheckInterval: 60, // 1 minute
    circuitBreakerEnabled: true,
    autoDiscoveryEnabled: false,
    maxReconnectAttempts: 5,
    reconnectDelaySeconds: 30,
    highAvailabilityMode: false
};