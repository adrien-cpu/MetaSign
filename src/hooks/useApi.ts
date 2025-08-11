import { useState, useEffect, useCallback, useRef } from 'react';

// Importer depuis le chemin relatif pour éviter l'erreur du module non trouvé
import { fetchApi, ApiResponse, ApiOptions } from '../services/api';

/**
 * États possibles d'une requête API
 */
export type ApiState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Résultat d'un hook useApi
 * @interface UseApiResult
 * @template T Type des données attendues
 */
export interface UseApiResult<T> {
    /** Données retournées par l'API */
    data: T | null;
    /** Message d'erreur */
    error: string | null;
    /** État actuel de la requête */
    state: ApiState;
    /** Indique si la requête est en cours */
    loading: boolean;
    /** Fonction pour exécuter ou répéter la requête */
    execute: (options?: ApiOptions) => Promise<ApiResponse<T>>;
    /** Fonction pour réinitialiser l'état */
    reset: () => void;
}

/**
 * Interface des options du hook useApi
 * @interface UseApiOptions
 */
interface UseApiOptions<T> extends ApiOptions {
    /** Exécuter la requête automatiquement au montage */
    executeOnMount?: boolean;
    /** Fonction de transformation des données */
    transform?: (data: unknown) => T;
    /** Dépendances pour déclencher la requête */
    dependencies?: unknown[];
    /** Fonction de création de clé de cache */
    cacheKey?: string | ((url: string, options: ApiOptions) => string);
    /** Durée de vie du cache en millisecondes */
    cacheTtl?: number;
}

/**
 * Interface pour une entrée de cache
 * @interface CacheEntry
 * @template T Type des données en cache
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

const apiCache = new Map<string, CacheEntry<unknown>>();

/**
 * Hook personnalisé pour effectuer des requêtes API
 * @template T Type des données attendues
 * @param {string} url URL de la requête
 * @param {UseApiOptions<T>} options Options de la requête
 * @returns {UseApiResult<T>} Résultat de la requête et fonctions de contrôle
 */
export function useApi<T>(url: string, options: UseApiOptions<T> = {}): UseApiResult<T> {
    const {
        executeOnMount = true,
        transform,
        dependencies = [],
        cacheKey,
        cacheTtl = 5 * 60 * 1000, // 5 minutes par défaut
        ...fetchOptions
    } = options;

    // États pour suivre la requête
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [state, setState] = useState<ApiState>('idle');

    // Utiliser useRef pour stocker fetchOptions de manière stable
    const fetchOptionsRef = useRef(fetchOptions);

    // Mettre à jour la référence si fetchOptions change
    useEffect(() => {
        fetchOptionsRef.current = fetchOptions;
    }, [fetchOptions]);

    // Génération de la clé de cache
    const getCacheKey = useCallback(() => {
        if (!cacheKey) return null;
        if (typeof cacheKey === 'string') return cacheKey;
        return cacheKey(url, fetchOptionsRef.current);
    }, [cacheKey, url]);

    // Vérification du cache
    const checkCache = useCallback(() => {
        const key = getCacheKey();
        if (!key) return null;

        const cached = apiCache.get(key);
        if (!cached) return null;

        // Vérifier si l'entrée du cache est encore valide
        if (Date.now() - cached.timestamp <= cached.ttl) {
            return cached.data;
        }

        // Supprimer les entrées expirées
        apiCache.delete(key);
        return null;
    }, [getCacheKey]);

    // Mise en cache des résultats
    const cacheResult = useCallback(
        (result: ApiResponse<T>) => {
            const key = getCacheKey();
            if (!key || !result.success) return;

            apiCache.set(key, {
                data: result,
                timestamp: Date.now(),
                ttl: cacheTtl
            });
        },
        [getCacheKey, cacheTtl]
    );

    // Fonction d'exécution de la requête
    const execute = useCallback(
        async (executeOptions?: ApiOptions): Promise<ApiResponse<T>> => {
            setState('loading');

            // Vérifier d'abord le cache
            const cachedResult = checkCache();
            if (cachedResult) {
                setData(cachedResult as T);
                setError(null);
                setState('success');
                return cachedResult as ApiResponse<T>;
            }

            try {
                // Exécuter la requête API en utilisant les options actuelles de la référence
                const result = await fetchApi<T>(url, {
                    ...fetchOptionsRef.current,
                    ...executeOptions
                });

                // Appliquer la transformation si nécessaire
                if (transform && result.data) {
                    result.data = transform(result.data);
                }

                // Mettre à jour les états
                setData(result.data);
                setError(result.error);
                setState(result.success ? 'success' : 'error');

                // Mettre en cache le résultat si nécessaire
                cacheResult(result);

                return result;
            } catch (error) {
                // Gestion des erreurs non traitées
                const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                setData(null);
                setError(errorMessage);
                setState('error');

                return {
                    data: null,
                    error: errorMessage,
                    status: 0,
                    success: false
                };
            }
        },
        [url, checkCache, transform, cacheResult]
    );

    // Fonction pour réinitialiser l'état
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setState('idle');
    }, []);

    // Exécution au montage ou lorsque les dépendances changent
    useEffect(() => {
        if (executeOnMount) {
            execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [execute, executeOnMount, ...dependencies]);

    return {
        data,
        error,
        state,
        loading: state === 'loading',
        execute,
        reset
    };
}