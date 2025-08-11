/**
 * Système de vérification de santé en temps réel
 * Surveille l'état de santé des composants du système distribué
 */
import { EventEmitter } from 'events';
import { Logger } from '@common/monitoring/LogService';

/**
 * État de santé du système
 */
export type SystemHealth = 'healthy' | 'degraded' | 'unhealthy';

/**
 * État de santé du système (compatible avec l'API externe)
 */
export type SystemStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

/**
 * États de santé possibles
 */
export enum HealthStatus {
    HEALTHY = 'HEALTHY',
    DEGRADED = 'DEGRADED',
    UNHEALTHY = 'UNHEALTHY',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Structure d'une métrique de santé
 */
export interface HealthMetric {
    /** Nom de la métrique */
    name: string;
    /** Valeur de la métrique */
    value: number;
    /** Horodatage de la mesure */
    timestamp: number;
    /** Tags associés à la métrique */
    tags?: Map<string, string>;
}

/**
 * Résultat d'une vérification de santé
 */
export interface HealthCheckResult {
    /** État de santé déterminé */
    status: SystemHealth;
    /** Message explicatif */
    message: string;
    /** Horodatage de l'exécution */
    timestamp: number;
    /** Nom de la vérification qui a produit ce résultat */
    name?: string;
    /** Détails supplémentaires */
    details?: Record<string, unknown>;
    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
    /** Recommandations d'actions */
    recommendations?: string[];
}

/**
 * Vérification de santé à exécuter
 */
export interface HealthCheck {
    /** Nom unique de la vérification */
    name: string;
    /** Description de ce que cette vérification examine */
    description?: string;
    /** Fonction d'exécution de la vérification */
    execute(): Promise<HealthCheckResult>;
    /** Vérifie si la vérification est activée */
    isEnabled?(): boolean;
}

/**
 * Événement émis lors d'un changement d'état de santé
 */
export interface HealthChangeEvent {
    /** État de santé précédent */
    from?: SystemHealth;
    /** Nouvel état de santé */
    to?: SystemHealth;
    /** Horodatage du changement */
    timestamp: number;
    /** Résultats détaillés des vérifications ayant conduit au changement */
    details?: HealthCheckResult[] | Record<string, unknown>;
}

/**
 * Options de configuration du HealthChecker
 */
export interface HealthCheckerOptions {
    /** Intervalle entre les vérifications en ms */
    checkInterval?: number;
    /** Taille du tampon de métriques */
    bufferSize?: number;
    /** Nombre maximal d'événements stockés */
    maxEventHistory?: number;
    /** Démarrer automatiquement les vérifications */
    autoStart?: boolean;
}

/**
 * Classe pour stocker un tampon circulaire de métriques
 */
export class MetricsBuffer {
    private buffer: HealthMetric[] = [];
    private readonly maxSize: number;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }

    /**
     * Ajoute une métrique au tampon
     */
    public addMetric(metric: HealthMetric): void {
        this.buffer.push(metric);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }

    /**
     * Récupère toutes les métriques du tampon
     */
    public getMetrics(): ReadonlyArray<HealthMetric> {
        return [...this.buffer];
    }

    /**
     * Vide le tampon
     */
    public clear(): void {
        this.buffer = [];
    }
}

/**
 * Événements émis par le HealthChecker
 */
export const enum HealthEvents {
    HEALTH_CHANGED = 'health-changed',
    SYSTEM_HEALTHY = 'system-healthy',
    SYSTEM_DEGRADED = 'system-degraded',
    SYSTEM_UNHEALTHY = 'system-unhealthy',
    CHECK_COMPLETED = 'check-completed',
    CHECK_STARTED = 'check-started',
    ERROR = 'error'
}

/**
 * Interface pour les événements de début de vérification
 */
interface CheckStartEvent {
    timestamp: number;
    count: number;
}

/**
 * Interface pour les événements de fin de vérification
 */
interface CheckCompletedEvent {
    timestamp: number;
    executionTime: number;
    results: HealthCheckResult[];
}

/**
 * Interface pour les événements d'erreur
 */
interface ErrorEvent {
    error: unknown;
    timestamp: number;
}

/**
 * Interface du rapport complet de santé
 */
export interface HealthStatusReport {
    /** Statut global du système */
    status: SystemStatus;
    /** Résultats de toutes les vérifications */
    checks: HealthCheckResult[];
    /** Horodatage du rapport */
    timestamp: number;
    /** Vérifications critiques en échec */
    criticalChecks?: HealthCheckResult[];
    /** Vérifications en état d'avertissement */
    warningChecks?: HealthCheckResult[];
}

/**
 * Gestionnaire de vérification de santé en temps réel
 * Surveille périodiquement l'état de santé du système et émet des événements lors de changements
 */
