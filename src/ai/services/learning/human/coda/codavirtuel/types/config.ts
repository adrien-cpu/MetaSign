/**
 * Types de configuration du système
 * @file types/config.ts
 */

import { CulturalEnvironment, CODAPersonalityType } from './base';

/** Configuration de l'évolution de l'IA */
export interface AIEvolutionConfig {
    readonly baseEvolutionRate: number;
    readonly adaptationSpeed: number;
    readonly enableAutoOptimization: boolean;
    readonly evolutionThreshold?: number;
    readonly analysisDepth?: number;
    readonly evolutionSensitivity?: number;
}

/** Configuration émotionnelle */
export interface EmotionalConfig {
    readonly baseVolatility: number;
    readonly enablePatternDetection: boolean;
    readonly emotionalMemory?: boolean;
    readonly triggerSensitivity?: number;
    readonly historyDepth?: number;
}

/** Configuration du simulateur IA-élève */
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
    };
    readonly personalityConfig?: {
        readonly traits?: Readonly<Record<string, number>>;
        readonly culturalContext?: CulturalEnvironment;
    };
}

/** Configuration de session CODA */
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

/** Options de gestion de session CODA */
export interface CODASessionManagerOptions {
    readonly maxSessionsPerMentor?: number;
    readonly enableRealTimeAnalytics?: boolean;
    readonly emotionalUpdateFrequencyMs?: number;
    readonly autoCleanupExpiredSessions?: boolean;
    readonly sessionTimeoutMs?: number;
}