// src/ai/api/core/middleware/RateLimitingMiddleware.ts
import { AbstractMiddleware } from './AbstractMiddleware';
import { IAPIContext, NextFunction } from '@api/core/types';
import { IRateLimiter } from './interfaces';
// Importer SecurityError depuis le bon emplacement
import { SecurityError } from '@ai/errors/ErrorTypes';

/**
 * Options pour le middleware de limitation de débit
 */
export interface RateLimitingOptions {
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
     * Nombre maximum de requêtes par fenêtre de temps
     * @default 100
     */
    defaultLimit?: number;

    /**
     * Durée de la fenêtre de temps en millisecondes
     * @default 60000 (1 minute)
     */
    windowMs?: number;

    /**
     * Limites spécifiques par chemin (clé = regex pattern, valeur = limite)
     */
    pathLimits?: Record<string, number>;

    /**
     * En-tête HTTP pour indiquer la limite de requêtes
     * @default 'X-RateLimit-Limit'
     */
    limitHeader?: string;

    /**
     * En-tête HTTP pour indiquer le nombre de requêtes restantes
     * @default 'X-RateLimit-Remaining'
     */
    remainingHeader?: string;

    /**
     * En-tête HTTP pour indiquer le moment de réinitialisation
     * @default 'X-RateLimit-Reset'
     */
    resetHeader?: string;

    /**
     * Détermine si des chemins sont exemptés de la limitation
     * @default []
     */
    exemptPaths?: string[];

    /**
     * Définit si on utilise l'adresse IP comme identifiant client par défaut
     * @default true
     */
    useIpAsClientId?: boolean;

    /**
     * Ordre de priorité des identifiants client
     * @default ['userId', 'clientId', 'ip']
     */
    clientIdPriority?: string[];
}

/**
 * Middleware qui limite le nombre de requêtes qu'un client peut effectuer
 * dans une période donnée.
 */
export class RateLimitingMiddleware extends AbstractMiddleware<RateLimitingOptions> {
    private readonly rateLimiter: IRateLimiter;

    /**
     * Crée une nouvelle instance du middleware
     * @param rateLimiter Service de limitation de débit
     * @param options Options de configuration
     */
    constructor(rateLimiter: IRateLimiter, options: Partial<RateLimitingOptions> = {}) {
        // Options par défaut
        const defaultOptions: RateLimitingOptions = {
            enabled: true,
            logLevel: 'info',
            defaultLimit: 100,
            windowMs: 60000, // 1 minute
            pathLimits: {},
            limitHeader: 'X-RateLimit-Limit',
            remainingHeader: 'X-RateLimit-Remaining',
            resetHeader: 'X-RateLimit-Reset',
            exemptPaths: [],
            useIpAsClientId: true,
            clientIdPriority: ['userId', 'clientId', 'ip']
        };

        super('RateLimitingMiddleware', defaultOptions, options);

        // Stocker le service de limitation
        this.rateLimiter = rateLimiter;
    }

    /**
     * Vérifie que le client n'a pas dépassé sa limite de requêtes
     * @param context Contexte de la requête API
     * @param next Fonction à appeler pour passer au middleware suivant
     */
    protected async processInternal(context: IAPIContext, next: NextFunction): Promise<void> {
        // Récupérer le chemin de la requête avec une valeur par défaut
        const requestPath = context.request.path || '/';

        // Vérifier si le chemin est exempté
        if (this.isPathExempt(requestPath)) {
            this.logger.debug(`Path ${requestPath} is exempt from rate limiting`);
            await next();
            return;
        }

        // Déterminer l'identifiant client
        const clientId = this.getClientId(context);

        // Déterminer la limite applicable pour ce chemin - utilisé pour les en-têtes
        const requestLimit = this.getLimitForPath(requestPath);

        // Vérifier si le client a dépassé sa limite
        const isAllowed = await this.rateLimiter.isAllowed(clientId, requestPath);

        if (!isAllowed) {
            this.logger.warn(`Rate limit exceeded for client ${clientId} on path ${requestPath}`);

            // Enregistrer quand même la requête pour les statistiques
            await this.rateLimiter.recordRequest(clientId, requestPath);

            // Créer une erreur de sécurité adaptée au constructeur existant
            const errorMessage = `Rate limit exceeded for ${requestPath}, please try again later`;
            throw new SecurityError(errorMessage);
        }

        // Si autorisé, enregistrer la requête et continuer
        await this.rateLimiter.recordRequest(clientId, requestPath);

        // Ajouter des en-têtes informatifs si la réponse existe déjà
        if (context.response) {
            this.addRateLimitHeaders(context, requestLimit);
        }

        // Passer au middleware suivant
        await next();

        // Ajouter des en-têtes informatifs à la réponse après traitement
        if (context.response) {
            this.addRateLimitHeaders(context, requestLimit);
        }
    }

