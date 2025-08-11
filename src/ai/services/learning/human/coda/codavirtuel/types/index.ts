/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types/index.ts
 * @description Types centralisés pour le système CODA Virtuel - Version Consolidée Complète
 * 
 * Fonctionnalités :
 * - 🎯 Types harmonisés pour tout le système CODA
 * - 🔧 Compatible exactOptionalPropertyTypes: true
 * - 📊 Interfaces pour apprentissage inversé
 * - 🌟 Types pour IA-élèves et mentors
 * - ✅ Tous les types dans un seul fichier (pas de dépendance externe)
 * - 🔄 Solution définitive sans circularité
 * 
 * @module types
 * @version 1.4.0 - Types révolutionnaires CODA consolidés
 * @since 2025
 * @author MetaSign Team - CODA Types
 * @lastModified 2025-07-21
 */

// ===== TYPES DE BASE =====

/**
 * Niveaux CECRL
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Humeurs de l'IA-élève
 */
export type AIMood = 'happy' | 'confused' | 'frustrated' | 'excited' | 'neutral' | 'curious';

/**
 * Types de personnalité de l'IA-élève
 */
export type AIStudentPersonalityType =
    | 'curious_student'
    | 'shy_learner'
    | 'energetic_pupil'
    | 'patient_apprentice'
    | 'analytical_learner'
    | 'creative_thinker';

/**
 * Types de personnalité CODA (legacy)
 */
export type CODAPersonalityType =
    | 'curious_student'
    | 'shy_learner'
    | 'energetic_pupil'
    | 'patient_apprentice'
    | 'encouraging_mentor'
    | 'strict_teacher'
    | 'patient_guide';

/**
 * Environnements culturels (étendus pour compatibilité avec AISimulatorExample)
 */
export type CulturalEnvironment =
    | 'deaf_family_home'
    | 'mixed_hearing_family'
    | 'school_environment'
    | 'community_center'
    | 'online_learning'
    | 'deaf_school'              // ← Ajouté pour AISimulatorExample
    | 'deaf_community_center'    // ← Ajouté pour AISimulatorExample
    | 'deaf_workplace';          // ← Ajouté pour AISimulatorExample

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

// ===== INTERFACES SYSTÈME DE BASE =====

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

// ===== TYPES MANQUANTS POUR CECRL EVALUATOR =====

/**
 * Prédiction d'apprentissage pour une compétence ou domaine spécifique
 * Interface manquante nécessaire pour CECRLLevelEvaluator
 */
export interface LearningPrediction {
    /** Domaine d'apprentissage concerné */
    readonly area: string;
    /** Niveau de difficulté prévu */
    readonly difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    /** Temps estimé en minutes */
    readonly timeEstimate: number;
    /** Niveau de confiance dans la prédiction (0-1) */
    readonly confidence: number;
    /** Recommandations spécifiques */
    readonly recommendations: readonly string[];
    /** Obstacles potentiels identifiés */
    readonly potentialObstacles?: readonly string[];
    /** Stratégies d'adaptation suggérées */
    readonly adaptationStrategies?: readonly string[];
}

// ===== INTERFACES ÉTENDUES POUR COMPATIBILITÉ =====

/**
 * Préférences d'apprentissage étendues pour IA
 */
export interface ExtendedLearningPreferences extends LearningPreferences {
    /** Affinité pour l'apprentissage visuel (0-1) - maintenant requis */
    readonly visualLearningAffinity: number;
    /** Préférence pour l'apprentissage social (0-1) - maintenant requis */
    readonly socialLearningPreference: number;
}

/**
 * Profil de personnalité IA étendu avec traits LSF
 * Extension nécessaire pour AISimulatorExample
 */
export interface AIPersonalityProfile extends PersonalityProfile {
    /** Traits spécifiques à la LSF */
    readonly lsfTraits?: {
        readonly spatialExpression: number;
        readonly facialExpression: number;
        readonly manualPrecision: number;
        readonly culturalAwareness: number;
        readonly gestualFluency: number;
        readonly contextualAdaptation: number;
    };
    /** Préférences d'apprentissage étendues (maintenant requis, compatible avec PersonalityProfile) */
    readonly learningPreferences: ExtendedLearningPreferences;
}

