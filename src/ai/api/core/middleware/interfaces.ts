// src/ai/api/core/middleware/interfaces.ts
import {
    TokenValidationResult,
    ComplianceValidationResult,
    IntrusionDetectionResult,
    BehaviorAnalysisResult
} from '@api/core/types';
import { IAPIContext } from '@api/core/types';

/**
 * Options pour le middleware de sécurité
 */
export interface SecurityMiddlewareOptions {
    /** Clé secrète pour les tokens JWT */
    jwtSecret?: string;
    /** Algorithme de chiffrement */
    encryptionAlgorithm?: string;
    /** Taille de clé de chiffrement */
    keySize?: number;
    /** Indique si la validation de token est requise */
    validateTokens?: boolean;
    /** Limite de débit par défaut */
    defaultRateLimit?: number;
    /** Fenêtre de temps pour les limites de débit (ms) */
    rateLimitWindowMs?: number;
    /** Indique si les en-têtes de sécurité sont activés */
    securityHeadersEnabled?: boolean;
    /** Indique si la protection contre l'injection SQL est activée */
    preventSqlInjection?: boolean;
    /** Indique si la protection XSS est activée */
    preventXss?: boolean;
    /** Indique si la protection contre la traversée de chemin est activée */
    preventPathTraversal?: boolean;
    /** Indique si le blocage automatique est activé */
    autoBlock?: boolean;
    /** Durée de blocage automatique (ms) */
    blockDuration?: number;
    /** Indique si les notifications d'administrateur sont activées */
    notifyAdmin?: boolean;
    /** Indique si le mode préventif est activé */
    preventiveMode?: boolean;
    /** Indique si l'analyse des données sensibles est activée */
    sensitiveDataScan?: boolean;
    /** Indique si le chiffrement des réponses est activé */
    responseEncryption?: boolean;
    /** Niveau de journalisation */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Interface de base pour les middlewares
 */
export interface IMiddleware {
    process(context: IAPIContext, next: NextFunction): Promise<void>;
}

/**
 * Interface pour la chaîne de middlewares
 */
export interface IMiddlewareChain extends IMiddleware {
    use(middleware: IMiddleware): IMiddlewareChain;
    useIf(condition: boolean, middleware: IMiddleware): IMiddlewareChain;
    processAsync(context: IAPIContext): Promise<void>;
}

/**
 * Type pour la fonction next
 */
export type NextFunction = () => Promise<void>;

/**
 * Interface pour le service JWT
 */
export interface IJWTService {
    /**
     * Génère un token JWT
     */
    generateToken(payload: Record<string, unknown>, options?: Record<string, unknown>): Promise<string>;

    /**
     * Vérifie un token JWT
     */
    verifyToken(token: string): Promise<Record<string, unknown>>;

    /**
     * Décode un token JWT sans vérification
     */
    decodeToken(token: string): Record<string, unknown> | null;
}

/**
 * Interface pour le validateur de token
 */
export interface ITokenValidator {
    /**
     * Valide un token JWT
     */
    validate(token: string): Promise<TokenValidationResult>;
}

/**
 * Interface pour le service de chiffrement
 */
export interface IEncryptionService {
    /**
     * Chiffre des données
     */
    encrypt(data: string, key?: string): Promise<string>;

    /**
     * Déchiffre des données
     */
    decrypt(encryptedData: string, key?: string): Promise<string>;

    /**
     * Génère une clé de chiffrement
     */
    generateKey(): Promise<string>;
}

/**
 * Interface pour l'assainisseur de données
 */
export interface IDataSanitizer {
    /**
     * Assainit des données d'entrée
     */
    sanitize<T>(
        input: T,
        options?: Record<string, unknown>
    ): Promise<T>;
}

/**
 * Interface pour l'analyseur de comportement
 */
export interface ISecurityBehaviorAnalyzer {
    /**
     * Analyse le comportement d'une requête
     */
    analyzeRequest(
        userId: string,
        endpoint: string,
        method: string,
        ip: string,
        userAgent?: string,
        requestData?: Record<string, unknown>
    ): Promise<BehaviorAnalysisResult>;

    /**
     * Signale une anomalie
     */
    reportAnomaly(anomalyInfo: Record<string, unknown>): Promise<void>;
}

/**
 * Interface pour le système de détection d'intrusion
 */
export interface IIntrusionDetectionSystem {
    /**
     * Analyse une requête pour détecter des intrusions
     */
    analyzeRequest(
        requestInfo: Record<string, unknown>
    ): Promise<IntrusionDetectionResult>;

    /**
     * Signale une menace
     */
    reportThreat(threatInfo: Record<string, unknown>): Promise<void>;
}

/**
 * Interface pour le limiteur de débit
 */
export interface IRateLimiter {
    /**
     * Vérifie si une requête est autorisée
     */
    isAllowed(
        clientId: string,
        endpoint: string
    ): Promise<boolean>;

