// src/ai/api/core/APICore.ts
import { APIContext } from '@api/core/APIContext';
import { APIRegistry } from '@api/core/APIRegistry';
import { SecurityMiddlewareChain } from '@api/core/middleware/SecurityMiddlewareChain';
import { RateLimitingMiddleware } from '@api/core/middleware/middlewares/RateLimitingMiddleware';
import { SecurityHeadersMiddleware } from '@api/core/middleware/middlewares/SecurityHeadersMiddleware';
import { CacheManager } from '@api/core/middleware/CacheManager';
import {
    APIRequest,
    APIResponse,
    APIHandlerType,
    ResponseBody,
    RequestType
} from '@api/core/types';
import { SecurityServiceProvider } from '@api/core/middleware/di/SecurityServiceProvider';
import {
    CacheConfig,
    CacheLevel,
    CacheReplacementPolicy
} from '@ai/coordinators/types';

/**
 * Core API handling class that manages request processing through middleware
 * and appropriate handlers
 */
export class APICore {
    private static instance: APICore;
    private registry: APIRegistry;
    private middlewareChain: SecurityMiddlewareChain;
    private serviceProvider: SecurityServiceProvider;

    private constructor() {
        this.registry = new APIRegistry();
        this.middlewareChain = new SecurityMiddlewareChain();
        this.serviceProvider = new SecurityServiceProvider();
        this.initializeMiddleware();
    }

    /**
     * Get the singleton instance of APICore
     * @returns The APICore instance
     */
    static getInstance(): APICore {
        if (!APICore.instance) {
            APICore.instance = new APICore();
        }
        return APICore.instance;
    }

    /**
     * Handle an API request through the middleware chain and appropriate handler
     * @param request The API request to process
     * @returns Promise resolving to the API response
     */
    async handleRequest(request: APIRequest): Promise<APIResponse> {
        const context = new APIContext(request);

        // Créer une fonction "next" pour le middleware
        const next = async (): Promise<void> => {
            // Cette fonction sera appelée une fois que tous les middlewares auront traité la requête
            // Cela permet au dernier middleware d'appeler "next" sans erreur
        };

        await this.middlewareChain.process(context, next);

        // S'assurer que request.type existe avant de l'utiliser
        const requestType = request.type as APIHandlerType || RequestType.LSF;
        const handler = this.registry.getHandler(requestType);

        const result = await handler.processRequest(request);
        return result as APIResponse<ResponseBody>;
    }

    /**
     * Initialize the middleware chain with required middlewares
     */
    private initializeMiddleware(): void {
        // Créer des configurations de base pour les middlewares
        const rateLimitConfig = {
            defaultLimit: 100,
            windowMs: 60000 // 1 minute
        };

        // Configuration complète du cache conformément au type CacheConfig
        const cacheConfig: CacheConfig = {
            // Utiliser L1 au lieu de MEMORY (qui n'existe pas dans l'énumération)
            level: CacheLevel.L1,
            maxSize: 1000,
            defaultTTL: 300000, // 5 minutes
            // Utiliser l'énumération au lieu de la chaîne
            replacementPolicy: CacheReplacementPolicy.LRU,
            compressionEnabled: false,
            persistenceEnabled: false,
            predictionEnabled: true,
            // Ne pas inclure ttl et metrics qui ne font pas partie de l'interface
        };

        this.middlewareChain
            .use(new RateLimitingMiddleware(this.serviceProvider, rateLimitConfig))
            .use(new SecurityHeadersMiddleware())
            .use(new CacheManager(cacheConfig));
    }
}