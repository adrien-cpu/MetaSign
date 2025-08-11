// src/ai/api/security/types/perimeter-types.ts

import { SecurityContext } from '@security/types/SecurityTypes';

// Types de base
export type ParameterValue = string | number | boolean | null | ParameterValue[] | { [key: string]: ParameterValue };
export type ParameterMap = Record<string, ParameterValue>;

// Interfaces principales
export interface SecurityZone {
    id: string;
    name: string;
    level: number;  // 0 = public, 1-10 = niveaux de sécurité croissants
    parent?: string;
    children: string[];
    rules: AccessRule[];
    isolationLevel: 'none' | 'partial' | 'full';
    allowedProtocols: string[];
    restrictions: ZoneRestriction[];
    monitoring: MonitoringConfig;
}

export interface AccessRule {
    id: string;
    type: 'allow' | 'deny';
    priority: number;
    conditions: AccessCondition[];
    timeRestrictions?: TimeRestriction[];
    expiresAt?: number;
    action: AccessAction;
}

export interface AccessCondition {
    type: 'role' | 'permission' | 'ip' | 'device' | 'time' | 'location' | 'custom';
    parameters: ParameterMap;
    evaluate: (context: SecurityContext) => Promise<boolean>;
}

export interface AccessAction {
    type: 'permit' | 'deny' | 'challenge' | 'log' | 'quarantine';
    parameters: ParameterMap;
}

export interface TimeRestriction {
    daysOfWeek: number[];
    startTime: string;  // format: "HH:mm"
    endTime: string;    // format: "HH:mm"
    timezone: string;
}

export interface ZoneRestriction {
    type: 'network' | 'device' | 'data' | 'protocol';
    rules: ParameterMap;
}

export interface MonitoringConfig {
    logLevel: 'debug' | 'info' | 'warning' | 'error';
    metrics: string[];
    alertThresholds: Record<string, number>;
    retention: number;  // en jours
}

export interface AccessRequest {
    source: {
        zone: string;
        endpoint: string;
    };
    target: {
        zone: string;
        resource: string;
    };
    context: SecurityContext;
    operation: string;
}

export interface AccessResult {
    allowed: boolean;
    reason?: string;
    conditions?: ParameterMap;
    auditTrail: {
        rules: string[];
        decisions: string[];
        timestamp: number;
    };
}

export interface ZoneTransition {
    from: string;
    to: string;
    allowed: boolean;
    restrictions?: ZoneRestriction[];
}

export interface SecurityPerimeter {
    zones: Map<string, SecurityZone>;
    transitions: Map<string, ZoneTransition>;
    defaultZone: string;
}

// Erreur personnalisée pour le périmètre de sécurité
export class PerimeterError extends Error {
    constructor(message: string, public code: string, public details?: unknown) {
        super(message);
        this.name = 'PerimeterError';
    }
}

// Types manquants pour les rapports de sécurité
export interface SecurityReport {
    id: string;
    generatedAt: number;
    period: {
        startTime: Date;
        endTime: Date;
    };
    summary: {
        totalAccesses: number;
        allowedAccesses: number;
        deniedAccesses: number;
        zones: {
            id: string;
            name: string;
            accessCount: number;
            deniedCount: number;
            topUsers: Array<{ userId: string; accessCount: number }>;
        }[];
    };
    anomalies: {
        count: number;
        items: Array<{
            timestamp: number;
            zoneId: string;
            userId: string;
            type: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            details: ParameterMap;
        }>;
    };
    recommendations: string[];
}

export interface ZoneSecurityProfile {
    zoneId: string;
    zoneName: string;
    securityLevel: number;
    accessPatterns: {
        daily: number[];
        weekly: number[];
        byHour: number[];
    };
    topUsers: Array<{ userId: string; accessCount: number }>;
    topResources: Array<{ resourceId: string; accessCount: number }>;
    averageProcessingTime: number;
    ruleEffectiveness: {
        ruleId: string;
        triggerCount: number;
        effectiveness: number;
    }[];
    vulnerabilities: {
        count: number;
        items: Array<{
            type: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            description: string;
            recommendation: string;
        }>;
    };
}

export interface ThreatIntelligenceReport {
    id: string;
    generatedAt: number;
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    overview: {
        attackAttempts: number;
        uniqueAttackers: number;
        compromisedAccounts: number;
        dataExfiltrationAttempts: number;
    };
    recentThreats: Array<{
        timestamp: number;
        type: string;
        zoneId: string;
        sourceIp?: string;
        userId?: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        details: ParameterMap;
    }>;
    threatPatterns: {
        byTime: number[];
        byZone: Array<{ zoneId: string; count: number }>;
        byType: Array<{ type: string; count: number }>;
    };
    recommendations: string[];
}

export interface AccessLogEntry {
    timestamp: number;
    request: AccessRequest;
    result: AccessResult;
    processingTime: number;
    userId: string;
    sourceIp?: string;
    userAgent?: string;
    sessionId?: string;
    anomalyFlags?: string[];
}