import { IAPIContext, AnomalyType } from '@api/core/types';
import { IMiddleware, NextFunction } from '@api/core/middleware/middleware-interfaces';
import { BehaviorAnalysisConfig } from '@api/core/middleware/types/middleware.types';
import { SecurityServiceProvider } from '@api/core/middleware/di/SecurityServiceProvider';
import { SecurityServiceKeys } from '@api/core/middleware/di/types';
import { Logger } from '@api/common/monitoring/LogService';
import { ISecurityBehaviorAnalyzer } from '@api/core/middleware/interfaces';

export class BehaviorAnalysisMiddleware implements IMiddleware {
    public readonly name: string = 'BehaviorAnalysisMiddleware';
    public readonly isEnabled: boolean;

    private readonly serviceProvider: SecurityServiceProvider;
    private readonly config: BehaviorAnalysisConfig;
    private readonly logger: Logger;

    constructor(
        serviceProvider: SecurityServiceProvider,
        config: Partial<BehaviorAnalysisConfig> = {}
    ) {
        this.serviceProvider = serviceProvider;
        this.logger = new Logger(this.name);

        // Default configuration
        this.config = {
            sessionProfilingEnabled: true,
            userProfilingEnabled: true,
            anomalyThreshold: 70,
            learningPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            ...config
        };

        this.isEnabled = true;
    }

    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // Skip behavior analysis for internal requests
            if (this.isInternalRequest(context)) {
                await next();
                return;
            }

            // Get user ID or session ID for tracking
            const userId = this.extractUserId(context);
            const sessionId = this.extractSessionId(context);

            // Analyze user behavior
            const analysisResult = await this.analyzeBehavior(context, userId);

            // Store analysis result in context for other middlewares
            if (!context.security) {
                context.security = {};
            }
            // Conversion au type attendu
            context.security.behaviorAnalysis = {
                anomalyDetected: analysisResult.anomalyScore > this.config.anomalyThreshold,
                anomalyType: this.convertToAnomalyType(analysisResult.anomalyType) || 'UNUSUAL_PATTERN',
                anomalyConfidence: analysisResult.confidence,
                details: String(analysisResult.details || ""),
                riskScore: analysisResult.anomalyScore,
                baseline: analysisResult.details || {}
            };

            // Log anomalies if detected
            if (analysisResult.anomalyScore >= this.config.anomalyThreshold) {
                this.logger.warn('Behavior anomaly detected', {
                    userId,
                    sessionId,
                    endpoint: context.request.path,
                    anomalyScore: context.security.behaviorAnalysis.riskScore,
                    anomalyType: context.security.behaviorAnalysis.anomalyType
                });

                // Report the anomaly for further analysis
                // Assurons-nous que anomalyType est défini pour éviter les erreurs avec exactOptionalPropertyTypes
                const safeAnomalyType = context.security.behaviorAnalysis.anomalyType || 'UNUSUAL_PATTERN';

                await this.reportAnomaly(context, userId, sessionId, {
                    anomalyScore: context.security.behaviorAnalysis.riskScore,
                    anomalyType: safeAnomalyType,
                    confidence: context.security.behaviorAnalysis.anomalyConfidence,
                    details: context.security.behaviorAnalysis.baseline
                });
            }

