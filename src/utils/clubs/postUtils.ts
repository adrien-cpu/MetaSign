/**
 * @fileoverview Utilitaires pour les posts de club
 * @path src/utils/clubs/postUtils.ts
 * @description Fonctions utilitaires pour la gestion des posts
 * @author MetaSign Team
 * @version 2.0.0
 * @since 2025-01-08
 * 
 * @remarks
 * - Fonctions de validation
 * - Formatage des réponses API
 * - Utilitaires de transformation
 * - Helpers pour les erreurs
 * 
 * @dependencies
 * - next/server - NextResponse
 * - @/types/clubs/post.types - Types des posts
 */

import { NextResponse } from 'next/server';
import type {
    ClubPost,
    PostValidationError
} from '@/types/clubs/post.types';

/**
 * Interface pour une réponse d'erreur API
 */
export interface ApiErrorResponse {
    readonly error: string;
    readonly details?: string;
    readonly code?: string;
    readonly timestamp?: string;
}

/**
 * Interface pour une réponse de succès API
 */
export interface ApiSuccessResponse<T> {
    readonly success: true;
    readonly data: T;
    readonly message?: string;
    readonly timestamp?: string;
}

/**
 * Type union pour toutes les réponses API
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Codes d'erreur pour les posts
 */
export const POST_ERROR_CODES = {
    // Erreurs d'authentification
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',

    // Erreurs de ressources
    POST_NOT_FOUND: 'POST_NOT_FOUND',
    CLUB_NOT_FOUND: 'CLUB_NOT_FOUND',
    USER_NOT_FOUND: 'USER_NOT_FOUND',

    // Erreurs de validation
    INVALID_DATA: 'INVALID_DATA',
    CONTENT_REQUIRED: 'CONTENT_REQUIRED',
    CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',
    TOO_MANY_TAGS: 'TOO_MANY_TAGS',
    TAG_TOO_LONG: 'TAG_TOO_LONG',
    TOO_MANY_MEDIA: 'TOO_MANY_MEDIA',
    INVALID_MEDIA_TYPE: 'INVALID_MEDIA_TYPE',

    // Erreurs de permissions
    NOT_CLUB_MEMBER: 'NOT_CLUB_MEMBER',
    CANNOT_EDIT_POST: 'CANNOT_EDIT_POST',
    CANNOT_DELETE_POST: 'CANNOT_DELETE_POST',
    CANNOT_PIN_POST: 'CANNOT_PIN_POST',

    // Erreurs serveur
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

/**
 * Type pour les codes d'erreur
 */
export type PostErrorCode = (typeof POST_ERROR_CODES)[keyof typeof POST_ERROR_CODES];

/**
 * Crée une réponse de succès standardisée
 * 
 * @param data - Données à retourner
 * @param message - Message optionnel
 * @param status - Code de statut HTTP
 * @returns NextResponse avec les données
 * 
 * @example
 * ```typescript
 * return createSuccessResponse(posts, 'Posts récupérés avec succès', 200);
 * ```
 */
export function createSuccessResponse<T>(
    data: T,
    message?: string,
    status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
    const response: ApiSuccessResponse<T> = {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status }) as NextResponse<ApiSuccessResponse<T>>;
}

/**
 * Crée une réponse d'erreur standardisée
 * 
 * @param error - Message d'erreur
 * @param details - Détails optionnels
 * @param code - Code d'erreur
 * @param status - Code de statut HTTP
 * @returns NextResponse avec l'erreur
 * 
 * @example
 * ```typescript
 * return createErrorResponse(
 *   'Post non trouvé',
 *   'Le post avec l\'ID spécifié n\'existe pas',
 *   POST_ERROR_CODES.POST_NOT_FOUND,
 *   404
 * );
 * ```
 */
export function createErrorResponse(
    error: string,
    details?: string,
    code?: PostErrorCode,
    status: number = 500
): NextResponse<ApiErrorResponse> {
    const response: ApiErrorResponse = {
        error,
        details,
        code,
        timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status }) as NextResponse<ApiErrorResponse>;
}