/**
 * Métriques d'évolution étendues avec propriétés optionnelles
 * Extension nécessaire pour AISimulatorExample
 */
export interface ExtendedEvolutionMetrics extends EvolutionMetrics {
    /** Vitesse d'apprentissage */
    readonly learningSpeed?: number;
    /** Capacité d'adaptation */
    readonly adaptability?: number;
    /** Progression émotionnelle */
    readonly emotionalProgress?: number;
    /** Stabilité comportementale */
    readonly behavioralStability?: number;
}

// ===== INTERFACES CORE SYSTÈME =====

/**
 * Configuration du simulateur IA-élève
 */
export interface AIStudentSimulatorConfig {
    readonly emotionalConfig: {
        readonly enablePatternDetection: boolean;
        readonly baseVolatility?: number;
        readonly emotionalMemory?: boolean;
    };
    readonly evolutionConfig: {
        readonly enableAutoOptimization: boolean;
        readonly baseEvolutionRate?: number;
        readonly adaptationSpeed?: number;
        // Note: learningRate supprimé car non supporté
    };
    readonly personalityConfig?: {
        readonly traits?: Readonly<Record<string, number>>;
        readonly culturalContext?: CulturalEnvironment;
    };
}

/**
 * Statut complet de l'IA-élève (interface corrigée avec extensions)
 */
export interface ComprehensiveAIStatus {
    readonly id: string;
    readonly name: string;
    readonly personality: AIStudentPersonalityType;
    readonly currentLevel: CECRLLevel;
    readonly mood: AIMood;
    readonly culturalContext: CulturalEnvironment;
    readonly personalityProfile: AIPersonalityProfile;  // ← Utilisez AIPersonalityProfile au lieu de PersonalityProfile
    readonly emotionalState: EmotionalState;
    readonly evolutionMetrics: ExtendedEvolutionMetrics;  // ← Utilisez ExtendedEvolutionMetrics
    readonly memoryStats: MemoryStats;
    readonly performanceHistory: PerformanceHistory;
    readonly weaknesses: readonly string[];
    readonly strengths: readonly string[];
    readonly lastLearned?: string;
    readonly progress: number;
    readonly motivation: number;
    readonly totalLearningTime: number;
    readonly comprehensionRate: number;
    readonly attentionSpan: number;
}

/**
 * Réaction complète de l'IA-élève
 */
export interface ComprehensiveAIReaction {
    readonly basicReaction: {
        readonly comprehension: number;
        readonly textualReaction: string;
        readonly needsHelp: boolean;
        readonly confidence: number;
        readonly timestamp: Date;
    };
    readonly emotionalState: EmotionalState;
    readonly recalledMemories: readonly unknown[];
    readonly evolutionMetrics: ExtendedEvolutionMetrics;  // ← Utilisez ExtendedEvolutionMetrics
    readonly question?: string;
    readonly error?: string;
    readonly improvementSuggestions: readonly string[];
    readonly metadata: {
        readonly primarySystem: string;
        readonly influencingFactors: readonly string[];
        readonly certaintyLevel: number;
        readonly processingTime: number;
        readonly systemVersions: Readonly<Record<string, string>>;
    };
}

// ===== TYPES SPÉCIFIQUES AU SYSTÈME CODA =====

/**
 * Options d'apprentissage inversé
 */
export interface ReverseApprenticeshipOptions {
    readonly adaptiveDifficulty?: boolean;
    readonly errorSimulationRate?: number;
    readonly focusOnWeaknesses?: boolean;
    readonly enforceProgressCurve?: boolean;
    readonly codaMode?: boolean;
    readonly aiPersonality?: CODAPersonalityType;
    readonly realTimeEvaluation?: boolean;
    readonly autoGenerateSupports?: boolean;
    readonly aiIntelligenceLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
    readonly personalityType?: CODAPersonalityType;
    readonly culturalAuthenticity?: boolean;
    readonly predictiveLearning?: boolean;
    readonly mentorshipMode?: boolean;
    readonly emotionalIntelligenceLevel?: number;
    readonly adaptationFrequency?: number;
    readonly defaultCulturalEnvironment?: CulturalEnvironment;
    readonly initialLevel?: string;
    readonly enableRealTimeAnalytics?: boolean;
    readonly maxConcurrentSessions?: number;
}

