// src/ai/api/core/APIContext.ts
/**
 * Contexte d'une requête API contenant toutes les informations
 * relatives à l'exécution d'une requête et sa réponse
 */
import {
    IAPIContext,
    APIRequest,
    APIResponse,
    MetadataValue,
    RequestBody,
    ResponseBody,
    SecurityContext
} from '@api/core/types';

/**
 * Implémentation du contexte API
 * Gère l'état et les fonctionnalités associées à une requête API
 */
export class APIContext<REQ extends RequestBody = RequestBody, RES extends ResponseBody = ResponseBody> implements IAPIContext<REQ, RES> {
    public readonly startTime: number;
    public readonly request: APIRequest<REQ>;
    public response: APIResponse<RES> | null;
    public errors: Error[] = [];
    public metadata: Map<string, MetadataValue> = new Map();
    public security?: SecurityContext;
    public fromCache?: boolean;
    public cacheTTL?: number;
    public cachePriority?: 'high' | 'medium' | 'low';
    public cacheTags?: string[];
    public doNotCache?: boolean;
    private _requestId: string = '';

    /**
     * Crée une nouvelle instance de contexte API
     * @param request La requête API
     */
    constructor(request: APIRequest<REQ>) {
        this.startTime = Date.now();
        this.request = request;
        this.response = null;

        // Initialiser l'ID de requête s'il est disponible dans la requête
        if (request.id) {
            this.requestId = request.id;
        }
    }

    /**
     * Retourne la durée d'exécution de la requête
     */
    get duration(): number {
        return Date.now() - this.startTime;
    }

    /**
     * Temps de réponse calculé à partir du début de la requête
     */
    get responseTime(): number {
        return this.duration;
    }

    /**
     * Getter pour l'identifiant de requête
     */
    get requestId(): string {
        return this._requestId || this.getMetadata('requestId') as string || '';
    }

    /**
     * Setter pour l'identifiant de requête
     */
    set requestId(value: string) {
        this._requestId = value;
        this.setMetadata('requestId', value);
    }

    /**
     * Ajoute une erreur au contexte
     * @param error Erreur à ajouter
     */
    addError(error: Error): void {
        this.errors.push(error);
    }

    /**
     * Définit une valeur de métadonnée
     * @param key Clé de la métadonnée
     * @param value Valeur de la métadonnée
     */
    setMetadata(key: string, value: MetadataValue): void {
        this.metadata.set(key, value);
    }

    /**
     * Récupère une valeur de métadonnée
     * @param key Clé de la métadonnée
     * @returns Valeur de la métadonnée ou undefined
     */
    getMetadata(key: string): MetadataValue | undefined {
        return this.metadata.get(key);
    }

    /**
     * Convertit le contexte en objet JSON
     * @returns Représentation JSON du contexte
     */
    toJSON(): Record<string, unknown> {
        return {
            requestId: this.requestId,
            duration: this.duration,
            request: this.request,
            response: this.response,
            errors: this.errors.map(error => ({
                name: error.name,
                message: error.message,
                stack: error.stack
            })),
            metadata: Object.fromEntries(this.metadata),
            security: this.security,
            fromCache: this.fromCache,
            cacheTTL: this.cacheTTL,
            cachePriority: this.cachePriority,
            cacheTags: this.cacheTags,
            doNotCache: this.doNotCache
        };
    }

    /**
     * Définit la réponse pour ce contexte
     * @param response La réponse API
     */
    setResponse(response: APIResponse<RES>): void {
        this.response = response;
    }

    /**
     * Crée une réponse de succès
     * @param body Les données de réponse
     * @param statusCode Code de statut HTTP (défaut: 200)
     * @returns La réponse créée
     */
    createSuccessResponse(body: RES, statusCode: number = 200): APIResponse<RES> {
        const response: APIResponse<RES> = {
            status: statusCode,
            statusCode: statusCode,
            headers: {},
            body: body,
            timestamp: Date.now(),
            duration: this.duration,
            metadata: {}
        };
        this.response = response;
        return response;
    }

    /**
     * Crée une réponse d'erreur
     * @param statusCode Code de statut HTTP
     * @param message Message d'erreur
     * @param code Code d'erreur 
     * @param details Détails supplémentaires
     * @returns La réponse d'erreur créée
     */
    createErrorResponse(
        statusCode: number,
        message: string,
        code: string = 'INTERNAL_ERROR',
        details?: Record<string, unknown>
    ): APIResponse<RES> {
        const errorBody = {
            error: {
                code,
                message,
                details
            }
        } as unknown as RES;

        const response: APIResponse<RES> = {
            status: statusCode,
            statusCode: statusCode,
            headers: {},
            body: errorBody,
            timestamp: Date.now(),
            duration: this.duration,
            metadata: {}
        };
        this.response = response;
        return response;
    }
}