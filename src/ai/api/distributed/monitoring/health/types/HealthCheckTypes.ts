// src/ai/api/distributed/monitoring/health/types/HealthCheckTypes.ts

/**
 * Statut d'une vérification de santé
 */
export enum HealthStatus {
    HEALTHY = 'healthy',
    WARNING = 'warning',
    CRITICAL = 'critical',
    UNKNOWN = 'unknown'
}

/**
 * Priorité d'une vérification de santé
 */
export enum HealthCheckPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * Type de vérification de santé
 */
export enum HealthCheckType {
    MEMORY = 'memory',
    CPU = 'cpu',
    DISK = 'disk',
    NETWORK = 'network',
    API = 'api',
    DATABASE = 'database',
    SERVICE = 'service',
    CUSTOM = 'custom'
}

/**
 * Résultat d'une vérification de santé
 */
export interface HealthCheckResult {
    status: HealthStatus;
    checkId: string;
    checkType: HealthCheckType;
    component: string;
    message: string;
    timestamp: number;
    details?: Record<string, unknown>;
    metrics?: Record<string, number>;
    priority: HealthCheckPriority;
}

/**
 * Configuration d'une vérification de santé
 */
export interface HealthCheckConfig {
    id: string;
    type: HealthCheckType;
    component: string;
    priority: HealthCheckPriority;
    checkIntervalMs: number;
    timeoutMs: number;
    retryCount?: number;
    enabled: boolean;
    thresholds?: Record<string, number>;
    dependencies?: string[];
    parameters?: Record<string, unknown>;
    latencyThreshold?: number;
}

/**
 * Configuration d'un point d'API à vérifier
 */
export interface APIEndpoint {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    expectedStatus?: number[];
}

/**
 * Résultat de la vérification d'un point d'API
 */
export interface EndpointHealth {
    endpoint: string;
    status: number;
    latency: number;
    healthy: boolean;
    lastChecked: Date;
    error: string | null;
}

/**
 * Interface de base pour tous les types de vérifications de santé
 */
export interface IHealthCheck {
    /**
     * Exécute la vérification de santé
     */
    check(): Promise<HealthCheckResult>;

    /**
     * Retourne la configuration de la vérification de santé
     */
    getConfig(): HealthCheckConfig;

    /**
     * Retourne l'identifiant de la vérification de santé
     */
    getId(): string;

    /**
     * Retourne le type de la vérification de santé
     */
    getType(): HealthCheckType;

    /**
     * Détermine si la vérification de santé est activée
     */
    isEnabled(): boolean;

    /**
     * Active ou désactive la vérification de santé
     */
    setEnabled(enabled: boolean): void;

    /**
     * Met à jour les paramètres de la vérification de santé
     */
    updateParameters(parameters: Record<string, unknown>): void;
}

/**
 * Interface pour les gestionnaires de vérifications de santé
 */
export interface IHealthCheckManager {
    /**
     * Ajoute une vérification de santé
     */
    addHealthCheck(healthCheck: IHealthCheck): void;

    /**
     * Supprime une vérification de santé
     */
    removeHealthCheck(id: string): boolean;

    /**
     * Exécute toutes les vérifications de santé
     */
    checkAll(): Promise<HealthCheckResult[]>;

    /**
     * Exécute une vérification de santé spécifique
     */
    checkById(id: string): Promise<HealthCheckResult | null>;

    /**
     * Exécute toutes les vérifications de santé d'un certain type
     */
    checkByType(type: HealthCheckType): Promise<HealthCheckResult[]>;

    /**
     * Retourne toutes les vérifications de santé
     */
    getAllHealthChecks(): IHealthCheck[];

    /**
     * Retourne une vérification de santé spécifique
     */
    getHealthCheckById(id: string): IHealthCheck | null;
}