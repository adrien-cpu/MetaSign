/**
 * @file src/ai/services/learning/human/personalization/interfaces/IUserProfileManager.ts
 * @description Interface pour la gestion des profils utilisateur dans le système d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.1.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// ================================
// TYPES DE BASE (DÉFINIS EN PREMIER)
// ================================

/**
 * Niveau de compétence CECRL
 */
export type CompetencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Styles d'apprentissage
 */
export type LearningStyle = 'visual' | 'kinesthetic' | 'auditory' | 'mixed';

/**
 * Statuts de progression
 */
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered' | 'needs_review';

/**
 * Préférences d'apprentissage
 */
export interface LearningPreferences {
    /** Rythme préféré (1-10) */
    readonly preferredPace: number;
    /** Style d'apprentissage */
    readonly preferredLearningStyle: LearningStyle;
    /** Types de contenu préférés */
    readonly preferredContentTypes: readonly string[];
    /** Orientation des objectifs */
    readonly goalOrientation: 'mastery' | 'performance' | 'exploration';
    /** Préférence de rythme */
    readonly pacePreference: 'slow' | 'moderate' | 'fast';
    /** Niveau d'assistance (1-10) */
    readonly assistanceLevel: number;
    /** Niveau d'adaptivité (1-10) */
    readonly adaptivityLevel: number;
    /** Nécessite une structure */
    readonly requiresStructure: boolean;
    /** Préfère les retours */
    readonly prefersFeedback: boolean;
}

/**
 * Historique d'apprentissage
 */
export interface LearningHistory {
    /** Activités complétées */
    readonly completedActivities: readonly string[];
    /** Activités commencées mais non terminées */
    readonly startedButNotCompletedActivities?: readonly string[];
    /** Activités échouées */
    readonly failedActivities: readonly string[];
    /** Temps total passé */
    readonly totalTimeSpent: number;
    /** Nombre total de sessions */
    readonly totalSessions: number;
    /** Date de dernière activité */
    readonly lastActivityDate: Date;
}

/**
 * Métadonnées utilisateur
 */
export interface UserMetadata {
    /** Date de création du profil */
    readonly createdAt: Date;
    /** Dernière mise à jour */
    readonly updatedAt: Date;
    /** Version du profil */
    readonly version: string;
    /** Préférences d'accessibilité */
    readonly accessibilitySettings?: {
        readonly highContrast: boolean;
        readonly largeText: boolean;
        readonly reducedMotion: boolean;
        readonly screenReader: boolean;
    };
}

/**
 * Données de progression pour un utilisateur
 */
export interface ProgressData {
    /** Identifiant utilisateur */
    readonly userId: string;
    /** Identifiant de l'activité */
    readonly activityId: string;
    /** Statut de complétion */
    readonly completionStatus: ProgressStatus;
    /** Score obtenu */
    readonly score: number;
    /** Temps passé */
    readonly timeSpent: number;
    /** Concepts maîtrisés */
    readonly masteredConcepts?: readonly string[];
    /** Timestamp */
    readonly timestamp: Date;
}

/**
 * Profil d'apprentissage utilisateur (structure existante du projet)
 */
export interface UserLearningProfile {
    /** Identifiant utilisateur */
    readonly userId: string;
    /** Niveau de compétence CECRL */
    readonly skillLevel: CompetencyLevel;
    /** Compétences et niveaux (optionnel) */
    readonly skills?: Readonly<Record<string, number>>;
    /** Centres d'intérêt (optionnel) */
    readonly interests?: readonly string[];
    /** Préférences d'apprentissage (optionnel) */
    readonly preferences?: LearningPreferences;
    /** Historique d'apprentissage (optionnel) */
    readonly history?: LearningHistory;
    /** Métadonnées du profil (optionnel) */
    readonly metadata?: UserMetadata;
}

// ================================
// INTERFACES SPÉCIFIQUES AU GESTIONNAIRE DE PROFILS
// ================================

/**
 * Options de mise à jour du profil
 */
export interface ProfileUpdateOptions {
    /** Niveau de compétence CECRL */
    readonly skillLevel?: CompetencyLevel;
    /** Préférences d'apprentissage */
    readonly learningPreferences?: Partial<LearningPreferences>;
    /** Compétences et niveaux */
    readonly skills?: Readonly<Record<string, number>>;
    /** Nouveaux centres d'intérêt */
    readonly interests?: readonly string[];
    /** Métadonnées personnalisées */
    readonly customMetadata?: Readonly<Record<string, unknown>>;
    /** Forcer la mise à jour même si conflit */
    readonly forceUpdate?: boolean;
}

