import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction, SecurityError } from '@api/core/middleware/types/middleware.types';
import { SecurityServiceKeys, IServiceProvider } from '../di/types';
import { Logger } from '@api/common/monitoring/LogService';
import { TokenValidationResult as SecurityTokenValidationResult, ClearanceLevel } from '@security/types/SecurityTypes';
import { TokenValidationResult as CoreTokenValidationResult } from '@api/core/types';

// Définir une constante pour la clé TOKEN_REFRESHER
export const TOKEN_REFRESHER_SERVICE_KEY = 'token_refresher';

/**
 * Interface pour le validateur de token
 */
export interface ITokenValidator {
    validate(token: string): Promise<SecurityTokenValidationResult>;
}

/**
 * Interface pour le rafraîchissement des tokens
 */
export interface ITokenRefresher {
    /**
     * Rafraîchit un token
     * @param tokenInfo Informations du token actuel
     * @returns Promesse résolue avec les nouvelles informations du token
     */
    refreshToken(tokenInfo: SecurityTokenValidationResult): Promise<SecurityTokenValidationResult>;
}

/**
 * Types d'authentification supportés
 */
export enum AuthScheme {
    JWT = 'Bearer',
    API_KEY = 'ApiKey',
    BASIC = 'Basic'
}

/**
 * Interface pour les règles d'authentification conditionnelles
 */
export interface AuthRule {
    /**
     * Condition pour appliquer la règle (motif de chemin, méthode HTTP, etc.)
     */
    condition: {
        path?: string | RegExp;
        method?: string | string[];
        headers?: Record<string, string | RegExp>;
    };

    /**
     * Action à prendre si la condition est remplie
     */
    action: 'require' | 'optional' | 'skip';

    /**
     * Schémas d'authentification acceptés pour cette règle
     */
    schemes?: AuthScheme[];

    /**
     * Priorité de la règle (les règles de priorité plus élevée sont évaluées en premier)
     */
    priority?: number;
}

/**
 * Options pour le middleware d'authentification
 */
export interface AuthenticationOptions {
    /**
     * Chemins publics qui ne nécessitent pas d'authentification
     */
    publicPaths?: string[];

    /**
     * Nom de l'en-tête contenant le token d'authentification
     */
    tokenHeaderName?: string;

    /**
     * Délai d'expiration pour la validation du token (en ms)
     */
    tokenValidationTimeout?: number;

    /**
     * Schémas d'authentification acceptés
     */
    supportedSchemes?: AuthScheme[];

    /**
     * Règles d'authentification conditionnelles
     */
    authRules?: AuthRule[];

    /**
     * Activer le rafraîchissement automatique des tokens
     */
    enableTokenRefresh?: boolean;

    /**
     * Seuil pour le rafraîchissement des tokens (en secondes avant expiration)
     */
    refreshThreshold?: number;
}

/**
 * Interface pour les objets contenant token et schéma
 */
export interface TokenSchemeInfo {
    token: string | undefined;
    scheme: string | undefined;
}

/**
 * Type pour les détails d'erreur sérialisables
 */
export interface ErrorDetails {
    [key: string]: unknown;
}

/**
 * Erreur d'authentification
 */
export class AuthenticationError extends Error implements SecurityError {
    public readonly code: string;
    public readonly statusCode: number = 401;
    public readonly severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    public readonly details: Record<string, unknown>;

    /**
     * Crée une nouvelle erreur d'authentification
     * @param code Code d'erreur
     * @param message Message d'erreur
     * @param details Détails supplémentaires
     */
    constructor(
        code: string = 'AUTHENTICATION_FAILED',
        message: string = 'Authentication failed',
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AuthenticationError';
        this.code = code;
        this.details = details || {}; // Initialiser avec un objet vide si undefined
    }

    /**
     * Retourne un message d'erreur sécurisé qui ne contient pas d'informations sensibles
     * @returns Message d'erreur sécurisé
     */
    public toSafeMessage(): string {
        // Retourner un message générique pour ne pas exposer d'informations sensibles
        return 'Authentication error occurred. Please check your credentials or try again later.';
    }
}

/**
 * Utilitaire pour convertir entre les différents types de TokenValidationResult
 */
