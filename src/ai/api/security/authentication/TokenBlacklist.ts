// src/ai/api/security/authentication/TokenBlacklist.ts
import { Logger } from '@/ai/utils/Logger';
import { RedisClient } from '../database/RedisClient';

/**
 * Options pour la liste noire de tokens
 */
export interface TokenBlacklistOptions {
    /** Préfixe des clés Redis pour les tokens */
    keyPrefix?: string;
    /** Client Redis à utiliser */
    redisClient?: RedisClient;
    /** Temps de rétention par défaut en secondes pour les tokens sans durée spécifiée */
    defaultTTL?: number;
}

/**
 * Entrée de liste noire pour un token
 */
export interface BlacklistEntry {
    /** ID unique du token (jti) */
    tokenId: string;
    /** Raison de la révocation */
    reason: string;
    /** Date de révocation */
    revokedAt: string;
    /** ID utilisateur associé (si connu) */
    userId?: string;
}

/**
 * Gestionnaire de liste noire de tokens JWT
 * Permet de révoquer des tokens avant leur expiration
 */
export class TokenBlacklist {
    private readonly keyPrefix: string;
    private readonly defaultTTL: number;
    private readonly logger: Logger;
    private readonly redisClient?: RedisClient;

    /**
     * Map en mémoire comme fallback si Redis n'est pas disponible
     * Clé: ID du token (jti), Valeur: Entrée de liste noire
     */
    private readonly inMemoryBlacklist = new Map<string, BlacklistEntry>();

    /**
     * Map pour stocker les timestamps d'expiration pour le nettoyage en mémoire
     * Clé: ID du token (jti), Valeur: Timestamp d'expiration
     */
    private readonly expirationMap = new Map<string, number>();

    /**
     * Constructeur
     * @param options Options de configuration
     */
    constructor(options: TokenBlacklistOptions = {}) {
        this.keyPrefix = options.keyPrefix || 'jwt_blacklist:';
        this.defaultTTL = options.defaultTTL || 86400; // 24 heures par défaut
        this.redisClient = options.redisClient;
        this.logger = new Logger('TokenBlacklist');

        // Lancer un nettoyage périodique des entrées expirées en mémoire
        setInterval(() => this.cleanupExpiredEntries(), 60000); // Toutes les minutes

        this.logger.info('TokenBlacklist initialized');
    }

    /**
     * Ajoute un token à la liste noire
     * @param token Token complet (optionnel)
     * @param tokenId ID unique du token (jti)
     * @param ttl Durée de vie en secondes (devrait correspondre au temps restant avant expiration)
     * @param reason Raison de la révocation
     * @param userId ID utilisateur associé (optionnel)
     */
    public async addToBlacklist(
        token: string,
        tokenId: string,
        ttl: number = this.defaultTTL,
        reason = 'manual_revocation',
        userId?: string
    ): Promise<void> {
        const entry: BlacklistEntry = {
            tokenId,
            reason,
            revokedAt: new Date().toISOString(),
            userId
        };

        try {
            if (this.redisClient) {
                // Stocker dans Redis avec expiration automatique
                const key = `${this.keyPrefix}${tokenId}`;
                await this.redisClient.set(key, JSON.stringify(entry), 'EX', ttl);

                // Si le token complet est fourni, le stocker aussi pour les vérifications rapides
                if (token) {
                    const tokenHashKey = `${this.keyPrefix}token:${this.hashToken(token)}`;
                    await this.redisClient.set(tokenHashKey, '1', 'EX', ttl);
                }

                // Index par utilisateur si fourni
                if (userId) {
                    const userKey = `${this.keyPrefix}user:${userId}`;
                    await this.redisClient.sadd(userKey, tokenId);
                    // Définir TTL sur l'index utilisateur s'il n'existe pas encore
                    const userKeyExists = await this.redisClient.exists(userKey);
                    if (userKeyExists === 0) {
                        await this.redisClient.expire(userKey, this.defaultTTL);
                    }
                }
            } else {
                // Fallback en mémoire
                this.inMemoryBlacklist.set(tokenId, entry);

                // Stocker le timestamp d'expiration pour le nettoyage
                const expiresAt = Date.now() + ttl * 1000;
                this.expirationMap.set(tokenId, expiresAt);

                // Si le token complet est fourni, le stocker aussi
                if (token) {
                    const tokenHash = this.hashToken(token);
                    this.inMemoryBlacklist.set(`token:${tokenHash}`, entry);
                    this.expirationMap.set(`token:${tokenHash}`, expiresAt);
                }
            }

            this.logger.debug(`Token ${tokenId} added to blacklist. Reason: ${reason}`);
        } catch (error) {
            this.logger.error('Failed to add token to blacklist', error instanceof Error ? error.message : String(error));
            throw new Error('Échec de l\'ajout du token à la liste noire');
        }
    }

    /**
     * Vérifie si un token est dans la liste noire
     * @param token Token JWT complet ou ID de token (jti)
     * @returns true si le token est blacklisté
     */
    public async isBlacklisted(token: string): Promise<boolean> {
        try {
            const tokenHash = this.hashToken(token);
            const jtiKey = `${this.keyPrefix}${token}`; // Au cas où on passe directement un jti
            const tokenHashKey = `${this.keyPrefix}token:${tokenHash}`;

            if (this.redisClient) {
                // Vérifier les deux clés possibles
                const [jtiExists, tokenExists] = await Promise.all([
                    this.redisClient.exists(jtiKey),
                    this.redisClient.exists(tokenHashKey)
                ]);

                return jtiExists === 1 || tokenExists === 1;
            } else {
                // Vérifier dans la mémoire
                return (
                    this.inMemoryBlacklist.has(token) || // Si c'est un jti
                    this.inMemoryBlacklist.has(`token:${tokenHash}`) // Si c'est un token complet
                );
            }
        } catch (error) {
            this.logger.error('Error checking token blacklist', error instanceof Error ? error.message : String(error));

            // En cas d'erreur, considérer le token comme valide (fail-open)
            // Note: Dans un environnement de production sensible, on pourrait préférer fail-closed
            return false;
        }
    }

