/**
 * @file src/ai/services/learning/types/LearningTypesExtended.ts
 * @description Documentation des types pour le module d'apprentissage MetaSign
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.1.2
 * @since 2024
 * @lastModified 2025-01-15
 */

// ================================
// DOCUMENTATION DES TYPES
// ================================

/**
 * Ce fichier sert de documentation pour les types utilisés dans le module d'apprentissage.
 * 
 * Les types réels sont définis dans :
 * 
 * 1. IUserProfileManager.ts - Types de profils utilisateur :
 *    - CompetencyLevel
 *    - UserLearningProfile
 *    - LearningPreferences
 *    - LearningHistory
 *    - UserMetadata
 *    - ProgressData
 * 
 * 2. AdaptiveLearningSystem.ts - Types d'apprentissage adaptatif :
 *    - LearningContext
 *    - LearningActivity
 *    - UserPerformanceData
 *    - CurrentActivity
 *    - ActivityContent
 *    - ActivityType
 * 
 * 3. IAdaptiveLearningSystem.ts - Interface du système adaptatif
 * 
 * Cette approche évite les imports circulaires et les conflits de types
 * tout en respectant exactOptionalPropertyTypes: true.
 */

// ================================
// TYPES ALIAS POUR COMPATIBILITÉ
// ================================

/**
 * Alias pour CompetencyLevel depuis IUserProfileManager
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Constantes pour compatibilité
 */
export const LEARNING_CONSTANTS = {
    VALID_CECRL_LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const,
    SUPPORTED_ACTIVITY_TYPES: [
        'interactive',
        'video',
        'quiz',
        'practice',
        'guided',
        'assessment'
    ] as const,
    DEFAULT_THRESHOLDS: {
        MASTERY: 0.8,
        COMPETENCY: 0.6,
        ENGAGEMENT: 0.7
    } as const
} as const;

/**
 * Utilitaires pour la validation des types
 */
export const LearningTypeUtils = {
    /**
     * Vérifie si un niveau CECRL est valide
     */
    isValidCECRLLevel: (level: string): level is CECRLLevel =>
        LEARNING_CONSTANTS.VALID_CECRL_LEVELS.includes(level as CECRLLevel),

    /**
     * Crée un contexte d'apprentissage vide
     */
    createEmptyLearningContext: (userId: string, sessionId: string) => ({
        sessionId,
        userId,
        previousActivities: [],
        sessionGoals: [],
        sessionDuration: 0,
        startTime: new Date(),
        environment: {
            deviceType: 'desktop' as const,
            connectionQuality: 'medium' as const,
            hasCamera: false,
            hasAudio: false
        }
    })
} as const;

// ================================
// INSTRUCTIONS D'USAGE
// ================================

/**
 * INSTRUCTIONS D'USAGE :
 * 
 * Pour utiliser les types du module d'apprentissage :
 * 
 * 1. Types de profil utilisateur :
 *    import type { UserLearningProfile, CompetencyLevel } from 
 *    '@/ai/services/learning/human/personalization/interfaces/IUserProfileManager';
 * 
 * 2. Types d'apprentissage adaptatif :
 *    import type { LearningContext, LearningActivity } from 
 *    '@/ai/services/learning/machine/adaptative/AdaptiveLearningSystem';
 * 
 * 3. Interface du système :
 *    import type { IAdaptiveLearningSystem } from 
 *    '@/ai/services/learning/machine/adaptative/interfaces/IAdaptiveLearningSystem';
 * 
 * 4. Factory functions :
 *    import { createAdaptiveLearningSystem } from 
 *    '@/ai/services/learning/machine/adaptative/interfaces';
 */