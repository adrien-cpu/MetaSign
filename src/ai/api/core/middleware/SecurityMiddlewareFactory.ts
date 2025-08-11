//src/ai/api/core/middleware/SecurityMiddlewareFactory.ts
import { IAPIContext } from '@api/core/types';
// Utiliser les alias définis dans tsconfig.json pour les imports
import { SecurityServiceProvider } from '@api/core/middleware/di/SecurityServiceProvider';
import { SecurityServiceKeys } from '@api/core/middleware/di/types';
import {
    IMiddleware,
    IMiddlewareChain,
    NextFunction
} from '@api/core/middleware/interfaces';
import {
    SecurityConfig,
    MiddlewareChainConfig,
    SecurityHeadersConfig,
    RateLimitConfig,
    AuthenticationConfig,
    ErrorHandlerConfig,
    IntrusionDetectionConfig,
    DataSanitizationConfig,
    SecurityHeadersOptions
} from '@api/core/middleware/types/middleware.types';
import { SecurityMiddlewareChain } from './SecurityMiddlewareChain';
import { RequestIdMiddleware } from './middlewares/RequestIdMiddleware';
import { RateLimitingMiddleware } from './middlewares/RateLimitingMiddleware';
import { AuthenticationMiddleware } from './middlewares/AuthenticationMiddleware';
import { SecurityHeadersMiddleware } from './middlewares/SecurityHeadersMiddleware';
import { ErrorHandlerMiddleware } from './middlewares/ErrorHandlerMiddleware';
// Importez les mocks selon les besoins
import * as mocks from '@api/core/middleware/mocks';

interface SecurityMiddlewareFactoryOptions {
    serviceProvider?: SecurityServiceProvider;
    config?: Partial<SecurityConfig>;
    useMocks?: boolean;
}

/**
 * Classe pour créer des middlewares de sécurité
 */
export class SecurityMiddlewareFactory {
    private readonly serviceProvider: SecurityServiceProvider;
    private readonly config: SecurityConfig;
    private readonly useMocks: boolean;

    constructor(options?: SecurityMiddlewareFactoryOptions) {
        this.serviceProvider = options?.serviceProvider || new SecurityServiceProvider();
        this.useMocks = options?.useMocks || false;

        // Configuration par défaut
        const defaultConfig: SecurityConfig = {
            enableRateLimiting: true,
            validateTokens: true,
            detailedErrors: process.env.NODE_ENV !== 'production',
            enableComplianceChecks: false,
            enableBehaviorAnalysis: false,
            enableIntrusionDetection: false,
            enableDataSanitization: true,
            enableEncryption: false,
            enableAudit: false,
            enableSecurityHeaders: true,

            // Configurations spécifiques par défaut
            rateLimiting: {
                defaultLimit: 100,
                windowMs: 60000, // 1 minute
                pathLimits: {}
            },
            authentication: {
                publicPaths: ['/api/health', '/api/docs', '/public']
            },
            securityHeaders: {
                hsts: {
                    enabled: true,
                    maxAge: 31536000, // 1 an
                    includeSubDomains: true,
                    preload: false
                },
                noSniff: true,
                frameOptions: 'DENY',
                xssProtection: true,
                referrerPolicy: 'strict-origin-when-cross-origin'
            }
        };

        // Fusionner la configuration par défaut avec celle fournie
        this.config = this.mergeConfigs(defaultConfig, options?.config || {});

        // Initialiser les services de base si on n'utilise pas des mocks
        if (!this.useMocks) {
            this.initializeServices();
        } else {
            this.initializeMocks();
        }
    }

