/**
 * @file src/ai/services/learning/human/coda/codavirtuel/api/controllers/UserController.ts
 * @description Contrôleur API REST pour la gestion des utilisateurs CODA
 * 
 * Fonctionnalités :
 * - 👤 CRUD complet des utilisateurs
 * - 📊 Métriques et progression détaillées
 * - 🔍 Recherche et filtrage avancés
 * - ⚙️ Gestion des préférences utilisateur
 * - 🔄 Validation des données entrantes
 * - 📝 Documentation OpenAPI/Swagger
 * 
 * @module api/controllers
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA API
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type { EnhancedUserRepository, EnhancedUserData, UserSearchOptions } from '../../repositories/EnhancedUserRepository';
import type { UserReverseProfile, CECRLLevel } from '../../types/index';

/**
 * Interfaces pour les requêtes API
 */
export interface CreateUserRequest {
    readonly userId: string;
    readonly profile: {
        readonly name?: string;
        readonly currentLevel: CECRLLevel;
        readonly preferredLanguage?: string;
        readonly culturalBackground?: string;
        readonly learningGoals?: string[];
    };
}

export interface UpdateUserProfileRequest {
    readonly name?: string;
    readonly currentLevel?: CECRLLevel;
    readonly preferredLanguage?: string;
    readonly culturalBackground?: string;
    readonly learningGoals?: string[];
}

export interface UpdateUserPreferencesRequest {
    readonly teachingStyle?: 'visual' | 'interactive' | 'step_by_step' | 'immersive';
    readonly preferredSessionDuration?: number;
    readonly difficultyPreference?: 'challenging' | 'comfortable' | 'easy';
    readonly notificationSettings?: {
        readonly dailyReminders?: boolean;
        readonly progressUpdates?: boolean;
        readonly achievementAlerts?: boolean;
    };
    readonly accessibilityOptions?: {
        readonly highContrast?: boolean;
        readonly largeText?: boolean;
        readonly reducedMotion?: boolean;
        readonly screenReaderOptimized?: boolean;
    };
}

export interface UserSearchRequest {
    readonly level?: CECRLLevel;
    readonly minSessions?: number;
    readonly maxSessions?: number;
    readonly lastActivitySince?: string; // ISO date string
    readonly hasWeakAreas?: string[];
    readonly profileComplete?: boolean;
    readonly limit?: number;
    readonly offset?: number;
}

/**
 * Interfaces pour les réponses API
 */
export interface UserResponse {
    readonly userId: string;
    readonly profile: UserReverseProfile;
    readonly metrics: {
        readonly totalSessions: number;
        readonly totalLearningTime: number;
        readonly currentLevel: CECRLLevel;
        readonly conceptsMastered: string[];
        readonly strongAreas: string[];
        readonly weakAreas: string[];
        readonly currentStreak: number;
        readonly longestStreak: number;
        readonly lastActivityDate: string;
    };
    readonly preferences: {
        readonly teachingStyle: string;
        readonly preferredSessionDuration: number;
        readonly difficultyPreference: string;
        readonly notificationSettings: Record<string, boolean>;
        readonly accessibilityOptions: Record<string, boolean>;
    };
    readonly metadata: {
        readonly createdAt: string;
        readonly lastUpdatedAt: string;
        readonly lastLoginAt: string;
    };
}

export interface ApiResponse<T = any> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: {
        readonly code: string;
        readonly message: string;
        readonly details?: Record<string, unknown>;
    };
    readonly timestamp: string;
    readonly requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    readonly pagination?: {
        readonly total: number;
        readonly limit: number;
        readonly offset: number;
        readonly hasMore: boolean;
    };
}

/**
 * Contrôleur pour les opérations utilisateur
 */
export class UserController {
    private readonly logger = LoggerFactory.getLogger('UserController');

    constructor(
        private readonly userRepository: EnhancedUserRepository
    ) {}

    // ==================== MÉTHODES HTTP ====================

