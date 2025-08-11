// src/ai/api/security/behavior/interfaces.ts
import { BehaviorEvent, BehaviorProfile, BehaviorAnomaly, BehaviorAnalysis } from './types';
import { SecurityContext } from '../types/SecurityTypes';

export interface IBehaviorAnalyzer {
    analyzeBehavior(event: BehaviorEvent, context: SecurityContext): Promise<BehaviorAnalysis>;
    getUserProfile(userId: string): Promise<BehaviorProfile | undefined>;
    getUserAnomalies(userId: string, timeWindow?: number): Promise<BehaviorAnomaly[]>;
    getHighRiskUsers(): Promise<Array<{
        userId: string;
        riskScore: number;
        anomalyCount: number;
    }>>;
    cleanup(): Promise<void>;
}

export interface IPatternDetector {
    detectAnomalies(event: BehaviorEvent, profile: BehaviorProfile): Promise<BehaviorAnomaly[]>;
    updateProfile(profile: BehaviorProfile, event: BehaviorEvent): Promise<void>;
}