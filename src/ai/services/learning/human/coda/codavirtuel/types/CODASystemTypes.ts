/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types/CODASystemTypes.ts
 * @description Types système centralisés pour CODA - Compatible exactOptionalPropertyTypes
 * 
 * Fonctionnalités :
 * - 🎯 Types système de base pour CODA
 * - 🔧 Compatible exactOptionalPropertyTypes: true
 * - 📊 Interfaces pour état émotionnel et évolution
 * - 🌟 Types pour profils de personnalité
 * - ✅ Utilitaires de validation et manipulation
 * - 🔄 Élimination de la dépendance circulaire
 * 
 * @module CODASystemTypes
 * @version 1.1.0 - Version sans dépendance circulaire
 * @since 2025
 * @author MetaSign Team - CODA System Types
 * @lastModified 2025-07-21
 */

// ===== TYPES DE BASE DÉFINIS LOCALEMENT (PLUS DE DÉPENDANCE CIRCULAIRE) =====

/**
 * Types de personnalité CODA (défini localement pour éviter la circularité)
 */
type CODAPersonalityType =
    | 'curious_student'
    | 'shy_learner'
    | 'energetic_pupil'
    | 'patient_apprentice'
    | 'encouraging_mentor'
    | 'strict_teacher'
    | 'patient_guide';

/**
 * Environnements culturels (défini localement pour éviter la circularité)
 */
type CulturalEnvironment =
    | 'deaf_family_home'
    | 'mixed_hearing_family'
    | 'school_environment'
    | 'community_center'
    | 'online_learning'
    | 'deaf_school'
    | 'deaf_community_center'
    | 'deaf_workplace';

// ===== TYPES DE BASE SYSTÈME =====

/**
 * Émotions primaires disponibles
 */
export type PrimaryEmotion =
    | 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust'
    | 'trust' | 'anticipation' | 'confusion' | 'excitement' | 'curiosity'
    | 'frustration' | 'satisfaction' | 'boredom' | 'engagement';

/**
 * Intensité émotionnelle (0-1)
 */
export type EmotionIntensity = number;

/**
 * État de session CODA
 */
export type CODASessionState =
    | 'initializing'
    | 'active'
    | 'paused'
    | 'learning'
    | 'evaluating'
    | 'completed'
    | 'error'
    | 'terminated';

// ===== INTERFACES SYSTÈME =====

/**
 * Configuration de l'évolution de l'IA
 */
export interface AIEvolutionConfig {
    /** Taux d'évolution de base (0-1) */
    readonly baseEvolutionRate: number;
    /** Vitesse d'adaptation (0-1) */
    readonly adaptationSpeed: number;
    /** Activation de l'auto-optimisation */
    readonly enableAutoOptimization: boolean;
    /** Seuil de déclenchement d'évolution (0-1) */
    readonly evolutionThreshold?: number;
    /** Profondeur d'analyse pour l'évolution */
    readonly analysisDepth?: number;
    /** Sensibilité à l'évolution (0-1) */
    readonly evolutionSensitivity?: number;
}

/**
 * Configuration émotionnelle
 */
export interface EmotionalConfig {
    /** Volatilité de base des émotions (0-1) */
    readonly baseVolatility: number;
    /** Activation de la détection de patterns */
    readonly enablePatternDetection: boolean;
    /** Mémoire émotionnelle activée */
    readonly emotionalMemory?: boolean;
    /** Sensibilité aux déclencheurs (0-1) */
    readonly triggerSensitivity?: number;
    /** Profondeur de l'historique émotionnel */
    readonly historyDepth?: number;
}

/**
 * Traits de personnalité Big Five
 */
export interface BigFiveTraits {
    /** Ouverture à l'expérience (0-1) */
    readonly openness: number;
    /** Conscienciosité (0-1) */
    readonly conscientiousness: number;
    /** Extraversion (0-1) */
    readonly extraversion: number;
    /** Agréabilité (0-1) */
    readonly agreeableness: number;
    /** Neuroticisme (0-1) */
    readonly neuroticism: number;
}

