//src/ai/validation/interfaces/ICollaborationManagerRegistry.ts
import { IValidationManager } from './IValidationManager';
import { IFeedbackManager } from './IFeedbackManager';
import { IConsensusManager } from './IConsensusManager';
import { IExpertProfileManager } from './IExpertProfileManager';
import { IValidationStateManager } from './IValidationStateManager';
import { Result } from '../types';

/**
 * Interface pour le registre de managers du système de validation collaborative
 * Fournit un accès centralisé à tous les managers spécialisés
 */
export interface ICollaborationManagerRegistry {
    /**
     * Initialise tous les managers
     */
    initialize(): Promise<Result<void>>;

    /**
     * Libère les ressources et arrête tous les managers
     * @param force Forcer l'arrêt même si des opérations sont en cours
     */
    shutdown(force?: boolean): Promise<Result<void>>;

    /**
     * Obtient le gestionnaire de validations
     */
    getValidationManager(): IValidationManager;

    /**
     * Obtient le gestionnaire de feedback
     */
    getFeedbackManager(): IFeedbackManager;

    /**
     * Obtient le gestionnaire de consensus
     */
    getConsensusManager(): IConsensusManager;

    /**
     * Obtient le gestionnaire de profils d'experts
     */
    getExpertProfileManager(): IExpertProfileManager;

    /**
     * Obtient le gestionnaire d'état des validations
     */
    getValidationStateManager(): IValidationStateManager;

    /**
     * Exécute une fonction dans une transaction
     * @param operation Fonction à exécuter dans la transaction
     */
    transaction<T>(operation: (registry: ICollaborationManagerRegistry) => Promise<T>): Promise<Result<T>>;
}