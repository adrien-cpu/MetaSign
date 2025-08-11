/**
 * @fileoverview API route refactorisée pour gérer les posts d'un club
 * @path src/app/api/clubs/[id]/posts/route.ts
 * @description Endpoints REST pour les posts de club avec architecture modulaire
 * @author MetaSign Team
 * @version 2.0.0
 * @since 2025-01-08
 * 
 * @remarks
 * - Architecture refactorisée selon le guide de bonnes pratiques
 * - Séparation claire des responsabilités
 * - Validation stricte des types
 * - Gestion d'erreurs standardisée
 * - Support de la pagination et filtrage avancé
 * 
 * @dependencies
 * - next/server - NextResponse pour les réponses HTTP
 * - next-auth/next - Gestion de l'authentification
 * - @/services/clubs/postService - Service métier pour les posts
 * - @/utils/clubs/postUtils - Utilitaires pour les posts
 * - @/types/clubs/post.types - Types TypeScript pour les posts
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { ClubPostService } from '@/services/clubs/postService';
import {
    createSuccessResponse,
    createErrorResponse,
    extractSearchParams,
    logPostOperation,
    isValidId,
    POST_ERROR_CODES,
    type ApiResponse,
    type ApiErrorResponse,
    type PostErrorCode
} from '@/utils/clubs/postUtils';
import type {
    ClubPost,
    CreatePostRequest,
    PostsResponse
} from '@/types/clubs/post.types';
import { isCreatePostRequest } from '@/types/clubs/post.types';

/**
 * Interface pour les paramètres de route
 */
interface RouteParams {
    params: { id: string };
}

/**
 * Interface pour le contexte utilisateur authentifié
 */
interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
}

/**
 * Instance du service des posts
 */
const postService = new ClubPostService();

/**
 * Valide et récupère les informations de l'utilisateur authentifié
 * 
 * @returns Informations utilisateur ou réponse d'erreur
 */
async function getAuthenticatedUser(): Promise<AuthenticatedUser | NextResponse<ApiErrorResponse>> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        logPostOperation('GET', undefined, 'anonymous', 'unknown', { error: 'No session' });
        return createErrorResponse(
            "Vous devez être connecté pour accéder aux posts",
            "Session utilisateur introuvable",
            POST_ERROR_CODES.UNAUTHORIZED,
            401
        );
    }

    // En production, ces données seraient récupérées depuis la base de données
    // Pour l'exemple, nous utilisons les données de session
    return {
        id: session.user.id || 'unknown',
        email: session.user.email,
        role: session.user.role || 'USER'
    };
}

/**
 * Valide l'ID du club
 * 
 * @param clubId - ID du club à valider
 * @returns True si valide, sinon NextResponse d'erreur
 */
function validateClubId(clubId: string): true | NextResponse<ApiErrorResponse> {
    const decodedClubId = decodeURIComponent(clubId);

    if (!isValidId(decodedClubId)) {
        return createErrorResponse(
            "ID de club invalide",
            "Le format de l'ID du club n'est pas valide",
            POST_ERROR_CODES.INVALID_DATA,
            400
        );
    }

    return true;
}

/**
 * Type guard pour vérifier si un objet est une réponse d'erreur
 */
function isErrorResponse<T>(obj: T | NextResponse<ApiErrorResponse>): obj is NextResponse<ApiErrorResponse> {
    return obj instanceof NextResponse;
}

/**
 * GET /api/clubs/[id]/posts
 * 
 * @description Récupère tous les posts d'un club avec pagination et filtrage
 * @param req - Requête HTTP avec query params
 * @param context - Contexte avec les paramètres de route
 * @returns Liste paginée des posts ou erreur
 * 
 * @example
 * ```
 * GET /api/clubs/club123/posts?page=1&limit=10&sortBy=createdAt&sortOrder=desc
 * GET /api/clubs/club123/posts?tags=lsf,apprentissage&isPinned=true
 * GET /api/clubs/club123/posts?search=bonjour&authorId=user456
 * ```
 * 
 * @throws {400} ID de club invalide
 * @throws {401} Utilisateur non connecté
 * @throws {403} Utilisateur non membre du club
 * @throws {500} Erreur serveur interne
 */
