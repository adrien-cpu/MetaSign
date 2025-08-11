// src/ai/validation/types/api.types.ts
import { ValidationState } from './index';

/**
 * Méthodes HTTP supportées
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Structure d'une requête API
 */
export interface ApiRequest {
    /**
     * Méthode HTTP
     */
    method: HttpMethod;

    /**
     * Chemin de la ressource
     */
    path: string;

    /**
     * Paramètres d'URL
     */
    params: Record<string, string>;

    /**
     * Paramètres de requête
     */
    query: Record<string, string>;

    /**
     * Corps de la requête
     */
    body?: Record<string, unknown>;

    /**
     * En-têtes HTTP
     */
    headers: Record<string, string>;
}

/**
 * Structure d'une réponse API
 */
export interface ApiResponse {
    /**
     * Code de statut HTTP
     */
    status: number;

    /**
     * Corps de la réponse
     */
    body: Record<string, unknown>;

    /**
     * En-têtes HTTP
     */
    headers?: Record<string, string>;
}

/**
 * Type des gestionnaires d'endpoint
 */
export type EndpointHandler = (request: ApiRequest) => Promise<ApiResponse>;

/**
 * Définition d'un endpoint
 */
export interface Endpoint {
    /**
     * Méthode HTTP
     */
    method: HttpMethod;

    /**
     * Chemin de la ressource
     */
    path: string;

    /**
     * Gestionnaire de l'endpoint
     */
    handler: EndpointHandler;

    /**
     * Rôles autorisés
     */
    roles?: string[];
}

/**
 * Structure pour la mise à jour d'état de validation
 */
export interface ValidationStateUpdateRequest {
    /**
     * Nouvel état de la validation
     */
    state: ValidationState;

    /**
     * Raison du changement d'état
     */
    reason?: string;
}

/**
 * Structure pour les options d'export
 */
export interface ExportOptions {
    includeValidations?: boolean;
    includeExperts?: boolean;
    includeThematicClubs?: boolean;
    startDate?: Date;
    endDate?: Date;
    metadata?: Record<string, unknown>;
}

/**
 * Structure pour les options d'import
 */
export interface ImportOptions {
    conflictStrategy: 'skip' | 'replace' | 'merge';
    transformIds?: boolean;
    idPrefix?: string;
}

/**
 * Structure des données importées
 */
export interface ImportStats {
    imported: {
        validations: number;
        feedbacks: number;
        experts: number;
        thematicClubs: number;
    };
    skipped: {
        validations: number;
        feedbacks: number;
        experts: number;
        thematicClubs: number;
    };
    errors: string[];
}