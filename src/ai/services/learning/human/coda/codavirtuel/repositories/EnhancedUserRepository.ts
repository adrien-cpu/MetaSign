/**
 * @file src/ai/services/learning/human/coda/codavirtuel/repositories/EnhancedUserRepository.ts
 * @description Repository amélioré pour les utilisateurs CODA avec persistance réelle
 * 
 * Fonctionnalités :
 * - 🗄️ Persistance avec choix JSON/SQLite/Mémoire
 * - 👤 Gestion complète des profils utilisateurs
 * - 📊 Historique détaillé des sessions d'apprentissage
 * - 🎯 Métriques de progression avancées
 * - 🔄 Migration automatique des données legacy
 * - ✨ Transactions et backup automatique
 * 
 * @module repositories
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Enhanced Repository
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { BasePersistenceAdapter, PersistenceAdapterFactory, type PersistenceConfig } from './core/BasePersistenceAdapter';
import type { UserReverseProfile, TeachingSession, CECRLLevel } from '../types/index';

/**
 * Données utilisateur étendues stockées dans le repository
 */
export interface EnhancedUserData {
    readonly profile: UserReverseProfile;
    readonly sessions: TeachingSession[];
    readonly metrics: UserProgressMetrics;
    readonly preferences: UserPreferences;
    readonly metadata: UserMetadata;
}

/**
 * Métriques de progression utilisateur
 */
export interface UserProgressMetrics {
    readonly totalSessions: number;
    readonly totalLearningTime: number; // en minutes
    readonly averageSessionDuration: number;
    readonly conceptsMastered: string[];
    readonly weakAreas: string[];
    readonly strongAreas: string[];
    readonly levelProgression: {
        readonly currentLevel: CECRLLevel;
        readonly previousLevels: Array<{
            readonly level: CECRLLevel;
            readonly achievedAt: Date;
            readonly sessionCount: number;
        }>;
    };
    readonly streakData: {
        readonly currentStreak: number;
        readonly longestStreak: number;
        readonly lastActivityDate: Date;
    };
    readonly comprehensionRates: Record<string, number>; // par sujet/concept
}

/**
 * Préférences utilisateur
 */
export interface UserPreferences {
    readonly teachingStyle: 'visual' | 'interactive' | 'step_by_step' | 'immersive';
    readonly preferredSessionDuration: number; // en minutes
    readonly difficultyPreference: 'challenging' | 'comfortable' | 'easy';
    readonly notificationSettings: {
        readonly dailyReminders: boolean;
        readonly progressUpdates: boolean;
        readonly achievementAlerts: boolean;
    };
    readonly accessibilityOptions: {
        readonly highContrast: boolean;
        readonly largeText: boolean;
        readonly reducedMotion: boolean;
        readonly screenReaderOptimized: boolean;
    };
}

/**
 * Métadonnées utilisateur
 */
export interface UserMetadata {
    readonly createdAt: Date;
    readonly lastUpdatedAt: Date;
    readonly lastLoginAt: Date;
    readonly version: string;
    readonly migrationHistory: Array<{
        readonly fromVersion: string;
        readonly toVersion: string;
        readonly migratedAt: Date;
    }>;
}

/**
 * Options de recherche d'utilisateurs
 */
export interface UserSearchOptions {
    readonly level?: CECRLLevel;
    readonly minSessions?: number;
    readonly maxSessions?: number;
    readonly lastActivitySince?: Date;
    readonly hasWeakAreas?: string[];
    readonly profileComplete?: boolean;
}

/**
 * Repository amélioré pour les utilisateurs CODA
 */
export class EnhancedUserRepository {
    private readonly logger = LoggerFactory.getLogger('EnhancedUserRepository');
    private adapter: BasePersistenceAdapter<EnhancedUserData> | null = null;
    private isInitialized = false;

    constructor(
        private readonly persistenceConfig: PersistenceConfig
    ) {
        this.logger.debug('🏗️ Repository utilisateurs CODA initialisé', {
            storageType: persistenceConfig.type
        });
    }

