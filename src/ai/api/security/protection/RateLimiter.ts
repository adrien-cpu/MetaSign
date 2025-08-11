//src/ai/api/security/protection/RateLimiter.ts
/**
 * Service qui gère les limites de taux d'accès aux ressources API.
 * Il prévient les abus comme les attaques par déni de service ou par force brute.
 */
import { Logger } from '@api/common/monitoring/LogService';

export interface RateLimiterOptions {
    /**
     * Limite par défaut de requêtes par fenêtre de temps
     */
    defaultLimit: number;

    /**
     * Fenêtre de temps en millisecondes
     */
    windowMs: number;

    /**
     * Méthode HTTP à surveiller, toutes si non spécifié
     */
    methods?: string[];

    /**
     * Routes à exclure du rate limiting
     */
    excludeRoutes?: string[];

    /**
     * Fonction pour générer la clé d'identification du client
     */
    keyGenerator?: (req: { ip?: string; headers: Record<string, string>; path: string }) => string;

    /**
     * Fonction pour personnaliser le message d'erreur
     */
    errorMessage?: string | ((info: { limit: number; windowMs: number }) => string);

    /**
     * Fonction pour personnaliser le code de statut HTTP
     */
    statusCode?: number;

    /**
     * Type de stockage pour les compteurs de requêtes
     */
    storeType?: 'memory' | 'redis';

    /**
     * Options de configuration Redis si storeType est 'redis'
     */
    redisOptions?: {
        host: string;
        port: number;
        password?: string;
        keyPrefix?: string;
    };
}

/**
 * Informations sur une limite de taux
 */
export interface RateLimitInfo {
    /**
     * Nombre de requêtes restantes dans la fenêtre de temps
     */
    remaining: number;

    /**
     * Limite totale de requêtes
     */
    limit: number;

    /**
     * Timestamp Unix en secondes marquant la réinitialisation de la limite
     */
    resetAt: number;
}

export interface RateLimitRule {
    /**
     * Motif de chemin pour appliquer cette règle
     */
    path: string | RegExp;

    /**
     * Limite de requêtes pour cette règle
     */
    limit: number;

    /**
     * Fenêtre de temps en millisecondes pour cette règle
     */
    windowMs?: number;
}

/**
 * Gestionnaire de limites de taux d'accès aux ressources API
 */
export class RateLimiter {
    private readonly options: Required<RateLimiterOptions>;
    private readonly logger: Logger;
    private readonly rules: RateLimitRule[] = [];
    private readonly store: Map<string, { count: number; resetAt: number }> = new Map();

    /**
     * Crée une nouvelle instance du gestionnaire de limite de taux
     * @param options Options de configuration
     */
    constructor(options: RateLimiterOptions) {
        const defaultOptions: Required<RateLimiterOptions> = {
            defaultLimit: 100,
            windowMs: 60 * 1000, // 1 minute
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            excludeRoutes: [],
            keyGenerator: (req) => `${req.ip || 'unknown'}-${req.path}`,
            errorMessage: 'Too many requests, please try again later',
            statusCode: 429,
            storeType: 'memory',
            redisOptions: {
                host: 'localhost',
                port: 6379,
                keyPrefix: 'ratelimit:'
            }
        };

        this.options = { ...defaultOptions, ...options };
        this.logger = new Logger('RateLimiter');

        // Démarrer le nettoyage périodique du store en mémoire
        if (this.options.storeType === 'memory') {
            this.startPeriodicCleanup();
        }
    }