/**
 * Profil utilisateur pour apprentissage inversé
 */
export interface UserReverseProfile {
    readonly userId: string;
    readonly currentLevel: CECRLLevel;
    readonly strengths: readonly string[];
    readonly weaknesses: readonly string[];
    readonly learningPreferences: readonly string[];
    readonly progressHistory: readonly {
        readonly date: Date;
        readonly level: CECRLLevel;
        readonly score: number;
    }[];
    readonly culturalBackground: CulturalEnvironment;
    readonly motivationFactors: readonly string[];
    readonly learningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'mixed';
    readonly sessionCount: number;
    readonly totalLearningTime: number;
    readonly lastActivity: Date;
}

/**
 * Exercice adapté pour utilisateur
 */
export interface UserAdaptedExercise {
    readonly id: string;
    readonly type: string;
    readonly content: Readonly<Record<string, unknown>>;
    readonly generationParams: {
        readonly type: string;
        readonly level: string;
        readonly difficulty: number;
        readonly focusAreas: readonly string[];
        readonly userId: string;
    };
    readonly errorsSimulated: boolean;
    readonly targetedSkills: readonly string[];
}

/**
 * Évaluation de niveau (interface originale maintenue)
 */
export interface LevelEvaluation {
    readonly currentLevel: CECRLLevel;
    readonly recommendedLevel: CECRLLevel;  // ← Changé de nextLevel à recommendedLevel pour compatibilité
    readonly levelChangeRecommended: boolean;  // ← Ajouté pour compatibilité CECRLLevelEvaluator
    readonly progressInCurrentLevel: number;  // ← Changé de progressToNext pour compatibilité
    readonly scores: Readonly<Record<string, number>>;  // ← Ajouté pour compatibilité
    readonly explanation: string;  // ← Ajouté pour compatibilité
    readonly strengthAreas: readonly string[];  // ← Changé de strengths pour compatibilité
    readonly weaknessAreas: readonly string[];  // ← Changé de areasForImprovement pour compatibilité
    readonly recommendations?: readonly string[];  // ← Rendu optionnel
    readonly estimatedTimeToNext?: number;  // ← Rendu optionnel
    readonly confidence?: number;  // ← Rendu optionnel
}

/**
 * Session d'enseignement
 */
export interface TeachingSession {
    readonly sessionId: string;
    readonly mentorId: string;
    readonly aiStudentId: string;
    readonly startTime: Date;
    readonly endTime?: Date;
    readonly content: {
        readonly topic: string;
        readonly targetLevel: CECRLLevel;
        readonly teachingMethod?: string;
        readonly duration: number;
        readonly materials: readonly string[];
        readonly exercises: readonly string[];
        readonly visualAids?: readonly string[];
    };
    readonly aiReactions: {
        readonly comprehension: number;
        readonly textualReactions: readonly string[];
        readonly questions: readonly string[];
        readonly errors: readonly string[];
        readonly emotion: AIMood;
        readonly engagementEvolution: readonly number[];
        readonly strugglingMoments: readonly Date[];
    };
    readonly metrics: {
        readonly actualDuration: number;
        readonly participationRate: number;
        readonly teacherInterventions: number;
        readonly successScore: number;
        readonly conceptsMastered: readonly string[];
        readonly conceptsToReview: readonly string[];
        readonly teachingEffectiveness: number;
    };
    readonly status: 'active' | 'completed' | 'paused' | 'cancelled';
    readonly teacherNotes?: string;
    readonly objectives: readonly string[];
}

/**
 * Compétences de mentor
 */
export interface MentorCompetencies {
    readonly explanation: number;
    readonly patience: number;
    readonly adaptation: number;
    readonly encouragement: number;
    readonly culturalSensitivity: number;
}

/**
 * Évaluation de mentor
 */
