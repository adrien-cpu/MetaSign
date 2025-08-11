// src/ai/validation/utils/pagination-helpers.ts
import { PaginationOptions, PaginatedResult } from '../types';

/**
 * Applique la pagination à une collection d'éléments
 * @param items Collection complète d'éléments
 * @param options Options de pagination (page, limite, tri)
 * @returns Résultat paginé contenant les éléments et les métadonnées de pagination
 */
export function paginate<T extends Record<string, unknown>>(items: T[], options?: PaginationOptions): PaginatedResult<T> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const sortBy = options?.sortBy;
    const sortDirection = options?.sortDirection || 'asc';

    // Appliquer le tri si spécifié
    const sortedItems = [...items];
    if (sortBy) {
        sortedItems.sort((a, b) => {
            const aValue = a[sortBy as keyof T];
            const bValue = b[sortBy as keyof T];

            // Gérer les types de données courants
            if (aValue === bValue) return 0;

            // Comparer selon la direction de tri
            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    // Calculer les indices pour la découpe
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, items.length);

    // Limiter les items selon la pagination
    const paginatedItems = sortedItems.slice(startIndex, endIndex);

    // Créer le résultat paginé
    return {
        items: paginatedItems,
        total: items.length,
        page,
        pageCount: Math.ceil(items.length / limit)
    };
}

/**
 * Valide et normalise les options de pagination
 * @param options Options de pagination brutes
 * @returns Options de pagination normalisées
 */
export function normalizePaginationOptions(options?: Partial<PaginationOptions>): PaginationOptions {
    // Définir une valeur par défaut pour sortBy pour éviter l'erreur d'exactOptionalPropertyTypes
    const normalizedSortBy = options?.sortBy || 'id';

    return {
        page: Math.max(1, options?.page || 1),
        limit: Math.min(100, Math.max(1, options?.limit || 10)),
        sortBy: normalizedSortBy,
        sortDirection: options?.sortDirection === 'desc' ? 'desc' : 'asc'
    };
}

/**
 * Crée un lien de pagination pour les API REST
 * @param baseUrl URL de base de l'API
 * @param options Options de pagination actuelles
 * @param total Nombre total d'éléments
 * @returns Liens de pagination (premier, précédent, suivant, dernier)
 */
export function createPaginationLinks(
    baseUrl: string,
    options: PaginationOptions,
    total: number
): Record<string, string | null> {
    // S'assurer que page et limit ne sont pas undefined
    const page = options.page || 1;
    const limit = options.limit || 10;
    const lastPage = Math.ceil(total / limit);

    // Créer un helper pour construire les URLs
    const createUrl = (pageNum: number) => {
        const url = new URL(baseUrl);
        url.searchParams.set('page', pageNum.toString());
        url.searchParams.set('limit', limit.toString());

        if (options.sortBy) {
            url.searchParams.set('sortBy', options.sortBy);
        }

        if (options.sortDirection) {
            url.searchParams.set('sortDirection', options.sortDirection);
        }

        return url.toString();
    };

    // Construire les liens de pagination
    return {
        first: createUrl(1),
        prev: page > 1 ? createUrl(page - 1) : null,
        next: page < lastPage ? createUrl(page + 1) : null,
        last: createUrl(lastPage)
    };
}