export class HealthChecker extends EventEmitter {
    /**
     * Collection des vérifications de santé à exécuter
     */
    private checks: HealthCheck[] = [];

    /**
     * Intervalle entre les vérifications (en ms)
     */
    private readonly checkInterval: number;

    /**
     * Tampon pour stocker les mesures de métriques récentes
     */
    private readonly metricsBuffer: MetricsBuffer;

    /**
     * Dernier état de santé connu du système
     */
    private lastStatus: SystemHealth = 'healthy';

    /**
     * Indique si la vérification de santé est active
     */
    private isRunning: boolean = false;

    /**
     * ID de l'intervalle de vérification
     */
    private intervalId: NodeJS.Timeout | undefined;

    /**
     * Historique des événements de changement d'état
     */
    private eventHistory: HealthChangeEvent[] = [];

    /**
     * Taille maximale de l'historique des événements
     */
    private readonly maxEventHistory: number;

    /**
     * Logger pour les opérations de vérification de santé
     */
    private readonly logger: Logger;

    /**
     * Crée une nouvelle instance de HealthChecker
     * @param options - Options de configuration
     */
    constructor(options: HealthCheckerOptions = {}) {
        super();
        this.checkInterval = options.checkInterval ?? 30000;
        this.maxEventHistory = options.maxEventHistory ?? 50;

        // Initialiser le tampon de métriques
        const bufferSize = options.bufferSize ?? 100;
        this.metricsBuffer = new MetricsBuffer(bufferSize);

        // Configurer le logger
        this.logger = new Logger('HealthChecker');

        // S'assurer que les événements sont correctement traités
        super.setMaxListeners(20);

        // Auto-démarrage si configuré
        if (options.autoStart) {
            // Utiliser setTimeout pour permettre aux écouteurs d'événements d'être enregistrés
            setTimeout(() => this.start(), 0);
        }

        this.logger.info('HealthChecker initialized with check interval:', { interval: this.checkInterval });
    }

    /**
     * Surchargé pour typer correctement les événements émis
     */
    public override on(event: HealthEvents.HEALTH_CHANGED, listener: (event: HealthChangeEvent) => void): this;
    public override on(event: HealthEvents.SYSTEM_HEALTHY, listener: (event: HealthChangeEvent) => void): this;
    public override on(event: HealthEvents.SYSTEM_DEGRADED, listener: (event: HealthChangeEvent) => void): this;
    public override on(event: HealthEvents.SYSTEM_UNHEALTHY, listener: (event: HealthChangeEvent) => void): this;
    public override on(event: HealthEvents.CHECK_STARTED, listener: (event: CheckStartEvent) => void): this;
    public override on(event: HealthEvents.CHECK_COMPLETED, listener: (event: CheckCompletedEvent) => void): this;
    public override on(event: HealthEvents.ERROR, listener: (event: ErrorEvent) => void): this;
    public override on(event: string | symbol, listener: (...args: unknown[]) => void): this {
        return super.on(event, listener);
    }

    /**
     * Ajoute une nouvelle vérification de santé
     * @param check - Vérification de santé à ajouter
     * @returns L'instance HealthChecker (chaînable)
     */
    public addCheck(check: HealthCheck): HealthChecker {
        // Vérifier si une vérification avec le même nom existe déjà
        const existingIndex = this.checks.findIndex(c => c.name === check.name);
        if (existingIndex >= 0) {
            this.logger.warn(`Replacing existing health check: ${check.name}`);
            this.checks[existingIndex] = check;
        } else {
            this.checks.push(check);
            this.logger.debug(`Added health check: ${check.name}`);
        }
        return this;
    }

    /**
     * Ajoute plusieurs vérifications de santé
     * @param checks - Vérifications de santé à ajouter
     * @returns L'instance HealthChecker (chaînable)
     */
    public addChecks(checks: HealthCheck[]): HealthChecker {
        checks.forEach(check => this.addCheck(check));
        return this;
    }

    /**
     * Supprime une vérification de santé
     * @param checkName - Nom de la vérification à supprimer
     * @returns true si la vérification a été trouvée et supprimée, false sinon
     */
    public removeCheck(checkName: string): boolean {
        const initialLength = this.checks.length;
        this.checks = this.checks.filter(check => check.name !== checkName);
        const removed = initialLength > this.checks.length;

        if (removed) {
            this.logger.debug(`Removed health check: ${checkName}`);
        } else {
            this.logger.warn(`Health check not found: ${checkName}`);
        }

        return removed;
    }

    /**
     * Récupère toutes les vérifications de santé enregistrées
     * @returns Liste des vérifications
     */
    public getChecks(): ReadonlyArray<HealthCheck> {
        return [...this.checks];
    }