/**
 * Préférences d'apprentissage
 */
export interface LearningPreferences {
    /** Méthodes d'enseignement préférées */
    readonly preferredTeachingMethods: readonly string[];
    /** Rythme optimal d'apprentissage (0-1) */
    readonly optimalPace: number;
    /** Tolérance aux répétitions (0-1) */
    readonly repetitionTolerance: number;
    /** Affinité pour l'apprentissage visuel (0-1) */
    readonly visualLearningAffinity?: number;
    /** Préférence pour l'apprentissage social (0-1) */
    readonly socialLearningPreference?: number;
    /** Besoin de feedback immédiat (0-1) */
    readonly immediateFeedbackNeed?: number;
}

/**
 * Traits culturels LSF
 */
export interface LSFCulturalTraits {
    /** Sensibilité culturelle sourde (0-1) */
    readonly deafCulturalSensitivity: number;
    /** Adaptation contextuelle (0-1) */
    readonly contextualAdaptation: number;
    /** Compréhension des nuances régionales (0-1) */
    readonly regionalNuancesUnderstanding: number;
    /** Respect des codes sociaux LSF (0-1) */
    readonly socialCodesRespect: number;
    /** Intégration communautaire (0-1) */
    readonly communityIntegration: number;
}

/**
 * Profil de personnalité complet
 */
export interface PersonalityProfile {
    /** Type de personnalité principal */
    readonly personalityType: CODAPersonalityType;
    /** Traits Big Five */
    readonly bigFiveTraits: BigFiveTraits;
    /** Préférences d'apprentissage */
    readonly learningPreferences: LearningPreferences;
    /** Traits culturels LSF */
    readonly culturalTraits: LSFCulturalTraits;
    /** Environnement culturel d'origine */
    readonly culturalBackground: CulturalEnvironment;
    /** Niveau de motivation intrinsèque (0-1) */
    readonly intrinsicMotivation: number;
    /** Résilience face aux difficultés (0-1) */
    readonly resilience: number;
}

/**
 * État émotionnel complet
 */
export interface EmotionalState {
    /** Émotion primaire actuelle */
    readonly primaryEmotion: PrimaryEmotion;
    /** Intensité de l'émotion primaire (0-1) */
    readonly intensity: EmotionIntensity;
    /** Émotions secondaires avec intensités */
    readonly secondaryEmotions: ReadonlyMap<PrimaryEmotion, EmotionIntensity>;
    /** Valence émotionnelle (-1 à 1) */
    readonly valence: number;
    /** Arousal/activation émotionnelle (0-1) */
    readonly arousal: number;
    /** Stabilité émotionnelle (0-1) */
    readonly stability: number;
    /** Timestamp de l'état */
    readonly timestamp: Date;
    /** Facteurs déclencheurs */
    readonly triggers?: readonly string[];
    /** Durée prévue de l'état en secondes */
    readonly expectedDuration?: number;
}

/**
 * Métriques d'évolution
 */
export interface EvolutionMetrics {
    /** Confiance globale dans les compétences (0-1) */
    readonly globalConfidence: number;
    /** Taux de réussite récent (0-1) */
    readonly recentSuccessRate: number;
    /** Courbe d'apprentissage (progression) */
    readonly learningCurve: readonly number[];
    /** Nombre d'adaptations effectuées */
    readonly adaptationCount: number;
    /** Score de cohérence comportementale (0-1) */
    readonly behavioralConsistency: number;
    /** Temps depuis la dernière évolution (en secondes) */
    readonly timeSinceLastEvolution: number;
    /** Prédictions de performance future */
    readonly futurePerformancePrediction?: number;
    /** Domaines d'amélioration identifiés */
    readonly improvementAreas?: readonly string[];
}

