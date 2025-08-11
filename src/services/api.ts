/**
 * Types et interfaces pour le service d'API
 */

/**
 * Réponse standardisée de l'API
 * @interface ApiResponse
 * @template T Type des données retournées
 */
export interface ApiResponse<T> {
    /** Données retournées par l'API, null en cas d'erreur */
    data: T | null;
    /** Message d'erreur, null en cas de succès */
    error: string | null;
    /** Code de statut HTTP */
    status: number;
    /** Succès de la requête */
    success: boolean;
}

/**
 * Options pour les requêtes API
 * @interface ApiOptions
 * @extends RequestInit Options standard fetch
 */
export interface ApiOptions extends RequestInit {
    /** Désactiver les alertes d'erreur automatiques */
    disableErrorAlert?: boolean;
    /** Utiliser une URL relative (true) ou absolue (false) */
    useRelativeUrl?: boolean;
    /** Délai d'expiration en millisecondes (par défaut: 30000ms) */
    timeout?: number;
}

/**
 * URL de base de l'API
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Effectue une requête API et retourne une réponse standardisée
 * @template T Type de données attendu dans la réponse
 * @param {string} url URL de la requête, relative ou absolue selon les options
 * @param {ApiOptions} options Options de la requête
 * @returns {Promise<ApiResponse<T>>} Réponse standardisée
 */
export async function fetchApi<T>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const {
        useRelativeUrl = true,
        timeout = 30000,
        ...fetchOptions
    } = options;

    // Construction de l'URL complète si nécessaire
    const fullUrl = useRelativeUrl ? `${API_BASE_URL}${url}` : url;

    // Préparation des en-têtes par défaut
    const headers = new Headers(fetchOptions.headers);

    // S'assurer que Content-Type est défini pour les requêtes POST, PUT, PATCH avec un corps
    if (
        !headers.has('Content-Type') &&
        ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method?.toUpperCase() || '') &&
        fetchOptions.body
    ) {
        headers.set('Content-Type', 'application/json');
    }

    // Préparation de l'objet final des options
    const finalOptions: RequestInit = {
        ...fetchOptions,
        headers
    };

    // Création d'un contrôleur pour gérer le délai d'expiration
    const controller = new AbortController();

    // Si aucun signal n'est déjà fourni, on utilise celui du contrôleur
    if (!finalOptions.signal) {
        finalOptions.signal = controller.signal;
    }

    // Configuration du délai d'expiration
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeout);

    try {
        // Exécution de la requête
        const response = await fetch(fullUrl, finalOptions);

        // Nettoyage du délai d'expiration
        clearTimeout(timeoutId);

        // Vérification du type de contenu pour les réponses JSON
        const contentType = response.headers.get('content-type');
        let data: T | null = null;
        let error: string | null = null;

        if (contentType && contentType.includes('application/json')) {
            try {
                // Tentative de lecture du corps en JSON
                const jsonResponse = await response.json();

                if (response.ok) {
                    // La requête a réussi
                    data = jsonResponse;
                } else {
                    // La requête a échoué avec un code d'erreur
                    error = jsonResponse.message || jsonResponse.error || 'Une erreur est survenue';
                }
            } catch (parseError) {
                // Erreur lors du parsing JSON
                console.error('Erreur lors du parsing JSON:', parseError);
                error = 'Erreur lors du traitement de la réponse';
            }
        } else if (response.ok) {
            // Réponse non-JSON réussie
            data = await response.text() as unknown as T;
        } else {
            // Réponse non-JSON en erreur
            error = `Erreur ${response.status}: ${response.statusText}`;
        }

        // Affichage des erreurs dans la console en développement
        if (!response.ok && process.env.NODE_ENV === 'development') {
            console.error(`Erreur API (${response.status}):`, error);
        }

        // Construction de la réponse standardisée
        return {
            data,
            error,
            status: response.status,
            success: response.ok
        };
    } catch (error) {
        // Nettoyage du délai d'expiration
        clearTimeout(timeoutId);

        // Gestion des erreurs réseau et des annulations
        if (error instanceof DOMException && error.name === 'AbortError') {
            console.error('Requête annulée par délai d\'expiration');
            return {
                data: null,
                error: 'La requête a expiré',
                status: 0,
                success: false
            };
        }

        // Autres erreurs réseau
        console.error('Erreur réseau:', error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Erreur réseau inconnue',
            status: 0,
            success: false
        };
    }
}

/**
 * Effectue une requête GET
 * @template T Type de données attendu
 * @param {string} url URL de la requête
 * @param {ApiOptions} options Options de la requête
 * @returns {Promise<ApiResponse<T>>} Réponse standardisée
 */
export function get<T>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, { ...options, method: 'GET' });
}

/**
 * Effectue une requête POST
 * @template T Type de données attendu
 * @template U Type du corps de la requête
 * @param {string} url URL de la requête
 * @param {U} body Corps de la requête
 * @param {ApiOptions} options Options de la requête
 * @returns {Promise<ApiResponse<T>>} Réponse standardisée
 */
export function post<T, U = unknown>(
    url: string,
    body: U,
    options: ApiOptions = {}
): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
    });
}

/**
 * Effectue une requête PUT
 * @template T Type de données attendu
 * @template U Type du corps de la requête
 * @param {string} url URL de la requête
 * @param {U} body Corps de la requête
 * @param {ApiOptions} options Options de la requête
 * @returns {Promise<ApiResponse<T>>} Réponse standardisée
 */
export function put<T, U = unknown>(
    url: string,
    body: U,
    options: ApiOptions = {}
): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

/**
 * Effectue une requête PATCH
 * @template T Type de données attendu
 * @template U Type du corps de la requête
 * @param {string} url URL de la requête
 * @param {U} body Corps de la requête
 * @param {ApiOptions} options Options de la requête
 * @returns {Promise<ApiResponse<T>>} Réponse standardisée
 */
export function patch<T, U = unknown>(
    url: string,
    body: U,
    options: ApiOptions = {}
): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(body)
    });
}

/**
 * Effectue une requête DELETE
 * @template T Type de données attendu
 * @param {string} url URL de la requête
 * @param {ApiOptions} options Options de la requête
 * @returns {Promise<ApiResponse<T>>} Réponse standardisée
 */
export function del<T>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, { ...options, method: 'DELETE' });
}