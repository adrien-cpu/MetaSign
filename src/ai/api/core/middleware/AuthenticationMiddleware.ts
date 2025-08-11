// src/ai/api/core/middleware/AuthenticationMiddleware.ts
import { AbstractMiddleware } from './AbstractMiddleware';
import { IJWTService, ITokenValidator } from './interfaces';
// Importer SecurityError depuis le bon chemin
import { SecurityError } from '@ai/errors/ErrorTypes';
import { IAPIContext, NextFunction } from '@api/core/types';

/**
 * Options pour le middleware d'authentification
 */
export interface AuthenticationOptions {
    /**
     * Indique si le middleware est actif
     * @default true
     */
    enabled?: boolean;

    /**
     * Niveau de journalisation
     * @default 'info'
     */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';

    /**
     * Schémas d'authentification acceptés 
     * @default ['Bearer']
     */
    authSchemes?: string[];

    /**
     * Nom de l'en-tête d'authentification 
     * @default 'Authorization'
     */
    authHeader?: string;

    /**
     * Chemins qui ne nécessitent pas d'authentification 
     * @default []
     */
    publicPaths?: string[];

    /**
     * Indique si l'authentification est strictement requise 
     * @default true
     */
    requireAuth?: boolean;

    /**
     * Paramètre de requête alternatif pour le token
     * Permet d'utiliser ?token=xyz dans l'URL
     * @default ''
     */
    tokenQueryParam?: string;

    /**
     * Flag pour activer l'extraction du token JWT des cookies
     * @default false
     */
    allowCookieToken?: boolean;

    /**
     * Nom du cookie contenant le token JWT
     * @default 'access_token'
     */
    cookieName?: string;
}

/**
 * Middleware qui gère l'authentification des requêtes en validant
 * les tokens JWT.
 */
export class AuthenticationMiddleware extends AbstractMiddleware<AuthenticationOptions> {
    private readonly tokenValidator: ITokenValidator;
    private readonly jwtService: IJWTService;

    /**
     * Crée une nouvelle instance du middleware
     * @param tokenValidator Service de validation des tokens
     * @param jwtService Service JWT
     * @param options Options de configuration
     */
    constructor(
        tokenValidator: ITokenValidator,
        jwtService: IJWTService,
        options: Partial<AuthenticationOptions> = {}
    ) {
        // Options par défaut
        const defaultOptions: AuthenticationOptions = {
            enabled: true,
            logLevel: 'info',
            authSchemes: ['Bearer'],
            authHeader: 'Authorization',
            publicPaths: [],
            requireAuth: true,
            tokenQueryParam: '',
            allowCookieToken: false,
            cookieName: 'access_token'
        };

        super('AuthenticationMiddleware', defaultOptions, options);

        this.tokenValidator = tokenValidator;
        this.jwtService = jwtService;
    }

    /**
    * Valide le token d'authentification s'il est présent
    * @param context Contexte de la requête API
    * @param next Fonction à appeler pour passer au middleware suivant
    */
    protected async processInternal(context: IAPIContext, next: NextFunction): Promise<void> {
        // Récupérer le chemin avec une valeur par défaut
        const requestPath = context.request.path || '/';

        // Vérifier si le chemin est public (ne nécessite pas d'authentification)
        if (this.isPublicPath(requestPath)) {
            this.logger.debug(`Path ${requestPath} is public, skipping authentication`);
            await next();
            return;
        }

        // Extraire le token des différentes sources possibles
        const token = this.extractToken(context);

        // Si le token est absent mais l'authentification est requise
        if (!token && this.options.requireAuth) {
            this.logger.warn(`Authentication required for path ${requestPath} but no token found`);
            throw new SecurityError('Authentication required');
        }

        // Si le token est présent, le valider
        if (token) {
            try {
                const validationResult = await this.tokenValidator.validate(token);

                // Si le token est invalide
                if (!validationResult.valid) {
                    this.logger.warn('Invalid token', { token: token.substring(0, 10) + '...' });
                    throw new SecurityError('Invalid authentication token');
                }

                // Token valide, stocker les informations dans le contexte
                if (!context.security) {
                    context.security = {};
                }
                context.security.tokenInfo = validationResult;

                // Mettre à jour l'ID utilisateur dans la requête pour la cohérence
                if (validationResult.userId) {
                    context.request.userId = validationResult.userId;
                }

                this.logger.debug('Authentication successful', {
                    userId: validationResult.userId,
                    roles: validationResult.roles
                });
            } catch (error) {
                if (error instanceof SecurityError) {
                    throw error;
                }

                this.logger.error('Error validating token:', error);
                throw new SecurityError('Authentication failed');
            }
        } else {
            this.logger.debug('No token found, but authentication is not required');
        }

        // Passer au middleware suivant
        await next();
    }

