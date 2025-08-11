/**
 * Fichier centralisé des types de sécurité pour l'ensemble du système API
 * Contient toutes les interfaces et types nécessaires aux composants de sécurité
 */

/**
 * Types fondamentaux et énumérations
 */
export type StoreType = 'memory' | 'redis';
export type SecuritySeverity = 'low' | 'medium' | 'high';
export type PolicyEventType = 'CREATE' | 'UPDATE' | 'DELETE';
export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Niveaux de confiance pour les habilitations de sécurité
 */
export type ClearanceLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'secret';

/**
 * Sévérité des données sensibles
 */
export type SensitivitySeverity = 'low' | 'medium' | 'high';

/**
 * Types de sévérité pour les événements de sécurité
 */
export enum SecurityEventSeverity {
    DEBUG = 'debug',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

/**
 * Types de menaces de sécurité
 */
export enum ThreatType {
    BRUTE_FORCE = 'brute_force',
    INJECTION = 'injection',
    XSS = 'xss',
    CSRF = 'csrf',
    DOS = 'dos',
    DATA_LEAK = 'data_leak',
    UNAUTHORIZED_ACCESS = 'unauthorized_access',
    SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

/**
 * Niveaux de menace pour la détection d'intrusion
 */
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Types d'anomalies comportementales
 */
export type AnomalyType =
    | 'UNUSUAL_TIME'
    | 'UNUSUAL_LOCATION'
    | 'UNUSUAL_FREQUENCY'
    | 'UNUSUAL_PATTERN'
    | 'UNUSUAL_RESOURCE_ACCESS'
    | 'CREDENTIAL_STUFFING'
    | 'ACCOUNT_TAKEOVER';

/**
 * ========================================
 * Interfaces liées aux requêtes et au rate limiting
 * ========================================
 */

export interface RateLimitContext {
    identifier: string;
    limit: number;
    window: number;
    storeType?: StoreType;
}

export interface APIRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: unknown;
    query?: Record<string, string>;
    ip: string;
    timestamp: number;
    userId?: string;
    clientId?: string;
    token?: string;
    geoLocation?: GeoLocation;
    dataCategories?: string[];
    encryptedData?: string;
}

/**
 * Localisation géographique
 */
export interface GeoLocation {
    country: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
}

/**
 * ========================================
 * Interfaces liées à l'analyse comportementale
 * ========================================
 */

export interface BehaviorAnalysis {
    requestId: string;
    userId?: string;
    ip: string;
    timestamp: number;
    patterns: {
        type: string;
        score: number;
        details?: string;
    }[];
    riskScore: number;
    anomalyDetected: boolean;
}

export interface RequestBehaviorData {
    userId: string;
    requestPath: string;
    requestMethod: string;
    timestamp: Date;
    ip: string;
    userAgent: string;
    geoLocation?: GeoLocation;
    previousRequests?: number;
}

export interface BehaviorAnalysisResult {
    anomalyDetected: boolean;
    anomalyType?: AnomalyType;
    anomalyConfidence: number;
    baseline?: Record<string, unknown>;
    details: string;
    riskScore: number;
}

/**
 * ========================================
 * Interfaces liées aux violations et à la conformité
 * ========================================
 */

export interface SecurityViolation {
    rule: string;
    description: string;
    severity: SecuritySeverity;
    context: Record<string, unknown>;
    timestamp: number;
}

export interface ComplianceViolation {
    rule: string;
    description: string;
    severity: SecuritySeverity;
}

export interface CriticalViolationContext {
    ip: string;
    timestamp: number;
    requestContext: Record<string, unknown>;
}

export interface ComplianceValidationResult {
    compliant: boolean;
    issues: string[];
    regulations: string[];
    riskLevel: SecurityLevel;
}

export interface ComplianceValidationInput {
    userId?: string;
    endpoint: string;
    data: unknown;
    method: string;
    dataCategories: string[];
}

export interface ComplianceMetrics {
    totalViolations: number;
    violationsByRegulation: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    complianceRate: number;
    dataRetentionRate: number;
    consentRate: number;
}

/**
 * ========================================
 * Interfaces liées aux menaces et aux activités suspectes
 * ========================================
 */

export interface SuspiciousActivity {
    request: APIRequest;
    analysis: BehaviorAnalysis;
    timestamp: number;
}

export interface ThreatPattern {
    type: string;
    pattern: string;
    severity: SecuritySeverity;
    timestamp: number;
}

export interface ThreatData {
    ip: string;
    behavior: BehaviorAnalysis;
    timestamp: number;
}

export interface SecurityControlContext {
    ip: string;
    threatLevel: SecuritySeverity;
}

export interface RequestAnalysisResult {
    threatDetected: boolean;
    threatLevel: ThreatLevel;
    details: string;
    signatures?: string[];
    confidence: number;
    mitigationSuggested?: boolean;
    mitigationAction?: string;
}

/**
 * ========================================
 * Interfaces liées aux résultats de traitement
 * ========================================
 */

export interface DataProcessingResult {
    success: boolean;
    data?: unknown;
    error?: string;
}

/**
 * ========================================
 * Interfaces liées aux données sensibles
 * ========================================
 */

export interface SensitiveDataType {
    type: string;
    severity: SensitivitySeverity;
    field?: string;
    pattern?: string;
}

export interface SensitiveDataCheckResult {
    containsSensitiveData: boolean;
    dataTypes: SensitiveDataType[];
    redactionSuggested?: boolean;
}

export interface SanitizationOptions {
    sanitizeHtml: boolean;
    preventSqlInjection: boolean;
    preventScriptInjection: boolean;
    preventCommandInjection: boolean;
    maxDepth: number;
    maxLength: number;
}

/**
 * ========================================
 * Interfaces liées aux alertes et à l'audit
 * ========================================
 */

export interface SecurityAlert {
    type: string;
    violations?: SecurityViolation[];
    timestamp: number;
}

export interface AuditLogRequest {
    timestamp: number;
    request: {
        method: string;
        path: string;
        headers: Record<string, string>;
        ip: string;
    };
    response: {
        status: number;
        headers: Record<string, string>;
    };
    violations: SecurityViolation[];
    context?: Record<string, unknown>;
}

export interface SecurityIncidentInfo {
    requestId: string;
    errorType: string;
    timestamp: Date;
    endpoint: string;
    userId: string;
    ip: string;
    details?: Record<string, unknown>;
}

export interface RequestAuditInfo {
    requestId: string;
    userId: string;
    endpoint: string;
    method: string;
    ip: string;
    userAgent: string;
    timestamp: Date;
    securityLevel: SecurityLevel;
    headers?: Record<string, string>;
}

export interface ResponseAuditInfo {
    requestId: string;
    statusCode: number;
    responseTime: number;
    encrypted: boolean;
    timestamp: Date;
}

export interface SensitiveDataExposureInfo {
    requestId: string;
    endpoint: string;
    dataTypes: SensitiveDataType[];
    timestamp: Date;
    userId: string;
}

export interface ComplianceIssueInfo {
    requestId: string;
    userId: string;
    endpoint: string;
    issues: string[];
    timestamp: Date;
}

export interface ThreatReportInfo {
    type: string;
    severity: ThreatLevel;
    details: string;
    source: string;
    timestamp: Date;
    requestId: string;
}

export interface AnomalyReportInfo {
    userId: string;
    anomalyType: AnomalyType;
    confidence: number;
    details: string;
    requestId: string;
}

/**
 * Options de configuration pour l'audit de sécurité
 */
export interface AuditOptions {
    /** Indique si les détails doivent être chiffrés */
    encryptDetails: boolean;

