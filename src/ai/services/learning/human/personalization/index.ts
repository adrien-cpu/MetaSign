/**
 * @file src/ai/services/learning/human/personalization/index.ts
 * @description Point d'entrée pour le module de personnalisation
 * 
 * Ce module expose toutes les interfaces, classes et types nécessaires
 * pour la gestion des profils utilisateurs et la personnalisation de l'apprentissage.
 * 
 * @module PersonalizationModule
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

// Import des implémentations
import {
    UserProfileManager,
    InMemoryUserProfileStorage,
    type IUserProfileStorage
} from './ProfileManager';

// Interfaces principales
export type { IUserProfileManager } from './interfaces/IUserProfileManager';

// Réexport des implémentations
export {
    UserProfileManager,
    InMemoryUserProfileStorage,
    type IUserProfileStorage
};

// Réexportation des types depuis le module de types
export type {
    ExtendedUserProfile,
    LearningPreferences,
    ProgressData,
    UserPerformanceData,
    CompetencyLevel,
    CompetencyData,
    LearningHistory,
    UserSettings,
    UserMetadata,
    LearningStyle
} from './types';

// Factory functions pour faciliter l'instanciation
export const createUserProfileManager = (storage?: IUserProfileStorage): UserProfileManager => {
    return new UserProfileManager(storage);
};

export const createInMemoryStorage = (): InMemoryUserProfileStorage => {
    return new InMemoryUserProfileStorage();
};

// Configuration par défaut
export const DEFAULT_PROFILE_CONFIG = {
    cacheTTL: 15 * 60 * 1000, // 15 minutes
    masteryThreshold: 0.8,
    skillThreshold: 0.6
} as const;