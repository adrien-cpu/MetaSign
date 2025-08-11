/**
 * Classe de base pour les vérifications de santé
 * Fournit une implémentation commune pour les vérifications de santé
 */
import {
    HealthCheck,
    HealthCheckOptions,
    HealthCheckResult,
    SystemHealth,
    SystemStatus,
    ThresholdConfig,
    AlertSeverity
} from '../types/health.types';
import { Logger } from '@/ai/api/common/monitoring/LogService';

/**
 * Classe abstraite de base pour implémenter des vérifications de santé
 */
export abstract class BaseHealthCheck implements HealthCheck {
    /** Nom de la vérification de santé */
    public readonly name: string;

    /** Identifiant unique */
    public readonly id: string;

    /** Description de la vérification */
    public readonly description: string;

    /** Seuils configurés pour cette vérification */
    public readonly thresholds?: ThresholdConfig;

    /** Catégorie de la vérification */
    public readonly category: string;

    /** Tags pour la catégorisation */
    public readonly tags: string[];

    /** Indique si cette vérification est critique pour la santé du système */
    public readonly critical: boolean;

    /** Logger pour cette vérification */
    protected readonly logger: Logger;

    /** Timeout pour l'exécution de la vérification en ms */
    protected readonly timeout: number;

    /** État d'activation de la vérification */
    protected enabled: boolean;

    /**
     * Crée une nouvelle instance de vérification de santé
     * 
     * @param id - Identifiant unique de la vérification
     * @param name - Nom de la vérification
     * @param description - Description de la vérification
     * @param options - Options de configuration
     */
    constructor(
        id: string,
        name: string,
        description: string,
        options: HealthCheckOptions = {}
    ) {
        this.id = id;
        this.name = name;
        this.description = description;

        // Appliquer les options avec des valeurs par défaut
        this.enabled = options.enabled ?? true;
        this.timeout = options.timeout ?? 10000;
        this.category = options.category ?? 'general';
        this.critical = options.critical ?? false;
        this.tags = options.tags ?? [];

        // Gestion des thresholds selon leur type
        if (options.thresholds) {
            // Si c'est un ThresholdConfig, utiliser directement
            if (typeof options.thresholds === 'object' && 'duration' in options.thresholds) {
                this.thresholds = options.thresholds as ThresholdConfig;
            }
            // Si c'est un Record<string, number>, convertir en ThresholdConfig
            else if (typeof options.thresholds === 'object') {
                const thresholdsRecord = options.thresholds as Record<string, number>;
                this.thresholds = {
                    maxValue: thresholdsRecord['max'],
                    minValue: thresholdsRecord['min'],
                    duration: thresholdsRecord['duration'] ?? 0,
                    // Conversion sécurisée vers AlertSeverity
                    severity: (thresholdsRecord['severity'] as AlertSeverity) ?? 'warning'
                };
            }
        }

        this.logger = new Logger(`HealthCheck.${this.category}.${this.name}`);
    }

    /**
     * Exécute la vérification avec gestion du timeout et des erreurs
     * 
     * @returns Résultat de la vérification
     */
    public async execute(): Promise<HealthCheckResult> {
        if (!this.enabled) {
            return this.createSystemHealthResult(
                'degraded',
                `Health check '${this.name}' is disabled`,
                { disabled: true }
            );
        }

        try {
            this.logger.debug('Starting health check');
            const startTime = Date.now();

            // Création d'une promesse avec timeout
            const result = await Promise.race([
                this.performCheck(),
                new Promise<HealthCheckResult>((_, reject) =>
                    setTimeout(() => reject(new Error(`Health check '${this.name}' timed out after ${this.timeout}ms`)), this.timeout)
                )
            ]);

            const executionTime = Date.now() - startTime;
            this.logger.debug(`Health check completed in ${executionTime}ms with status: ${result.status}`);

            // Enrichir le résultat avec des métadonnées communes
            return {
                ...result,
                checkName: this.name,
                checkId: this.id,
                details: result.details || {}, // Toujours fournir un objet en cas de undefined
                metadata: result.metadata || {}, // Valeur par défaut pour respecter exactOptionalPropertyTypes
                recommendations: result.recommendations || [] // Valeur par défaut
            };
        } catch (error) {
            this.logger.error(`Health check failed: ${error}`);

            return this.createSystemHealthResult(
                'unhealthy',
                `Check failed: ${error instanceof Error ? error.message : String(error)}`,
                {
                    error: error instanceof Error ? error.stack : String(error),
                    category: this.category,
                    critical: this.critical
                }
            );
        }
    }

    /**
     * Implémente la logique spécifique de la vérification
     * À surcharger dans les classes dérivées
     * 
     * @returns Résultat de la vérification
     */
    protected abstract performCheck(): Promise<HealthCheckResult>;

    /**
     * Crée un résultat standard de vérification
     * 
     * @param status - État de santé
     * @param message - Message explicatif
     * @param details - Détails supplémentaires
     * @returns Résultat formaté de la vérification
     */
    protected createSystemHealthResult(
        status: SystemHealth,
        message: string,
        details?: Record<string, unknown>
    ): HealthCheckResult {
        return {
            status,
            message,
            timestamp: Date.now(),
            checkName: this.name,
            checkId: this.id,
            details: details || {},
            metadata: {},
            recommendations: []
        };
    }

    /**
     * Crée un résultat standard de vérification avec le format SystemStatus
     * 
     * @param status - État de santé du système
     * @param details - Message explicatif
     * @param metadata - Métadonnées supplémentaires
     * @param recommendations - Recommandations d'actions
     * @returns Résultat formaté de la vérification
     */
    protected createResult(
        status: SystemStatus,
        details: string,
        metadata: Record<string, unknown> = {},
        recommendations: string[] = []
    ): HealthCheckResult {
        // Convertir SystemStatus en SystemHealth
        let systemHealth: SystemHealth;
        switch (status) {
            case 'healthy':
                systemHealth = 'healthy';
                break;
            case 'warning':
                systemHealth = 'degraded';
                break;
            case 'critical':
                systemHealth = 'unhealthy';
                break;
            case 'unknown':
            default:
                systemHealth = 'degraded';
                break;
        }

        return {
            status: systemHealth,
            message: details,
            timestamp: Date.now(),
            checkName: this.name,
            checkId: this.id,
            details: {
                ...(metadata || {}),
                original_status: status
            },
            metadata,
            recommendations
        };
    }

    /**
     * Vérifie si la vérification est activée
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Active ou désactive la vérification
     * @param enabled - Si la vérification doit être activée
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        this.logger.info(`Health check '${this.name}' ${enabled ? 'enabled' : 'disabled'}`);
    }
}