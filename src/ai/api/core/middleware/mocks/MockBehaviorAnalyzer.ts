// src/ai/api/core/middleware/mocks/MockBehaviorAnalyzer.ts

import {
    IBehaviorAnalyzer,
    BehaviorAnalysisResult,
    UserBehaviorProfile
} from '../types/middleware.types';

export class MockBehaviorAnalyzer implements IBehaviorAnalyzer {
    private readonly shouldFlagAnomaly: boolean;
    private readonly anomalyScore: number;

    constructor(options?: {
        shouldFlagAnomaly?: boolean;
        anomalyScore?: number;
    }) {
        this.shouldFlagAnomaly = options?.shouldFlagAnomaly ?? false;
        this.anomalyScore = options?.anomalyScore ?? 0.1;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public async analyzeRequest(userId: string, _requestData: unknown): Promise<BehaviorAnalysisResult> {
        return {
            userId,
            timestamp: Date.now(),
            isAnomaly: this.shouldFlagAnomaly,
            anomalyScore: this.anomalyScore,
            confidence: this.shouldFlagAnomaly ? 0.9 : 0.3,
            patterns: this.shouldFlagAnomaly ? ['unusual-access-time', 'unusual-endpoint'] : [],
            details: this.shouldFlagAnomaly
                ? { reason: 'Mock behavior analysis for testing' }
                : undefined
        };
    }

    public async getUserProfile(userId: string): Promise<UserBehaviorProfile | null> {
        return {
            userId,
            createdAt: Date.now() - 86400000, // 1 day ago
            lastUpdatedAt: Date.now() - 3600000, // 1 hour ago
            totalRequests: 240,
            commonPatterns: [
                { pattern: 'daily-login', frequency: 0.95 },
                { pattern: 'profile-access', frequency: 0.7 }
            ],
            requestDistribution: {
                byHour: new Array(24).fill(0).map((_, i) => ({ hour: i, count: 10 })),
                byDay: new Array(7).fill(0).map((_, i) => ({ day: i, count: 30 }))
            }
        };
    }

    // Implémentation des méthodes manquantes pour satisfaire l'interface
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public async analyzeBehavior(profile: UserBehaviorProfile, _currentActivity: unknown): Promise<BehaviorAnalysisResult> {
        return {
            userId: profile.userId,
            timestamp: Date.now(),
            isAnomaly: this.shouldFlagAnomaly,
            anomalyScore: this.anomalyScore,
            confidence: this.shouldFlagAnomaly ? 0.9 : 0.3,
            patterns: this.shouldFlagAnomaly ? ['unusual-behavior-pattern'] : [],
            details: this.shouldFlagAnomaly
                ? { reason: 'Mock behavior analysis for testing' }
                : undefined
        };
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public async getUserAnomalies(userId: string, _timeRange?: { start: number; end: number }): Promise<BehaviorAnalysisResult[]> {
        if (!this.shouldFlagAnomaly) {
            return [];
        }

        return [
            {
                userId,
                timestamp: Date.now() - 3600000, // 1 hour ago
                isAnomaly: true,
                anomalyScore: this.anomalyScore,
                confidence: 0.92,
                patterns: ['unusual-access-time'],
                details: { reason: 'Mock anomaly 1' }
            },
            {
                userId,
                timestamp: Date.now() - 7200000, // 2 hours ago
                isAnomaly: true,
                anomalyScore: this.anomalyScore * 0.9,
                confidence: 0.85,
                patterns: ['unusual-endpoint'],
                details: { reason: 'Mock anomaly 2' }
            }
        ];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public async getHighRiskUsers(_threshold: number): Promise<string[]> {
        if (!this.shouldFlagAnomaly) {
            return [];
        }

        return ['high-risk-user-1', 'high-risk-user-2', 'high-risk-user-3'];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public async cleanup(_olderThan: number): Promise<void> {
        // Méthode simulée, ne fait rien
        return Promise.resolve();
    }
}