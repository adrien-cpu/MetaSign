/**
 * src/ai/api/integration/external/ExternalApiManager.ts
 * Gestionnaire principal des API externes
 */

import { LogService } from '@api/common/monitoring/LogService';
import { WebhookManager } from './WebhookManager';
import { IntegrationBridge } from './IntegrationBridge';
import {
    APIRequest,
    APIResponse,
    ValidationResult
} from './types';
import { HttpClient } from './http-client.types';
import { createHash } from 'crypto';

/**
 * Options de configuration pour la mise en cache
 */
export interface CacheOptions {
    /** Indique si le cache est activé */
    enabled: boolean;
    /** Durée de vie en cache par défaut (ms) */
    defaultTTL: number;
}

/**
 * Classe responsable de la gestion des API externes
 */
export class ExternalAPIManager {
    private readonly logger = new LogService('ExternalAPIManager');
    private readonly webhookManager: WebhookManager;
    private readonly integrationBridge: IntegrationBridge;
    private readonly requestCache = new Map<string, {
        response: APIResponse;
        expiresAt: number;
    }>();
    private readonly apiKeyMap = new Map<string, string>();
    private readonly rateLimitMap = new Map<string, {
        count: number;
        resetTime: number;
    }>();
    // Définissez cacheOptions comme variable privée et non comme paramètre readonly
    private cacheOptions: CacheOptions;

    /**
     * Crée une instance du gestionnaire d'API externes
     * @param httpClient Client HTTP à utiliser pour les communications
     * @param cacheOptionsParam Options de mise en cache
     */
    constructor(
        httpClient: HttpClient,
        cacheOptionsParam: CacheOptions = {
            enabled: true,
            defaultTTL: 60000 // 1 minute par défaut
        }
    ) {
        this.logger.debug('ExternalAPIManager initializing');
        this.webhookManager = new WebhookManager(httpClient);
        this.integrationBridge = new IntegrationBridge(httpClient);
        this.cacheOptions = cacheOptionsParam;
    }

