/**
 * @fileoverview Types pour les paramètres et préférences de l'application MetaSign
 * @module @/types/settings
 * @version 1.0.0
 * @author MetaSign Team
 * @since 2025-06-16
 * 
 * Définit tous les types TypeScript pour la gestion des paramètres utilisateur,
 * préférences d'interface et configuration de l'application.
 * 
 * @path src/types/settings.ts
 */

/**
 * Types pour les thèmes d'interface disponibles
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Types pour les tailles de police disponibles
 */
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Types pour les langues supportées
 */
export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de' | 'it';

/**
 * Interface pour les paramètres d'accessibilité
 */
export interface AccessibilitySettings {
    /** Réduction des animations */
    reduceMotion: boolean;
    /** Mode haut contraste */
    highContrast: boolean;
    /** Taille de la police */
    fontSize: FontSize;
    /** Lecture d'écran activée */
    screenReader: boolean;
    /** Navigation au clavier uniquement */
    keyboardNavigation: boolean;
    /** Sous-titres automatiques */
    autoSubtitles: boolean;
}

/**
 * Interface pour les paramètres de notifications
 */
export interface NotificationSettings {
    /** Notifications par email */
    email: boolean;
    /** Notifications push */
    push: boolean;
    /** Notifications dans l'application */
    inApp: boolean;
    /** Notifications de progression */
    progress: boolean;
    /** Notifications de rappels */
    reminders: boolean;
    /** Notifications des nouveautés */
    updates: boolean;
}

/**
 * Interface pour les paramètres d'affichage
 */
export interface DisplaySettings {
    /** Densité de l'interface */
    density: 'compact' | 'comfortable' | 'spacious';
    /** Affichage de la barre latérale */
    sidebarVisible: boolean;
    /** Position de la barre latérale */
    sidebarPosition: 'left' | 'right';
    /** Affichage des tooltips */
    showTooltips: boolean;
    /** Animations d'interface */
    enableAnimations: boolean;
    /** Mode plein écran par défaut */
    defaultFullscreen: boolean;
}

/**
 * Interface pour les paramètres de langue des signes
 */
export interface SignLanguageSettings {
    /** Langue des signes principale */
    primary: 'lsf' | 'asl' | 'bsl' | 'jsl';
    /** Vitesse de lecture des signes */
    playbackSpeed: number;
    /** Affichage des mains dominantes */
    showDominantHand: boolean;
    /** Affichage des expressions faciales */
    showFacialExpressions: boolean;
    /** Région dialectale */
    region?: string;
}

/**
 * Interface pour les paramètres d'apprentissage
 */
export interface LearningSettings {
    /** Niveau de difficulté */
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    /** Objectifs d'apprentissage */
    goals: string[];
    /** Temps d'étude quotidien (en minutes) */
    dailyStudyTime: number;
    /** Rappels d'étude activés */
    studyReminders: boolean;
    /** Mode adaptatif */
    adaptiveMode: boolean;
    /** Feedback détaillé */
    detailedFeedback: boolean;
}

/**
 * Interface pour les paramètres de performance
 */
export interface PerformanceSettings {
    /** Qualité vidéo */
    videoQuality: 'low' | 'medium' | 'high' | 'auto';
    /** Fréquence d'images */
    frameRate: 30 | 60;
    /** Cache activé */
    enableCache: boolean;
    /** Préchargement des contenus */
    preloadContent: boolean;
    /** Compression des données */
    dataCompression: boolean;
}

/**
 * Interface pour les paramètres de confidentialité
 */
export interface PrivacySettings {
    /** Partage de données analytiques */
    analytics: boolean;
    /** Cookies non essentiels */
    nonEssentialCookies: boolean;
    /** Historique d'apprentissage */
    learningHistory: boolean;
    /** Profil public */
    publicProfile: boolean;
    /** Visibilité des progrès */
    progressVisibility: 'private' | 'friends' | 'public';
}

