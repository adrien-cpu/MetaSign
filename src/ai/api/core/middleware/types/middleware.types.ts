import { IAPIContext } from '@api/core/types';
import { IMiddleware, IMiddlewareChain, NextFunction } from '../interfaces';

/**
 * Niveaux de menace pour la détection d'intrusion
 */
export enum ThreatLevel {
    NONE = 'none',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * Types d'intrusion détectables
 */
export enum IntrusionType {
    SUSPICIOUS_PATTERN = 'suspicious_pattern',
    XSS_ATTEMPT = 'xss_attempt',
    SQL_INJECTION = 'sql_injection',
    DIRECTORY_TRAVERSAL = 'directory_traversal',
    COMMAND_INJECTION = 'command_injection',
    AUTHENTICATION_BYPASS = 'authentication_bypass',
    DATA_EXFILTRATION = 'data_exfiltration',
    UNUSUAL_BEHAVIOR = 'unusual_behavior'
}

/**
 * Résultat d'une détection d'intrusion
 */
export interface IntrusionDetectionResult {
    threatDetected: boolean;
    threatLevel: ThreatLevel;
    intrusionType: IntrusionType | undefined;
    confidence: number;
    detectionTime: number;
    details: Record<string, unknown> | undefined;
}

/**
 * Interface pour les systèmes de détection d'intrusion
 */
export interface IIntrusionDetectionSystem {
    detectIntrusion(requestData: unknown): Promise<IntrusionDetectionResult>;
    getLastDetectionResult(): Promise<IntrusionDetectionResult | null>;
}

/**
 * Configuration de sécurité globale
 */
export interface SecurityConfig {
    // Options d'activation des middlewares
    enableRateLimiting: boolean;
    validateTokens: boolean;
    detailedErrors: boolean;
    enableComplianceChecks: boolean;
    enableBehaviorAnalysis: boolean;
    enableIntrusionDetection: boolean;
    enableDataSanitization: boolean;
    enableEncryption: boolean;
    enableAudit: boolean;
    enableAuditing?: boolean; // Pour rétrocompatibilité
    enableSecurityHeaders?: boolean; // Nouveau champ pour contrôler l'activation des en-têtes de sécurité

    // Configurations spécifiques aux middlewares
    rateLimiting?: RateLimitConfig;
    authentication?: AuthenticationConfig;
    securityHeaders?: SecurityHeadersConfig; // Modifié: maintenant un objet, pas un boolean
    errorHandler?: ErrorHandlerConfig;
    intrusionDetection?: IntrusionDetectionConfig;
    dataSanitization?: DataSanitizationConfig;
}

// Exporter de façon typée pour isolatedModules
export type { IAPIContext, IMiddleware, IMiddlewareChain, NextFunction };

/**
 * Type pour les fonctions de fabrique de middleware
 */
export type MiddlewareFactory<T extends Record<string, unknown> = Record<string, unknown>> =
    (options?: T) => IMiddleware;

/**
 * Options communes à tous les middlewares
 */
export interface MiddlewareOptions {
    /**
     * Indique si le middleware est actif
     * @default true
     */
    enabled?: boolean;

    /**
     * Niveau de journalisation
     * @default 'info'
     */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Options pour créer une chaîne de middlewares
 */
export interface MiddlewareChainOptions {
    /**
     * Nom de la chaîne pour le logging
     */
    name?: string;

    /**
     * Indique si la chaîne est activée
     */
    enabled?: boolean;
}

/**
 * Enumération des types d'erreurs de sécurité
 */
export enum SecurityErrorType {
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    RATE_LIMIT = 'RATE_LIMIT',
    INTRUSION = 'INTRUSION',
    BEHAVIOR = 'BEHAVIOR',
    COMPLIANCE = 'COMPLIANCE',
    DATA_VALIDATION = 'DATA_VALIDATION',
    ENCRYPTION = 'ENCRYPTION',
    GENERAL = 'GENERAL'
}

/**
 * Interface pour les erreurs de sécurité
 */
export interface SecurityError {
    /**
     * Code d'erreur unique
     */
    code: string;

    /**
     * Message d'erreur
     */
    message: string;

    /**
     * Statut HTTP correspondant
     */
    statusCode: number;

    /**
     * Niveau de gravité
     */
    severity: 'low' | 'medium' | 'high' | 'critical';

    /**
     * Type d'erreur de sécurité
     */
    type?: SecurityErrorType;

    /**
     * Détails supplémentaires
     */
    details?: Record<string, unknown>;

