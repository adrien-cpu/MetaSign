/**
 * @file src/ai/services/learning/interfaces/ConfigurationInterfaces.ts
 * @description Interfaces de configuration pour les services d'apprentissage LSF.
 * Contient les configurations des services spécialisés et les paramètres système.
 * Compatible avec exactOptionalPropertyTypes: true
 * @module ConfigurationInterfaces
 * @version 3.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * @example
 * ```typescript
 * import type { 
 *   SpecializedServicesConfig, 
 *   LSFNotificationConfig,
 *   LSFCollaborationFeatures 
 * } from './ConfigurationInterfaces';
 * ```
 */

import type { ModuleCategory, ModuleStatus } from './CoreLearningInterfaces';

/**
 * Configuration générale d'apprentissage
 */
export interface LearningConfiguration {
    /** Configuration générale */
    readonly general: {
        /** Langue par défaut */
        readonly defaultLanguage: string;
        /** Fuseau horaire */
        readonly timezone: string;
        /** Niveau de logging */
        readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
        /** Mode de débogage activé */
        readonly debugMode: boolean;
    };
    /** Configuration des fonctionnalités */
    readonly features: {
        /** Adaptation automatique activée */
        readonly autoAdaptation: boolean;
        /** Personnalisation activée */
        readonly personalization: boolean;
        /** Analytics activé */
        readonly analytics: boolean;
        /** Notifications activées */
        readonly notifications: boolean;
    };
    /** Limites du système */
    readonly limits: {
        /** Utilisateurs simultanés maximum */
        readonly maxConcurrentUsers: number;
        /** Taille maximum des sessions */
        readonly maxSessionSize: number;
        /** Durée maximum des sessions (minutes) */
        readonly maxSessionDuration: number;
    };
}

/**
 * Configuration des services
 */
export interface ServiceConfiguration {
    /** Configuration des API */
    readonly api: {
        /** URL de base */
        readonly baseUrl: string;
        /** Version de l'API */
        readonly version: string;
        /** Timeout des requêtes (ms) */
        readonly timeout: number;
        /** Nombre de tentatives */
        readonly retryAttempts: number;
    };
    /** Configuration de la base de données */
    readonly database: {
        /** URL de connexion */
        readonly connectionUrl: string;
        /** Pool de connexions maximum */
        readonly maxConnections: number;
        /** Timeout des requêtes (ms) */
        readonly queryTimeout: number;
    };
    /** Configuration du cache */
    readonly cache: {
        /** Type de cache */
        readonly type: 'memory' | 'redis' | 'filesystem';
        /** TTL par défaut (secondes) */
        readonly defaultTTL: number;
        /** Taille maximum */
        readonly maxSize: number;
    };
}

/**
 * Configuration des modules
 */
export interface ModuleConfiguration {
    /** Modules par défaut */
    readonly defaultModules: readonly string[];
    /** Configuration par catégorie */
    readonly categorySettings: Readonly<Record<ModuleCategory, {
        readonly enabled: boolean;
        readonly difficulty: number;
        readonly prerequisites: readonly string[];
    }>>;
    /** Paramètres de progression */
    readonly progression: {
        /** Seuil de maîtrise (%) */
        readonly masteryThreshold: number;
        /** Tentatives maximum par exercice */
        readonly maxAttempts: number;
        readonly autoProgress: boolean;
    };
}

/**
 * Configuration d'intégration
 */
export interface IntegrationConfiguration {
    /** Services externes */
    readonly externalServices: {
        readonly videoProcessing: {
            readonly endpoint: string;
            readonly apiKey: string;
            readonly timeout: number;
        };
        readonly analytics: {
            readonly endpoint: string;
            readonly apiKey: string;
            readonly batchSize: number;
        };
    };
    /** Webhooks */
    readonly webhooks: {
        readonly endpoints: readonly string[];
        readonly events: readonly string[];
        readonly retryPolicy: {
            readonly maxRetries: number;
            readonly backoffMultiplier: number;
        };
    };
}

/**
 * Configuration de sécurité
 */
export interface SecurityConfiguration {
    /** Authentification */
    readonly authentication: {
        readonly provider: 'jwt' | 'oauth' | 'saml';
        readonly tokenExpiry: number;
        readonly refreshTokenExpiry: number;
    };
    /** Autorisation */
    readonly authorization: {
        readonly rbacEnabled: boolean;
        readonly defaultRole: string;
        readonly adminRoles: readonly string[];
    };
    /** Chiffrement */
    readonly encryption: {
        readonly algorithm: string;
        readonly keySize: number;
        readonly saltRounds: number;
    };
    /** Audit */
    readonly audit: {
        readonly enabled: boolean;
        readonly logLevel: 'basic' | 'detailed' | 'full';
        readonly retention: number;
    };
}

/**
 * Configuration de performance
 */
export interface PerformanceConfiguration {
    /** Optimisations */
    readonly optimizations: {
        readonly caching: boolean;
        readonly compression: boolean;
        readonly minification: boolean;
        readonly lazyLoading: boolean;
    };
    /** Monitoring */
    readonly monitoring: {
        readonly enabled: boolean;
        readonly interval: number;
        readonly metrics: readonly string[];
    };
    /** Scalabilité */
    readonly scaling: {
        readonly autoScaling: boolean;
        readonly minInstances: number;
        readonly maxInstances: number;
        readonly scaleUpThreshold: number;
        readonly scaleDownThreshold: number;
    };
}

