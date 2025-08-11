// types/index.ts
export interface SynchronizationFeatures {
    emotionalContent?: boolean;
    culturalSpecifics?: string[];
    targetAudience?: string[];
    contentType?: string;
    securityLevel?: number;
    metadata?: Record<string, unknown>;
}

export interface EthicsViolation {
    ruleId: string;
    message: string;
    priority: EthicsPriority;
    details?: Record<string, unknown>;
}

export interface EvidenceItem {
    type: string;
    result: EthicsResult | unknown;
}

export interface AuditTrailEntry {
    stage: string;
    timestamp: number;
    decision: EthicsDecision;
    validator: string;
    notes?: string;
}

// Énumérations de base
export enum EthicsPriority {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export enum EthicsDecision {
    APPROVED = 'approved',
    REJECTED = 'rejected',
    NEEDS_REVIEW = 'needs_review',
    ESCALATED = 'escalated'
}

export enum VoteType {
    APPROVE = 'approve',
    REJECT = 'reject',
    ABSTAIN = 'abstain',
    ESCALATE = 'escalate'
}

// Interfaces pour le contexte et les résultats
export interface EthicsContext {
    action: {
        type: string;
        target: string;
        parameters: Record<string, unknown>;
    };
    subject: {
        type: 'human' | 'ai' | 'system';
        id: string;
        roles: string[];
    };
    environment: {
        type: string;
        safety: {
            humanPresent: boolean;
            emergencyAccess: boolean;
            securityLevel: number;
        };
    };
    timestamp: number;
    metadata?: Record<string, unknown>;
}

export interface EthicsResult {
    decision: EthicsDecision;
    timestamp: number;
    context: EthicsContext;
    violations: EthicsViolation[];
    recommendations?: string[];
    metadata: {
        validatedBy: string[];
        auditId: string;
        processingTime: number;
        evidence?: Array<{
            type: string;
            result: unknown;
        }>;
        committee?: {
            reviewers: Array<{
                id: string;
                expertise: string[];
            }>;
            evidence: unknown[];
        };
        escalation?: {
            reason: string;
            originalDecision: EthicsDecision;
        };
    };
}

// Interfaces pour le comité d'éthique
export interface CommitteeMember {
    id: string;
    name: string;
    expertise: string[];
    active: boolean;
    votingWeight?: number;
    metadata?: {
        joinDate: number;
        reviewCount: number;
        performanceMetrics?: Record<string, number>;
    };
}

export interface Vote {
    memberId: string;
    decision: VoteType;
    timestamp: number;
    rationale?: string;
    concerns?: string[];
    recommendations?: string[];
    metadata?: Record<string, unknown>;
}

export interface VotingSession {
    id: string;
    caseId: string;
    startTime: number;
    endTime?: number;
    votes: Map<string, Vote>;
    status: 'active' | 'completed' | 'cancelled';
    result?: {
        decision: EthicsDecision;
        consensusLevel: number;
        dissenting: number;
    };
}

// Interfaces pour l'audit et la conformité
export interface EthicsAudit {
    id: string;
    timestamp: number;
    decision: EthicsDecision;
    context: EthicsContext;
    validators: string[];
    evidence: Array<{
        type: string;
        data: unknown;
        timestamp: number;
    }>;
    trail: Array<{
        stage: string;
        timestamp: number;
        decision?: EthicsDecision;
        validator: string;
        notes?: string;
    }>;
}

export interface ComplianceRequirement {
    id: string;
    type: 'gdpr' | 'safety' | 'cultural' | 'technical';
    description: string;
    validator: (context: EthicsContext) => Promise<boolean>;
    evidence: (context: EthicsContext) => Promise<Record<string, unknown>>;
}

// Interfaces pour les règles et validations
export interface EthicsRule {
    id: string;
    name: string;
    description: string;
    priority: EthicsPriority;
    category: 'asimov' | 'regulatory' | 'cultural' | 'safety';
    validate: (context: EthicsContext) => Promise<boolean>;
    onViolation?: (context: EthicsContext) => Promise<void>;
}

export interface ValidationMetrics {
    totalChecks: number;
    violations: number;
    majorViolations: number;
    criticalViolations: number;
    averageResponseTime: number;
    lastUpdate: number;
}

// Types pour la configuration
export interface CommitteeConfig {
    minRequiredMembers: number;
    consensusThreshold: number;
    maxReviewTimeMs: number;
    autoEscalationThreshold: number;
    votingTimeoutMs: number;
}

export interface AuditConfig {
    retentionPeriodDays: number;
    detailedLogging: boolean;
    automaticCleanup: boolean;
    backupFrequencyHours: number;
}

export interface ValidationConfig {
    strictMode: boolean;
    autoEscalation: boolean;
    parallelValidation: boolean;
    timeoutMs: number;
    retryCount: number;
}

// Types pour les événements
export type EthicsEvent = {
    type: 'validation' | 'review' | 'audit' | 'compliance';
    severity: EthicsPriority;
    timestamp: number;
    source: string;
    details: Record<string, unknown>;
}

export type EthicsCallback = (event: EthicsEvent) => Promise<void>;

// Types pour les notifications
export interface EthicsNotification {
    id: string;
    type: 'alert' | 'warning' | 'info';
    message: string;
    timestamp: number;
    recipients: string[];
    metadata?: Record<string, unknown>;
    acknowledgmentRequired: boolean;
}

/**
 * Ethics system type definitions
 */

/**
 * Levels of human supervision required for AI tasks
 */
export enum SupervisionLevel {
    /**
     * No human supervision required, fully automated
     */
    AUTOMATED = 'AUTOMATED',

    /**
     * Minimal human oversight, mainly for statistical sampling
     */
    MINIMAL = 'MINIMAL',

    /**
     * Partial supervision focused on specific aspects
     */
    PARTIAL = 'PARTIAL',

    /**
     * Review focused on ethical aspects only
     */
    ETHIC_REVIEW = 'ETHIC_REVIEW',

    /**
     * Complete human supervision of all aspects
     */
    FULL = 'FULL'
}

/**
 * Ethical validation result
 */
export interface EthicalValidationResult {
    /**
     * Whether the validation passed
     */
    valid: boolean;

    /**
     * Validation score (0-1)
     */
    score?: number;

    /**
     * Issues found during validation
     */
    issues?: Array<{
        code: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        recommendation?: string;
    }>;

    /**
     * ID of the validator that performed the validation
     */
    validatorId?: string;

    /**
     * Timestamp of the validation
     */
    timestamp: number;
}

/**
 * Ethical rule definition
 */
export interface EthicalRule {
    /**
     * Rule ID
     */
    id: string;

    /**
     * Rule description
     */
    description: string;

    /**
     * Rule severity
     */
    severity: 'warning' | 'error';

    /**
     * Category of the rule
     */
    category: string;

    /**
     * Whether violation of this rule can be automatically corrected
     */
    autoCorrectible: boolean;
}