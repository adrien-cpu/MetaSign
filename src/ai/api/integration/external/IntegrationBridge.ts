/**
 * Pont pour les intégrations externes
 */
import { LogService } from '@api/common/monitoring/LogService';
import {
    APIRequest,
    APIResponse,
    IntegrationConfig
} from './types';

/**
 * Interface pour les adaptateurs d'intégration spécifiques
 */
export interface IntegrationAdapter {
    /**
     * Convertit une requête API générique en format spécifique à l'intégration
     * @param request Requête API générique
     * @returns Requête dans le format spécifique à l'adaptateur
     */
    adaptRequest(request: APIRequest): Promise<unknown>;

    /**
     * Convertit une réponse spécifique à l'intégration en format générique
     * @param response Réponse spécifique à l'intégration
     * @returns Réponse API générique
     */
    adaptResponse(response: unknown): Promise<APIResponse>;

    /**
     * Gère les erreurs spécifiques à l'intégration
     * @param error Erreur d'origine
     * @returns Réponse API d'erreur
     */
    handleError(error: unknown): Promise<APIResponse>;
}

/**
 * Classe responsable de la communication avec les systèmes externes
 */
export class IntegrationBridge {
    private readonly logger = new LogService('IntegrationBridge');
    private readonly integrations: Map<string, IntegrationConfig> = new Map();
    private readonly adapters: Map<string, IntegrationAdapter> = new Map();

    /**
     * Crée une instance du pont d'intégration
     * @param httpClient Client HTTP pour la communication externe
     */
    constructor(private readonly httpClient: any) {
        this.logger.debug('IntegrationBridge initialized');
    }

    /**
     * Enregistre une nouvelle intégration
     * @param config Configuration de l'intégration
     * @param adapter Adaptateur pour cette intégration (optionnel)
     * @returns La configuration de l'intégration
     */
    public registerIntegration(
        config: IntegrationConfig,
        adapter?: IntegrationAdapter
    ): IntegrationConfig {
        this.logger.info(`Registering integration ${config.id}`, {
            name: config.name,
            type: config.type
        });

        this.integrations.set(config.id, config);

        if (adapter) {
            this.adapters.set(config.id, adapter);
        }

        return config;
    }

    /**
     * Transmet une requête à une intégration externe
     * @param integrationId ID de l'intégration à utiliser
     * @param request Requête à transmettre
     * @returns Réponse de l'intégration
     */
    public async transmitRequest(
        integrationId: string,
        request: APIRequest
    ): Promise<APIResponse> {
        this.logger.debug(`Transmitting request ${request.id} to integration ${integrationId}`);

        // Vérifier que l'intégration existe
        const integration = this.integrations.get(integrationId);
        if (!integration) {
            const error = `Integration ${integrationId} not found`;
            this.logger.error(error);
            return this.createErrorResponse(request.id, 404, error);
        }

        // Vérifier que l'intégration est active
        if (!integration.active) {
            const error = `Integration ${integrationId} is not active`;
            this.logger.warn(error);
            return this.createErrorResponse(request.id, 503, error);
        }

        const startTime = Date.now();
        const adapter = this.adapters.get(integrationId);

        try {
            let adaptedRequest: unknown;
            let rawResponse: unknown;

            // Adapter la requête si un adaptateur est disponible
            if (adapter) {
                adaptedRequest = await adapter.adaptRequest(request);
            } else {
                // Comportement par défaut pour les requêtes REST
                adaptedRequest = {
                    method: request.method,
                    url: `${integration.baseUrl}${request.path}`,
                    data: request.body,
                    params: request.params,
                    headers: { ...integration.defaultHeaders, ...request.headers },
                    timeout: integration.timeout
                };
            }

            // Exécuter la requête avec gestion des erreurs et des retries
            rawResponse = await this.executeRequestWithRetry(
                adaptedRequest,
                integration.options?.retries || 0,
                integration.options?.retryDelay || 1000
            );

            // Adapter la réponse si un adaptateur est disponible
            if (adapter) {
                return await adapter.adaptResponse(rawResponse);
            } else {
                // Créer une réponse générique à partir de la réponse HTTP brute
                return this.createSuccessResponse(
                    request.id,
                    rawResponse,
                    Date.now() - startTime
                );
            }
        } catch (error) {
            this.logger.error(`Error processing request ${request.id}`, { error });

            // Utiliser l'adaptateur pour gérer l'erreur, s'il est disponible
            if (adapter) {
                return await adapter.handleError(error);
            } else {
                return this.createErrorResponse(
                    request.id,
                    error instanceof Error && 'statusCode' in error
                        ? (error as any).statusCode
                        : 500,
                    error instanceof Error ? error.message : String(error)
                );
            }
        }
    }