/**
 * Valide les paramètres de pagination
 * 
 * @param page - Numéro de page
 * @param limit - Limite par page
 * @returns Paramètres validés
 * 
 * @example
 * ```typescript
 * const { page, limit } = validatePaginationParams('1', '10');
 * console.log(page); // 1
 * console.log(limit); // 10
 * ```
 */
export function validatePaginationParams(
    page?: string | null,
    limit?: string | null
): { page: number; limit: number } {
    const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit || '10', 10) || 10));

    return {
        page: parsedPage,
        limit: parsedLimit
    };
}

/**
 * Valide les paramètres de tri
 * 
 * @param sortBy - Champ de tri
 * @param sortOrder - Ordre de tri
 * @returns Paramètres de tri validés
 * 
 * @example
 * ```typescript
 * const { sortBy, sortOrder } = validateSortParams('createdAt', 'desc');
 * ```
 */
export function validateSortParams(
    sortBy?: string | null,
    sortOrder?: string | null
): { sortBy: 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount'; sortOrder: 'asc' | 'desc' } {
    const validSortFields = ['createdAt', 'updatedAt', 'likesCount', 'commentsCount'] as const;
    const validSortOrders = ['asc', 'desc'] as const;

    const validatedSortBy = validSortFields.includes(sortBy as (typeof validSortFields)[number])
        ? (sortBy as (typeof validSortFields)[number])
        : 'createdAt';

    const validatedSortOrder = validSortOrders.includes(sortOrder as (typeof validSortOrders)[number])
        ? (sortOrder as (typeof validSortOrders)[number])
        : 'desc';

    return {
        sortBy: validatedSortBy,
        sortOrder: validatedSortOrder
    };
}

/**
 * Parse et valide les tags depuis une chaîne
 * 
 * @param tagsString - Chaîne de tags séparés par des virgules
 * @returns Tableau de tags validés
 * 
 * @example
 * ```typescript
 * const tags = parseTagsFromString('lsf,apprentissage,club');
 * console.log(tags); // ['lsf', 'apprentissage', 'club']
 * ```
 */
export function parseTagsFromString(tagsString?: string | null): string[] {
    if (!tagsString) return [];

    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length <= 50)
        .slice(0, 10); // Maximum 10 tags
}

/**
 * Parse une date depuis une chaîne
 * 
 * @param dateString - Chaîne de date
 * @returns Date parsée ou undefined
 * 
 * @example
 * ```typescript
 * const date = parseDateFromString('2025-01-08T10:00:00Z');
 * console.log(date); // Date object ou undefined
 * ```
 */
