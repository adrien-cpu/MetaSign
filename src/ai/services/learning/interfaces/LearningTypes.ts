/**
 * @file src/ai/services/learning/interfaces/LearningTypes.ts
 * @description Types spécialisés pour les systèmes d'apprentissage avancés
 * Contient les types pour les collections, événements et utilitaires LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    LSFEventType,
    CompetencyLevel,
    ModuleCategory,
    LearningProgress,
    UserLearningProfile,
    LearningSession,
    LearningPreferences
} from './CoreLearningInterfaces';

import type {
    LSFLearningModule,
    LSFBadge
} from './LSFContentInterfaces';

// ================================
// ÉVÉNEMENTS SYSTÈME LSF
// ================================

/**
 * Événement système LSF
 */
export interface LSFSystemEvent {
    readonly id: string;
    readonly type: LSFEventType;
    readonly userId: string;
    readonly timestamp: Date;
    readonly data: Readonly<Record<string, unknown>>;
    readonly metadata: {
        readonly source: string;
        readonly version: string;
        readonly sessionId: string;
    };
}

/**
 * Map des événements LSF
 */
export type LSFEventMap = {
    readonly [K in LSFEventType]: LSFSystemEvent;
};

// ================================
// COLLECTIONS DE DONNÉES LSF
// ================================

/**
 * Collection de modules LSF
 */
export interface LSFModuleCollection {
    readonly modules: readonly LSFLearningModule[];
    readonly totalCount: number;
    readonly categories: readonly ModuleCategory[];
    readonly lastUpdated: Date;
}

/**
 * Collection de badges LSF
 */
export interface LSFBadgeCollection {
    readonly badges: readonly LSFBadge[];
    readonly totalCount: number;
    readonly categories: readonly string[];
    readonly lastUpdated: Date;
}

/**
 * Collection de progression LSF
 */
export interface LSFProgressCollection {
    readonly progressRecords: readonly LearningProgress[];
    readonly totalUsers: number;
    readonly averageLevel: number;
    readonly lastUpdated: Date;
}

// ================================
// TYPES UTILITAIRES ÉTENDUS
// ================================

/**
 * Statistiques d'engagement utilisateur
 */
export interface UserEngagementStats {
    readonly userId: string;
    readonly period: {
        readonly start: Date;
        readonly end: Date;
    };
    readonly sessionsCount: number;
    readonly avgSessionDuration: number;
    readonly totalLearningTime: number;
    readonly streakDays: number;
    readonly longestStreak: number;
    readonly modulesStarted: number;
    readonly modulesCompleted: number;
    readonly badgesEarned: number;
    readonly avgQuizScore: number;
    readonly exercisesCompleted: number;
    readonly lastActivity: Date;
}

/**
 * Métriques de performance système
 */
export interface SystemPerformanceMetrics {
    readonly timestamp: Date;
    readonly activeUsers: number;
    readonly concurrentSessions: number;
    readonly avgResponseTime: number;
    readonly errorRate: number;
    readonly throughput: number;
    readonly cacheHitRate: number;
    readonly resourceUtilization: {
        readonly cpu: number;
        readonly memory: number;
        readonly storage: number;
    };
}

/**
 * Rapport d'analyse d'apprentissage
 */
export interface LearningAnalyticsReport {
    readonly reportId: string;
    readonly generatedAt: Date;
    readonly period: {
        readonly start: Date;
        readonly end: Date;
    };
    readonly userMetrics: {
        readonly totalUsers: number;
        readonly activeUsers: number;
        readonly newUsers: number;
        readonly retentionRate: number;
    };
    readonly contentMetrics: {
        readonly mostPopularModules: readonly string[];
        readonly avgCompletionRate: number;
        readonly avgUserRating: number;
        readonly contentEngagement: Readonly<Record<string, number>>;
    };
    readonly performanceMetrics: {
        readonly avgQuizScore: number;
        readonly exerciseCompletionRate: number;
        readonly skillProgressDistribution: Readonly<Record<CompetencyLevel, number>>;
    };
    readonly recommendations: readonly string[];
}

/**
 * Configuration de notification d'apprentissage
 */
export interface LearningNotificationConfig {
    readonly userId: string;
    readonly notificationTypes: {
        readonly dailyReminders: boolean;
        readonly progressMilestones: boolean;
        readonly badgeAchievements: boolean;
        readonly streakReminders: boolean;
        readonly moduleRecommendations: boolean;
        readonly culturalContent: boolean;
    };
    readonly schedule: {
        readonly preferredTime: string; // Format HH:mm
        readonly timezone: string;
        readonly daysOfWeek: readonly number[]; // 0-6 (dimanche-samedi)
    };
    readonly channels: {
        readonly email: boolean;
        readonly push: boolean;
        readonly inApp: boolean;
    };
}

/**
 * Profil d'adaptabilité d'apprentissage
 */
export interface LearningAdaptabilityProfile {
    readonly userId: string;
    readonly adaptationLevel: 'low' | 'medium' | 'high' | 'dynamic';
    readonly learningPattern: {
        readonly preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
        readonly attentionSpan: number; // minutes
        readonly difficultyPreference: 'gradual' | 'challenging' | 'mixed';
        readonly feedbackFrequency: 'immediate' | 'periodic' | 'minimal';
    };
    readonly cognitiveProfile: {
        readonly processingSpeed: 'slow' | 'average' | 'fast';
        readonly memoryRetention: 'short' | 'medium' | 'long';
        readonly conceptualThinking: 'concrete' | 'abstract' | 'mixed';
        readonly visualSpatialSkills: number; // 0-100
    };
    readonly motivationFactors: {
        readonly achievement: number; // 0-100
        readonly social: number; // 0-100
        readonly mastery: number; // 0-100
        readonly curiosity: number; // 0-100
    };
    readonly lastUpdated: Date;
}