/**
 * Configuration pour les services LSF spécialisés
 */
export interface SpecializedServicesConfig {
    /** Configuration des modules LSF */
    readonly modules: {
        /** Activer les modules par défaut */
        readonly enableDefaultModules: boolean;
        /** Langue par défaut */
        readonly defaultLanguage: string;
        /** Difficulté de départ */
        readonly startingDifficulty: number;
        /** Activer le mode immersif */
        readonly enableImmersiveMode: boolean;
        /** Dialectes LSF supportés */
        readonly supportedDialects: readonly string[];
    };
    /** Configuration des badges LSF */
    readonly badges: {
        /** Attribution automatique activée */
        readonly enableAutoAward: boolean;
        /** Badges par défaut activés */
        readonly enableDefaultBadges: boolean;
        /** Limite quotidienne de badges */
        readonly dailyBadgeLimit: number;
        /** Badges culturels sourds activés */
        readonly enableCulturalBadges: boolean;
    };
    /** Configuration de la progression LSF */
    readonly progress: {
        /** Multiplicateur d'expérience de base */
        readonly baseExperienceMultiplier: number;
        /** Expérience de base par niveau */
        readonly baseExperienceForLevel: number;
        /** Facteur de croissance des niveaux */
        readonly levelGrowthFactor: number;
        /** Bonus temporels activés */
        readonly enableTimeBasedBonuses: boolean;
        /** Bonus pour compétences LSF spécialisées */
        readonly lsfSkillBonusMultiplier: number;
    };
}

/**
 * Configuration des notifications LSF
 */
export interface LSFNotificationConfig {
    /** Notifications activées */
    readonly enabled: boolean;
    /** Types de notifications */
    readonly types: {
        /** Rappels d'apprentissage */
        readonly learningReminders: boolean;
        /** Nouveaux badges */
        readonly badgeEarned: boolean;
        /** Progression de niveau */
        readonly levelUp: boolean;
        /** Nouveau contenu */
        readonly newContent: boolean;
        /** Défis communautaires */
        readonly communityChallenges: boolean;
        /** Messages de motivation */
        readonly motivationalMessages: boolean;
    };
    /** Fréquence des rappels */
    readonly reminderFrequency: 'daily' | 'weekly' | 'custom';
    /** Horaires préférés */
    readonly preferredTimes: readonly string[];
    /** Canaux de notification */
    readonly channels: {
        /** Push notifications */
        readonly push: boolean;
        /** Email */
        readonly email: boolean;
        /** In-app */
        readonly inApp: boolean;
    };
}

/**
 * Fonctionnalités de collaboration pour l'apprentissage LSF
 */
export interface LSFCollaborationFeatures {
    /** Chat en LSF */
    readonly lsfChat: {
        /** Vidéo en temps réel */
        readonly realtimeVideo: boolean;
        /** Partage d'écran */
        readonly screenSharing: boolean;
        /** Enregistrement de sessions */
        readonly sessionRecording: boolean;
    };
    /** Groupes d'étude */
    readonly studyGroups: {
        /** Création de groupes */
        readonly groupCreation: boolean;
        /** Sessions de groupe */
        readonly groupSessions: boolean;
        /** Défis de groupe */
        readonly groupChallenges: boolean;
    };
    /** Mentorat */
    readonly mentoring: {
        /** Jumelage mentor-apprenant */
        readonly mentorMatching: boolean;
        /** Sessions de mentorat */
        readonly mentoringSessions: boolean;
        /** Feedback personnalisé */
        readonly personalizedFeedback: boolean;
    };
    /** Communauté */
    readonly community: {
        /** Forums de discussion */
        readonly forums: boolean;
        /** Partage de ressources */
        readonly resourceSharing: boolean;
        /** Événements communautaires */
        readonly communityEvents: boolean;
    };
}

/**
 * Métriques pour les services d'apprentissage LSF
 */
export interface LearningServiceMetrics {
    /** Métriques des modules LSF */
    readonly modules: {
        /** Total des modules */
        readonly total: number;
        /** Répartition par catégorie LSF */
        readonly byCategory: Readonly<Record<ModuleCategory, number>>;
        /** Répartition par difficulté */
        readonly byDifficulty: Readonly<Record<number, number>>;
        /** Répartition par statut */
        readonly byStatus: Readonly<Record<ModuleStatus, number>>;
        /** Temps moyen de complétion */
        readonly averageCompletionTime: number;
        /** Modules les plus populaires */
        readonly mostPopular: readonly string[];
    };
    /** Métriques des badges LSF */
    readonly badges: {
        /** Total des badges */
        readonly total: number;
        /** Répartition par catégorie */
        readonly byCategory: Readonly<Record<string, number>>;
        /** Répartition par difficulté */
        readonly byDifficulty: Readonly<Record<string, number>>;
        /** Taux moyen d'obtention */
        readonly averageEarnRate: number;
        /** Badges les plus rares */
        readonly rarest: readonly string[];
    };
    /** Métriques de progression LSF */
    readonly progress: {
        /** Utilisateurs actifs */
        readonly activeUsers: number;
        /** Niveau moyen en LSF */
        readonly averageLevel: number;
        /** Expérience moyenne */
        readonly averageExperience: number;
        /** Taux de complétion des modules */
        readonly completionRate: number;
        /** Taux de rétention */
        readonly retentionRate: number;
        /** Progression moyenne par jour */
        readonly dailyProgressRate: number;
    };
}