    /**
     * Vérifie si une requête est autorisée selon les limites de taux
     * @param clientId Identifiant du client (adresse IP, userId, etc.)
     * @param path Chemin de la requête
     * @returns true si la requête est autorisée, false sinon
     */
    public async isAllowed(clientId: string, path: string): Promise<boolean> {
        // Vérifier si le chemin est exclu
        if (this.isExcluded(path)) {
            return true;
        }

        // Obtenir la règle applicable
        const rule = this.getApplicableRule(path);
        const limit = rule ? rule.limit : this.options.defaultLimit;
        const windowMs = rule ? (rule.windowMs || this.options.windowMs) : this.options.windowMs;

        // Construire la clé pour ce client+chemin
        const key = `${clientId}:${path}`;

        // Récupérer l'état actuel
        const now = Date.now();
        const storeEntry = this.store.get(key) || { count: 0, resetAt: now + windowMs };

        // Réinitialiser le compteur si la fenêtre est passée
        if (storeEntry.resetAt <= now) {
            storeEntry.count = 0;
            storeEntry.resetAt = now + windowMs;
        }

        // Vérifier si la limite est dépassée
        const isAllowed = storeEntry.count < limit;

        // Incrémenter le compteur si autorisé
        if (isAllowed) {
            storeEntry.count++;
            this.store.set(key, storeEntry);

            // Journaliser à des fins de débogage
            if (storeEntry.count > limit * 0.8) {
                this.logger.debug(`High rate detected for ${clientId} on ${path}: ${storeEntry.count}/${limit}`);
            }
        } else {
            this.logger.warn(`Rate limit exceeded for ${clientId} on ${path}: ${storeEntry.count}/${limit}`);
        }

        return isAllowed;
    }

    /**
     * Obtient les informations de limite pour un client et un chemin spécifiques
     * @param clientId Identifiant du client
     * @param path Chemin de la requête
     * @returns Informations sur la limite de taux
     */
    public getRateLimitInfo(clientId: string, path: string): RateLimitInfo {
        // Construire la clé
        const key = `${clientId}:${path}`;

        // Obtenir la règle applicable
        const rule = this.getApplicableRule(path);
        const limit = rule ? rule.limit : this.options.defaultLimit;

        // Récupérer l'état actuel
        const storeEntry = this.store.get(key) || { count: 0, resetAt: Date.now() + this.options.windowMs };

        return {
            remaining: Math.max(0, limit - storeEntry.count),
            limit,
            resetAt: Math.floor(storeEntry.resetAt / 1000) // Convertir en secondes
        };
    }

    /**
     * Ajoute une règle de limite de taux pour un chemin spécifique
     * @param rule Règle à ajouter
     */
    public addRule(rule: RateLimitRule): void {
        this.rules.push(rule);
        this.logger.info(`Added rate limit rule for ${rule.path}: ${rule.limit} requests per ${rule.windowMs || this.options.windowMs}ms`);
    }

    /**
     * Réinitialise le compteur pour un client et un chemin spécifiques
     * @param clientId Identifiant du client
     * @param path Chemin de la requête (optionnel, tous les chemins si non spécifié)
     */
    public resetLimits(clientId: string, path?: string): void {
        if (path) {
            // Réinitialiser un chemin spécifique
            const key = `${clientId}:${path}`;
            this.store.delete(key);
            this.logger.debug(`Reset rate limit for ${clientId} on ${path}`);
        } else {
            // Réinitialiser tous les chemins pour ce client
            for (const key of this.store.keys()) {
                if (key.startsWith(`${clientId}:`)) {
                    this.store.delete(key);
                }
            }
            this.logger.debug(`Reset all rate limits for ${clientId}`);
        }
    }

    /**
     * Vérifie si un chemin est exclu des limites de taux
     * @param path Chemin à vérifier
     * @returns true si le chemin est exclu
     */
    private isExcluded(path: string): boolean {
        return this.options.excludeRoutes.some(excludePath => {
            if (typeof excludePath === 'string') {
                return path === excludePath;
            }
            // Si c'est une expression régulière
            return path.match(new RegExp(excludePath));
        });
    }

    /**
     * Obtient la règle applicable pour un chemin spécifique
     * @param path Chemin à vérifier
     * @returns Règle applicable ou undefined si aucune ne correspond
     */
    private getApplicableRule(path: string): RateLimitRule | undefined {
        return this.rules.find(rule => {
            if (typeof rule.path === 'string') {
                return path === rule.path;
            }
            // Si c'est une expression régulière
            return path.match(rule.path);
        });
    }

    /**
     * Démarre le nettoyage périodique du store en mémoire
     */
    private startPeriodicCleanup(): void {
        // Nettoyer le store toutes les 5 minutes
        setInterval(() => {
            const now = Date.now();
            let count = 0;

            for (const [key, entry] of this.store.entries()) {
                if (entry.resetAt <= now) {
                    this.store.delete(key);
                    count++;
                }
            }

            if (count > 0) {
                this.logger.debug(`Cleaned up ${count} expired rate limit entries`);
            }
        }, 5 * 60 * 1000);
    }
}