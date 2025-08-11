// src/ai/api/core/middleware/AbstractMiddleware.ts
import { IMiddleware } from './types/middleware.types'; // Importation mise à jour
import { Logger } from '@api/common/monitoring/LogService';
import { IAPIContext, NextFunction } from '@api/core/types';
/**
 * Interface de base pour les options de middleware
 */
export interface BaseMiddlewareOptions {
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
}

/**
 * Classe de base pour tous les middlewares de sécurité.
 * Fournit l'implémentation commune et la gestion de base des erreurs.
 */
export abstract class AbstractMiddleware<T extends BaseMiddlewareOptions> implements IMiddleware {
    protected readonly logger: Logger;
    protected readonly options: T;
    public readonly name: string;
    public readonly isEnabled: boolean;

    /**
     * Crée une nouvelle instance de middleware
     * @param name Nom du middleware
     * @param defaultOptions Options par défaut
     * @param options Options spécifiques
     */
    constructor(name: string, defaultOptions: T, options: Partial<T> = {}) {
        this.name = name;

        // Fusionner les options par défaut avec les options spécifiques
        this.options = {
            ...defaultOptions,
            ...options
        } as T;

        // Déterminer si le middleware est activé
        this.isEnabled = this.options.enabled !== false;

        // Créer le logger
        this.logger = new Logger(this.name);

        // Configurer le niveau de logging
        // Puisque setLevel n'existe pas, nous allons ajuster notre code
        // En supposant que le niveau de log est défini lors de la création
        // ou utiliser une approche alternative si nécessaire
        if (this.options.logLevel) {
            // Créer un nouveau logger avec le niveau configuré
            // ou simplement logger le niveau choisi
            this.logger.debug(`Setting log level to ${this.options.logLevel}`);
        }
    }

    /**
     * Point d'entrée du middleware, gère les erreurs et appelle processInternal
     * @param context Contexte de la requête API
     * @param next Fonction à appeler pour passer au middleware suivant
     */
    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        if (!this.isEnabled) {
            this.logger.debug('Middleware is disabled, skipping');
            await next();
            return;
        }

        try {
            this.logger.debug('Processing request');
            await this.processInternal(context, next);
            this.logger.debug('Processing completed');
        } catch (error) {
            this.logger.error('Error processing request:', error);
            await this.handleError(context, error);

            // On ne continue pas la chaîne en cas d'erreur
            // sauf si le gestionnaire d'erreur le décide
        }
    }

    /**
     * Traitement principal du middleware, à implémenter par les sous-classes
     * @param context Contexte de la requête API
     * @param next Fonction à appeler pour passer au middleware suivant
     */
    protected abstract processInternal(context: IAPIContext, next: NextFunction): Promise<void>;

    /**
     * Gestion des erreurs par défaut, peut être remplacée par les sous-classes
     * @param context Contexte de la requête API
     * @param error Erreur survenue
     */
    protected async handleError(context: IAPIContext, error: unknown): Promise<void> {
        // Par défaut, on propage simplement l'erreur
        throw error;
    }
}