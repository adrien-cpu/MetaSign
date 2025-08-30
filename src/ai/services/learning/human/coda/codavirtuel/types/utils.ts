/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types/utils.ts
 * @description Utilitaires et fonctions helper révolutionnaires pour les types CODA
 * 
 * Fonctionnalités avancées :
 * - 🎭 Analyse et manipulation des émotions IA
 * - 🧠 Création de profils de personnalité adaptatifs
 * - 📊 Validation et normalisation des données
 * - 🎯 États émotionnels et métriques par défaut
 * - 🔄 Calculs de distances émotionnelles
 * - ✅ Fonctions de validation de types
 * - 🏗️ Factory methods pour structures complexes
 * 
 * @module CODAUtils
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Utilities Division
 */

import { 
    PrimaryEmotion, 
    EmotionIntensity, 
    CECRLLevel, 
    CulturalEnvironment, 
    AIMood, 
    AIStudentPersonalityType,
    CODAPersonalityType,
    CECRL_LEVELS,
    CULTURAL_ENVIRONMENTS,
    AI_MOODS
} from './base';
import { EmotionalState, PersonalityProfile } from './personality';
import { LearningPrediction, LevelEvaluation } from './learning';
import { EvolutionMetrics, MemoryStats, PerformanceHistory } from './metrics';

/**
 * Collection complète d'utilitaires pour manipuler les types CODA
 * 
 * @namespace CODATypeUtils
 * @description Fournit un ensemble riche de fonctions utilitaires pour :
 * - Analyse et classification des émotions
 * - Création d'états et profils par défaut
 * - Validation et normalisation des données
 * - Calculs de distances et métriques
 * 
 * @example
 * ```typescript
 * // Vérifier si une émotion est positive
 * const isPositive = CODATypeUtils.isPositiveEmotion('joy'); // true
 * 
 * // Créer un état émotionnel neutre
 * const neutralState = CODATypeUtils.createNeutralEmotionalState();
 * 
 * // Calculer la distance entre deux états
 * const distance = CODATypeUtils.calculateEmotionalDistance(state1, state2);
 * ```
 */
export const CODATypeUtils = {
    /**
     * Vérifie si une émotion primaire est considérée comme positive
     * 
     * @method isPositiveEmotion
     * @param {PrimaryEmotion} emotion - L'émotion à analyser
     * @returns {boolean} True si l'émotion est positive
     * 
     * @example
     * ```typescript
     * CODATypeUtils.isPositiveEmotion('joy');        // true
     * CODATypeUtils.isPositiveEmotion('sadness');    // false
     * ```
     */
    isPositiveEmotion(emotion: PrimaryEmotion): boolean {
        const positiveEmotions: readonly PrimaryEmotion[] = [
            'joy', 'trust', 'anticipation', 'excitement', 'curiosity', 'satisfaction', 'engagement'
        ];
        return positiveEmotions.includes(emotion);
    },

    /**
     * Vérifie si une émotion primaire est considérée comme négative
     * 
     * @method isNegativeEmotion
     * @param {PrimaryEmotion} emotion - L'émotion à analyser
     * @returns {boolean} True si l'émotion est négative
     * 
     * @example
     * ```typescript
     * CODATypeUtils.isNegativeEmotion('anger');      // true
     * CODATypeUtils.isNegativeEmotion('joy');        // false
     * ```
     */
    isNegativeEmotion(emotion: PrimaryEmotion): boolean {
        const negativeEmotions: readonly PrimaryEmotion[] = [
            'sadness', 'anger', 'fear', 'disgust', 'confusion', 'frustration', 'boredom'
        ];
        return negativeEmotions.includes(emotion);
    },

    /**
     * Calcule l'intensité émotionnelle globale d'un état
     * 
     * @method calculateOverallEmotionalIntensity
     * @param {EmotionalState} state - L'état émotionnel à analyser
     * @returns {number} Intensité globale (0-1), plafonnée à 1
     * 
     * @description Combine l'intensité primaire avec les émotions secondaires
     * pour obtenir une mesure globale d'activation émotionnelle
     */
    calculateOverallEmotionalIntensity(state: EmotionalState): number {
        let totalIntensity = state.intensity;
        for (const intensity of state.secondaryEmotions.values()) {
            totalIntensity += intensity;
        }
        return Math.min(1, totalIntensity);
    },

    /**
     * Détermine si un état émotionnel est considéré comme stable
     * 
     * @method isEmotionalStateStable
     * @param {EmotionalState} state - L'état émotionnel à évaluer
     * @returns {boolean} True si l'état est stable (stabilité > 0.7 et intensité < 0.8)
     */
    isEmotionalStateStable(state: EmotionalState): boolean {
        return state.stability > 0.7 && state.intensity < 0.8;
    },

    /**
     * Crée un profil de personnalité par défaut équilibré
     * 
     * @method createDefaultPersonalityProfile
     * @param {CODAPersonalityType} type - Type de personnalité CODA
     * @returns {PersonalityProfile} Profil complet avec traits Big Five et préférences
     * 
     * @description Génère un profil équilibré avec des valeurs modérées
     * adaptées à l'apprentissage LSF
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
     * Crée un état émotionnel neutre et stable par défaut
     * 
     * @method createNeutralEmotionalState
     * @returns {EmotionalState} État neutre avec curiosité comme émotion primaire
     * 
     * @description Idéal pour initialiser les IA-élèves dans un état réceptif
     * à l'apprentissage
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

    /** Crée des métriques d'évolution initiales */
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

    /** Crée des statistiques de mémoire par défaut */
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

    /** Crée un historique de performance vide */
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
     * Valide la structure et les valeurs d'un état émotionnel
     * 
     * @method validateEmotionalState
     * @param {Partial<EmotionalState>} state - État à valider (peut être partiel)
     * @returns {boolean} True si l'état est valide
     * 
     * @description Vérifie la présence des champs obligatoires
     * et la validité des plages de valeurs
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
     * Normalise une valeur d'intensité dans la plage valide [0, 1]
     * 
     * @method normalizeIntensity
     * @param {number} value - Valeur à normaliser
     * @returns {EmotionIntensity} Intensité normalisée (0-1)
     */
    normalizeIntensity(value: number): EmotionIntensity {
        return Math.max(0, Math.min(1, value));
    },

    /**
     * Calcule la distance euclidienne entre deux états émotionnels
     * 
     * @method calculateEmotionalDistance
     * @param {EmotionalState} state1 - Premier état émotionnel
     * @param {EmotionalState} state2 - Second état émotionnel
     * @returns {number} Distance normalisée (0-1) entre les deux états
     * 
     * @description Utile pour mesurer la transition émotionnelle
     * ou la similarité entre états
     */
    calculateEmotionalDistance(state1: EmotionalState, state2: EmotionalState): number {
        const intensityDiff = Math.abs(state1.intensity - state2.intensity);
        const valenceDiff = Math.abs(state1.valence - state2.valence);
        const arousalDiff = Math.abs(state1.arousal - state2.arousal);

        return (intensityDiff + valenceDiff + arousalDiff) / 3;
    }
} as const;

