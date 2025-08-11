/**
 * Types et interfaces pour l'évaluateur CODA révolutionnaire - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/types/CODAEvaluatorTypes.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/types
 * @description Définit tous les types et interfaces pour le système d'évaluation CODA
 * Compatible avec exactOptionalPropertyTypes: true et sans imports inutilisés
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-01-20
 */

/**
 * Types de personnalité CODA
 */
export type CODAPersonalityType =
    | 'encouraging_mentor'
    | 'challenging_coach'
    | 'patient_guide'
    | 'playful_companion'
    | 'wise_elder'
    | 'peer_supporter';

/**
 * Niveau d'intelligence de l'IA
 */
export type AIIntelligenceLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

/**
 * Interface pour le contexte culturel
 */
export interface CulturalContext {
    readonly region: string;
    readonly culturalNuances: readonly string[];
    readonly historicalReferences: readonly string[];
    readonly authenticityLevel: number;
}

/**
 * Interface pour le contexte émotionnel
 */
export interface EmotionalContext {
    readonly detectedEmotion: 'frustrated' | 'confused' | 'motivated' | 'confident' | 'neutral';
    readonly intensity: number;
    readonly contributingFactors: readonly string[];
    readonly adaptationRecommendations: readonly string[];
}

/**
 * Interface pour les besoins utilisateur
 */
export interface UserNeeds {
    readonly learningGoals: readonly string[];
    readonly preferredPace: 'slow' | 'moderate' | 'fast';
    readonly supportLevel: 'minimal' | 'moderate' | 'high';
    readonly culturalSensitivity: number;
}

/**
 * Interface pour une prédiction d'apprentissage
 */
export interface LearningPrediction {
    readonly area: string;
    readonly difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    readonly timeEstimate: number;
    readonly confidence: number;
    readonly recommendations: readonly string[];
    readonly potentialObstacles: readonly string[];
    readonly adaptationStrategies: readonly string[];
    readonly successProbability?: number;
    readonly optimalConditions?: readonly string[];
}

/**
 * Interface pour les sessions d'enseignement évaluées
 */
export interface TeachingSession {
    readonly sessionId: string;
    readonly mentorId: string;
    readonly content: {
        readonly topic: string;
        readonly concepts: readonly string[];
        readonly teachingMethod: string;
        readonly duration: number;
    };
    readonly aiReactions: {
        readonly comprehension: number;
        readonly questions: readonly string[];
        readonly errors: readonly string[];
        readonly correctionsAccepted: number;
        readonly frustrationSigns: number;
    };
    readonly results: {
        readonly objectivesAchieved: number;
        readonly newSkillsAcquired: readonly string[];
        readonly improvement: number;
        readonly aiSatisfaction: number;
    };
    readonly timestamp: Date;
}

/**
 * Interface pour le statut de l'IA-élève Tamagotchi
 */
export interface AIStudentStatus {
    readonly name: string;
    readonly currentLevel: string;
    readonly mood: 'happy' | 'confused' | 'frustrated' | 'excited' | 'neutral';
    readonly progress: number;
    readonly weaknesses: readonly string[];
    readonly strengths?: readonly string[];
    readonly lastLearned?: string;
    readonly needsHelp?: string;
    readonly motivation: number;
    readonly totalLearningTime: number;
}

/**
 * Interface pour l'évaluation du mentor
 */
export interface MentorEvaluation {
    readonly overallScore: number;
    readonly teachingLevel: 'novice' | 'developing' | 'proficient' | 'expert';
    readonly competencies: {
        readonly explanation: number;
        readonly patience: number;
        readonly adaptation: number;
        readonly encouragement: number;
        readonly culturalSensitivity: number;
    };
    readonly strengths: readonly string[];
    readonly improvements: readonly string[];
    readonly recommendations: readonly string[];
}

/**
 * Interface pour les supports pédagogiques générés
 */
