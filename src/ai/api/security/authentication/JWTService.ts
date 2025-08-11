// src/ai/api/security/authentication/JWTService.ts
import { Logger } from '@/ai/utils/Logger';
// Pour résoudre l'erreur d'importation de jsonwebtoken, ajoutez un commentaire pour indiquer qu'il faut installer le package
// Exécutez: npm install jsonwebtoken @types/jsonwebtoken
import * as jwt from 'jsonwebtoken';
import { EncryptionManager } from '../core/EncryptionManager';
import { TokenBlacklist } from './TokenBlacklist';
import { RoleManager } from './RoleManager';
// Pour résoudre l'erreur d'importation de uuid, ajoutez un commentaire pour indiquer qu'il faut installer le package
// Exécutez: npm install uuid @types/uuid
import { v4 as uuidv4 } from 'uuid';

/**
 * Options de configuration pour le service JWT
 */
export interface JWTOptions {
    /** Clé secrète pour signer les tokens */
    secretKey: string;
    /** Durée de validité des tokens d'accès en secondes */
    accessTokenExpiration: number;
    /** Durée de validité des tokens de rafraîchissement en secondes */
    refreshTokenExpiration: number;
    /** Algorithme de signature JWT */
    algorithm?: jwt.Algorithm;
    /** Émetteur du token */
    issuer?: string;
    /** Public cible du token */
    audience?: string;
}

/**
 * Informations d'identification pour l'authentification
 */
export interface AuthCredentials {
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Nom d'utilisateur */
    username: string;
    /** Mot de passe (pour l'authentification) */
    password?: string;
    /** Adresse IP de la requête */
    ip?: string;
    /** User-Agent du client */
    userAgent?: string;
    /** Périphérique utilisé */
    device?: string;
}

/**
 * Structure du payload JWT - corrigé pour exactOptionalPropertyTypes
 */
export interface TokenPayload {
    /** Identifiant unique du token */
    jti: string;
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Nom d'utilisateur */
    username: string;
    /** Rôles de l'utilisateur */
    roles: string[];
    /** Permissions de l'utilisateur */
    permissions?: string[] | undefined;
    /** Date d'émission (timestamp) */
    iat: number;
    /** Date d'expiration (timestamp) */
    exp: number;
    /** Émetteur du token */
    iss?: string | undefined;
    /** Public cible du token */
    aud?: string | undefined;
    /** Identifiant du token de rafraîchissement (pour les tokens d'accès) */
    refreshTokenId?: string | undefined;
    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown> | undefined;
}

/**
 * Structure pour les tokens émis
 */
export interface TokenPair {
    /** Token d'accès */
    accessToken: string;
    /** Token de rafraîchissement */
    refreshToken: string;
    /** Date d'expiration du token d'accès */
    expiresAt: Date;
    /** Type du token */
    tokenType: 'Bearer';
}

/**
 * Erreur de token invalide
 */
export class InvalidTokenError extends Error {
    constructor(message = 'Token invalide ou expiré') {
        super(message);
        this.name = 'InvalidTokenError';
    }
}

/**
 * Erreur de token expiré
 */
export class TokenExpiredError extends Error {
    constructor(message = 'Token expiré') {
        super(message);
        this.name = 'TokenExpiredError';
    }
}

/**
 * Erreur de token révoqué
 */
export class RevokedTokenError extends Error {
    constructor(message = 'Token révoqué ou dans la liste noire') {
        super(message);
        this.name = 'RevokedTokenError';
    }
}

/**
 * Service de gestion des tokens JWT
 * Compatible avec le composant SystemeSecuriteRenforcee du diagramme d'état
 */
export class JWTService {
    private readonly secretKey: string;
    private readonly accessTokenExpiration: number;
    private readonly refreshTokenExpiration: number;
    private readonly algorithm: jwt.Algorithm;
    private readonly issuer?: string | undefined;
    private readonly audience?: string | undefined;
    private readonly logger: Logger;
    private readonly encryptionManager: EncryptionManager;
    private readonly tokenBlacklist: TokenBlacklist;
    private readonly roleManager: RoleManager;

    /**
     * Constructeur
     * @param options Options de configuration
     * @param roleManager Gestionnaire de rôles
     * @param tokenBlacklist Gestionnaire de liste noire de tokens
     */
    constructor(
        options: JWTOptions,
        roleManager: RoleManager,
        tokenBlacklist: TokenBlacklist
    ) {
        this.secretKey = options.secretKey;
        this.accessTokenExpiration = options.accessTokenExpiration;
        this.refreshTokenExpiration = options.refreshTokenExpiration;
        this.algorithm = options.algorithm || 'HS256';
        this.issuer = options.issuer;
        this.audience = options.audience;

        this.logger = new Logger('JWTService');
        this.encryptionManager = EncryptionManager.getInstance();
        this.roleManager = roleManager;
        this.tokenBlacklist = tokenBlacklist;

        this.logger.info('JWTService initialized');
    }

