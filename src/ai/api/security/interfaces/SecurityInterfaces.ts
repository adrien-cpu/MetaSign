// src/ai/api/security/interfaces/SecurityInterfaces.ts

// src/ai/api/security/interfaces/SecurityInterfaces.ts

import {
    APIRequest,
    BehaviorAnalysis,
    SecurityViolation,
    RateLimitContext,
    ComplianceViolation,
    CriticalViolationContext,
    SuspiciousActivity,
    ThreatPattern,
    ThreatData,
    SecurityControlContext,
    DataProcessingResult,
    SecurityAlert,
    AuditLogRequest,
    CertificateValidationParams,
    CertValidationResult,
    RevocationResult,
    APIKeyValidationResult,
    SecurityPolicy,
    PolicyChangeEvent
} from '@security/types/SecurityTypes';

// Le reste du fichier reste inchangé

export interface RateLimiter {
    getRecentRequests(context: RateLimitContext): Promise<number>;
    incrementRequests(context: RateLimitContext): Promise<void>;
    resetRequests(identifier: string): Promise<void>;
}

export interface SecurityAuditor {
    logViolations(violations: SecurityViolation[]): Promise<void>;
    logRequest(request: AuditLogRequest): Promise<void>;
    reportViolations(violations: SecurityViolation[]): Promise<void>;
}

export interface SecurityBehaviorAnalyzer {
    analyzeRequest(request: APIRequest): Promise<BehaviorAnalysis>;
    updateBehaviorProfile(analysis: BehaviorAnalysis): Promise<void>;
}

export interface SecurityComplianceValidator {
    validateRequest(request: APIRequest): Promise<ComplianceValidationResult>;
}

export interface ComplianceValidationResult {
    compliant: boolean;
    violations: ComplianceViolation[];
}

export interface SecurityRecoveryManager {
    handleCriticalViolation(context: CriticalViolationContext): Promise<void>;
}

export interface SecurityEventMonitor {
    recordViolations(violations: SecurityViolation[]): Promise<void>;
    recordSuspiciousActivity(activity: SuspiciousActivity): Promise<void>;
}

export interface SecurityThreatIntelligence {
    updatePatterns(patterns: ThreatPattern[]): Promise<void>;
    updateThreatData(data: ThreatData): Promise<void>;
}

export interface SecurityPerimeterManager {
    adjustSecurityControls(context: SecurityControlContext): Promise<void>;
}

export interface SecureDataHandler {
    processRequest(request: APIRequest): Promise<DataProcessingResult>;
}

export interface NotificationService {
    sendSecurityAlert(alert: SecurityAlert): Promise<void>;
}

export interface SecurityMutualAuthenticationManager {
    validateCertificate(params: CertificateValidationParams): Promise<CertValidationResult>;
    checkRevocationStatus(cert: string): Promise<RevocationResult>;
    validateTrustChain(cert: string): Promise<boolean>;
    validateAPIKey(key: string): Promise<APIKeyValidationResult>;
}

export interface SecurityConfigurationManager {
    loadPolicies(): Promise<SecurityPolicy[]>;
    savePolicies(policies: SecurityPolicy[]): Promise<void>;
}

export interface AuditTrailManager {
    logPolicyChange(event: PolicyChangeEvent): Promise<void>;
    logError(data: { component: string; error: Error; context: Record<string, unknown> }): Promise<void>;
}