/**
 * Interface principale pour toutes les préférences utilisateur
 */
export interface Preferences {
    /** Thème de l'interface */
    theme: Theme;
    /** Langue de l'interface */
    language: SupportedLanguage;
    /** Paramètres d'accessibilité */
    accessibility: AccessibilitySettings;
    /** Paramètres de notifications */
    notifications: NotificationSettings;
    /** Paramètres d'affichage */
    display: DisplaySettings;
    /** Paramètres de langue des signes */
    signLanguage: SignLanguageSettings;
    /** Paramètres d'apprentissage */
    learning: LearningSettings;
    /** Paramètres de performance */
    performance: PerformanceSettings;
    /** Paramètres de confidentialité */
    privacy: PrivacySettings;
    /** Date de dernière modification */
    lastUpdated: Date;
    /** Version des paramètres */
    version: string;
}

/**
 * Interface pour les mises à jour partielles des préférences
 */
export type PreferencesUpdate = Partial<Preferences>;

/**
 * Interface pour les paramètres par défaut
 */
export interface DefaultSettings {
    /** Préférences par défaut pour nouveaux utilisateurs */
    newUser: Preferences;
    /** Préférences par défaut pour utilisateurs existants */
    existing: Partial<Preferences>;
    /** Préférences pour les utilisateurs avec handicaps */
    accessibility: Partial<Preferences>;
}

/**
 * Interface pour la validation des paramètres
 */
export interface SettingsValidation {
    /** Erreurs de validation */
    errors: Record<string, string>;
    /** Avertissements */
    warnings: Record<string, string>;
    /** Paramètres valides */
    isValid: boolean;
}

/**
 * Type pour les catégories de paramètres
 */
export type SettingsCategory =
    | 'appearance'
    | 'accessibility'
    | 'notifications'
    | 'display'
    | 'signLanguage'
    | 'learning'
    | 'performance'
    | 'privacy';

/**
 * Interface pour l'export/import des paramètres
 */
export interface SettingsExport {
    /** Données des préférences */
    preferences: Preferences;
    /** Métadonnées de l'export */
    metadata: {
        exportDate: Date;
        version: string;
        userId?: string;
    };
}

/**
 * Valeurs par défaut pour les paramètres d'accessibilité
 */
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
    reduceMotion: false,
    highContrast: false,
    fontSize: 'medium',
    screenReader: false,
    keyboardNavigation: false,
    autoSubtitles: false,
};

/**
 * Valeurs par défaut pour les paramètres de notifications
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    email: true,
    push: false,
    inApp: true,
    progress: true,
    reminders: true,
    updates: false,
};

/**
 * Valeurs par défaut pour les paramètres d'affichage
 */
export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
    density: 'comfortable',
    sidebarVisible: true,
    sidebarPosition: 'left',
    showTooltips: true,
    enableAnimations: true,
    defaultFullscreen: false,
};

/**
 * Valeurs par défaut pour les paramètres de langue des signes
 */
export const DEFAULT_SIGN_LANGUAGE_SETTINGS: SignLanguageSettings = {
    primary: 'lsf',
    playbackSpeed: 1.0,
    showDominantHand: true,
    showFacialExpressions: true,
    region: 'paris',
};

/**
 * Valeurs par défaut pour les paramètres d'apprentissage
 */
export const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
    difficultyLevel: 'beginner',
    goals: [],
    dailyStudyTime: 30,
    studyReminders: true,
    adaptiveMode: true,
    detailedFeedback: true,
};

/**
 * Valeurs par défaut pour les paramètres de performance
 */
export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
    videoQuality: 'auto',
    frameRate: 30,
    enableCache: true,
    preloadContent: true,
    dataCompression: true,
};

/**
 * Valeurs par défaut pour les paramètres de confidentialité
 */
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
    analytics: false,
    nonEssentialCookies: false,
    learningHistory: true,
    publicProfile: false,
    progressVisibility: 'private',
};