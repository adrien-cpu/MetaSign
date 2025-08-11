/**
 * src/ai/api/integration/external/http-client.types.ts
 * Types pour le client HTTP utilisé par les services d'intégration externe
 */

/**
 * Configuration pour les requêtes HTTP
 */
export interface HttpRequestConfig {
    /** URL de la requête */
    url: string;
    /** Méthode HTTP */
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    /** Corps de la requête */
    data?: unknown;
    /** En-têtes HTTP */
    headers?: Record<string, string>;
    /** Paramètres de la requête */
    params?: Record<string, string>;
    /** Timeout en millisecondes */
    timeout?: number;
    /** Validation du certificat SSL */
    validateSSL?: boolean;
    /** Options avancées spécifiques au client */
    options?: Record<string, unknown>;
}

/**
 * Réponse HTTP
 */
export interface HttpResponse<T = unknown> {
    /** Statut HTTP */
    status: number;
    /** Statut texte */
    statusText: string;
    /** Données de la réponse */
    data: T;
    /** En-têtes HTTP */
    headers: Record<string, string>;
    /** Configuration de la requête */
    config: HttpRequestConfig;
    /** URL finale de la requête */
    url: string;
    /** Temps de réponse en millisecondes */
    responseTime?: number;
}

/**
 * Interface pour le client HTTP
 */
export interface HttpClient {
    /**
     * Exécute une requête HTTP
     * @param config Configuration de la requête
     * @returns Promesse avec la réponse HTTP
     */
    request<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>>;

    /**
     * Effectue une requête GET
     * @param url URL de la requête
     * @param config Configuration additionnelle
     * @returns Promesse avec la réponse HTTP
     */
    get<T = unknown>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>): Promise<HttpResponse<T>>;

    /**
     * Effectue une requête POST
     * @param url URL de la requête
     * @param data Corps de la requête
     * @param config Configuration additionnelle
     * @returns Promesse avec la réponse HTTP
     */
    post<T = unknown>(
        url: string,
        data?: unknown,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<HttpResponse<T>>;

    /**
     * Effectue une requête PUT
     * @param url URL de la requête
     * @param data Corps de la requête
     * @param config Configuration additionnelle
     * @returns Promesse avec la réponse HTTP
     */
    put<T = unknown>(
        url: string,
        data?: unknown,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<HttpResponse<T>>;

    /**
     * Effectue une requête DELETE
     * @param url URL de la requête
     * @param config Configuration additionnelle
     * @returns Promesse avec la réponse HTTP
     */
    delete<T = unknown>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>
    ): Promise<HttpResponse<T>>;

    /**
     * Effectue une requête PATCH
     * @param url URL de la requête
     * @param data Corps de la requête
     * @param config Configuration additionnelle
     * @returns Promesse avec la réponse HTTP
     */
    patch<T = unknown>(
        url: string,
        data?: unknown,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<HttpResponse<T>>;
}