    /**
     * Point d'entrée principal pour le traitement des requêtes externes
     * @param request Requête API à traiter
     * @returns Réponse API
     */
    public async handleExternalRequest(request: APIRequest): Promise<APIResponse> {
        const requestId = request.id || this.generateRequestId(request);
        const startTime = Date.now();

        this.logger.info(`Processing external request ${requestId}`, {
            method: request.method,
            path: request.path
        });

        try {
            // Étape 1: Vérifier la limite de taux
            if (!this.checkRateLimit(request)) {
                return this.createErrorResponse(
                    requestId,
                    429,
                    'Rate limit exceeded. Try again later.',
                    startTime
                );
            }

            // Étape 2: Valider la requête
            const validationResult = await this.validateRequest(request);
            if (!validationResult.valid || !validationResult.request) {
                return this.createErrorResponse(
                    requestId,
                    400,
                    'Invalid request',
                    startTime,
                    validationResult.errors
                );
            }

            // Utiliser la requête validée
            const validatedRequest = validationResult.request;

            // Étape 3: Vérifier le cache si activé et applicable
            if (this.cacheOptions.enabled && request.method === 'GET') {
                const cacheKey = this.generateCacheKey(validatedRequest);
                const cachedResponse = this.getCachedResponse(cacheKey);

                if (cachedResponse) {
                    this.logger.debug(`Cache hit for request ${requestId}`);
                    // Mettre à jour les statistiques et renvoyer depuis le cache
                    return {
                        ...cachedResponse,
                        metadata: {
                            ...cachedResponse.metadata,
                            cached: true,
                            originalTimestamp: cachedResponse.timestamp
                        },
                        timestamp: new Date(),
                        processingTime: Date.now() - startTime
                    };
                }
            }

            // Étape 4: Traiter la requête
            const response = await this.processRequest(validatedRequest);

            // Étape 5: Mettre à jour la cache si applicable
            if (this.cacheOptions.enabled && request.method === 'GET' &&
                response.statusCode >= 200 && response.statusCode < 300) {
                const cacheKey = this.generateCacheKey(validatedRequest);
                const ttl = this.determineCacheTTL(validatedRequest);
                this.cacheResponse(cacheKey, response, ttl);
            }

            // Étape 6: Notifier les webhooks et renvoyer la réponse
            await this.webhookManager.notifySubscribers(response);

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error processing request ${requestId}`, { error: errorMessage });

            return this.createErrorResponse(
                requestId,
                500,
                'Internal server error',
                startTime
            );
        }
    }

    /**
     * Valide une requête API
     * @param request Requête à valider
     * @returns Résultat de validation
     * @private
     */
    private async validateRequest(request: APIRequest): Promise<ValidationResult> {
        this.logger.debug(`Validating request ${request.id}`);

        // Vérifications de base
        if (!request.method || !request.path) {
            return {
                valid: false,
                errors: [
                    { field: 'method', message: 'Method is required', code: 'MISSING_FIELD' },
                    { field: 'path', message: 'Path is required', code: 'MISSING_FIELD' }
                ]
            };
        }

        // Valider la méthode
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        if (!validMethods.includes(request.method.toUpperCase())) {
            return {
                valid: false,
                errors: [
                    { field: 'method', message: 'Invalid method', code: 'INVALID_METHOD' }
                ]
            };
        }

        // Valider l'authentification (exemple avec API key)
        const apiKey = request.headers['x-api-key'];
        if (apiKey && !this.validateApiKey(apiKey)) {
            return {
                valid: false,
                errors: [
                    { field: 'x-api-key', message: 'Invalid API key', code: 'INVALID_AUTH' }
                ]
            };
        }

        // Vérifications spécifiques à la méthode
        if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
            if (!request.body) {
                return {
                    valid: false,
                    errors: [
                        { field: 'body', message: 'Body is required', code: 'MISSING_FIELD' }
                    ]
                };
            }
        }

        // Normaliser la requête
        const validatedRequest: APIRequest = {
            ...request,
            id: request.id || this.generateRequestId(request),
            method: request.method.toUpperCase(),
            timestamp: request.timestamp || new Date(),
            headers: {
                ...request.headers,
                'x-request-id': request.id || this.generateRequestId(request)
            }
        };

        return {
            valid: true,
            request: validatedRequest
        };
    }

    /**
     * Traite une requête validée
     * @param request Requête validée
     * @returns Réponse API
     * @private
     */
    private async processRequest(request: APIRequest): Promise<APIResponse> {
        this.logger.debug(`Processing validated request ${request.id}`);
        const startTime = Date.now();

        // Déterminer l'intégration à utiliser
        const integrationId = this.determineTargetIntegration(request);

        if (!integrationId) {
            return this.createErrorResponse(
                request.id,
                404,
                'No suitable integration found for this request',
                startTime
            );
        }

        // Transmettre la requête via le pont d'intégration
        return await this.integrationBridge.transmitRequest(integrationId, request);
    }

    /**
     * Vérifie la limite de taux pour une requête
     * @param request Requête à vérifier
     * @returns true si la requête est autorisée
     * @private
     */
    private checkRateLimit(request: APIRequest): boolean {
        // Extraire l'identifiant du client (exemple : adresse IP ou clé API)
        const clientId = request.headers['x-api-key'] ||
            request.headers['x-forwarded-for'] ||
            'anonymous';

        const now = Date.now();
        const resetWindow = 60000; // 1 minute en ms
        const maxRequestsPerWindow = 100; // Limite de 100 requêtes par minute

        // Initialiser ou réinitialiser le compteur si nécessaire
        if (!this.rateLimitMap.has(clientId) || this.rateLimitMap.get(clientId)!.resetTime < now) {
            this.rateLimitMap.set(clientId, {
                count: 1,
                resetTime: now + resetWindow
            });
            return true;
        }

        // Vérifier et incrémenter le compteur existant
        const limit = this.rateLimitMap.get(clientId)!;
        if (limit.count >= maxRequestsPerWindow) {
            return false; // Limite dépassée
        }

        // Incrémenter le compteur
        limit.count++;
        return true;
    }

    /**
     * Valide une clé API
     * @param apiKey Clé API à valider
     * @returns true si la clé API est valide
     * @private
     */
    private validateApiKey(apiKey: string): boolean {
        return this.apiKeyMap.has(apiKey);
    }

    /**
     * Détermine l'intégration cible pour une requête
     * @param request Requête API
     * @returns Identifiant de l'intégration ou undefined
     * @private
     */
    private determineTargetIntegration(request: APIRequest): string | undefined {
        // Simple example logic - in reality, would be more sophisticated
        const path = request.path.toLowerCase();

        if (path.startsWith('/api/crm')) {
            return 'crm-integration';
        } else if (path.startsWith('/api/payment')) {
            return 'payment-gateway';
        } else if (path.startsWith('/api/analytics')) {
            return 'analytics-service';
        }

        // Default integration
        return 'default-integration';
    }

    /**
     * Génère un identifiant unique pour une requête
     * @param request Requête API
     * @returns Identifiant unique
     * @private
     */
    private generateRequestId(request: APIRequest): string {
        const timestamp = Date.now().toString();
        const randomPart = Math.random().toString(36).substring(2, 10);
        const hash = createHash('sha256')
            .update(`${request.method}:${request.path}:${timestamp}:${randomPart}`)
            .digest('hex')
            .substring(0, 8);

        return `req_${timestamp.substring(timestamp.length - 6)}_${hash}`;
    }

    /**
     * Génère une clé de cache pour une requête
     * @param request Requête API
     * @returns Clé de cache
     * @private
     */
    private generateCacheKey(request: APIRequest): string {
        // Générer une clé basée sur la méthode, le chemin et les paramètres
        const paramsString = request.params ?
            Object.entries(request.params)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `${k}=${v}`)
                .join('&')
            : '';

        return createHash('sha256')
            .update(`${request.method}:${request.path}:${paramsString}`)
            .digest('hex');
    }

    /**
     * Récupère une réponse en cache
     * @param cacheKey Clé de cache
     * @returns Réponse mise en cache ou undefined
     * @private
     */
    private getCachedResponse(cacheKey: string): APIResponse | undefined {
        const cachedItem = this.requestCache.get(cacheKey);

        if (!cachedItem) {
            return undefined;
        }

        // Vérifier si la réponse est expirée
        if (cachedItem.expiresAt < Date.now()) {
            this.requestCache.delete(cacheKey);
            return undefined;
        }

        return cachedItem.response;
    }

    /**
     * Met en cache une réponse
     * @param cacheKey Clé de cache
     * @param response Réponse à mettre en cache
     * @param ttl Durée de vie du cache (ms)
     * @private
     */
    private cacheResponse(cacheKey: string, response: APIResponse, ttl: number): void {
        this.requestCache.set(cacheKey, {
            response,
            expiresAt: Date.now() + ttl
        });

        // Faire un peu de ménage si le cache devient trop grand
        if (this.requestCache.size > 1000) {
            this.cleanupCache();
        }
    }

    /**
     * Nettoie les entrées expirées du cache
     * @private
     */
    private cleanupCache(): void {
        const now = Date.now();

        for (const [key, value] of this.requestCache.entries()) {
            if (value.expiresAt < now) {
                this.requestCache.delete(key);
            }
        }
    }

    /**
     * Détermine la durée de vie en cache pour une requête
     * @param request Requête API
     * @returns Durée de vie en ms
     * @private
     */
    private determineCacheTTL(request: APIRequest): number {
        // Utiliser les en-têtes de cache si disponibles
        if (request.headers['cache-control']) {
            const cacheControl = request.headers['cache-control'];
            const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);

            if (maxAgeMatch && maxAgeMatch[1]) {
                return parseInt(maxAgeMatch[1], 10) * 1000; // Convertir de secondes à ms
            }
        }

        // Sinon, utiliser des valeurs par défaut en fonction du chemin
        if (request.path.includes('/static/')) {
            return 3600000; // 1 heure pour les ressources statiques
        } else if (request.path.includes('/config/')) {
            return 300000; // 5 minutes pour les configurations
        }

        // Valeur par défaut
        return this.cacheOptions.defaultTTL;
    }

    /**
     * Crée une réponse d'erreur
     * @param requestId ID de la requête
     * @param statusCode Code de statut HTTP
     * @param message Message d'erreur
     * @param startTime Heure de début du traitement
     * @param errors Erreurs détaillées (optionnel)
     * @returns Réponse API d'erreur
     * @private
     */
    private createErrorResponse(
        requestId: string,
        statusCode: number,
        message: string,
        startTime: number,
        errors?: Array<{ field: string; message: string; code: string; }>
    ): APIResponse {
        return {
            requestId,
            statusCode,
            headers: {
                'content-type': 'application/json',
                'x-request-id': requestId
            },
            body: {
                error: {
                    message,
                    code: `ERR_${statusCode}`,
                    errors: errors || []
                }
            },
            message,
            errors: errors?.map(err => ({
                code: err.code,
                message: err.message,
                field: err.field
            })) || [{
                code: `ERR_${statusCode}`,
                message
            }],
            metadata: {
                source: 'external-api-manager',
                cached: false
            },
            timestamp: new Date(),
            processingTime: Date.now() - startTime
        };
    }

    /**
     * Enregistre une nouvelle clé API
     * @param apiKey Clé API
     * @param owner Propriétaire de la clé
     * @returns La clé API enregistrée
     */
    public registerApiKey(apiKey: string, owner: string): string {
        this.apiKeyMap.set(apiKey, owner);
        return apiKey;
    }

    /**
     * Révoque une clé API
     * @param apiKey Clé API à révoquer
     * @returns true si la clé a été révoquée
     */
    public revokeApiKey(apiKey: string): boolean {
        return this.apiKeyMap.delete(apiKey);
    }

    /**
     * Désactive temporairement les limites de taux pour un client
     * @param clientId ID du client
     * @param durationMs Durée de la désactivation en ms
     */
    public temporarilyDisableRateLimit(clientId: string, durationMs: number): void {
        // Supprimer l'entrée actuelle
        this.rateLimitMap.delete(clientId);

        // Rétablir après la durée spécifiée
        setTimeout(() => {
            this.rateLimitMap.set(clientId, {
                count: 0,
                resetTime: Date.now() + 60000
            });
        }, durationMs);
    }

    /**
     * Définit ou met à jour les options de cache
     * @param options Nouvelles options de cache
     */
    public updateCacheOptions(options: CacheOptions): void {
        this.cacheOptions = options;

        // Si le cache est désactivé, vider le cache existant
        if (!options.enabled) {
            this.requestCache.clear();
        }
    }
}