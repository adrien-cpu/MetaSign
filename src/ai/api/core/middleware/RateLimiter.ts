// src/ai/api/core/middleware/RateLimiter.ts

// Interfaces nécessaires
/**
 * Interface pour le middleware
 */
export interface Middleware {
    process(context: APIContext, next: NextFunction): Promise<void>;
}

/**
 * Interface pour le contexte API
 */
export interface APIContext {
    request: {
        clientId: string;
        // Autres propriétés...
    };
    // Autres propriétés...
}

/**
 * Type de fonction pour chaîner les middlewares
 */
export type NextFunction = () => Promise<void>;

/**
 * Interface pour la configuration de limite de taux
 */
export interface RateLimit {
    count: number;
    max: number;
    timestamp: number;
    windowMs: number;
}

/**
 * Erreur personnalisée pour limite de taux dépassée
 */
export class RateLimitExceededError extends Error {
    constructor(message: string = 'Rate limit exceeded') {
        super(message);
        this.name = 'RateLimitExceededError';
        // Nécessaire pour que instanceof fonctionne correctement en TypeScript
        Object.setPrototypeOf(this, RateLimitExceededError.prototype);
    }
}

/**
 * Middleware pour limiter le taux de requêtes
 */
export class RateLimiter implements Middleware {
    private limits: Map<string, RateLimit> = new Map(); // Initialisation de la Map

    /**
     * Crée une instance du RateLimiter
     */
    constructor() {
        // Initialisation si nécessaire
    }

    /**
     * Traite une requête en vérifiant et mettant à jour les limites de taux
     * @param context Contexte de la requête API
     * @param next Fonction pour passer au middleware suivant
     */
    async process(context: APIContext, next: NextFunction): Promise<void> {
        const clientId = context.request.clientId;
        const limit = this.limits.get(clientId);

        if (this.isRateLimited(limit)) {
            throw new RateLimitExceededError();
        }

        this.updateRateLimit(clientId);
        await next();
    }

    /**
     * Vérifie si le client a dépassé sa limite de taux
     * @param limit Configuration de limite pour le client
     * @returns Vrai si la limite est dépassée
     */
    private isRateLimited(limit: RateLimit | undefined): boolean {
        if (!limit) return false;
        return limit.count >= limit.max &&
            (Date.now() - limit.timestamp) < limit.windowMs;
    }

    /**
     * Met à jour la limite de taux pour un client
     * @param clientId Identifiant du client
     * @param options Options de configuration (optionnel)
     */
    private updateRateLimit(clientId: string, options?: { max?: number, windowMs?: number }): void {
        const existingLimit = this.limits.get(clientId);
        const now = Date.now();

        if (!existingLimit) {
            // Créer une nouvelle limite pour ce client
            this.limits.set(clientId, {
                count: 1,
                max: options?.max || 100, // Valeur par défaut
                timestamp: now,
                windowMs: options?.windowMs || 60000 // 1 minute par défaut
            });
            return;
        }

        // Si la fenêtre de temps est écoulée, réinitialiser le compteur
        if ((now - existingLimit.timestamp) >= existingLimit.windowMs) {
            this.limits.set(clientId, {
                count: 1,
                max: existingLimit.max,
                timestamp: now,
                windowMs: existingLimit.windowMs
            });
            return;
        }

        // Incrémenter le compteur
        this.limits.set(clientId, {
            ...existingLimit,
            count: existingLimit.count + 1
        });
    }

    /**
     * Réinitialise les limites pour un client spécifique
     * @param clientId Identifiant du client
     */
    public resetLimit(clientId: string): void {
        this.limits.delete(clientId);
    }

    /**
     * Réinitialise toutes les limites
     */
    public resetAllLimits(): void {
        this.limits.clear();
    }

    /**
     * Obtient la limite actuelle pour un client
     * @param clientId Identifiant du client
     * @returns La configuration de limite ou undefined si non trouvée
     */
    public getLimit(clientId: string): RateLimit | undefined {
        return this.limits.get(clientId);
    }
}