export class TokenResultConverter {
    /**
     * Convertit un SecurityTokenValidationResult en CoreTokenValidationResult
     */
    public static toCoreResult(securityResult: SecurityTokenValidationResult): CoreTokenValidationResult {
        const now = new Date();

        return {
            valid: securityResult.valid,
            userId: securityResult.userId || '', // Garantir que userId est une chaîne non vide
            roles: securityResult.roles || [], // Utiliser un tableau vide si undefined
            permissions: securityResult.permissions || [], // Utiliser un tableau vide si undefined
            clearanceLevel: this.mapClearanceLevelToString(securityResult.clearanceLevel),
            expiresAt: securityResult.expiresAt || new Date(now.getTime() + 3600000), // Par défaut 1h
            issuedAt: securityResult.issuedAt || now, // Utiliser la date actuelle si undefined
            encryptionKey: securityResult.encryptionKey || '' // Ajouter encryptionKey requis par CoreTokenValidationResult
        };
    }

    /**
     * Convertit un clearanceLevel en chaîne de caractères
     */
    private static mapClearanceLevelToString(clearanceLevel: ClearanceLevel | undefined): string {
        if (typeof clearanceLevel === 'string') {
            return clearanceLevel;
        }
        // Si le clearanceLevel est undefined ou autre, retourner une valeur par défaut
        return 'public';
    }

    /**
     * Convertit un CoreTokenValidationResult en SecurityTokenValidationResult
     * Note: Utilisée uniquement quand on a besoin de retourner un SecurityTokenValidationResult 
     */
    public static toSecurityResult(coreResult: CoreTokenValidationResult): SecurityTokenValidationResult {
        // Utiliser une vérification de type plus sûre pour convertir le clearanceLevel
        let clearanceLevel: ClearanceLevel = 'public';

        if (
            coreResult.clearanceLevel === 'public' ||
            coreResult.clearanceLevel === 'internal' ||
            coreResult.clearanceLevel === 'confidential' ||
            coreResult.clearanceLevel === 'restricted' ||
            coreResult.clearanceLevel === 'secret'
        ) {
            clearanceLevel = coreResult.clearanceLevel as ClearanceLevel;
        }

        return {
            valid: coreResult.valid,
            userId: coreResult.userId,
            roles: coreResult.roles,
            permissions: coreResult.permissions,
            clearanceLevel: clearanceLevel,
            expiresAt: coreResult.expiresAt,
            issuedAt: coreResult.issuedAt,
            encryptionKey: coreResult.encryptionKey
        };
    }
}

/**
 * Middleware d'authentification qui vérifie les tokens
 */
export class AuthenticationMiddleware implements IMiddleware {
    private readonly logger: Logger;
    private readonly tokenValidator: ITokenValidator;
    private readonly tokenRefresher?: ITokenRefresher;
    private readonly publicPaths: string[];
    private readonly tokenHeaderName: string;
    private readonly validationTimeout: number;
    private readonly supportedSchemes: AuthScheme[];
    private readonly authRules: AuthRule[];
    private readonly enableTokenRefresh: boolean;
    private readonly refreshThreshold: number;

    // Cache pour la normalisation des en-têtes
    private readonly headerNamesCache: Map<string, string> = new Map();

    /**
     * Crée un nouveau middleware d'authentification
     * @param serviceProvider Fournisseur de services pour l'injection de dépendances
     * @param options Options de configuration
     */
    constructor(
        serviceProvider: IServiceProvider,
        options: AuthenticationOptions = {}
    ) {
        this.logger = new Logger('AuthenticationMiddleware');
        this.tokenValidator = serviceProvider.get<ITokenValidator>(SecurityServiceKeys.TOKEN_VALIDATOR);

        // Initialisation des options avec valeurs par défaut
        this.publicPaths = options.publicPaths || [];
        this.tokenHeaderName = options.tokenHeaderName || 'Authorization';
        this.validationTimeout = options.tokenValidationTimeout || 5000; // 5 secondes par défaut
        this.supportedSchemes = options.supportedSchemes || [AuthScheme.JWT];
        this.authRules = (options.authRules || []).sort((a, b) =>
            (b.priority || 0) - (a.priority || 0)
        );
        this.enableTokenRefresh = options.enableTokenRefresh || false;
        this.refreshThreshold = options.refreshThreshold || 300; // 5 minutes par défaut

        // Initialiser le rafraîchisseur de tokens si nécessaire
        if (this.enableTokenRefresh && serviceProvider.has(TOKEN_REFRESHER_SERVICE_KEY)) {
            this.tokenRefresher = serviceProvider.get<ITokenRefresher>(TOKEN_REFRESHER_SERVICE_KEY);
        }
    }

