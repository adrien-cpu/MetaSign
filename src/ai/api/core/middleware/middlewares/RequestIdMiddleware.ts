//src/ai/api/core/middleware/middlewares/RequestIdMiddleware.ts
import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction } from '../types/middleware.types';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@api/common/monitoring/LogService';

/**
 * Middleware qui assure qu'un identifiant unique est attribué à chaque requête
 */
export class RequestIdMiddleware implements IMiddleware {
    private readonly logger: Logger;
    private readonly headerName: string;

    /**
     * Crée un nouveau middleware d'identifiant de requête
     * @param headerName Nom de l'en-tête HTTP pour l'identifiant de requête
     */
    constructor(headerName: string = 'X-Request-ID') {
        this.logger = new Logger('RequestIdMiddleware');
        this.headerName = headerName;
    }

    /**
     * Attribue un identifiant unique à la requête si elle n'en a pas déjà un
     * @param context Contexte de la requête API
     * @param next Fonction middleware suivante
     */
    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        // Vérifier si la requête et ses en-têtes existent avant d'y accéder
        let headerRequestId: string | undefined;

        if (context.request && context.request.headers) {
            headerRequestId = context.request.headers[this.headerName.toLowerCase()] as string | undefined;
        }

        // Vérifier si le contexte a déjà un identifiant
        if (!context.requestId) {
            // Utiliser l'identifiant de l'en-tête ou en générer un nouveau
            context.requestId = headerRequestId || uuidv4();
            this.logger.debug(`Assigned request ID: ${context.requestId}`);
        }

        try {
            // Assurer que le contexte de sécurité existe
            if (!context.security) {
                context.security = {};
            }

            // Continuer le traitement
            await next();

            // Ajouter l'identifiant de requête à la réponse si elle existe
            if (context.response) {
                context.response.headers = {
                    ...context.response.headers,
                    [this.headerName]: context.requestId
                };
            }
        } catch (error) {
            // Réémission de l'erreur pour permettre son traitement par d'autres middlewares
            throw error;
        }
    }
}