/**
 * @fileoverview Service pour gérer les posts de club
 * @path src/services/clubs/postService.ts
 * @description Logique métier pour la gestion des posts de club
 * @author MetaSign Team
 * @version 2.0.0
 * @since 2025-01-08
 * 
 * @remarks
 * - Gestion complète des posts de club
 * - Validation des permissions
 * - Support des médias et interactions
 * - Cache intelligent
 * 
 * @dependencies
 * - @/lib/prisma - Client Prisma
 * - @/types/clubs/post.types - Types des posts
 */

import { prisma } from '@/lib/prisma';
import type {
    ClubPost,
    CreatePostRequest,
    UpdatePostRequest,
    PostSearchParams,
    PostsResponse,
    PostIncludeOptions,
    PostValidationResult
} from '@/types/clubs/post.types';
import { POST_VALIDATION_CONSTANTS } from '@/types/clubs/post.types';

/**
 * Interface pour un post Prisma avec relations
 */
interface PrismaPostWithRelations {
    id: string;
    content: string;
    authorId: string;
    author: {
        id: string;
        email: string;
        role: string;
    };
    clubId: string;
    mediaUrl: string | null;
    mediaType: string | null;
    likes?: PostLikeData[];
    comments?: PostCommentData[];
    isPinned: boolean;
    tags: string[];
    formalityLevel: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interface pour les données de like
 */
interface PostLikeData {
    id: string;
    userId: string;
    createdAt: Date;
}

/**
 * Interface pour les données de commentaire
 */
interface PostCommentData {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interface pour les clauses WHERE de Prisma
 */
interface PrismaWhereClause {
    clubId: string;
    status: string;
    authorId?: string;
    mediaType?: string;
    formalityLevel?: string;
    isPinned?: boolean;
    tags?: {
        hasSome: string[];
    };
    content?: {
        contains: string;
        mode: string;
    };
    createdAt?: {
        gte?: Date;
        lte?: Date;
    };
}

/**
 * Interface pour les données de mise à jour de post
 */
interface PostUpdateData {
    content?: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    tags?: string[];
    formalityLevel?: string;
    status?: string;
    isPinned?: boolean;
    updatedAt?: Date;
}

/**
 * Interface pour le contexte utilisateur
 */
interface UserContext {
    readonly id: string;
    readonly email: string;
    readonly role: string;
}

/**
 * Interface pour les options de récupération
 */
interface GetPostsOptions extends PostSearchParams {
    readonly userId: string;
    readonly clubId: string;
}

/**
 * Interface pour le résultat d'opération
 */
interface ServiceResult<T> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: string;
    readonly details?: string;
}

/**
 * Service pour la gestion des posts de club
 * 
 * @example
 * ```typescript
 * const postService = new ClubPostService();
 * const result = await postService.createPost(clubId, userContext, createData);
 * if (result.success) {
 *   console.log('Post créé:', result.data);
 * }
 * ```
 */
export class ClubPostService {
    private readonly includeOptions: PostIncludeOptions = {
        author: {
            select: {
                id: true,
                email: true,
                role: true,
            }
        },
        likes: {
            select: {
                id: true,
                userId: true,
                createdAt: true,
            }
        },
        comments: {
            select: {
                id: true,
                content: true,
                authorId: true,
                createdAt: true,
                updatedAt: true,
            }
        }
    };