    /**
     * Démarre la vérification périodique de santé
     * @returns Promise qui se résout lorsque le démarrage est terminé
     */
    public async start(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('HealthChecker already running, ignoring start request');
            return;
        }

        if (this.checks.length === 0) {
            this.logger.warn('No health checks registered, HealthChecker will not start');
            return;
        }

        this.isRunning = true;
        this.logger.info(`Starting HealthChecker with ${this.checks.length} registered checks`);

        // Exécution immédiate de la première vérification
        await this.performHealthCheck();

        // Configuration de l'intervalle de vérification périodique
        this.intervalId = setInterval(async () => {
            await this.performHealthCheck();
        }, this.checkInterval);

        this.logger.info('HealthChecker started successfully');
    }

    /**
     * Arrête la vérification périodique de santé
     */
    public stop(): void {
        if (!this.isRunning || !this.intervalId) {
            this.logger.warn('HealthChecker not running, ignoring stop request');
            return;
        }

        clearInterval(this.intervalId);
        this.isRunning = false;
        this.intervalId = undefined;

        this.logger.info('HealthChecker stopped');
    }

    /**
     * Exécute une vérification de santé immédiate
     * @returns Promise qui se résout avec l'état de santé actuel
     */
    public async checkNow(): Promise<SystemHealth> {
        this.logger.debug('Manual health check triggered');
        return this.performHealthCheck();
    }

    /**
     * Récupère le tampon de métriques
     * @returns Le tampon de métriques
     */
    public getMetricsBuffer(): MetricsBuffer {
        return this.metricsBuffer;
    }

    /**
     * Récupère l'état de santé actuel du système
     * @returns L'état de santé actuel
     */
    public getCurrentHealth(): SystemHealth {
        return this.lastStatus;
    }

    /**
     * Récupère un rapport complet de l'état de santé
     * @returns Rapport d'état de santé
     */
    public async getHealthStatus(): Promise<HealthStatusReport> {
        const results = await this.executeChecks();
        const systemStatus = this.mapSystemHealthToStatus(this.determineOverallHealth(results));

        // Trier les résultats par catégorie
        const criticalChecks = results.filter(r => {
            const details = r.details as Record<string, unknown> | undefined;
            return details?.critical === true && r.status !== 'healthy';
        });

        const warningChecks = results.filter(r => {
            const details = r.details as Record<string, unknown> | undefined;
            return (details?.critical !== true && r.status === 'degraded') ||
                (details?.critical === true && r.status === 'healthy');
        });

        return {
            status: systemStatus,
            checks: results,
            timestamp: Date.now(),
            // Utilise undefined conditionnellement pour respecter exactOptionalPropertyTypes
            ...(criticalChecks.length > 0 ? { criticalChecks } : {}),
            ...(warningChecks.length > 0 ? { warningChecks } : {})
        };
    }

    /**
     * Récupère l'historique des événements de changement d'état
     * @returns Historique des événements
     */
    public getEventHistory(): ReadonlyArray<HealthChangeEvent> {
        return [...this.eventHistory];
    }

    /**
     * Réinitialise les vérifications de santé
     */
    public reset(): void {
        this.stop();
        this.checks = [];
        this.lastStatus = 'healthy';
        this.metricsBuffer.clear();
        this.eventHistory = [];
        this.logger.info('HealthChecker reset completed');
    }

    /**
     * Exécute toutes les vérifications de santé
     * @returns Liste des résultats
     * @private
     */
    private async executeChecks(): Promise<HealthCheckResult[]> {
        // Filtrer les vérifications activées
        const enabledChecks = this.checks.filter(check => {
            if (typeof check.isEnabled === 'function') {
                return check.isEnabled();
            }
            return true; // Par défaut, les vérifications sont activées
        });

        // Exécuter toutes les vérifications en parallèle
        const startTime = Date.now();
        this.emit(HealthEvents.CHECK_STARTED, {
            timestamp: startTime,
            count: enabledChecks.length
        });

        // Utiliser Promise.allSettled pour gérer les erreurs individuelles
        const results = await Promise.allSettled(
            enabledChecks.map(async check => {
                try {
                    return await check.execute();
                } catch (error) {
                    this.logger.error(`Health check "${check.name}" failed:`, { error });
                    const details: Record<string, unknown> = {};
                    const metadata: Record<string, unknown> = {};

                    return {
                        status: 'unhealthy' as SystemHealth,
                        message: `Check execution error: ${error}`,
                        timestamp: Date.now(),
                        name: check.name,
                        details,
                        metadata,
                        recommendations: []
                    };
                }
            })
        );

        const executionTime = Date.now() - startTime;

        // Convertir les résultats
        const healthResults: HealthCheckResult[] = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                const details: Record<string, unknown> = {};
                const metadata: Record<string, unknown> = {};

                return {
                    status: 'unhealthy',
                    message: `Failed to execute check: ${result.reason}`,
                    timestamp: Date.now(),
                    name: enabledChecks[index].name,
                    details,
                    metadata,
                    recommendations: []
                };
            }
        });

        this.emit(HealthEvents.CHECK_COMPLETED, {
            timestamp: Date.now(),
            executionTime,
            results: healthResults
        });

        return healthResults;
    }

    /**
     * Exécute toutes les vérifications de santé et met à jour l'état
     * @returns Promise qui se résout avec l'état de santé actuel
     * @private
     */
    private async performHealthCheck(): Promise<SystemHealth> {
        try {
            this.logger.debug('Executing health checks');

            // Exécuter les vérifications
            const healthResults = await this.executeChecks();

            // Stockage des résultats dans le tampon
            healthResults.forEach(result => this.metricsBuffer.addMetric({
                name: `health_check.${result.name || 'unknown'}`,
                value: result.status === 'healthy' ? 1 : (result.status === 'degraded' ? 0.5 : 0),
                timestamp: result.timestamp,
                tags: new Map([
                    ['status', result.status],
                    ['check', result.name || 'unknown']
                ])
            }));

            // Détermination de l'état de santé global
            const newStatus = this.determineOverallHealth(healthResults);

            // Émission d'événement si l'état a changé
            if (newStatus !== this.lastStatus) {
                const event: HealthChangeEvent = {
                    from: this.lastStatus,
                    to: newStatus,
                    timestamp: Date.now(),
                    details: healthResults
                };

                // Ajouter à l'historique des événements
                this.eventHistory.unshift(event);

                // Limiter la taille de l'historique
                if (this.eventHistory.length > this.maxEventHistory) {
                    this.eventHistory.length = this.maxEventHistory;
                }

                this.emit(HealthEvents.HEALTH_CHANGED, event);
                this.logger.info(`System health changed from ${this.lastStatus} to ${newStatus}`);

                // Émission d'événements spécifiques pour faciliter le filtrage
                if (newStatus === 'degraded') {
                    this.emit(HealthEvents.SYSTEM_DEGRADED, event);
                } else if (newStatus === 'unhealthy') {
                    this.emit(HealthEvents.SYSTEM_UNHEALTHY, event);
                } else if (newStatus === 'healthy') {
                    this.emit(HealthEvents.SYSTEM_HEALTHY, event);
                }

                this.lastStatus = newStatus;
            }

            return newStatus;
        } catch (error) {
            this.logger.error('Failed to perform health check:', { error });

            // Émettre l'événement d'erreur
            this.emit(HealthEvents.ERROR, {
                error,
                timestamp: Date.now()
            });

            return 'unhealthy';
        }
    }

    /**
     * Détermine l'état de santé global en fonction des résultats individuels
     * @param results - Résultats des vérifications individuelles
     * @returns État de santé global du système
     * @private
     */
    private determineOverallHealth(results: HealthCheckResult[]): SystemHealth {
        if (results.length === 0) {
            return 'healthy';
        }

        // Évaluer les vérifications critiques d'abord
        const criticalChecks = results.filter(r => {
            const details = r.details as Record<string, unknown> | undefined;
            return details?.critical === true;
        });

        if (criticalChecks.length > 0) {
            // Si une vérification critique est 'unhealthy', le système est 'unhealthy'
            if (criticalChecks.some(r => r.status === 'unhealthy')) {
                return 'unhealthy';
            }

            // Si une vérification critique est 'degraded', le système est 'degraded'
            if (criticalChecks.some(r => r.status === 'degraded')) {
                return 'degraded';
            }
        }

        // Sinon, évaluer toutes les vérifications
        // Si au moins une vérification est 'unhealthy', le système est 'unhealthy'
        if (results.some(r => r.status === 'unhealthy')) {
            return 'unhealthy';
        }

        // Si au moins une vérification est 'degraded', le système est 'degraded'
        if (results.some(r => r.status === 'degraded')) {
            return 'degraded';
        }

        // Si toutes les vérifications sont 'healthy', le système est 'healthy'
        return 'healthy';
    }

    /**
     * Convertit un état SystemHealth en SystemStatus
     * @param health - État de santé SystemHealth
     * @returns État de santé SystemStatus
     * @private
     */
    private mapSystemHealthToStatus(health: SystemHealth): SystemStatus {
        switch (health) {
            case 'healthy':
                return 'healthy';
            case 'degraded':
                return 'warning';
            case 'unhealthy':
                return 'critical';
            default:
                return 'unknown';
        }
    }
}