    /** Clé de chiffrement à utiliser */
    encryptionKey?: string;

    /** Durée de rétention des événements en jours */
    retentionPeriod: number;

    /** Taille maximale de la collection d'événements */
    maxEventsCount?: number;

    /** Indique si les événements critiques doivent être notifiés */
    notifyCriticalEvents?: boolean;

    /** URL du webhook pour les notifications */
    notificationWebhook?: string;
}

/**
 * ========================================
 * Interfaces liées à l'authentification et à la vérification
 * ========================================
 */

export interface CertificateValidationParams {
    certificate: string;
    timestamp: number;
}

export interface CertValidationResult {
    valid: boolean;
    error?: string;
    subject?: string;
    roles?: string[];
    permissions?: string[];
    expiration?: number;
    issuer?: string;
    serialNumber?: string;
}

export interface RevocationResult {
    revoked: boolean;
    reason?: string;
    timestamp?: number;
}

export interface APIKeyValidationResult {
    valid: boolean;
    error?: string;
    owner?: string;
    roles?: string[];
    permissions?: string[];
    keyId?: string;
    expiration?: number;
    quota?: number;
    rateLimit?: number;
    ipRestrictions?: string[];
}

export interface TokenValidationResult {
    valid: boolean;
    reason?: string;
    expired?: boolean;
    userId?: string;
    roles?: string[];
    permissions?: string[];
    issuedAt?: Date;
    expiresAt?: Date;
    issuer?: string;
    encryptionKey?: string;
    clearanceLevel?: ClearanceLevel;
    additionalClaims?: Record<string, unknown>;
}

/**
 * ========================================
 * Interfaces liées aux politiques de sécurité
 * ========================================
 */

export interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    rules: SecurityRule[];
    enabled: boolean;
    version: number;
    lastUpdated: Date;
}

