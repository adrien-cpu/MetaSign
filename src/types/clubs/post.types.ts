/**
 * @fileoverview Types et interfaces pour les posts de club
 * @path src/types/clubs/post.types.ts
 * @description Définit tous les types TypeScript pour la gestion des posts de club
 * @author MetaSign Team
 * @version 2.0.0
 * @since 2025-01-08
 * 
 * @remarks
 * - Types stricts pour éviter les erreurs `any`
 * - Compatible avec exactOptionalPropertyTypes
 * - Support des médias multiples
 * - Système de likes et commentaires
 * 
 * @dependencies
 * - Prisma types générés
 */

import type { ClubPost as PrismaClubPost } from '@prisma/client';

/**
 * Type de média supporté pour les posts
 */
export type MediaType = 'image' | 'video' | 'document';

/**
 * Niveau de formalité d'un post
 */
export type FormalityLevel = 'formal' | 'informal' | 'neutral';

/**
 * Statut d'un post
 */
export type PostStatus = 'active' | 'archived' | 'deleted';

/**
 * Interface pour l'auteur d'un post (version simplifiée)
 */
export interface PostAuthor {
    readonly id: string;
    readonly email: string;
    readonly role: string;
    readonly displayName?: string;
    readonly avatarUrl?: string;
}

/**
 * Interface pour un like sur un post
 */
export interface PostLike {
    readonly id: string;
    readonly userId: string;
    readonly postId: string;
    readonly createdAt: Date;
    readonly user?: PostAuthor;
}

/**
 * Interface pour un commentaire sur un post
 */
export interface PostComment {
    readonly id: string;
    readonly content: string;
    readonly authorId: string;
    readonly postId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly author?: PostAuthor;
    readonly isEdited: boolean;
}

/**
 * Interface pour les métadonnées d'un post
 */
export interface PostMetadata {
    readonly viewCount: number;
    readonly shareCount: number;
    readonly lastViewedAt?: Date;
    readonly lastSharedAt?: Date;
    readonly readingTime?: number; // en minutes
}

/**
 * Interface complète pour un post de club
 */
export interface ClubPost {
    readonly id: string;
    readonly content: string;
    readonly authorId: string;
    readonly author: PostAuthor;
    readonly clubId: string;
    readonly mediaUrls: string[];
    readonly mediaType: MediaType | null;
    readonly likesCount: number;
    readonly commentsCount: number;
    readonly isLikedByUser: boolean;
    readonly isPinned: boolean;
    readonly tags: string[];
    readonly formalityLevel: FormalityLevel;
    readonly status: PostStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly metadata?: PostMetadata;
}

/**
 * Interface pour la création d'un post
 */
export interface CreatePostRequest {
    readonly content: string;
    readonly mediaUrls?: string[];
    readonly mediaType?: MediaType;
    readonly tags?: string[];
    readonly isPinned?: boolean;
    readonly formalityLevel?: FormalityLevel;
}

/**
 * Interface pour la mise à jour d'un post
 */
export interface UpdatePostRequest {
    readonly content?: string;
    readonly mediaUrls?: string[];
    readonly mediaType?: MediaType;
    readonly tags?: string[];
    readonly isPinned?: boolean;
    readonly formalityLevel?: FormalityLevel;
    readonly status?: PostStatus;
}

/**
 * Interface pour les paramètres de recherche/filtrage
 */
export interface PostSearchParams {
    readonly page?: number;
    readonly limit?: number;
    readonly sortBy?: 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount';
    readonly sortOrder?: 'asc' | 'desc';
    readonly authorId?: string;
    readonly tags?: string[];
    readonly mediaType?: MediaType;
    readonly formalityLevel?: FormalityLevel;
    readonly status?: PostStatus;
    readonly isPinned?: boolean;
    readonly search?: string;
    readonly dateFrom?: Date;
    readonly dateTo?: Date;
}

/**
 * Interface pour la réponse paginée des posts
 */