/**
 * Résultat d'analyse des préférences
 */
export interface PreferenceAnalysisResult {
    /** Préférences détectées */
    readonly detectedPreferences: LearningPreferences;
    /** Confiance dans l'analyse (0-1) */
    readonly confidence: number;
    /** Recommandations basées sur l'analyse */
    readonly recommendations: readonly string[];
    /** Changements détectés par rapport aux préférences actuelles */
    readonly changes: readonly {
        readonly property: string;
        readonly oldValue: unknown;
        readonly newValue: unknown;
        readonly reason: string;
    }[];
    /** Métadonnées de l'analyse */
    readonly analysisMetadata: {
        readonly analyzedAt: Date;
        readonly dataPoints: number;
        readonly algorithm: string;
    };
}

/**
 * Résultat de calcul de compatibilité
 */
export interface CompatibilityResult {
    /** Score de compatibilité (0-1) */
    readonly compatibilityScore: number;
    /** Facteurs qui influencent la compatibilité */
    readonly factors: readonly {
        readonly factor: string;
        readonly weight: number;
        readonly contribution: number;
        readonly explanation: string;
    }[];
    /** Recommandations d'amélioration */
    readonly improvements: readonly string[];
}

/**
 * Statistiques du profil utilisateur
 */
export interface ProfileStatistics {
    /** Activités totales */
    readonly totalActivities: number;
    /** Temps total passé (en secondes) */
    readonly totalTimeSpent: number;
    /** Score moyen */
    readonly averageScore: number;
    /** Taux de complétion */
    readonly completionRate: number;
    /** Progression par compétence */
    readonly skillProgression: Readonly<Record<string, {
        readonly currentLevel: number;
        readonly improvementRate: number;
        readonly timeToMastery: number;
    }>>;
    /** Tendances récentes */
    readonly recentTrends: {
        readonly engagementTrend: 'increasing' | 'stable' | 'decreasing';
        readonly performanceTrend: 'improving' | 'stable' | 'declining';
        readonly consistencyScore: number;
    };
    /** Niveau de compétence actuel */
    readonly currentSkillLevel: CompetencyLevel;
}

/**
 * Configuration du gestionnaire de profils
 */
export interface ProfileManagerConfig {
    /** Durée de cache en millisecondes */
    readonly cacheTTL?: number;
    /** Seuil de maîtrise pour les compétences */
    readonly masteryThreshold?: number;
    /** Seuil de compétence pour les centres d'intérêt */
    readonly skillThreshold?: number;
    /** Activer l'analyse automatique des préférences */
    readonly enableAutoPreferenceAnalysis?: boolean;
    /** Fréquence d'analyse automatique (en jours) */
    readonly autoAnalysisFrequency?: number;
}

// ================================
// INTERFACE PRINCIPALE
// ================================

/**
 * Interface pour la gestion des profils utilisateur
 * Responsable de la création, mise à jour et analyse des profils d'apprentissage
 */
export interface IUserProfileManager {
    /**
     * Récupère le profil d'un utilisateur
     * @param userId - Identifiant unique de l'utilisateur
     * @returns Profil d'apprentissage de l'utilisateur
     * @throws {Error} Si l'utilisateur n'existe pas ou erreur de récupération
     */
    getProfile(userId: string): Promise<UserLearningProfile>;

    /**
     * Récupère ou crée un profil utilisateur s'il n'existe pas
     * @param userId - Identifiant unique de l'utilisateur
     * @returns Profil d'apprentissage (existant ou nouveau)
     * @throws {Error} Si erreur de création
     */
    getOrCreateProfile(userId: string): Promise<UserLearningProfile>;

    /**
     * Met à jour le profil d'un utilisateur
     * @param userId - Identifiant unique de l'utilisateur
     * @param updates - Mises à jour à appliquer
     * @returns Profil mis à jour
     * @throws {Error} Si erreur de mise à jour
     */
    updateProfile(userId: string, updates: ProfileUpdateOptions): Promise<UserLearningProfile>;

    /**
     * Enregistre les données de progression
     * @param userId - Identifiant unique de l'utilisateur
     * @param progressData - Données de progression à enregistrer
     * @returns Profil mis à jour
     * @throws {Error} Si erreur d'enregistrement
     */
    trackProgress(userId: string, progressData: ProgressData): Promise<UserLearningProfile>;

    /**
     * Met à jour les compétences basées sur les performances
     * @param userId - Identifiant unique de l'utilisateur
     * @param performanceData - Données de performance
     * @returns Profil avec compétences mises à jour
     * @throws {Error} Si erreur de mise à jour des compétences
     */
    updateSkills(userId: string, performanceData: unknown): Promise<UserLearningProfile>;