    /**
     * Obtient les informations sur un token révoqué
     * @param tokenId ID du token (jti)
     * @returns Entrée de liste noire ou null si non trouvée
     */
    public async getBlacklistEntry(tokenId: string): Promise<BlacklistEntry | null> {
        try {
            const key = `${this.keyPrefix}${tokenId}`;

            if (this.redisClient) {
                const entry = await this.redisClient.get(key);
                if (!entry) return null;

                return JSON.parse(entry) as BlacklistEntry;
            } else {
                const entry = this.inMemoryBlacklist.get(tokenId);
                return entry || null;
            }
        } catch (error) {
            this.logger.error('Error fetching blacklist entry', error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    /**
     * Révoque tous les tokens d'un utilisateur spécifique
     * @param userId ID de l'utilisateur
     */
    public async revokeAllUserTokens(userId: string): Promise<void> {
        try {
            const userKey = `${this.keyPrefix}user:${userId}`;

            if (this.redisClient) {
                // Récupérer tous les IDs de token pour cet utilisateur
                const tokenIds = await this.redisClient.smembers(userKey);

                // Pour chaque token, mettre à jour la raison et prolonger sa durée
                const pipeline = this.redisClient.pipeline();

                for (const tokenId of tokenIds) {
                    const key = `${this.keyPrefix}${tokenId}`;
                    const entryJson = await this.redisClient.get(key);

                    if (entryJson) {
                        const entry = JSON.parse(entryJson) as BlacklistEntry;
                        entry.reason = 'user_tokens_revoked';
                        pipeline.set(key, JSON.stringify(entry), 'EX', this.defaultTTL);
                    }
                }

                // Exécuter en une seule opération
                await pipeline.exec();

                // Prolonger l'expiration de l'ensemble utilisateur
                await this.redisClient.expire(userKey, this.defaultTTL);
            } else {
                // Dans la version en mémoire, rechercher tous les tokens de l'utilisateur
                for (const [tokenId, entry] of this.inMemoryBlacklist.entries()) {
                    if (entry.userId === userId) {
                        entry.reason = 'user_tokens_revoked';
                        // Prolonger l'expiration
                        this.expirationMap.set(tokenId, Date.now() + this.defaultTTL * 1000);
                    }
                }
            }

            this.logger.info(`All tokens revoked for user: ${userId}`);
        } catch (error) {
            this.logger.error('Failed to revoke all user tokens', error instanceof Error ? error.message : String(error));
            throw new Error('Échec de la révocation des tokens utilisateur');
        }
    }

    /**
     * Supprime un token de la liste noire (utile pour les tests)
     * @param tokenId ID du token à supprimer
     */
    public async removeFromBlacklist(tokenId: string): Promise<void> {
        try {
            const key = `${this.keyPrefix}${tokenId}`;

            if (this.redisClient) {
                // Récupérer l'entrée pour obtenir l'userId s'il existe
                const entryJson = await this.redisClient.get(key);
                let userId: string | undefined;

                if (entryJson) {
                    const entry = JSON.parse(entryJson) as BlacklistEntry;
                    userId = entry.userId;
                }

                // Supprimer la clé principale
                await this.redisClient.del(key);

                // Si userId est présent, supprimer la référence
                if (userId) {
                    const userKey = `${this.keyPrefix}user:${userId}`;
                    await this.redisClient.srem(userKey, tokenId);
                }
            } else {
                // Supprimer de la mémoire
                const entry = this.inMemoryBlacklist.get(tokenId);
                this.inMemoryBlacklist.delete(tokenId);
                this.expirationMap.delete(tokenId);

                // Si le token est associé à un utilisateur, nettoyer cette référence aussi
                if (entry?.userId) {
                    // Ici, nous n'avons pas d'équivalent direct à l'ensemble Redis
                    // Une implémentation complète nécessiterait une structure de données supplémentaire
                }
            }

            this.logger.debug(`Token ${tokenId} removed from blacklist`);
        } catch (error) {
            this.logger.error('Failed to remove token from blacklist', error instanceof Error ? error.message : String(error));
            throw new Error('Échec de la suppression du token de la liste noire');
        }
    }

    /**
     * Nettoie les entrées expirées de la liste en mémoire
     * @private
     */
    private cleanupExpiredEntries(): void {
        if (this.redisClient) {
            // Redis gère automatiquement l'expiration
            return;
        }

        const now = Date.now();
        let expiredCount = 0;

        // Parcourir les entrées d'expiration
        for (const [tokenId, expiresAt] of this.expirationMap.entries()) {
            if (expiresAt <= now) {
                // Supprimer les entrées expirées
                this.inMemoryBlacklist.delete(tokenId);
                this.expirationMap.delete(tokenId);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            this.logger.debug(`Cleaned up ${expiredCount} expired blacklist entries`);
        }
    }

    /**
     * Hache un token pour le stockage sécurisé
     * @param token Token à hacher
     * @returns Version hachée du token
     * @private
     */
    private hashToken(token: string): string {
        // Dans une implémentation réelle, on utiliserait une fonction de hachage cryptographique
        // Pour simplifier, on utilise juste une fonction de hachage simple
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
            const char = token.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Conversion en 32bit
        }
        return hash.toString(16);
    }
}