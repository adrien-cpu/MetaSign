//src/ai/api/core/middleware/middlewares/ErrorHandlerMiddleware.ts
import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction, SecurityError } from '../types/middleware.types';
import { Logger } from '@api/common/monitoring/LogService';
import { IServiceProvider } from '../di/types';
import { SecurityServiceKeys } from '../di/types';
import { ISecurityAuditor } from '../interfaces';

/**
 * Extension de SecurityError pour inclure l'errorId
 */
export interface EnhancedSecurityError extends SecurityError {
    errorId?: string;
}

/**
 * Types des messages d'erreur sécurisés
 */
export type SafeErrorMessageKey =
    | 'MISSING_TOKEN'
    | 'INVALID_TOKEN_FORMAT'
    | 'INVALID_TOKEN'
    | 'TOKEN_VALIDATION_FAILED'
    | 'RATE_LIMIT_EXCEEDED'
    | 'SECURITY_THREAT_DETECTED'
    | 'SUSPICIOUS_BEHAVIOR_DETECTED'
    | 'COMPLIANCE_VIOLATION'
    | 'MISSING_ENCRYPTED_DATA'
    | 'DECRYPTION_FAILED'
    | 'SENSITIVE_DATA_EXPOSURE'
    | 'ENCRYPTION_FAILED'
    | 'DATA_VALIDATION_FAILED'
    | 'AUTHORIZATION_FAILED'
    | 'RESOURCE_NOT_FOUND'
    | 'INVALID_REQUEST'
    | 'INTERNAL_ERROR';

/**
 * Interface pour les métriques
 */
export interface IMetricsCollector {
    increment(name: string, value?: number): void;
    gauge(name: string, value: number): void;
    timing(name: string, value: number): void;
}

/**
 * Définit les informations sérialisables d'une erreur
 */
export interface SerializableError {
    name: string;
    message: string;
    stack?: string;
    [key: string]: unknown;
}

/**
 * Options pour le middleware de gestion des erreurs
 */
export interface ErrorHandlerOptions {
    /**
     * Niveau de détail pour les erreurs dans la réponse
     * - none: aucun détail
     * - basic: erreur de base
     * - detailed: détails complets (ne pas utiliser en production)
     */
    errorDetailLevel: 'none' | 'basic' | 'detailed';

    /**
     * Inclure la pile d'appels dans la réponse
     */
    includeStackTrace: boolean;

    /**
     * Code HTTP par défaut pour les erreurs inconnues
     */
    defaultStatusCode: number;

    /**
     * Message par défaut pour les erreurs inconnues
     */
    defaultErrorMessage: string;

    /**
     * Environnement d'exécution (influencera le comportement)
     */
    environment?: 'development' | 'test' | 'production';

    /**
     * Nombre maximum de tentatives pour les appels d'audit
     */
    maxAuditRetries?: number;
}

/**
 * Middleware de gestion des erreurs de sécurité
 */
export class ErrorHandlerMiddleware implements IMiddleware {
    private readonly logger: Logger;
    private readonly options: ErrorHandlerOptions;
    private readonly securityAuditor: ISecurityAuditor;

    /**
     * Crée un nouveau middleware de gestion des erreurs
     * @param serviceProvider Fournisseur de services pour l'injection de dépendances
     * @param options Options de configuration
     */
    constructor(
        serviceProvider: IServiceProvider,
        options: Partial<ErrorHandlerOptions> = {}
    ) {
        this.logger = new Logger('ErrorHandlerMiddleware');
        this.securityAuditor = serviceProvider.get<ISecurityAuditor>(SecurityServiceKeys.SECURITY_AUDITOR);

        // Déterminer l'environnement par défaut
        const defaultEnvironment = process.env.NODE_ENV === 'production'
            ? 'production'
            : (process.env.NODE_ENV === 'test' ? 'test' : 'development');

        // Options par défaut
        this.options = {
            errorDetailLevel: defaultEnvironment === 'production' ? 'none' : 'basic',
            includeStackTrace: defaultEnvironment !== 'production',
            defaultStatusCode: 500,
            defaultErrorMessage: 'An unexpected error occurred',
            environment: defaultEnvironment,
            maxAuditRetries: 3,
            ...options
        };
    }