    /**
     * Valide les données de création d'un post
     * 
     * @param data - Données à valider
     * @returns Résultat de la validation
     */
    public validateCreatePostData(data: CreatePostRequest): PostValidationResult {
        const errors: Array<{ field: string, message: string, code: string }> = [];

        // Validation du contenu
        if (!data.content || data.content.trim().length === 0) {
            errors.push({
                field: 'content',
                message: 'Le contenu ne peut pas être vide',
                code: 'CONTENT_REQUIRED'
            });
        }

        if (data.content && data.content.length > POST_VALIDATION_CONSTANTS.MAX_CONTENT_LENGTH) {
            errors.push({
                field: 'content',
                message: `Le contenu ne peut pas dépasser ${POST_VALIDATION_CONSTANTS.MAX_CONTENT_LENGTH} caractères`,
                code: 'CONTENT_TOO_LONG'
            });
        }

        // Validation des tags
        if (data.tags && data.tags.length > POST_VALIDATION_CONSTANTS.MAX_TAGS_COUNT) {
            errors.push({
                field: 'tags',
                message: `Maximum ${POST_VALIDATION_CONSTANTS.MAX_TAGS_COUNT} tags autorisés`,
                code: 'TOO_MANY_TAGS'
            });
        }

        if (data.tags) {
            for (const tag of data.tags) {
                if (tag.length > POST_VALIDATION_CONSTANTS.MAX_TAG_LENGTH) {
                    errors.push({
                        field: 'tags',
                        message: `Les tags ne peuvent pas dépasser ${POST_VALIDATION_CONSTANTS.MAX_TAG_LENGTH} caractères`,
                        code: 'TAG_TOO_LONG'
                    });
                    break;
                }
            }
        }

        // Validation des médias
        if (data.mediaUrls && data.mediaUrls.length > POST_VALIDATION_CONSTANTS.MAX_MEDIA_URLS) {
            errors.push({
                field: 'mediaUrls',
                message: `Maximum ${POST_VALIDATION_CONSTANTS.MAX_MEDIA_URLS} médias autorisés`,
                code: 'TOO_MANY_MEDIA'
            });
        }

        // Validation du type de média
        if (data.mediaType && !POST_VALIDATION_CONSTANTS.SUPPORTED_MEDIA_TYPES.includes(data.mediaType)) {
            errors.push({
                field: 'mediaType',
                message: 'Type de média non supporté',
                code: 'INVALID_MEDIA_TYPE'
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Vérifie si un utilisateur est membre d'un club
     * 
     * @param userId - ID de l'utilisateur
     * @param clubId - ID du club
     * @returns True si l'utilisateur est membre
     */
    private async checkClubMembership(userId: string, clubId: string): Promise<boolean> {
        const membership = await prisma.clubMembership.findUnique({
            where: {
                userId_clubId: {
                    userId,
                    clubId
                }
            }
        });

        return membership !== null;
    }

    /**
     * Transforme un post Prisma en ClubPost
     * 
     * @param prismaPost - Post depuis Prisma avec relations
     * @param userId - ID de l'utilisateur courant
     * @returns Post transformé
     */
    private transformPrismaPost(prismaPost: PrismaPostWithRelations, userId: string): ClubPost {
        return {
            id: prismaPost.id,
            content: prismaPost.content,
            authorId: prismaPost.authorId,
            author: {
                id: prismaPost.author.id,
                email: prismaPost.author.email,
                role: prismaPost.author.role,
            },
            clubId: prismaPost.clubId,
            mediaUrls: prismaPost.mediaUrl ? [prismaPost.mediaUrl] : [], // Convertir URL unique en tableau
            mediaType: prismaPost.mediaType || null,
            likesCount: prismaPost.likes?.length || 0,
            commentsCount: prismaPost.comments?.length || 0,
            isLikedByUser: prismaPost.likes?.some((like: PostLikeData) => like.userId === userId) || false,
            isPinned: prismaPost.isPinned || false,
            tags: prismaPost.tags || [],
            formalityLevel: prismaPost.formalityLevel || 'neutral',
            status: prismaPost.status || 'active',
            createdAt: prismaPost.createdAt,
            updatedAt: prismaPost.updatedAt || prismaPost.createdAt,
        };
    }

    /**
     * Récupère les posts d'un club avec pagination
     * 
     * @param options - Options de récupération
     * @returns Liste paginée des posts
     */
    public async getPosts(options: GetPostsOptions): Promise<ServiceResult<PostsResponse>> {
        try {
            const {
                userId,
                clubId,
                page = 1,
                limit = POST_VALIDATION_CONSTANTS.DEFAULT_PAGE_SIZE,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                authorId,
                tags,
                mediaType,
                formalityLevel,
                status = 'active',
                isPinned,
                search,
                dateFrom,
                dateTo
            } = options;

            // Vérifier l'adhésion au club
            const isMember = await this.checkClubMembership(userId, clubId);
            if (!isMember) {
                return {
                    success: false,
                    error: "Vous devez être membre du club pour voir les posts"
                };
            }

            // Construire les filtres where
            const where: PrismaWhereClause = {
                clubId,
                status
            };

            if (authorId) where.authorId = authorId;
            if (mediaType) where.mediaType = mediaType;
            if (formalityLevel) where.formalityLevel = formalityLevel;
            if (typeof isPinned === 'boolean') where.isPinned = isPinned;

            if (tags && tags.length > 0) {
                where.tags = {
                    hasSome: tags
                };
            }

            if (search) {
                where.content = {
                    contains: search,
                    mode: 'insensitive'
                };
            }

            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom) where.createdAt.gte = dateFrom;
                if (dateTo) where.createdAt.lte = dateTo;
            }

            // Calculer l'offset
            const offset = (page - 1) * limit;

            // Récupérer les posts et le compte total
            const [posts, totalCount] = await Promise.all([
                prisma.clubPost.findMany({
                    where,
                    include: this.includeOptions,
                    orderBy: {
                        [sortBy]: sortOrder
                    },
                    skip: offset,
                    take: limit
                }),
                prisma.clubPost.count({ where })
            ]);

            // Transformer les posts
            const transformedPosts = posts.map(post => this.transformPrismaPost(post, userId));

            const totalPages = Math.ceil(totalCount / limit);
            const hasMore = page < totalPages;

            return {
                success: true,
                data: {
                    posts: transformedPosts,
                    totalCount,
                    hasMore,
                    page,
                    limit,
                    totalPages
                }
            };

        } catch (error) {
            console.error('Erreur lors de la récupération des posts:', error);
            return {
                success: false,
                error: "Erreur lors de la récupération des posts",
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Crée un nouveau post
     * 
     * @param clubId - ID du club
     * @param userContext - Contexte de l'utilisateur
     * @param data - Données du post à créer
     * @returns Post créé ou erreur
     */
    public async createPost(
        clubId: string,
        userContext: UserContext,
        data: CreatePostRequest
    ): Promise<ServiceResult<ClubPost>> {
        try {
            // Valider les données
            const validation = this.validateCreatePostData(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: "Données invalides",
                    details: validation.errors.map(e => e.message).join(', ')
                };
            }

            // Vérifier l'adhésion au club
            const isMember = await this.checkClubMembership(userContext.id, clubId);
            if (!isMember) {
                return {
                    success: false,
                    error: "Vous devez être membre du club pour créer un post"
                };
            }

            // Créer le post
            const newPost = await prisma.clubPost.create({
                data: {
                    content: data.content.trim(),
                    authorId: userContext.id,
                    clubId: clubId,
                    mediaUrls: data.mediaUrls || [],
                    mediaType: data.mediaType || null,
                    tags: data.tags || [],
                    isPinned: (data.isPinned && userContext.role === 'ADMIN') || false,
                    formalityLevel: data.formalityLevel || 'neutral',
                    status: 'active',
                },
                include: this.includeOptions
            });

            // Transformer le post pour la réponse
            const transformedPost = this.transformPrismaPost(newPost, userContext.id);

            return {
                success: true,
                data: transformedPost
            };

        } catch (error) {
            console.error('Erreur lors de la création du post:', error);
            return {
                success: false,
                error: "Erreur lors de la création du post",
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Met à jour un post existant
     * 
     * @param postId - ID du post
     * @param userContext - Contexte de l'utilisateur
     * @param data - Données de mise à jour
     * @returns Post mis à jour ou erreur
     */
    public async updatePost(
        postId: string,
        userContext: UserContext,
        data: UpdatePostRequest
    ): Promise<ServiceResult<ClubPost>> {
        try {
            // Récupérer le post existant
            const existingPost = await prisma.clubPost.findUnique({
                where: { id: postId },
                include: { author: true }
            });

            if (!existingPost) {
                return {
                    success: false,
                    error: "Post introuvable"
                };
            }

            // Vérifier les permissions
            const canEdit = existingPost.authorId === userContext.id || userContext.role === 'ADMIN';
            if (!canEdit) {
                return {
                    success: false,
                    error: "Vous n'avez pas l'autorisation de modifier ce post"
                };
            }

            // Préparer les données de mise à jour
            const updateData: PostUpdateData = {};

            if (data.content !== undefined) {
                if (data.content.trim().length === 0) {
                    return {
                        success: false,
                        error: "Le contenu ne peut pas être vide"
                    };
                }
                updateData.content = data.content.trim();
            }

            if (data.mediaUrls !== undefined) updateData.mediaUrl = data.mediaUrls[0] || null;
            if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
            if (data.tags !== undefined) updateData.tags = data.tags;
            if (data.formalityLevel !== undefined) updateData.formalityLevel = data.formalityLevel;
            if (data.status !== undefined) updateData.status = data.status;

            // Seuls les admins peuvent épingler/désépingler
            if (data.isPinned !== undefined && userContext.role === 'ADMIN') {
                updateData.isPinned = data.isPinned;
            }

            updateData.updatedAt = new Date();

            // Effectuer la mise à jour
            const updatedPost = await prisma.clubPost.update({
                where: { id: postId },
                data: updateData,
                include: this.includeOptions
            });

            const transformedPost = this.transformPrismaPost(updatedPost, userContext.id);

            return {
                success: true,
                data: transformedPost
            };

        } catch (error) {
            console.error('Erreur lors de la mise à jour du post:', error);
            return {
                success: false,
                error: "Erreur lors de la mise à jour du post",
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Supprime un post
     * 
     * @param postId - ID du post
     * @param userContext - Contexte de l'utilisateur
     * @returns Résultat de la suppression
     */
    public async deletePost(postId: string, userContext: UserContext): Promise<ServiceResult<void>> {
        try {
            const existingPost = await prisma.clubPost.findUnique({
                where: { id: postId }
            });

            if (!existingPost) {
                return {
                    success: false,
                    error: "Post introuvable"
                };
            }

            const canDelete = existingPost.authorId === userContext.id || userContext.role === 'ADMIN';
            if (!canDelete) {
                return {
                    success: false,
                    error: "Vous n'avez pas l'autorisation de supprimer ce post"
                };
            }

            await prisma.clubPost.delete({
                where: { id: postId }
            });

            return {
                success: true
            };

        } catch (error) {
            console.error('Erreur lors de la suppression du post:', error);
            return {
                success: false,
                error: "Erreur lors de la suppression du post",
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }
}