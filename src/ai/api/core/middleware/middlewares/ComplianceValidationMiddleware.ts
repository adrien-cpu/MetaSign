//src/ai/api/core/middleware/middlewares/ComplianceValidationMiddleware.ts
import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction } from '@api/core/middleware/middleware-interfaces';
import { ComplianceConfig } from '@api/core/middleware/types/middleware.types';
import { SecurityServiceProvider } from '@api/core/middleware/di/SecurityServiceProvider';
import { SecurityServiceKeys } from '@api/core/middleware/di/types';
import { Logger } from '@api/common/monitoring/LogService';
import { IComplianceValidator } from '@api/core/middleware/interfaces';

export class ComplianceValidationMiddleware implements IMiddleware {
    public readonly name: string = 'ComplianceValidationMiddleware';
    public readonly isEnabled: boolean;

    private readonly serviceProvider: SecurityServiceProvider;
    private readonly config: ComplianceConfig;
    private readonly logger: Logger;

    constructor(
        serviceProvider: SecurityServiceProvider,
        config: Partial<ComplianceConfig> = {}
    ) {
        this.serviceProvider = serviceProvider;
        this.logger = new Logger(this.name);

        // Default configuration
        this.config = {
            regulations: ['GDPR'],
            strictMode: false,
            auditingEnabled: true,
            ...config
        };

        this.isEnabled = true;
    }

    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // Skip compliance validation for exempt paths
            if (this.isExemptPath(context)) {
                await next();
                return;
            }

            // Get user ID for compliance checks
            const userId = this.extractUserId(context);

            // Validate compliance
            const validationResult = await this.validateCompliance(context, userId);

            // Store validation result in context for other middlewares
            if (!context.security) {
                context.security = {};
            }
            (context.security as Record<string, unknown>)['complianceValidation'] = validationResult;

            // Handle compliance issues
            if (!validationResult.compliant) {
                // Log compliance issues
                this.logger.warn('Compliance issues detected', {
                    userId,
                    endpoint: context.request.path,
                    issues: validationResult.issues
                });

                // Report compliance issues for auditing
                await this.reportComplianceIssues(userId, context, validationResult);

                // In strict mode, block non-compliant requests
                if (this.config.strictMode) {
                    if (!context.response) {
                        context.response = {
                            status: 451,
                            body: {
                                error: 'Request cannot be processed due to legal restrictions',
                                details: validationResult.issues.map(issue => issue.message)
                            },
                            headers: {} // Ajouter les headers manquants
                        };
                    } else {
                        context.response.status = 451;
                        context.response.body = {
                            error: 'Request cannot be processed due to legal restrictions',
                            details: validationResult.issues.map(issue => issue.message)
                        };
                    }
                    return;
                }
            }

            // Continue to next middleware
            await next();

        } catch (error) {
            this.logger.error('Error in compliance validation middleware', error);
            // Continue to next middleware even if validation fails
            await next();
        }
    }

    private isExemptPath(context: IAPIContext): boolean {
        // Skip validation for certain paths (e.g., health checks, public assets)
        const path = context.request.path || '';
        return path.startsWith('/health') ||
            path.startsWith('/public/') ||
            path.startsWith('/static/');
    }

    private extractUserId(context: IAPIContext): string {
        // Extract user ID from the security context or cookies
        const headers = context.request.headers || {};
        return (context.security as Record<string, unknown>)?.['userId'] as string ||
            headers['x-user-id'] as string ||
            'anonymous';
    }

    private async validateCompliance(
        context: IAPIContext,
        userId: string
    ): Promise<{
        compliant: boolean;
        regulations: string[];
        issues: Array<{
            regulation: string;
            severity: 'low' | 'medium' | 'high';
            code: string;
            message: string;
        }>;
    }> {
        try {
            const complianceValidator = await this.serviceProvider.get<IComplianceValidator>(
                SecurityServiceKeys.COMPLIANCE_VALIDATOR
            );

            if (!complianceValidator) {
                return { compliant: true, regulations: [], issues: [] };
            }

            const path = context.request.path || '/';

            // Conversion du body en Record<string, unknown>
            const requestBody = typeof context.request.body === 'object' && context.request.body !== null
                ? context.request.body as Record<string, unknown>
                : { value: context.request.body }; // Envelopper les valeurs primitives

            const result = await complianceValidator.validateRequest(
                userId,
                path,
                requestBody
            );

            // Correction du type issues
            return {
                compliant: result.issues.length === 0,
                regulations: result.regulations,
                issues: Array.isArray(result.issues) ? result.issues.map(issue => {
                    if (typeof issue === 'string') {
                        // Convertir les strings en objets structurés
                        return {
                            regulation: 'UNKNOWN',
                            severity: 'medium' as const,
                            code: 'GEN-001',
                            message: issue
                        };
                    }
                    return issue;
                }) : []
            };
        } catch (error) {
            this.logger.error('Error validating compliance', error);
            return { compliant: true, regulations: [], issues: [] };
        }
    }

    private async reportComplianceIssues(
        userId: string,
        context: IAPIContext,
        validationResult: {
            compliant: boolean;
            regulations: string[];
            issues: Array<{
                regulation: string;
                severity: 'low' | 'medium' | 'high';
                code: string;
                message: string;
            }>;
        }
    ): Promise<void> {
        try {
            if (!this.config.auditingEnabled) {
                return;
            }

            const complianceValidator = await this.serviceProvider.get<IComplianceValidator>(
                SecurityServiceKeys.COMPLIANCE_VALIDATOR
            );

            if (!complianceValidator || !complianceValidator.logComplianceIssue) {
                return;
            }

            for (const issue of validationResult.issues) {
                await complianceValidator.logComplianceIssue({
                    userId,
                    endpoint: context.request.path,
                    method: context.request.method,
                    ip: context.request.ip,
                    timestamp: new Date().toISOString(),
                    regulation: issue.regulation,
                    severity: issue.severity,
                    code: issue.code,
                    message: issue.message
                });
            }
        } catch (error) {
            this.logger.error('Error reporting compliance issues', error);
        }
    }
}