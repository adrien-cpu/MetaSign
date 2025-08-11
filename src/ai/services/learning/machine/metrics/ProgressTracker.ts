// src/ai/learning/realtime/EngagementMonitor.ts

import {
    UserState,
    EngagementSignals,
    FrustrationIndicators,
    EngagementAnalysis,
    RecommendedAction,
    CognitiveLoadEstimate,
    AttentionMetrics
} from '@ai/learning/types/engagement.types';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { FrustrationDetector } from './analyzers/FrustrationDetector';
import { CognitiveLoadEstimator } from './analyzers/CognitiveLoadEstimator';
import { EngagementCalculator } from './analyzers/EngagementCalculator';
import { RecommendationGenerator } from './recommendations/RecommendationGenerator';

/**
 * Monitors learner engagement in real-time, detecting frustration, measuring cognitive load,
 * and providing interventions to optimize the learning experience.
 */
export class EngagementMonitor {
    private readonly analysisWindow: number;
    private readonly signalBuffer: Map<string, EngagementSignals[]>;
    private readonly metricsCollector: IMetricsCollector;
    private readonly frustrationDetector: FrustrationDetector;
    private readonly cognitiveLoadEstimator: CognitiveLoadEstimator;
    private readonly engagementCalculator: EngagementCalculator;
    private readonly recommendationGenerator: RecommendationGenerator;

    constructor(
        metricsCollector: IMetricsCollector,
        frustrationDetector: FrustrationDetector,
        cognitiveLoadEstimator: CognitiveLoadEstimator,
        engagementCalculator: EngagementCalculator,
        recommendationGenerator: RecommendationGenerator,
        options?: {
            analysisWindowMs?: number
        }
    ) {
        this.metricsCollector = metricsCollector;
        this.frustrationDetector = frustrationDetector;
        this.cognitiveLoadEstimator = cognitiveLoadEstimator;
        this.engagementCalculator = engagementCalculator;
        this.recommendationGenerator = recommendationGenerator;

        this.analysisWindow = options?.analysisWindowMs || 60000; // Default: 1 minute
        this.signalBuffer = new Map<string, EngagementSignals[]>();
    }

    /**
     * Adds new engagement signals for a specific user
     * @param userId Unique identifier for the user
     * @param signals Engagement signals to add
     */
    public addSignals(userId: string, signals: EngagementSignals): void {
        this.metricsCollector.recordMetric('engagement_monitor.signals_received', 1);

        if (!this.signalBuffer.has(userId)) {
            this.signalBuffer.set(userId, []);
        }

        const userSignals = this.signalBuffer.get(userId);
        if (userSignals) {
            // Add new signals
            userSignals.push(signals);

            // Remove signals outside the analysis window
            const cutoffTime = Date.now() - this.analysisWindow;
            while (userSignals.length > 0 && userSignals[0].timestamp < cutoffTime) {
                userSignals.shift();
            }
        }
    }

    /**
     * Analyzes the current engagement state for a specific user
     * @param userId Unique identifier for the user
     * @param contextData Additional context data
     */
    public analyzeEngagement(
        userId: string,
        contextData?: {
            currentActivity?: string;
            difficulty?: number;
            learningStyle?: string;
            previousPerformance?: Record<string, number>;
        }
    ): EngagementAnalysis {
        this.metricsCollector.recordMetric('engagement_monitor.analysis_started', 1);
        const analysisStart = performance.now();

        try {
            const userSignals = this.signalBuffer.get(userId) || [];

            // Log signal count for monitoring
            this.metricsCollector.recordMetric('engagement_monitor.signals_processed', userSignals.length);

            // Skip detailed analysis if no signals are available
            if (userSignals.length === 0) {
                return this.createDefaultAnalysis(userId, contextData);
            }

            // Process engagement indicators
            const engagementLevel = this.engagementCalculator.calculateEngagementLevel(userSignals, contextData);

            // Detect frustration indicators
            const frustrationIndicators = this.frustrationDetector.detectFrustration(userSignals, contextData);

            // Estimate cognitive load
            const cognitiveLoad = this.cognitiveLoadEstimator.estimateCognitiveLoad(userSignals, contextData);

            // Calculate attention metrics
            const attentionMetrics = this.calculateAttentionMetrics(userSignals);

            // Generate recommended actions based on the analysis
            const recommendedActions = this.recommendationGenerator.generateRecommendations(
                engagementLevel,
                frustrationIndicators,
                cognitiveLoad,
                attentionMetrics,
                contextData
            );

            // Create the complete analysis result
            const result: EngagementAnalysis = {
                userId,
                timestamp: Date.now(),
                engagementLevel,
                frustrationLevel: frustrationIndicators.level,
                frustrationSources: frustrationIndicators.sources,
                cognitiveLoad,
                attentionMetrics,
                userState: this.determineUserState(engagementLevel, frustrationIndicators, cognitiveLoad),
                timeInSession: this.calculateSessionTime(userSignals),
                interactionFrequency: this.calculateInteractionFrequency(userSignals),
                recommendedActions,
                confidence: this.calculateConfidence(userSignals.length),
                analysisTimeMs: performance.now() - analysisStart
            };

            this.metricsCollector.recordMetric('engagement_monitor.analysis_success', 1);
            this.metricsCollector.recordMetric('engagement_monitor.analysis_time_ms', result.analysisTimeMs);

            return result;
        } catch (error) {
            this.metricsCollector.recordMetric('engagement_monitor.analysis_error', 1);

            // Return a minimal analysis in case of error
            return {
                userId,
                timestamp: Date.now(),
                engagementLevel: 0.5,
                frustrationLevel: 0,
                frustrationSources: [],
                cognitiveLoad: { level: 0.5, factors: [] },
                attentionMetrics: { focusDuration: 0, distractionCount: 0, attentionShifts: 0 },
                userState: 'neutral',
                timeInSession: 0,
                interactionFrequency: 0,
                recommendedActions: [],
                confidence: 0.2,
                analysisTimeMs: performance.now() - analysisStart,
                error: String(error)
            };
        }
    }

