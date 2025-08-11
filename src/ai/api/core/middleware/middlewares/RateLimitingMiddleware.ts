import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction, SecurityError } from '../types/middleware.types';
import { SecurityServiceKeys } from '../di/types';
import { IServiceProvider } from '../di/types';
import { IRateLimiter } from '../interfaces';
import { Logger } from '@api/common/monitoring/LogService';

/**
 * Erreur de dépassement de limite de débit
 */
export class RateLimitExceededError extends Error implements SecurityError {
    public readonly code: string = 'RATE_LIMIT_EXCEEDED';
    public readonly statusCode: number = 429;
    public readonly severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    public readonly details: Record<string, unknown>;

    constructor(message: string = 'Rate limit exceeded', details?: Record<string, unknown>) {
        super(message);
        this.name = 'RateLimitExceededError';
        this.details = details || {};
    }

    // Ajout de la méthode manquante requise par l'interface SecurityError
    public toSafeMessage(): string {
        return 'Too many requests, please try again later';
    }
}

/**
 * Middleware de limitation de débit qui permet de limiter le nombre de requêtes
 * qu'un client peut effectuer dans un intervalle de temps donné
 */
export class RateLimitingMiddleware implements IMiddleware {
    private readonly logger: Logger;
    private readonly rateLimiter: IRateLimiter;
    private readonly defaultLimit: number;
    private readonly windowMs: number;
    // Correction: Explicitement déclarer que pathLimits peut être undefined
    private readonly pathLimits: Record<string, number> | undefined;

    /**
     * Crée un nouveau middleware de limitation de débit
     * @param serviceProvider Fournisseur de services pour l'injection de dépendances
     * @param options Options de configuration
     */
    constructor(
        serviceProvider: IServiceProvider,
        options: {
            defaultLimit?: number;
            windowMs?: number;
            pathLimits?: Record<string, number>;
        } = {}
    ) {
        this.logger = new Logger('RateLimitingMiddleware');
        this.rateLimiter = serviceProvider.get<IRateLimiter>(SecurityServiceKeys.RATE_LIMITER);
        this.defaultLimit = options.defaultLimit || 100;
        this.windowMs = options.windowMs || 60000; // 1 minute par défaut
        this.pathLimits = options.pathLimits;
    }

    /**
     * Vérifie si la requête dépasse la limite de débit
     * @param context Contexte de la requête API
     * @param next Fonction middleware suivante
     */
    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // Identifier le client par son ID utilisateur, son IP ou une valeur par défaut
            const clientId = context.request.userId || context.request.ip || 'anonymous';

            // Récupérer le chemin de la requête avec valeur par défaut
            const path = context.request.path || '/';

            // Déterminer la limite applicable pour ce chemin
            const limit = this.getPathLimit(path);

            // Assurer qu'on passe un string au rateLimiter
            const isAllowed = await this.rateLimiter.isAllowed(clientId, path);

            // Si la requête dépasse la limite, lancer une erreur
            if (!isAllowed) {
                // Déterminer quand le client pourra à nouveau faire des requêtes
                const retryAfter = Math.ceil(this.windowMs / 1000);

                // Ajouter les en-têtes de limitation de débit
                this.addRateLimitHeaders(context, limit, 0, retryAfter);

                // Lancer une erreur de dépassement de limite de débit
                throw new RateLimitExceededError('Too many requests, please try again later', {
                    clientId,
                    path,
                    limit,
                    retryAfter
                });
            }

            // Continuer le traitement
            await next();

        } catch (error) {
            // Si l'erreur est une erreur de dépassement de limite de débit, la propager
            if (error instanceof RateLimitExceededError) {
                throw error;
            }

            // Sinon, journaliser l'erreur et la propager
            this.logger.error('Error in rate limiting middleware', error);
            throw error;
        }
    }

    /**
     * Récupère la limite applicable pour un chemin
     * @param path Chemin de la requête
     * @returns Limite applicable
     */
    private getPathLimit(path: string): number {
        if (this.pathLimits) {
            // Rechercher une correspondance exacte
            if (this.pathLimits[path] !== undefined) {
                return this.pathLimits[path];
            }

            // Rechercher une correspondance par préfixe
            for (const [prefix, limit] of Object.entries(this.pathLimits)) {
                if (path.startsWith(prefix)) {
                    return limit;
                }
            }
        }

        // Utiliser la limite par défaut
        return this.defaultLimit;
    }

    /**
     * Ajoute les en-têtes de limitation de débit à la réponse
     * @param context Contexte de la requête API
     * @param limit Limite applicable
     * @param remaining Nombre de requêtes restantes
     * @param retryAfter Temps avant de pouvoir refaire une requête (s)
     */
    private addRateLimitHeaders(
        context: IAPIContext,
        limit: number,
        remaining: number,
        retryAfter: number
    ): void {
        // Créer la réponse si elle n'existe pas
        if (!context.response) {
            context.response = {
                status: 429,
                statusCode: 429,
                headers: {},
                body: {
                    error: 'Too many requests',
                    retryAfter
                }
            };
        }

        // Ajouter les en-têtes standard de limitation de débit
        context.response.headers = {
            ...context.response.headers,
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + retryAfter),
            'Retry-After': String(retryAfter)
        };
    }
}