import { IAPIContext, NextFunction } from '../types';
import { IMiddleware, IMiddlewareChain } from './interfaces';
// import { Logger } from '@api/common/monitoring/LogService';
class Logger {
    constructor(private name: string) {}
    debug(msg: string, data?: any) { console.log(`[DEBUG] ${this.name}: ${msg}`, data); }
    error(msg: string, data?: any) { console.error(`[ERROR] ${this.name}: ${msg}`, data); }
    info(msg: string, data?: any) { console.info(`[INFO] ${this.name}: ${msg}`, data); }
    warn(msg: string, data?: any) { console.warn(`[WARN] ${this.name}: ${msg}`, data); }
}

/**
 * Implémentation d'une chaîne de middlewares de sécurité.
 * Permet de composer plusieurs middlewares qui seront exécutés séquentiellement.
 * La chaîne elle-même peut être utilisée comme un middleware dans une autre chaîne.
 */
export class SecurityMiddlewareChain implements IMiddleware, IMiddlewareChain {
    private readonly middlewares: IMiddleware[] = [];
    private readonly logger: Logger;
    public readonly name: string;
    public readonly isEnabled: boolean;

    /**
     * Crée une nouvelle chaîne de middlewares de sécurité
     * @param name Nom de la chaîne pour l'identification dans les logs
     * @param enabled Si la chaîne est activée
     */
    constructor(name = 'SecurityMiddlewareChain', enabled = true) {
        this.name = name;
        this.isEnabled = enabled;
        this.logger = new Logger(this.name);
    }

    /**
     * Ajoute un middleware à la chaîne
     * @param middleware Le middleware à ajouter
     * @returns this pour chaînage
     */
    public use(middleware: IMiddleware): IMiddlewareChain {
        this.middlewares.push(middleware);
        return this;
    }

    /**
     * Ajoute un middleware à la chaîne conditionellement
     * @param condition Condition d'activation du middleware
     * @param middleware Le middleware à ajouter si la condition est vraie
     * @returns this pour chaînage
     */
    public useIf(condition: boolean, middleware: IMiddleware): IMiddlewareChain {
        if (condition) {
            this.use(middleware);
        }
        return this;
    }

    /**
     * Ajoute plusieurs middlewares à la chaîne
     * @param middlewares Les middlewares à ajouter
     * @returns this pour chaînage
     */
    public useAll(middlewares: IMiddleware[]): SecurityMiddlewareChain {
        this.middlewares.push(...middlewares);
        return this;
    }

    /**
     * Traite une requête API à travers la chaîne de middlewares
     * @param context Le contexte de la requête API
     * @param next La fonction middleware suivante
     */
    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        if (!this.isEnabled) {
            this.logger.debug('Middleware chain is disabled, skipping all middlewares');
            await next();
            return;
        }

        await this.executeMiddlewareChain(context, 0, next);
    }

    /**
     * Traite une requête API de façon asynchrone sans fonction next
     * @param context Le contexte de la requête API
     */
    public async processAsync(context: IAPIContext): Promise<void> {
        await this.process(context, async () => {});
    }

    /**
     * Retourne le nombre de middlewares dans la chaîne
     */
    public getMiddlewareCount(): number {
        return this.middlewares.length;
    }

    /**
     * Retourne le nom de la chaîne
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Exécute récursivement la chaîne de middlewares
     * @param context Contexte de la requête API
     * @param index Index du middleware actuel
     * @param finalNext Fonction à appeler après le dernier middleware
     */
    private async executeMiddlewareChain(
        context: IAPIContext,
        index: number,
        finalNext: NextFunction
    ): Promise<void> {
        // Si tous les middlewares ont été exécutés, on appelle la fonction finale
        if (index >= this.middlewares.length) {
            await finalNext();
            return;
        }

        const currentMiddleware = this.middlewares[index];

        // Si le middleware est désactivé, on passe au suivant
        if ('isEnabled' in currentMiddleware && !currentMiddleware.isEnabled) {
            this.logger.debug(`Skipping disabled middleware: ${currentMiddleware.constructor.name}`);
            await this.executeMiddlewareChain(context, index + 1, finalNext);
            return;
        }

        try {
            const middlewareName = currentMiddleware.constructor.name;
            this.logger.debug(`Executing middleware: ${middlewareName}`);

            // Création de la fonction "next" pour ce middleware
            const nextMiddleware = async (): Promise<void> => {
                await this.executeMiddlewareChain(context, index + 1, finalNext);
            };

            // Exécution du middleware actuel
            await currentMiddleware.process(context, nextMiddleware);
        } catch (error) {
            const middlewareName = currentMiddleware.constructor.name;
            this.logger.error(`Error in middleware ${middlewareName}:`, error);
            throw error;
        }
    }
}