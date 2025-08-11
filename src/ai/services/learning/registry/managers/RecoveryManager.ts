/**
 * @file src/ai/services/learning/registry/managers/RecoveryManager.ts
 * @description Gestionnaire de récupération des services défaillants
 * @module RecoveryManager
 * @requires @/ai/utils/LoggerFactory
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module gère la récupération des services défaillants enregistrés
 * dans le registre de services d'apprentissage.
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { BaseService } from '@/ai/services/learning/registry/interfaces/ServiceDescription';

/**
 * Type de callback pour les services récupérés
 */
type RecoveryCallback = (serviceId: string) => void;

/**
 * Type de callback pour les services irrécupérables
 */
type UnrecoverableCallback = (serviceId: string) => void;

/**
 * État de récupération d'un service
 * @interface RecoveryState
 */
interface RecoveryState {
    /**
     * Nombre de tentatives
     */
    attempts: number;

    /**
     * Dernière tentative (timestamp)
     */
    lastAttempt: number;

    /**
     * Stratégie de récupération
     */
    strategy: 'restart' | 'reinitialize' | 'reconnect';
}

/**
 * Interface pour les options de récupération
 * @interface RecoveryOptions
 */
interface RecoveryOptions {
    /**
     * Paramètres additionnels pour la récupération
     */
    params?: Record<string, unknown>;

    /**
     * Stratégie de récupération forcée
     */
    forceStrategy?: 'restart' | 'reinitialize' | 'reconnect';

    /**
     * Délai avant la tentative (ms)
     */
    delay?: number;

    /**
     * Timeout pour la tentative (ms)
     */
    timeout?: number;
}

/**
 * Interface pour les détails d'erreur
 * @interface ErrorDetails
 */
interface ErrorDetails {
    /**
     * Message d'erreur
     */
    message: string;

    /**
     * Code d'erreur (optionnel)
     */
    code?: string | number;

    /**
     * Données supplémentaires sur l'erreur
     */
    details?: Record<string, unknown>;
}

/**
 * Gestionnaire de récupération des services défaillants
 * 
 * @class RecoveryManager
 * @description Gère la récupération des services défaillants en utilisant
 * différentes stratégies et en limitant le nombre de tentatives.
 */
export class RecoveryManager {
    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('RecoveryManager');

    /**
     * États de récupération des services
     * @private
     */
    private recoveryStates: Map<string, RecoveryState>;

    /**
     * Nombre maximum de tentatives de récupération
     * @private
     * @readonly
     */
    private readonly maxAttempts: number;

    /**
     * Callback pour les services récupérés
     * @private
     * @readonly
     */
    private readonly recoveryCallback: RecoveryCallback;

    /**
     * Callback pour les services irrécupérables
     * @private
     * @readonly
     */
    private readonly unrecoverableCallback: UnrecoverableCallback;

    /**
     * Constructeur du gestionnaire de récupération
     * 
     * @constructor
     * @param {number} maxAttempts - Nombre maximum de tentatives
     * @param {RecoveryCallback} recoveryCallback - Callback pour les services récupérés
     * @param {UnrecoverableCallback} unrecoverableCallback - Callback pour les services irrécupérables
     */
    constructor(
        maxAttempts: number,
        recoveryCallback: RecoveryCallback,
        unrecoverableCallback: UnrecoverableCallback
    ) {
        this.recoveryStates = new Map<string, RecoveryState>();
        this.maxAttempts = maxAttempts;
        this.recoveryCallback = recoveryCallback;
        this.unrecoverableCallback = unrecoverableCallback;
    }

