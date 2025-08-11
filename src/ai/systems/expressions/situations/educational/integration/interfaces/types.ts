// src/ai/systems/expressions/situations/educational/integration/interfaces/types.ts

// Types existants
export interface InterfaceConfiguration {
    learningParameters: {
        adaptationEnabled: boolean;
        feedbackFrequency: 'LOW' | 'MEDIUM' | 'HIGH';
        culturalContext: string;
    };
    systemSettings: {
        performanceMonitoring: boolean;
        errorThreshold: number;
        realTimeUpdates: boolean;
    };
    initialMetrics?: {
        signAccuracy?: number;
        culturalCompetency?: number;
        [key: string]: number | undefined;
    };
}

export interface NotificationConfig {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    channels: string[];
}

export interface ResourceLimits {
    memory?: number;
    cpu?: number;
    concurrentConnections?: number;
    timeouts?: {
        connection?: number;
        operation?: number;
        idle?: number;
    };
}

export interface SetupStatus {
    success: boolean;
    warnings?: string[];
    errors?: string[];
}

export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
}

// Types ajoutés pour les tests
export interface LSFLearningMetrics {
    signAccuracy: number;
    spatialUnderstanding: number;
    expressiveClarity: number;
    nonManualComponents: {
        facialExpressions: number;
        bodyPosture: number;
        gazeDirection: number;
    };
    culturalCompetency: number;
}

export interface LSFPerformanceData {
    signAttempts: Array<{
        signId: string;
        accuracy: number;
        attempts: number;
        commonErrors: string[];
    }>;
    sessionDuration: number;
    completedExercises: string[];
    challengeAreas: string[];
}

export interface FeedbackResponse {
    type: string;
    priority: number;
    content?: string;
    suggestions?: string[];
    resources?: string[];
}

export interface LSFEducationalControl {
    adjustTeachingPace: (metrics: LSFLearningMetrics) => Promise<void>;
    provideFeedback: (performance: LSFPerformanceData) => Promise<FeedbackResponse>;
}

export interface InterfaceStatus {
    health: {
        online: boolean;
        responseTime: number;
        lastChecked: string;
    };
    performance: number;
    issues: Array<{
        type: string;
        message: string;
        severity: string;
    }>;
}