    /**
     * Vérifie l'authentification de la requête
     * @param context Contexte de la requête API
     * @param next Fonction middleware suivante
     */
    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // S'assurer que context.request existe et a les propriétés nécessaires
            if (!context.request) {
                context.request = { path: '', method: '', headers: {} };
            }

            if (!context.request.path) {
                context.request.path = '';
            }

            if (!context.request.method) {
                context.request.method = '';
            }

            if (!context.request.headers) {
                context.request.headers = {};
            }

            // Vérifier les règles d'authentification pour cette requête
            const authAction = this.evaluateAuthRules(context);

            if (authAction === 'skip' || this.isPublicPath(context.request.path)) {
                this.logger.debug(`Skipping authentication for path: ${context.request.path}`);
                return await next();
            }

            // Récupérer le token d'authentification
            const { token, scheme } = this.extractTokenAndScheme(context);

            // Si aucun token n'est fourni
            if (!token) {
                if (authAction === 'optional') {
                    // Si l'authentification est optionnelle, continuer sans token
                    this.logger.debug(`Optional authentication for ${context.request.path}, continuing without token`);
                    return await next();
                }

                throw new AuthenticationError(
                    'MISSING_TOKEN',
                    'Authentication token is required',
                    { path: context.request.path }
                );
            }

            // Vérifier si le schéma d'authentification est supporté
            if (scheme && !this.supportedSchemes.includes(scheme as AuthScheme)) {
                throw new AuthenticationError(
                    'UNSUPPORTED_AUTH_SCHEME',
                    `Authentication scheme '${scheme}' is not supported`,
                    { supportedSchemes: this.supportedSchemes }
                );
            }