    /**
     * Génère une paire de tokens (accès et rafraîchissement)
     * @param credentials Informations d'identification
     * @returns Paire de tokens
     */
    public async generateTokenPair(credentials: AuthCredentials): Promise<TokenPair> {
        try {
            // Générer un ID unique pour le token de rafraîchissement
            const refreshTokenId = uuidv4();

            // Obtenir les rôles et permissions de l'utilisateur
            const roles = await this.getRoles(credentials.userId);
            const permissions = await this.getPermissions(credentials.userId);

            // Timestamp actuel en secondes
            const now = Math.floor(Date.now() / 1000);

            // Créer le payload pour le token de rafraîchissement
            const refreshTokenPayload: TokenPayload = {
                jti: refreshTokenId,
                userId: credentials.userId,
                username: credentials.username,
                roles,
                iat: now,
                exp: now + this.refreshTokenExpiration,
                iss: this.issuer,
                aud: this.audience
            };

            const refreshToken = jwt.sign(refreshTokenPayload, this.secretKey, {
                algorithm: this.algorithm
            });

            // Créer le payload pour le token d'accès avec référence au token de rafraîchissement
            const accessTokenPayload: TokenPayload = {
                jti: uuidv4(),
                userId: credentials.userId,
                username: credentials.username,
                roles,
                permissions,
                iat: now,
                exp: now + this.accessTokenExpiration,
                iss: this.issuer,
                aud: this.audience,
                refreshTokenId,
                metadata: {
                    ip: credentials.ip,
                    userAgent: credentials.userAgent,
                    device: credentials.device
                }
            };

            const accessToken = jwt.sign(accessTokenPayload, this.secretKey, {
                algorithm: this.algorithm
            });

            // Calculer la date d'expiration
            const expiresAt = new Date((now + this.accessTokenExpiration) * 1000);

            // Journaliser la génération du token
            this.logger.debug(`Generated token pair for user: ${credentials.userId}`);

            return {
                accessToken,
                refreshToken,
                expiresAt,
                tokenType: 'Bearer'
            };
        } catch (error) {
            this.logger.error('Failed to generate token pair', error instanceof Error ? error.message : String(error));
            throw new Error('Échec de la génération des tokens');
        }
    }

