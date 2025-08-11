// src/ai/validation/services/RestApiService.ts
import { ICollaborationManager } from '../interfaces/ICollaborationManager';
import { EnhancedCollaborationManager } from '../implementations/EnhancedCollaborationManager';
import { getThematicClubService, ThematicClubService } from './thematic-club-service';
import { getDataPersistenceService, DataPersistenceService } from './DataPersistenceService';
import {
    CollaborativeValidationRequest,
    ValidationFeedback,
    Result,
    PaginationOptions
} from '../types';
import {
    ApiRequest,
    ApiResponse,
    Endpoint,
    HttpMethod,
    ValidationStateUpdateRequest
} from '../types/api.types';

/**
 * Service d'API REST
 * Expose les fonctionnalités du système de validation via une API HTTP
 */
export class RestApiService {
    private readonly collaborationManager: ICollaborationManager;
    private readonly thematicClubService: ThematicClubService;
    private readonly dataPersistenceService: DataPersistenceService;
    private readonly endpoints: Endpoint[] = [];
    private initialized = false;

    /**
     * Crée une nouvelle instance du service d'API REST
     * @param collaborationManager Gestionnaire de collaboration
     */
    constructor(collaborationManager?: ICollaborationManager) {
        this.collaborationManager = collaborationManager || new EnhancedCollaborationManager();
        this.thematicClubService = getThematicClubService();
        this.dataPersistenceService = getDataPersistenceService();
    }

    /**
     * Initialise le service
     */
    async initialize(): Promise<boolean> {
        if (this.initialized) {
            return true;
        }

        // Initialiser le gestionnaire de collaboration
        const initResult = await this.collaborationManager.initialize();
        if (!initResult.success) {
            console.error('Failed to initialize collaboration manager:', initResult.error);
            return false;
        }

        // Enregistrer les endpoints
        this.registerEndpoints();

        this.initialized = true;
        return true;
    }

    /**
     * Traite une requête API
     * @param request Requête à traiter
     * @returns Réponse à la requête
     */
    async handleRequest(request: ApiRequest): Promise<ApiResponse> {
        // Vérifier que le service est initialisé
        if (!this.initialized) {
            return {
                status: 503,
                body: {
                    error: 'Service Unavailable',
                    message: 'API service is not initialized'
                }
            };
        }

        // Trouver l'endpoint correspondant
        const endpoint = this.findEndpoint(request.method, request.path);
        if (!endpoint) {
            return {
                status: 404,
                body: {
                    error: 'Not Found',
                    message: `Endpoint not found: ${request.method} ${request.path}`
                }
            };
        }

        try {
            // Exécuter le gestionnaire d'endpoint
            return await endpoint.handler(request);
        } catch (error) {
            // Gérer les erreurs inattendues
            console.error('Error handling request:', error);

            return {
                status: 500,
                body: {
                    error: 'Internal Server Error',
                    message: error instanceof Error ? error.message : String(error)
                }
            };
        }
    }

