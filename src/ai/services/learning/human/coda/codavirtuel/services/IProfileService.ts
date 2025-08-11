/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/IProfileService.ts
 * @description Interface révolutionnaire pour le service de gestion des profils utilisateur CODA
 * 
 * Fonctionnalités révolutionnaires :
 * - 🎯 Interface standardisée pour profils utilisateur adaptatifs
 * - 🔧 Compatible exactOptionalPropertyTypes: true
 * - 📊 Gestion avancée de progression et évaluation multi-niveaux
 * - 🌟 Support apprentissage adaptatif avec IA personnalisée
 * - 🔄 Intégration complète système CODA v4.0.0
 * - 📈 Analytics et métriques de performance
 * - 🎨 Personnalisation culturelle et contextuelle
 * 
 * @module services
 * @version 4.0.0 - Interface révolutionnaire de gestion des profils
 * @since 2025
 * @author MetaSign Team - CODA Services
 * @lastModified 2025-07-31
 */

import type {
    UserReverseProfile,
    LevelEvaluation,
    CECRLLevel
} from '../types/index';

/**
 * Interface pour les résultats d'évaluation d'exercices
 * 
 * @interface EvaluationResult
 * @description Résultat détaillé de l'évaluation d'un exercice utilisateur
 */
export interface EvaluationResult {
    /** Identifiant de l'exercice évalué */
    readonly exerciseId: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Score brut obtenu */
    readonly score: number;
    /** Pourcentage de réussite (0-100) */
    readonly percentage: number;
    /** Indicateur de réussite globale */
    readonly isCorrect: boolean;
    /** Feedback détaillé pour l'utilisateur */
    readonly feedback: string;
    /** Suggestions d'amélioration */
    readonly suggestions: readonly string[];
    /** Horodatage de l'évaluation */
    readonly timestamp: Date;
    /** Métadonnées supplémentaires */
    readonly metadata?: Record<string, unknown>;
    /** Temps passé sur l'exercice (en secondes) */
    readonly timeSpent?: number;
    /** Niveau de difficulté perçu par l'utilisateur */
    readonly perceivedDifficulty?: number;
}

/**
 * Interface pour les statistiques de progression utilisateur
 * 
 * @interface ProgressStatistics
 * @description Statistiques détaillées de progression d'un utilisateur
 */
export interface ProgressStatistics {
    /** Nombre total d'exercices complétés */
    readonly totalExercises: number;
    /** Nombre d'exercices réussis */
    readonly successfulExercises: number;
    /** Taux de réussite global (0-1) */
    readonly successRate: number;
    /** Score moyen obtenu */
    readonly averageScore: number;
    /** Temps total d'apprentissage (en minutes) */
    readonly totalLearningTime: number;
    /** Temps moyen par exercice (en minutes) */
    readonly averageTimePerExercise: number;
    /** Niveau de consistance (0-1) */
    readonly consistencyScore: number;
    /** Domaines de force identifiés */
    readonly strengths: readonly string[];
    /** Domaines à améliorer */
    readonly improvementAreas: readonly string[];
}

/**
 * Interface pour les préférences d'apprentissage utilisateur
 * 
 * @interface LearningPreferences
 * @description Préférences personnalisées d'apprentissage
 */
export interface LearningPreferences {
    /** Styles d'apprentissage préférés */
    readonly preferredLearningStyles: readonly ('visual' | 'auditory' | 'kinesthetic' | 'social')[];
    /** Types d'exercices favoris */
    readonly favoriteExerciseTypes: readonly string[];
    /** Niveau de difficulté préféré (0-1) */
    readonly preferredDifficulty: number;
    /** Durée de session préférée (en minutes) */
    readonly preferredSessionDuration: number;
    /** Fréquence de feedback souhaitée */
    readonly feedbackFrequency: 'immediate' | 'end_of_exercise' | 'end_of_session';
    /** Contexte culturel préféré */
    readonly culturalContext: string;
    /** Motivation principale */
    readonly motivation: 'academic' | 'professional' | 'personal' | 'cultural';
}

/**
 * Interface pour les objectifs d'apprentissage
 * 
 * @interface LearningGoals
 * @description Objectifs personnalisés de l'utilisateur
 */