    /**
     * POST /api/users
     * Crée un nouveau utilisateur
     */
    public async createUser(request: CreateUserRequest): Promise<ApiResponse<UserResponse>> {
        const requestId = this.generateRequestId();
        
        try {
            this.logger.info('📝 Création nouvel utilisateur', {
                requestId,
                userId: request.userId,
                level: request.profile.currentLevel
            });

            // Validation des données
            const validationError = this.validateCreateUserRequest(request);
            if (validationError) {
                return this.errorResponse(validationError, 'VALIDATION_ERROR', requestId);
            }

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await this.userRepository.getUser(request.userId);
            if (existingUser) {
                return this.errorResponse(
                    `Utilisateur déjà existant: ${request.userId}`,
                    'USER_ALREADY_EXISTS',
                    requestId
                );
            }

            // Créer le profil utilisateur
            const userProfile: UserReverseProfile = {
                userId: request.userId,
                currentLevel: request.profile.currentLevel,
                progressHistory: [],
                strengths: [],
                weaknesses: [],
                learningPreferences: ['visual'],
                culturalBackground: 'deaf_family_home' as const,
                motivationFactors: ['progress'],
                learningStyle: 'visual' as const,
                sessionCount: 0,
                totalLearningTime: 0,
                lastActivity: new Date()
            };

            // Créer l'utilisateur
            await this.userRepository.createUser(request.userId, userProfile);

            // Récupérer les données complètes créées
            const createdUser = await this.userRepository.getUser(request.userId);
            if (!createdUser) {
                throw new Error('Erreur lors de la création utilisateur');
            }

            const response = this.transformToUserResponse(request.userId, createdUser);

            this.logger.info('✅ Utilisateur créé avec succès', {
                requestId,
                userId: request.userId
            });

            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur création utilisateur', {
                requestId,
                userId: request.userId,
                error
            });

