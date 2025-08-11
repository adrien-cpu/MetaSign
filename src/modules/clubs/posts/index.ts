/**
 * @fileoverview Barrel export pour le module des posts de club
 * @path src/modules/clubs/posts/index.ts
 * @description Point d'entrée unique pour tous les exports liés aux posts de club
 * @author MetaSign Team
 * @version 2.0.0
 * @since 2025-01-08
 * 
 * @remarks
 * - Centralise tous les exports du module posts
 * - Facilite les imports dans d'autres modules
 * - Maintient une API claire et cohérente
 * 
 * @dependencies
 * - Types et interfaces des posts
 * - Service métier
 * - Utilitaires et helpers
 * - Gestion d'erreurs
 */

// ===== TYPES ET INTERFACES =====
export type {
    ClubPost,
    CreatePostRequest,
    UpdatePostRequest,
    PostSearchParams,
    PostsResponse,
    PostAuthor,
    PostLike,
    PostComment,
    PostMetadata,
    PostStatistics,
    PostActivity,
    PostIncludeOptions,
    PostValidationError,
    PostValidationResult,
    MediaType,
    FormalityLevel,
    PostStatus,
    PrismaClubPostWithRelations,
    PostValidationConstants
} from '@/types/clubs/post.types';

// Type guards
export {
    isClubPost,
    isCreatePostRequest,
    POST_VALIDATION_CONSTANTS
} from '@/types/clubs/post.types';

// ===== SERVICE MÉTIER =====
export { ClubPostService } from '@/services/clubs/postService';

// ===== UTILITAIRES ET HELPERS =====
export {
    createSuccessResponse,
    createErrorResponse,
    validatePaginationParams,
    validateSortParams,
    parseTagsFromString,
    parseDateFromString,
    sanitizePostContent,
    formatValidationErrors,
    extractSearchParams,
    logPostOperation,
    isValidId,
    calculateEngagementStats,
    formatRelativeTime,
    POST_ERROR_CODES
} from '@/utils/clubs/postUtils';

// Types utilitaires
export type {
    ApiErrorResponse,
    ApiSuccessResponse,
    ApiResponse,
    PostErrorCode
} from '@/utils/clubs/postUtils';

// ===== GESTION D'ERREURS =====
export {
    ClubError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    ValidationError,
    RateLimitError,
    PayloadTooLargeError,
    ConflictError,
    DatabaseError,
    ClubMembershipError,
    ErrorUtils,
    withErrorHandling
} from '@/errors/clubs/clubErrors';

// Types d'erreurs
export type {
    ClubErrorContext
} from '@/errors/clubs/clubErrors';

// ===== CONSTANTES ET CONFIGURATIONS =====

/**
 * Configuration par défaut pour les posts
 */
export const DEFAULT_POST_CONFIG = {
    pagination: {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100
    },
    validation: {
        maxContentLength: 2000,
        maxTagsCount: 10,
        maxTagLength: 50,
        maxMediaUrls: 5
    },
    features: {
        enableRichText: true,
        enableMediaUpload: true,
        enableTagging: true,
        enablePinning: true,
        enableModeration: true
    }
} as const;

/**
 * Mapping des types de médias vers leurs extensions
 */
export const MEDIA_TYPE_EXTENSIONS = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    document: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt']
} as const;

/**
 * Patterns de validation pour les posts
 */
export const VALIDATION_PATTERNS = {
    // Pattern pour un ID valide (UUID v4 ou alphanumérique)
    validId: /^([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[a-zA-Z0-9_-]{8,})$/i,

    // Pattern pour les tags (lettres, chiffres, tirets et underscores)
    validTag: /^[a-zA-Z0-9_-]{1,50}$/,

    // Pattern pour les URLs de médias
    validMediaUrl: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|mp4|avi|mov|wmv|flv|webm|pdf|doc|docx|txt|rtf|odt)$/i,

    // Pattern pour le contenu (pas de caractères de contrôle)
    validContent: /^[^\x00-\x1F\x7F]*$/
} as const;

/**
 * Messages d'erreur localisés
 */