export interface TeachingSupport {
    readonly id: string;
    readonly type: 'visual_aid' | 'exercise_template' | 'explanation_guide' | 'cultural_context';
    readonly title: string;
    readonly description: string;
    readonly content: unknown;
    readonly targetWeakness: string;
    readonly estimatedEffectiveness: number;
}

/**
 * Interface pour l'évaluation complète de l'expérience CODA
 */
export interface CODAExperienceEvaluation {
    readonly mentorEvaluation: MentorEvaluation;
    readonly aiStudent: AIStudentStatus;
    readonly teachingSupports: readonly TeachingSupport[];
    readonly predictions: readonly LearningPrediction[];
    readonly confidence: number;
    readonly culturalContext: CulturalContext;
    readonly emotionalContext: EmotionalContext;
    readonly userNeeds: UserNeeds;
}

/**
 * Configuration de l'évaluateur CODA
 */
export interface CODAEvaluatorConfig {
    readonly aiIntelligenceLevel?: AIIntelligenceLevel;
    readonly culturalAuthenticity?: boolean;
    readonly emotionalSensitivity?: number;
}

/**
 * Configuration de l'intelligence émotionnelle
 */
export interface EmotionalConfig {
    readonly frustrationThreshold: number;
    readonly motivationBoost: number;
    readonly culturalSensitivityWeight: number;
    readonly empathyWeight: number;
}

/**
 * Résultat d'analyse des compétences
 */
export interface SkillAnalysisResult {
    readonly strengths: readonly string[];
    readonly weaknesses: readonly string[];
}

/**
 * Résultat d'identification des forces et améliorations
 */
export interface StrengthsImprovementsResult {
    readonly strengths: readonly string[];
    readonly improvements: readonly string[];
}

/**
 * Statistiques de performance d'une zone d'apprentissage
 */
export interface AreaPerformanceStats {
    readonly area: string;
    readonly sessions: readonly TeachingSession[];
    readonly averagePerformance: number;
    readonly improvementTrend: number;
}

/**
 * Interface pour les traits de personnalité CODA
 */
export interface CODAPersonalityTraits {
    readonly empathy: number;
    readonly patience: number;
    readonly challenge: number;
    readonly humor: number;
    readonly culturalDepth: number;
}

/**
 * Interface pour le style de communication CODA
 */
export interface CODACommunicationStyle {
    readonly directness: number;
    readonly encouragement: number;
    readonly culturalReferences: number;
    readonly signLanguageComplexity: number;
}

/**
 * Interface pour une personnalité CODA complète
 */
export interface CODAPersonality {
    readonly type: CODAPersonalityType;
    readonly traits: CODAPersonalityTraits;
    readonly communicationStyle: CODACommunicationStyle;
}

/**
 * Constantes pour l'évaluateur CODA
 */
