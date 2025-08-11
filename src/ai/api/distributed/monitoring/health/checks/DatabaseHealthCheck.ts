/**
 * Vérification de santé de la base de données
 * Vérifie la connexion, la réplication et les performances de la base de données
 */
import { HealthCheckBase } from '@distributed/monitoring/health/checks/HealthCheckBase';
import { HealthCheckResult } from '@distributed/monitoring/types/health.types';
import { HealthCheckError } from '@distributed/monitoring/health/errors/HealthCheckError';
import { DatabaseClient, ConnectionStats, ReplicationStatus, QueryPerformance } from '@distributed/database/types';
import { Logger } from '@common/monitoring/LogService';
import { TimeoutError } from '@distributed/monitoring/health/errors/TimeoutError';

/**
 * Options de configuration pour la vérification de santé de base de données
 */
export interface DatabaseHealthCheckOptions {
    /** Nom unique de la vérification de santé */
    name: string;

    /** Description de la vérification */
    description?: string;

    /** Client de base de données à utiliser pour les vérifications */
    dbClient: DatabaseClient;

    /** Si cette vérification est critique pour la santé du système */
    critical?: boolean;

    /** Délai maximum d'exécution des requêtes (ms) */
    queryTimeout?: number;

    /** Seuil de latence maximum acceptable (ms) */
    maxLatency?: number;

    /** Délai maximum acceptable de réplication (ms) */
    maxReplicationLag?: number;

    /** Pourcentage maximum d'utilisation des connexions */
    maxConnectionUtilization?: number;

    /** Requêtes personnalisées à exécuter pour la vérification */
    customQueries?: Array<{
        query: string;
        params?: any[];
        description: string;
        expectedRows?: number;
        maxExecutionTime?: number;
    }>;
}

/**
 * Vérification de santé pour les bases de données
 * Surveille la connexion, la réplication, la latence et les performances
 */
export class DatabaseHealthCheck extends HealthCheckBase {
    /** Client de la base de données à vérifier */
    private readonly dbClient: DatabaseClient;

    /** Logger pour les opérations de vérification */
    private readonly logger: Logger;

    /** Délai maximum d'exécution des requêtes (ms) */
    private readonly queryTimeout: number;

    /** Seuil de latence maximum acceptable (ms) */
    private readonly maxLatency: number;

    /** Délai maximum acceptable de réplication (ms) */
    private readonly maxReplicationLag: number;

    /** Pourcentage maximum d'utilisation des connexions */
    private readonly maxConnectionUtilization: number;

    /** Requêtes personnalisées à exécuter */
    private readonly customQueries: Array<{
        query: string;
        params?: any[];
        description: string;
        expectedRows?: number;
        maxExecutionTime?: number;
    }>;

    /**
     * Dernier résultat de vérification
     * Utilisé pour suivre les tendances et déterminer les problèmes chroniques
     */
    private lastResult?: HealthCheckResult;

    /**
     * Construit une nouvelle vérification de santé de base de données
     * @param options Options de configuration
     */
    constructor(options: DatabaseHealthCheckOptions) {
        super({
            name: options.name,
            description: options.description || `Health check for database: ${options.name}`,
            critical: options.critical !== undefined ? options.critical : true
        });

        this.dbClient = options.dbClient;
        this.queryTimeout = options.queryTimeout || 5000;
        this.maxLatency = options.maxLatency || 200;
        this.maxReplicationLag = options.maxReplicationLag || 10000;
        this.maxConnectionUtilization = options.maxConnectionUtilization || 0.9;
        this.customQueries = options.customQueries || [];
        this.logger = new Logger(`DatabaseHealthCheck:${options.name}`);
    }

