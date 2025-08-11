/**
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/types.ts
 * @description Types spécifiques pour les adaptateurs d'apprentissage en temps réel
 */

// Types de base de l'application 
// Note: Ces types devraient être importés correctement dans une implementation réelle
export enum ProfilType {
    SOURD = 'sourd',
    ENTENDANT = 'entendant',
    MALENTENDANT = 'malentendant'
}

// Définition interne des styles d'apprentissage supportés
export enum LearningStyleEnum {
    VISUAL = 'visual',
    INTERACTIVE = 'interactive',
    THEORETICAL = 'theoretical'
}

// Type d'union pour les styles d'apprentissage
export type LearningStyle = 'visual' | 'interactive' | 'theoretical';

/**
 * Métrique d'engagement de l'utilisateur
 */
export interface EngagementMetrics {
    /** Niveau global d'engagement (0-1) */
    overallEngagement: number;
    /** Temps d'attention (secondes) */
    attentionSpan: number;
    /** Patterns d'interaction */
    interactionPatterns: {
        /** Fréquence des interactions (par minute) */
        frequency: number;
        /** Variété des interactions */
        variety: number;
        /** Qualité des interactions */
        quality: number;
    };
    /** Niveau de concentration (0-1) */
    focusLevel: number;
    /** Détail des métriques par type d'activité */
    byActivityType?: Record<string, {
        engagement: number;
        timeSpent: number;
    }>;
    /** Horodatage de l'analyse */
    timestamp: Date;
}

/**
 * Niveaux de frustration
 */
export enum FrustrationLevel {
    /** Aucune frustration détectée */
    NONE = 'none',
    /** Frustration légère */
    LOW = 'low',
    /** Frustration modérée */
    MEDIUM = 'medium',
    /** Frustration élevée */
    HIGH = 'high',
    /** Frustration extrême */
    EXTREME = 'extreme'
}

/**
 * Interaction utilisateur
 */
export interface UserInteraction {
    /** Type d'interaction */
    interactionType: string;
    /** Identifiant de l'activité associée */
    activityId: string;
    /** Horodatage de l'interaction */
    timestamp: Date;
    /** Durée de l'interaction (secondes) */
    duration?: number;
    /** Contexte de l'interaction */
    context?: {
        /** Identifiant de l'activité */
        activityId?: string;
        /** Type d'activité */
        activityType?: string;
        /** Difficulté de l'activité */
        difficulty?: number;
    };
    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown>;
}

/**
 * Contexte d'apprentissage
 */
export interface LearningContext {
    /** Identifiant de session */
    sessionId?: string;
    /** Identifiant d'activité */
    activityId: string;
    /** Type d'activité */
    activityType: string;
    /** Difficulté actuelle (1-10) */
    difficulty: number;
    /** Sujet de l'apprentissage */
    subject: string;
    /** Concept principal en cours d'apprentissage */
    concept?: string;
    /** Concepts en cours d'apprentissage */
    concepts?: string[];
    /** Objectifs d'apprentissage */
    objectives?: string[];
    /** Prérequis pour cette activité */
    prerequisites?: string[];
    /** Heure de début de l'activité */
    startTime: Date;
    /** Position actuelle dans l'activité */
    currentPosition?: number;
    /** Longueur totale de l'activité */
    totalLength?: number;
    /** Temps passé dans la session (secondes) */
    sessionDuration?: number;
    /** Métriques de performance récentes */
    recentPerformance?: {
        /** Score moyen récent (0-100) */
        averageScore: number;
        /** Taux de complétion récent (0-1) */
        completionRate: number;
        /** Erreurs récentes */
        recentErrors: string[];
    };
    /** Préférences utilisateur dans le contexte */
    userContextPreferences?: {
        /** Style d'apprentissage préféré */
        preferredStyle?: string;
        /** Rythme préféré */
        preferredPace?: string;
        /** Types de feedback préférés */
        preferredFeedbackTypes?: string[];
    };
    /** État de progression dans l'activité */
    progressState?: {
        /** Étape actuelle */
        currentStep: number;
        /** Nombre total d'étapes */
        totalSteps: number;
        /** Temps estimé restant (secondes) */
        estimatedTimeRemaining: number;
    };
    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown>;
}

/**
 * Ajustement de rythme
 */
export interface PaceAdjustment {
    /** Rythme actuel (1-10) */
    currentPace: number;
    /** Rythme recommandé (1-10) */
    recommendedPace: number;
    /** Explication de l'ajustement */
    reasoning: string;
    /** Impact estimé de l'ajustement */
    estimatedImpact: {
        /** Impact sur l'engagement (%-100% à 100%) */
        onEngagement: number;
        /** Impact sur la compréhension (%-100% à 100%) */
        onComprehension: number;
        /** Impact sur le taux de complétion (%-100% à 100%) */
        onCompletion: number;
    };
}

/**
 * Contenu d'assistance
 */
export interface AssistanceContent {
    /** Type d'assistance */
    type: string;
    /** Contenu textuel de l'assistance */
    content: string;
    /** Priorité de l'assistance (1-5) */
    priority: number;
    /** Indique si l'assistance peut être ignorée */
    dismissible: boolean;
    /** Ressources supplémentaires */
    resources?: {
        /** Type de ressource */
        type: string;
        /** URL de la ressource */
        url: string;
        /** Description de la ressource */
        description: string;
    }[];
    /** Actions suggérées */
    suggestedActions?: {
        /** Libellé de l'action */
        label: string;
        /** Type d'action */
        type: string;
        /** Données associées à l'action */
        data?: Record<string, unknown>;
    }[];
}

/**
 * Résultat d'assistance du service d'assistance
 */
