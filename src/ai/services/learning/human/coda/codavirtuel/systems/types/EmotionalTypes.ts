/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/types/EmotionalTypes.ts
 * @description Types et interfaces pour le système émotionnel révolutionnaire des IA-élèves
 * 
 * Contient :
 * - 🎭 Types d'émotions primaires selon modèle Plutchik-LSF
 * - 💫 Interfaces pour états et transitions émotionnelles
 * - 🔄 Structures pour historique et patterns émotionnels
 * - ⚙️ Configurations et paramètres du système
 * 
 * @module EmotionalTypes
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Emotional AI Division
 */

/**
 * Émotions primaires selon le modèle de Plutchik adapté LSF
 */
export type PrimaryEmotion =
    | 'joy'           // Joie - réussite d'apprentissage
    | 'sadness'       // Tristesse - échec ou difficulté
    | 'anger'         // Colère - frustration
    | 'fear'          // Peur - appréhension d'erreur
    | 'surprise'      // Surprise - découverte inattendue
    | 'disgust'       // Dégoût - rejet de méthode
    | 'trust'         // Confiance - en mentor/méthode
    | 'anticipation'; // Anticipation - attente d'apprentissage

/**
 * Intensité émotionnelle sur l'échelle 0-1
 */
export type EmotionIntensity = number;

/**
 * Types de courbes de transition émotionnelle
 */
export type TransitionCurve =
    | 'linear'        // Transition linéaire
    | 'easeIn'        // Accélération graduelle
    | 'easeOut'       // Décélération graduelle
    | 'easeInOut'     // Courbe S
    | 'bounce'        // Rebond (pour surprise)
    | 'elastic';      // Élastique (pour excitation)

/**
 * Types de patterns émotionnels
 */
export type PatternType =
    | 'learningCycle'      // Cycle d'apprentissage
    | 'frustrationSpiral'  // Spirale de frustration
    | 'confidenceBuild'    // Construction de confiance
    | 'breakthrough'       // Moment de révélation
    | 'plateauStagnation'  // Stagnation sur plateau
    | 'recoveryBounce';    // Récupération après échec

/**
 * Types de transitions émotionnelles
 */
export type EmotionalTransitionType =
    | 'gradual'
    | 'sudden'
    | 'oscillating'
    | 'amplifying'
    | 'diminishing';

/**
 * Interface pour un état émotionnel complet
 */
export interface EmotionalState {
    /** Émotion primaire dominante */
    readonly primaryEmotion: PrimaryEmotion;
    /** Intensité de l'émotion (0-1) */
    readonly intensity: EmotionIntensity;
    /** Émotions secondaires présentes */
    readonly secondaryEmotions?: ReadonlyMap<PrimaryEmotion, EmotionIntensity> | string[];
    /** Valence générale (positive/négative) */
    readonly valence: number;
    /** Niveau d'activation (calme/excité) */
    readonly arousal: number;
    /** Contexte déclencheur */
    readonly trigger: string;
    /** Timestamp de l'état */
    readonly timestamp: Date;
    /** Durée prévue (ms) */
    readonly expectedDuration: number;
    /** Score de confiance dans la détection (0-1) */
    readonly confidence?: number;
}

/**
 * Interface pour une transition émotionnelle
 */
export interface EmotionalTransition {
    /** État émotionnel de départ */
    readonly fromState: EmotionalState;
    /** État émotionnel d'arrivée */
    readonly toState: EmotionalState;
    /** Déclencheur de transition */
    readonly trigger: string;
    /** Durée de transition (ms) */
    readonly duration: number;
    /** Courbe de transition */
    readonly curve: TransitionCurve;
    /** Timestamp de début */
    readonly startTime: Date;
}

/**
 * Interface pour un pattern émotionnel
 */
export interface EmotionalPattern {
    /** Type de pattern */
    readonly type: PatternType;
    /** Séquence d'émotions */
    readonly sequence: readonly PrimaryEmotion[];
    /** Fréquence d'occurrence */
    readonly frequency: number;
    /** Déclencheurs typiques */
    readonly triggers: readonly string[];
    /** Confiance dans le pattern */
    readonly confidence: number;
}

/**
 * Interface pour l'historique émotionnel
 */
export interface EmotionalHistory {
    /** Historique des états */
    readonly stateHistory: readonly EmotionalState[];
    /** Historique des transitions */
    readonly transitionHistory?: readonly EmotionalTransition[];
    /** Patterns émotionnels détectés */
    readonly detectedPatterns: readonly EmotionalPattern[];
    /** Temps d'analyse */
    readonly lastAnalysis: Date;
    /** Métriques de stabilité émotionnelle */
    readonly stabilityMetrics?: {
        overallStability: number;
        volatilityScore: number;
        recoverySpeed: number;
    };
}

/**
 * Configuration du système émotionnel
 */