export interface SecurityRule {
    id: string;
    type: string;
    condition: string;
    action: string;
    priority: number;
}

export interface SecurityContext {
    userId: string;
    operation: string;
    resource: string;
    [key: string]: unknown;
}

export interface PolicyChangeEvent {
    /** Identifiant du type d'événement (CREATE, UPDATE, DELETE, etc.) */
    eventType: PolicyEventType | 'create' | 'update' | 'delete' | 'enable' | 'disable';

    /** Identifiant de la politique */
    policyId: string;

    /** Horodatage de l'événement */
    timestamp: Date;

    /** Identifiant de l'utilisateur qui a effectué le changement */
    userId?: string;

    /** Type de politique modifiée */
    policyType?: string;

    /** Ancienne valeur (pour les modifications) */
    oldValue?: unknown;

    /** Nouvelle valeur */
    newValue?: unknown;

    /** Raison du changement */
    reason?: string;

    /** Approbateurs du changement */
    approvers?: string[];
}

/**
 * ========================================
 * Interface de base pour les interactions avec la base de données
 * ========================================
 */

export interface Database {
    /**
     * Insère un document dans une collection
     * @param collection Nom de la collection
     * @param document Document à insérer
     * @returns Identifiant du document inséré
     */
    insert<T>(collection: string, document: T): Promise<string>;

    /**
     * Recherche des documents dans une collection selon des critères
     * @param collection Nom de la collection
     * @param filter Critères de filtrage
     * @returns Documents correspondants
     */
    find<T>(collection: string, filter: Record<string, unknown>): Promise<T[]>;

    /**
     * Trouve un document unique dans une collection
     * @param collection Nom de la collection
     * @param filter Critères de filtrage
     * @returns Document correspondant ou null
     */
    findOne<T>(collection: string, filter: Record<string, unknown>): Promise<T | null>;

    /**
     * Met à jour des documents dans une collection
     * @param collection Nom de la collection
     * @param filter Critères de filtrage
     * @param update Modifications à appliquer
     * @returns Nombre de documents modifiés
     */
    updateMany(collection: string, filter: Record<string, unknown>, update: Record<string, unknown>): Promise<number>;

    /**
     * Supprime des documents dans une collection
     * @param collection Nom de la collection
     * @param filter Critères de filtrage
     * @returns Nombre de documents supprimés
     */
    deleteMany(collection: string, filter: Record<string, unknown>): Promise<number>;

    /**
     * Compte le nombre de documents dans une collection
     * @param collection Nom de la collection
     * @param filter Critères de filtrage optionnels
     * @returns Nombre de documents
     */
    count(collection: string, filter: Record<string, unknown>): Promise<number>;

    /**
     * Récupère les valeurs distinctes d'un champ
     * @param collection Nom de la collection
     * @param field Nom du champ
     * @returns Valeurs distinctes
     */
    distinct(collection: string, field: string): Promise<string[]>;
}

/**
 * ========================================
 * Interfaces liées aux événements de sécurité
 * ========================================
 */

export interface SecurityEvent {
    /** Identifiant unique de l'événement (généré automatiquement) */
    id?: string;

    /** Type de l'événement */
    type: string;

    /** Niveau de sévérité */
    severity: SecurityEventSeverity;

    /** Source de l'événement */
    source: string;

    /** Horodatage (généré automatiquement si non fourni) */
    timestamp?: Date;

    /** Identifiant de l'utilisateur concerné */
    userId?: string;

    /** Adresse IP source */
    ip?: string;

    /** Détails supplémentaires (potentiellement chiffrés) */
    details?: unknown;

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}

export interface DataAccessEvent {
    /** Identifiant de l'utilisateur */
    userId: string;

    /** Type de ressource accédée */
    resourceType: string;

    /** Identifiant de la ressource */
    resourceId: string;