export interface LearningGoals {
    /** Niveau CECRL cible */
    readonly targetLevel: CECRLLevel;
    /** Date limite souhaitée */
    readonly targetDate?: Date;
    /** Compétences spécifiques à développer */
    readonly specificSkills: readonly string[];
    /** Contextes d'usage prioritaires */
    readonly usageContexts: readonly string[];
    /** Objectifs à court terme (1-4 semaines) */
    readonly shortTermGoals: readonly string[];
    /** Objectifs à moyen terme (1-3 mois) */
    readonly mediumTermGoals: readonly string[];
    /** Objectifs à long terme (3+ mois) */
    readonly longTermGoals: readonly string[];
}

/**
 * Interface pour l'historique d'apprentissage
 * 
 * @interface LearningHistory
 * @description Historique détaillé des activités d'apprentissage
 */
export interface LearningHistory {
    /** Historique des niveaux atteints */
    readonly levelHistory: readonly {
        readonly level: CECRLLevel;
        readonly achievedAt: Date;
        readonly duration: number;
    }[];
    /** Historique des sessions d'apprentissage */
    readonly sessionHistory: readonly {
        readonly sessionId: string;
        readonly startTime: Date;
        readonly endTime: Date;
        readonly exercisesCompleted: number;
        readonly averageScore: number;
    }[];
    /** Jalons importants */
    readonly milestones: readonly {
        readonly id: string;
        readonly description: string;
        readonly achievedAt: Date;
        readonly significance: 'minor' | 'major' | 'critical';
    }[];
}

/**
 * Interface révolutionnaire pour la gestion des profils utilisateur CODA
 * 
 * @interface IProfileService
 * @description Service complet de gestion des profils utilisateur avec intelligence artificielle
 * et personnalisation avancée pour le système d'apprentissage inverse CODA.
 * 
 * @example
 * ```typescript
 * class ProfileService implements IProfileService {
 *   async initializeUserProfile(userId: string, initialLevel?: CECRLLevel) {
 *     // Implémentation de l'initialisation
 *   }
 * 
 *   async updateUserProfile(userProfile, exercise, evaluation) {
 *     // Mise à jour intelligente avec IA
 *   }
 * }
 * ```
 */
export interface IProfileService {
    /**
     * Initialise un nouveau profil utilisateur avec évaluation adaptative
     * 
     * @method initializeUserProfile
     * @param {string} userId - Identifiant unique de l'utilisateur
     * @param {CECRLLevel} [initialLevel] - Niveau initial CECRL optionnel
     * @param {LearningPreferences} [preferences] - Préférences d'apprentissage initiales
     * @returns {Promise<UserReverseProfile>} Profil utilisateur créé et configuré
     * @throws {Error} Si la création du profil échoue
     * 
     * @example
     * ```typescript
     * const profile = await profileService.initializeUserProfile(
     *   'user123', 
     *   'A1',
     *   { preferredLearningStyles: ['visual'], culturalContext: 'france_metropolitan' }
     * );
     * ```
     */
    initializeUserProfile(
        userId: string,
        initialLevel?: CECRLLevel,
        preferences?: Partial<LearningPreferences>
    ): Promise<UserReverseProfile>;

    /**
     * Récupère le profil complet d'un utilisateur
     * 
     * @method getUserProfile
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {boolean} [includeHistory=false] - Inclure l'historique détaillé
     * @returns {Promise<UserReverseProfile | null>} Profil utilisateur ou null si non trouvé
     * 
     * @example
     * ```typescript
     * const profile = await profileService.getUserProfile('user123', true);
     * if (profile) {
     *   console.log(`Niveau actuel: ${profile.currentLevel}`);
     * }
     * ```
     */
    getUserProfile(userId: string, includeHistory?: boolean): Promise<UserReverseProfile | null>;

    /**
     * Met à jour le profil utilisateur avec l'intelligence artificielle
     * 
     * @method updateUserProfile
     * @param {UserReverseProfile} userProfile - Profil utilisateur actuel
     * @param {unknown} exercise - Exercice effectué (type flexible)
     * @param {EvaluationResult} evaluation - Résultat de l'évaluation
     * @returns {Promise<UserReverseProfile>} Profil mis à jour avec IA
     * 
     * @description Met à jour intelligemment le profil en analysant les patterns
     * de performance, ajuste les recommandations et personnalise l'expérience.
     */
    updateUserProfile(
        userProfile: UserReverseProfile,
        exercise: unknown,
        evaluation: EvaluationResult
    ): Promise<UserReverseProfile>;