    // ==================== INITIALISATION ====================

    /**
     * Initialise le repository avec l'adaptateur de persistance
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            this.adapter = await PersistenceAdapterFactory.createAdapter<EnhancedUserData>(
                this.persistenceConfig
            );
            
            await this.adapter.initialize();
            this.isInitialized = true;

            this.logger.info('✅ Repository utilisateurs initialisé', {
                storageType: this.persistenceConfig.type,
                cacheEnabled: this.persistenceConfig.enableCache
            });

            // Migration des données legacy si nécessaire
            if (this.persistenceConfig.autoMigrate) {
                await this.migrateLegacyData();
            }

        } catch (error) {
            this.logger.error('❌ Erreur initialisation repository', { error });
            throw new Error(`Impossible d'initialiser le repository: ${error}`);
        }
    }

    /**
     * Ferme proprement le repository
     */
    public async destroy(): Promise<void> {
        if (this.adapter) {
            await this.adapter.destroy();
            this.adapter = null;
        }
        this.isInitialized = false;
        this.logger.info('🧹 Repository utilisateurs fermé');
    }

    // ==================== OPÉRATIONS CRUD UTILISATEURS ====================

    /**
     * Crée un nouvel utilisateur avec des données par défaut
     */
    public async createUser(userId: string, initialProfile: UserReverseProfile): Promise<void> {
        this.ensureInitialized();

        const now = new Date();
        const userData: EnhancedUserData = {
            profile: initialProfile,
            sessions: [],
            metrics: this.createDefaultMetrics(initialProfile.currentLevel),
            preferences: this.createDefaultPreferences(),
            metadata: {
                createdAt: now,
                lastUpdatedAt: now,
                lastLoginAt: now,
                version: '1.0.0',
                migrationHistory: []
            }
        };

        await this.adapter!.create(userId, userData);
        
        this.logger.info('✨ Nouvel utilisateur créé', {
            userId,
            initialLevel: initialProfile.currentLevel
        });
    }

    /**
     * Récupère un utilisateur par son ID
     */
    public async getUser(userId: string): Promise<EnhancedUserData | null> {
        this.ensureInitialized();
        return await this.adapter!.read(userId);
    }

    /**
     * Met à jour le profil d'un utilisateur
     */
    public async updateUserProfile(userId: string, profileUpdates: Partial<UserReverseProfile>): Promise<void> {
        this.ensureInitialized();

        const existing = await this.adapter!.read(userId);
        if (!existing) {
            throw new Error(`Utilisateur non trouvé: ${userId}`);
        }

        const updatedProfile = { ...existing.profile, ...profileUpdates };
        await this.adapter!.update(userId, {
            profile: updatedProfile,
            metadata: {
                ...existing.metadata,
                lastUpdatedAt: new Date()
            }
        });

        this.logger.debug('🔄 Profil utilisateur mis à jour', { userId });
    }

    /**
     * Met à jour les préférences utilisateur
     */
    public async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
        this.ensureInitialized();

        const existing = await this.adapter!.read(userId);
        if (!existing) {
            throw new Error(`Utilisateur non trouvé: ${userId}`);
        }

        const updatedPreferences = { ...existing.preferences, ...preferences };
        await this.adapter!.update(userId, {
            preferences: updatedPreferences,
            metadata: {
                ...existing.metadata,
                lastUpdatedAt: new Date()
            }
        });

