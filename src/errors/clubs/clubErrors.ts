/**
 * @fileoverview Gestion d'erreurs personnalisées pour les clubs
 * @path src/errors/clubs/clubErrors.ts
 * @description Classes d'erreur spécialisées et middleware de gestion d'erreurs
 * @author MetaSign Team
 * @version 2.0.0
 * @since 2025-01-08
 * 
 * @remarks
 * - Classes d'erreur typées pour chaque cas d'usage
 * - Compatible avec exactOptionalPropertyTypes
 * - Support de la sérialisation JSON
 * - Intégration avec les logs structurés
 * 
 * @dependencies
 * - @/utils/clubs/postUtils - Utilitaires et codes d'erreur
 */

import { NextResponse } from 'next/server';
import { POST_ERROR_CODES, type PostErrorCode } from '@/utils/clubs/postUtils';

/**
 * Interface pour les erreurs Prisma
 */
interface PrismaError extends Error {
    code?: string;
    meta?: Record<string, unknown>;
}

/**
 * Interface de base pour les erreurs de club
 */
export interface ClubErrorContext {
    readonly clubId?: string;
    readonly postId?: string;
    readonly userId?: string;
    readonly operation?: string;
    readonly timestamp?: Date;
    readonly requestId?: string;
    readonly userAgent?: string;
    readonly metadata?: Record<string, unknown>;
}

/**
 * Classe de base pour toutes les erreurs liées aux clubs
 * 
 * @example
 * ```typescript
 * throw new ClubError(
 *   'Operation failed',
 *   POST_ERROR_CODES.INTERNAL_ERROR,
 *   { clubId: 'club123', operation: 'CREATE_POST' }
 * );
 * ```
 */
export abstract class ClubError extends Error {
    public readonly code: PostErrorCode;
    public readonly context: ClubErrorContext;
    public readonly isOperational: boolean = true;
    public readonly statusCode: number;

    constructor(
        message: string,
        code: PostErrorCode,
        context: ClubErrorContext = {},
        statusCode: number = 500
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.context = {
            ...context,
            timestamp: context.timestamp || new Date()
        };
        this.statusCode = statusCode;

        // Maintenir la stack trace en mode développement
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Sérialise l'erreur pour les logs ou l'API
     */
    public toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            context: this.context,
            stack: this.stack
        };
    }

    /**
     * Retourne une version sécurisée pour l'API (sans stack trace)
     */
    public toApiResponse(): Record<string, unknown> {
        return {
            error: this.message,
            code: this.code,
            timestamp: this.context.timestamp?.toISOString(),
            requestId: this.context.requestId
        };
    }
}

/**
 * Erreur d'authentification
 */
export class AuthenticationError extends ClubError {
    constructor(
        message: string = "Authentification requise",
        context: ClubErrorContext = {}
    ) {
        super(message, POST_ERROR_CODES.UNAUTHORIZED, context, 401);
    }
}

/**
 * Erreur d'autorisation/permissions
 */
export class AuthorizationError extends ClubError {
    constructor(
        message: string = "Permissions insuffisantes",
        context: ClubErrorContext = {}
    ) {
        super(message, POST_ERROR_CODES.FORBIDDEN, context, 403);
    }
}

/**
 * Erreur de ressource introuvable
 */
export class ResourceNotFoundError extends ClubError {
    public readonly resourceType: 'club' | 'post' | 'user' | 'comment' | 'like';

    constructor(
        resourceType: 'club' | 'post' | 'user' | 'comment' | 'like',
        resourceId: string,
        context: ClubErrorContext = {}
    ) {
        const messages = {
            club: 'Club introuvable',
            post: 'Post introuvable',
            user: 'Utilisateur introuvable',
            comment: 'Commentaire introuvable',
            like: 'Like introuvable'
        };

        const codes = {
            club: POST_ERROR_CODES.CLUB_NOT_FOUND,
            post: POST_ERROR_CODES.POST_NOT_FOUND,
            user: POST_ERROR_CODES.USER_NOT_FOUND,
            comment: POST_ERROR_CODES.POST_NOT_FOUND, // Réutilise le code post
            like: POST_ERROR_CODES.POST_NOT_FOUND // Réutilise le code post
        };

        super(
            messages[resourceType],
            codes[resourceType],
            { ...context, [`${resourceType}Id`]: resourceId },
            404
        );

        this.resourceType = resourceType;
    }
}