    /**
     * Enregistre une requête
     */
    recordRequest(
        clientId: string,
        endpoint: string
    ): Promise<void>;

    /**
     * Réinitialise les compteurs pour un client
     */
    resetCounters(clientId: string): Promise<void>;

    /**
     * Vérifie la limite (pour compatibilité)
     */
    checkLimit?(key: string, limit: number): {
        allowed: boolean;
        remaining: number;
        resetTime: number
    };

    /**
     * Incrémente le compteur (pour compatibilité)
     */
    incrementCounter?(): void;
}

/**
 * Interface pour l'auditeur de sécurité
 */
export interface ISecurityAuditor {
    /**
     * Enregistre un événement de sécurité
     */
    logSecurityEvent(eventType: string, details: Record<string, unknown>): Promise<void>;

    /**
     * Enregistre une requête
     */
    logRequest(requestInfo: Record<string, unknown>): Promise<void>;

    /**
     * Enregistre une réponse
     */
    logResponse(responseInfo: Record<string, unknown>): Promise<void>;

    /**
     * Enregistre une erreur
     */
    logError(errorInfo: Record<string, unknown>): Promise<void>;

    /**
     * Enregistre un incident de sécurité
     */
    logSecurityIncident(incidentInfo: Record<string, unknown>): Promise<void>;

    /**
     * Enregistre une exposition de données sensibles
     */
    logSensitiveDataExposure(exposureInfo: Record<string, unknown>): Promise<void>;

    /**
     * Enregistre un problème de conformité
     */
    logComplianceIssue(issueInfo: Record<string, unknown>): Promise<void>;
}

/**
 * Interface pour le validateur de conformité
 */
export interface IComplianceValidator {
    /**
     * Valide la conformité d'une requête
     */
    validateRequest(
        userId: string,
        endpoint: string,
        requestBody?: Record<string, unknown>
    ): Promise<ComplianceValidationResult>;

    /**
     * Enregistre un problème de conformité
     */
    logComplianceIssue(
        issueInfo: Record<string, unknown>
    ): Promise<void>;

    /**
     * Récupère les exigences d'une réglementation
     */
    getRegulationRequirements?(regulation: string): string[];
}

/**
 * Interface pour le vérificateur de données sensibles
 */
export interface ISensitiveDataChecker {
    /**
     * Vérifie la présence de données sensibles
     */
    checkForSensitiveData(
        data: unknown,
        clearanceLevel?: string
    ): Promise<{
        containsSensitiveData: boolean;
        dataTypes: Array<{ type: string; severity: string }>;
    }>;
}

/**
 * Interface pour le système de détection de fraude
 */
export interface IFraudDetectionSystem {
    /**
     * Analyse une transaction pour détecter des fraudes
     */
    analyzeTransaction(
        transactionInfo: Record<string, unknown>
    ): Promise<{
        fraudDetected: boolean;
        fraudType?: string;
        confidence: number;
        riskScore: number;
        details: string;
    }>;

    /**
     * Signale une fraude
     */
    reportFraud(
        fraudInfo: Record<string, unknown>
    ): Promise<void>;
}

/**
 * Interface pour le moniteur d'événements de sécurité
 */
export interface ISecurityEventMonitor {
    /**
     * Démarre la surveillance
     */
    startMonitoring(): Promise<void>;

    /**
     * Arrête la surveillance
     */
    stopMonitoring(): Promise<void>;

    /**
     * Enregistre un événement de sécurité
     */
    recordEvent(
        eventType: string,
        eventData: Record<string, unknown>
    ): Promise<void>;

    /**
     * Récupère les statistiques d'événements
     */
    getEventStats(
        eventType: string,
        timeRange?: { start: Date; end: Date }
    ): Promise<{
        count: number;
        distribution: Record<string, number>;
        trend: { period: string; count: number }[];
    }>;
}

/**
 * Interface pour le gestionnaire de métriques de sécurité
 */
export interface ISecurityMetricsCollector {
    /**
     * Enregistre une métrique
     */
    recordMetric(
        name: string,
        value: number,
        tags?: Record<string, string>
    ): Promise<void>;

    /**
     * Enregistre un événement
     */
    recordEvent(
        name: string,
        properties?: Record<string, unknown>
    ): Promise<void>;

    /**
     * Récupère les statistiques d'une métrique
     */
    getMetricStats(
        name: string,
        timeRange?: { start: Date; end: Date }
    ): Promise<{
        min: number;
        max: number;
        avg: number;
        sum: number;
        count: number;
        p95: number;
        p99: number;
    }>;
}