/**
 * Contexte culturel d'apprentissage LSF
 */
export interface LSFCulturalContext {
    readonly region: string;
    readonly dialectVariant: string;
    readonly communityType: 'urban' | 'rural' | 'mixed';
    readonly culturalBackground: {
        readonly deafCommunityExposure: 'none' | 'limited' | 'moderate' | 'extensive';
        readonly hearingStatus: 'hearing' | 'hard_of_hearing' | 'deaf' | 'coda';
        readonly familyBackground: 'hearing_family' | 'deaf_family' | 'mixed_family';
    };
    readonly learningGoals: {
        readonly primaryPurpose: 'personal' | 'professional' | 'family' | 'academic' | 'interpreting';
        readonly urgencyLevel: 'casual' | 'moderate' | 'urgent';
        readonly targetProficiency: CompetencyLevel;
    };
    readonly culturalSensitivity: {
        readonly deafCultureKnowledge: number; // 0-100
        readonly respectForCommunity: number; // 0-100
        readonly linguisticAwareness: number; // 0-100
    };
}

/**
 * Recommandation personnalisée d'apprentissage
 */
export interface PersonalizedLearningRecommendation {
    readonly id: string;
    readonly userId: string;
    readonly generatedAt: Date;
    readonly priority: 'low' | 'medium' | 'high' | 'urgent';
    readonly type: 'module' | 'exercise' | 'review' | 'practice' | 'assessment' | 'cultural_content';
    readonly title: string;
    readonly description: string;
    readonly reasoning: string;
    readonly estimatedDuration: number; // minutes
    readonly difficulty: number; // 1-10
    readonly targetSkills: readonly string[];
    readonly prerequisites: readonly string[];
    readonly expiresAt: Date;
    readonly metadata: {
        readonly confidence: number; // 0-1
        readonly algorithmVersion: string;
        readonly dataPoints: readonly string[];
    };
}

// ================================
// TYPES DE RÉPONSE API
// ================================

/**
 * Réponse standardisée pour les APIs d'apprentissage
 */
export interface LearningAPIResponse<T = unknown> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: {
        readonly code: string;
        readonly message: string;
        readonly details?: Readonly<Record<string, unknown>>;
    };
    readonly metadata: {
        readonly timestamp: Date;
        readonly requestId: string;
        readonly version: string;
        readonly processingTime?: number;
    };
}

/**
 * Réponse paginée pour les collections
 */
export interface PaginatedResponse<T = unknown> {
    readonly items: readonly T[];
    readonly pagination: {
        readonly page: number;
        readonly limit: number;
        readonly total: number;
        readonly totalPages: number;
        readonly hasNext: boolean;
        readonly hasPrevious: boolean;
    };
    readonly filters?: Readonly<Record<string, unknown>>;
    readonly sorting?: {
        readonly field: string;
        readonly direction: 'asc' | 'desc';
    };
}

/**
 * Configuration de requête avec filtres
 */
export interface LearningQueryConfig {
    readonly filters?: {
        readonly level?: CompetencyLevel;
        readonly category?: ModuleCategory;
        readonly difficulty?: number;
        readonly timeRange?: {
            readonly start: Date;
            readonly end: Date;
        };
        readonly userId?: string;
        readonly tags?: readonly string[];
    };
    readonly sorting?: {
        readonly field: string;
        readonly direction: 'asc' | 'desc';
    };
    readonly pagination?: {
        readonly page: number;
        readonly limit: number;
    };
    readonly include?: readonly string[];
}

// ================================
// TYPES D'EXPORT ET IMPORT
// ================================

/**
 * Format d'exportation des données d'apprentissage
 */
export interface LearningDataExport {
    readonly exportId: string;
    readonly exportedAt: Date;
    readonly userId: string;
    readonly format: 'json' | 'csv' | 'xml';
    readonly compression: 'none' | 'gzip' | 'zip';
    readonly data: {
        readonly profile: UserLearningProfile;
        readonly progress: LearningProgress;
        readonly sessions: readonly LearningSession[];
        readonly achievements: readonly string[];
        readonly preferences: LearningPreferences;
    };
    readonly metadata: {
        readonly version: string;
        readonly dataPoints: number;
        readonly fileSize?: number;
        readonly checksum?: string;
    };
}

/**
 * Configuration d'importation de données
 */
export interface LearningDataImportConfig {
    readonly sourceFormat: 'json' | 'csv' | 'xml';
    readonly validation: {
        readonly strict: boolean;
        readonly skipErrors: boolean;
        readonly validateReferences: boolean;
    };
    readonly mapping?: Readonly<Record<string, string>>;
    readonly transformation?: {
        readonly dateFormat?: string;
        readonly encoding?: string;
        readonly delimiter?: string;
    };
    readonly options: {
        readonly mergeExisting: boolean;
        readonly createBackup: boolean;
        readonly dryRun: boolean;
    };
}