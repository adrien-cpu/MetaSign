//src/ai/validation/implementations/BaseManager.ts
import { Result, ErrorCode } from '../utils/result-helpers';
import { IEventManager } from '../interfaces/IEventManager';
import { ValidationError } from '../types';

/**
 * Configuration commune pour tous les managers
 */
export interface BaseManagerConfig {
    /**
     * Active la journalisation
     */
    enableLogging?: boolean;

    /**
     * Niveau de journalisation
     */
    logLevel?: 'error' | 'warn' | 'info' | 'debug';

    /**
     * ID de l'application (pour le suivi)
     */
    appId?: string;
}

/**
 * Classe de base pour tous les managers
 * Fournit des fonctionnalités communes comme la journalisation
 */
export abstract class BaseManager {
    protected initialized = false;
    protected readonly config: Required<BaseManagerConfig>;
    protected readonly eventManager: IEventManager;
    protected readonly managerName: string;

    /**
     * Constructeur de base
     * @param eventManager Gestionnaire d'événements
     * @param managerName Nom du manager (pour la journalisation)
     * @param config Configuration optionnelle
     */
    constructor(
        eventManager: IEventManager,
        managerName: string,
        config: BaseManagerConfig = {}
    ) {
        this.eventManager = eventManager;
        this.managerName = managerName;

        // Configuration par défaut
        this.config = {
            enableLogging: config.enableLogging || false,
            logLevel: config.logLevel || 'error',
            appId: config.appId || 'validation-system'
        };
    }

    /**
     * Initialise le manager
     */
    public async initialize(): Promise<Result<void>> {
        if (this.initialized) {
            return { success: true };
        }

        try {
            await this.initializeInternal();
            this.initialized = true;
            this.logInfo('Manager initialized');
            return { success: true };
        } catch (error) {
            this.logError(`Initialization failed: ${error}`, {
                error: {
                    code: ErrorCode.INITIALIZATION_FAILED,
                    message: `Failed to initialize ${this.managerName}`,
                    details: { error: error instanceof Error ? error.message : String(error) }
                }
            });
            return {
                success: false,
                error: {
                    code: ErrorCode.INITIALIZATION_FAILED,
                    message: `Failed to initialize ${this.managerName}`,
                    details: { error: error instanceof Error ? error.message : String(error) }
                }
            };
        }
    }

    /**
     * Libère les ressources et arrête le manager
     * @param force Forcer l'arrêt même si des opérations sont en cours
     */
    public async shutdown(force?: boolean): Promise<Result<void>> {
        if (!this.initialized) {
            return { success: true };
        }

        try {
            await this.shutdownInternal(force);
            this.initialized = false;
            this.logInfo(`Manager shutdown (force=${force})`);
            return { success: true };
        } catch (error) {
            this.logError(`Shutdown failed: ${error}`, {
                error: {
                    code: ErrorCode.OPERATION_FAILED,
                    message: `Failed to shutdown ${this.managerName}`,
                    details: { error: error instanceof Error ? error.message : String(error) }
                }
            });
            return {
                success: false,
                error: {
                    code: ErrorCode.OPERATION_FAILED,
                    message: `Failed to shutdown ${this.managerName}`,
                    details: { error: error instanceof Error ? error.message : String(error) }
                }
            };
        }
    }

    /**
     * Vérifie que le manager est initialisé, sinon renvoie une erreur
     */
    protected checkInitialized(): Result<void> | null {
        if (!this.initialized) {
            return {
                success: false,
                error: {
                    code: ErrorCode.SYSTEM_NOT_INITIALIZED,
                    message: `${this.managerName} is not initialized`,
                    details: { managerName: this.managerName }
                }
            };
        }
        return null;
    }

    /**
     * Initialisation interne (à implémenter dans les sous-classes)
     */
    protected abstract initializeInternal(): Promise<void>;

    /**
     * Arrêt interne (à implémenter dans les sous-classes)
     * @param force Forcer l'arrêt même si des opérations sont en cours
     */
    protected abstract shutdownInternal(force?: boolean): Promise<void>;

    // Méthodes de journalisation
    protected logError(message: string, options?: { error: ValidationError | undefined }): void {
        if (this.config.enableLogging && ['error'].includes(this.config.logLevel)) {
            console.error(`[${this.managerName}] ERROR: ${message}`);
            if (options?.error) {
                console.error(`Details: ${JSON.stringify(options.error)}`);
            }
        }
    }

    protected logWarn(message: string): void {
        if (this.config.enableLogging && ['error', 'warn'].includes(this.config.logLevel)) {
            console.warn(`[${this.managerName}] WARN: ${message}`);
        }
    }

    protected logInfo(message: string): void {
        if (this.config.enableLogging && ['error', 'warn', 'info'].includes(this.config.logLevel)) {
            console.info(`[${this.managerName}] INFO: ${message}`);
        }
    }

    protected logDebug(message: string): void {
        if (this.config.enableLogging && ['error', 'warn', 'info', 'debug'].includes(this.config.logLevel)) {
            console.debug(`[${this.managerName}] DEBUG: ${message}`);
        }
    }
}