/**
 * Types utilisateur et profil pour le module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/user.ts
 * @module ai/services/learning/types
 * @description Types pour les profils utilisateur, préférences et données personnelles
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-06-28
 */

import type {
    ProfilType,
    LearningLevel,
    LearningStyle,
    SkillLevel,
    SettingValue
} from './base';

/**
 * Préférences d'accessibilité utilisateur
 * @interface AccessibilityPreferences
 */
export interface AccessibilityPreferences {
    /** Besoin de contraste élevé (optionnel) */
    readonly needsHighContrast?: boolean;
    /** Besoin de texte agrandi (optionnel) */
    readonly needsLargeText?: boolean;
    /** Besoin de mouvements ralentis (optionnel) */
    readonly needsSlowMotion?: boolean;
    /** Besoin de sous-titres (optionnel) */
    readonly needsSubtitles?: boolean;
    /** Préférence pour les descriptions audio (optionnel) */
    readonly prefersAudioDescriptions?: boolean;
    /** Sensibilité aux clignotements (optionnel) */
    readonly sensitiveToFlashing?: boolean;
    /** Configuration personnalisée (optionnel) */
    readonly customSettings?: Record<string, SettingValue>;
}

/**
 * Préférences d'apprentissage
 * @interface LearningPreferences
 */
export interface LearningPreferences {
    /** Style d'apprentissage préféré */
    readonly preferredLearningStyle: LearningStyle;
    /** Rythme d'apprentissage préféré */
    readonly preferredPace: 'slow' | 'normal' | 'fast';
    /** Durée de session préférée en millisecondes */
    readonly preferredSessionDuration: number;
    /** Fréquence d'apprentissage souhaitée */
    readonly preferredFrequency: 'daily' | 'several_per_week' | 'weekly' | 'flexible';
    /** Heures préférées pour apprendre */
    readonly preferredTimeSlots: ReadonlyArray<{
        readonly day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
        readonly startHour: number;
        readonly endHour: number;
    }>;
    /** Types d'exercices préférés (optionnel) */
    readonly preferredExerciseTypes?: ReadonlyArray<string>;
    /** Types d'exercices à éviter (optionnel) */
    readonly avoidedExerciseTypes?: ReadonlyArray<string>;
    /** Préférences de feedback */
    readonly feedbackPreferences: {
        readonly immediateCorrection: boolean;
        readonly detailedExplanations: boolean;
        readonly progressNotifications: boolean;
        readonly encouragementLevel: 'minimal' | 'moderate' | 'high';
    };
}

/**
 * Objectifs d'apprentissage utilisateur
 * @interface LearningGoals
 */
export interface LearningGoals {
    /** Objectif principal */
    readonly primaryGoal: string;
    /** Niveau cible */
    readonly targetLevel: LearningLevel;
    /** Date limite souhaitée (optionnel) */
    readonly targetDate?: Date;
    /** Domaines de focus spécifiques */
    readonly focusAreas: ReadonlyArray<string>;
    /** Motivations personnelles */
    readonly motivations: ReadonlyArray<string>;
    /** Contexte d'utilisation (personnel, professionnel, etc.) */
    readonly usageContext: string;
    /** Objectifs à court terme (optionnel) */
    readonly shortTermGoals?: ReadonlyArray<{
        readonly description: string;
        readonly deadline: Date;
        readonly priority: 'low' | 'medium' | 'high';
    }>;
}

/**
 * Profil utilisateur de base
 * @interface BaseUserProfile
 */
export interface BaseUserProfile {
    /** Identifiant unique de l'utilisateur */
    readonly id: string;
    /** Nom d'affichage */
    readonly displayName: string;
    /** Adresse email */
    readonly email: string;
    /** Type de profil utilisateur */
    readonly profileType: ProfilType;
    /** Date de création du profil */
    readonly createdAt: Date;
    /** Dernière mise à jour */
    readonly updatedAt: Date;
    /** Statut du profil */
    readonly status: 'active' | 'inactive' | 'suspended' | 'pending';
}

/**
 * Informations personnelles complémentaires
 * @interface PersonalInfo
 */
export interface PersonalInfo {
    /** Âge (optionnel) */
    readonly age?: number;
    /** Localisation (optionnel) */
    readonly location?: string;
    /** Langue(s) parlée(s) (optionnel) */
    readonly spokenLanguages?: ReadonlyArray<string>;
    /** Niveau d'expérience avec la LSF */
    readonly lsfExperience: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'native';
    /** Contexte personnel (optionnel) */
    readonly personalContext?: {
        readonly familySituation?: string;
        readonly professionalContext?: string;
        readonly previousEducation?: string;
        readonly interests?: ReadonlyArray<string>;
    };
}

/**
 * Profil d'apprentissage complet
 * @interface LearningProfile
 */
