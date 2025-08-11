// src/ai/api/core/middleware/middleware-interfaces.ts
import { IAPIContext } from '@api/core/types';

/**
 * Type pour la fonction middleware suivante
 */
export type NextFunction = () => Promise<void>;

/**
 * Interface de base pour tous les middlewares
 */
export interface IMiddleware {
    /**
     * Traite une requête API
     * @param context Contexte de la requête
     * @param next Fonction middleware suivante
     */
    process(context: IAPIContext, next: NextFunction): Promise<void>;

    /**
     * Nom du middleware pour le logging et le débogage
     */
    readonly name?: string;

    /**
     * Indique si le middleware est actif
     */
    readonly isEnabled?: boolean;
}

/**
 * Interface pour les middlewares configurables
 */
export interface IConfigurableMiddleware<T = Record<string, unknown>> extends IMiddleware {
    /**
     * Configure le middleware
     * @param config Configuration du middleware
     */
    configure(config: T): void;

    /**
     * Définit les options du middleware
     * @param options Options à définir
     */
    setOptions?(options: T): void;

    /**
     * Récupère les options actuelles du middleware
     * @returns Options actuelles
     */
    getOptions?(): T;
}

/**
 * Interface pour la chaîne de middlewares
 */
export interface IMiddlewareChain extends IMiddleware {
    /**
     * Ajoute un middleware à la chaîne
     * @param middleware Le middleware à ajouter
     * @returns L'instance de chaîne pour chaînage
     */
    use(middleware: IMiddleware): IMiddlewareChain;

    /**
     * Ajoute un middleware à la chaîne conditionellement
     * @param condition Condition d'activation du middleware
     * @param middleware Le middleware à ajouter si la condition est vraie
     * @returns L'instance de chaîne pour chaînage
     */
    useIf(condition: boolean, middleware: IMiddleware): IMiddlewareChain;

    /**
     * Ajoute plusieurs middlewares à la chaîne
     * @param middlewares Les middlewares à ajouter
     * @returns L'instance de chaîne pour chaînage
     */
    useAll(middlewares: IMiddleware[]): IMiddlewareChain;

    /**
     * Traite une requête de manière asynchrone
     * @param context Contexte de la requête
     */
    processAsync?(context: IAPIContext): Promise<void>;
}

/**
 * Interface pour la fabrique de middlewares
 */
export interface IMiddlewareFactory<TOptions = Record<string, unknown>> {
    /**
     * Crée un middleware
     * @param type Type de middleware
     * @param config Configuration du middleware
     */
    createMiddleware?(type: string, config?: Record<string, unknown>): IMiddleware;

    /**
     * Crée un middleware avec les options spécifiées
     * @param options Options du middleware
     */
    create?(options?: TOptions): IMiddleware;
}

// Réexporter les interfaces du fichier interfaces.ts original pour la rétrocompatibilité
export * from './interfaces';