/**
 * Fabrique pour créer différents types de vérifications de santé
 * src/ai/api/distributed/monitoring/realtime/HealthCheckFactory.ts
 */
import {
    HealthCheck,
    HealthCheckResult,
    HealthStatus,
    ThresholdConfig
} from '../health/types/health.types';

/**
 * Options de base pour les vérifications de santé
 */
export interface HealthCheckOptions {
    /** Nom personnalisé pour la vérification */
    name?: string | undefined;

    /** Description personnalisée pour la vérification */
    description?: string | undefined;

    /** Catégorie de la vérification */
    category?: string | undefined;

    /** Indique si cette vérification est critique */
    critical?: boolean | undefined;

    /** Timeout pour l'exécution de la vérification (ms) */
    timeout?: number | undefined;

    /** Configuration des seuils */
    thresholds?: ThresholdConfig | undefined;
}

/**
 * Classe de base pour les vérifications de santé
 */
export abstract class BaseHealthCheck implements HealthCheck {
    /** Nom de la vérification */
    public readonly name: string;

    /** Description de la vérification */
    public readonly description: string;

    /** Catégorie de la vérification */
    public readonly category: string;

    /** Indique si cette vérification est critique */
    public readonly critical: boolean;

    /** Timeout pour l'exécution (ms) */
    public readonly timeout: number;

    /** Configuration des seuils */
    public readonly thresholds?: ThresholdConfig | undefined;

    /**
     * Constructeur
     * @param name - Nom de la vérification
     * @param options - Options de la vérification
     */
    constructor(name: string, options: {
        description?: string | undefined;
        category?: string | undefined;
        critical?: boolean | undefined;
        timeout?: number | undefined;
        thresholds?: ThresholdConfig | undefined;
    }) {
        this.name = name;
        this.description = options.description || '';
        this.category = options.category || 'default';
        this.critical = options.critical !== undefined ? options.critical : false;
        this.timeout = options.timeout || 5000;
        this.thresholds = options.thresholds;
    }

    /**
     * Exécute la vérification de santé (compatibilité avec l'interface HealthCheck)
     * @returns Résultat de la vérification
     */
    public async execute(): Promise<HealthCheckResult> {
        return this.check();
    }

    /**
     * Exécute la vérification de santé
     * @returns Résultat de la vérification
     */
    public async check(): Promise<HealthCheckResult> {
        try {
            const startTime = Date.now();
            const result = await Promise.race([
                this.performCheck(),
                new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error(`Health check '${this.name}' timed out after ${this.timeout}ms`)),
                        this.timeout);
                })
            ]);
            const duration = Date.now() - startTime;

            return {
                ...result,
                duration,
                name: this.name,
                timestamp: Date.now(),
                component: result.component || this.name
            };
        } catch (error) {
            return {
                status: HealthStatus.UNHEALTHY,
                message: error instanceof Error ? error.message : String(error),
                name: this.name,
                component: this.name,
                timestamp: Date.now(),
                duration: 0,
                details: { error: error instanceof Error ? error.stack : String(error) }
            };
        }
    }

    /**
     * Méthode à implémenter par les classes dérivées pour réaliser la vérification
     */
    protected abstract performCheck(): Promise<HealthCheckResult>;

    /**
     * Crée un objet résultat standardisé
     * @param status - Statut de la vérification
     * @param message - Message descriptif
     * @param details - Détails supplémentaires
     * @returns Résultat formatté
     */
    protected createResult(
        status: HealthStatus,
        message: string,
        details?: Record<string, unknown>
    ): HealthCheckResult {
        return {
            status,
            component: this.name,
            message,
            name: this.name,
            timestamp: Date.now(),
            duration: 0, // Sera rempli par la méthode check()
            details: details || {}
        };
    }
}

/**
 * Options pour les vérifications de CPU
 */
interface CPUHealthCheckOptions extends HealthCheckOptions {
    /** Utilisation CPU maximale autorisée (%) */
    maxUsagePercent?: number | undefined;

    /** Seuil d'alerte avant dégradation (%) */
    warningThreshold?: number | undefined;

    /** Nombre d'échantillons à collecter */
    samples?: number | undefined;
}

/**
 * Options pour les vérifications de mémoire
 */
interface MemoryHealthCheckOptions extends HealthCheckOptions {
    /** Utilisation mémoire maximale autorisée (%) */
    maxUsagePercent?: number | undefined;

    /** Seuil d'alerte avant dégradation (%) */
    warningThreshold?: number | undefined;
}