    /**
     * Trouve l'endpoint correspondant à une méthode et un chemin
     * @param method Méthode HTTP
     * @param path Chemin de la ressource
     * @returns Endpoint correspondant ou undefined
     */
    private findEndpoint(method: HttpMethod, path: string): Endpoint | undefined {
        return this.endpoints.find(endpoint => {
            if (endpoint.method !== method) {
                return false;
            }

            // Vérifier si le chemin correspond (support des paramètres dynamiques)
            const pathPattern = endpoint.path.replace(/\{([^}]+)\}/g, '([^/]+)');
            const regex = new RegExp(`^${pathPattern}$`);

            return regex.test(path);
        });
    }

    /**
     * Enregistre tous les endpoints de l'API
     */
    private registerEndpoints(): void {
        // Regrouper les endpoints par domaine
        this.registerValidationEndpoints();
        this.registerExpertEndpoints();
        this.registerThematicClubEndpoints();
        this.registerAuthEndpoints();
        this.registerAdminEndpoints();
    }

    /**
     * Extrait les options de pagination d'une requête
     * @param query Paramètres de requête
     * @returns Options de pagination
     */
    private extractPaginationOptions(query: Record<string, string>): PaginationOptions {
        return {
            page: query.page ? parseInt(query.page, 10) : 1,
            limit: query.limit ? parseInt(query.limit, 10) : 10,
            sortBy: query.sortBy || 'createdAt',
            sortDirection: (query.sortDirection as 'asc' | 'desc') || 'desc'
        };
    }

    /**
     * Convertit un résultat en réponse API
     * @param result Résultat à convertir
     * @param successStatus Code de statut en cas de succès
     * @returns Réponse API
     */
    private resultToResponse<T>(result: Result<T>, successStatus = 200): ApiResponse {
        if (result.success) {
            return {
                status: successStatus,
                body: result.data !== undefined ? { data: result.data } : { success: true }
            };
        } else {
            const errorStatus = this.getErrorStatusCode(result.error?.code);

            return {
                status: errorStatus,
                body: {
                    error: result.error?.code || 'UNKNOWN_ERROR',
                    message: result.error?.message || 'An unexpected error occurred',
                    details: result.error?.details
                }
            };
        }
    }

    /**
     * Détermine le code de statut HTTP à partir d'un code d'erreur
     * @param errorCode Code d'erreur
     * @returns Code de statut HTTP
     */
    private getErrorStatusCode(errorCode?: string): number {
        switch (errorCode) {
            case 'RESOURCE_NOT_FOUND':
            case 'VALIDATION_NOT_FOUND':
            case 'EXPERT_NOT_FOUND':
                return 404;
            case 'PERMISSION_DENIED':
                return 403;
            case 'INVALID_DATA':
            case 'MISSING_REQUIRED_FIELD':
                return 400;
            case 'DUPLICATE_ENTRY':
                return 409;
            case 'INVALID_STATE':
                return 422;
            default:
                return 500;
        }
    }

    /**
     * Enregistre les endpoints liés aux validations
     */
    private registerValidationEndpoints(): void {
        // Lister les validations
        this.endpoints.push({
            method: 'GET',
            path: '/api/validations',
            handler: this.listValidations.bind(this)
        });

        // Obtenir une validation
        this.endpoints.push({
            method: 'GET',
            path: '/api/validations/{id}',
            handler: this.getValidation.bind(this)
        });

        // Créer une validation
        this.endpoints.push({
            method: 'POST',
            path: '/api/validations',
            handler: this.createValidation.bind(this)
        });

        // Mettre à jour l'état d'une validation
        this.endpoints.push({
            method: 'PATCH',
            path: '/api/validations/{id}/state',
            handler: this.updateValidationState.bind(this)
        });

        // Lister les feedbacks d'une validation
        this.endpoints.push({
            method: 'GET',
            path: '/api/validations/{id}/feedback',
            handler: this.listFeedback.bind(this)
        });

        // Ajouter un feedback à une validation
        this.endpoints.push({
            method: 'POST',
            path: '/api/validations/{id}/feedback',
            handler: this.addFeedback.bind(this)
        });

        // Rechercher des validations
        this.endpoints.push({
            method: 'POST',
            path: '/api/validations/search',
            handler: this.searchValidations.bind(this)
        });
    }

    /**
     * Enregistre les endpoints liés aux experts
     */
    private registerExpertEndpoints(): void {
        // Lister les experts
        this.endpoints.push({
            method: 'GET',
            path: '/api/experts',
            handler: this.listExperts.bind(this)
        });

        // Obtenir un expert
        this.endpoints.push({
            method: 'GET',
            path: '/api/experts/{id}',
            handler: this.getExpert.bind(this)
        });

        // Créer un expert
        this.endpoints.push({
            method: 'POST',
            path: '/api/experts',
            handler: this.createExpert.bind(this)
        });
    }

    /**
     * Enregistre les endpoints liés aux clubs thématiques
     */
    private registerThematicClubEndpoints(): void {
        // Lister les clubs
        this.endpoints.push({
            method: 'GET',
            path: '/api/clubs',
            handler: this.listClubs.bind(this)
        });

        // Obtenir un club
        this.endpoints.push({
            method: 'GET',
            path: '/api/clubs/{id}',
            handler: this.getClub.bind(this)
        });

        // Créer un club
        this.endpoints.push({
            method: 'POST',
            path: '/api/clubs',
            handler: this.createClub.bind(this),
            roles: ['admin']
        });
    }

    /**
     * Enregistre les endpoints d'authentification
     */
    private registerAuthEndpoints(): void {
        // Login
        this.endpoints.push({
            method: 'POST',
            path: '/api/auth/login',
            handler: this.login.bind(this)
        });

        // Logout
        this.endpoints.push({
            method: 'POST',
            path: '/api/auth/logout',
            handler: this.logout.bind(this)
        });
    }

    /**
     * Enregistre les endpoints d'administration
     */
    private registerAdminEndpoints(): void {
        // Statistiques du système
        this.endpoints.push({
            method: 'GET',
            path: '/api/admin/stats',
            handler: this.getSystemStats.bind(this),
            roles: ['admin']
        });

        // Export des données
        this.endpoints.push({
            method: 'POST',
            path: '/api/admin/export',
            handler: this.exportData.bind(this),
            roles: ['admin']
        });
    }

    /**
     * Gestionnaire pour lister les validations
     */
    private async listValidations(request: ApiRequest): Promise<ApiResponse> {
        const paginationOptions = this.extractPaginationOptions(request.query);

        // Dans une implémentation réelle, on utiliserait searchValidations avec un filtre vide
        const result = await this.collaborationManager.searchValidations({}, paginationOptions);

        return this.resultToResponse(result);
    }

    /**
     * Gestionnaire pour obtenir une validation
     */
    private async getValidation(request: ApiRequest): Promise<ApiResponse> {
        const id = request.params.id;
        const result = await this.collaborationManager.getValidationState(id);

        return this.resultToResponse(result);
    }

    /**
     * Gestionnaire pour créer une validation
     */
    private async createValidation(request: ApiRequest): Promise<ApiResponse> {
        // Vérifier le body
        if (!request.body) {
            return {
                status: 400,
                body: {
                    error: 'MISSING_REQUIRED_FIELD',
                    message: 'Request body is required'
                }
            };
        }

        const validationRequest = request.body as unknown as CollaborativeValidationRequest;
        const result = await this.collaborationManager.submitProposal(validationRequest);

        return this.resultToResponse(result, 201);
    }

    /**
     * Gestionnaire pour mettre à jour l'état d'une validation
     */
    private async updateValidationState(request: ApiRequest): Promise<ApiResponse> {
        const id = request.params.id;

        // Vérifier le body
        if (!request.body) {
            return {
                status: 400,
                body: {
                    error: 'MISSING_REQUIRED_FIELD',
                    message: 'Request body is required'
                }
            };
        }

        const stateUpdate = request.body as unknown as ValidationStateUpdateRequest;

        // Convertissons l'état en chaîne de caractères pour éviter les conflits de type
        // Changeons @ts-ignore pour @ts-expect-error qui est recommandé par ESLint
        const result = await this.collaborationManager.updateValidationState(
            id,
            // @ts-expect-error - Il y a un conflit entre différentes définitions de ValidationState
            stateUpdate.state.toString(),
            stateUpdate.reason
        );

        return this.resultToResponse(result);
    }

    /**
     * Gestionnaire pour lister les feedbacks d'une validation
     */
    private async listFeedback(request: ApiRequest): Promise<ApiResponse> {
        const id = request.params.id;
        const paginationOptions = this.extractPaginationOptions(request.query);

        const result = await this.collaborationManager.getAllFeedback(id, paginationOptions);

        return this.resultToResponse(result);
    }

    /**
     * Gestionnaire pour ajouter un feedback à une validation
     */
    private async addFeedback(request: ApiRequest): Promise<ApiResponse> {
        const id = request.params.id;

        if (!request.body) {
            return {
                status: 400,
                body: {
                    error: 'MISSING_REQUIRED_FIELD',
                    message: 'Request body is required'
                }
            };
        }

        const feedback = request.body as unknown as ValidationFeedback;
        const result = await this.collaborationManager.addFeedback(id, feedback);

        return this.resultToResponse(result, 201);
    }

    /**
     * Gestionnaire pour rechercher des validations
     */
    private async searchValidations(request: ApiRequest): Promise<ApiResponse> {
        if (!request.body) {
            return {
                status: 400,
                body: {
                    error: 'MISSING_REQUIRED_FIELD',
                    message: 'Request body is required'
                }
            };
        }

        const criteria = request.body.criteria || {};
        const paginationOptions = request.body.pagination || this.extractPaginationOptions(request.query);

        const result = await this.collaborationManager.searchValidations(criteria, paginationOptions);

        return this.resultToResponse(result);
    }

    /**
     * Gestionnaire pour lister les experts
     */
    private async listExperts({ }: ApiRequest): Promise<ApiResponse> {
        // Dans une implémentation réelle, on récupérerait les experts depuis une base de données
        return {
            status: 200,
            body: {
                data: []
            }
        };
    }

    /**
     * Gestionnaire pour obtenir un expert
     */
    private async getExpert(request: ApiRequest): Promise<ApiResponse> {
        const id = request.params.id;

        // Dans une implémentation réelle, on récupérerait l'expert
        return {
            status: 200,
            body: {
                data: {
                    id,
                    name: 'Expert Name',
                    expertiseLevel: 'EXPERT'
                }
            }
        };
    }

    /**
     * Gestionnaire pour créer un expert
     */
    private async createExpert(request: ApiRequest): Promise<ApiResponse> {
        if (!request.body) {
            return {
                status: 400,
                body: {
                    error: 'MISSING_REQUIRED_FIELD',
                    message: 'Request body is required'
                }
            };
        }

        // Dans une implémentation réelle, on enregistrerait l'expert
        return {
            status: 201,
            body: {
                data: {
                    id: `expert_${Date.now()}`
                }
            }
        };
    }

    /**
     * Gestionnaire pour lister les clubs
     */
    private async listClubs({ }: ApiRequest): Promise<ApiResponse> {
        // Dans une implémentation réelle, on utiliserait une méthode comme getAllClubs
        // Mais ici nous retournons un tableau vide
        return {
            status: 200,
            body: {
                data: []
            }
        };
    }

    /**
     * Gestionnaire pour obtenir un club
     */
    private async getClub(request: ApiRequest): Promise<ApiResponse> {
        const id = request.params.id;
        const result = await this.thematicClubService.getClub(id);
        return this.resultToResponse(result);
    }

    /**
     * Gestionnaire pour créer un club
     */
    private async createClub(request: ApiRequest): Promise<ApiResponse> {
        if (!request.body) {
            return {
                status: 400,
                body: {
                    error: 'MISSING_REQUIRED_FIELD',
                    message: 'Request body is required'
                }
            };
        }

        // Dans une implémentation réelle, on créerait le club
        // Pour ce stub, nous renvoyons un succès simulé
        return {
            status: 201,
            body: {
                data: {
                    id: `club_${Date.now()}`
                }
            }
        };
    }

    /**
     * Gestionnaire d'authentification
     */
    private async login(request: ApiRequest): Promise<ApiResponse> {
        if (!request.body || !request.body.username || !request.body.password) {
            return {
                status: 400,
                body: {
                    error: 'MISSING_REQUIRED_FIELD',
                    message: 'Username and password are required'
                }
            };
        }

        // Dans une implémentation réelle, on authentifierait l'utilisateur
        return {
            status: 200,
            body: {
                token: 'simulated_jwt_token',
                user: {
                    id: 'user123',
                    username: request.body.username as string,
                    roles: ['user']
                }
            }
        };
    }

    /**
     * Gestionnaire de déconnexion
     */
    private async logout({ }: ApiRequest): Promise<ApiResponse> {
        return {
            status: 200,
            body: {
                success: true
            }
        };
    }

    /**
     * Gestionnaire pour les statistiques du système
     */
    private async getSystemStats({ }: ApiRequest): Promise<ApiResponse> {
        // Dans une implémentation réelle, on récupérerait les statistiques
        return {
            status: 200,
            body: {
                data: {
                    totalValidations: 0,
                    pendingValidations: 0,
                    completedValidations: 0,
                    totalExperts: 0,
                    totalClubs: 0,
                    averageCompletionTime: 0,
                    averageFeedbacksPerValidation: 0
                }
            }
        };
    }

    /**
     * Gestionnaire pour l'export des données
     */
    private async exportData({ }: ApiRequest): Promise<ApiResponse> {
        // Dans une implémentation réelle, on exporterait les données
        return {
            status: 200,
            body: {
                data: "{ \"version\": \"1.0\", \"exportDate\": \"2023-01-01T00:00:00.000Z\" }"
            },
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': 'attachment; filename="validation_export.json"'
            }
        };
    }
}

// Singleton pour un accès global
let globalRestApiService: RestApiService | null = null;

/**
 * Obtient l'instance globale du service d'API REST
 * @param collaborationManager Gestionnaire de collaboration optionnel
 * @returns Instance du service
 */
export function getRestApiService(collaborationManager?: ICollaborationManager): RestApiService {
    if (!globalRestApiService) {
        globalRestApiService = new RestApiService(collaborationManager);
        globalRestApiService.initialize().catch(error => {
            console.error('Failed to initialize REST API service:', error);
        });
    }
    return globalRestApiService;
}

/**
 * Réinitialise l'instance globale du service
 * Utile principalement pour les tests
 */
export function resetRestApiService(): void {
    globalRestApiService = null;
}