            return this.errorResponse(
                'Erreur interne lors de la création utilisateur',
                'INTERNAL_ERROR',
                requestId,
                { originalError: String(error) }
            );
        }
    }

    /**
     * GET /api/users/:userId
     * Récupère un utilisateur par son ID
     */
    public async getUser(userId: string): Promise<ApiResponse<UserResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.debug('🔍 Récupération utilisateur', { requestId, userId });

            const userData = await this.userRepository.getUser(userId);
            if (!userData) {
                return this.errorResponse(
                    `Utilisateur non trouvé: ${userId}`,
                    'USER_NOT_FOUND',
                    requestId
                );
            }

            const response = this.transformToUserResponse(userId, userData);
            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur récupération utilisateur', {
                requestId,
                userId,
                error
            });

            return this.errorResponse(
                'Erreur lors de la récupération utilisateur',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    /**
     * PUT /api/users/:userId/profile
     * Met à jour le profil d'un utilisateur
     */
    public async updateUserProfile(
        userId: string, 
        updates: UpdateUserProfileRequest
    ): Promise<ApiResponse<UserResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.info('🔄 Mise à jour profil utilisateur', {
                requestId,
                userId,
                updates: Object.keys(updates)
            });

            // Vérifier que l'utilisateur existe
            const existingUser = await this.userRepository.getUser(userId);
            if (!existingUser) {
                return this.errorResponse(
                    `Utilisateur non trouvé: ${userId}`,
                    'USER_NOT_FOUND',
                    requestId
                );
            }

            // Validation des données
            const validationError = this.validateUpdateProfileRequest(updates);
            if (validationError) {
                return this.errorResponse(validationError, 'VALIDATION_ERROR', requestId);
            }

            // Appliquer les mises à jour
            const profileUpdates: Partial<UserReverseProfile> = {};
            if (updates.name !== undefined) {
                // Le profil n'a pas de champ name direct - adapter selon la structure réelle
            }
            if (updates.currentLevel !== undefined) {
                (profileUpdates as { currentLevel?: string }).currentLevel = updates.currentLevel;
            }
            if (updates.culturalBackground !== undefined) {
                (profileUpdates as { culturalContext?: string }).culturalContext = updates.culturalBackground;
            }
            if (updates.learningGoals !== undefined) {
                // Adapter selon la structure réelle du profil
            }

            await this.userRepository.updateUserProfile(userId, profileUpdates);

            // Récupérer les données mises à jour
            const updatedUser = await this.userRepository.getUser(userId);
            if (!updatedUser) {
                throw new Error('Erreur lors de la mise à jour');
            }

            const response = this.transformToUserResponse(userId, updatedUser);

            this.logger.info('✅ Profil utilisateur mis à jour', { requestId, userId });
            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur mise à jour profil', {
                requestId,
                userId,
                error
            });

            return this.errorResponse(
                'Erreur lors de la mise à jour du profil',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    /**
     * PUT /api/users/:userId/preferences
     * Met à jour les préférences d'un utilisateur
     */
    public async updateUserPreferences(
        userId: string,
        preferences: UpdateUserPreferencesRequest
    ): Promise<ApiResponse<UserResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.info('⚙️ Mise à jour préférences utilisateur', {
                requestId,
                userId
            });

            // Vérifier que l'utilisateur existe
            const existingUser = await this.userRepository.getUser(userId);
            if (!existingUser) {
                return this.errorResponse(
                    `Utilisateur non trouvé: ${userId}`,
                    'USER_NOT_FOUND',
                    requestId
                );
            }

            // Convertir les préférences en format compatible
            const compatiblePreferences: {
                dailyReminders?: boolean;
                progressUpdates?: boolean;
                achievementAlerts?: boolean;
            } = {};
            
            if (preferences.notificationSettings) {
                const notifications = preferences.notificationSettings;
                if (notifications.dailyReminders !== undefined) {
                    compatiblePreferences.dailyReminders = notifications.dailyReminders;
                }
                if (notifications.progressUpdates !== undefined) {
                    compatiblePreferences.progressUpdates = notifications.progressUpdates;
                }
                if (notifications.achievementAlerts !== undefined) {
                    compatiblePreferences.achievementAlerts = notifications.achievementAlerts;
                }
            }
            
            await this.userRepository.updateUserPreferences(userId, {
                ...preferences,
                notificationSettings: compatiblePreferences as { 
                    readonly dailyReminders: boolean; 
                    readonly progressUpdates: boolean; 
                    readonly achievementAlerts: boolean; 
                }
            } as Parameters<typeof this.userRepository.updateUserPreferences>[1]);

            // Récupérer les données mises à jour
            const updatedUser = await this.userRepository.getUser(userId);
            if (!updatedUser) {
                throw new Error('Erreur lors de la mise à jour');
            }

            const response = this.transformToUserResponse(userId, updatedUser);
            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur mise à jour préférences', {
                requestId,
                userId,
                error
            });

            return this.errorResponse(
                'Erreur lors de la mise à jour des préférences',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    /**
     * DELETE /api/users/:userId
     * Supprime un utilisateur
     */
    public async deleteUser(userId: string): Promise<ApiResponse<void>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.info('🗑️ Suppression utilisateur', { requestId, userId });

            // Vérifier que l'utilisateur existe
            const existingUser = await this.userRepository.getUser(userId);
            if (!existingUser) {
                return this.errorResponse(
                    `Utilisateur non trouvé: ${userId}`,
                    'USER_NOT_FOUND',
                    requestId
                );
            }

            await this.userRepository.deleteUser(userId);

            this.logger.info('✅ Utilisateur supprimé', { requestId, userId });
            return this.successResponse(undefined, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur suppression utilisateur', {
                requestId,
                userId,
                error
            });

            return this.errorResponse(
                'Erreur lors de la suppression utilisateur',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    /**
     * GET /api/users
     * Recherche des utilisateurs avec filtrage
     */
    public async searchUsers(searchParams: UserSearchRequest): Promise<PaginatedResponse<UserResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.debug('🔍 Recherche utilisateurs', { requestId, searchParams });

            // Convertir les paramètres de recherche
            const searchOptions: UserSearchOptions = {
                level: searchParams.level,
                minSessions: searchParams.minSessions,
                maxSessions: searchParams.maxSessions,
                lastActivitySince: searchParams.lastActivitySince ? 
                    new Date(searchParams.lastActivitySince) : undefined,
                hasWeakAreas: searchParams.hasWeakAreas,
                profileComplete: searchParams.profileComplete
            };

            const users = await this.userRepository.searchUsers(searchOptions);
            
            // Appliquer pagination
            const limit = searchParams.limit || 20;
            const offset = searchParams.offset || 0;
            const paginatedUsers = users.slice(offset, offset + limit);

            // Transformer en réponses API
            const userResponses = paginatedUsers.map((userData, index) => {
                // Générer un userId depuis l'index (à améliorer avec vraies données)
                const userId = userData.profile.userId || `user_${offset + index}`;
                return this.transformToUserResponse(userId, userData);
            });

            const response: PaginatedResponse<UserResponse> = {
                success: true,
                data: userResponses,
                pagination: {
                    total: users.length,
                    limit,
                    offset,
                    hasMore: offset + limit < users.length
                },
                timestamp: new Date().toISOString(),
                requestId
            };

            return response;

        } catch (error) {
            this.logger.error('❌ Erreur recherche utilisateurs', {
                requestId,
                searchParams,
                error
            });

            return {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Erreur lors de la recherche utilisateurs'
                },
                timestamp: new Date().toISOString(),
                requestId
            };
        }
    }

    /**
     * GET /api/users/:userId/metrics
     * Récupère les métriques détaillées d'un utilisateur
     */
    public async getUserMetrics(userId: string): Promise<ApiResponse<unknown>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.debug('📊 Récupération métriques utilisateur', { requestId, userId });

            const metrics = await this.userRepository.getUserMetrics(userId);
            if (!metrics) {
                return this.errorResponse(
                    `Métriques non trouvées pour l'utilisateur: ${userId}`,
                    'METRICS_NOT_FOUND',
                    requestId
                );
            }

            return this.successResponse(metrics, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur récupération métriques', {
                requestId,
                userId,
                error
            });

            return this.errorResponse(
                'Erreur lors de la récupération des métriques',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    private transformToUserResponse(userId: string, userData: EnhancedUserData): UserResponse {
        return {
            userId,
            profile: userData.profile,
            metrics: {
                totalSessions: userData.metrics.totalSessions,
                totalLearningTime: userData.metrics.totalLearningTime,
                currentLevel: userData.metrics.levelProgression.currentLevel,
                conceptsMastered: userData.metrics.conceptsMastered,
                strongAreas: userData.metrics.strongAreas,
                weakAreas: userData.metrics.weakAreas,
                currentStreak: userData.metrics.streakData.currentStreak,
                longestStreak: userData.metrics.streakData.longestStreak,
                lastActivityDate: userData.metrics.streakData.lastActivityDate.toISOString()
            },
            preferences: {
                teachingStyle: userData.preferences.teachingStyle,
                preferredSessionDuration: userData.preferences.preferredSessionDuration,
                difficultyPreference: userData.preferences.difficultyPreference,
                notificationSettings: userData.preferences.notificationSettings,
                accessibilityOptions: userData.preferences.accessibilityOptions
            },
            metadata: {
                createdAt: userData.metadata.createdAt.toISOString(),
                lastUpdatedAt: userData.metadata.lastUpdatedAt.toISOString(),
                lastLoginAt: userData.metadata.lastLoginAt.toISOString()
            }
        };
    }

    private validateCreateUserRequest(request: CreateUserRequest): string | null {
        if (!request.userId?.trim()) {
            return 'userId est requis et ne peut pas être vide';
        }
        
        if (!request.profile?.currentLevel) {
            return 'currentLevel est requis dans le profil';
        }
        
        const validLevels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (!validLevels.includes(request.profile.currentLevel)) {
            return `currentLevel doit être un des: ${validLevels.join(', ')}`;
        }
        
        return null;
    }

    private validateUpdateProfileRequest(updates: UpdateUserProfileRequest): string | null {
        if (updates.currentLevel) {
            const validLevels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            if (!validLevels.includes(updates.currentLevel)) {
                return `currentLevel doit être un des: ${validLevels.join(', ')}`;
            }
        }
        
        return null;
    }

    private successResponse<T>(data: T, requestId: string): ApiResponse<T> {
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            requestId
        };
    }

    private errorResponse(
        message: string,
        code: string,
        requestId: string,
        details?: Record<string, unknown>
    ): ApiResponse {
        return {
            success: false,
            error: {
                code,
                message,
                details
            },
            timestamp: new Date().toISOString(),
            requestId
        };
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
}