export interface MentorEvaluation {
    readonly overallScore: number;
    readonly competencies: MentorCompetencies;
    readonly improvementTips: readonly string[];
    readonly strengthAreas: readonly string[];
    readonly practiceExercises: readonly string[];
    readonly sessionAnalysis: {
        readonly totalSessions: number;
        readonly averageSessionDuration: number;
        readonly studentProgressRate: number;
        readonly teachingConsistency: number;
    };
    readonly personalityMatch: number;
    readonly culturalAdaptation: number;
}

/**
 * Support pédagogique
 */
export interface TeachingSupport {
    readonly id: string;
    readonly type: 'visual_aid' | 'practice_exercise' | 'explanation_guide' | 'cultural_context';
    readonly title: string;
    readonly description: string;
    readonly content: Readonly<Record<string, unknown>>;
    readonly targetSkill: string;
    readonly difficulty: number;
    readonly estimatedDuration: number;
    readonly culturallyAdapted: boolean;
}

/**
 * Prédictions de progression
 */
export interface ProgressPredictions {
    readonly nextMilestone: {
        readonly skill: string;
        readonly estimatedDate: Date;
        readonly confidence: number;
    };
    readonly levelProgression: {
        readonly currentLevel: CECRLLevel;
        readonly nextLevel: CECRLLevel;
        readonly estimatedTimeToNext: number;
        readonly requiredSessions: number;
    };
    readonly riskFactors: readonly {
        readonly factor: string;
        readonly severity: 'low' | 'medium' | 'high';
        readonly mitigation: string;
    }[];
    readonly opportunities: readonly {
        readonly area: string;
        readonly potential: number;
        readonly recommendation: string;
    }[];
}

/**
 * Analyse culturelle
 */
export interface CulturalAnalysis {
    readonly culturalAlignment: number;
    readonly adaptationSuggestions: readonly string[];
    readonly culturalStrengths: readonly string[];
    readonly culturalChallenges: readonly string[];
    readonly communityRecommendations: readonly {
        readonly type: 'deaf_community' | 'mixed_community' | 'online_community';
        readonly description: string;
        readonly benefits: readonly string[];
    }[];
}

/**
 * Évaluation complète de l'expérience CODA
 */
export interface CODAExperienceEvaluation {
    readonly mentorEvaluation: MentorEvaluation;
    readonly teachingSupports: ReadonlySet<TeachingSupport>;
    readonly progressPredictions: ProgressPredictions;
    readonly culturalAnalysis: CulturalAnalysis;
    readonly systemMetrics: {
        readonly totalEngagementTime: number;
        readonly averageSessionQuality: number;
        readonly aiStudentSatisfaction: number;
        readonly learningEfficiency: number;
    };
    readonly recommendations: {
        readonly immediate: readonly string[];
        readonly shortTerm: readonly string[];
        readonly longTerm: readonly string[];
    };
}

/**
 * Configuration de session CODA
 */
export interface CODASessionConfig {
    readonly aiPersonality: CODAPersonalityType;
    readonly culturalEnvironment: CulturalEnvironment;
    readonly customAIName?: string;
    readonly difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
    readonly focusAreas?: readonly string[];
    readonly sessionDuration?: number;
    readonly enableEmotionalFeedback?: boolean;
    readonly adaptiveResponse?: boolean;
}

/**
 * Statistiques globales du système CODA
 */
export interface CODAGlobalStatistics {
    readonly totalSessions: number;
    readonly activeMentors: number;
    readonly totalAIStudents: number;
    readonly averageMentorScore: number;
    readonly totalTeachingSessions: number;
    readonly activeSessions: number;
    readonly emotionalDistribution: Readonly<Record<string, number>>;
    readonly popularConcepts: readonly string[];
    readonly systemHealth: {
        readonly uptime: number;
        readonly responseTime: number;
        readonly errorRate: number;
    };
}

/**
 * Options de gestion de session CODA
 */