    /**
     * Exécute toutes les vérifications de santé de la base de données
     * @returns Résultat de la vérification
     */
    public async execute(): Promise<HealthCheckResult> {
        try {
            return await this.executeWithTimeout(async () => {
                const startTime = Date.now();
                const details: Record<string, unknown> = {};

                try {
                    // Vérifier la connexion à la base de données
                    const connectionStats = await this.checkConnection();
                    details.connectionStats = connectionStats;

                    // Vérifier la réplication si disponible
                    try {
                        const replicationStatus = await this.checkReplication();
                        details.replication = replicationStatus;
                    } catch (error) {
                        if (!(error instanceof Error && error.message === 'Replication not configured')) {
                            throw error;
                        }
                        details.replication = 'not_configured';
                    }

                    // Vérifier la latence
                    const lagStatus = await this.checkLag();
                    details.latency = lagStatus;

                    // Exécuter les requêtes personnalisées
                    if (this.customQueries.length > 0) {
                        const customResults = await this.runCustomQueries();
                        details.customQueries = customResults;
                    }

                    // Collecter des métriques supplémentaires
                    const additionalMetrics = await this.collectAdditionalMetrics();
                    Object.assign(details, additionalMetrics);

                    const executionTime = Date.now() - startTime;
                    details.executionTime = executionTime;

                    this.lastResult = {
                        name: this.name,
                        status: 'healthy',
                        message: `Database ${this.name} is healthy`,
                        timestamp: Date.now(),
                        details,
                        metadata: {
                            executionTime,
                            previousStatus: this.lastResult?.status
                        },
                        recommendations: []
                    };

                    return this.lastResult;
                } catch (error) {
                    const executionTime = Date.now() - startTime;

                    // Déterminer l'état de santé en fonction de l'erreur
                    const status = this.determineHealthStatus(error);

                    // Générer des recommandations basées sur l'erreur
                    const recommendations = this.generateRecommendations(error);

                    this.lastResult = {
                        name: this.name,
                        status,
                        message: error instanceof Error ? error.message : String(error),
                        timestamp: Date.now(),
                        details: {
                            ...details,
                            error: error instanceof Error ? {
                                name: error.name,
                                message: error.message,
                                stack: error.stack
                            } : String(error),
                            executionTime
                        },
                        metadata: {
                            executionTime,
                            previousStatus: this.lastResult?.status
                        },
                        recommendations
                    };

                    return this.lastResult;
                }
            });
        } catch (error) {
            if (error instanceof TimeoutError) {
                this.logger.warn(`Database health check timed out after ${this.queryTimeout}ms`);
                return {
                    name: this.name,
                    status: 'degraded',
                    message: `Database health check timed out after ${this.queryTimeout}ms`,
                    timestamp: Date.now(),
                    details: {
                        timeout: this.queryTimeout,
                        error: {
                            name: error.name,
                            message: error.message
                        }
                    },
                    metadata: {
                        previousStatus: this.lastResult?.status
                    },
                    recommendations: [
                        'Consider increasing the query timeout',
                        'Check database load and performance',
                        'Review long-running queries and optimize them'
                    ]
                };
            }

            this.logger.error('Unexpected error during database health check', error);
            return {
                name: this.name,
                status: 'unhealthy',
                message: error instanceof Error ? error.message : String(error),
                timestamp: Date.now(),
                details: {
                    error: error instanceof Error ? {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    } : String(error)
                },
                metadata: {
                    previousStatus: this.lastResult?.status
                },
                recommendations: [
                    'Check database server logs',
                    'Verify database configuration',
                    'Ensure database client is properly configured'
                ]
            };
        }
    }

