//src/ai/api/core/middleware/middlewares/SecurityAuditMiddleware.ts
import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction } from '@api/core/middleware/middleware-interfaces';
import { Logger } from '@api/common/monitoring/LogService';
import { SecurityServiceProvider } from '@api/core/middleware/di/SecurityServiceProvider';
import { SecurityServiceKeys } from '@api/core/middleware/di/types';
import {
    ISecurityAuditor,
    SecurityAuditRequest,
    SecurityAuditResponse,
    SecurityAuditError,
    SecurityIncident,
    SecurityContext
} from '@api/core/middleware/types/middleware.types';

export interface AuditConfig {
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    includeSensitiveData: boolean;
    storageLocation: 'memory' | 'file' | 'database';
    retentionPeriod: number;
}

export class SecurityAuditMiddleware implements IMiddleware {
    public readonly name: string = 'SecurityAuditMiddleware';
    public readonly isEnabled: boolean;

    private readonly logger: Logger;
    private readonly config: AuditConfig;
    private readonly serviceProvider: SecurityServiceProvider;

    constructor(
        serviceProvider: SecurityServiceProvider,
        config: Partial<AuditConfig> = {}
    ) {
        this.logger = new Logger(this.name);
        this.serviceProvider = serviceProvider;
        this.isEnabled = true;

        // Default configuration
        this.config = {
            logLevel: 'info',
            includeSensitiveData: false,
            storageLocation: 'memory',
            retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
            ...config
        };
    }

    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        const startTime = Date.now();
        const requestCopy = this.cloneRequest(context);

        try {
            // Log the request
            await this.auditRequest(requestCopy);

            // Process the request
            await next();

            // Log the response
            const duration = Date.now() - startTime;
            await this.auditResponse(requestCopy, context.response, duration);
        } catch (err) {
            // Log the error
            const duration = Date.now() - startTime;
            // Convertir error en Error si ce n'est pas déjà le cas
            const error = err instanceof Error ? err : new Error(String(err));
            await this.auditError(requestCopy, error, duration);

            // Re-throw the error
            throw err;
        }
    }

    private cloneRequest(context: IAPIContext): SecurityAuditRequest {
        // Create a sanitized copy of the request for audit logging
        const requestCopy: SecurityAuditRequest = {
            method: context.request.method || 'UNKNOWN',
            path: context.request.path || '/',
            headers: { ...context.request.headers },
            ip: context.request.ip || '0.0.0.0', // Valeur par défaut quand ip est undefined
            timestamp: new Date().toISOString()
        };

        // Remove sensitive headers
        if (requestCopy.headers.authorization) {
            requestCopy.headers.authorization = this.config.includeSensitiveData
                ? requestCopy.headers.authorization
                : '[REDACTED]';
        }

        if (requestCopy.headers.cookie) {
            requestCopy.headers.cookie = this.config.includeSensitiveData
                ? requestCopy.headers.cookie
                : '[REDACTED]';
        }

        // Include query parameters
        if (context.request.query) {
            requestCopy.query = { ...context.request.query };
        }

        // Include request body if needed
        if (context.request.body && this.config.includeSensitiveData) {
            requestCopy.body = typeof context.request.body === 'object'
                ? { ...context.request.body }
                : context.request.body;
        }

        // Include user ID if available
        if (context.security) {
            // Utiliser une assertion de type sécurisée
            const securityContext = context.security as unknown as SecurityContext;
            if (securityContext.userId) {
                requestCopy.userId = securityContext.userId;
            }
        }

        return requestCopy;
    }

    private async auditRequest(requestData: SecurityAuditRequest): Promise<void> {
        try {
            const securityAuditor = await this.serviceProvider.get<ISecurityAuditor>(
                SecurityServiceKeys.SECURITY_AUDITOR
            );

            if (securityAuditor) {
                await securityAuditor.logRequest(requestData);
            } else {
                // Fallback to local logging
                this.logger.info('Request audit', requestData);
            }
        } catch (error) {
            this.logger.error('Error during request audit', error);
        }
    }

    private async auditResponse(
        requestData: SecurityAuditRequest,
        response: IAPIContext['response'],
        duration: number
    ): Promise<void> {
        try {
            const securityAuditor = await this.serviceProvider.get<ISecurityAuditor>(
                SecurityServiceKeys.SECURITY_AUDITOR
            );

            if (!securityAuditor) {
                // Fallback to local logging
                this.logger.info('Response audit', {
                    request: requestData,
                    status: response?.status || 200,
                    duration
                });
                return;
            }

            const responseData: SecurityAuditResponse = {
                request: requestData,
                status: typeof response?.status === 'number' ? response.status : 200, // Assurer un nombre
                duration,
                timestamp: new Date().toISOString()
            };

            // Include response body if needed
            if (response?.body && this.config.includeSensitiveData) {
                responseData.body = typeof response.body === 'object'
                    ? { ...response.body }
                    : response.body;
            }

            // Include response headers
            if (response?.headers) {
                responseData.headers = { ...response.headers };
            }

            await securityAuditor.logResponse(responseData);
        } catch (error) {
            this.logger.error('Error during response audit', error);
        }
    }

    private async auditError(
        requestData: SecurityAuditRequest,
        error: Error,
        duration: number
    ): Promise<void> {
        try {
            const securityAuditor = await this.serviceProvider.get<ISecurityAuditor>(
                SecurityServiceKeys.SECURITY_AUDITOR
            );

            // Définition explicite du type avec stack optionnel
            const errorObject: {
                message: string;
                name: string;
                stack?: string;
                [key: string]: unknown;
            } = {
                message: error.message,
                name: error.name
            };

            // Ajouter stack seulement si nécessaire
            if (this.config.includeSensitiveData && error.stack) {
                errorObject.stack = error.stack;
            }

            const errorData: SecurityAuditError = {
                request: requestData,
                error: errorObject,
                duration,
                timestamp: new Date().toISOString()
            };

            if (securityAuditor) {
                await securityAuditor.logError(errorData);

                // Log security incidents
                if (error.name === 'SecurityError' ||
                    error.name === 'AuthenticationError' ||
                    error.name === 'AuthorizationError') {

                    // Type assertion pour récupérer la sévérité (qui peut ne pas exister sur un Error standard)
                    const securityError = error as Error & { severity?: string };

                    const incident: SecurityIncident = {
                        type: error.name,
                        severity: securityError.severity || 'medium',
                        details: errorData
                    };

                    await securityAuditor.logSecurityIncident(incident);
                }
            } else {
                // Fallback to local logging
                this.logger.error('Error audit', errorData);
            }
        } catch (loggingError) {
            this.logger.error('Error during error audit', loggingError);
        }
    }
}