            try {
                // Valider le token avec timeout
                const securityTokenInfo = await this.validateTokenWithTimeout(token);

                // Convertir le résultat au format attendu par le core
                const coreTokenInfo = TokenResultConverter.toCoreResult(securityTokenInfo);

                // Assurer que le contexte de sécurité existe
                if (!context.security) {
                    context.security = {};
                }

                // Stocker les informations du token dans le contexte
                context.security.tokenInfo = coreTokenInfo;

                // Si le token est invalide, rejeter la requête
                if (!coreTokenInfo.valid) {
                    throw new AuthenticationError(
                        'INVALID_TOKEN',
                        'Invalid authentication token',
                        {
                            valid: coreTokenInfo.valid,
                            expiresAt: coreTokenInfo.expiresAt
                        }
                    );
                }

                // Si l'utilisateur n'est pas défini, définir l'ID utilisateur à partir du token
                if (!context.request.userId && coreTokenInfo.userId) {
                    context.request.userId = coreTokenInfo.userId;
                }

                // Vérifier si le token doit être rafraîchi
                if (this.enableTokenRefresh && this.tokenRefresher && this.shouldRefreshToken(securityTokenInfo)) {
                    this.logger.debug('Token is about to expire, refreshing...');
                    // Passer un token security à la méthode de rafraîchissement
                    this.refreshToken(securityTokenInfo, context);
                }

                // Continuer le traitement
                await next();
            } catch (validationError) {
                // Transformer l'erreur de validation en erreur d'authentification
                if (validationError instanceof Error && validationError.message === 'VALIDATION_TIMEOUT') {
                    throw new AuthenticationError(
                        'TOKEN_VALIDATION_TIMEOUT',
                        'Token validation timed out',
                        { timeout: this.validationTimeout }
                    );
                }

                const message = validationError instanceof Error
                    ? validationError.message
                    : 'Token validation failed';

                // Créer des détails d'erreur sérialisables
                const errorDetails: ErrorDetails = {};
                if (validationError instanceof Error) {
                    errorDetails.errorMessage = validationError.message;
                    errorDetails.errorName = validationError.name;
                    if (validationError.stack) {
                        errorDetails.errorStack = validationError.stack;
                    }
                } else {
                    errorDetails.originalError = String(validationError);
                }

                throw new AuthenticationError(
                    'TOKEN_VALIDATION_FAILED',
                    message,
                    errorDetails
                );
            }
        } catch (error) {
            // Si l'erreur est une erreur d'authentification, la propager
            if (error instanceof AuthenticationError) {
                throw error;
            }

            // Sinon, journaliser l'erreur et la transformer en AuthenticationError
            this.logger.error('Error in authentication middleware', error);

            const errorDetails: ErrorDetails = {};
            if (error instanceof Error) {
                errorDetails.errorMessage = error.message;
                errorDetails.errorName = error.name;
                if (error.stack) {
                    errorDetails.errorStack = error.stack;
                }
            } else {
                errorDetails.originalError = String(error);
            }

            throw new AuthenticationError(
                'AUTHENTICATION_ERROR',
                error instanceof Error ? error.message : 'Unknown authentication error',
                errorDetails
            );
        }
    }

    /**
     * Extrait le token et le schéma d'authentification des en-têtes de la requête
     * @param context Contexte de la requête API
     * @returns Objet contenant le token et le schéma, ou undefined si aucun token n'est trouvé
     */
    private extractTokenAndScheme(context: IAPIContext): TokenSchemeInfo {
        const authHeader = this.getNormalizedHeader(context, this.tokenHeaderName);

        if (!authHeader) {
            return {
                token: undefined,
                scheme: undefined
            };
        }

        // Format: <scheme> <token>
        const parts = authHeader.split(' ');
        if (parts.length === 2) {
            return {
                token: parts[1],
                scheme: parts[0]
            };
        }

        // Format: <token> (schéma par défaut assumé comme Bearer)
        return {
            token: authHeader,
            scheme: AuthScheme.JWT
        };
    }

    /**
     * Obtient un en-tête normalisé en tenant compte des différentes casses possibles
     * @param context Contexte de la requête API
     * @param headerName Nom de l'en-tête à récupérer
     * @returns Valeur de l'en-tête ou undefined si non trouvé
     */
    private getNormalizedHeader(context: IAPIContext, headerName: string): string | undefined {
        // S'assurer que les en-têtes existent
        if (!context.request || !context.request.headers) {
            return undefined;
        }

        // Vérifier d'abord dans le cache
        if (this.headerNamesCache.has(headerName)) {
            const cachedName = this.headerNamesCache.get(headerName);
            return cachedName ? context.request.headers[cachedName] : undefined;
        }

        // Normaliser le nom de l'en-tête (HTTP/2 utilise des en-têtes en minuscules)
        const headerNameLower = headerName.toLowerCase();
        const headerNameDashed = headerNameLower.replace(/_/g, '-');
        const headerNameUnderscored = headerNameLower.replace(/-/g, '_');

        // Chercher en utilisant différentes variations du nom
        const variations = [
            headerName,
            headerNameLower,
            headerNameDashed,
            headerNameUnderscored,
            headerName.toUpperCase()
        ];

        for (const variant of variations) {
            if (variant in context.request.headers) {
                // Mettre en cache la correspondance trouvée
                this.headerNamesCache.set(headerName, variant);
                return context.request.headers[variant];
            }
        }

        return undefined;
    }

    /**
     * Vérifie si un chemin est public
     * @param path Chemin à vérifier
     * @returns true si le chemin est public
     */
    private isPublicPath(path: string): boolean {
        return this.publicPaths.some(publicPath => {
            // Correspondance exacte
            if (publicPath === path) {
                return true;
            }

            // Correspondance avec joker
            if (publicPath.endsWith('*')) {
                const prefix = publicPath.slice(0, -1);
                return path.startsWith(prefix);
            }

            return false;
        });
    }

    /**
     * Valide un token avec un délai d'expiration
     * @param token Token à valider
     * @returns Résultat de la validation
     */
    private async validateTokenWithTimeout(token: string): Promise<SecurityTokenValidationResult> {
        // Créer une promesse qui se résout après le délai d'attente
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('VALIDATION_TIMEOUT'));
            }, this.validationTimeout);
        });

        // Validation du token
        const validationPromise = this.tokenValidator.validate(token);

        // Utiliser celle qui se termine en premier
        return Promise.race([validationPromise, timeoutPromise]);
    }

    /**
     * Évalue les règles d'authentification pour déterminer l'action à prendre
     * @param context Contexte de la requête API
     * @returns Action d'authentification à prendre ('require', 'optional' ou 'skip')
     */
    private evaluateAuthRules(context: IAPIContext): 'require' | 'optional' | 'skip' {
        // Si aucune règle n'est définie, l'authentification est requise par défaut
        if (this.authRules.length === 0) {
            return 'require';
        }

        // Évaluer les règles par ordre de priorité
        for (const rule of this.authRules) {
            if (this.matchesRule(context, rule)) {
                return rule.action;
            }
        }

        // Par défaut, l'authentification est requise
        return 'require';
    }

    /**
     * Vérifie si une requête correspond à une règle
     * @param context Contexte de la requête API
     * @param rule Règle à vérifier
     * @returns true si la requête correspond à la règle
     */
    private matchesRule(context: IAPIContext, rule: AuthRule): boolean {
        const { path, method, headers } = rule.condition;

        // Vérifier le chemin
        if (path && context.request.path) {
            if (typeof path === 'string') {
                if (path.endsWith('*')) {
                    const prefix = path.slice(0, -1);
                    if (!context.request.path.startsWith(prefix)) {
                        return false;
                    }
                } else if (path !== context.request.path) {
                    return false;
                }
            } else if (path instanceof RegExp) {
                if (!path.test(context.request.path)) {
                    return false;
                }
            }
        }

        // Vérifier la méthode HTTP
        if (method && context.request.method) {
            const requestMethod = context.request.method.toUpperCase();
            if (Array.isArray(method)) {
                if (!method.includes(requestMethod)) {
                    return false;
                }
            } else if (method !== requestMethod) {
                return false;
            }
        }

        // Vérifier les en-têtes
        if (headers) {
            for (const [headerName, headerValue] of Object.entries(headers)) {
                const actualValue = this.getNormalizedHeader(context, headerName);

                if (!actualValue) {
                    return false;
                }

                if (typeof headerValue === 'string') {
                    if (headerValue !== actualValue) {
                        return false;
                    }
                } else if (headerValue instanceof RegExp) {
                    if (!headerValue.test(actualValue)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Vérifie si un token doit être rafraîchi
     * @param tokenInfo Informations du token
     * @returns true si le token doit être rafraîchi
     */
    private shouldRefreshToken(tokenInfo: SecurityTokenValidationResult): boolean {
        if (!tokenInfo.expiresAt) {
            return false;
        }

        const expiresAt = new Date(tokenInfo.expiresAt).getTime();
        const now = Date.now();
        const thresholdMs = this.refreshThreshold * 1000;

        return (expiresAt - now) <= thresholdMs;
    }

    /**
     * Rafraîchit un token
     * @param tokenInfo Informations du token
     * @param context Contexte de la requête API
     */
    private refreshToken(tokenInfo: SecurityTokenValidationResult, context: IAPIContext): void {
        if (!this.tokenRefresher) {
            return;
        }

        // Lancer le rafraîchissement en arrière-plan (ne pas attendre)
        this.tokenRefresher.refreshToken(tokenInfo)
            .then((newTokenInfo: SecurityTokenValidationResult) => {
                if (!context.security) {
                    context.security = {};
                }

                // Convertir au format attendu par le core
                const coreFriendlyInfo = TokenResultConverter.toCoreResult(newTokenInfo);

                // Mettre à jour les informations du token
                context.security.tokenInfo = coreFriendlyInfo;

                // Ajouter l'en-tête pour indiquer au client qu'un nouveau token est disponible
                if (context.response && context.response.headers) {
                    // Ici nous n'avons pas accès direct au token, donc nous utilisons un en-tête différent
                    context.response.headers['X-Auth-Token-Refreshed'] = 'true';
                }

                this.logger.debug('Token refreshed successfully');
            })
            .catch((error: Error) => {
                // Créer des détails d'erreur sérialisables
                const errorDetails: ErrorDetails = {
                    errorMessage: error.message,
                    errorName: error.name
                };

                this.logger.warn('Failed to refresh token', errorDetails);
            });
    }
}