/**
 * Erreur de validation des données
 */
export class ValidationError extends ClubError {
    public readonly validationErrors: Array<{
        field: string;
        message: string;
        value?: unknown;
    }>;

    constructor(
        validationErrors: Array<{ field: string; message: string; value?: unknown }>,
        context: ClubErrorContext = {}
    ) {
        const message = `Erreurs de validation: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`;

        super(message, POST_ERROR_CODES.INVALID_DATA, context, 400);
        this.validationErrors = validationErrors;
    }

    /**
     * Crée une ValidationError pour le contenu d'un post
     */
    static forPostContent(content: string, context: ClubErrorContext = {}): ValidationError {
        const errors = [];

        if (!content || content.trim().length === 0) {
            errors.push({
                field: 'content',
                message: 'Le contenu ne peut pas être vide',
                value: content
            });
        }

        if (content && content.length > 2000) {
            errors.push({
                field: 'content',
                message: 'Le contenu ne peut pas dépasser 2000 caractères',
                value: content.length
            });
        }

        return new ValidationError(errors, context);
    }

    /**
     * Crée une ValidationError pour les tags
     */
    static forTags(tags: string[], context: ClubErrorContext = {}): ValidationError {
        const errors = [];

        if (tags.length > 10) {
            errors.push({
                field: 'tags',
                message: 'Maximum 10 tags autorisés',
                value: tags.length
            });
        }

        for (const tag of tags) {
            if (tag.length > 50) {
                errors.push({
                    field: 'tags',
                    message: 'Les tags ne peuvent pas dépasser 50 caractères',
                    value: tag
                });
                break;
            }
        }

        return new ValidationError(errors, context);
    }
}

/**
 * Erreur de limite de débit (rate limiting)
 */
export class RateLimitError extends ClubError {
    public readonly retryAfter: number; // en secondes

    constructor(
        retryAfter: number = 60,
        context: ClubErrorContext = {}
    ) {
        super(
            `Limite de débit atteinte. Réessayez dans ${retryAfter} secondes`,
            POST_ERROR_CODES.INTERNAL_ERROR, // Pas de code spécifique pour rate limit
            context,
            429
        );
        this.retryAfter = retryAfter;
    }
}

/**
 * Erreur de contenu trop volumineux
 */
export class PayloadTooLargeError extends ClubError {
    public readonly maxSize: number;
    public readonly actualSize: number;

    constructor(
        actualSize: number,
        maxSize: number = 2000,
        context: ClubErrorContext = {}
    ) {
        super(
            `Contenu trop volumineux: ${actualSize} caractères (maximum: ${maxSize})`,
            POST_ERROR_CODES.CONTENT_TOO_LONG,
            context,
            413
        );
        this.maxSize = maxSize;
        this.actualSize = actualSize;
    }
}

/**
 * Erreur de conflit (ressource déjà existante)
 */
export class ConflictError extends ClubError {
    constructor(
        message: string = "Conflit avec une ressource existante",
        context: ClubErrorContext = {}
    ) {
        super(message, POST_ERROR_CODES.INTERNAL_ERROR, context, 409);
    }
}

/**
 * Erreur de base de données
 */
export class DatabaseError extends ClubError {
    public readonly originalError?: Error;

    constructor(
        message: string = "Erreur de base de données",
        originalError?: Error,
        context: ClubErrorContext = {}
    ) {
        super(message, POST_ERROR_CODES.DATABASE_ERROR, context, 500);
        this.originalError = originalError;
    }
}

/**
 * Erreur d'adhésion au club
 */
export class ClubMembershipError extends ClubError {
    public readonly membershipRequired: boolean;

