// src/ai/api/security/authentication/TokenValidator.ts
import { Logger } from '@/ai/utils/Logger';
import { JWTService, TokenPayload, InvalidTokenError } from './JWTService';
import { RoleManager } from './RoleManager';
// Importer directement les méthodes nécessaires de jsonwebtoken
import { decode } from 'jsonwebtoken';

/**
 * Résultat de la validation d'un token
 */
export interface TokenValidationResult {
    /** Indique si le token est valide */
    isValid: boolean;
    /** Message d'erreur en cas d'échec */
    error?: string;
    /** Payload du token si valide */
    payload?: TokenPayload;
    /** Indique si l'utilisateur a les permissions requises */
    hasRequiredPermissions?: boolean;
}

/**
 * Options pour la validation d'un token
 */
export interface TokenValidationOptions {
    /** Rôles requis pour accéder à la ressource */
    requiredRoles?: string[];
    /** Permissions requises pour accéder à la ressource */
    requiredPermissions?: string[];
    /** Vérifier l'audience du token */
    validateAudience?: boolean;
    /** Vérifier l'émetteur du token */
    validateIssuer?: boolean;
    /** Audiences valides (si validateAudience est true) */
    validAudiences?: string[];
    /** Émetteurs valides (si validateIssuer est true) */
    validIssuers?: string[];
}

/**
 * Validateur de tokens JWT
 * Étend la fonctionnalité de base du JWTService avec des validations supplémentaires
 */
export class TokenValidator {
    private readonly logger: Logger;
    private readonly jwtService: JWTService;
    private readonly roleManager: RoleManager;

    /**
     * Constructeur
     * @param jwtService Service JWT à utiliser
     * @param roleManager Gestionnaire de rôles
     */
    constructor(jwtService: JWTService, roleManager: RoleManager) {
        this.logger = new Logger('TokenValidator');
        this.jwtService = jwtService;
        this.roleManager = roleManager;
    }

    /**
     * Décode un token sans vérifier sa validité
     * @param token Token JWT à décoder
     * @returns Payload décodé
     */
    public decodeToken(token: string): TokenPayload | null {
        try {
            // Utiliser l'import direct au lieu de require
            const decoded = decode(token);

            return decoded as TokenPayload;
        } catch (error) {
            this.logger.error('Failed to decode token', error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    /**
     * Valide complètement un token JWT
     * @param token Token JWT à valider
     * @param options Options de validation
     * @returns Résultat de la validation
     */
    public async validateToken(
        token: string,
        options: TokenValidationOptions = {}
    ): Promise<TokenValidationResult> {
        try {
            // Vérifier la validité de base du token
            const payload = await this.jwtService.verifyToken(token);

            // Valider l'audience si nécessaire
            if (options.validateAudience && payload.aud && options.validAudiences?.length) {
                const audArray = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

                const isValidAudience = audArray.some(aud =>
                    options.validAudiences?.includes(aud)
                );

                if (!isValidAudience) {
                    return {
                        isValid: false,
                        error: 'Audience invalide'
                    };
                }
            }

            // Valider l'émetteur si nécessaire
            if (options.validateIssuer && payload.iss && options.validIssuers?.length) {
                if (!options.validIssuers.includes(payload.iss)) {
                    return {
                        isValid: false,
                        error: 'Émetteur invalide'
                    };
                }
            }

            // Valider les rôles si spécifiés
            if (options.requiredRoles?.length) {
                const hasRequiredRoles = options.requiredRoles.some(role =>
                    payload.roles.includes(role)
                );

                if (!hasRequiredRoles) {
                    return {
                        isValid: false,
                        error: 'Rôles insuffisants',
                        payload
                    };
                }
            }

            // Valider les permissions si spécifiées
            let hasRequiredPermissions = true;

            if (options.requiredPermissions?.length) {
                // Vérifier d'abord les permissions incluses dans le token
                if (payload.permissions) {
                    hasRequiredPermissions = options.requiredPermissions.every(permission =>
                        payload.permissions?.includes(permission)
                    );
                } else {
                    // Si les permissions ne sont pas dans le token, les récupérer
                    const userPermissions = await this.roleManager.getUserPermissions(payload.userId);

                    hasRequiredPermissions = options.requiredPermissions.every(permission =>
                        userPermissions.includes(permission)
                    );
                }

                if (!hasRequiredPermissions) {
                    return {
                        isValid: false,
                        error: 'Permissions insuffisantes',
                        payload,
                        hasRequiredPermissions: false
                    };
                }
            }

            // Token valide avec toutes les validations
            return {
                isValid: true,
                payload,
                hasRequiredPermissions
            };

        } catch (error) {
            // Gérer les différents types d'erreurs de validation
            let errorMessage = 'Token invalide';

            if (error instanceof InvalidTokenError) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            this.logger.warn('Token validation failed', errorMessage);

            return {
                isValid: false,
                error: errorMessage
            };
        }
    }

    /**
     * Valide le scope d'un token
     * @param token Token ou payload à valider
     * @param requiredScopes Scopes requis
     * @returns true si le token a les scopes requis
     */
    public validateScope(token: string | TokenPayload, requiredScopes: string[]): boolean {
        try {
            let payload: TokenPayload | null;

            if (typeof token === 'string') {
                payload = this.decodeToken(token);
                if (!payload) return false;
            } else {
                payload = token;
            }

            // Vérifier si les scopes sont stockés dans les metadata
            const scopes = payload.metadata?.scopes;

            if (!scopes) return false;

            // Vérifier le format des scopes
            if (Array.isArray(scopes)) {
                return requiredScopes.every(scope => scopes.includes(scope));
            } else if (typeof scopes === 'string') {
                const scopeArray = scopes.split(' ');
                return requiredScopes.every(scope => scopeArray.includes(scope));
            }

            return false;
        } catch (error) {
            this.logger.error('Failed to validate scope', error instanceof Error ? error.message : String(error));
            return false;
        }
    }

    /**
     * Extrait l'ID utilisateur d'un token
     * @param token Token JWT
     * @returns ID utilisateur ou null si invalide
     */
    public extractUserId(token: string): string | null {
        const payload = this.decodeToken(token);
        return payload?.userId || null;
    }

    /**
     * Extrait les rôles d'un token
     * @param token Token JWT
     * @returns Liste des rôles ou null si invalide
     */
    public extractRoles(token: string): string[] | null {
        const payload = this.decodeToken(token);
        return payload?.roles || null;
    }
}