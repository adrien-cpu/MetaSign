// src/ai/api/core/middleware/di/types.ts

/**
 * Type pour les fonctions de fabrique
 */
export type ServiceFactory<T> = () => T;

/**
 * Interface pour les fournisseurs de services
 */
export interface IServiceProvider {
    /**
     * Enregistre un service
     * @param key Clé du service
     * @param factory Fabrique du service
     */
    register<T>(key: string, factory: ServiceFactory<T>): void;

    /**
     * Enregistre un singleton
     * @param key Clé du service
     * @param factory Fabrique du service
     */
    registerSingleton<T>(key: string, factory: ServiceFactory<T>): void;

    /**
     * Récupère un service
     * @param key Clé du service
     * @returns Instance du service
     */
    get<T>(key: string): T;

    /**
     * Vérifie si un service est enregistré
     * @param key Clé du service
     * @returns true si le service est enregistré
     */
    has(key: string): boolean;
}

/**
 * Clés pour les services de sécurité standard
 */
export enum SecurityServiceKeys {
    JWT_SERVICE = 'jwtService',
    TOKEN_VALIDATOR = 'tokenValidator',
    ENCRYPTION_SERVICE = 'encryptionService',
    DATA_SANITIZER = 'dataSanitizer',
    BEHAVIOR_ANALYZER = 'behaviorAnalyzer',
    INTRUSION_DETECTION = 'intrusionDetection',
    RATE_LIMITER = 'rateLimiter',
    SECURITY_AUDITOR = 'securityAuditor',
    FRAUD_DETECTION = 'fraudDetection',
    COMPLIANCE_VALIDATOR = 'complianceValidator',
    SECURITY_EVENT_MONITOR = 'securityEventMonitor',
    METRICS_COLLECTOR = 'metricsCollector',
    LOGGER = 'logger'
}