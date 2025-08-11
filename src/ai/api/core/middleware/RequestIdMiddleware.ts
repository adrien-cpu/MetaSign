// src/ai/api/core/middleware/RequestIdMiddleware.ts
import { AbstractMiddleware } from './AbstractMiddleware';
import { IAPIContext, NextFunction } from '@api/core/types';
import { v4 as uuidv4 } from 'uuid';
// Suppression de l'importation inutilisée de MiddlewareOptions

/**
 * Options pour le middleware de génération d'identifiant de requête
 */
export interface RequestIdOptions {
    /**
     * Indique si le middleware est actif
     * @default true
     */
    enabled?: boolean;

    /**
     * Niveau de journalisation
     * @default 'info'
     */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';

    /**
     * En-tête HTTP contenant l'identifiant de requête
     * @default 'X-Request-ID'
     */
    headerName?: string;

    /**
     * Préfixe à ajouter à l'identifiant généré
     * @default ''
     */
    prefix?: string;

    /**
     * Accepte les identifiants existants dans l'en-tête HTTP
     * @default true
     */
    acceptExisting?: boolean;
}

/**
 * Middleware qui assure qu'un identifiant unique est associé à chaque requête
 */
export class RequestIdMiddleware extends AbstractMiddleware<RequestIdOptions> {
    /**
     * Crée une nouvelle instance du middleware
     * @param options Options de configuration
     */
    constructor(options: Partial<RequestIdOptions> = {}) {
        // Options par défaut
        const defaultOptions: RequestIdOptions = {
            enabled: true,
            logLevel: 'info',
            headerName: 'X-Request-ID',
            prefix: '',
            acceptExisting: true
        };

        super('RequestIdMiddleware', defaultOptions, options);
    }

    /**
     * Assigne un identifiant unique à la requête si elle n'en a pas déjà un
     * @param context Contexte de la requête API
     * @param next Fonction à appeler pour passer au middleware suivant
     */
    protected async processInternal(context: IAPIContext, next: NextFunction): Promise<void> {
        const headerName = this.options.headerName || 'X-Request-ID';

        // S'assurer que l'objet headers existe
        if (!context.request.headers) {
            context.request.headers = {};
        }

        // Vérifier si un identifiant existe déjà
        const existingId = context.request.headers[headerName.toLowerCase()];

        if (existingId && this.options.acceptExisting) {
            // Utiliser l'identifiant existant
            context.requestId = existingId;
            this.logger.debug(`Using existing request ID: ${existingId}`);
        } else {
            // Générer un nouvel identifiant
            const prefix = this.options.prefix || '';
            const newId = `${prefix}${uuidv4()}`;
            context.requestId = newId;
            this.logger.debug(`Generated new request ID: ${newId}`);
        }

        // Ajouter l'identifiant dans les en-têtes de la requête pour la cohérence
        context.request.headers[headerName.toLowerCase()] = context.requestId;

        // Initialiser le contexte de sécurité s'il n'existe pas
        if (!context.security) {
            context.security = {};
        }

        // Passer au middleware suivant
        await next();

        // Ajouter l'identifiant à la réponse
        if (context.response) {
            context.response.headers = {
                ...context.response.headers,
                [headerName]: context.requestId
            };
        }
    }
}

/**
 * Factory pour créer une instance de RequestIdMiddleware
 */
export class RequestIdMiddlewareFactory {
    /**
     * Crée une instance de RequestIdMiddleware avec les options spécifiées
     * @param options Options de configuration
     * @returns Instance de RequestIdMiddleware
     */
    public static create(options: Partial<RequestIdOptions> = {}): RequestIdMiddleware {
        return new RequestIdMiddleware(options);
    }
}