export const CODA_EVALUATOR_CONSTANTS = {
    /** Noms prédéfinis pour les IA-élèves Tamagotchi */
    AI_STUDENT_NAMES: [
        'Luna', 'Alex', 'Maya', 'Sam', 'Rio', 'Kai', 'Nova', 'Zoe',
        'Finn', 'Sage', 'Robin', 'Casey', 'Taylor', 'Jordan', 'Avery'
    ] as const,

    /** Seuils pour les niveaux d'enseignement */
    TEACHING_LEVEL_THRESHOLDS: {
        expert: 0.85,
        proficient: 0.7,
        developing: 0.5
    } as const,

    /** Seuils CECRL pour l'IA-élève */
    CECRL_THRESHOLDS: {
        A2: { comprehension: 0.6, sessions: 5, time: 60 },
        B1: { comprehension: 0.75, sessions: 10, time: 150 },
        B2: { comprehension: 0.9, sessions: 20, time: 300 }
    } as const,

    /** Personnalités CODA prédéfinies */
    DEFAULT_PERSONALITIES: {
        encouraging_mentor: {
            type: 'encouraging_mentor' as CODAPersonalityType,
            traits: {
                empathy: 0.9,
                patience: 0.8,
                challenge: 0.4,
                humor: 0.6,
                culturalDepth: 0.7
            },
            communicationStyle: {
                directness: 0.6,
                encouragement: 0.95,
                culturalReferences: 0.7,
                signLanguageComplexity: 0.6
            }
        },
        challenging_coach: {
            type: 'challenging_coach' as CODAPersonalityType,
            traits: {
                empathy: 0.6,
                patience: 0.5,
                challenge: 0.9,
                humor: 0.4,
                culturalDepth: 0.8
            },
            communicationStyle: {
                directness: 0.9,
                encouragement: 0.5,
                culturalReferences: 0.8,
                signLanguageComplexity: 0.8
            }
        },
        patient_guide: {
            type: 'patient_guide' as CODAPersonalityType,
            traits: {
                empathy: 0.95,
                patience: 0.95,
                challenge: 0.2,
                humor: 0.5,
                culturalDepth: 0.6
            },
            communicationStyle: {
                directness: 0.4,
                encouragement: 0.8,
                culturalReferences: 0.5,
                signLanguageComplexity: 0.4
            }
        },
        playful_companion: {
            type: 'playful_companion' as CODAPersonalityType,
            traits: {
                empathy: 0.8,
                patience: 0.7,
                challenge: 0.3,
                humor: 0.95,
                culturalDepth: 0.5
            },
            communicationStyle: {
                directness: 0.5,
                encouragement: 0.9,
                culturalReferences: 0.6,
                signLanguageComplexity: 0.5
            }
        },
        wise_elder: {
            type: 'wise_elder' as CODAPersonalityType,
            traits: {
                empathy: 0.85,
                patience: 0.9,
                challenge: 0.6,
                humor: 0.7,
                culturalDepth: 0.95
            },
            communicationStyle: {
                directness: 0.7,
                encouragement: 0.7,
                culturalReferences: 0.95,
                signLanguageComplexity: 0.9
            }
        },
        peer_supporter: {
            type: 'peer_supporter' as CODAPersonalityType,
            traits: {
                empathy: 0.9,
                patience: 0.8,
                challenge: 0.5,
                humor: 0.8,
                culturalDepth: 0.7
            },
            communicationStyle: {
                directness: 0.6,
                encouragement: 0.85,
                culturalReferences: 0.7,
                signLanguageComplexity: 0.6
            }
        }
    } as const,

    /** Valeurs par défaut pour les configurations */
    DEFAULT_CONFIG: {
        aiIntelligenceLevel: 'intermediate' as AIIntelligenceLevel,
        culturalAuthenticity: true,
        emotionalSensitivity: 0.7,
        frustrationThreshold: 0.6,
        motivationBoost: 0.8,
        culturalSensitivityWeight: 0.2,
        empathyWeight: 0.3
    } as const,

    /** Seuils pour la détection émotionnelle */
    EMOTIONAL_THRESHOLDS: {
        frustration: 0.7,
        confusion: 0.6,
        motivation: 0.8,
        confidence: 0.75
    } as const
} as const;

/**
 * Utilitaires pour l'évaluateur CODA
 */
