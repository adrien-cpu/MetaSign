// src/ai/api/monitoring/alerts/types.ts

export interface Alert {
    id: string;
    severity: AlertSeverity;
    message: string;
    timestamp: number;
    source: string;
    metadata: AlertMetadata;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AlertMetadata {
    component: string;
    subSystem: string;
    details: Record<string, unknown>;
}

export interface EscalationLevel {
    id: string;
    name: string;
    priority: number;
    notify(alert: Alert): Promise<boolean>;
}

export interface EscalationConfig {
    levels: EscalationLevel[];
    maxRetries: number;
}