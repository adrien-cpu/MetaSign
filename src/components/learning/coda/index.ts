/**
 * @fileoverview Index principal et types du système CODA virtuel
 * Chemin: src/components/learning/coda/index.ts
 * 
 * Point d'entrée centralisé pour tous les composants et types du système CODA virtuel.
 * Facilite l'importation et maintient la cohérence du système.
 * 
 * @author MetaSign AI Team
 * @version 1.0.0
 * @since 2024
 */

// Export des composants principaux
export { default as CODAVirtuelDashboard } from './CODAVirtuelDashboard';
export { default as CODATeachingSession } from './CODATeachingSession';
export { default as AvatarStudentProfile } from './AvatarStudentProfile';
export { default as CODAExerciseManager } from './CODAExerciseManager';

// Types principaux pour le système CODA
export interface CODASystemConfig {
    /** Configuration globale du système CODA */
    enableRealTimeAnalysis: boolean;
    maxSessionDuration: number; // en minutes
    defaultStudentLevel: CECRLLevel;
    adaptationSensitivity: 'low' | 'medium' | 'high';
    culturalRegion: string;
    languageVariant: 'LSF' | 'ASL' | 'BSL' | 'other';
}

export interface CODAMetrics {
    /** Métriques de performance du système CODA */
    totalSessions: number;
    totalTeachingTime: number; // en minutes
    averageSessionSuccess: number; // 0-100
    studentProgressionRate: number; // 0-100
    teacherEngagementScore: number; // 0-100
    errorCorrectionEfficiency: number; // 0-100
    adaptationAccuracy: number; // 0-100
}

export interface CODAEvent {
    /** Événements du système CODA pour le tracking */
    id: string;
    type: CODAEventType;
    timestamp: Date;
    sessionId: string;
    userId: string;
    data: Record<string, unknown>;
    severity: 'info' | 'warning' | 'error' | 'success';
}

export type CODAEventType =
    | 'session_started'
    | 'session_completed'
    | 'session_paused'
    | 'exercise_completed'
    | 'error_detected'
    | 'error_corrected'
    | 'level_progression'
    | 'adaptation_triggered'
    | 'feedback_provided'
    | 'achievement_unlocked';

export interface CODAAdaptationRule {
    /** Règles d'adaptation du comportement de l'avatar */
    id: string;
    name: string;
    description: string;
    condition: AdaptationCondition;
    action: AdaptationAction;
    priority: number; // 1-10, 10 = highest
    isActive: boolean;
}

export interface AdaptationCondition {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
    value: number | string;
    timeWindow?: number; // en secondes
}

export interface AdaptationAction {
    type: 'modify_difficulty' | 'change_pace' | 'add_hints' | 'repeat_content' | 'skip_section';
    parameters: Record<string, unknown>;
    feedback?: string;
}

export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CODASkillAssessment {
    /** Évaluation détaillée des compétences */
    skillArea: SkillArea;
    currentLevel: number; // 0-100
    targetLevel: number; // 0-100
    progression: number; // -100 à +100 (change depuis dernière évaluation)
    lastAssessment: Date;
    confidence: number; // 0-100, fiabilité de l'évaluation
    recommendations: string[];
}

export type SkillArea =
    | 'vocabulary'
    | 'grammar'
    | 'spatial_syntax'
    | 'facial_expressions'
    | 'manual_components'
    | 'non_manual_markers'
    | 'cultural_context'
    | 'comprehension'
    | 'production'
    | 'interaction';

export interface CODAFeedback {
    /** Structure du feedback pédagogique */
    id: string;
    type: FeedbackType;
    content: string;
    targetSkill?: SkillArea;
    severity: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
    isAutomated: boolean;
    confidence: number; // 0-100
    suggestions: string[];
}

export type FeedbackType =
    | 'correction'
    | 'encouragement'
    | 'suggestion'
    | 'question'
    | 'explanation'
    | 'demonstration'
    | 'reinforcement';

export interface CODALearningObjective {
    /** Objectifs d'apprentissage structurés */
    id: string;
    title: string;
    description: string;
    skillAreas: SkillArea[];
    targetLevel: CECRLLevel;
    measurableCriteria: string[];
    timeEstimate: number; // en minutes
    prerequisites: string[];
    assessmentMethods: AssessmentMethod[];
}

export type AssessmentMethod =
    | 'observation'
    | 'practice_exercise'
    | 'comprehension_check'
    | 'peer_evaluation'
    | 'self_assessment'
    | 'automated_analysis';

export interface CODAPersonalizationProfile {
    /** Profil de personnalisation de l'apprentissage */
    userId: string;
    learningStyle: LearningStyleProfile;
    preferences: LearningPreferences;
    adaptationHistory: AdaptationRecord[];
    performancePatterns: PerformancePattern[];
    motivationFactors: MotivationFactor[];
}