export const CODAEvaluatorUtils = {
    /**
     * Calcule la moyenne d'un tableau de nombres
     * @param values Tableau de valeurs numériques
     * @returns Moyenne des valeurs ou 0 si tableau vide
     */
    calculateAverage: (values: readonly number[]): number => {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    },

    /**
     * Calcule la variabilité d'un ensemble de valeurs
     * @param values Tableau de valeurs numériques
     * @returns Écart-type des valeurs
     */
    calculateVariability: (values: readonly number[]): number => {
        if (values.length < 2) return 0;

        const mean = CODAEvaluatorUtils.calculateAverage(values);
        const variance = values.reduce(
            (sum, val) => sum + Math.pow(val - mean, 2), 0
        ) / values.length;

        return Math.sqrt(variance);
    },

    /**
     * Normalise un score entre 0 et 1
     * @param score Score à normaliser
     * @param min Valeur minimale (défaut: 0)
     * @param max Valeur maximale (défaut: 1)
     * @returns Score normalisé
     */
    normalizeScore: (score: number, min = 0, max = 1): number => {
        return Math.max(min, Math.min(max, score));
    },

    /**
     * Détermine le niveau d'enseignement basé sur le score
     * @param score Score global entre 0 et 1
     * @returns Niveau d'enseignement correspondant
     */
    determineTeachingLevel: (score: number): MentorEvaluation['teachingLevel'] => {
        const thresholds = CODA_EVALUATOR_CONSTANTS.TEACHING_LEVEL_THRESHOLDS;

        if (score >= thresholds.expert) return 'expert';
        if (score >= thresholds.proficient) return 'proficient';
        if (score >= thresholds.developing) return 'developing';
        return 'novice';
    },

    /**
     * Calcule le niveau CECRL basé sur les métriques
     * @param avgComprehension Compréhension moyenne
     * @param sessionCount Nombre de sessions
     * @param totalTime Temps total en minutes
     * @returns Niveau CECRL calculé
     */
    calculateCECRLLevel: (
        avgComprehension: number,
        sessionCount: number,
        totalTime: number
    ): string => {
        const thresholds = CODA_EVALUATOR_CONSTANTS.CECRL_THRESHOLDS;

        // Vérifier B2
        if (
            avgComprehension >= thresholds.B2.comprehension &&
            sessionCount >= thresholds.B2.sessions &&
            totalTime >= thresholds.B2.time
        ) {
            return 'B2';
        }

        // Vérifier B1
        if (
            avgComprehension >= thresholds.B1.comprehension &&
            sessionCount >= thresholds.B1.sessions &&
            totalTime >= thresholds.B1.time
        ) {
            return 'B1';
        }

        // Vérifier A2
        if (
            avgComprehension >= thresholds.A2.comprehension &&
            sessionCount >= thresholds.A2.sessions &&
            totalTime >= thresholds.A2.time
        ) {
            return 'A2';
        }

        return 'A1';
    },

    /**
     * Génère un nom d'IA-élève basé sur l'ID mentor
     * @param mentorId Identifiant unique du mentor
     * @returns Nom aléatoire mais déterministe pour l'IA-élève
     */
    generateAIStudentName: (mentorId: string): string => {
        const names = CODA_EVALUATOR_CONSTANTS.AI_STUDENT_NAMES;
        const nameIndex = mentorId.split('').reduce(
            (sum, char) => sum + char.charCodeAt(0), 0
        );
        return names[nameIndex % names.length];
    },

    /**
     * Valide une configuration CODA
     * @param config Configuration à valider
     * @returns True si la configuration est valide
     */
    validateConfig: (config: CODAEvaluatorConfig): boolean => {
        if (config.emotionalSensitivity !== undefined) {
            if (config.emotionalSensitivity < 0 || config.emotionalSensitivity > 1) {
                return false;
            }
        }
        return true;
    },

    /**
     * Obtient la personnalité par défaut pour un type donné
     * @param type Type de personnalité CODA
     * @returns Personnalité CODA correspondante ou undefined
     */
    getDefaultPersonality: (type: CODAPersonalityType): CODAPersonality | undefined => {
        return CODA_EVALUATOR_CONSTANTS.DEFAULT_PERSONALITIES[type];
    },

    /**
     * Calcule un score de correspondance émotionnelle
     * @param detectedEmotion Émotion détectée
     * @param intensity Intensité de l'émotion
     * @returns Score de correspondance entre 0 et 1
     */
    calculateEmotionalMatchScore: (
        detectedEmotion: EmotionalContext['detectedEmotion'],
        intensity: number
    ): number => {
        const baseScore = {
            'frustrated': 0.3,
            'confused': 0.4,
            'neutral': 0.6,
            'motivated': 0.8,
            'confident': 0.9
        }[detectedEmotion] || 0.5;

        // Ajuster le score basé sur l'intensité
        const intensityAdjustment = (intensity - 0.5) * 0.2;

        return CODAEvaluatorUtils.normalizeScore(baseScore + intensityAdjustment);
    }
} as const;