    /** Type d'opération (lecture, écriture, suppression, etc.) */
    operation: 'read' | 'write' | 'delete' | 'export';

    /** Résultat de l'accès (succès, échec, etc.) */
    result: 'success' | 'failure' | 'denied';

    /** Raison d'échec ou de refus */
    reason?: string;

    /** Adresse IP */
    ip?: string;

    /** Détails supplémentaires */
    metadata?: Record<string, unknown>;
}

export interface ErrorEvent {
    /** Composant où l'erreur s'est produite */
    component: string;

    /** Erreur JavaScript */
    error: Error;

    /** Contexte lors de l'erreur */
    context?: Record<string, unknown>;

    /** État du système lors de l'erreur */
    systemState?: Record<string, unknown>;

    /** Gravité de l'erreur */
    criticality?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * ========================================
 * Interfaces liées au chiffrement et à la gestion des clés
 * ========================================
 */

export interface EncryptionResult {
    /** Données chiffrées */
    data: ArrayBuffer;

    /** Vecteur d'initialisation utilisé */
    iv: Uint8Array;
}

export interface KeyManager {
    /** Récupère une clé de chiffrement par son identifiant */
    getKey(keyId: string): Promise<string>;

    /** Génère une nouvelle clé de chiffrement */
    generateKey(): Promise<string>;

    /** Stocke une clé de chiffrement */
    storeKey(keyId: string, key: string): Promise<void>;

    /** Révoque une clé de chiffrement */
    revokeKey(keyId: string): Promise<void>;

    /** Vérifie si une clé est valide */
    isKeyValid(keyId: string): Promise<boolean>;
}

/**
 * ========================================
 * Interfaces liées à la conformité et à l'audit
 * ========================================
 */

export interface SecurityAuditor {
    logComplianceCheck(data: {
        timestamp: number;
        status: 'compliant' | 'non-compliant' | 'partially-compliant';
        violations: number;
        metrics: ComplianceMetrics;
    }): Promise<void>;

    logDataProcessing(data: {
        userId: string;
        dataType: string;
        purpose: string;
        timestamp: number;
    }): Promise<void>;

    logDataRequest(data: {
        type: string;
        userId: string;
        timestamp: number;
        status: string;
    }): Promise<void>;

    logError(data: {
        operation: string;
        error: string;
        context: Record<string, unknown>;
        timestamp: number;
    }): Promise<void>;

    logDataBreach(data: {
        breach: DataBreach;
        severity: 'low' | 'medium' | 'high' | 'critical';
        notifications: {
            authorities: boolean;
            users: number;
        };
        timestamp: number;
    }): Promise<void>;

    logAlert(data: {
        type: string;
        severity: string;
        details: Record<string, unknown>;
        timestamp: number;
    }): Promise<void>;

    logBatchProcessing(data: {
        eventsCount: number;
        analysis: Record<string, unknown>;
        timestamp: number;
    }): Promise<void>;

    logSecurityEvent(data: {
        type: string;
        severity: string;
        timestamp: Date;
        details: Record<string, unknown>;
        source: string;
        context: SecurityContext;
    }): Promise<void>;

    logRequest(info: RequestAuditInfo): Promise<void>;

    logResponse(info: ResponseAuditInfo): Promise<void>;

    logSecurityIncident(info: SecurityIncidentInfo): Promise<void>;

    logSensitiveDataExposure(info: SensitiveDataExposureInfo): Promise<void>;

    logComplianceIssue(info: ComplianceIssueInfo): Promise<void>;
}

export interface UserConsent {
    userId: string;
    dataType: string;
    purpose: string;
    granted: boolean;
    valid: boolean;
    timestamp: number;
    expiresAt: number;
}

export interface DataRecord {
    timestamp: number;
    purpose: string;
    retention: number;
    consent?: UserConsent;
}

export interface DataProcessingRecord {
    userId: string;
    dataType: string;
    purpose: string;
    data?: Record<string, unknown>;
}

export interface DataRequest {
    userId: string;
    type: 'access' | 'deletion' | 'rectification' | 'portability';
    dataTypes?: string[];
    requestId: string;
    timestamp: number;
}

export interface DataBreach {
    id: string;
    detectedAt: number;
    description: string;
    dataTypes?: string[];
    affectedUsers?: string[];
    exposureType?: 'internal' | 'external' | 'public';
    duration?: number; // en heures
    remediation?: string;
}