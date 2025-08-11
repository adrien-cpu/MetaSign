// src/ai/api/core/middleware/mocks/MockIntrusionDetectionSystem.ts
import {
    IIntrusionDetectionSystem,
    IntrusionDetectionResult,
    ThreatLevel,
    IntrusionType
} from '../types/middleware.types';

export class MockIntrusionDetectionSystem implements IIntrusionDetectionSystem {
    private readonly anomaliesDetected: boolean;
    private readonly threatLevel: ThreatLevel;

    constructor(options?: {
        anomaliesDetected?: boolean;
        threatLevel?: ThreatLevel;
    }) {
        this.anomaliesDetected = options?.anomaliesDetected ?? false;
        this.threatLevel = options?.threatLevel ?? ThreatLevel.NONE;
    }

    // Utilisation de /* eslint-disable next-line */ pour éviter le warning
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public async detectIntrusion(requestData: unknown): Promise<IntrusionDetectionResult> {
        return {
            threatDetected: this.anomaliesDetected,
            threatLevel: this.threatLevel,
            intrusionType: this.anomaliesDetected ? IntrusionType.SUSPICIOUS_PATTERN : undefined,
            confidence: this.anomaliesDetected ? 0.85 : 0.05,
            detectionTime: Date.now(),
            details: this.anomaliesDetected
                ? { reason: 'Mock detection for testing', patterns: ['test-pattern'] }
                : undefined
        };
    }

    public async getLastDetectionResult(): Promise<IntrusionDetectionResult | null> {
        if (!this.anomaliesDetected) {
            return null;
        }

        return {
            threatDetected: true,
            threatLevel: this.threatLevel,
            intrusionType: IntrusionType.SUSPICIOUS_PATTERN,
            confidence: 0.85,
            detectionTime: Date.now() - 1000, // 1 second ago
            details: { reason: 'Previous mock detection', patterns: ['test-pattern'] }
        };
    }
}