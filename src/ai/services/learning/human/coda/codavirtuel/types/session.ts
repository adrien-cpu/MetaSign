/**
 * Types liés aux sessions d'enseignement
 * @file types/session.ts
 */

import { CECRLLevel, AIMood } from './base';
import { EmotionalState } from './personality';
import { ExtendedEvolutionMetrics } from './metrics';

/** Réaction complète de l'IA-élève */
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
    readonly evolutionMetrics: ExtendedEvolutionMetrics;
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

/** Session d'enseignement */
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

/** Compétences de mentor */
export interface MentorCompetencies {
    readonly explanation: number;
    readonly patience: number;
    readonly adaptation: number;
    readonly encouragement: number;
    readonly culturalSensitivity: number;
}

/** Évaluation de mentor */
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

/** Support pédagogique */
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

/** Prédictions de progression */
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

/** Analyse culturelle */
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

/** Évaluation complète de l'expérience CODA */
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