export interface AssistanceResult {
    /** Type d'assistance */
    type: string;
    /** Contenu de l'assistance */
    content: string;
    /** Priorité (1-5) */
    priority: number;
    /** Assistance pouvant être ignorée */
    dismissible: boolean;
    /** Ressources complémentaires */
    resources?: Record<string, unknown>[];
}

/**
 * Préférences d'apprentissage
 */
export interface LearningPreferences {
    /** Style d'apprentissage préféré */
    learningStyle: 'visual' | 'interactive' | 'theoretical';
    /** Rythme d'apprentissage préféré */
    pacePreference: 'slow' | 'moderate' | 'fast';
    /** Niveau d'adaptativité souhaité (0-1) */
    adaptivityLevel: number;
    /** Niveau d'assistance souhaité (0-1) */
    assistanceLevel: number;
    /** Préférence de contrôle */
    controlPreference: 'low' | 'medium' | 'high';
    /** Préférence pour le feedback */
    prefersFeedback: boolean;
    /** Besoin de structure */
    requiresStructure?: boolean;
    /** Types de contenu préférés */
    preferredContentTypes?: string[];
    /** Moments de la journée préférés */
    preferredTimeOfDay?: string[];
}

/**
 * Type pour les préférences d'apprentissage source (format générique)
 */
export interface SourceLearningPreferences {
    /** Dictionnaire de propriétés diverses */
    [key: string]: unknown;
    /** Style d'apprentissage */
    learningStyle?: string | LearningStyle;
    /** Style d'apprentissage préféré (alternative) */
    preferredLearningStyle?: string | LearningStyle;
    /** Préférence de rythme */
    pacePreference?: string | number;
    /** Rythme préféré (alternative) */
    preferredPace?: string | number;
    /** Niveau d'adaptativité */
    adaptivityLevel?: number;
    /** Niveau d'assistance */
    assistanceLevel?: number;
    /** Préférence de contrôle */
    controlPreference?: string;
    /** Préférence pour le feedback */
    prefersFeedback?: boolean;
    /** Besoin de structure */
    requiresStructure?: boolean;
    /** Types de contenu préférés */
    preferredContentTypes?: string[];
    /** Moments de la journée préférés */
    preferredTimeOfDay?: string[];
}

/**
 * Interface d'utilisateur étendue avec les propriétés nécessaires pour l'adaptation en temps réel
 */
export interface ExtendedUserProfile {
    // Propriétés requises du profil utilisateur
    /** Identifiant utilisateur */
    id?: string;
    /** Identifiant utilisateur (alternative) */
    userId?: string;
    /** Type de profil (entendant/sourd) */
    profilType: ProfilType;
    /** Préférences d'apprentissage */
    learningPreferences: {
        /** Types de contenu préférés */
        preferredContentTypes: string[];
        /** Rythme préféré */
        preferredPace: 'slow' | 'moderate' | 'fast';
        /** Fréquence de feedback préférée */
        preferredFeedbackFrequency: 'low' | 'medium' | 'high';
    };
    /** Niveaux de compétence par domaine */
    skillLevels: Record<string, number>;
    /** Cours terminés */
    completedCourses: string[];
    /** Cours en cours */
    inProgressCourses: string[];
    /** Badges obtenus */
    badges: string[];
    /** Points d'expérience */
    experience: number;
    /** Niveau de l'utilisateur */
    level: number;
    /** Dernière activité */
    lastActive: Date;
    /** Environnements préférés */
    preferredEnvironments: string[];
    /** Consentement pour l'apprentissage fédéré */
    hasFederatedLearningConsent: boolean;

    // Propriétés optionnelles étendues
    /** Niveau de compétence général */
    skillLevel?: string;
    /** Compétences acquises */
    skills?: string[];
    /** Lacunes identifiées */
    gaps?: string[];
    /** Centres d'intérêt */
    interests?: string[];
    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
    /** Préférences utilisateur */
    preferences?: Record<string, unknown>;
}

/**
 * Structure du pattern d'interaction détecté
 */
export type InteractionPattern = FrequencyPattern | SequencePattern;

/**
 * Pattern de fréquence d'interaction
 */
export interface FrequencyPattern {
    /** Type de pattern */
    type: 'frequency';
    /** Type d'interaction concerné */
    interactionType: string;
    /** Nombre d'occurrences */
    count: number;
    /** Durée moyenne des interactions */
    averageDuration: number;
}

/**
 * Pattern de séquence d'interaction
 */
export interface SequencePattern {
    /** Type de pattern */
    type: 'sequence';
    /** Séquences détectées */
    sequences: Array<{
        /** Type d'interaction de départ */
        from: string;
        /** Type d'interaction d'arrivée */
        to: string;
        /** Fréquence de la séquence */
        frequency: number;
    }>;
}

/**
 * Recommandation basée sur les patterns d'interaction
 */
export interface InteractionRecommendation {
    /** Type de recommandation */
    type: string;
    /** Priorité de la recommandation */
    priority: 'low' | 'medium' | 'high';
    /** Raison de la recommandation */
    reason: string;
    /** Suggestion d'action */
    suggestion: string;
}

/**
 * Résultat de l'analyse des patterns d'interaction
 */
export interface PatternAnalysisResult {
    /** Patterns détectés */
    patterns: InteractionPattern[];
    /** Recommandations générées */
    recommendations: InteractionRecommendation[];
    /** Niveau de confiance (0-1) */
    confidence: number;
    /** Horodatage de l'analyse */
    timestamp: Date;
    /** Message explicatif */
    message?: string;
    /** Message d'erreur éventuel */
    error?: string;
}