export interface PostsResponse {
    readonly posts: ClubPost[];
    readonly totalCount: number;
    readonly hasMore: boolean;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
}

/**
 * Extension Prisma pour inclure les relations
 */
export interface PrismaClubPostWithRelations extends PrismaClubPost {
    readonly author: PostAuthor;
    readonly likes: PostLike[];
    readonly comments: PostComment[];
}

/**
 * Interface pour les options d'inclusion Prisma
 */
export interface PostIncludeOptions {
    readonly author?: boolean | {
        select?: {
            id?: boolean;
            email?: boolean;
            role?: boolean;
            displayName?: boolean;
            avatarUrl?: boolean;
        };
    };
    readonly likes?: boolean | {
        select?: {
            id?: boolean;
            userId?: boolean;
            createdAt?: boolean;
            user?: boolean;
        };
    };
    readonly comments?: boolean | {
        select?: {
            id?: boolean;
            content?: boolean;
            authorId?: boolean;
            createdAt?: boolean;
            updatedAt?: boolean;
            author?: boolean;
        };
    };
}

/**
 * Interface pour les erreurs de validation
 */
export interface PostValidationError {
    readonly field: string;
    readonly message: string;
    readonly code: string;
}

/**
 * Interface pour le résultat de validation
 */
export interface PostValidationResult {
    readonly isValid: boolean;
    readonly errors: PostValidationError[];
}

/**
 * Type pour les statistiques d'un post
 */
export interface PostStatistics {
    readonly totalViews: number;
    readonly totalLikes: number;
    readonly totalComments: number;
    readonly totalShares: number;
    readonly engagementRate: number;
    readonly averageReadingTime: number;
    readonly peakActivityTime?: Date;
}

/**
 * Interface pour l'activité sur un post
 */
export interface PostActivity {
    readonly type: 'like' | 'comment' | 'share' | 'view' | 'pin' | 'unpin';
    readonly userId: string;
    readonly postId: string;
    readonly timestamp: Date;
    readonly metadata?: Record<string, unknown>;
}

/**
 * Type guard pour vérifier si un objet est un ClubPost valide
 */
export function isClubPost(obj: unknown): obj is ClubPost {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof (obj as ClubPost).id === 'string' &&
        typeof (obj as ClubPost).content === 'string' &&
        typeof (obj as ClubPost).authorId === 'string' &&
        typeof (obj as ClubPost).clubId === 'string' &&
        Array.isArray((obj as ClubPost).mediaUrls) &&
        typeof (obj as ClubPost).likesCount === 'number' &&
        typeof (obj as ClubPost).commentsCount === 'number' &&
        typeof (obj as ClubPost).isPinned === 'boolean' &&
        Array.isArray((obj as ClubPost).tags) &&
        (obj as ClubPost).createdAt instanceof Date &&
        (obj as ClubPost).updatedAt instanceof Date
    );
}

/**
 * Type guard pour vérifier si un objet est une CreatePostRequest valide
 */
export function isCreatePostRequest(obj: unknown): obj is CreatePostRequest {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof (obj as CreatePostRequest).content === 'string' &&
        (obj as CreatePostRequest).content.trim().length > 0
    );
}

/**
 * Constantes pour la validation
 */
export const POST_VALIDATION_CONSTANTS = {
    MAX_CONTENT_LENGTH: 2000,
    MIN_CONTENT_LENGTH: 1,
    MAX_TAGS_COUNT: 10,
    MAX_TAG_LENGTH: 50,
    MAX_MEDIA_URLS: 5,
    SUPPORTED_MEDIA_TYPES: ['image', 'video', 'document'] as const,
    SUPPORTED_FORMALITY_LEVELS: ['formal', 'informal', 'neutral'] as const,
    SUPPORTED_SORT_FIELDS: ['createdAt', 'updatedAt', 'likesCount', 'commentsCount'] as const,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
} as const;

/**
 * Type pour les constantes de validation (readonly)
 */
export type PostValidationConstants = typeof POST_VALIDATION_CONSTANTS;