    /**
     * Vérifie si un chemin est public (ne nécessite pas d'authentification)
     * @param path Chemin à vérifier
     * @returns true si le chemin est public
     */
    private isPublicPath(path: string): boolean {
        const publicPaths = this.options.publicPaths || [];

        return publicPaths.some(publicPath => {
            // Correspondance exacte
            if (publicPath === path) {
                return true;
            }

            // Correspondance par expression régulière
            if (publicPath.includes('*')) {
                const regexPattern = publicPath
                    .replace(/\./g, '\\.')  // Échapper les points
                    .replace(/\*/g, '.*');  // Remplacer * par .*

                const regex = new RegExp(`^${regexPattern}$`);
                return regex.test(path);
            }

            return false;
        });
    }

    /**
     * Extrait le token JWT des différentes sources possibles
     * @param context Contexte de la requête API
     * @returns Token JWT ou undefined si absent
     */
    private extractToken(context: IAPIContext): string | undefined {
        // S'assurer que les en-têtes existent
        if (!context.request.headers) {
            context.request.headers = {};
        }

        const authHeader = this.options.authHeader || 'Authorization';
        const authHeaderValue = context.request.headers[authHeader.toLowerCase()];

        // Extraire le token de l'en-tête d'autorisation
        if (authHeaderValue) {
            const authSchemes = this.options.authSchemes || ['Bearer'];

            // Vérifier chaque schéma d'authentification
            for (const scheme of authSchemes) {
                if (authHeaderValue.startsWith(`${scheme} `)) {
                    return authHeaderValue.slice(scheme.length + 1);
                }
            }

            // Si aucun schéma n'est requis, retourner la valeur directement
            if (authSchemes.includes('')) {
                return authHeaderValue;
            }
        }

        // Extraire le token du paramètre de requête
        const tokenParam = this.options.tokenQueryParam;
        if (tokenParam && context.request.query && context.request.query[tokenParam]) {
            return context.request.query[tokenParam] as string;
        }

        // Extraire le token du cookie
        if (this.options.allowCookieToken) {
            const cookieName = this.options.cookieName || 'access_token';
            const cookieString = context.request.headers.cookie || '';
            const cookies = this.parseCookies(cookieString);

            if (cookies[cookieName]) {
                return cookies[cookieName];
            }
        }

        // Aucun token trouvé
        return undefined;
    }

    /**
     * Parse la chaîne de cookies en objet
     * @param cookieString Chaîne de cookies
     * @returns Objet avec les cookies
     */
    private parseCookies(cookieString: string): Record<string, string> {
        const cookies: Record<string, string> = {};

        if (!cookieString) {
            return cookies;
        }

        cookieString.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                cookies[name] = value;
            }
        });

        return cookies;
    }
}

/**
 * Factory pour créer une instance de AuthenticationMiddleware
 */
export class AuthenticationMiddlewareFactory {
    /**
     * Crée une instance de AuthenticationMiddleware avec les options spécifiées
     * @param tokenValidator Service de validation des tokens
     * @param jwtService Service JWT
     * @param options Options de configuration
     * @returns Instance de AuthenticationMiddleware
     */
    public static create(
        tokenValidator: ITokenValidator,
        jwtService: IJWTService,
        options: Partial<AuthenticationOptions> = {}
    ): AuthenticationMiddleware {
        return new AuthenticationMiddleware(tokenValidator, jwtService, options);
    }
}