    constructor(
        message: string = "Adhésion au club requise",
        membershipRequired: boolean = true,
        context: ClubErrorContext = {}
    ) {
        super(message, POST_ERROR_CODES.NOT_CLUB_MEMBER, context, 403);
        this.membershipRequired = membershipRequired;
    }
}

/**
 * Utilitaires pour la gestion d'erreurs
 */
export class ErrorUtils {
    /**
     * Détermine si une erreur est opérationnelle (attendue) ou critique
     */
    static isOperationalError(error: Error): boolean {
        if (error instanceof ClubError) {
            return error.isOperational;
        }
        return false;
    }

    /**
     * Extrait le contexte de débogage d'une erreur
     */
    static extractDebugContext(error: Error): Record<string, unknown> {
        if (error instanceof ClubError) {
            return {
                type: error.constructor.name,
                code: error.code,
                statusCode: error.statusCode,
                context: error.context,
                isOperational: error.isOperational
            };
        }

        return {
            type: error.constructor.name,
            message: error.message,
            stack: error.stack
        };
    }

    /**
     * Crée une réponse d'erreur standardisée pour l'API
     */
    static toApiResponse(error: Error, includeStack: boolean = false): Record<string, unknown> {
        if (error instanceof ClubError) {
            const response = error.toApiResponse();
            if (includeStack && error.stack) {
                return { ...response, stack: error.stack };
            }
            return response;
        }

        return {
            error: "Erreur interne du serveur",
            code: POST_ERROR_CODES.INTERNAL_ERROR,
            timestamp: new Date().toISOString(),
            ...(includeStack && error.stack ? { stack: error.stack } : {})
        };
    }

    /**
     * Log une erreur avec le contexte approprié
     */
    static logError(error: Error, context: ClubErrorContext = {}): void {
        const logLevel = error instanceof ClubError && error.statusCode < 500 ? 'warn' : 'error';
        const logData = {
            ...this.extractDebugContext(error),
            context,
            timestamp: new Date().toISOString()
        };

        if (logLevel === 'error') {
            console.error('🚨 Club Error:', logData);
        } else {
            console.warn('⚠️ Club Warning:', logData);
        }
    }

    /**
     * Convertit une erreur Prisma en erreur de club appropriée
     */
    static fromPrismaError(prismaError: PrismaError, context: ClubErrorContext = {}): ClubError {
        // Erreur de contrainte unique
        if (prismaError.code === 'P2002') {
            return new ConflictError(
                "Une ressource avec ces données existe déjà",
                context
            );
        }

        // Ressource non trouvée
        if (prismaError.code === 'P2025') {
            return new ResourceNotFoundError(
                'post', // Type par défaut
                context.postId || 'unknown',
                context
            );
        }

        // Erreur de connexion à la base
        if (prismaError.code === 'P1001') {
            return new DatabaseError(
                "Impossible de se connecter à la base de données",
                prismaError,
                context
            );
        }

        // Erreur générique de base de données
        return new DatabaseError(
            prismaError.message || "Erreur de base de données inconnue",
            prismaError,
            context
        );
    }
}

/**
 * Middleware de gestion d'erreurs pour les routes API
 */
export function withErrorHandling<T extends any[]>(
    handler: (...args: T) => Promise<Response | NextResponse>
) {
    return async (...args: T): Promise<Response | NextResponse> => {
        try {
            return await handler(...args);
        } catch (error) {
            // Log l'erreur
            ErrorUtils.logError(error as Error);

            // Convertir en erreur de club si nécessaire
            let clubError: ClubError;
            if (error instanceof ClubError) {
                clubError = error;
            } else {
                clubError = new DatabaseError(
                    "Erreur interne du serveur",
                    error as Error
                );
            }

            // Retourner la réponse d'erreur
            const isDevelopment = process.env.NODE_ENV === 'development';
            const response = ErrorUtils.toApiResponse(clubError, isDevelopment);

            return new Response(
                JSON.stringify(response),
                {
                    status: clubError.statusCode,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    };
}