    /**
     * Clears stored signals for a user, typically when they end a session
     * @param userId Unique identifier for the user
     */
    public clearUserData(userId: string): void {
        this.signalBuffer.delete(userId);
    }

    /**
     * Creates a default analysis when no signals are available
     */
    private createDefaultAnalysis(
        userId: string,
        contextData?: Record<string, any>
    ): EngagementAnalysis {
        return {
            userId,
            timestamp: Date.now(),
            engagementLevel: 0.5, // Neutral engagement
            frustrationLevel: 0,
            frustrationSources: [],
            cognitiveLoad: { level: 0.5, factors: [] },
            attentionMetrics: { focusDuration: 0, distractionCount: 0, attentionShifts: 0 },
            userState: 'neutral',
            timeInSession: 0,
            interactionFrequency: 0,
            recommendedActions: [],
            confidence: 0.1, // Very low confidence due to no data
            analysisTimeMs: 0
        };
    }

    /**
     * Calculates attention metrics from engagement signals
     */
    private calculateAttentionMetrics(signals: EngagementSignals[]): AttentionMetrics {
        // Extract focus-related signals
        const focusEvents = signals.filter(s => s.focusState !== undefined);

        if (focusEvents.length === 0) {
            return { focusDuration: 0, distractionCount: 0, attentionShifts: 0 };
        }

        // Calculate total focus duration
        let focusDuration = 0;
        let distractionCount = 0;
        let attentionShifts = 0;
        let lastFocusState: boolean | undefined;

        for (let i = 0; i < focusEvents.length; i++) {
            const currentEvent = focusEvents[i];
            const nextEvent = i < focusEvents.length - 1 ? focusEvents[i + 1] : null;

            // Count focus/unfocus transitions
            if (lastFocusState !== undefined && lastFocusState !== currentEvent.focusState) {
                attentionShifts++;
            }

            // Count distractions (transitions from focused to unfocused)
            if (lastFocusState === true && currentEvent.focusState === false) {
                distractionCount++;
            }

            // Calculate duration if we have a pair of events
            if (nextEvent && currentEvent.focusState) {
                focusDuration += nextEvent.timestamp - currentEvent.timestamp;
            }

            lastFocusState = currentEvent.focusState;
        }

        return {
            focusDuration,
            distractionCount,
            attentionShifts
        };
    }

    /**
     * Determines the overall user state based on engagement analysis
     */
    private determineUserState(
        engagementLevel: number,
        frustration: FrustrationIndicators,
        cognitiveLoad: CognitiveLoadEstimate
    ): UserState {
        // High frustration overrides other states
        if (frustration.level > 0.7) {
            return 'frustrated';
        }

        // Cognitive overload
        if (cognitiveLoad.level > 0.8) {
            return 'overwhelmed';
        }

        // Very low cognitive load might indicate boredom
        if (cognitiveLoad.level < 0.3 && engagementLevel < 0.4) {
            return 'bored';
        }

        // High engagement and appropriate cognitive load is optimal
        if (engagementLevel > 0.7 && cognitiveLoad.level >= 0.4 && cognitiveLoad.level <= 0.7) {
            return 'engaged';
        }

        // Low engagement but not frustrated or bored might be distracted
        if (engagementLevel < 0.4 && frustration.level < 0.4) {
            return 'distracted';
        }

        // Default state
        return 'neutral';
    }

    /**
     * Calculates the total time in the current session
     */
    private calculateSessionTime(signals: EngagementSignals[]): number {
        if (signals.length === 0) {
            return 0;
        }

        const firstTimestamp = Math.min(...signals.map(s => s.timestamp));
        const lastTimestamp = Math.max(...signals.map(s => s.timestamp));

        return lastTimestamp - firstTimestamp;
    }

    /**
     * Calculates the frequency of interactions per minute
     */
    private calculateInteractionFrequency(signals: EngagementSignals[]): number {
        const sessionTimeMinutes = this.calculateSessionTime(signals) / (1000 * 60);

        if (sessionTimeMinutes === 0) {
            return 0;
        }

        // Count interaction events
        const interactionCount = signals.filter(s =>
            s.mouseMovements !== undefined ||
            s.keystrokes !== undefined ||
            s.clickEvents !== undefined
        ).length;

        return interactionCount / sessionTimeMinutes;
    }

    /**
     * Calculates confidence in the analysis based on available data
     */
    private calculateConfidence(signalCount: number): number {
        // More signals = higher confidence, up to a point
        const baseConfidence = Math.min(signalCount / 20, 1) * 0.8;

        // Add some randomness to avoid exact repetition
        return Math.min(baseConfidence + Math.random() * 0.1, 0.95);
    }
}