export interface AIEmotionalSystemConfig {
    /** Volatilité émotionnelle de base (0-1) */
    readonly baseVolatility: number;
    /** Vitesse de transition par défaut (ms) */
    readonly defaultTransitionSpeed: number;
    /** Persistance émotionnelle (0-1) */
    readonly emotionalPersistence: number;
    /** Sensibilité aux déclencheurs (0-1) */
    readonly triggerSensitivity: number;
    /** Activer détection de patterns */
    readonly enablePatternDetection: boolean;
    /** Profondeur historique */
    readonly historyDepth: number;
    /** Orientation d'apprentissage ('positive', 'negative', 'neutral') */
    readonly learningBias?: 'positive' | 'negative' | 'neutral';
    /** Résilience émotionnelle - capacité à gérer les chocs émotionnels (0-1) */
    readonly emotionalResilience?: number;
    /** Intensité de focus - capacité de concentration sur une tâche (0-1) */
    readonly focusIntensity?: number;
    /** Facteur d'adaptation au contexte culturel (0-1) */
    readonly culturalAdaptation?: number;
    /** Intervalle de rafraîchissement des états émotionnels (ms) */
    readonly refreshInterval?: number;
}

/**
 * Paramètres pour génération d'émotion
 */
export interface EmotionGenerationParams {
    /** Contexte d'apprentissage */
    readonly learningContext: string;
    /** Stimulus déclencheur */
    readonly stimulus: string;
    /** Intensité du stimulus */
    readonly stimulusIntensity: number;
    /** Résultat d'apprentissage */
    readonly learningOutcome: 'success' | 'partial' | 'failure';
    /** Facteurs contextuels */
    readonly contextualFactors: readonly string[];
    /** Profil de l'étudiant (facultatif) */
    readonly studentProfile?: unknown;
    /** Historique émotionnel récent (facultatif) */
    readonly recentHistory?: unknown[];
}

/**
 * Statistiques du système émotionnel
 */
export interface EmotionalSystemStatistics {
    /** Nombre total d'étudiants actifs */
    readonly totalActiveStudents: number;
    /** Nombre d'étudiants avec profils de personnalité */
    readonly studentsWithPersonalityProfiles: number;
    /** Distribution actuelle des émotions */
    readonly currentEmotionDistribution: Record<string, number>;
    /** Configuration actuelle du système */
    readonly systemConfig: Partial<AIEmotionalSystemConfig>;
    /** Temps moyen de génération (ms) */
    readonly averageGenerationTime?: number;
    /** Nombre total d'états générés */
    readonly totalStatesGenerated?: number;
}

/**
 * Résultat d'analyse émotionnelle complète
 */
export interface EmotionalAnalysisResult {
    /** État émotionnel actuel */
    readonly currentState: EmotionalState;
    /** Patterns émotionnels détectés */
    readonly patterns: Array<{
        name: string;
        description: string;
        confidence: number;
    }>;
    /** Historique récent des émotions */
    readonly recentHistory: EmotionalState[];
    /** Niveau de confiance dans l'analyse (0-1) */
    readonly confidence: number;
    /** Recommandations pédagogiques */
    readonly recommendations: string[];
    /** Prédictions d'évolution émotionnelle */
    readonly predictions?: Array<{
        predictedEmotion: string;
        probability: number;
        timeframe: string;
    }>;
}

/**
 * Paramètres de transition émotionnelle
 */
export interface EmotionalTransitionParams {
    /** Type de transition */
    readonly transitionType: EmotionalTransitionType;
    /** Durée de la transition (ms) */
    readonly duration: number;
    /** État émotionnel cible */
    readonly targetState: Partial<EmotionalState>;
    /** Facteur d'inertie (0-1) */
    readonly inertiaFactor?: number;
}

/**
 * Configuration par défaut du système émotionnel
 */
export const DEFAULT_EMOTIONAL_CONFIG: AIEmotionalSystemConfig = {
    baseVolatility: 0.5,
    defaultTransitionSpeed: 2000, // 2 secondes
    emotionalPersistence: 0.7,
    triggerSensitivity: 0.6,
    enablePatternDetection: true,
    historyDepth: 100
} as const;

/**
 * Règles de valence par émotion primaire
 */
export const EMOTION_VALENCE_MAP: Record<PrimaryEmotion, number> = {
    'joy': 0.9,
    'trust': 0.7,
    'anticipation': 0.5,
    'surprise': 0.0,
    'sadness': -0.7,
    'fear': -0.6,
    'anger': -0.8,
    'disgust': -0.5
} as const;

/**
 * Durées de base par émotion (en millisecondes)
 */
export const EMOTION_BASE_DURATIONS: Record<PrimaryEmotion, number> = {
    'joy': 5000,
    'sadness': 8000,
    'anger': 6000,
    'fear': 4000,
    'surprise': 2000,
    'disgust': 3000,
    'trust': 10000,
    'anticipation': 7000
} as const;

/**
 * Règles de transition émotionnelle avec probabilités
 */
export const TRANSITION_RULES: Record<string, number> = {
    'joy->sadness': 0.3,
    'joy->surprise': 0.8,
    'joy->trust': 0.9,
    'sadness->anger': 0.6,
    'sadness->fear': 0.4,
    'fear->surprise': 0.7,
    'fear->anger': 0.5,
    'anger->disgust': 0.5,
    'anger->sadness': 0.4,
    'surprise->joy': 0.7,
    'surprise->fear': 0.3,
    'trust->joy': 0.8,
    'trust->anticipation': 0.6,
    'anticipation->surprise': 0.5,
    'anticipation->joy': 0.7,
    'disgust->anger': 0.4,
    'disgust->sadness': 0.3
} as const;