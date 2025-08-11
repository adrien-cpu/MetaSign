//src/ai/api/security/events/types.ts

export interface SecurityEvent {
    id: string;
    type: string;
    source: string;
    target?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    payload: Record<string, unknown>;
    context?: {
        userId?: string;
        sessionId?: string;
        ip?: string;
        userAgent?: string;
        environment?: string;
        version?: string;
    };
    metadata?: {
        processingTime?: number;
        correlationId?: string;
        hash?: string;
    };
}

export interface BatchAnalysis {
    totalEvents: number;
    eventTypes: number;
    severityDistribution: Record<string, number>;
    patterns: Pattern[];
    anomalies: AnomalyDetectionResult[];
    correlations: CorrelationResult[];
}

export interface Pattern {
    id: string;
    name: string;
    description: string;
    events: string[];
    confidence: number;
    frequency: number;
    firstSeen: number;
    lastSeen: number;
}

export interface CorrelationRule {
    id: string;
    name: string;
    conditions: {
        eventTypes: string[];
        timeWindow: number;
        order?: boolean;
        additionalMetadata?: Record<string, unknown>;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    action?: 'alert' | 'block' | 'log';
}

export interface CorrelationResult {
    patternId: string;
    matches: SecurityEvent[];
    confidence: number;
    timestamp: number;
}

export interface AnomalyBaseline {
    eventType: string;
    averageFrequency: number;
    standardDeviation: number;
    timeWindows: {
        hourly: number[];
        daily: number[];
        weekly: number[];
    };
    lastUpdated: number;
}

export interface AnomalyDetectionResult {
    eventType: string;
    deviation: number;
    confidence: number;
    affectedEvents: SecurityEvent[];
    timestamp: number;
}

export interface EventTrends {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topSources: Array<{ source: string; count: number }>;
    topTargets: Array<{ target: string; count: number }>;
    temporalDistribution: {
        hourly: number[];
        daily: number[];
        weekly: number[];
    };
    patterns: Pattern[];
}

export interface AlertHistory {
    count: number;
    lastAlert: number;
}

export interface EventProcessingMetrics {
    processedEvents: number;
    averageProcessingTime: number;
    batchSize: number;
    correlationsFound: number;
    anomaliesDetected: number;
    alertsTriggered: number;
    patternMatches: number;
    storageStats: {
        totalStoredEvents: number;
        compressionRatio: number;
        oldestEvent: number;
        newestEvent: number;
    };
    performanceMetrics: {
        cpuUsage: number;
        memoryUsage: number;
        eventProcessingRate: number;
        batchProcessingTime: number;
    };
}

export interface EventStorageConfig {
    type: 'memory' | 'database';
    retention: {
        duration: number;  // en jours
        maxEvents: number;
        pruningStrategy: 'age' | 'count' | 'hybrid';
    };
    compression: {
        enabled: boolean;
        algorithm: 'gzip' | 'brotli';
        level: number;
    };
    encryption: {
        enabled: boolean;
        algorithm: string;
        keyRotation: boolean;
        keyRotationInterval: number;
    };
    backup: {
        enabled: boolean;
        interval: number;
        retention: number;
        location: string;
    };
}

export interface EventFilter {
    types?: string[];
    sources?: string[];
    targets?: string[];
    severities?: ('low' | 'medium' | 'high' | 'critical')[];
    timeRange?: {
        start: number;
        end: number;
    };
    context?: Partial<SecurityEvent['context']>;
    customFilters?: Record<string, unknown>;
}

export interface EventAggregation {
    groupBy: ('type' | 'source' | 'target' | 'severity')[];
    metrics: ('count' | 'average' | 'min' | 'max')[];
    timeWindow?: number;
    filters?: EventFilter;
}

export interface EventTransformation {
    type: 'enrich' | 'filter' | 'aggregate' | 'normalize';
    payload: Record<string, unknown>;
    priority: number;
    enabled: boolean;
}

export interface EventStreamConfig {
    batchSize: number;
    flushInterval: number;
    maxRetries: number;
    retryDelay: number;
    transformations: EventTransformation[];
    errorHandling: {
        ignoreErrors: boolean;
        maxErrors: number;
        errorCallback?: (error: Error, event: SecurityEvent) => Promise<void>;
    };
}