export interface LearningProfile {
    /** Niveau actuel en LSF */
    readonly currentLevel: LearningLevel;
    /** Niveau de compétence par domaine */
    readonly skillLevels: Record<string, SkillLevel>;
    /** Objectifs d'apprentissage */
    readonly goals: LearningGoals;
    /** Préférences d'apprentissage */
    readonly preferences: LearningPreferences;
    /** Préférences d'accessibilité */
    readonly accessibility: AccessibilityPreferences;
    /** Historique d'apprentissage */
    readonly learningHistory: {
        readonly startDate: Date;
        readonly totalLearningTime: number;
        readonly completedLessons: number;
        readonly currentStreak: number;
        readonly longestStreak: number;
        readonly averageSessionDuration: number;
    };
    /** Évaluations et certifications (optionnel) */
    readonly certifications?: ReadonlyArray<{
        readonly name: string;
        readonly level: LearningLevel;
        readonly dateObtained: Date;
        readonly expiryDate?: Date;
        readonly issuingBody: string;
    }>;
}

/**
 * Profil utilisateur étendu et complet
 * @interface ExtendedUserProfile
 */
export interface ExtendedUserProfile extends BaseUserProfile {
    /** Informations personnelles */
    readonly personalInfo: PersonalInfo;
    /** Profil d'apprentissage */
    readonly learningProfile: LearningProfile;
    /** Paramètres personnalisés */
    readonly settings: Record<string, SettingValue>;
    /** Métadonnées du profil */
    readonly metadata: {
        readonly lastLoginAt?: Date;
        readonly totalSessions: number;
        readonly averageScoreOverall: number;
        readonly preferredDevice: string;
        readonly timezone: string;
        readonly notificationPreferences: {
            readonly email: boolean;
            readonly push: boolean;
            readonly reminder: boolean;
        };
    };
}

/**
 * Données de progression utilisateur
 * @interface UserProgressData
 */
export interface UserProgressData {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Niveau actuel */
    readonly currentLevel: LearningLevel;
    /** Progression par niveau (pourcentage) */
    readonly levelProgress: Record<LearningLevel, number>;
    /** Compétences maîtrisées */
    readonly masteredSkills: ReadonlyArray<string>;
    /** Compétences en cours d'apprentissage */
    readonly inProgressSkills: ReadonlyArray<string>;
    /** Points d'expérience totaux */
    readonly totalExperiencePoints: number;
    /** Badges obtenus */
    readonly earnedBadges: ReadonlyArray<{
        readonly badgeId: string;
        readonly earnedAt: Date;
        readonly description: string;
    }>;
    /** Statistiques de performance */
    readonly performanceStats: {
        readonly averageAccuracy: number;
        readonly averageSpeed: number;
        readonly consistencyScore: number;
        readonly improvementRate: number;
    };
    /** Dernière mise à jour des données */
    readonly lastUpdated: Date;
}

/**
 * Préférences de notification utilisateur
 * @interface NotificationPreferences
 */
export interface NotificationPreferences {
    /** Notifications par email activées */
    readonly emailEnabled: boolean;
    /** Notifications push activées */
    readonly pushEnabled: boolean;
    /** Rappels d'apprentissage activés */
    readonly reminderEnabled: boolean;
    /** Fréquence des rappels */
    readonly reminderFrequency: 'daily' | 'weekly' | 'custom';
    /** Heures pour les rappels (optionnel) */
    readonly reminderTimes?: ReadonlyArray<{
        readonly hour: number;
        readonly minute: number;
    }>;
    /** Types de notifications autorisées */
    readonly allowedTypes: ReadonlyArray<'progress' | 'achievements' | 'reminders' | 'updates' | 'social'>;
    /** Préférences par canal */
    readonly channelPreferences: {
        readonly email?: ReadonlyArray<string>;
        readonly push?: ReadonlyArray<string>;
        readonly inApp?: ReadonlyArray<string>;
    };
}

/**
 * Contexte utilisateur pour les interactions
 * @interface UserContext
 */
export interface UserContext {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Session actuelle (optionnel) */
    readonly currentSessionId?: string;
    /** Appareil utilisé */
    readonly device: {
        readonly type: 'desktop' | 'tablet' | 'mobile';
        readonly os: string;
        readonly browser: string;
    };
    /** Localisation (optionnel) */
    readonly location?: {
        readonly country: string;
        readonly region: string;
        readonly timezone: string;
    };
    /** Préférences contextuelles */
    readonly contextualPreferences: {
        readonly language: string;
        readonly theme: 'light' | 'dark' | 'auto';
        readonly fontSize: 'small' | 'medium' | 'large';
    };
    /** État de l'utilisateur */
    readonly userState: {
        readonly isAuthenticated: boolean;
        readonly subscriptionLevel: 'free' | 'premium' | 'pro';
        readonly hasActiveSession: boolean;
    };
}