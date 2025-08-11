// src/ai/api/core/middleware/SecurityMiddleware.ts
import { IMiddleware, IAPIContext, NextFunction } from '@api/core/types';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@api/common/monitoring/LogService';
import {
    IJWTService,
    ITokenValidator,
    IEncryptionService,
    IDataSanitizer,
    ISecurityBehaviorAnalyzer,
    IIntrusionDetectionSystem,
    IRateLimiter,
    ISecurityAuditor,
    IFraudDetectionSystem,
    IComplianceValidator,
    ISecurityEventMonitor,
    SecurityMiddlewareOptions
} from './interfaces';

import {
    SecurityMiddlewareFactory,
    SecurityServiceProvider,
    SecurityMiddlewareChain
} from '@api/core/middleware';

// Importer SecurityServiceKeys du bon chemin
import { SecurityServiceKeys } from '@api/core/middleware/di/types';

// Importer les middlewares individuellement
import { RequestIdMiddleware } from './middlewares/RequestIdMiddleware';
import { RateLimitingMiddleware } from './middlewares/RateLimitingMiddleware';
import { AuthenticationMiddleware } from './middlewares/AuthenticationMiddleware';
import { SecurityHeadersMiddleware } from './middlewares/SecurityHeadersMiddleware';
import { ErrorHandlerMiddleware } from './middlewares/ErrorHandlerMiddleware';
import { IntrusionDetectionMiddleware } from './middlewares/IntrusionDetectionMiddleware';
import { BehaviorAnalysisMiddleware } from './middlewares/BehaviorAnalysisMiddleware';
import { ComplianceValidationMiddleware } from './middlewares/ComplianceValidationMiddleware';
import { DataSanitizationMiddleware } from './middlewares/DataSanitizationMiddleware';
import { EncryptionMiddleware } from './middlewares/EncryptionMiddleware';
import { SecurityAuditMiddleware } from './middlewares/SecurityAuditMiddleware';

/**
 * Middleware de sécurité avancé qui assure l'intégrité, la confidentialité
 * et l'authenticité des requêtes et réponses API
 * 
 * Cette version utilise la nouvelle architecture modulaire en interne
 * tout en maintenant la compatibilité avec l'ancienne interface
 */
export class SecurityMiddleware implements IMiddleware {
    private readonly logger: Logger;
    private readonly options: SecurityMiddlewareOptions;
    private readonly middlewareChain: SecurityMiddlewareChain;
    private readonly serviceProvider: SecurityServiceProvider;

    /**
     * Initialise le middleware de sécurité avec les services requis
     */
    constructor(options: SecurityMiddlewareOptions = {},
        jwtService?: IJWTService,
        tokenValidator?: ITokenValidator,
        encryptionService?: IEncryptionService,
        dataSanitizer?: IDataSanitizer,
        behaviorAnalyzer?: ISecurityBehaviorAnalyzer,
        intrusionDetection?: IIntrusionDetectionSystem,
        rateLimiter?: IRateLimiter,
        securityAuditor?: ISecurityAuditor,
        fraudDetection?: IFraudDetectionSystem,
        complianceValidator?: IComplianceValidator,
        securityEventMonitor?: ISecurityEventMonitor) {

        this.logger = new Logger('SecurityMiddleware');
        this.options = {
            jwtSecret: 'default-secret-key',
            encryptionAlgorithm: 'aes-256-gcm',
            keySize: 256,
            validateTokens: true,
            defaultRateLimit: 100,
            rateLimitWindowMs: 60000,
            securityHeadersEnabled: true,
            preventSqlInjection: true,
            preventXss: true,
            preventPathTraversal: true,
            autoBlock: true,
            blockDuration: 3600000,
            notifyAdmin: true,
            preventiveMode: false,
            sensitiveDataScan: true,
            responseEncryption: false,
            logLevel: 'info',
            ...options
        };

        // Créer un fournisseur de services pour la nouvelle architecture
        this.serviceProvider = new SecurityServiceProvider();

        // Enregistrer les services fournis, s'ils existent
        if (jwtService) {
            this.serviceProvider.register(SecurityServiceKeys.JWT_SERVICE, () => jwtService);
        }
        if (tokenValidator) {
            this.serviceProvider.register(SecurityServiceKeys.TOKEN_VALIDATOR, () => tokenValidator);
        }
        if (encryptionService) {
            this.serviceProvider.register(SecurityServiceKeys.ENCRYPTION_SERVICE, () => encryptionService);
        }
        if (dataSanitizer) {
            this.serviceProvider.register(SecurityServiceKeys.DATA_SANITIZER, () => dataSanitizer);
        }
        if (behaviorAnalyzer) {
            this.serviceProvider.register(SecurityServiceKeys.BEHAVIOR_ANALYZER, () => behaviorAnalyzer);
        }
        if (intrusionDetection) {
            this.serviceProvider.register(SecurityServiceKeys.INTRUSION_DETECTION, () => intrusionDetection);
        }
        if (rateLimiter) {
            this.serviceProvider.register(SecurityServiceKeys.RATE_LIMITER, () => rateLimiter);
        }
        if (securityAuditor) {
            this.serviceProvider.register(SecurityServiceKeys.SECURITY_AUDITOR, () => securityAuditor);
        }
        if (fraudDetection) {
            this.serviceProvider.register(SecurityServiceKeys.FRAUD_DETECTION, () => fraudDetection);
        }
        if (complianceValidator) {
            this.serviceProvider.register(SecurityServiceKeys.COMPLIANCE_VALIDATOR, () => complianceValidator);
        }
        if (securityEventMonitor) {
            this.serviceProvider.register(SecurityServiceKeys.SECURITY_EVENT_MONITOR, () => securityEventMonitor);
        }

        // Créer la chaîne de middleware pour la nouvelle architecture
        this.middlewareChain = this.createMiddlewareChain();
    }