    /**
     * Traite les erreurs de sécurité
     * @param context Contexte de la requête API
     * @param next Fonction middleware suivante
     */
    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // Exécuter le reste de la chaîne de middleware
            await next();
        } catch (error) {
            // Convertir l'erreur en erreur de sécurité
            const securityError = this.mapToSecurityError(error) as EnhancedSecurityError;

            // Générer un ID d'erreur unique pour la traçabilité
            const errorId = this.generateErrorId();
            securityError.errorId = errorId;

            // Journaliser l'erreur
            this.logError(context, securityError);

            // Enregistrer l'incident
            await this.reportSecurityIncident(context, securityError);

            // Préparer la réponse d'erreur
            this.setErrorResponse(context, securityError, errorId);
        }
    }

    /**
     * Convertit une erreur en erreur de sécurité
     * @param error Erreur à convertir
     * @returns Erreur de sécurité
     */
    private mapToSecurityError(error: unknown): SecurityError {
        // Si l'erreur est déjà une erreur de sécurité, la retourner
        if (this.isSecurityError(error)) {
            return error;
        }

        // Convertir l'erreur en objet Error
        const errorObject = error instanceof Error ? error : new Error(String(error));

        // Créer une erreur de sécurité générique
        return {
            code: 'INTERNAL_ERROR',
            message: errorObject.message || this.options.defaultErrorMessage,
            statusCode: this.options.defaultStatusCode,
            severity: 'medium',
            details: {},
            originalError: errorObject,
            // Ajout de la méthode manquante
            toSafeMessage: function () {
                return this.message || 'An unexpected error occurred';
            }
        };
    }

    /**
     * Vérifie si une erreur est une erreur de sécurité
     * @param error Erreur à vérifier
     * @returns true si l'erreur est une erreur de sécurité
     */
    private isSecurityError(error: unknown): error is SecurityError {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            'message' in error &&
            'statusCode' in error &&
            'severity' in error
        );
    }

    /**
     * Convertit une erreur en objet sérialisable
     */
    private errorToSerializable(error: Error | undefined): SerializableError | Record<string, never> {
        if (!error) {
            return {};
        }

        const result: SerializableError = {
            name: error.name,
            message: error.message
        };

        // Ajouter la stack trace si disponible
        if (error.stack) {
            result.stack = error.stack;
        }

        // Ajouter toutes les autres propriétés non-fonction de manière sécurisée
        for (const prop of Object.getOwnPropertyNames(error)) {
            if (prop !== 'name' && prop !== 'message' && prop !== 'stack') {
                const value = (error as unknown as Record<string, unknown>)[prop];
                if (typeof value !== 'function') {
                    result[prop] = value;
                }
            }
        }

        return result;
    }

    /**
     * Journalise une erreur de sécurité
     * @param context Contexte de la requête API
     * @param error Erreur de sécurité
     */
    private logError(context: IAPIContext, error: EnhancedSecurityError): void {
        const logData = {
            requestId: context.requestId,
            errorId: error.errorId,
            path: context.request.path,
            method: context.request.method,
            userId: context.request.userId,
            ip: context.request.ip,
            code: error.code,
            statusCode: error.statusCode,
            severity: error.severity,
            message: error.message,
            // Convertir l'erreur originale en objet sérialisable
            originalError: this.errorToSerializable(error.originalError)
        };

        if (error.severity === 'critical') {
            this.logger.critical('Critical security error', logData);
        } else if (error.severity === 'high') {
            this.logger.error('High severity security error', logData);
        } else if (error.severity === 'medium') {
            this.logger.warn('Medium severity security error', logData);
        } else {
            this.logger.info('Low severity security error', logData);
        }
    }

    /**
     * Génère un ID d'erreur unique pour la traçabilité
     */
    private generateErrorId(): string {
        return `err_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Enregistre un incident de sécurité
     * @param context Contexte de la requête API
     * @param error Erreur de sécurité
     */
    private async reportSecurityIncident(context: IAPIContext, error: EnhancedSecurityError): Promise<void> {
        const maxRetries = this.options.maxAuditRetries || 3;
        let attemptCount = 0;

        const performAudit = async (): Promise<void> => {
            try {
                attemptCount++;
                await this.securityAuditor.logSecurityIncident({
                    requestId: context.requestId,
                    errorType: error.code,
                    errorMessage: error.message,
                    timestamp: new Date(),
                    endpoint: `${context.request.method} ${context.request.path}`,
                    userId: context.request.userId || 'anonymous',
                    ip: context.request.ip,
                    details: {
                        ...error.details,
                        errorId: error.errorId,
                        severity: error.severity
                    }
                });
            } catch (auditError) {
                const errorDetails = this.errorToSerializable(
                    auditError instanceof Error ? auditError : new Error(String(auditError))
                );

                this.logger.error(`Failed to report security incident (attempt ${attemptCount}/${maxRetries})`, {
                    originalError: errorDetails,
                    securityError: error.code,
                    requestId: context.requestId,
                    errorId: error.errorId
                });

                // Si nous n'avons pas atteint le nombre maximal de tentatives, réessayer
                if (attemptCount < maxRetries) {
                    // Attente exponentielle (backoff)
                    const delayMs = 100 * Math.pow(2, attemptCount - 1);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    return performAudit();
                }

                // Sinon, enregistrer l'erreur dans les métriques si disponibles
                this.incrementMetric(context, 'security.audit.failure');
            }
        };

        await performAudit();
    }

    /**
     * Tente d'incrémenter une métrique de manière sécurisée
     * @param context Contexte API
     * @param name Nom de la métrique
     * @param value Valeur de l'incrément (défaut: 1)
     */
    private incrementMetric(context: IAPIContext, name: string, value: number = 1): void {
        // Vérifier si 'metrics' existe et contient une méthode 'increment'
        const metrics = (context as unknown as { metrics?: IMetricsCollector }).metrics;
        if (metrics && typeof metrics.increment === 'function') {
            metrics.increment(name, value);
        }
    }

    /**
     * Prépare la réponse d'erreur
     * @param context Contexte de la requête API
     * @param error Erreur de sécurité
     * @param errorId ID unique de l'erreur
     */
    private setErrorResponse(context: IAPIContext, error: EnhancedSecurityError, errorId: string): void {
        // Enregistrer la métrique pour le monitoring
        this.incrementMetric(context, `security.error.${error.code.toLowerCase()}`);
        this.incrementMetric(context, `security.error.severity.${error.severity}`);

        // Créer l'objet de réponse d'erreur
        const errorResponse: Record<string, unknown> = {
            error: this.getSafeErrorMessage(error),
            code: error.code,
            requestId: context.requestId,
            errorId: errorId
        };

        // Ajouter les détails d'erreur selon le niveau de détail configuré
        if (this.shouldIncludeErrorDetails(error)) {
            errorResponse.details = error.details;
        }

        // Ajouter la pile d'appels si configuré
        if (this.options.includeStackTrace && error.originalError && error.originalError.stack) {
            errorResponse.stack = error.originalError.stack;
        }

        // Définir la réponse
        context.response = {
            status: error.statusCode,
            statusCode: error.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': context.requestId,
                'X-Error-ID': errorId
            },
            body: errorResponse,
            timestamp: Date.now(),
            duration: context.duration
        };
    }

    /**
     * Détermine si les détails d'erreur doivent être inclus
     */
    private shouldIncludeErrorDetails(error: SecurityError): boolean {
        // Aucun détail en production pour les erreurs critiques ou hautes
        if (this.options.environment === 'production' && (error.severity === 'critical' || error.severity === 'high')) {
            return false;
        }

        // Selon le niveau de détail configuré
        switch (this.options.errorDetailLevel) {
            case 'detailed':
                return true;
            case 'basic':
                return error.severity !== 'critical' && error.severity !== 'high';
            case 'none':
            default:
                return false;
        }
    }

    /**
     * Récupère un message d'erreur sécurisé
     * @param error Erreur de sécurité
     * @returns Message d'erreur sécurisé
     */
    private getSafeErrorMessage(error: SecurityError): string {
        // Si nous devons inclure les détails d'erreur, retourner le message d'origine
        if (this.shouldIncludeErrorDetails(error)) {
            return error.message;
        }

        // Sinon, utiliser des messages génériques pour masquer les détails sensibles
        const safeMessages = this.getSafeMessagesMap();

        // Retourner le message sécurisé ou le message par défaut
        return safeMessages[error.code as SafeErrorMessageKey] || this.options.defaultErrorMessage;
    }

    /**
     * Obtient la carte des messages d'erreur sécurisés
     * Peut être étendu par héritage
     */
    protected getSafeMessagesMap(): Record<string, string> {
        return {
            'MISSING_TOKEN': 'Authentication required',
            'INVALID_TOKEN_FORMAT': 'Invalid authentication credentials',
            'INVALID_TOKEN': 'Invalid authentication credentials',
            'TOKEN_VALIDATION_FAILED': 'Authentication failed',
            'RATE_LIMIT_EXCEEDED': 'Too many requests, please try again later',
            'SECURITY_THREAT_DETECTED': 'Request blocked for security reasons',
            'SUSPICIOUS_BEHAVIOR_DETECTED': 'Request blocked due to suspicious activity',
            'COMPLIANCE_VIOLATION': 'Request cannot be processed due to compliance issues',
            'MISSING_ENCRYPTED_DATA': 'Invalid request format',
            'DECRYPTION_FAILED': 'Unable to process encrypted data',
            'SENSITIVE_DATA_EXPOSURE': 'Server error processing your request',
            'ENCRYPTION_FAILED': 'Server error preparing response',
            'DATA_VALIDATION_FAILED': 'Invalid input data',
            'AUTHORIZATION_FAILED': 'Insufficient permissions',
            'RESOURCE_NOT_FOUND': 'The requested resource was not found',
            'INVALID_REQUEST': 'Invalid request',
            'INTERNAL_ERROR': 'An unexpected error occurred'
        };
    }
}