export interface LearningStyleProfile {
    visualLearning: number; // 0-100
    kinestheticLearning: number; // 0-100
    auditoryLearning: number; // 0-100
    socialLearning: number; // 0-100
    reflectiveLearning: number; // 0-100
    activeLearning: number; // 0-100
    preferredPace: 'slow' | 'moderate' | 'fast' | 'variable';
    attentionSpan: number; // en minutes
    errorTolerance: 'low' | 'medium' | 'high';
}

export interface LearningPreferences {
    favoriteTopics: string[];
    difficultTopics: string[];
    preferredSessionDuration: number; // en minutes
    optimalTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
    breakFrequency: number; // en minutes
    feedbackStyle: 'immediate' | 'delayed' | 'summary';
    challengeLevel: 'conservative' | 'moderate' | 'aggressive';
}

export interface AdaptationRecord {
    timestamp: Date;
    trigger: string;
    action: string;
    result: 'positive' | 'negative' | 'neutral';
    metrics: Record<string, number>;
}

export interface PerformancePattern {
    pattern: string;
    frequency: number;
    conditions: string[];
    impact: 'positive' | 'negative' | 'neutral';
    recommendations: string[];
}

export interface MotivationFactor {
    factor: string;
    impact: number; // -100 à +100
    context: string[];
    strategies: string[];
}

export interface CODAAnalytics {
    /** Analytics et métriques avancées */
    sessionAnalytics: SessionAnalytics;
    learningAnalytics: LearningAnalytics;
    teachingAnalytics: TeachingAnalytics;
    systemAnalytics: SystemAnalytics;
}

export interface SessionAnalytics {
    totalSessions: number;
    averageDuration: number; // en minutes
    completionRate: number; // 0-100
    engagementScore: number; // 0-100
    errorRate: number; // 0-100
    improvementRate: number; // 0-100
    sessionsByType: Record<string, number>;
    sessionsByLevel: Record<CECRLLevel, number>;
}

export interface LearningAnalytics {
    skillProgression: Record<SkillArea, number>;
    learningVelocity: number; // progression par heure
    retentionRate: number; // 0-100
    transferEfficiency: number; // 0-100
    weaknessPatterns: string[];
    strengthAreas: SkillArea[];
    optimalLearningConditions: string[];
}

export interface TeachingAnalytics {
    teachingEffectiveness: number; // 0-100
    correctionAccuracy: number; // 0-100
    feedbackQuality: number; // 0-100
    adaptationSuccess: number; // 0-100
    studentEngagement: number; // 0-100
    pedagogicalInsights: string[];
}

export interface SystemAnalytics {
    systemPerformance: number; // 0-100
    analysisAccuracy: number; // 0-100
    responseTime: number; // en millisecondes
    errorRate: number; // 0-100
    uptime: number; // 0-100
    userSatisfaction: number; // 0-100
}

export interface CODAIntegrationConfig {
    /** Configuration d'intégration avec d'autres systèmes */
    aiSystems: AISystemIntegration[];
    learningPlatforms: LearningPlatformIntegration[];
    assessmentTools: AssessmentToolIntegration[];
    analyticsServices: AnalyticsServiceIntegration[];
}

export interface AISystemIntegration {
    systemId: string;
    systemType: 'lsf_analysis' | 'gesture_recognition' | 'expression_analysis' | 'spatial_tracking';
    apiEndpoint: string;
    isEnabled: boolean;
    confidence: number; // 0-100
    latency: number; // en millisecondes
}

export interface LearningPlatformIntegration {
    platformId: string;
    platformName: string;
    syncEnabled: boolean;
    dataMapping: Record<string, string>;
    lastSync: Date;
}

export interface AssessmentToolIntegration {
    toolId: string;
    toolName: string;
    assessmentTypes: AssessmentMethod[];
    isActive: boolean;
    accuracy: number; // 0-100
}

export interface AnalyticsServiceIntegration {
    serviceId: string;
    serviceName: string;
    metricsTracked: string[];
    reportingFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    isActive: boolean;
}

// Utilitaires et helpers
export class CODAUtils {
    /**
     * Calcule le niveau CECRL basé sur les compétences
     */
    static calculateCECRLLevel(skills: Record<SkillArea, number>): CECRLLevel {
        const average = Object.values(skills).reduce((sum, val) => sum + val, 0) / Object.values(skills).length;

        if (average < 30) return 'A1';
        if (average < 50) return 'A2';
        if (average < 70) return 'B1';
        if (average < 85) return 'B2';
        if (average < 95) return 'C1';
        return 'C2';
    }

