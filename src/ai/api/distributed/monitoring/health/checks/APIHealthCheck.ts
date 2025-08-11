// src/ai/api/distributed/monitoring/health/checks/APIHealthCheck.ts

import { HealthCheckBase } from './HealthCheckBase';
import {
    HealthCheckResult,
    HealthCheckType,
    HealthStatus,
    APIEndpoint,
    EndpointHealth
} from '../types/HealthCheckTypes';

/**
 * Interface pour le client HTTP
 */
interface HTTPClient {
    request(endpoint: APIEndpoint): Promise<HTTPResponse>;
}

/**
 * Interface pour la réponse HTTP
 */
interface HTTPResponse {
    status: number;
    data: unknown;
    headers: Record<string, string>;
}

/**
 * Vérifie la santé des points d'API en mesurant la latence et les codes de statut
 */
export class APIHealthCheck extends HealthCheckBase {
    private readonly endpoints: APIEndpoint[];
    private readonly httpClient: HTTPClient;

    /**
     * Initialise une vérification de santé d'API
     * @param id Identifiant de la vérification
     * @param component Composant à vérifier
     * @param endpoints Liste des points d'API à vérifier
     * @param httpClient Client HTTP pour effectuer les requêtes
     */
    constructor(
        id: string,
        component: string,
        endpoints: APIEndpoint[],
        httpClient: HTTPClient
    ) {
        super(id, HealthCheckType.API, component);
        this.endpoints = endpoints;
        this.httpClient = httpClient;
    }

    /**
     * Exécute la vérification de santé
     */
    public async check(): Promise<HealthCheckResult> {
        try {
            const results = await Promise.all(
                this.endpoints.map(endpoint => this.checkEndpoint(endpoint))
            );

            const allHealthy = results.every(result => result.healthy);
            const status = allHealthy ? HealthStatus.HEALTHY : HealthStatus.CRITICAL;

            const unhealthyEndpoints = results.filter(r => !r.healthy);
            const message = allHealthy
                ? `All ${results.length} API endpoints are healthy`
                : `${unhealthyEndpoints.length} of ${results.length} API endpoints are unhealthy`;

            return {
                status,
                checkId: this.getId(),
                checkType: this.getType(),
                component: this.getComponent(),
                message,
                timestamp: Date.now(),
                details: { endpoints: results },
                metrics: {
                    totalEndpoints: results.length,
                    healthyEndpoints: results.length - unhealthyEndpoints.length,
                    averageLatency: results.reduce((sum, r) => sum + r.latency, 0) / results.length
                },
                priority: this.getPriority()
            };
        } catch (error) {
            return {
                status: HealthStatus.CRITICAL,
                checkId: this.getId(),
                checkType: this.getType(),
                component: this.getComponent(),
                message: `API health check failed: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now(),
                details: { error: String(error) },
                priority: this.getPriority()
            };
        }
    }

    /**
     * Vérifie la santé d'un point d'API spécifique
     */
    private async checkEndpoint(endpoint: APIEndpoint): Promise<EndpointHealth> {
        try {
            const startTime = Date.now();
            const response = await this.httpClient.request(endpoint);
            const latency = Date.now() - startTime;

            return {
                endpoint: endpoint.url,
                status: response.status,
                latency,
                healthy: this.isHealthyResponse(response, latency),
                lastChecked: new Date(),
                error: null
            };
        } catch (error) {
            return {
                endpoint: endpoint.url,
                status: 0,
                latency: 0,
                healthy: false,
                lastChecked: new Date(),
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Vérifie si une réponse est considérée comme saine en fonction du code de statut et de la latence
     */
    protected isHealthyResponse(response: HTTPResponse, latency: number): boolean {
        // Considère comme saine les réponses avec code 2xx et latence acceptable
        const isSuccessStatus = response.status >= 200 && response.status < 300;
        const isAcceptableLatency = latency <= this.getLatencyThreshold();

        return isSuccessStatus && isAcceptableLatency;
    }

    /**
     * Obtient le seuil de latence acceptable en millisecondes
     */
    protected getLatencyThreshold(): number {
        const thresholds = this.getThresholds();
        return thresholds?.latency || 500; // Valeur par défaut: 500ms
    }
}