    /**
     * Analyse les préférences d'apprentissage d'un utilisateur
     * @param userId - Identifiant unique de l'utilisateur
     * @returns Résultat de l'analyse des préférences
     * @throws {Error} Si erreur d'analyse
     */
    analyzePreferences(userId: string): Promise<LearningPreferences>;

    /**
     * Calcule la compatibilité entre un utilisateur et du contenu
     * @param userId - Identifiant unique de l'utilisateur
     * @param contentTopics - Sujets du contenu à évaluer
     * @returns Score de compatibilité et détails
     * @throws {Error} Si erreur de calcul
     */
    calculateContentCompatibility(
        userId: string,
        contentTopics: readonly string[]
    ): Promise<number>;

    /**
     * Obtient des statistiques détaillées sur le profil
     * @param userId - Identifiant unique de l'utilisateur
     * @returns Statistiques complètes du profil
     * @throws {Error} Si erreur de calcul des statistiques
     */
    getProfileStatistics?(userId: string): Promise<ProfileStatistics>;

    /**
     * Compare deux utilisateurs pour des recommandations collaboratives
     * @param userId1 - Premier utilisateur
     * @param userId2 - Deuxième utilisateur
     * @returns Résultat de la comparaison
     * @throws {Error} Si erreur de comparaison
     */
    compareUsers?(
        userId1: string,
        userId2: string
    ): Promise<{
        readonly similarity: number;
        readonly commonInterests: readonly string[];
        readonly complementarySkills: readonly string[];
        readonly recommendations: readonly string[];
    }>;

    /**
     * Exporte le profil d'un utilisateur
     * @param userId - Identifiant unique de l'utilisateur
     * @param format - Format d'export désiré
     * @returns Données exportées
     * @throws {Error} Si erreur d'export
     */
    exportProfile?(
        userId: string,
        format: 'json' | 'csv' | 'xml'
    ): Promise<string>;

    /**
     * Importe un profil utilisateur
     * @param userId - Identifiant unique de l'utilisateur
     * @param profileData - Données du profil à importer
     * @param options - Options d'import
     * @returns Profil importé
     * @throws {Error} Si erreur d'import
     */
    importProfile?(
        userId: string,
        profileData: string,
        options?: {
            readonly overwrite: boolean;
            readonly validateData: boolean;
        }
    ): Promise<UserLearningProfile>;
}

// ================================
// CONSTANTES ET UTILITAIRES
// ================================

/**
 * Configuration par défaut du gestionnaire de profils
 */
export const DEFAULT_PROFILE_CONFIG: Required<ProfileManagerConfig> = {
    cacheTTL: 15 * 60 * 1000, // 15 minutes
    masteryThreshold: 0.8,
    skillThreshold: 0.6,
    enableAutoPreferenceAnalysis: true,
    autoAnalysisFrequency: 7 // 7 jours
} as const;

/**
 * Utilitaires pour la gestion des profils
 */
export const ProfileManagerUtils = {
    /**
     * Valide qu'un profil utilisateur est bien formé
     */
    isValidProfile: (profile: unknown): profile is UserLearningProfile => {
        return typeof profile === 'object' &&
            profile !== null &&
            'userId' in profile;
    },

    /**
     * Calcule le niveau de confiance d'un profil
     */
    calculateProfileConfidence: (profile: UserLearningProfile): number => {
        let confidence = 0;

        // Facteurs de confiance basés sur la vraie structure
        if (profile.skills && Object.keys(profile.skills).length > 0) confidence += 0.4;
        if (profile.history && profile.history.completedActivities.length > 5) confidence += 0.3;
        if (profile.preferences) confidence += 0.2;
        if (profile.interests && profile.interests.length > 0) confidence += 0.1;

        return Math.min(confidence, 1.0);
    },

    /**
     * Crée un profil vide pour un utilisateur
     */
    createEmptyProfile: (userId: string): UserLearningProfile => ({
        userId,
        skillLevel: 'A1',
        skills: {},
        interests: [],
        history: {
            completedActivities: [],
            failedActivities: [],
            totalTimeSpent: 0,
            totalSessions: 0,
            lastActivityDate: new Date()
        },
        metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0'
        }
    }),

    /**
     * Valide les options de mise à jour
     */
    validateUpdateOptions: (options: ProfileUpdateOptions): boolean => {
        // Validation basique - peut être étendue
        return typeof options === 'object' && options !== null;
    }
} as const;