    /**
     * Détermine la difficulté recommandée pour un exercice
     */
    static recommendDifficulty(studentLevel: CECRLLevel, skillArea: SkillArea, currentScore: number): number {
        const levelDifficulty: Record<CECRLLevel, number> = {
            'A1': 1,
            'A2': 2,
            'B1': 3,
            'B2': 4,
            'C1': 5,
            'C2': 5
        };

        let baseDifficulty = levelDifficulty[studentLevel];

        // Ajustement basé sur la performance
        if (currentScore > 85) baseDifficulty = Math.min(5, baseDifficulty + 1);
        else if (currentScore < 60) baseDifficulty = Math.max(1, baseDifficulty - 1);

        return baseDifficulty;
    }

    /**
     * Génère des recommandations d'adaptation
     */
    static generateAdaptationRecommendations(
        performance: Record<SkillArea, number>,
        sessionHistory: CODAEvent[]
    ): string[] {
        const recommendations: string[] = [];

        // Analyse des points faibles
        const weakAreas = Object.entries(performance)
            .filter(([_, score]) => score < 60)
            .map(([skill, _]) => skill);

        if (weakAreas.includes('spatial_syntax')) {
            recommendations.push('Proposer des exercices de mapping spatial simplifiés');
        }

        if (weakAreas.includes('facial_expressions')) {
            recommendations.push('Ajouter des exercices de miroir pour les expressions faciales');
        }

        // Analyse de l'historique des erreurs
        const recentErrors = sessionHistory
            .filter(event => event.type === 'error_detected')
            .slice(-10);

        if (recentErrors.length > 5) {
            recommendations.push('Ralentir le rythme et ajouter plus de répétitions');
        }

        return recommendations;
    }

    /**
     * Calcule le score d'engagement basé sur les métriques
     */
    static calculateEngagementScore(
        sessionDuration: number,
        interactions: number,
        completionRate: number
    ): number {
        const durationScore = Math.min(100, (sessionDuration / 20) * 100); // 20 min = 100%
        const interactionScore = Math.min(100, interactions * 10); // 10 interactions = 100%
        const completionScore = completionRate;

        return Math.round((durationScore * 0.3 + interactionScore * 0.3 + completionScore * 0.4));
    }

    /**
     * Formate la durée en format lisible
     */
    static formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}min`;
        }
    }

    /**
     * Valide la configuration du système CODA
     */
    static validateCODAConfig(config: CODASystemConfig): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (config.maxSessionDuration < 5 || config.maxSessionDuration > 120) {
            errors.push('La durée maximale de session doit être entre 5 et 120 minutes');
        }

        if (!['low', 'medium', 'high'].includes(config.adaptationSensitivity)) {
            errors.push('La sensibilité d\'adaptation doit être low, medium ou high');
        }

        if (!config.culturalRegion || config.culturalRegion.length < 2) {
            errors.push('La région culturelle doit être spécifiée');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Constantes utiles
export const CODA_CONSTANTS = {
    DEFAULT_SESSION_DURATION: 20, // minutes
    MIN_ACCURACY_THRESHOLD: 60, // %
    MAX_ERROR_TOLERANCE: 5, // erreurs par exercice
    ADAPTATION_SENSITIVITY_LEVELS: {
        low: 0.1,
        medium: 0.3,
        high: 0.5
    },
    SKILL_AREAS: [
        'vocabulary',
        'grammar',
        'spatial_syntax',
        'facial_expressions',
        'manual_components',
        'non_manual_markers',
        'cultural_context',
        'comprehension',
        'production',
        'interaction'
    ] as SkillArea[],
    CECRL_LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CECRLLevel[],
    FEEDBACK_TYPES: [
        'correction',
        'encouragement',
        'suggestion',
        'question',
        'explanation',
        'demonstration',
        'reinforcement'
    ] as FeedbackType[]
} as const;

// Types d'événements pour le système de hooks React
export interface CODAHookOptions {
    enableRealTime?: boolean;
    autoSave?: boolean;
    syncInterval?: number; // en millisecondes
}

export interface CODASessionHook {
    session: CODASession | null;
    isLoading: boolean;
    error: Error | null;
    startSession: (config: Partial<CODASession>) => Promise<void>;
    endSession: () => Promise<void>;
    updateSession: (updates: Partial<CODASession>) => void;
}

export interface CODASession {
    id: string;
    startTime: Date;
    endTime?: Date;
    duration: number; // en secondes
    studentId: string;
    teacherId: string;
    exerciseId: string;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    metrics: SessionMetrics;
    events: CODAEvent[];
}

export interface SessionMetrics {
    accuracy: number; // 0-100
    engagement: number; // 0-100
    progression: number; // 0-100
    errorsCount: number;
    correctionsCount: number;
    hintsUsed: number;
    interactionsCount: number;
}