    /**
     * Évalue le niveau global de l'utilisateur avec analyse multi-critères
     * 
     * @method evaluateUserLevel
     * @param {string} userId - Identifiant utilisateur
     * @param {boolean} [forceReeval=false] - Forcer une réévaluation complète
     * @returns {Promise<LevelEvaluation>} Évaluation détaillée du niveau
     * 
     * @description Analyse les performances récentes, la consistance, et les
     * compétences acquises pour déterminer le niveau CECRL approprié.
     */
    evaluateUserLevel(userId: string, forceReeval?: boolean): Promise<LevelEvaluation>;

    /**
     * Calcule la progression vers le niveau supérieur
     * 
     * @method calculateLevelProgress
     * @param {UserReverseProfile} userProfile - Profil utilisateur
     * @returns {number} Pourcentage de progression (0-1)
     * 
     * @description Calcule un pourcentage précis basé sur les compétences
     * acquises, la consistance des performances et les jalons atteints.
     */
    calculateLevelProgress(userProfile: UserReverseProfile): number;

    /**
     * Génère des statistiques de progression détaillées
     * 
     * @method getProgressStatistics
     * @param {string} userId - Identifiant utilisateur
     * @param {number} [periodDays=30] - Période d'analyse en jours
     * @returns {Promise<ProgressStatistics>} Statistiques complètes
     */
    getProgressStatistics(userId: string, periodDays?: number): Promise<ProgressStatistics>;

    /**
     * Met à jour les préférences d'apprentissage
     * 
     * @method updateLearningPreferences
     * @param {string} userId - Identifiant utilisateur
     * @param {Partial<LearningPreferences>} preferences - Nouvelles préférences
     * @returns {Promise<UserReverseProfile>} Profil mis à jour
     */
    updateLearningPreferences(
        userId: string,
        preferences: Partial<LearningPreferences>
    ): Promise<UserReverseProfile>;

    /**
     * Définit ou met à jour les objectifs d'apprentissage
     * 
     * @method setLearningGoals
     * @param {string} userId - Identifiant utilisateur
     * @param {LearningGoals} goals - Objectifs d'apprentissage
     * @returns {Promise<UserReverseProfile>} Profil mis à jour
     */
    setLearningGoals(userId: string, goals: LearningGoals): Promise<UserReverseProfile>;

    /**
     * Génère des recommandations personnalisées
     * 
     * @method generateRecommendations
     * @param {string} userId - Identifiant utilisateur
     * @param {number} [count=5] - Nombre de recommandations
     * @returns {Promise<readonly string[]>} Liste de recommandations
     * 
     * @description Utilise l'IA pour analyser le profil et générer des
     * recommandations d'exercices, de contenu et de stratégies d'apprentissage.
     */
    generateRecommendations(userId: string, count?: number): Promise<readonly string[]>;

    /**
     * Calcule la compatibilité avec un mentor virtuel
     * 
     * @method calculateMentorCompatibility
     * @param {string} userId - Identifiant utilisateur
     * @param {string} mentorId - Identifiant du mentor
     * @returns {Promise<number>} Score de compatibilité (0-1)
     */
    calculateMentorCompatibility(userId: string, mentorId: string): Promise<number>;

    /**
     * Archive l'historique d'apprentissage
     * 
     * @method archiveLearningHistory
     * @param {string} userId - Identifiant utilisateur
     * @param {Date} [beforeDate] - Archiver avant cette date
     * @returns {Promise<boolean>} Succès de l'archivage
     */
    archiveLearningHistory(userId: string, beforeDate?: Date): Promise<boolean>;

    /**
     * Sauvegarde le profil utilisateur avec versioning
     * 
     * @method saveUserProfile
     * @param {UserReverseProfile} userProfile - Profil à sauvegarder
     * @param {boolean} [createBackup=false] - Créer une sauvegarde
     * @returns {Promise<boolean>} Succès de la sauvegarde
     */
    saveUserProfile(userProfile: UserReverseProfile, createBackup?: boolean): Promise<boolean>;

    /**
     * Restaure une version antérieure du profil
     * 
     * @method restoreUserProfile
     * @param {string} userId - Identifiant utilisateur
     * @param {Date} timestamp - Date de la version à restaurer
     * @returns {Promise<UserReverseProfile | null>} Profil restauré ou null
     */
    restoreUserProfile(userId: string, timestamp: Date): Promise<UserReverseProfile | null>;

