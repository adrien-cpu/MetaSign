/**
 * @file src/ai/services/learning/machine/adaptative/interfaces/index.ts
 * @description Point d'entrée centralisé pour toutes les interfaces du module adaptatif
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.1.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// ================================
// IMPORTS DES TYPES NÉCESSAIRES
// ================================

// Types principaux depuis le système adaptatif
import type {
    IRealTimeAdapter,
    LearningPlan,
    PathAdjustment,
    AssistanceContent,
    EngagementMetrics,
    AdaptiveLearningConfig,
    LearningContext,
    LearningActivity,
    UserPerformanceData,
    ActivityType,
    CurrentActivity,
    ActivityContent
} from '../AdaptiveLearningSystem';

// Interface principale
import type { IAdaptiveLearningSystem } from './IAdaptiveLearningSystem';

// Types de profils utilisateur
import type {
    CompetencyLevel,
    UserLearningProfile,
    LearningPreferences,
    LearningHistory,
    UserMetadata,
    ProgressData,
    LearningStyle,
    ProgressStatus,
    IUserProfileManager
} from '@/ai/services/learning/human/personalization/interfaces/IUserProfileManager';

// ================================
// EXPORTS DE TYPES
// ================================

// Interface principale
export type { IAdaptiveLearningSystem };

// Interfaces externes
export type { IUserProfileManager };

// Types principaux du système adaptatif
export type {
    IRealTimeAdapter,
    LearningPlan,
    PathAdjustment,
    AssistanceContent,
    EngagementMetrics,
    AdaptiveLearningConfig,
    LearningContext,
    LearningActivity,
    UserPerformanceData,
    ActivityType,
    CurrentActivity,
    ActivityContent
};

// Types des profils utilisateur
export type {
    CompetencyLevel,
    UserLearningProfile,
    LearningPreferences,
    LearningHistory,
    UserMetadata,
    ProgressData,
    LearningStyle,
    ProgressStatus
};

// ================================
// FACTORY FUNCTIONS
// ================================

/**
 * Factory function pour créer une instance du système d'apprentissage adaptatif
 * avec configuration par défaut
 */
export const createAdaptiveLearningSystem = async (
    config?: Partial<AdaptiveLearningConfig>
): Promise<IAdaptiveLearningSystem> => {
    const { AdaptiveLearningSystem } = await import('../AdaptiveLearningSystem');
    return new AdaptiveLearningSystem(undefined, undefined, undefined, config);
};

/**
 * Factory function pour créer une configuration d'apprentissage adaptatif
 * avec les valeurs par défaut et les surcharges spécifiées
 */
export const createAdaptiveConfig = (
    overrides?: Partial<AdaptiveLearningConfig>
): AdaptiveLearningConfig => {
    // Configuration par défaut
    const DEFAULT_CONFIG: AdaptiveLearningConfig = {
        masteryThreshold: 0.8,
        competencyThreshold: 0.6,
        cacheTTL: 15 * 60 * 1000,
        difficultySettings: {
            minDifficulty: 1,
            maxDifficulty: 10,
            adjustmentStep: 1
        }
    };

    return {
        ...DEFAULT_CONFIG,
        ...overrides
    };
};

// ================================
// HELPERS D'IMPORT
// ================================

/**
 * Importe dynamiquement le système d'apprentissage adaptatif
 * Utile pour éviter les imports circulaires
 */
export const importAdaptiveLearningSystem = () =>
    import('../AdaptiveLearningSystem').then(module => module.AdaptiveLearningSystem);

/**
 * Importe dynamiquement l'adaptateur temps réel
 */
export const importRealTimeAdapter = () =>
    import('../AdaptiveLearningSystem').then(module => module.RealTimeAdapter);

// ================================
// TYPES GUARDS
// ================================

/**
 * Vérifie si un objet implémente l'interface IAdaptiveLearningSystem
 */
export const isAdaptiveLearningSystem = (obj: unknown): obj is IAdaptiveLearningSystem => {
    return typeof obj === 'object' &&
        obj !== null &&
        'initialize' in obj &&
        'generateLearningPlan' in obj &&
        'adaptContent' in obj &&
        'adjustLearningPath' in obj &&
        'provideRealTimeAssistance' in obj;
};

/**
 * Vérifie si un objet est un contexte d'apprentissage valide
 */
export const isValidLearningContext = (obj: unknown): obj is LearningContext => {
    return typeof obj === 'object' &&
        obj !== null &&
        'sessionId' in obj &&
        'userId' in obj &&
        'previousActivities' in obj &&
        'sessionGoals' in obj;
};

/**
 * Vérifie si un objet est une activité d'apprentissage valide
 */
export const isValidLearningActivity = (obj: unknown): obj is LearningActivity => {
    return typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'title' in obj &&
        'type' in obj &&
        'difficulty' in obj &&
        'level' in obj;
};

// ================================
// VERSION ET MÉTADONNÉES
// ================================

/**
 * Informations sur la version du module adaptatif
 */
export const MODULE_INFO = {
    name: 'AdaptiveLearningSystem',
    version: '3.1.0',
    description: 'Système d\'apprentissage adaptatif pour MetaSign LSF',
    author: 'MetaSign Learning Team',
    lastModified: '2025-01-15',
    features: [
        'Personnalisation basée sur le profil utilisateur',
        'Adaptation temps réel du contenu',
        'Détection des lacunes de compétences',
        'Recommandations d\'activités',
        'Assistance contextuelle'
    ]
} as const;