    /**
     * Erreur d'origine
     */
    originalError?: Error;

    /**
     * Convertit l'erreur en message d'erreur sécurisé pour l'utilisateur final
     */
    toSafeMessage(): string;
}

/**
 * Énumération des types de middlewares standards
 */
export enum MiddlewareType {
    REQUEST_ID = 'request-id',
    AUTHENTICATION = 'authentication',
    RATE_LIMITING = 'rate-limiting',
    SECURITY_HEADERS = 'security-headers',
    ERROR_HANDLER = 'error-handler',
    INTRUSION_DETECTION = 'intrusion-detection',
    BEHAVIOR_ANALYSIS = 'behavior-analysis',
    COMPLIANCE = 'compliance',
    DATA_SANITIZATION = 'data-sanitization',
    ENCRYPTION = 'encryption',
    AUDIT = 'audit'
}

/**
 * Configuration du middleware de limitation de débit
 */
export interface RateLimitConfig {
    defaultLimit: number;
    windowMs: number;
    pathLimits: Record<string, number>;
}

/**
 * Configuration du middleware d'authentification
 */
export interface AuthenticationConfig {
    publicPaths: string[];
    tokenLocation?: 'header' | 'cookie' | 'query';
    tokenName?: string;
}

/**
 * Configuration du middleware des en-têtes de sécurité
 */
export interface SecurityHeadersConfig {
    hsts: {
        enabled: boolean;
        maxAge: number;
        includeSubDomains: boolean;
        preload: boolean;
    };
    csp?: {
        enabled: boolean;
        directives: Record<string, string[]>;
        reportOnly?: boolean;
    };
    noSniff: boolean;
    frameOptions: 'DENY' | 'SAMEORIGIN' | false;
    xssProtection: boolean;
    referrerPolicy: string;
    cacheControl?: {
        enabled: boolean;
        value: string;
    };
}

/**
 * Configuration du middleware de gestion des erreurs
 */
export interface ErrorHandlerConfig {
    includeErrorDetails: boolean;
    includeStackTrace: boolean;
    defaultStatusCode: number;
    defaultErrorMessage: string;
}

/**
 * Configuration du middleware de détection d'intrusion
 */
export interface IntrusionDetectionConfig {
    enableSignatureDetection: boolean;
    enableAnomalyDetection: boolean;
    signatureDatabase: string;
    alertThreshold: number;
    actions: Array<'log' | 'block' | 'alert'>;
}

/**
 * Configuration du middleware d'analyse comportementale
 */
export interface BehaviorAnalysisConfig {
    sessionProfilingEnabled: boolean;
    userProfilingEnabled: boolean;
    anomalyThreshold: number;
    learningPeriod: number;
}

/**
 * Configuration du middleware de conformité
 */
export interface ComplianceConfig {
    regulations: Array<'GDPR' | 'HIPAA' | 'PCI-DSS' | 'CCPA'>;
    strictMode: boolean;
    auditingEnabled: boolean;
}

/**
 * Configuration du middleware d'assainissement des données
 */
export interface DataSanitizationConfig {
    enableHtmlSanitization: boolean;
    enableSqlSanitization: boolean;
    allowedHtmlTags?: string[];
    strictMode: boolean;
}

/**
 * Configuration du middleware de chiffrement
 */
export interface EncryptionConfig {
    algorithm: string;
    keySize: number;
    encryptRequestBody: boolean;
    encryptResponseBody: boolean;
    encryptHeaders: string[];
}

/**
 * Configuration du middleware d'audit
 */
export interface AuditConfig {
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    includeSensitiveData: boolean;
    storageLocation: 'memory' | 'file' | 'database';
    retentionPeriod: number;
}

/**
 * Options pour la création d'une chaîne de middlewares personnalisée
 */
export interface MiddlewareChainConfig {
    chainName?: string;
    enableRequestId?: boolean;
    enableAuthentication?: boolean;
    enableRateLimiting?: boolean;
    enableSecurityHeaders?: boolean;
    enableErrorHandler?: boolean;
    enableIntrusionDetection?: boolean;
    enableBehaviorAnalysis?: boolean;
    enableCompliance?: boolean;
    enableDataSanitization?: boolean;
    enableEncryption?: boolean;
    enableAudit?: boolean;
}

/**
 * Options pour le middleware SecurityHeadersMiddleware
 */
export interface SecurityHeadersOptions {
    hsts: {
        enabled: boolean;
        maxAge: number;
        includeSubDomains: boolean;
        preload: boolean;
    };
    csp?: {
        enabled: boolean;
        directives: Record<string, string[]>;
        reportOnly?: boolean;
    };
    noSniff: boolean;
    frameOptions: 'DENY' | 'SAMEORIGIN' | false;
    xssProtection: boolean;
    referrerPolicy: string;
    cacheControl?: {
        enabled: boolean;
        value: string;
    };
}

/**
 * Types de règles de conformité
 */
export type ComplianceRuleSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Règle de conformité
 */
export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    severity: ComplianceRuleSeverity;
}

/**
 * Ensemble de règles de conformité
 */
export interface ComplianceRuleSet {
    id: string;
    name: string;
    version: string;
    type: string;
    rules: ComplianceRule[];
}

/**
 * Résultat de validation de conformité
 */
export interface ComplianceValidationResult {
    isCompliant: boolean;
    timestamp: number;
    validatedRules: string[];
    violations: string[];
    details: Record<string, unknown>;
}

/**
 * Interface pour les validateurs de conformité
 */
export interface IComplianceValidator {
    validateCompliance(
        data: unknown,
        context: Record<string, unknown>
    ): Promise<ComplianceValidationResult>;