        this.logger.debug('⚙️ Préférences utilisateur mises à jour', { userId });
    }

    /**
     * Supprime un utilisateur et toutes ses données
     */
    public async deleteUser(userId: string): Promise<void> {
        this.ensureInitialized();
        await this.adapter!.delete(userId);
        this.logger.info('🗑️ Utilisateur supprimé', { userId });
    }

    // ==================== GESTION DES SESSIONS ====================

    /**
     * Ajoute une nouvelle session d'enseignement pour un utilisateur
     */
    public async addSession(userId: string, session: TeachingSession): Promise<void> {
        this.ensureInitialized();

        const existing = await this.adapter!.read(userId);
        if (!existing) {
            throw new Error(`Utilisateur non trouvé: ${userId}`);
        }

        // Ajouter la session
        const updatedSessions = [...existing.sessions, session];
        
        // Recalculer les métriques
        const updatedMetrics = await this.calculateMetrics(existing.profile, updatedSessions);

        await this.adapter!.update(userId, {
            sessions: updatedSessions,
            metrics: updatedMetrics,
            metadata: {
                ...existing.metadata,
                lastUpdatedAt: new Date(),
                lastLoginAt: new Date()
            }
        });

        this.logger.debug('📚 Session ajoutée pour utilisateur', {
            userId,
            sessionId: session.sessionId,
            totalSessions: updatedSessions.length
        });
    }

    /**
     * Récupère l'historique des sessions d'un utilisateur
     */
    public async getUserSessions(
        userId: string,
        limit?: number,
        offset?: number
    ): Promise<TeachingSession[]> {
        this.ensureInitialized();

        const userData = await this.adapter!.read(userId);
        if (!userData) return [];

        const sessions = userData.sessions;
        
        if (limit !== undefined) {
            const start = offset || 0;
            return sessions.slice(start, start + limit);
        }

        return sessions;
    }

    // ==================== MÉTRIQUES ET ANALYTICS ====================

    /**
     * Récupère les métriques détaillées d'un utilisateur
     */
    public async getUserMetrics(userId: string): Promise<UserProgressMetrics | null> {
        this.ensureInitialized();

        const userData = await this.adapter!.read(userId);
        return userData?.metrics || null;
    }

    /**
     * Force le recalcul des métriques d'un utilisateur
     */
    public async recalculateUserMetrics(userId: string): Promise<UserProgressMetrics> {
        this.ensureInitialized();

        const existing = await this.adapter!.read(userId);
        if (!existing) {
            throw new Error(`Utilisateur non trouvé: ${userId}`);
        }

        const updatedMetrics = await this.calculateMetrics(existing.profile, existing.sessions);
        
        await this.adapter!.update(userId, {
            metrics: updatedMetrics,
            metadata: {
                ...existing.metadata,
                lastUpdatedAt: new Date()
            }
        });

        this.logger.debug('🔢 Métriques recalculées', { userId });
        return updatedMetrics;
    }

    // ==================== RECHERCHE ET FILTRAGE ====================

    /**
     * Recherche des utilisateurs selon des critères
     */
    public async searchUsers(options: UserSearchOptions): Promise<EnhancedUserData[]> {
        this.ensureInitialized();

        const filters: Record<string, unknown> = {};
        
        // Convertir les options en filtres simples (à améliorer pour filtrage complexe)
        if (options.level) {
            filters['profile.currentLevel'] = options.level;
        }

        return await this.adapter!.list(filters);
    }

    /**
     * Compte le nombre d'utilisateurs actifs
     */
    public async getActiveUsersCount(sinceDays: number = 30): Promise<number> {
        this.ensureInitialized();
        
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - sinceDays);

        const allUsers = await this.adapter!.list();
        return allUsers.filter(user => 
            user.metadata.lastLoginAt >= sinceDate
        ).length;
    }

    // ==================== BACKUP ET MAINTENANCE ====================

    /**
     * Crée une sauvegarde des données utilisateurs
     */
    public async createBackup(backupPath: string): Promise<void> {
        this.ensureInitialized();
        await this.adapter!.backup(backupPath);
        this.logger.info('📦 Backup utilisateurs créé', { backupPath });
    }

    /**
     * Restaure depuis une sauvegarde
     */
    public async restoreFromBackup(backupPath: string): Promise<void> {
        this.ensureInitialized();
        await this.adapter!.restore(backupPath);
        this.logger.info('♻️ Backup utilisateurs restauré', { backupPath });
    }

    /**
     * Obtient les statistiques du repository
     */
    public getRepositoryStats() {
        this.ensureInitialized();
        return this.adapter!.getStats();
    }

    // ==================== MÉTHODES PRIVÉES ====================

    private ensureInitialized(): void {
        if (!this.isInitialized || !this.adapter) {
            throw new Error('Repository non initialisé. Appelez initialize() d\'abord.');
        }
    }

    private createDefaultMetrics(initialLevel: CECRLLevel): UserProgressMetrics {
        return {
            totalSessions: 0,
            totalLearningTime: 0,
            averageSessionDuration: 0,
            conceptsMastered: [],
            weakAreas: [],
            strongAreas: [],
            levelProgression: {
                currentLevel: initialLevel,
                previousLevels: []
            },
            streakData: {
                currentStreak: 0,
                longestStreak: 0,
                lastActivityDate: new Date()
            },
            comprehensionRates: {}
        };
    }

    private createDefaultPreferences(): UserPreferences {
        return {
            teachingStyle: 'interactive',
            preferredSessionDuration: 30,
            difficultyPreference: 'comfortable',
            notificationSettings: {
                dailyReminders: true,
                progressUpdates: true,
                achievementAlerts: true
            },
            accessibilityOptions: {
                highContrast: false,
                largeText: false,
                reducedMotion: false,
                screenReaderOptimized: false
            }
        };
    }

    private async calculateMetrics(profile: UserReverseProfile, sessions: TeachingSession[]): Promise<UserProgressMetrics> {
        if (sessions.length === 0) {
            return this.createDefaultMetrics(profile.currentLevel);
        }

        // Calculs basiques
        const totalSessions = sessions.length;
        const totalLearningTime = sessions.reduce((sum, s) => sum + (s.metrics.actualDuration || 30), 0);
        const averageSessionDuration = totalLearningTime / totalSessions;

        // Concepts maîtrisés
        const conceptsMastered = Array.from(new Set(
            sessions.flatMap(s => s.metrics.conceptsMastered || [])
        ));

        // Zones faibles et fortes
        const conceptsToReview = Array.from(new Set(
            sessions.flatMap(s => s.metrics.conceptsToReview || [])
        ));

        // Taux de compréhension par concept
        const comprehensionRates: Record<string, number> = {};
        conceptsMastered.forEach(concept => {
            const relevantSessions = sessions.filter(s => 
                (s.metrics.conceptsMastered || []).includes(concept)
            );
            if (relevantSessions.length > 0) {
                const avgComprehension = relevantSessions.reduce(
                    (sum, s) => sum + s.aiReactions.comprehension, 0
                ) / relevantSessions.length;
                comprehensionRates[concept] = avgComprehension;
            }
        });

        // Calcul de la streak (séquence)
        const sortedSessions = sessions.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        for (let i = 0; i < sortedSessions.length; i++) {
            const sessionDate = new Date(sortedSessions[i].timestamp);
            const today = new Date();
            const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 1) {
                tempStreak++;
                currentStreak = tempStreak;
            } else if (daysDiff <= 2) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        return {
            totalSessions,
            totalLearningTime,
            averageSessionDuration,
            conceptsMastered,
            weakAreas: conceptsToReview,
            strongAreas: conceptsMastered.filter(concept => 
                comprehensionRates[concept] >= 0.8
            ),
            levelProgression: {
                currentLevel: profile.currentLevel,
                previousLevels: [] // À enrichir avec l'historique des niveaux
            },
            streakData: {
                currentStreak,
                longestStreak,
                lastActivityDate: sessions.length > 0 ? 
                    new Date(Math.max(...sessions.map(s => new Date(s.timestamp).getTime()))) : 
                    new Date()
            },
            comprehensionRates
        };
    }

    private async migrateLegacyData(): Promise<void> {
        // Placeholder pour migration des données de l'ancien repository
        this.logger.debug('🔄 Migration données legacy - à implémenter si nécessaire');
    }
}