export const ERROR_MESSAGES = {
    fr: {
        'UNAUTHORIZED': "Vous devez être connecté pour effectuer cette action",
        'FORBIDDEN': "Vous n'avez pas les permissions nécessaires",
        'POST_NOT_FOUND': "Post introuvable",
        'CLUB_NOT_FOUND': "Club introuvable",
        'USER_NOT_FOUND': "Utilisateur introuvable",
        'INVALID_DATA': "Données invalides",
        'CONTENT_REQUIRED': "Le contenu est requis",
        'CONTENT_TOO_LONG': "Le contenu est trop long",
        'TOO_MANY_TAGS': "Trop de tags",
        'TAG_TOO_LONG': "Tag trop long",
        'TOO_MANY_MEDIA': "Trop de médias",
        'INVALID_MEDIA_TYPE': "Type de média invalide",
        'NOT_CLUB_MEMBER': "Adhésion au club requise",
        'CANNOT_EDIT_POST': "Impossible de modifier ce post",
        'CANNOT_DELETE_POST': "Impossible de supprimer ce post",
        'CANNOT_PIN_POST': "Impossible d'épingler ce post",
        'INTERNAL_ERROR': "Erreur interne du serveur",
        'DATABASE_ERROR': "Erreur de base de données"
    },
    en: {
        'UNAUTHORIZED': "You must be logged in to perform this action",
        'FORBIDDEN': "You don't have the necessary permissions",
        'POST_NOT_FOUND': "Post not found",
        'CLUB_NOT_FOUND': "Club not found",
        'USER_NOT_FOUND': "User not found",
        'INVALID_DATA': "Invalid data",
        'CONTENT_REQUIRED': "Content is required",
        'CONTENT_TOO_LONG': "Content is too long",
        'TOO_MANY_TAGS': "Too many tags",
        'TAG_TOO_LONG': "Tag is too long",
        'TOO_MANY_MEDIA': "Too many media files",
        'INVALID_MEDIA_TYPE': "Invalid media type",
        'NOT_CLUB_MEMBER': "Club membership required",
        'CANNOT_EDIT_POST': "Cannot edit this post",
        'CANNOT_DELETE_POST': "Cannot delete this post",
        'CANNOT_PIN_POST': "Cannot pin this post",
        'INTERNAL_ERROR': "Internal server error",
        'DATABASE_ERROR': "Database error"
    }
} as const;

/**
 * Helper pour obtenir un message d'erreur localisé
 * 
 * @param code - Code d'erreur
 * @param language - Langue (fr ou en)
 * @returns Message d'erreur localisé
 */
export function getErrorMessage(
    code: PostErrorCode,
    language: 'fr' | 'en' = 'fr'
): string {
    return ERROR_MESSAGES[language][code] || ERROR_MESSAGES.fr['INTERNAL_ERROR'];
}

/**
 * Helper pour créer une réponse d'erreur localisée
 * 
 * @param code - Code d'erreur
 * @param language - Langue
 * @param details - Détails optionnels
 * @param statusCode - Code de statut HTTP
 * @returns Réponse d'erreur formatée
 */
export function createLocalizedErrorResponse(
    code: PostErrorCode,
    language: 'fr' | 'en' = 'fr',
    details?: string,
    statusCode?: number
) {
    const message = getErrorMessage(code, language);
    return createErrorResponse(message, details, code, statusCode);
}

/**
 * Type pour les langues supportées
 */
export type SupportedLanguage = keyof typeof ERROR_MESSAGES;

/**
 * Configuration des limites par rôle utilisateur
 */
export const ROLE_LIMITS = {
    USER: {
        maxPostsPerDay: 50,
        maxMediaSize: 10 * 1024 * 1024, // 10MB
        canPinPosts: false,
        canModerate: false
    },
    MODERATOR: {
        maxPostsPerDay: 200,
        maxMediaSize: 50 * 1024 * 1024, // 50MB
        canPinPosts: true,
        canModerate: true
    },
    ADMIN: {
        maxPostsPerDay: 1000,
        maxMediaSize: 100 * 1024 * 1024, // 100MB
        canPinPosts: true,
        canModerate: true
    }
} as const;

/**
 * Type pour les rôles d'utilisateur
 */
export type UserRole = keyof typeof ROLE_LIMITS;