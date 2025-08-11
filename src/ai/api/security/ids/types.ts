// src/ai/api/security/ids/types.ts

export interface IDSRequest {
    ip: string;
    path: string;
    method: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    body: unknown; // Remplacé 'any' par 'unknown'
    status: number;
    timestamp: number;
}

export interface IDSStatus {
    activeMonitoring: boolean;
    blockedIPs: string[];
    currentThreats: ThreatStatus[];
    metrics: IDSMetrics;
    lastUpdate: number;
}

export interface ThreatStatus {
    ip: string;
    threatType: string;
    confidence: number;
    firstSeen: number;
    lastSeen: number;
    evidence: string[];
    actions: ThreatAction[];
}

export interface ThreatAction {
    type: 'block' | 'warn' | 'monitor';
    timestamp: number;
    duration?: number;
    reason: string;
}

export interface IDSMetrics {
    totalRequestsAnalyzed: number;
    threatsDetected: number;
    falsePositives: number;
    truePositives: number;
    averageAnalysisTime: number;
    topThreats: {
        type: string;
        count: number;
    }[];
    topTargetedPaths: {
        path: string;
        attempts: number;
    }[];
    blockStats: {
        currentlyBlocked: number;
        totalBlocked: number;
        averageBlockDuration: number;
    };
}

export interface IDSAlert {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    message: string;
    details: Record<string, unknown>; // Remplacé 'any' par 'unknown'
    timestamp: number;
    relatedIP?: string;
    relatedPath?: string;
    status: 'new' | 'investigating' | 'resolved' | 'false-positive';
}

export interface IDSRule {
    id: string;
    name: string;
    description: string;
    pattern: RegExp | string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    enabled: boolean;
    action: 'block' | 'warn' | 'monitor';
    conditions?: {
        minConfidence?: number;
        minOccurrences?: number;
        timeWindow?: number;
        requiresPattern?: boolean;
    };
}

export interface IDSAnalysisResult {
    matched: boolean;
    rule?: IDSRule;
    confidence: number;
    evidence: string[];
    timestamp: number;
    context?: Record<string, unknown>; // Remplacé 'any' par 'unknown'
}

export interface IDSPerformanceMetrics {
    analysisTime: number;
    rulesChecked: number;
    matchesFound: number;
    resourceUsage: {
        cpu: number;
        memory: number;
        activeConnections: number;
    };
    queueStats: {
        current: number;
        peak: number;
        average: number;
    };
}

export type IDSCallback = (alert: IDSAlert) => Promise<void>;

export interface IDSConfiguration {
    analysisTimeoutMs: number;
    maxRequestQueueSize: number;
    maxConcurrentAnalysis: number;
    performanceMonitoring: boolean;
    debugMode: boolean;
    alertThrottling: {
        enabled: boolean;
        maxAlertsPerMinute: number;
        groupSimilarAlerts: boolean;
    };
    customRules: IDSRule[];
    ignoredPaths: string[];
    trustedIPs: string[];
    sensitiveDataPatterns: Record<string, RegExp>;
}