/**
 * Options pour les vérifications HTTP
 */
interface HTTPHealthCheckOptions extends HealthCheckOptions {
    /** URL à vérifier */
    url: string;

    /** Méthode HTTP à utiliser */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | undefined;

    /** En-têtes HTTP à inclure */
    headers?: Record<string, string> | undefined;

    /** Corps de la requête (pour POST, PUT) */
    body?: string | Record<string, unknown> | undefined;

    /** Codes d'état HTTP attendus */
    expectedStatus?: number[] | undefined;

    /** Nombre de tentatives en cas d'échec */
    retries?: number | undefined;

    /** Délai entre les tentatives (ms) */
    retryDelay?: number | undefined;
}

/**
 * Options pour les vérifications personnalisées
 */
interface CustomHealthCheckOptions extends HealthCheckOptions {
    /** Nom unique pour la vérification */
    name: string;
}

/**
 * Type pour le résultat d'une fonction de vérification personnalisée
 */
export type CustomCheckFunction = () => Promise<{
    status: HealthStatus;
    message: string;
    details?: Record<string, unknown>;
}>;

/**
 * Implémentation concrète d'une vérification de CPU
 */
class CPUHealthCheck extends BaseHealthCheck {
    private readonly maxUsagePercent: number;
    private readonly warningThreshold: number;
    private readonly samples: number;

    constructor(options: CPUHealthCheckOptions) {
        super(options.name || 'cpu-check', {
            description: options.description,
            category: options.category,
            critical: options.critical,
            timeout: options.timeout,
            thresholds: options.thresholds
        });

        this.maxUsagePercent = options.maxUsagePercent || 85;
        this.warningThreshold = options.warningThreshold || 70;
        this.samples = options.samples || 3;
    }

    protected async performCheck(): Promise<HealthCheckResult> {
        // Collecter plusieurs échantillons de CPU et calculer la moyenne
        // pour rendre les mesures plus stables
        const cpuSamples: number[] = [];

        for (let i = 0; i < this.samples; i++) {
            // Attendre un court instant entre les échantillons
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const usage = await this.getCPUUsage();
            cpuSamples.push(usage);
        }

        // Calculer la moyenne des échantillons
        const cpuUsage = cpuSamples.reduce((sum, value) => sum + value, 0) / cpuSamples.length;

        if (cpuUsage > this.maxUsagePercent) {
            return this.createResult(
                HealthStatus.UNHEALTHY,
                `CPU usage too high: ${cpuUsage.toFixed(1)}% (max: ${this.maxUsagePercent}%)`,
                {
                    currentUsage: cpuUsage,
                    threshold: this.maxUsagePercent,
                    samples: cpuSamples
                }
            );
        } else if (cpuUsage > this.warningThreshold) {
            return this.createResult(
                HealthStatus.DEGRADED,
                `CPU usage approaching limit: ${cpuUsage.toFixed(1)}% (warning: ${this.warningThreshold}%)`,
                {
                    currentUsage: cpuUsage,
                    threshold: this.warningThreshold,
                    samples: cpuSamples
                }
            );
        } else {
            return this.createResult(
                HealthStatus.HEALTHY,
                `CPU usage normal: ${cpuUsage.toFixed(1)}%`,
                {
                    currentUsage: cpuUsage,
                    samples: cpuSamples
                }
            );
        }
    }

    private async getCPUUsage(): Promise<number> {
        // TODO: Implémenter une véritable collecte de CPU
        // Cette implémentation simule une utilisation CPU pour la démonstration
        return new Promise<number>(resolve => {
            setTimeout(() => {
                // Simuler une utilisation entre 0 et 100%
                const usage = Math.random() * 100;
                resolve(usage);
            }, 100);
        });
    }
}

/**
 * Implémentation concrète d'une vérification de mémoire
 */
class MemoryHealthCheck extends BaseHealthCheck {
    private readonly maxUsagePercent: number;
    private readonly warningThreshold: number;

    constructor(options: MemoryHealthCheckOptions) {
        super(options.name || 'memory-check', {
            description: options.description,
            category: options.category,
            critical: options.critical,
            timeout: options.timeout,
            thresholds: options.thresholds
        });

        this.maxUsagePercent = options.maxUsagePercent || 90;
        this.warningThreshold = options.warningThreshold || 80;
    }