/**
 * Statistiques de mémoire
 */
export interface MemoryStats {
    /** Capacité totale de mémoire */
    readonly totalCapacity: number;
    /** Mémoire utilisée */
    readonly usedMemory: number;
    /** Nombre de souvenirs stockés */
    readonly memoriesCount: number;
    /** Taux de récupération des souvenirs (0-1) */
    readonly retrievalRate: number;
    /** Âge moyen des souvenirs (en secondes) */
    readonly averageMemoryAge: number;
    /** Fragmentation de la mémoire (0-1) */
    readonly fragmentation: number;
    /** Dernière consolidation */
    readonly lastConsolidation?: Date;
    /** Efficacité de stockage (0-1) */
    readonly storageEfficiency?: number;
}

/**
 * Historique de performance
 */
export interface PerformanceHistory {
    /** Scores récents (50 derniers) */
    readonly recentScores: readonly number[];
    /** Temps de réponse moyens */
    readonly averageResponseTimes: readonly number[];
    /** Domaines de compétence avec progression */
    readonly competencyProgression: ReadonlyMap<string, readonly number[]>;
    /** Erreurs fréquentes */
    readonly frequentErrors: readonly string[];
    /** Améliorations notables */
    readonly notableImprovements: readonly {
        readonly area: string;
        readonly improvementRate: number;
        readonly timestamp: Date;
    }[];
    /** Sessions d'apprentissage totales */
    readonly totalSessions: number;
    /** Durée d'apprentissage totale (en secondes) */
    readonly totalLearningTime: number;
}

// ===== UTILITAIRES DE TYPE =====

/**
 * Utilitaires pour manipuler les types CODA
 */
