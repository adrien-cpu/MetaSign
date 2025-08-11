import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction } from '@api/core/middleware/middleware-interfaces';
import {
    IntrusionDetectionConfig,
    IIntrusionDetectionSystem,
    ISecurityAuditor
} from '@api/core/middleware/types/middleware.types';
import { SecurityServiceProvider } from '@api/core/middleware/di/SecurityServiceProvider';
import { SecurityServiceKeys } from '@api/core/middleware/di/types';
import { Logger } from '@api/common/monitoring/LogService';

export class IntrusionDetectionMiddleware implements IMiddleware {
    public readonly name: string = 'IntrusionDetectionMiddleware';
    public readonly isEnabled: boolean;

    private readonly serviceProvider: SecurityServiceProvider;
    private readonly config: IntrusionDetectionConfig;
    private readonly logger: Logger;

    constructor(
        serviceProvider: SecurityServiceProvider,
        config: Partial<IntrusionDetectionConfig> = {}
    ) {
        this.serviceProvider = serviceProvider;
        this.logger = new Logger(this.name);

        // Default configuration
        this.config = {
            enableSignatureDetection: true,
            enableAnomalyDetection: true,
            signatureDatabase: 'default',
            alertThreshold: 75,
            actions: ['log', 'block'],
            ...config
        };

        this.isEnabled = true;
    }

    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // Skip intrusion detection for trusted sources
            if (this.isTrustedSource(context)) {
                await next();
                return;
            }

            // Perform signature-based detection if enabled
            let signatureScore = 0;
            if (this.config.enableSignatureDetection) {
                signatureScore = await this.performSignatureDetection(context);
            }

            // Perform anomaly detection if enabled
            let anomalyScore = 0;
            if (this.config.enableAnomalyDetection) {
                anomalyScore = await this.performAnomalyDetection(context);
            }

            // Calculate total threat score
            const threatScore = Math.max(signatureScore, anomalyScore);

            // Store the threat score in the context for other middlewares to use
            if (!context.security) {
                context.security = {};
            }
            // Ajouter comme propriété dynamique
            (context.security as Record<string, unknown>)['threatScore'] = threatScore;

            // Take action based on threat score and configured actions
            if (threatScore >= this.config.alertThreshold) {
                await this.takeActionBasedOnThreatScore(context, threatScore);
            }

            // Continue to next middleware if not blocked
            if (threatScore < 100 || !this.config.actions.includes('block')) {
                await next();
            }

        } catch (error) {
            this.logger.error('Error in intrusion detection middleware', error);
            throw error;
        }
    }

    private isTrustedSource(context: IAPIContext): boolean {
        // Implementation would check whitelist of IPs, internal networks, etc.
        // This is a simplified version
        const ip = context.request.ip || '';
        return ip.startsWith('192.168.') || ip === '127.0.0.1';
    }

    private async performSignatureDetection(context: IAPIContext): Promise<number> {
        try {
            const idsService = await this.serviceProvider.get<IIntrusionDetectionSystem>(
                SecurityServiceKeys.INTRUSION_DETECTION
            );

            if (!idsService) {
                this.logger.warn('IDS service not available, defaulting to safe behavior');
                return 0;
            }

            const result = await idsService.detectIntrusion({
                ip: context.request.ip,
                path: context.request.path,
                method: context.request.method,
                headers: context.request.headers || {},
                body: typeof context.request.body === 'object' ? context.request.body as Record<string, unknown> : undefined,
                query: context.request.query
            });

            // Utiliser confidence au lieu de threatScore
            return result.confidence * 100; // Convertir en score 0-100
        } catch (error) {
            // Convertir error en structure compatible avec le logger
            const errorObj = error instanceof Error
                ? { message: error.message, name: error.name, stack: error.stack }
                : { message: String(error) };

            this.logger.warn('Error during anomaly detection, defaulting to safe behavior', errorObj);
            return 0;
        }
    }

    private async performAnomalyDetection(context: IAPIContext): Promise<number> {
        try {
            const behaviorAnalyzer = await this.serviceProvider.get<IIntrusionDetectionSystem>(
                SecurityServiceKeys.BEHAVIOR_ANALYZER
            );

            if (!behaviorAnalyzer) {
                this.logger.warn('Behavior analyzer service not available, defaulting to safe behavior');
                return 0;
            }

            const userId = context.request.userId || 'anonymous';
            const requestInfo = {
                userId,
                endpoint: context.request.path,
                method: context.request.method,
                ip: context.request.ip,
                userAgent: context.request.headers ? context.request.headers['user-agent'] : undefined,
                timestamp: new Date().toISOString()
            };

            const result = await behaviorAnalyzer.detectIntrusion(requestInfo as Record<string, unknown>);
            return result.confidence * 100; // Convertir en score 0-100
        } catch (error) {
            // Convertir error en structure compatible avec le logger
            const errorObj = error instanceof Error
                ? { message: error.message, name: error.name, stack: error.stack }
                : { message: String(error) };

            this.logger.warn('Error during anomaly detection, defaulting to safe behavior', errorObj);
            return 0;
        }
    }

    private async takeActionBasedOnThreatScore(context: IAPIContext, threatScore: number): Promise<void> {
        // Log the potential intrusion
        if (this.config.actions.includes('log')) {
            this.logger.warn('Potential intrusion detected', {
                ip: context.request.ip,
                path: context.request.path,
                method: context.request.method,
                threatScore,
                userAgent: context.request.headers ? context.request.headers['user-agent'] : undefined
            });
        }

        // Block the request if score is high enough and blocking is enabled
        if (threatScore >= 100 && this.config.actions.includes('block')) {
            if (!context.response) {
                context.response = {
                    status: 403,
                    body: { error: 'Access denied for security reasons' },
                    headers: {} // Ajouter headers requis
                };
            } else {
                context.response.status = 403;
                context.response.body = { error: 'Access denied for security reasons' };
            }
        }

        // Send an alert if configured
        if (this.config.actions.includes('alert')) {
            try {
                const securityAuditor = await this.serviceProvider.get<ISecurityAuditor>(
                    SecurityServiceKeys.SECURITY_AUDITOR
                );

                if (securityAuditor && securityAuditor.logSecurityIncident) {
                    await securityAuditor.logSecurityIncident({
                        type: 'intrusion',
                        severity: threatScore >= 90 ? 'critical' : 'high',
                        details: {
                            ip: context.request.ip,
                            path: context.request.path,
                            method: context.request.method,
                            threatScore,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            } catch (error) {
                this.logger.error('Failed to send security alert', error);
            }
        }
    }
}