    /**
     * Tente de récupérer un service défaillant
     * 
     * @method attemptRecovery
     * @param {string} serviceId - Identifiant du service
     * @param {BaseService | Record<string, unknown> | undefined} instance - Instance du service
     * @param {RecoveryOptions} [options] - Options de récupération
     * @returns {Promise<boolean>} Vrai si la récupération a réussi
     * @public
     * @async
     */
    public async attemptRecovery(
        serviceId: string,
        instance: BaseService | Record<string, unknown> | undefined,
        options?: RecoveryOptions
    ): Promise<boolean> {
        // Si l'instance est undefined, impossible de récupérer
        if (!instance) {
            this.logger.error(`Cannot recover service ${serviceId}: instance is undefined`);
            return false;
        }

        // Initialiser l'état de récupération si nécessaire
        if (!this.recoveryStates.has(serviceId)) {
            this.recoveryStates.set(serviceId, {
                attempts: 0,
                lastAttempt: 0,
                strategy: 'restart'
            });
        }

        const state = this.recoveryStates.get(serviceId)!;

        // Vérifier si le nombre maximum de tentatives est atteint
        if (state.attempts >= this.maxAttempts) {
            this.logger.error(`Maximum recovery attempts (${this.maxAttempts}) reached for service ${serviceId}`);
            this.unrecoverableCallback(serviceId);
            return false;
        }

        // Incrémenter le nombre de tentatives
        state.attempts++;
        state.lastAttempt = Date.now();

        // Choisir une stratégie de récupération
        const strategy = options?.forceStrategy || this.chooseRecoveryStrategy(state);
        state.strategy = strategy;

        this.logger.info(`Attempting to recover service ${serviceId} (attempt ${state.attempts}/${this.maxAttempts}) using strategy '${strategy}'`);

        // Appliquer un délai si demandé
        if (options?.delay && options.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, options.delay));
        }

        // Tenter de récupérer le service
        try {
            switch (strategy) {
                case 'restart':
                    await this.restartService(instance);
                    break;

                case 'reinitialize':
                    await this.reinitializeService(instance);
                    break;

                case 'reconnect':
                    await this.reconnectService(instance);
                    break;
            }

            // Vérifier si le service est récupéré
            const isRecovered = await this.verifyRecovery(instance);

            if (isRecovered) {
                this.logger.info(`Service ${serviceId} recovered successfully`);
                this.resetRecoveryState(serviceId);
                this.recoveryCallback(serviceId);
                return true;
            } else {
                this.logger.warn(`Recovery attempt for service ${serviceId} failed`);
                return false;
            }
        } catch (error) {
            // Conversion sécurisée de l'erreur en objet structuré
            const errorDetails: ErrorDetails = {
                message: error instanceof Error ? error.message : String(error)
            };

            this.logger.error(`Error during recovery of service ${serviceId}: ${errorDetails.message}`);
            return false;
        }
    }

    /**
     * Choisit une stratégie de récupération
     * 
     * @method chooseRecoveryStrategy
     * @param {RecoveryState} state - État de récupération
     * @returns {'restart' | 'reinitialize' | 'reconnect'} Stratégie choisie
     * @private
     */
    private chooseRecoveryStrategy(state: RecoveryState): 'restart' | 'reinitialize' | 'reconnect' {
        // Stratégie progressive
        if (state.attempts <= 1) {
            return 'restart';
        } else if (state.attempts <= 2) {
            return 'reconnect';
        } else {
            return 'reinitialize';
        }
    }

    /**
     * Redémarre un service
     * 
     * @method restartService
     * @param {BaseService | Record<string, unknown>} instance - Instance du service
     * @returns {Promise<void>}
     * @private
     * @async
     */
    private async restartService(instance: BaseService | Record<string, unknown>): Promise<void> {
        // Vérifier si le service a une méthode de redémarrage
        if ('restart' in instance && typeof instance.restart === 'function') {
            await instance.restart();
        } else if ('stop' in instance && typeof instance.stop === 'function' &&
            'start' in instance && typeof instance.start === 'function') {
            await instance.stop();
            await instance.start();
        } else {
            // Si le service n'a pas de méthode spécifique, tenter de l'initialiser
            if ('initialize' in instance && typeof instance.initialize === 'function') {
                await instance.initialize();
            }
        }
    }

    /**
     * Réinitialise un service
     * 
     * @method reinitializeService
     * @param {BaseService | Record<string, unknown>} instance - Instance du service
     * @returns {Promise<void>}
     * @private
     * @async
     */
    private async reinitializeService(instance: BaseService | Record<string, unknown>): Promise<void> {
        // Vérifier si le service a une méthode de réinitialisation
        if ('reinitialize' in instance && typeof instance.reinitialize === 'function') {
            await instance.reinitialize();
        } else if ('reset' in instance && typeof instance.reset === 'function') {
            await instance.reset();
        } else if ('initialize' in instance && typeof instance.initialize === 'function') {
            await instance.initialize();
        }
    }

    /**
     * Reconnecte un service
     * 
     * @method reconnectService
     * @param {BaseService | Record<string, unknown>} instance - Instance du service
     * @returns {Promise<void>}
     * @private
     * @async
     */
    private async reconnectService(instance: BaseService | Record<string, unknown>): Promise<void> {
        // Vérifier si le service a une méthode de reconnexion
        if ('reconnect' in instance && typeof instance.reconnect === 'function') {
            await instance.reconnect();
        } else if ('connect' in instance && typeof instance.connect === 'function') {
            await instance.connect();
        }
    }

    /**
     * Vérifie si un service est récupéré
     * 
     * @method verifyRecovery
     * @param {BaseService | Record<string, unknown>} instance - Instance du service
     * @returns {Promise<boolean>} Vrai si le service est récupéré
     * @private
     * @async
     */
    private async verifyRecovery(instance: BaseService | Record<string, unknown>): Promise<boolean> {
        // Vérifier si le service a une méthode de vérification de santé
        if ('checkHealth' in instance && typeof instance.checkHealth === 'function') {
            const health = await instance.checkHealth();
            return health.isHealthy;
        }

        // Si le service n'a pas de méthode spécifique, considérer qu'il est récupéré
        return true;
    }

    /**
     * Réinitialise l'état de récupération d'un service
     * 
     * @method resetRecoveryState
     * @param {string} serviceId - Identifiant du service
     * @public
     */
    public resetRecoveryState(serviceId: string): void {
        this.recoveryStates.delete(serviceId);
    }

    /**
     * Obtient l'état de récupération d'un service
     * 
     * @method getRecoveryState
     * @param {string} serviceId - Identifiant du service
     * @returns {RecoveryState | undefined} État de récupération
     * @public
     */
    public getRecoveryState(serviceId: string): RecoveryState | undefined {
        return this.recoveryStates.get(serviceId);
    }

    /**
     * Obtient le nombre de services en cours de récupération
     * 
     * @method getRecoveryCount
     * @returns {number} Nombre de services
     * @public
     */
    public getRecoveryCount(): number {
        return this.recoveryStates.size;
    }
}