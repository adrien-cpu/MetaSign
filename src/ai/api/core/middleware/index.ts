/**
 * Module de middleware de sécurité
 */

// Exporter les types de base et interfaces de manière explicite
import * as MiddlewareTypes from './types/middleware.types';
import * as DiTypes from './di/types';
import * as Interfaces from './interfaces';
import * as MiddlewareInterfaces from './middleware-interfaces';

// Exporter tous les types et interfaces de manière explicite pour éviter l'ambiguïté
export {
    MiddlewareTypes,
    DiTypes,
    Interfaces,
    MiddlewareInterfaces
};

// Ré-exporter individuellement les types et interfaces principaux
export type {
    SecurityConfig,
    RateLimitConfig,
    AuthenticationConfig,
    SecurityHeadersConfig
} from './types/middleware.types';
export { SecurityErrorType, MiddlewareType } from './types/middleware.types';

// Exporter la configuration
export { getSecurityConfig, mergeSecurityConfig } from './config/SecurityConfig';

// Exporter la chaîne de middlewares
export { SecurityMiddlewareChain } from './SecurityMiddlewareChain';

// Exporter le fournisseur de services
export { SecurityServiceProvider } from './di/SecurityServiceProvider';

// Exporter les middlewares individuels
export { RequestIdMiddleware } from './middlewares/RequestIdMiddleware';
export { RateLimitingMiddleware } from './middlewares/RateLimitingMiddleware';
export { AuthenticationMiddleware } from './middlewares/AuthenticationMiddleware';
export { SecurityHeadersMiddleware } from './middlewares/SecurityHeadersMiddleware';
export { ErrorHandlerMiddleware } from './middlewares/ErrorHandlerMiddleware';
export { IntrusionDetectionMiddleware } from './middlewares/IntrusionDetectionMiddleware';
export { BehaviorAnalysisMiddleware } from './middlewares/BehaviorAnalysisMiddleware';
export { ComplianceValidationMiddleware } from './middlewares/ComplianceValidationMiddleware';
export { DataSanitizationMiddleware } from './middlewares/DataSanitizationMiddleware';
export { EncryptionMiddleware } from './middlewares/EncryptionMiddleware';
export { SecurityAuditMiddleware } from './middlewares/SecurityAuditMiddleware';

// Exporter la fabrique de middlewares et la fonction utilitaire
export {
    SecurityMiddlewareFactory,
    createSecurityMiddleware
} from './SecurityMiddlewareFactory';

// Définir les types personnalisés
import { SecurityServiceProvider } from './di/SecurityServiceProvider';
export interface SecurityMiddlewareFactoryOptions {
    serviceProvider?: SecurityServiceProvider;
    config?: Partial<MiddlewareTypes.SecurityConfig>;
    useMocks?: boolean;
}

export interface CustomChainOptions {
    chainName?: string;
    enableRequestId?: boolean;
    enableAuthentication?: boolean;
    enableRateLimiting?: boolean;
    enableSecurityHeaders?: boolean;
    enableErrorHandler?: boolean;
    enableIntrusionDetection?: boolean;
    enableBehaviorAnalysis?: boolean;
    enableCompliance?: boolean;
    enableDataSanitization?: boolean;
    enableEncryption?: boolean;
    enableAudit?: boolean;
}

// Exporter les mocks pour les tests
export * from './mocks';

// Modifions d'abord l'interface SecurityError pour être explicite sur le undefined
export interface SecurityError {
    code: string;
    message: string;
    type: MiddlewareTypes.SecurityErrorType;
    statusCode: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, unknown>;
    originalError: Error | undefined;
    toSafeMessage(): string;
}

/**
 * Classe d'erreur de sécurité spécialisée avec informations contextuelles
 */
export class SecurityErrorImpl implements SecurityError {
    /**
     * Code d'erreur unique
     */
    public readonly code: string;

    /**
     * Message d'erreur
     */
    public readonly message: string;

    /**
     * Type d'erreur de sécurité
     */
    public readonly type: MiddlewareTypes.SecurityErrorType;

    /**
     * Statut HTTP correspondant
     */
    public readonly statusCode: number;

    /**
     * Niveau de gravité
     */
    public readonly severity: 'low' | 'medium' | 'high' | 'critical';

    /**
     * Détails supplémentaires
     */
    public readonly details: Record<string, unknown>;

    /**
     * Erreur d'origine
     */
    public readonly originalError: Error | undefined;

    /**
     * Crée une nouvelle instance d'erreur de sécurité
     * @param message Message d'erreur
     * @param code Code d'erreur unique
     * @param type Type d'erreur de sécurité
     * @param statusCode Code HTTP associé
     * @param severity Niveau de gravité
     * @param details Détails supplémentaires
     * @param originalError Erreur d'origine
     */
    constructor(
        message: string,
        code: string = 'SECURITY_ERROR',
        type: MiddlewareTypes.SecurityErrorType = MiddlewareTypes.SecurityErrorType.GENERAL,
        statusCode = 403,
        severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
        details: Record<string, unknown> = {},
        originalError?: Error
    ) {
        this.message = message;
        this.code = code;
        this.type = type;
        this.statusCode = statusCode;
        this.severity = severity;
        this.details = details;
        this.originalError = originalError;
    }

    /**
     * Convertit l'erreur en message d'erreur sécurisé pour l'utilisateur final
     * (sans divulguer d'informations sensibles)
     */
    public toSafeMessage(): string {
        const safeMessages: Record<MiddlewareTypes.SecurityErrorType, string> = {
            [MiddlewareTypes.SecurityErrorType.AUTHENTICATION]: 'Authentication required',
            [MiddlewareTypes.SecurityErrorType.AUTHORIZATION]: 'You do not have permission to access this resource',
            [MiddlewareTypes.SecurityErrorType.RATE_LIMIT]: 'Too many requests, please try again later',
            [MiddlewareTypes.SecurityErrorType.INTRUSION]: 'Request blocked for security reasons',
            [MiddlewareTypes.SecurityErrorType.BEHAVIOR]: 'Request blocked due to suspicious activity',
            [MiddlewareTypes.SecurityErrorType.COMPLIANCE]: 'Request cannot be processed due to compliance issues',
            [MiddlewareTypes.SecurityErrorType.DATA_VALIDATION]: 'Invalid request format',
            [MiddlewareTypes.SecurityErrorType.ENCRYPTION]: 'Encryption error',
            [MiddlewareTypes.SecurityErrorType.GENERAL]: 'A security error has occurred'
        };

        return safeMessages[this.type];
    }
}