    /**
     * Fusionne les configurations en gérant correctement les objets imbriqués
     */
    private mergeConfigs(
        defaultConfig: SecurityConfig,
        userConfig: Partial<SecurityConfig>
    ): SecurityConfig {
        // Copie profonde et typée de la configuration par défaut
        const mergedConfig: SecurityConfig = JSON.parse(JSON.stringify(defaultConfig));

        // Fonction pour fusionner deux objets en toute sécurité
        function safeMerge(target: unknown, source: unknown): unknown {
            if (!source || typeof source !== 'object' || source === null) {
                return target;
            }

            if (!target || typeof target !== 'object' || target === null) {
                return source;
            }

            const result = { ...target as Record<string, unknown> };

            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    const sourceValue = (source as Record<string, unknown>)[key];
                    const targetValue = (target as Record<string, unknown>)[key];

                    // Si les deux sont des objets (et pas null), fusionner récursivement
                    if (
                        sourceValue !== null &&
                        typeof sourceValue === 'object' &&
                        targetValue !== null &&
                        typeof targetValue === 'object'
                    ) {
                        result[key] = safeMerge(targetValue, sourceValue);
                    } else {
                        // Sinon, utiliser la valeur de la source
                        result[key] = sourceValue;
                    }
                }
            }

            return result;
        }

        // Fusionner les propriétés de premier niveau en toute sécurité
        for (const key in userConfig) {
            if (Object.prototype.hasOwnProperty.call(userConfig, key)) {
                const typedKey = key as keyof SecurityConfig;

                // Gérer différemment selon le type de la propriété
                if (
                    typeof userConfig[typedKey] === 'object' &&
                    userConfig[typedKey] !== null &&
                    typeof mergedConfig[typedKey] === 'object' &&
                    mergedConfig[typedKey] !== null
                ) {
                    // Fusion sécurisée d'objets avec conversion via unknown
                    mergedConfig[typedKey] = safeMerge(
                        mergedConfig[typedKey],
                        userConfig[typedKey]
                    ) as never;
                } else {
                    // Affectation directe pour les valeurs simples
                    mergedConfig[typedKey] = userConfig[typedKey] as never;
                }
            }
        }

        return mergedConfig;
    }

    /**
     * Initialise les services nécessaires pour les middlewares
     */
    private initializeServices(): void {
        // Initialiser les services requis pour les middlewares
        // Par exemple, JWT, Rate Limiter, etc.
    }

    /**
     * Initialise les mocks pour les tests
     */
    private initializeMocks(): void {
        // Utiliser des mocks pour les tests
        // Exemple: 
        this.serviceProvider.register(
            SecurityServiceKeys.JWT_SERVICE,
            () => mocks.createMockJwtService()
        );

        // Ajouter les autres mocks nécessaires
        // Vérifier si les fonctions de création existent avant de les appeler
        if (typeof mocks.createMockRateLimiter === 'function') {
            this.serviceProvider.register(
                SecurityServiceKeys.RATE_LIMITER,
                () => mocks.createMockRateLimiter()
            );
        }

        if (typeof mocks.createMockIntrusionDetectionSystem === 'function') {
            this.serviceProvider.register(
                SecurityServiceKeys.INTRUSION_DETECTION,
                () => mocks.createMockIntrusionDetectionSystem()
            );
        }
    }

    /**
     * Crée un middleware de limitation de débit
     */
    public createRateLimitingMiddleware(options?: Partial<RateLimitConfig>): IMiddleware {
        const config: RateLimitConfig = {
            ...this.config.rateLimiting,
            ...options,
            pathLimits: {
                ...(this.config.rateLimiting?.pathLimits || {}),
                ...(options?.pathLimits || {})
            }
        } as RateLimitConfig;

        return new RateLimitingMiddleware(this.serviceProvider, config);
    }

    /**
     * Crée un middleware d'authentification
     */
    public createAuthenticationMiddleware(options?: Partial<AuthenticationConfig>): IMiddleware {
        const config: AuthenticationConfig = {
            ...this.config.authentication,
            ...options
        } as AuthenticationConfig;

        return new AuthenticationMiddleware(this.serviceProvider, config);
    }

    /**
     * Crée un middleware d'en-têtes de sécurité
     */
    public createSecurityHeadersMiddleware(options?: Partial<SecurityHeadersConfig>): IMiddleware {
        // Si les en-têtes de sécurité sont désactivés au niveau global, retourner un middleware vide
        if (this.config.enableSecurityHeaders === false) {
            return {
                process: async (context: IAPIContext, next: NextFunction) => {
                    await next();
                }
            };
        }

        // Valeurs par défaut de base pour les en-têtes de sécurité
        const defaultOptions: SecurityHeadersOptions = {
            hsts: {
                enabled: true,
                maxAge: 31536000, // 1 an
                includeSubDomains: true,
                preload: false
            },
            noSniff: true,
            frameOptions: 'DENY',
            xssProtection: true,
            referrerPolicy: 'strict-origin-when-cross-origin'
        };

        // Fusionner avec les options configurées
        const baseOptions = {
            ...defaultOptions,
            ...this.config.securityHeaders,
            // Gestion spécifique pour hsts
            hsts: {
                ...defaultOptions.hsts,
                ...this.config.securityHeaders?.hsts
            }
        };

        // Fusionner avec les options utilisateur
        const mergedOptions = {
            ...baseOptions,
            ...options,
            // Gestion spécifique pour hsts
            hsts: {
                ...baseOptions.hsts,
                ...(options?.hsts || {})
            }
        };

        // Préparer les options CSP si nécessaire
        let headerOptions = { ...mergedOptions };

        // Définir des interfaces locales pour typer correctement
        interface CspOptions {
            enabled?: boolean;
            directives?: Record<string, string[]>;
            reportOnly?: boolean;
        }

        if (baseOptions.csp || options?.csp) {
            // Créer un objet CSP avec les propriétés nécessaires
            const baseCsp: CspOptions = baseOptions.csp || {};
            const userCsp: CspOptions = options?.csp || {};

            // Assurer que reportOnly est défini avec valeur par défaut false si absent
            const reportOnlyValue = userCsp.reportOnly !== undefined
                ? userCsp.reportOnly
                : (baseCsp.reportOnly !== undefined ? baseCsp.reportOnly : false);

            headerOptions = {
                ...headerOptions,
                csp: {
                    // Propriétés par défaut si elles n'existent pas
                    enabled: true,
                    directives: {},
                    // Fusionner avec les configurations existantes
                    ...baseCsp,
                    ...userCsp,
                    // S'assurer que reportOnly existe et est défini
                    reportOnly: reportOnlyValue
                }
            };
        }

        // Au lieu d'utiliser des conversions de type qui ne fonctionnent pas bien avec
        // les règles strictes de TypeScript, créer directement un objet conforme
        // à la structure attendue par SecurityHeadersMiddleware

        // Extraire la configuration CSP si elle existe
        let cspConfig = undefined;
        if (headerOptions.csp) {
            cspConfig = {
                enabled: headerOptions.csp.enabled,
                directives: headerOptions.csp.directives,
                // S'assurer que reportOnly est toujours défini (non optionnel)
                reportOnly: headerOptions.csp.reportOnly === undefined ? false : headerOptions.csp.reportOnly
            };
        }

        // Créer un nouvel objet avec la structure exacte attendue
        const middlewareOptions = {
            hsts: headerOptions.hsts,
            noSniff: headerOptions.noSniff,
            frameOptions: headerOptions.frameOptions,
            xssProtection: headerOptions.xssProtection,
            referrerPolicy: headerOptions.referrerPolicy,
            // Ajouter CSP uniquement s'il était défini
            ...(cspConfig ? { csp: cspConfig } : {})
        };

        // Passer l'objet correctement structuré au middleware
        return new SecurityHeadersMiddleware(middlewareOptions);
    }

    /**
     * Crée un middleware de gestion des erreurs
     */
    public createErrorHandlerMiddleware(options?: Partial<ErrorHandlerConfig>): IMiddleware {
        const config: ErrorHandlerConfig = {
            includeErrorDetails: this.config.detailedErrors,
            includeStackTrace: process.env.NODE_ENV !== 'production',
            defaultStatusCode: 500,
            defaultErrorMessage: 'An error occurred',
            ...options
        };

        return new ErrorHandlerMiddleware(this.serviceProvider, config);
    }

    /**
     * Crée un middleware de détection d'intrusion
     */
    public createIntrusionDetectionMiddleware(options?: Partial<IntrusionDetectionConfig>): IMiddleware {
        if (!this.config.enableIntrusionDetection) {
            return {
                process: async (context: IAPIContext, next: NextFunction) => {
                    await next();
                }
            };
        }

        const intrusionConfig: IntrusionDetectionConfig = {
            enableSignatureDetection: true,
            enableAnomalyDetection: true,
            signatureDatabase: 'default',
            alertThreshold: 0.7,
            actions: ['log', 'block'],
            ...this.config.intrusionDetection,
            ...options
        };

        // Ici, nous utilisons effectivement la configuration
        return {
            process: async (context: IAPIContext, next: NextFunction) => {
                // Logique de détection d'intrusion qui utilise intrusionConfig
                if (intrusionConfig.enableSignatureDetection) {
                    // Simulation d'analyse de détection d'intrusion
                    const requestPath = context.request?.path || '';
                    if (requestPath.includes('..') && intrusionConfig.alertThreshold > 0.5) {
                        // Détection d'une possible tentative de path traversal
                        console.warn('Intrusion attempt detected!');
                    }
                }
                await next();
            }
        };
    }

    /**
     * Crée un middleware d'assainissement des données
     */
    public createDataSanitizationMiddleware(options?: Partial<DataSanitizationConfig>): IMiddleware {
        if (!this.config.enableDataSanitization) {
            return {
                process: async (context: IAPIContext, next: NextFunction) => {
                    await next();
                }
            };
        }

        const sanitizationConfig: DataSanitizationConfig = {
            enableHtmlSanitization: true,
            enableSqlSanitization: true,
            strictMode: true,
            ...this.config.dataSanitization,
            ...options
        };

        // Ici, nous utilisons effectivement la configuration
        return {
            process: async (context: IAPIContext, next: NextFunction) => {
                // Logique d'assainissement des données qui utiliserait sanitizationConfig
                if (context.request?.body && sanitizationConfig.enableHtmlSanitization) {
                    // Exemple de logique d'assainissement (simplifié)
                    const body = context.request.body;
                    if (typeof body === 'object') {
                        Object.keys(body).forEach(key => {
                            if (typeof body[key] === 'string') {
                                // Assainir les valeurs de chaîne (exemple simplifié)
                                body[key] = (body[key] as string)
                                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                    .replace(/javascript:/gi, 'disabled-javascript:');
                            }
                        });
                    }
                }
                await next();
            }
        };
    }

    /**
     * Crée une chaîne de middleware qui implémente IMiddlewareChain
     */
    public createBaseChain(): IMiddlewareChain {
        // Créer un proxy pour adapter SecurityMiddlewareChain à IMiddlewareChain
        class MiddlewareChainAdapter implements IMiddlewareChain {
            private baseChain: SecurityMiddlewareChain;

            constructor(name: string) {
                this.baseChain = new SecurityMiddlewareChain(name);
            }

            async process(context: IAPIContext, next: NextFunction): Promise<void> {
                await this.baseChain.process(context, next);
            }

            async processAsync(context: IAPIContext): Promise<void> {
                // Implémentation de la méthode manquante
                await this.baseChain.process(context, async () => {
                    // Fonction next vide pour terminer la chaîne
                });
            }

            use(middleware: IMiddleware): IMiddlewareChain {
                this.baseChain.use(middleware);
                return this;
            }

            useIf(condition: boolean, middleware: IMiddleware): IMiddlewareChain {
                if (condition) {
                    this.baseChain.use(middleware);
                }
                return this;
            }
        }

        // Créer l'adaptateur
        const chain = new MiddlewareChainAdapter("BaseSecurityChain");

        // Ajouter les middlewares de base dans l'ordre
        chain.use(this.createErrorHandlerMiddleware());
        chain.use(new RequestIdMiddleware());

        return chain;
    }

    /**
     * Crée une chaîne complète de middlewares de sécurité
     */
    public createFullChain(): IMiddlewareChain {
        const chain = this.createBaseChain();

        // Ajouter tous les middlewares disponibles
        if (this.config.enableRateLimiting) {
            chain.use(this.createRateLimitingMiddleware());
        }

        if (this.config.validateTokens) {
            chain.use(this.createAuthenticationMiddleware());
        }

        if (this.config.enableSecurityHeaders !== false) {
            chain.use(this.createSecurityHeadersMiddleware());
        }

        if (this.config.enableIntrusionDetection) {
            chain.use(this.createIntrusionDetectionMiddleware());
        }

        if (this.config.enableDataSanitization) {
            chain.use(this.createDataSanitizationMiddleware());
        }

        // Ajouter les autres middlewares selon la configuration

        return chain;
    }

    /**
     * Crée une chaîne de middlewares personnalisée selon la configuration fournie
     */
    public createCustomChain(config: MiddlewareChainConfig): IMiddlewareChain {
        // Créer un proxy pour adapter SecurityMiddlewareChain à IMiddlewareChain
        class MiddlewareChainAdapter implements IMiddlewareChain {
            private baseChain: SecurityMiddlewareChain;

            constructor(name: string) {
                this.baseChain = new SecurityMiddlewareChain(name);
            }

            async process(context: IAPIContext, next: NextFunction): Promise<void> {
                await this.baseChain.process(context, next);
            }

            async processAsync(context: IAPIContext): Promise<void> {
                // Implémentation de la méthode manquante
                await this.baseChain.process(context, async () => {
                    // Fonction next vide pour terminer la chaîne
                });
            }

            use(middleware: IMiddleware): IMiddlewareChain {
                this.baseChain.use(middleware);
                return this;
            }

            useIf(condition: boolean, middleware: IMiddleware): IMiddlewareChain {
                if (condition) {
                    this.baseChain.use(middleware);
                }
                return this;
            }
        }

        // Créer l'adaptateur avec le nom spécifié ou un nom par défaut
        const chain = new MiddlewareChainAdapter(
            config.chainName || 'CustomSecurityChain'
        );

        // Ajouter l'errorHandler en premier
        if (config.enableErrorHandler !== false) {
            chain.use(this.createErrorHandlerMiddleware());
        }

        // Ajouter le requestId
        if (config.enableRequestId !== false) {
            chain.use(new RequestIdMiddleware());
        }

        // Ajouter le rateLimiting si activé
        if (config.enableRateLimiting) {
            chain.use(this.createRateLimitingMiddleware());
        }

        // Ajouter l'authentication si activée
        if (config.enableAuthentication) {
            chain.use(this.createAuthenticationMiddleware());
        }

        // Ajouter les en-têtes de sécurité si activés
        if (config.enableSecurityHeaders) {
            chain.use(this.createSecurityHeadersMiddleware());
        }

        // Ajouter la détection d'intrusion si activée
        if (config.enableIntrusionDetection) {
            chain.use(this.createIntrusionDetectionMiddleware());
        }

        // Ajouter l'assainissement des données si activé
        if (config.enableDataSanitization) {
            chain.use(this.createDataSanitizationMiddleware());
        }

        // Ajouter les autres middlewares selon la configuration

        return chain;
    }
}

/**
 * Fonction utilitaire pour créer rapidement un middleware de sécurité avec les options par défaut
 */
export function createSecurityMiddleware(options?: SecurityMiddlewareFactoryOptions): IMiddleware {
    const factory = new SecurityMiddlewareFactory(options);
    return factory.createFullChain();
}