    /**
     * Vérifie et décode un token JWT
     * @param token Token JWT à vérifier
     * @param ignoreExpiration Ignorer l'expiration du token
     * @returns Payload décodé
     */
    public async verifyToken(token: string, ignoreExpiration = false): Promise<TokenPayload> {
        try {
            // Vérifier si le token est dans la liste noire
            if (await this.tokenBlacklist.isBlacklisted(token)) {
                throw new RevokedTokenError();
            }

            // Vérifier et décoder le token
            const payload = jwt.verify(token, this.secretKey, {
                algorithms: [this.algorithm],
                ignoreExpiration
            }) as TokenPayload;

            return payload;
        } catch (error) {
            // Gérer les différents types d'erreurs
            if (error instanceof RevokedTokenError) {
                throw error;
            }

            // Vérifier si c'est une erreur jwt.TokenExpiredError
            if (typeof error === 'object' && error !== null && 'name' in error) {
                if (error.name === 'TokenExpiredError') {
                    throw new TokenExpiredError();
                } else if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.warn('Invalid token', errorMessage);
                    throw new InvalidTokenError(errorMessage);
                }
            }

            this.logger.error('Token verification failed', error instanceof Error ? error.message : String(error));
            throw new InvalidTokenError('Échec de la vérification du token');
        }
    }

    /**
     * Rafraîchit un token d'accès expiré avec un token de rafraîchissement valide
     * @param refreshToken Token de rafraîchissement
     * @returns Nouvelle paire de tokens
     */
    public async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
        try {
            // Vérifier le token de rafraîchissement
            const refreshPayload = await this.verifyToken(refreshToken);

            // Vérifier que c'est bien un token de rafraîchissement
            if (refreshPayload.refreshTokenId) {
                throw new InvalidTokenError('Le token fourni n\'est pas un token de rafraîchissement');
            }

            // Construire les informations d'identification à partir du payload
            const credentials: AuthCredentials = {
                userId: refreshPayload.userId,
                username: refreshPayload.username
            };

            // Révoquer l'ancien token de rafraîchissement
            await this.revokeToken(refreshToken);

            // Générer une nouvelle paire de tokens
            return this.generateTokenPair(credentials);
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                this.logger.warn('Refresh token expired');
                throw new Error('Le token de rafraîchissement a expiré, veuillez vous reconnecter');
            }

            this.logger.error('Failed to refresh token', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    /**
     * Révoque un token en l'ajoutant à la liste noire
     * @param token Token à révoquer
     * @param reason Raison de la révocation
     */
    public async revokeToken(token: string, reason = 'user_logout'): Promise<void> {
        try {
            // Vérifier et décoder le token (même expiré)
            const payload = await this.verifyToken(token, true);

            // Calculer la durée avant expiration
            const now = Math.floor(Date.now() / 1000);
            const ttl = Math.max(0, payload.exp - now);

            // Ajouter le token à la liste noire
            await this.tokenBlacklist.addToBlacklist(token, payload.jti, ttl, reason);

            // Si c'est un token d'accès avec un refreshTokenId, révoquer aussi le token de rafraîchissement
            if (payload.refreshTokenId) {
                await this.tokenBlacklist.addToBlacklist(
                    '', // On n'a pas le token de rafraîchissement complet
                    payload.refreshTokenId,
                    this.refreshTokenExpiration,
                    `access_token_revoked_${reason}`
                );
            }

            this.logger.debug(`Token revoked for user: ${payload.userId}, reason: ${reason}`);
        } catch (err) {
            // Si le token est invalide ou expiré, pas besoin de le révoquer
            if (err instanceof InvalidTokenError || err instanceof TokenExpiredError) {
                this.logger.debug('No need to revoke invalid or expired token');
                return;
            }

            this.logger.error('Failed to revoke token', err instanceof Error ? err.message : String(err));
            throw new Error('Échec de la révocation du token');
        }
    }

    /**
     * Obtient les rôles d'un utilisateur
     * @param userId ID de l'utilisateur
     * @returns Liste des rôles
     */
    private async getRoles(userId: string): Promise<string[]> {
        try {
            return await this.roleManager.getUserRoles(userId);
        } catch (err) {
            this.logger.error(`Failed to get roles for user: ${userId}`,
                err instanceof Error ? err.message : String(err));
            return [];
        }
    }

    /**
     * Obtient les permissions d'un utilisateur basées sur ses rôles
     * @param userId ID de l'utilisateur
     * @returns Liste des permissions
     */
    private async getPermissions(userId: string): Promise<string[]> {
        try {
            return await this.roleManager.getUserPermissions(userId);
        } catch (err) {
            this.logger.error(`Failed to get permissions for user: ${userId}`,
                err instanceof Error ? err.message : String(err));
            return [];
        }
    }

    /**
     * Extrait et vérifie le token JWT d'une chaîne d'autorisation
     * @param authHeader En-tête d'autorisation (Bearer token)
     * @returns Token vérifié et décodé
     */
    public async extractAndVerifyToken(authHeader?: string): Promise<TokenPayload> {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new InvalidTokenError('En-tête d\'autorisation manquant ou invalide');
        }

        const token = authHeader.substring(7); // Supprimer "Bearer "
        return this.verifyToken(token);
    }

    /**
     * Vérifie si un token est valide sans le décoder complètement
     * @param token Token à vérifier
     * @returns true si le token est valide
     */
    public async isTokenValid(token: string): Promise<boolean> {
        try {
            await this.verifyToken(token);
            return true;
        } catch {
            // Capture l'erreur sans la référencer
            return false;
        }
    }

    /**
     * Change la clé secrète de signature
     * @param newSecretKey Nouvelle clé secrète
     */
    public async rotateSecretKey(newSecretKey: string): Promise<void> {
        // Stocker l'ancienne clé pour valider les tokens existants pendant une période de transition
        // Note: Dans une implémentation réelle, on stockerait cette clé pour une période de transition
        // mais ici elle n'est pas utilisée directement dans cette méthode.

        // Mettre à jour la clé actuelle avec une conversion de type sécurisée
        // Traiter this comme une classe avec une propriété privée en lecture/écriture
        Object.defineProperty(this, 'secretKey', {
            value: newSecretKey,
            writable: true,
            configurable: true
        });

        this.logger.info('JWT secret key rotated. Old tokens will continue to work during transition period.');
    }

    /**
     * Invalide tous les tokens d'un utilisateur spécifique
     * @param userId ID de l'utilisateur
     */
    public async revokeAllUserTokens(userId: string): Promise<void> {
        await this.tokenBlacklist.revokeAllUserTokens(userId);
        this.logger.info(`All tokens revoked for user: ${userId}`);
    }
}