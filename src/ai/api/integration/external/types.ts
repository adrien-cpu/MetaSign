/**
 * src/ai/api/integration/external/types.ts
 * Types et interfaces pour les composants d'intégration externe
 */

/**
 * Représente une requête API externe
 */
export interface APIRequest {
    /** Identifiant unique de la requête */
    id: string;
    /** Type de requête (GET, POST, PUT, DELETE, etc.) */
    method: string;
    /** Chemin de la ressource demandée */
    path: string;
    /** En-têtes de la requête */
    headers: Record<string, string>;
    /** Corps de la requête (optionnel) */
    body?: unknown;
    /** Paramètres de requête */
    params?: Record<string, string>;
    /** Métadonnées associées à la requête */
    metadata?: Record<string, unknown>;
    /** Horodatage de la requête */
    timestamp: Date;
}

/**
 * Représente une réponse API externe
 */
export interface APIResponse {
    /** Identifiant unique de la réponse (correspond généralement à l'ID de la requête) */
    requestId: string;
    /** Code de statut HTTP */
    statusCode: number;
    /** En-têtes de la réponse */
    headers: Record<string, string>;
    /** Corps de la réponse */
    body: unknown;
    /** Message de statut */
    message: string;
    /** Erreurs (le cas échéant) */
    errors?: Array<{
        code: string;
        message: string;
        field?: string;
    }>;
    /** Métadonnées associées à la réponse */
    metadata?: Record<string, unknown>;
    /** Horodatage de la réponse */
    timestamp: Date;
    /** Temps de traitement en millisecondes */
    processingTime: number;
}

/**
 * Configuration pour un webhook
 */
export interface WebhookConfig {
    /** Identifiant unique du webhook */
    id: string;
    /** URL d'endpoint du webhook */
    url: string;
    /** Secret pour la signature des requêtes */
    secret: string;
    /** Types d'événements souscrits */
    events: string[];
    /** Format des données (JSON, XML, etc.) */
    format: 'JSON' | 'XML' | 'FORM';
    /** Indicateur d'activation */
    active: boolean;
    /** Nombre de tentatives en cas d'échec */
    retryCount: number;
    /** Délai entre les tentatives (en ms) */
    retryDelay: number;
    /** Limites de taux (événements par minute) */
    rateLimit?: number;
    /** Métadonnées personnalisées */
    metadata?: Record<string, unknown>;
}

/**
 * Représente un événement webhook
 */
export interface WebhookEvent {
    /** Identifiant unique de l'événement */
    id: string;
    /** Type d'événement */
    type: string;
    /** Données de l'événement */
    data: unknown;
    /** Horodatage de l'événement */
    timestamp: Date;
    /** Version de l'API associée */
    apiVersion: string;
}

/**
 * Configuration d'une intégration externe
 */
export interface IntegrationConfig {
    /** Identifiant unique de l'intégration */
    id: string;
    /** Nom de l'intégration */
    name: string;
    /** Type d'intégration (REST, SOAP, GraphQL, etc.) */
    type: string;
    /** URL de base */
    baseUrl: string;
    /** Méthode d'authentification */
    auth: {
        type: 'API_KEY' | 'OAUTH2' | 'JWT' | 'BASIC' | 'NONE';
        credentials: Record<string, string>;
    };
    /** En-têtes par défaut */
    defaultHeaders?: Record<string, string>;
    /** Timeout des requêtes en ms */
    timeout: number;
    /** Indicateur d'activation */
    active: boolean;
    /** Paramètres avancés */
    options?: {
        /** Nombre de tentatives en cas d'échec */
        retries?: number;
        /** Délai entre les tentatives (en ms) */
        retryDelay?: number;
        /** Indicateur de validation SSL */
        validateSSL?: boolean;
        /** ID des transformateurs à appliquer */
        transformers?: string[];
        /** Stratégie de mise en cache */
        caching?: {
            enabled: boolean;
            ttl: number;
        };
    };
    /** Webhooks associés */
    webhooks?: WebhookConfig[];
}

/**
 * Résultat de validation d'une requête API
 */
export interface ValidationResult {
    /** Indique si la validation a réussi */
    valid: boolean;
    /** Requête validée (si valid est true) */
    request?: APIRequest;
    /** Erreurs de validation (si valid est false) */
    errors?: Array<{
        field: string;
        message: string;
        code: string;
    }>;
}

/**
 * Statistiques d'utilisation d'API
 */
export interface APIStats {
    /** Nombre total de requêtes */
    totalRequests: number;
    /** Nombre de requêtes réussies */
    successfulRequests: number;
    /** Nombre de requêtes échouées */
    failedRequests: number;
    /** Temps de traitement moyen en ms */
    averageProcessingTime: number;
    /** Répartition par code de statut */
    statusCodeDistribution: Record<number, number>;
    /** Répartition par type de requête */
    methodDistribution: Record<string, number>;
    /** Horodatage de la dernière requête */
    lastRequestTimestamp?: Date;
    /** Taux d'utilisation (requêtes par minute) */
    requestRate: number;
}