    /**
     * Exécute une fonction avec un délai d'expiration
     * @param fn Fonction à exécuter
     * @returns Résultat de la fonction
     * @throws TimeoutError si le délai est dépassé
     */
    private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new TimeoutError(`Query timeout exceeded (${this.queryTimeout}ms)`));
            }, this.queryTimeout);

            fn()
                .then(result => {
                    clearTimeout(timeoutId);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    /**
     * Vérifie la connexion à la base de données
     * @returns Statistiques de connexion
     * @throws HealthCheckError si la connexion échoue
     */
    private async checkConnection(): Promise<ConnectionStats> {
        try {
            await this.dbClient.ping();
            const stats = await this.dbClient.getConnectionStats();

            // Calculer le pourcentage d'utilisation
            const utilization = stats.activeConnections / stats.maxConnections;

            if (utilization > this.maxConnectionUtilization) {
                throw new HealthCheckError(
                    `Too many active connections (${stats.activeConnections}/${stats.maxConnections}, ${(utilization * 100).toFixed(2)}%)`
                );
            }

            return stats;
        } catch (error) {
            if (error instanceof HealthCheckError) {
                throw error;
            }

            this.logger.error('Database connection check failed', error);
            throw new HealthCheckError(
                `Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Vérifie l'état de la réplication
     * @returns État de la réplication
     * @throws HealthCheckError si la réplication est défaillante
     */
    private async checkReplication(): Promise<ReplicationStatus> {
        try {
            const replicationStatus = await this.dbClient.getReplicationStatus();

            if (replicationStatus.lag > this.maxReplicationLag) {
                throw new HealthCheckError(
                    `Replication lag too high: ${replicationStatus.lag}ms (max: ${this.maxReplicationLag}ms)`
                );
            }

            return replicationStatus;
        } catch (error) {
            if (error instanceof HealthCheckError) {
                throw error;
            }

            this.logger.error('Replication check failed', error);
            throw new HealthCheckError(
                `Failed to check replication: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Vérifie la latence de la base de données
     * @returns Informations de latence
     * @throws HealthCheckError si la latence est trop élevée
     */
    private async checkLag(): Promise<QueryPerformance> {
        try {
            // Exécuter une requête simple pour mesurer la latence
            const startTime = Date.now();
            await this.dbClient.executeQuery('SELECT 1');
            const endTime = Date.now();

            const latency = endTime - startTime;

            if (latency > this.maxLatency) {
                throw new HealthCheckError(
                    `Database latency too high: ${latency}ms (max: ${this.maxLatency}ms)`
                );
            }

            return { latency, timestamp: startTime };
        } catch (error) {
            if (error instanceof HealthCheckError) {
                throw error;
            }

            this.logger.error('Latency check failed', error);
            throw new HealthCheckError(
                `Failed to check database latency: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Exécute des requêtes personnalisées pour la vérification
     * @returns Résultats des requêtes personnalisées
     * @throws HealthCheckError si une requête échoue
     */
    private async runCustomQueries(): Promise<Array<{
        description: string;
        success: boolean;
        executionTime: number;
        rowCount?: number;
        error?: string;
    }>> {
        const results = [];

        for (const customQuery of this.customQueries) {
            try {
                const startTime = Date.now();
                const result = await this.dbClient.executeQuery(
                    customQuery.query,
                    customQuery.params
                );
                const executionTime = Date.now() - startTime;

                // Vérifier si le temps d'exécution est trop long
                if (customQuery.maxExecutionTime && executionTime > customQuery.maxExecutionTime) {
                    throw new HealthCheckError(
                        `Query execution time too long: ${executionTime}ms (max: ${customQuery.maxExecutionTime}ms)`
                    );
                }

                // Vérifier si le nombre de lignes correspond à l'attente
                if (customQuery.expectedRows !== undefined && result.rows.length !== customQuery.expectedRows) {
                    throw new HealthCheckError(
                        `Unexpected row count: ${result.rows.length} (expected: ${customQuery.expectedRows})`
                    );
                }

                results.push({
                    description: customQuery.description,
                    success: true,
                    executionTime,
                    rowCount: result.rows.length
                });
            } catch (error) {
                this.logger.error(`Custom query "${customQuery.description}" failed`, error);

                results.push({
                    description: customQuery.description,
                    success: false,
                    executionTime: -1,
                    error: error instanceof Error ? error.message : String(error)
                });

                // Si une requête échoue, on continue avec les autres
                // mais on enregistre l'échec
            }
        }

        // Vérifier si toutes les requêtes ont échoué
        if (results.every(r => !r.success)) {
            throw new HealthCheckError('All custom queries failed');
        }

        return results;
    }

    /**
     * Collecte des métriques supplémentaires sur la base de données
     * @returns Métriques additionnelles
     */
    private async collectAdditionalMetrics(): Promise<Record<string, unknown>> {
        try {
            // Collecter des métriques sur les performances
            const performanceMetrics = await this.dbClient.getPerformanceMetrics();

            // Collecter des métriques sur l'espace disque
            const diskMetrics = await this.dbClient.getDiskMetrics();

            return {
                performance: performanceMetrics,
                disk: diskMetrics
            };
        } catch (error) {
            this.logger.warn('Failed to collect additional metrics', error);
            return {
                additionalMetricsError: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Détermine l'état de santé en fonction de l'erreur
     * @param error Erreur survenue
     * @returns État de santé
     */
    private determineHealthStatus(error: unknown): SystemHealth {
        // Les erreurs de connexion et de réplication sont considérées comme critiques
        if (error instanceof Error) {
            if (error.message.includes('connection') ||
                error.message.includes('authentication') ||
                error.message.includes('replication')) {
                return 'unhealthy';
            }

            // Les problèmes de performance sont considérés comme dégradés
            if (error.message.includes('latency') ||
                error.message.includes('timeout') ||
                error.message.includes('lag')) {
                return 'degraded';
            }
        }

        // Par défaut, toute erreur est considérée comme unhealthy
        return 'unhealthy';
    }

    /**
     * Génère des recommandations basées sur l'erreur
     * @param error Erreur survenue
     * @returns Liste de recommandations
     */
    private generateRecommendations(error: unknown): string[] {
        const recommendations: string[] = [];

        if (error instanceof Error) {
            // Recommandations pour les problèmes de connexion
            if (error.message.includes('connection')) {
                recommendations.push('Check database server connectivity');
                recommendations.push('Verify network configuration');
                recommendations.push('Ensure database service is running');
            }

            // Recommandations pour les problèmes d'authentification
            if (error.message.includes('authentication')) {
                recommendations.push('Verify database credentials');
                recommendations.push('Check user permissions');
            }

            // Recommandations pour les problèmes de réplication
            if (error.message.includes('replication')) {
                recommendations.push('Check replication configuration');
                recommendations.push('Verify replication lag and status');
                recommendations.push('Ensure replica servers are running properly');
            }

            // Recommandations pour les problèmes de latence
            if (error.message.includes('latency') || error.message.includes('lag')) {
                recommendations.push('Optimize database queries');
                recommendations.push('Check database server load');
                recommendations.push('Consider scaling up database resources');
            }

            // Recommandations pour les problèmes de timeout
            if (error.message.includes('timeout')) {
                recommendations.push('Increase query timeout setting');
                recommendations.push('Optimize long-running queries');
                recommendations.push('Check for database locks or blocking operations');
            }
        }

        // Recommandations générales
        if (recommendations.length === 0) {
            recommendations.push('Check database server logs');
            recommendations.push('Monitor database performance metrics');
            recommendations.push('Review recent changes to database configuration');
        }

        return recommendations;
    }
}

/**
 * Type d'état de santé du système
 */
type SystemHealth = 'healthy' | 'degraded' | 'unhealthy';