/**
 * Fonctions de validation de types pour les énumérations CODA
 * 
 * @description Ensemble de type guards pour valider les types à l'exécution
 * et assurer la sécurité des types dans les opérations CODA
 */
/**
 * Vérifie si une valeur est un niveau CECRL valide
 * 
 * @function isCECRLLevel
 * @param {unknown} value - Valeur à tester
 * @returns {value is CECRLLevel} Type guard pour CECRLLevel
 * 
 * @example
 * ```typescript
 * if (isCECRLLevel(userInput)) {
 *   // userInput est maintenant typé comme CECRLLevel
 *   console.log(`4;Niveau valide: ${userInput}`4;);
 * }
 * ```
 */
export function isCECRLLevel(value: unknown): value is CECRLLevel {
    return typeof value === 'string' && CECRL_LEVELS.includes(value as CECRLLevel);
}

export function isCulturalEnvironment(value: unknown): value is CulturalEnvironment {
    return typeof value === 'string' && CULTURAL_ENVIRONMENTS.includes(value as CulturalEnvironment);
}

export function isAIMood(value: unknown): value is AIMood {
    return typeof value === 'string' && AI_MOODS.includes(value as AIMood);
}

export function isAIStudentPersonalityType(value: unknown): value is AIStudentPersonalityType {
    const validTypes: readonly string[] = [
        'curious_student', 'shy_learner', 'energetic_pupil',
        'patient_apprentice', 'analytical_learner', 'creative_thinker'
    ];
    return typeof value === 'string' && validTypes.includes(value);
}

/**
 * Fonctions factory pour créer des structures CODA par défaut
 * 
 * @description Génère des objets pré-configurés avec des valeurs
 * par défaut appropriées pour l'apprentissage LSF
 */
/**
 * Crée une prédiction d'apprentissage avec des valeurs par défaut réalistes
 * 
 * @function createDefaultLearningPrediction
 * @param {string} area - Domaine d'apprentissage ciblé
 * @returns {LearningPrediction} Prédiction pré-configurée
 * 
 * @example
 * ```typescript
 * const prediction = createDefaultLearningPrediction('dactylologie');
 * // Retourne une prédiction avec difficulté 'medium', temps estimé 30min
 * ```
 */
export function createDefaultLearningPrediction(area: string): LearningPrediction {
    return {
        area,
        difficulty: 'medium',
        timeEstimate: 30,
        confidence: 0.5,
        recommendations: [`Pratiquer régulièrement ${area}`],
        potentialObstacles: ['Manque de temps', 'Difficulté de concentration'],
        adaptationStrategies: ['Apprentissage progressif', 'Révisions espacées']
    };
}

/**
 * Crée une évaluation de niveau par défaut
 * 
 * @function createDefaultLevelEvaluation
 * @param {CECRLLevel} [level='A1'] - Niveau CECRL de base
 * @returns {LevelEvaluation} Évaluation pré-configurée
 * 
 * @description Utile pour initialiser les évaluations avant
 * d'avoir des données réelles d'apprentissage
 */
export function createDefaultLevelEvaluation(level: CECRLLevel = 'A1'): LevelEvaluation {
    return {
        currentLevel: level,
        recommendedLevel: level,
        levelChangeRecommended: false,
        progressInCurrentLevel: 0,
        scores: {},
        explanation: 'Évaluation par défaut - données insuffisantes',
        strengthAreas: [],
        weaknessAreas: []
    };
}