    /**
     * Traite une requête API en utilisant la chaîne de middlewares modulaire
     * @param context Le contexte de la requête API
     * @param next La fonction suivante dans la chaîne de middleware
     */
    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // Générer un identifiant unique pour cette requête si absent
            if (!context.requestId) {
                context.requestId = uuidv4();
            }

            // Initialiser le contexte de sécurité s'il n'existe pas
            if (!context.security) {
                context.security = {};
            }

            // Utiliser la chaîne de middlewares modulaire
            await this.middlewareChain.process(context, next);
        } catch (error) {
            // Si une erreur se produit malgré le gestionnaire d'erreurs dans la chaîne,
            // nous la gérons ici comme filet de sécurité
            this.logger.error('Unhandled security error', error);

            context.response = {
                status: 500,
                statusCode: 500,
                body: {
                    error: 'An unexpected security error occurred',
                    requestId: context.requestId
                },
                headers: { 'Content-Type': 'application/json' },
                timestamp: Date.now(),
                duration: context.duration
            };
        }
    }

    /**
     * Convertit les options de l'ancien format vers le nouveau format de configuration
     */
    private convertOptionsToNewFormat(oldOptions: SecurityMiddlewareOptions): Record<string, unknown> {
        return {
            enableRateLimiting: true,
            validateTokens: oldOptions.validateTokens,
            enableSecurityHeaders: oldOptions.securityHeadersEnabled,
            enableIntrusionDetection: true,
            enableBehaviorAnalysis: true,
            enableDataSanitization: true,
            enableEncryption: oldOptions.responseEncryption,
            enableCompliance: true,
            enableSecurityAudit: true,
            detailedErrors: oldOptions.logLevel === 'debug',
            logLevel: oldOptions.logLevel,

            // Configuration de rate limiting
            rateLimiting: {
                defaultLimit: oldOptions.defaultRateLimit ?? 100,
                windowMs: oldOptions.rateLimitWindowMs ?? 60000,
                pathLimits: {}
            },

            // Configuration de sécurité des données
            dataSanitization: {
                enableSqlSanitization: oldOptions.preventSqlInjection,
                enableHtmlSanitization: oldOptions.preventXss,
                strictMode: true
            },

            // Configuration d'encryption
            encryption: {
                algorithm: oldOptions.encryptionAlgorithm,
                keySize: oldOptions.keySize,
                encryptRequestBody: false,
                encryptResponseBody: oldOptions.responseEncryption,
                encryptHeaders: []
            },

            // Configuration d'intrusion detection
            intrusionDetection: {
                enableSignatureDetection: true,
                enableAnomalyDetection: true,
                signatureDatabase: 'default',
                alertThreshold: 0.7,
                actions: oldOptions.autoBlock ? ['log', 'block', 'alert'] : ['log', 'alert']
            },

            // Configuration de comportement
            behaviorAnalysis: {
                sessionProfilingEnabled: true,
                userProfilingEnabled: true,
                anomalyThreshold: 0.8,
                learningPeriod: 86400000 // 24h
            },

            // Configuration pour l'audit
            auditConfig: {
                logLevel: oldOptions.logLevel === 'debug' ? 'debug' : 'info',
                includeSensitiveData: false,
                storageLocation: 'file',
                retentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 jours
            }
        };
    }

    /**
     * Crée une chaîne de middlewares basée sur les options
     */
    private createMiddlewareChain(): SecurityMiddlewareChain {
        const chain = new SecurityMiddlewareChain();

        // Toujours ajouter ErrorHandler en premier pour gérer les erreurs
        chain.use(new ErrorHandlerMiddleware(this.serviceProvider, {
            errorDetailLevel: this.options.logLevel === 'debug' ? 'detailed' : 'basic',
            includeStackTrace: this.options.logLevel === 'debug',
            defaultStatusCode: 500,
            defaultErrorMessage: 'An unexpected error occurred'
        }));

        // Ajout du middleware RequestId
        chain.use(new RequestIdMiddleware());

        // Ajout des autres middlewares selon les options
        if (this.options.validateTokens) {
            chain.use(new AuthenticationMiddleware(this.serviceProvider));
        }

        if (this.options.securityHeadersEnabled) {
            chain.use(new SecurityHeadersMiddleware({
                hsts: {
                    enabled: true,
                    maxAge: 31536000,
                    includeSubDomains: true,
                    preload: true
                },
                csp: {
                    enabled: true,
                    directives: {
                        'default-src': ["'self'"],
                        'script-src': ["'self'"],
                        'object-src': ["'none'"]
                    },
                    reportOnly: false
                },
                noSniff: true,
                frameOptions: 'DENY',
                xssProtection: true,
                referrerPolicy: 'strict-origin-when-cross-origin'
            }));
        }

        // Limitation de débit
        chain.use(new RateLimitingMiddleware(this.serviceProvider, {
            defaultLimit: this.options.defaultRateLimit ?? 100,
            windowMs: this.options.rateLimitWindowMs ?? 60000,
            pathLimits: {}
        }));

        // Détection d'intrusion
        chain.use(new IntrusionDetectionMiddleware(this.serviceProvider, {
            enableSignatureDetection: true,
            enableAnomalyDetection: true,
            signatureDatabase: 'default',
            alertThreshold: 0.7,
            actions: this.options.autoBlock ? ['log', 'block', 'alert'] : ['log', 'alert']
        }));

        // Analyse comportementale
        chain.use(new BehaviorAnalysisMiddleware(this.serviceProvider, {
            sessionProfilingEnabled: true,
            userProfilingEnabled: true,
            anomalyThreshold: 0.8,
            learningPeriod: 86400000 // 24h
        }));

        // Validation de conformité
        chain.use(new ComplianceValidationMiddleware(this.serviceProvider));

        // Assainissement des données
        if (this.options.preventSqlInjection || this.options.preventXss) {
            chain.use(new DataSanitizationMiddleware({
                enableHtmlSanitization: this.options.preventXss ?? true,
                enableSqlSanitization: this.options.preventSqlInjection ?? true,
                strictMode: true
            }));
        }

        // Chiffrement des réponses
        if (this.options.responseEncryption) {
            chain.use(new EncryptionMiddleware(this.serviceProvider, {
                algorithm: this.options.encryptionAlgorithm ?? 'aes-256-gcm',
                keySize: this.options.keySize ?? 256,
                encryptRequestBody: false,
                encryptResponseBody: true,
                encryptHeaders: []
            }));
        }

        // Audit de sécurité
        chain.use(new SecurityAuditMiddleware(this.serviceProvider, {
            logLevel: this.options.logLevel === 'debug' ? 'debug' : 'info',
            includeSensitiveData: false,
            storageLocation: 'file',
            retentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 jours
        }));

        return chain;
    }
}

/**
 * Crée une instance du middleware de sécurité avec la configuration par défaut
 * @param options Options de configuration
 * @returns Une instance du middleware de sécurité
 */
export function createSecurityMiddleware(options: Record<string, unknown> = {}): IMiddleware {
    // Pour la compatibilité avec la nouvelle architecture, nous utilisons directement la factory
    const factory = new SecurityMiddlewareFactory({
        config: options
    });
    return factory.createFullChain();
}