            // Continue to next middleware
            await next();

        } catch (error) {
            this.logger.error('Error in behavior analysis middleware', error);
            // Continue to next middleware even if analysis fails
            await next();
        }
    }

    // Ajout d'une fonction helper
    private convertToAnomalyType(type?: string): AnomalyType | undefined {
        if (!type) return undefined;

        // Conversion vers les types AnomalyType valides
        const validTypes: Record<string, AnomalyType> = {
            'unusual_pattern': 'UNUSUAL_PATTERN',
            'frequency': 'FREQUENCY_ANOMALY',
            'timing': 'TIMING_ANOMALY',
            'content': 'CONTENT_ANOMALY'
        };

        return validTypes[type.toLowerCase()] || 'UNUSUAL_PATTERN';
    }

    private isInternalRequest(context: IAPIContext): boolean {
        // Skip analysis for health checks, metrics, etc.
        const path = context.request.path || '';
        return path.startsWith('/health') ||
            path.startsWith('/metrics') ||
            path.startsWith('/internal/');
    }

    private extractUserId(context: IAPIContext): string {
        // Extract user ID from the security context or cookies
        const headers = context.request.headers || {};
        return (context.security as Record<string, unknown>)?.['userId'] as string ||
            headers['x-user-id'] as string ||
            'anonymous';
    }

    private extractSessionId(context: IAPIContext): string {
        // Extract session ID from cookies or headers
        const headers = context.request.headers || {};
        return headers['x-session-id'] as string ||
            'unknown-session';
    }

    private async analyzeBehavior(
        context: IAPIContext,
        userId: string
    ): Promise<{
        anomalyScore: number;
        anomalyType?: string;
        confidence: number;
        details?: Record<string, unknown>;
    }> {
        try {
            const behaviorAnalyzer = await this.serviceProvider.get<ISecurityBehaviorAnalyzer>(
                SecurityServiceKeys.BEHAVIOR_ANALYZER
            );

            if (!behaviorAnalyzer) {
                return { anomalyScore: 0, confidence: 0 };
            }

            // Ajout de la valeur par défaut pour path
            const path = context.request.path || '/';
            const headers = context.request.headers || {};

            // Pour corriger le problème du body:
            const requestBody = typeof context.request.body === 'object' && context.request.body !== null
                ? context.request.body as Record<string, unknown>
                : { value: context.request.body };

            const result = await behaviorAnalyzer.analyzeRequest(
                userId,
                path,
                context.request.method || 'GET',
                context.request.ip || '',
                headers['user-agent'] as string || '',
                requestBody
            );

            // Convertir les détails string en objet si nécessaire
            const detailsObj = typeof result.details === 'string'
                ? { message: result.details }
                : result.details;

            // Traiter l'objet result comme un Record<string, unknown> via un cast intermédiaire
            const resultObj = result as unknown as Record<string, unknown>;

            // Récupérer les propriétés de manière sécurisée
            return {
                anomalyScore: typeof resultObj.anomalyScore === 'number' ? resultObj.anomalyScore : 0,
                // S'assurer que anomalyType est une string ou undefined selon le besoin
                anomalyType: typeof resultObj.anomalyType === 'string' ? resultObj.anomalyType : '',
                confidence: typeof resultObj.confidence === 'number' ? resultObj.confidence : 0,
                details: detailsObj
            };
        } catch (error) {
            this.logger.error('Error analyzing behavior', error);
            return { anomalyScore: 0, confidence: 0 };
        }
    }

    private async reportAnomaly(
        context: IAPIContext,
        userId: string,
        sessionId: string,
        analysisResult: {
            anomalyScore: number;
            anomalyType: string; // Non-optional string
            confidence: number;
            details?: Record<string, unknown>;
        }
    ): Promise<void> {
        try {
            const behaviorAnalyzer = await this.serviceProvider.get<ISecurityBehaviorAnalyzer>(
                SecurityServiceKeys.BEHAVIOR_ANALYZER
            );

            if (!behaviorAnalyzer || !behaviorAnalyzer.reportAnomaly) {
                return;
            }

            const headers = context.request.headers || {};

            await behaviorAnalyzer.reportAnomaly({
                userId,
                sessionId,
                endpoint: context.request.path || '/',
                method: context.request.method || 'GET',
                ip: context.request.ip || '',
                userAgent: headers['user-agent'] as string || '',
                timestamp: new Date().toISOString(),
                anomalyScore: analysisResult.anomalyScore,
                anomalyType: analysisResult.anomalyType,
                confidence: analysisResult.confidence,
                details: analysisResult.details
            });
        } catch (error) {
            this.logger.error('Error reporting behavior anomaly', error);
        }
    }
}