    getRuleSet(type: string): Promise<ComplianceRuleSet>;
}

// Ajouter ces types à la fin du fichier middleware.types.ts

/**
 * Motif de comportement avec fréquence
 */
export interface BehaviorPattern {
    pattern: string;
    frequency: number;
}

/**
 * Distribution de requêtes par période
 */
export interface RequestDistribution {
    byHour: Array<{ hour: number; count: number }>;
    byDay: Array<{ day: number; count: number }>;
}

/**
 * Profil de comportement utilisateur
 */
export interface UserBehaviorProfile {
    userId: string;
    createdAt: number;
    lastUpdatedAt: number;
    totalRequests: number;
    commonPatterns: BehaviorPattern[];
    requestDistribution: RequestDistribution;
}

/**
 * Interface pour l'analyseur de comportement
 */
export interface IBehaviorAnalyzer {
    analyzeRequest(userId: string, requestData: unknown): Promise<BehaviorAnalysisResult>;
    getUserProfile(userId: string): Promise<UserBehaviorProfile | null>;
    analyzeBehavior(profile: UserBehaviorProfile, currentActivity: unknown): Promise<BehaviorAnalysisResult>;
    getUserAnomalies(userId: string, timeRange?: { start: number; end: number }): Promise<BehaviorAnalysisResult[]>;
    getHighRiskUsers(threshold: number): Promise<string[]>;
    cleanup(olderThan: number): Promise<void>;
}

/**
 * Résultat d'analyse de comportement
 */
export interface BehaviorAnalysisResult {
    userId: string;
    timestamp: number;
    isAnomaly: boolean;
    anomalyScore: number;
    confidence: number;
    patterns: string[];
    details: Record<string, unknown> | undefined;
}

// Étendre le type SecurityContext pour inclure userId
export interface SecurityContext {
    userId?: string;
    intrusionDetection?: IntrusionDetectionResult;
    behaviorAnalysis?: BehaviorAnalysisResult;
    complianceValidation?: ComplianceValidationResult;
    [key: string]: unknown;
}

// Types pour l'audit de sécurité
export interface SecurityAuditRequest {
    method: string;
    path: string;
    headers: Record<string, string | string[] | undefined>;
    ip?: string;
    timestamp: string;
    query?: Record<string, unknown>;
    body?: unknown;
    userId?: string;
    [key: string]: unknown;
}

export interface SecurityAuditResponse {
    request: SecurityAuditRequest;
    status: number;
    duration: number;
    timestamp: string;
    headers?: Record<string, string | string[] | undefined>;
    body?: unknown;
    [key: string]: unknown;
}

export interface SecurityAuditError {
    request: SecurityAuditRequest;
    error: {
        message: string;
        name: string;
        stack?: string;
        [key: string]: unknown;
    };
    duration: number;
    timestamp: string;
    [key: string]: unknown;
}

export interface SecurityIncident {
    type: string;
    severity: string;
    details: Record<string, unknown>;
    [key: string]: unknown;
}

export interface ISecurityAuditor {
    logRequest(requestData: SecurityAuditRequest): Promise<void>;
    logResponse(responseData: SecurityAuditResponse): Promise<void>;
    logError(errorData: SecurityAuditError): Promise<void>;
    logSecurityIncident(incident: SecurityIncident): Promise<void>;
}