export interface CODASessionManagerOptions {
    readonly maxSessionsPerMentor?: number;
    readonly enableRealTimeAnalytics?: boolean;
    readonly emotionalUpdateFrequencyMs?: number;
    readonly autoCleanupExpiredSessions?: boolean;
    readonly sessionTimeoutMs?: number;
}

/**
 * Paramètres de génération d'exercice
 */
export interface ExerciseGenerationParams {
    readonly type: string;
    readonly level: string;
    readonly difficulty: number;
    readonly focusAreas?: readonly string[];
    readonly userId?: string;
    readonly culturalContext?: CulturalEnvironment;
    readonly aiPersonality?: CODAPersonalityType;
    readonly teachingMethod?: string;
}

/**
 * Résultat d'évaluation d'exercice
 */
export interface EvaluationResult {
    readonly exerciseId: string;
    readonly userId: string;
    readonly score: number;
    readonly percentage: number;
    readonly isCorrect: boolean;
    readonly feedback: string;
    readonly suggestions: readonly string[];
    readonly completionTime?: number;
    readonly timestamp: Date;
}

// ===== CONSTANTES UTILES =====

/**
 * Niveaux CECRL ordonnés
 */
export const CECRL_LEVELS: readonly CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

/**
 * Types de personnalité CODA disponibles
 */
export const CODA_PERSONALITY_TYPES: readonly CODAPersonalityType[] = [
    'curious_student', 'shy_learner', 'energetic_pupil', 'patient_apprentice',
    'encouraging_mentor', 'strict_teacher', 'patient_guide'
] as const;

/**
 * Environnements culturels supportés (étendus)
 */
export const CULTURAL_ENVIRONMENTS: readonly CulturalEnvironment[] = [
    'deaf_family_home', 'mixed_hearing_family', 'school_environment',
    'community_center', 'online_learning', 'deaf_school',
    'deaf_community_center', 'deaf_workplace'
] as const;

/**
 * Humeurs AI possibles
 */
export const AI_MOODS: readonly AIMood[] = [
    'happy', 'confused', 'frustrated', 'excited', 'neutral', 'curious'
] as const;

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

// ===== UTILITAIRES DE TYPE ET VALIDATION =====

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

/**
 * Vérifie si une valeur est un niveau CECRL valide
 */
export function isCECRLLevel(value: unknown): value is CECRLLevel {
    return typeof value === 'string' && CECRL_LEVELS.includes(value as CECRLLevel);
}

/**
 * Vérifie si une valeur est un environnement culturel valide
 */
export function isCulturalEnvironment(value: unknown): value is CulturalEnvironment {
    return typeof value === 'string' && CULTURAL_ENVIRONMENTS.includes(value as CulturalEnvironment);
}

/**
 * Vérifie si une valeur est une humeur d'IA valide
 */
export function isAIMood(value: unknown): value is AIMood {
    return typeof value === 'string' && AI_MOODS.includes(value as AIMood);
}

/**
 * Vérifie si une valeur est un type de personnalité IA valide
 */
export function isAIStudentPersonalityType(value: unknown): value is AIStudentPersonalityType {
    const validTypes: readonly string[] = [
        'curious_student', 'shy_learner', 'energetic_pupil',
        'patient_apprentice', 'analytical_learner', 'creative_thinker'
    ];
    return typeof value === 'string' && validTypes.includes(value);
}

/**
 * Crée une prédiction d'apprentissage par défaut
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

/**
 * Crée un profil de personnalité AI par défaut avec traits LSF
 */
export function createDefaultAIPersonalityProfile(type: CODAPersonalityType): AIPersonalityProfile {
    // Utilise CODATypeUtils pour créer la base
    const baseProfile = CODATypeUtils.createDefaultPersonalityProfile(type);

    return {
        ...baseProfile,
        learningPreferences: {
            ...baseProfile.learningPreferences,
            // Ajoute les propriétés étendues requises
            visualLearningAffinity: 0.7,
            socialLearningPreference: 0.6
        },
        lsfTraits: {
            spatialExpression: 0.6,
            facialExpression: 0.5,
            manualPrecision: 0.7,
            culturalAwareness: 0.6,
            gestualFluency: 0.5,
            contextualAdaptation: 0.6
        }
    };
}