export async function GET(
    req: Request,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse<PostsResponse>>> {
    try {
        const startTime = Date.now();
        const clubId = decodeURIComponent(params.id);

        // Validation de l'ID du club
        const clubValidation = validateClubId(clubId);
        if (clubValidation !== true) {
            return clubValidation;
        }

        // Authentification
        const userResult = await getAuthenticatedUser();
        if (isErrorResponse(userResult)) {
            return userResult;
        }

        // Extraction et validation des paramètres de recherche
        const { searchParams } = new URL(req.url);
        const searchOptions = extractSearchParams(searchParams);

        // Log de l'opération
        logPostOperation('GET', undefined, userResult.id, clubId, {
            searchOptions,
            userAgent: req.headers.get('user-agent')
        });

        // Récupération des posts via le service
        const result = await postService.getPosts({
            ...searchOptions,
            userId: userResult.id,
            clubId
        });

        if (!result.success) {
            const statusCode = result.error?.includes('membre') ? 403 : 500;
            const errorCode: PostErrorCode = result.error?.includes('membre')
                ? POST_ERROR_CODES.NOT_CLUB_MEMBER
                : POST_ERROR_CODES.INTERNAL_ERROR;

            return createErrorResponse(
                result.error || "Erreur lors de la récupération des posts",
                result.details,
                errorCode,
                statusCode
            );
        }

        const processingTime = Date.now() - startTime;

        // Log de succès avec métriques
        logPostOperation('GET', undefined, userResult.id, clubId, {
            postsCount: result.data?.posts.length,
            totalCount: result.data?.totalCount,
            processingTimeMs: processingTime
        });

        return createSuccessResponse(
            result.data!,
            `${result.data!.posts.length} posts récupérés avec succès`,
            200
        );

    } catch (error) {
        console.error("🚨 Erreur critique dans GET /api/clubs/[id]/posts:", error);

        // Log de l'erreur critique
        logPostOperation('GET', undefined, 'unknown', params.id, {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });

        return createErrorResponse(
            "Erreur serveur lors de la récupération des posts",
            error instanceof Error ? error.message : "Erreur inconnue",
            POST_ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
}

/**
 * POST /api/clubs/[id]/posts
 * 
 * @description Crée un nouveau post dans un club
 * @param req - Requête HTTP avec le body JSON
 * @param context - Contexte avec les paramètres de route
 * @returns Post créé ou erreur
 * 
 * @example
 * ```
 * POST /api/clubs/club123/posts
 * Content-Type: application/json
 * 
 * {
 *   "content": "Bonjour à tous ! Voici mon nouveau post.",
 *   "tags": ["lsf", "apprentissage"],
 *   "mediaUrls": ["https://example.com/image.jpg"],
 *   "mediaType": "image",
 *   "formalityLevel": "neutral"
 * }
 * ```
 * 
 * @throws {400} Données invalides ou ID club invalide
 * @throws {401} Utilisateur non connecté
 * @throws {403} Utilisateur non membre du club
 * @throws {413} Contenu trop volumineux
 * @throws {500} Erreur serveur interne
 */
export async function POST(
    req: Request,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse<ClubPost>>> {
    try {
        const startTime = Date.now();
        const clubId = decodeURIComponent(params.id);

        // Validation de l'ID du club
        const clubValidation = validateClubId(clubId);
        if (clubValidation !== true) {
            return clubValidation;
        }

        // Authentification
        const userResult = await getAuthenticatedUser();
        if (isErrorResponse(userResult)) {
            return userResult;
        }

        // Validation et parsing du body
        let requestBody: CreatePostRequest;
        try {
            const rawBody = await req.json();

            if (!isCreatePostRequest(rawBody)) {
                return createErrorResponse(
                    "Format de données invalide",
                    "Le body de la requête ne respecte pas le format attendu",
                    POST_ERROR_CODES.INVALID_DATA,
                    400
                );
            }

            requestBody = rawBody;
        } catch (parseError) {
            logPostOperation('CREATE', undefined, userResult.id, clubId, {
                error: 'JSON parsing failed',
                parseError: parseError instanceof Error ? parseError.message : 'Unknown'
            });

            return createErrorResponse(
                "Format de requête invalide",
                "Le body JSON ne peut pas être parsé",
                POST_ERROR_CODES.INVALID_DATA,
                400
            );
        }

        // Log de l'opération avec métadonnées
        logPostOperation('CREATE', undefined, userResult.id, clubId, {
            contentLength: requestBody.content.length,
            tagsCount: requestBody.tags?.length || 0,
            mediaCount: requestBody.mediaUrls?.length || 0,
            mediaType: requestBody.mediaType,
            userAgent: req.headers.get('user-agent')
        });

        // Création du post via le service
        const result = await postService.createPost(clubId, userResult, requestBody);

        if (!result.success) {
            let statusCode = 500;
            let errorCode: PostErrorCode = POST_ERROR_CODES.INTERNAL_ERROR;

            // Détermination du code d'erreur approprié
            if (result.error?.includes('invalides')) {
                statusCode = 400;
                errorCode = POST_ERROR_CODES.INVALID_DATA;
            } else if (result.error?.includes('membre')) {
                statusCode = 403;
                errorCode = POST_ERROR_CODES.NOT_CLUB_MEMBER;
            } else if (result.error?.includes('dépasser')) {
                statusCode = 413;
                errorCode = POST_ERROR_CODES.CONTENT_TOO_LONG;
            }

            return createErrorResponse(
                result.error || "Erreur lors de la création du post",
                result.details,
                errorCode,
                statusCode
            );
        }

        const processingTime = Date.now() - startTime;

        // Log de succès
        logPostOperation('CREATE', result.data!.id, userResult.id, clubId, {
            postId: result.data!.id,
            processingTimeMs: processingTime,
            finalContentLength: result.data!.content.length
        });

        return createSuccessResponse(
            result.data!,
            `Post créé avec succès dans le club`,
            201
        );

    } catch (error) {
        console.error("🚨 Erreur critique dans POST /api/clubs/[id]/posts:", error);

        // Log de l'erreur critique
        logPostOperation('CREATE', undefined, 'unknown', params.id, {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });

        return createErrorResponse(
            "Erreur serveur lors de la création du post",
            error instanceof Error ? error.message : "Erreur inconnue",
            POST_ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
}

/**
 * OPTIONS /api/clubs/[id]/posts
 * 
 * @description Gère les requêtes CORS preflight
 * @returns Headers CORS appropriés
 */
export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        },
    });
}