export function parseDateFromString(dateString?: string | null): Date | undefined {
    if (!dateString) return undefined;

    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * Valide et nettoie le contenu d'un post
 * 
 * @param content - Contenu brut
 * @returns Contenu nettoyé
 * 
 * @example
 * ```typescript
 * const clean = sanitizePostContent('  Hello world!  ');
 * console.log(clean); // 'Hello world!'
 * ```
 */
export function sanitizePostContent(content: string): string {
    return content
        .trim()
        .replace(/\s+/g, ' ') // Remplace les espaces multiples par un seul
        .substring(0, 2000); // Limite à 2000 caractères
}

/**
 * Formate les erreurs de validation pour l'API
 * 
 * @param errors - Erreurs de validation
 * @returns Message d'erreur formaté
 * 
 * @example
 * ```typescript
 * const formatted = formatValidationErrors([
 *   { field: 'content', message: 'Requis', code: 'REQUIRED' }
 * ]);
 * console.log(formatted); // 'content: Requis'
 * ```
 */
export function formatValidationErrors(errors: PostValidationError[]): string {
    return errors
        .map(error => `${error.field}: ${error.message}`)
        .join(', ');
}

/**
 * Extrait les paramètres de recherche depuis l'URL
 * 
 * @param searchParams - URLSearchParams
 * @returns Paramètres de recherche structurés
 * 
 * @example
 * ```typescript
 * const params = extractSearchParams(new URLSearchParams('?page=1&limit=10'));
 * console.log(params.page); // 1
 * ```
 */
export function extractSearchParams(searchParams: URLSearchParams) {
    const { page, limit } = validatePaginationParams(
        searchParams.get('page'),
        searchParams.get('limit')
    );

    const { sortBy, sortOrder } = validateSortParams(
        searchParams.get('sortBy'),
        searchParams.get('sortOrder')
    );

    return {
        page,
        limit,
        sortBy,
        sortOrder,
        authorId: searchParams.get('authorId') || undefined,
        tags: parseTagsFromString(searchParams.get('tags')),
        mediaType: searchParams.get('mediaType') as 'image' | 'video' | 'document' | undefined,
        formalityLevel: searchParams.get('formalityLevel') as 'formal' | 'informal' | 'neutral' | undefined,
        isPinned: searchParams.get('isPinned') ? searchParams.get('isPinned') === 'true' : undefined,
        search: searchParams.get('search') || undefined,
        dateFrom: parseDateFromString(searchParams.get('dateFrom')),
        dateTo: parseDateFromString(searchParams.get('dateTo')),
    };
}

/**
 * Log sécurisé pour les opérations sur les posts
 * 
 * @param operation - Type d'opération
 * @param postId - ID du post (optionnel)
 * @param userId - ID de l'utilisateur
 * @param clubId - ID du club
 * @param metadata - Métadonnées additionnelles
 * 
 * @example
 * ```typescript
 * logPostOperation('CREATE', 'post123', 'user456', 'club789', { tags: ['lsf'] });
 * ```
 */
export function logPostOperation(
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'GET',
    postId: string | undefined,
    userId: string,
    clubId: string,
    metadata?: Record<string, unknown>
): void {
    const logData = {
        operation,
        postId,
        userId,
        clubId,
        timestamp: new Date().toISOString(),
        ...metadata
    };

    console.log(`📝 Post ${operation}:`, JSON.stringify(logData, null, 2));
}

/**
 * Vérifie si une chaîne est un ID valide (format UUID ou similaire)
 * 
 * @param id - ID à vérifier
 * @returns True si l'ID est valide
 * 
 * @example
 * ```typescript
 * const valid = isValidId('123e4567-e89b-12d3-a456-426614174000');
 * console.log(valid); // true
 * ```
 */
export function isValidId(id: string): boolean {
    // Vérifie le format UUID v4 ou un ID alphanumérique de longueur raisonnable
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const alphanumericRegex = /^[a-zA-Z0-9_-]{8,}$/;

    return uuidRegex.test(id) || alphanumericRegex.test(id);
}

/**
 * Calcule les statistiques d'engagement d'un post
 * 
 * @param post - Post à analyser
 * @returns Statistiques d'engagement
 * 
 * @example
 * ```typescript
 * const stats = calculateEngagementStats(post);
 * console.log(stats.engagementRate); // 0.75
 * ```
 */
export function calculateEngagementStats(post: ClubPost): {
    engagementRate: number;
    likesRatio: number;
    commentsRatio: number;
    isHighEngagement: boolean;
} {
    const totalInteractions = post.likesCount + post.commentsCount;
    const viewsEstimate = Math.max(totalInteractions * 3, 1); // Estimation basique

    const engagementRate = totalInteractions / viewsEstimate;
    const likesRatio = post.likesCount / totalInteractions || 0;
    const commentsRatio = post.commentsCount / totalInteractions || 0;
    const isHighEngagement = engagementRate > 0.1; // Seuil de 10%

    return {
        engagementRate,
        likesRatio,
        commentsRatio,
        isHighEngagement
    };
}

/**
 * Formate une durée relative (ex: "il y a 2 heures")
 * 
 * @param date - Date à formater
 * @returns Chaîne de durée relative
 * 
 * @example
 * ```typescript
 * const relative = formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000));
 * console.log(relative); // 'il y a 2 heures'
 * ```
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'à l\'instant';
    if (diffMinutes < 60) return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('fr-FR');
}