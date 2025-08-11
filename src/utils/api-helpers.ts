import { NextRequest, NextResponse } from 'next/server';

/**
 * Types de réponses API possibles
 */
export type ApiSuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};

export type ApiErrorResponse = {
    success: false;
    error: string;
    code?: string;
    details?: unknown;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Options pour les gestionnaires d'API
 */
export interface ApiHandlerOptions {
    /** Capture les erreurs automatiquement */
    catchErrors?: boolean;
    /** Code HTTP par défaut pour les réponses réussies */
    successStatusCode?: number;
    /** Code HTTP par défaut pour les erreurs */
    errorStatusCode?: number;
}

const defaultOptions: ApiHandlerOptions = {
    catchErrors: true,
    successStatusCode: 200,
    errorStatusCode: 500,
};

/**
 * Utilitaire pour créer un gestionnaire d'API qui n'a pas besoin du paramètre request
 * @param handler Fonction qui retourne les données à envoyer
 * @param options Options du gestionnaire
 * @returns Fonction gestionnaire pour les routes API Next.js
 */
export function withApiHandler<T>(
    handler: () => T | Promise<T>,
    options: ApiHandlerOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
    const mergedOptions = { ...defaultOptions, ...options };

    return async (): Promise<NextResponse> => {
        try {
            const result = await handler();

            // Assurer que status est un nombre défini pour éviter l'erreur avec exactOptionalPropertyTypes
            const statusCode = mergedOptions.successStatusCode ?? 200;

            return NextResponse.json(
                { success: true, data: result },
                { status: statusCode }
            );
        } catch (error) {
            if (!mergedOptions.catchErrors) {
                throw error;
            }

            console.error('API error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Internal server error';

            // Assurer que status est un nombre défini pour éviter l'erreur avec exactOptionalPropertyTypes
            const statusCode = mergedOptions.errorStatusCode ?? 500;

            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: statusCode }
            );
        }
    };
}

/**
 * Utilitaire pour créer un gestionnaire d'API qui utilise le paramètre request
 * @param handler Fonction qui reçoit la requête et retourne les données à envoyer
 * @param options Options du gestionnaire 
 * @returns Fonction gestionnaire pour les routes API Next.js
 */
export function withRequestApiHandler<T>(
    handler: (request: NextRequest) => T | Promise<T>,
    options: ApiHandlerOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
    const mergedOptions = { ...defaultOptions, ...options };

    return async (request: NextRequest): Promise<NextResponse> => {
        try {
            const result = await handler(request);

            // Assurer que status est un nombre défini pour éviter l'erreur avec exactOptionalPropertyTypes
            const statusCode = mergedOptions.successStatusCode ?? 200;

            return NextResponse.json(
                { success: true, data: result },
                { status: statusCode }
            );
        } catch (error) {
            if (!mergedOptions.catchErrors) {
                throw error;
            }

            console.error('API error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Internal server error';

            // Assurer que status est un nombre défini pour éviter l'erreur avec exactOptionalPropertyTypes
            const statusCode = mergedOptions.errorStatusCode ?? 500;

            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: statusCode }
            );
        }
    };
}