    protected async performCheck(): Promise<HealthCheckResult> {
        // Simuler la collecte d'utilisation mémoire
        // Dans une implémentation réelle, vous utiliseriez os.totalmem() et os.freemem()
        const memoryUsage = await this.getMemoryUsage();

        if (memoryUsage > this.maxUsagePercent) {
            return this.createResult(
                HealthStatus.UNHEALTHY,
                `Memory usage too high: ${memoryUsage.toFixed(1)}% (max: ${this.maxUsagePercent}%)`,
                { currentUsage: memoryUsage, threshold: this.maxUsagePercent }
            );
        } else if (memoryUsage > this.warningThreshold) {
            return this.createResult(
                HealthStatus.DEGRADED,
                `Memory usage approaching limit: ${memoryUsage.toFixed(1)}% (warning: ${this.warningThreshold}%)`,
                { currentUsage: memoryUsage, threshold: this.warningThreshold }
            );
        } else {
            return this.createResult(
                HealthStatus.HEALTHY,
                `Memory usage normal: ${memoryUsage.toFixed(1)}%`,
                { currentUsage: memoryUsage }
            );
        }
    }

    private async getMemoryUsage(): Promise<number> {
        // TODO: Implémenter une véritable collecte de mémoire
        // Cette implémentation simule une utilisation mémoire pour la démonstration
        return new Promise<number>(resolve => {
            setTimeout(() => {
                // Simuler une utilisation entre 0 et 100%
                const usage = Math.random() * 100;
                resolve(usage);
            }, 100);
        });
    }
}

/**
 * Implémentation concrète d'une vérification HTTP
 */
class HTTPHealthCheck extends BaseHealthCheck {
    private readonly url: string;
    private readonly method: string;
    private readonly headers: Record<string, string>;
    private readonly body: string | Record<string, unknown> | undefined;
    private readonly expectedStatus: number[];
    private readonly retries: number;
    private readonly retryDelay: number;

    constructor(options: HTTPHealthCheckOptions) {
        super(options.name || `http-${new URL(options.url).hostname}`, {
            description: options.description,
            category: options.category,
            critical: options.critical,
            timeout: options.timeout,
            thresholds: options.thresholds
        });

        this.url = options.url;
        this.method = options.method || 'GET';
        this.headers = options.headers || {};
        this.body = options.body;
        this.expectedStatus = options.expectedStatus || [200];
        this.retries = options.retries || 1;
        this.retryDelay = options.retryDelay || 1000;
    }

    protected async performCheck(): Promise<HealthCheckResult> {
        try {
            const response = await this.makeRequest();

            if (this.expectedStatus.includes(response.status)) {
                return this.createResult(
                    HealthStatus.HEALTHY,
                    `HTTP check successful: ${response.status}`,
                    {
                        url: this.url,
                        status: response.status,
                        responseTime: response.responseTime
                    }
                );
            } else {
                return this.createResult(
                    HealthStatus.UNHEALTHY,
                    `HTTP check failed: expected status ${this.expectedStatus.join(', ')}, got ${response.status}`,
                    {
                        url: this.url,
                        status: response.status,
                        expected: this.expectedStatus,
                        responseTime: response.responseTime
                    }
                );
            }
        } catch (error) {
            return this.createResult(
                HealthStatus.UNHEALTHY,
                `HTTP check error: ${error instanceof Error ? error.message : String(error)}`,
                {
                    url: this.url,
                    error: error instanceof Error ? error.stack : String(error)
                }
            );
        }
    }

    private async makeRequest(attempt = 1): Promise<{ status: number; responseTime: number }> {
        // TODO: Implémenter une véritable requête HTTP
        // Cette implémentation simule une requête HTTP pour la démonstration
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            // Log de la requête simulée
            console.debug(`Making HTTP ${this.method} request to ${this.url} (attempt ${attempt}/${this.retries + 1})`);

            // Dans une implémentation réelle, nous utiliserions ces propriétés
            // Exemple: const config = { headers: this.headers, body: this.body };

            // En production, le body serait utilisé avec fetch ou axios
            if (this.body) {
                const bodyType = typeof this.body === 'string' ? 'text' : 'json';
                console.debug(`Request body (${bodyType}): ${typeof this.body === 'string' ? this.body : JSON.stringify(this.body)}`);
            }

            setTimeout(() => {
                const random = Math.random();

                // Simuler des échecs occasionnels
                if (random > 0.8) {
                    if (attempt <= this.retries) {
                        console.debug(`Request failed, retrying in ${this.retryDelay}ms...`);
                        // Réessayer après un délai
                        setTimeout(() => {
                            this.makeRequest(attempt + 1)
                                .then(resolve)
                                .catch(reject);
                        }, this.retryDelay);
                        return;
                    }
                    console.error(`Request failed after ${attempt} attempts`);
                    reject(new Error('Connection failed'));
                    return;
                }

                const responseTime = Date.now() - startTime;

                // Simuler différents codes de statut
                const statusCodes = [200, 201, 400, 404, 500];
                const weights = [0.7, 0.1, 0.1, 0.05, 0.05]; // 70% chance de 200, etc.

                let statusIndex = 0;
                let cumulativeWeight = 0;

                for (let i = 0; i < weights.length; i++) {
                    cumulativeWeight += weights[i];
                    if (random <= cumulativeWeight) {
                        statusIndex = i;
                        break;
                    }
                }

                const status = statusCodes[statusIndex];
                console.debug(`Request completed with status ${status} in ${responseTime}ms`);

                resolve({
                    status,
                    responseTime
                });
            }, 100 + Math.random() * 300); // Simuler une latence variable
        });
    }
}