    /**
     * Détermine l'identifiant client basé sur les priorités configurées
     * @param context Contexte de la requête API
     * @returns Identifiant client
     */
    private getClientId(context: IAPIContext): string {
        // S'assurer que l'objet headers existe
        if (!context.request.headers) {
            context.request.headers = {};
        }

        // Parcourir les sources d'identifiant dans l'ordre de priorité
        for (const source of this.options.clientIdPriority || []) {
            switch (source) {
                case 'userId':
                    // Utiliser l'ID utilisateur du token s'il existe
                    if (context.security?.tokenInfo?.userId) {
                        return context.security.tokenInfo.userId;
                    }
                    // Utiliser l'ID utilisateur de la requête s'il existe
                    if (context.request.userId) {
                        return context.request.userId;
                    }
                    break;

                case 'clientId':
                    // Utiliser l'en-tête X-Client-ID s'il existe
                    const clientId = context.request.headers['x-client-id'];
                    if (clientId) {
                        return clientId;
                    }
                    break;

                case 'ip':
                    // Utiliser l'adresse IP s'il existe
                    if (context.request.ip) {
                        return context.request.ip;
                    }
                    break;
            }
        }

        // Fallback: générer un identifiant anonyme
        return 'anonymous-' + Math.floor(Math.random() * 1000000);
    }

    /**
     * Vérifie si un chemin est exempté de la limitation
     * @param path Chemin à vérifier
     * @returns true si le chemin est exempté
     */
    private isPathExempt(path: string): boolean {
        const exemptPaths = this.options.exemptPaths || [];

        return exemptPaths.some(exemptPath => {
            // Correspondance exacte
            if (exemptPath === path) {
                return true;
            }

            // Correspondance par expression régulière
            if (exemptPath.includes('*')) {
                const regexPattern = exemptPath
                    .replace(/\./g, '\\.')  // Échapper les points
                    .replace(/\*/g, '.*');  // Remplacer * par .*

                const regex = new RegExp(`^${regexPattern}$`);
                return regex.test(path);
            }

            return false;
        });
    }

    /**
     * Détermine la limite applicable pour un chemin
     * @param path Chemin de la requête
     * @returns Limite applicable
     */
    private getLimitForPath(path: string): number {
        const pathLimits = this.options.pathLimits || {};
        const defaultLimit = this.options.defaultLimit || 100;

        // Chercher une correspondance dans les limites par chemin
        for (const pattern in pathLimits) {
            const regexPattern = pattern
                .replace(/\./g, '\\.')  // Échapper les points
                .replace(/\*/g, '.*');  // Remplacer * par .*

            const regex = new RegExp(`^${regexPattern}$`);
            if (regex.test(path)) {
                return pathLimits[pattern];
            }
        }

        // Aucune correspondance, utiliser la limite par défaut
        return defaultLimit;
    }

    /**
     * Ajoute les en-têtes informatifs sur la limitation de débit
     * @param context Contexte de la requête API
     * @param limit Limite applicable pour ce chemin
     */
    private addRateLimitHeaders(context: IAPIContext, limit: number): void {
        if (!context.response || !context.response.headers) {
            return;
        }

        // Note: ces valeurs sont fictives, dans un système réel elles seraient
        // obtenues à partir du système de rate-limiting
        const remaining = Math.max(0, limit - 1);
        const reset = Math.floor(Date.now() / 1000) + (this.options.windowMs ?? 60000) / 1000;

        // Récupérer les noms d'en-têtes avec valeurs par défaut
        const limitHeader = this.options.limitHeader || 'X-RateLimit-Limit';
        const remainingHeader = this.options.remainingHeader || 'X-RateLimit-Remaining';
        const resetHeader = this.options.resetHeader || 'X-RateLimit-Reset';

        context.response.headers[limitHeader] = String(limit);
        context.response.headers[remainingHeader] = String(remaining);
        context.response.headers[resetHeader] = String(reset);
    }
}

/**
 * Factory pour créer une instance de RateLimitingMiddleware
 */
export class RateLimitingMiddlewareFactory {
    /**
     * Crée une instance de RateLimitingMiddleware avec les options spécifiées
     * @param rateLimiter Service de limitation de débit
     * @param options Options de configuration
     * @returns Instance de RateLimitingMiddleware
     */
    public static create(
        rateLimiter: IRateLimiter,
        options: Partial<RateLimitingOptions> = {}
    ): RateLimitingMiddleware {
        return new RateLimitingMiddleware(rateLimiter, options);
    }
}