export const CODATypeUtils = {
    /**
     * Vérifie si une émotion est positive
     */
    isPositiveEmotion(emotion: PrimaryEmotion): boolean {
        const positiveEmotions: readonly PrimaryEmotion[] = [
            'joy', 'trust', 'anticipation', 'excitement', 'curiosity', 'satisfaction', 'engagement'
        ];
        return positiveEmotions.includes(emotion);
    },

    /**
     * Vérifie si une émotion est négative
     */
    isNegativeEmotion(emotion: PrimaryEmotion): boolean {
        const negativeEmotions: readonly PrimaryEmotion[] = [
            'sadness', 'anger', 'fear', 'disgust', 'confusion', 'frustration', 'boredom'
        ];
        return negativeEmotions.includes(emotion);
    },

    /**
     * Calcule l'intensité émotionnelle globale
     */
    calculateOverallEmotionalIntensity(state: EmotionalState): number {
        let totalIntensity = state.intensity;
        for (const intensity of state.secondaryEmotions.values()) {
            totalIntensity += intensity;
        }
        return Math.min(1, totalIntensity);
    },

    /**
     * Détermine si l'état émotionnel est stable
     */
    isEmotionalStateStable(state: EmotionalState): boolean {
        return state.stability > 0.7 && state.intensity < 0.8;
    },

    /**
     * Crée un profil de personnalité par défaut
     */
    createDefaultPersonalityProfile(type: CODAPersonalityType): PersonalityProfile {
        return {
            personalityType: type,
            bigFiveTraits: {
                openness: 0.5,
                conscientiousness: 0.5,
                extraversion: 0.5,
                agreeableness: 0.5,
                neuroticism: 0.3
            },
            learningPreferences: {
                preferredTeachingMethods: ['visual', 'interactive'],
                optimalPace: 0.5,
                repetitionTolerance: 0.6
            },
            culturalTraits: {
                deafCulturalSensitivity: 0.7,
                contextualAdaptation: 0.6,
                regionalNuancesUnderstanding: 0.4,
                socialCodesRespect: 0.8,
                communityIntegration: 0.5
            },
            culturalBackground: 'mixed_hearing_family',
            intrinsicMotivation: 0.7,
            resilience: 0.6
        };
    },

    /**
     * Crée un état émotionnel neutre par défaut
     */
    createNeutralEmotionalState(): EmotionalState {
        return {
            primaryEmotion: 'curiosity',
            intensity: 0.4,
            secondaryEmotions: new Map(),
            valence: 0.1,
            arousal: 0.3,
            stability: 0.8,
            timestamp: new Date()
        };
    },

    /**
     * Crée des métriques d'évolution initiales
     */
    createInitialEvolutionMetrics(): EvolutionMetrics {
        return {
            globalConfidence: 0.3,
            recentSuccessRate: 0.5,
            learningCurve: [0.3],
            adaptationCount: 0,
            behavioralConsistency: 0.7,
            timeSinceLastEvolution: 0
        };
    },

    /**
     * Crée des statistiques de mémoire par défaut
     */
    createDefaultMemoryStats(): MemoryStats {
        return {
            totalCapacity: 1000,
            usedMemory: 0,
            memoriesCount: 0,
            retrievalRate: 0.8,
            averageMemoryAge: 0,
            fragmentation: 0.1
        };
    },

    /**
     * Crée un historique de performance vide
     */
    createEmptyPerformanceHistory(): PerformanceHistory {
        return {
            recentScores: [],
            averageResponseTimes: [],
            competencyProgression: new Map(),
            frequentErrors: [],
            notableImprovements: [],
            totalSessions: 0,
            totalLearningTime: 0
        };
    },

    /**
     * Valide un état émotionnel
     */
    validateEmotionalState(state: Partial<EmotionalState>): boolean {
        return !!(
            state.primaryEmotion &&
            typeof state.intensity === 'number' &&
            state.intensity >= 0 && state.intensity <= 1 &&
            typeof state.valence === 'number' &&
            state.valence >= -1 && state.valence <= 1 &&
            typeof state.arousal === 'number' &&
            state.arousal >= 0 && state.arousal <= 1
        );
    },

    /**
     * Normalise une intensité émotionnelle
     */
    normalizeIntensity(value: number): EmotionIntensity {
        return Math.max(0, Math.min(1, value));
    },

    /**
     * Calcule la distance entre deux états émotionnels
     */
    calculateEmotionalDistance(state1: EmotionalState, state2: EmotionalState): number {
        const intensityDiff = Math.abs(state1.intensity - state2.intensity);
        const valenceDiff = Math.abs(state1.valence - state2.valence);
        const arousalDiff = Math.abs(state1.arousal - state2.arousal);

        return (intensityDiff + valenceDiff + arousalDiff) / 3;
    }
} as const;

// ===== CONSTANTES =====

/**
 * Émotions primaires disponibles
 */
export const PRIMARY_EMOTIONS: readonly PrimaryEmotion[] = [
    'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
    'trust', 'anticipation', 'confusion', 'excitement', 'curiosity',
    'frustration', 'satisfaction', 'boredom', 'engagement'
] as const;

/**
 * États de session CODA possibles
 */
export const CODA_SESSION_STATES: readonly CODASessionState[] = [
    'initializing', 'active', 'paused', 'learning',
    'evaluating', 'completed', 'error', 'terminated'
] as const;

/**
 * Configuration par défaut pour l'évolution IA
 */
export const DEFAULT_EVOLUTION_CONFIG: AIEvolutionConfig = {
    baseEvolutionRate: 0.05,
    adaptationSpeed: 0.3,
    enableAutoOptimization: true,
    evolutionThreshold: 0.1,
    analysisDepth: 10,
    evolutionSensitivity: 0.5
} as const;

/**
 * Configuration émotionnelle par défaut
 */
export const DEFAULT_EMOTIONAL_CONFIG: EmotionalConfig = {
    baseVolatility: 0.3,
    enablePatternDetection: true,
    emotionalMemory: true,
    triggerSensitivity: 0.5,
    historyDepth: 50
} as const;