    /**
     * Supprime un profil utilisateur avec confirmation
     * 
     * @method deleteUserProfile
     * @param {string} userId - Identifiant utilisateur
     * @param {boolean} [preserveHistory=true] - Préserver l'historique
     * @returns {Promise<boolean>} Succès de la suppression
     */
    deleteUserProfile(userId: string, preserveHistory?: boolean): Promise<boolean>;

    /**
     * Exporte les données utilisateur pour sauvegarde externe
     * 
     * @method exportUserData
     * @param {string} userId - Identifiant utilisateur
     * @param {('profile' | 'history' | 'preferences' | 'all')[]} sections - Sections à exporter
     * @returns {Promise<Record<string, unknown>>} Données exportées
     */
    exportUserData(
        userId: string,
        sections: readonly ('profile' | 'history' | 'preferences' | 'all')[]
    ): Promise<Record<string, unknown>>;

    /**
     * Importe des données utilisateur depuis une sauvegarde
     * 
     * @method importUserData
     * @param {string} userId - Identifiant utilisateur
     * @param {Record<string, unknown>} data - Données à importer
     * @param {boolean} [merge=true] - Fusionner avec les données existantes
     * @returns {Promise<UserReverseProfile>} Profil mis à jour
     */
    importUserData(
        userId: string,
        data: Record<string, unknown>,
        merge?: boolean
    ): Promise<UserReverseProfile>;

    /**
     * Obtient les métriques de performance du service
     * 
     * @method getServiceMetrics
     * @returns {Promise<Record<string, number>>} Métriques de performance
     */
    getServiceMetrics(): Promise<Record<string, number>>;

    /**
     * Valide l'intégrité d'un profil utilisateur
     * 
     * @method validateProfileIntegrity
     * @param {UserReverseProfile} userProfile - Profil à valider
     * @returns {Promise<readonly string[]>} Liste des erreurs trouvées (vide si valide)
     */
    validateProfileIntegrity(userProfile: UserReverseProfile): Promise<readonly string[]>;

    /**
     * Analyse les patterns d'apprentissage de l'utilisateur
     * 
     * @method analyzeLearningPatterns
     * @param {string} userId - Identifiant utilisateur
     * @param {number} [lookbackDays=90] - Période d'analyse en jours
     * @returns {Promise<Record<string, unknown>>} Analyse des patterns
     */
    analyzeLearningPatterns(userId: string, lookbackDays?: number): Promise<Record<string, unknown>>;
}

/**
 * Événements émis par le service de profils
 * 
 * @interface IProfileServiceEvents
 * @description Événements pour l'intégration avec le système d'événements
 */
export interface IProfileServiceEvents {
    /** Profil utilisateur créé */
    readonly 'profile:created': {
        readonly userId: string;
        readonly profile: UserReverseProfile;
    };

    /** Profil utilisateur mis à jour */
    readonly 'profile:updated': {
        readonly userId: string;
        readonly changes: Record<string, unknown>;
        readonly previousVersion: UserReverseProfile;
        readonly newVersion: UserReverseProfile;
    };

    /** Niveau utilisateur changé */
    readonly 'level:changed': {
        readonly userId: string;
        readonly previousLevel: CECRLLevel;
        readonly newLevel: CECRLLevel;
        readonly timestamp: Date;
    };

    /** Objectif atteint */
    readonly 'goal:achieved': {
        readonly userId: string;
        readonly goalId: string;
        readonly goalDescription: string;
        readonly achievedAt: Date;
    };

    /** Profil supprimé */
    readonly 'profile:deleted': {
        readonly userId: string;
        readonly deletedAt: Date;
        readonly preservedHistory: boolean;
    };
}

/**
 * Configuration pour le service de profils
 * 
 * @interface IProfileServiceConfig
 * @description Configuration avancée du service
 */
export interface IProfileServiceConfig {
    /** Activer le cache des profils */
    readonly enableCache: boolean;
    /** Durée de vie du cache (en minutes) */
    readonly cacheLifetime: number;
    /** Activer la sauvegarde automatique */
    readonly enableAutoSave: boolean;
    /** Intervalle de sauvegarde automatique (en minutes) */
    readonly autoSaveInterval: number;
    /** Nombre maximum de versions à conserver */
    readonly maxVersions: number;
    /** Activer l'analyse de patterns en temps réel */
    readonly enableRealtimeAnalysis: boolean;
    /** Seuil de performance pour les alertes */
    readonly performanceThresholds: Record<string, number>;
}

// Les types sont déjà exportés via 'export interface' ci-dessus
// Pas besoin d'export type supplémentaire pour éviter les conflits