/**
 * Implémentation concrète d'une vérification personnalisée
 */
class CustomHealthCheck extends BaseHealthCheck {
    private readonly checkFunction: CustomCheckFunction;

    constructor(options: CustomHealthCheckOptions, checkFn: CustomCheckFunction) {
        super(options.name, {
            description: options.description,
            category: options.category,
            critical: options.critical,
            timeout: options.timeout,
            thresholds: options.thresholds
        });
        this.checkFunction = checkFn;
    }

    protected async performCheck(): Promise<HealthCheckResult> {
        try {
            const result = await this.checkFunction();
            return this.createResult(result.status, result.message, result.details);
        } catch (error) {
            return this.createResult(
                HealthStatus.UNHEALTHY,
                `Custom check error: ${error instanceof Error ? error.message : String(error)}`,
                { error: error instanceof Error ? error.stack : String(error) }
            );
        }
    }
}

/**
 * Fabrique pour créer des vérifications de santé
 */
export class HealthCheckFactory {
    /**
     * Crée une vérification de santé basée sur une CPU
     * 
     * @param options - Options de configuration
     * @returns Vérification de santé pour la CPU
     */
    public static createCPUCheck(options: CPUHealthCheckOptions = {}): HealthCheck {
        return new CPUHealthCheck({
            name: options.name || 'cpu-usage',
            description: options.description || 'Monitors CPU usage',
            category: options.category || 'system-resources',
            critical: options.critical,
            maxUsagePercent: options.maxUsagePercent,
            warningThreshold: options.warningThreshold,
            samples: options.samples,
            timeout: options.timeout,
            thresholds: options.thresholds
        });
    }

    /**
     * Crée une vérification de santé basée sur la mémoire
     * 
     * @param options - Options de configuration
     * @returns Vérification de santé pour la mémoire
     */
    public static createMemoryCheck(options: MemoryHealthCheckOptions = {}): HealthCheck {
        return new MemoryHealthCheck({
            name: options.name || 'memory-usage',
            description: options.description || 'Monitors memory usage',
            category: options.category || 'system-resources',
            critical: options.critical,
            maxUsagePercent: options.maxUsagePercent,
            warningThreshold: options.warningThreshold,
            timeout: options.timeout,
            thresholds: options.thresholds
        });
    }

    /**
     * Crée une vérification de santé basée sur un service HTTP
     * 
     * @param options - Options de configuration
     * @returns Vérification de santé pour l'HTTP
     */
    public static createHTTPCheck(options: HTTPHealthCheckOptions): HealthCheck {
        if (!options.url) {
            throw new Error('URL is required for HTTP health check');
        }

        return new HTTPHealthCheck({
            name: options.name,
            description: options.description,
            category: options.category,
            critical: options.critical,
            url: options.url,
            method: options.method,
            headers: options.headers,
            body: options.body,
            expectedStatus: options.expectedStatus,
            retries: options.retries,
            retryDelay: options.retryDelay,
            timeout: options.timeout,
            thresholds: options.thresholds
        });
    }

    /**
     * Crée une vérification de santé personnalisée
     * 
     * @param options - Options de configuration
     * @param checkFn - Fonction d'exécution de la vérification
     * @returns Vérification de santé personnalisée
     */
    public static createCustomCheck(
        options: CustomHealthCheckOptions,
        checkFn: CustomCheckFunction
    ): HealthCheck {
        if (!options.name) {
            throw new Error('Name is required for custom health check');
        }

        return new CustomHealthCheck(options, checkFn);
    }
}