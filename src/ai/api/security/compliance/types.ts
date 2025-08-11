//src/ai/api/security/compliance/types.ts

export interface DataProcessingRecord {
    userId: string;
    dataType: string;
    purpose: string;
    processingType: 'collection' | 'storage' | 'analysis' | 'transfer' | 'deletion';
    location: string;
    retention: number;
    legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
}

export interface DataRecord {
    timestamp: number;
    purpose: string;
    retention: number;
    consent?: UserConsent;
    processingHistory: ProcessingEvent[];
    metadata: Record<string, unknown>;
}

export interface UserConsent {
    userId: string;
    dataType: string;
    purpose: string[];
    grantedAt: number;
    expiresAt: number;
    valid: boolean;
    withdrawnAt?: number;
    proofOfConsent: string;
    version: string;
}

export interface ProcessingEvent {
    type: 'access' | 'modification' | 'deletion' | 'transfer';
    timestamp: number;
    actor: string;
    details: Record<string, unknown>;
}

export interface DataRequest {
    type: 'access' | 'deletion' | 'rectification' | 'portability';
    userId: string;
    dataTypes?: string[];
    format?: 'json' | 'xml' | 'csv';
    reason?: string;
    urgency?: boolean;
}

export interface DataBreach {
    description: string;
    detectedAt: number;
    reportedAt: number;
    dataTypes: string[];
    affectedUsers?: string[];
    exposureType?: 'internal' | 'external' | 'public';
    duration?: number; // heures
    containmentStatus: 'contained' | 'ongoing' | 'unknown';
    impact: {
        financial?: number;
        reputation?: 'low' | 'medium' | 'high';
        operational?: 'low' | 'medium' | 'high';
    };
    remediation: {
        steps: string[];
        completedSteps: string[];
        estimatedCompletion?: number;
    };
}

export interface RegulationRequirement {
    id: string;
    regulation: string;
    section: string;
    description: string;
    controls: string[];
    evidenceRequired: string[];
    auditFrequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

export interface ComplianceAuditResult {
    requirement: RegulationRequirement;
    compliant: boolean;
    evidence: string[];
    findings: {
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        recommendation: string;
    }[];
    nextAuditDue: number;
}

export interface ConsentManagementSettings {
    expirationPeriod: number;
    requireExplicitRenewal: boolean;
    allowBulkConsent: boolean;
    consentVersioning: boolean;
    proofRequired: boolean;
    minAge: number;
    languages: string[];
}

export interface ComplianceNotification {
    type: 'breach' | 'violation' | 'audit' | 'consent' | 'request';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: number;
    recipients: string[];
    requiresAcknowledgement: boolean;
    attachments?: {
        name: string;
        type: string;
        content: string;
    }[];
}

export interface DataRetentionPolicy {
    dataType: string;
    retentionPeriod: number;
    basis: 'legal' | 'business' | 'consent';
    archiveAfter?: number;
    deleteAfter: number;
    exceptions?: {
        condition: string;
        extendedPeriod: number;
    }[];
}

export interface ComplianceTraining {
    id: string;
    title: string;
    description: string;
    targetAudience: string[];
    frequency: 'once' | 'monthly' | 'quarterly' | 'annually';
    duration: number;
    materials: string[];
    quiz?: {
        questions: {
            text: string;
            options: string[];
            correctAnswer: number;
        }[];
        passingScore: number;
    };
    certificationValid: number; // jours
}

export interface DataProcessingAgreement {
    id: string;
    parties: {
        controller: string;
        processor: string;
    };
    startDate: number;
    endDate?: number;
    dataCategories: string[];
    purposes: string[];
    security: {
        measures: string[];
        certifications: string[];
        audits: {
            frequency: string;
            lastAudit?: number;
            nextAudit?: number;
        };
    };
    subProcessors: {
        name: string;
        purpose: string;
        location: string;
        approved: boolean;
    }[];
}