    /**
     * Exécute une requête avec mécanisme de retry
     * @param request Requête à exécuter
     * @param maxRetries Nombre maximum de tentatives
     * @param retryDelay Délai entre les tentatives (ms)
     * @returns Réponse brute
     * @private
     */
    private async executeRequestWithRetry(
        request: unknown,
        maxRetries: number,
        retryDelay: number
    ): Promise<unknown> {
        let lastError: Error | null = null;
        let attempt = 0;

        while (attempt <= maxRetries) {
            try {
                return await this.httpClient.request(request);
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Incrémenter le compteur de tentatives
                attempt++;

                // Si c'était la dernière tentative, propager l'erreur
                if (attempt > maxRetries) {
                    throw lastError;
                }

                // Calculer le délai avec backoff exponentiel
                const delay = retryDelay * Math.pow(2, attempt - 1);
                this.logger.warn(`Request failed, retrying (${attempt}/${maxRetries}) after ${delay}ms`, {
                    error: lastError.message
                });

                // Attendre avant de réessayer
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        // Ce code ne devrait jamais être atteint grâce au throw dans la boucle
        throw lastError || new Error('Unknown error during request execution');
    }

    /**
     * Crée une réponse de succès
     * @param requestId ID de la requête
     * @param rawResponse Réponse brute
     * @param processingTime Temps de traitement (ms)
     * @returns Réponse API formatée
     * @private
     */
    private createSuccessResponse(
        requestId: string,
        rawResponse: unknown,
        processingTime: number
    ): APIResponse {
        // Extraire les données pertinentes de la réponse HTTP brute
        const responseData = rawResponse as any;

        return {
            requestId,
            statusCode: responseData.status || 200,
            headers: responseData.headers || {},
            body: responseData.data || {},
            message: 'Success',
            metadata: {
                source: 'integration-bridge',
                raw: false
            },
            timestamp: new Date(),
            processingTime
        };
    }

    /**
     * Crée une réponse d'erreur
     * @param requestId ID de la requête
     * @param statusCode Code de statut HTTP
     * @param message Message d'erreur
     * @returns Réponse API d'erreur
     * @private
     */
    private createErrorResponse(
        requestId: string,
        statusCode: number,
        message: string
    ): APIResponse {
        return {
            requestId,
            statusCode,
            headers: {},
            body: null,
            message,
            errors: [{
                code: `ERR_${statusCode}`,
                message
            }],
            metadata: {
                source: 'integration-bridge',
                raw: false
            },
            timestamp: new Date(),
            processingTime: 0
        };
    }

    /**
     * Désactive une intégration
     * @param integrationId ID de l'intégration
     * @returns true si l'intégration a été désactivée
     */
    public deactivateIntegration(integrationId: string): boolean {
        const integration = this.integrations.get(integrationId);
        if (!integration) {
            return false;
        }

        integration.active = false;
        this.integrations.set(integrationId, integration);

        this.logger.info(`Integration ${integrationId} has been deactivated`);
        return true;
    }

    /**
     * Supprime une intégration
     * @param integrationId ID de l'intégration
     * @returns true si l'intégration a été supprimée
     */
    public removeIntegration(integrationId: string): boolean {
        const removed = this.integrations.delete(integrationId);
        this.adapters.delete(integrationId);

        if (removed) {
            this.logger.info(`Integration ${integrationId} has been removed`);
        }

        return removed;
    }

    /**
     * Récupère toutes les intégrations
     * @returns Liste des configurations d'intégration
     */
    public getAllIntegrations(): IntegrationConfig[] {
        return Array.from(this.integrations.values());
    }

    /**
     * Récupère une intégration par son ID
     * @param id ID de l'intégration
     * @returns Configuration de l'intégration ou undefined
     */
    public getIntegration(id: string): IntegrationConfig | undefined {
        return this.integrations.get(id);
    }
}