//src/ai/api/security/session/types.ts
import { Session, SessionMetrics } from './SessionManager';

export interface CreateSessionParams {
    userId: string;
    ip: string;
    userAgent: string;
    fingerprint?: string;
    data?: Record<string, unknown>;
    metadata?: {
        device?: string;
        location?: string;
        platform?: string;
        application?: string;
    };
}

export interface SessionContext {
    ip: string;
    userAgent: string;
    fingerprint?: string;
    timestamp: number;
}

export interface SessionEvent {
    type: 'creation' | 'validation' | 'renewal' | 'invalidation' | 'expiration';
    sessionId: string;
    userId: string;
    timestamp: number;
    details?: Record<string, unknown>;
}

export interface SessionAuditLog {
    sessionId: string;
    userId: string;
    events: SessionEvent[];
    metadata: {
        createdAt: number;
        lastActivity: number;
        expiresAt: number;
        renewalCount: number;
        invalidatedAt?: number;
        invalidationReason?: string;
    };
}

export interface SessionStorage {
    type: 'memory' | 'redis';
    options?: {
        redis?: {
            host: string;
            port: number;
            password?: string;
            db?: number;
            prefix?: string;
        };
        persistence?: {
            enabled: boolean;
            path?: string;
            backupInterval?: number;
        };
    };
}

export interface SessionFingerprint {
    userAgent: string;
    language: string;
    platform: string;
    screenResolution?: string;
    colorDepth?: number;
    timezone?: string;
    plugins?: string[];
    fonts?: string[];
    canvas?: string;
    webgl?: string;
}

export interface SessionActivityLog {
    timestamp: number;
    action: string;
    ip: string;
    userAgent: string;
    resource?: string;
    status: 'success' | 'failure';
    reason?: string;
}

export interface SessionAnalytics {
    activeUsers: number;
    averageSessionDuration: number;
    concurrentSessions: number;
    sessionsByPlatform: Record<string, number>;
    sessionsByLocation: Record<string, number>;
    invalidationReasons: Record<string, number>;
    renewalDistribution: {
        noRenewal: number;
        oneRenewal: number;
        multipleRenewals: number;
    };
    securityEvents: {
        ipMismatches: number;
        fingerprintMismatches: number;
        suspiciousActivities: number;
    };
}

export interface SessionLimits {
    perUser: number;
    perIP: number;
    globalConcurrent: number;
    renewalsBeforeReauth: number;
}

export interface SessionNotification {
    type: 'expiration' | 'security' | 'limit' | 'anomaly';
    sessionId: string;
    userId: string;
    message: string;
    timestamp: number;
    priority: 'low' | 'medium' | 'high';
    requiresAction: boolean;
}

export interface SessionBackup {
    timestamp: number;
    sessions: Session[];
    userSessions: Map<string, Set<string>>;
    metrics: SessionMetrics;
    version: string;
}

export interface SessionRestorePoint {
    id: string;
    timestamp: number;
    reason: string;
    metadata: Record<string, unknown>;
    data: SessionBackup;
}