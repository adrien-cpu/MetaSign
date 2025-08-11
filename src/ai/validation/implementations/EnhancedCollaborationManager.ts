//src/ai/validation/implementations/EnhancedCollaborationManager.ts
import { IEventManager } from '../interfaces/IEventManager';
import {
    CollaborativeValidationRequest,
    ValidationFeedback,
    ValidationState,
    Result,
    PaginationOptions,
    PaginatedResult,
    ValidationEventType,
    ConsensusResult,
    ConsensusOptions,
    ExpertProfile,
    ValidationStateChange,
    NotificationContext,
    ValidationStats // Importez ValidationStats depuis types.ts
} from '../types';
import { ExpertStats } from '../types';
import { ICollaborationManager } from '../interfaces/ICollaborationManager';
import { ICollaborationManagerRegistry } from '../interfaces/ICollaborationManagerRegistry';
import {
    failure,
    success,
    ErrorCode
} from '../utils/result-helpers';
import { CollaborationManagerRegistry, CollaborationManagerRegistryConfig } from './CollaborationManagerRegistry';

/**
 * Configuration pour le gestionnaire de collaboration amélioré
 */
export interface EnhancedCollaborationManagerConfig extends CollaborationManagerRegistryConfig {
    /**
     * Délai d'expiration par défaut pour les validations (ms)
     */
    defaultValidationTimeout?: number;

    /**
     * Activer le calcul de consensus automatique quand le nombre minimum de feedbacks est atteint
     */
    enableAutoConsensusCalculation?: boolean;
}

// Interface pour étendre le registry avec l'eventManager
interface RegistryWithEventManager extends ICollaborationManagerRegistry {
    eventManager: IEventManager;
}

/**
 * Implémentation améliorée du gestionnaire de collaboration
 * Agit comme une façade qui délègue aux gestionnaires spécialisés
 */
export class EnhancedCollaborationManager implements ICollaborationManager {
    private initialized = false;
    private readonly config: Required<EnhancedCollaborationManagerConfig>;
    private readonly registry: ICollaborationManagerRegistry;
    private readonly eventManager: IEventManager;

    /**
     * Crée une nouvelle instance du gestionnaire de collaboration amélioré
     * @param config Configuration du gestionnaire
     */
    constructor(config: EnhancedCollaborationManagerConfig = {}) {
        // Configuration par défaut
        this.config = {
            ...config,
            defaultValidationTimeout: config.defaultValidationTimeout || 7 * 24 * 60 * 60 * 1000, // 7 jours
            enableAutoConsensusCalculation: config.enableAutoConsensusCalculation !== false, // Par défaut, activé
            defaultMinFeedbackRequired: config.defaultMinFeedbackRequired || 3,
        } as Required<EnhancedCollaborationManagerConfig>;

        // Créer le registre
        this.registry = new CollaborationManagerRegistry(this.config);

        // Récupérer le gestionnaire d'événements
        this.eventManager = this.getEventManager();
    }
    /**
     * Initialise le gestionnaire de collaboration
     */
    async initialize(): Promise<Result<void>> {
        if (this.initialized) {
            return { success: true };
        }

        const result = await this.registry.initialize();
        if (!result.success) {
            return result;
        }

        this.initialized = true;
        this.logInfo('Enhanced collaboration manager initialized');

        return { success: true };
    }

    /**
     * Soumet une proposition pour validation
     * @param request Requête de validation
     */
    async submitProposal(request: CollaborativeValidationRequest): Promise<Result<string>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getValidationManager().submitProposal(request);
    }

    /**
     * Ajoute un retour d'expert
     * @param validationId ID de la validation
     * @param feedback Retour d'expert
     */
    async addFeedback(validationId: string, feedback: ValidationFeedback): Promise<Result<string>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        const result = await this.registry.getFeedbackManager().addFeedback(validationId, feedback);

        // Calculer automatiquement le consensus si nécessaire
        if (result.success && this.config.enableAutoConsensusCalculation) {
            const isReadyResult = await this.registry.getConsensusManager().isReadyForConsensus(validationId);

            if (isReadyResult.success && isReadyResult.data) {
                // Ne pas attendre le résultat pour ne pas bloquer l'ajout de feedback
                this.registry.getConsensusManager().calculateConsensus(validationId)
                    .catch(error => this.logError(`Failed to calculate consensus: ${error}`));
            }
        }

        return result;
    }

    /**
     * Obtient tous les retours pour une validation avec pagination
     * @param validationId ID de la validation
     * @param options Options de pagination
     */
    async getAllFeedback(
        validationId: string,
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ValidationFeedback>>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getFeedbackManager().getAllFeedback(validationId, options);
    }

    /**
     * Met à jour l'état d'une validation
     * @param validationId ID de la validation
     * @param state Nouvel état
     * @param reason Motif du changement
     */
    async updateValidationState(
        validationId: string,
        state: ValidationState,
        reason?: string
    ): Promise<Result<ValidationStateChange>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        const result = await this.registry.getValidationStateManager().updateState(
            validationId,
            state,
            reason,
            'manager'
        );

        return result;
    }

    /**
     * Obtient l'état actuel d'une validation
     * @param validationId ID de la validation
     */
    async getValidationState(validationId: string): Promise<Result<ValidationState>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getValidationStateManager().getCurrentState(validationId);
    }

    /**
     * Obtient l'historique des changements d'état d'une validation
     * @param validationId ID de la validation
     */
    async getValidationHistory(validationId: string): Promise<Result<ValidationStateChange[]>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        const result = await this.registry.getValidationStateManager().getStateHistory(validationId);

        if (!result.success) {
            // Conversion correcte du type d'erreur
            return failure(
                result.error?.code || ErrorCode.OPERATION_FAILED,
                result.error?.message || 'Failed to get validation history',
                result.error?.details
            );
        }

        return success(result.data?.items || []);
    }

    /**
     * Notifie les experts d'une action requise
     * @param expertIds Liste des IDs d'experts à notifier
     * @param message Message de notification
     * @param context Contexte de la notification
     */
    async notifyExperts(
        expertIds: string[],
        message: string,
        context?: NotificationContext
    ): Promise<Result<{ successCount: number; failedIds?: string[] }>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getFeedbackManager().notifyExperts(expertIds, message, context);
    }

    /**
     * S'abonne aux événements de validation
     * @param eventType Type d'événement
     * @param callback Fonction à appeler lors de l'événement
     */
    subscribeToEvents(
        eventType: ValidationEventType | 'all',
        callback: (validationId: string, eventType: ValidationEventType, data: unknown) => void
    ): string {
        return this.eventManager.subscribe(eventType, callback);
    }

    /**
     * Se désabonne des événements
     * @param subscriptionId ID d'abonnement
     */
    unsubscribeFromEvents(subscriptionId: string): boolean {
        return this.eventManager.unsubscribe(subscriptionId);
    }

    /**
     * Recherche avancée de validations
     * @param criteria Critères de recherche
     * @param options Options de pagination
     */
    async searchValidations(
        criteria: {
            states?: ValidationState[];
            expertIds?: string[];
            dateRange?: { start?: Date; end?: Date };
            keywords?: string[];
            metadata?: Record<string, unknown>;
        },
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<CollaborativeValidationRequest>>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getValidationManager().searchValidations(criteria, options);
    }

    /**
     * Exécute des opérations groupées dans une transaction
     * @param operations Fonction exécutant plusieurs opérations
     */
    async transaction<T>(
        operations: (manager: ICollaborationManager) => Promise<T>
    ): Promise<Result<T>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.transaction(async () => {
            return await operations(this);
        });
    }

    /**
     * Libère les ressources et arrête le gestionnaire
     * @param force Forcer l'arrêt même si des opérations sont en cours
     */
    async shutdown(force?: boolean): Promise<Result<void>> {
        if (!this.initialized) {
            return { success: true };
        }

        const result = await this.registry.shutdown(force);
        if (result.success) {
            this.initialized = false;
            this.logInfo(`Shutting down collaboration manager (force=${force})`);
        }

        return result;
    }

    /**
     * Calcule le consensus pour une validation
     * @param validationId ID de la validation
     * @param options Options pour le calcul du consensus
     */
    async calculateConsensus(
        validationId: string,
        options?: ConsensusOptions
    ): Promise<Result<ConsensusResult>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getConsensusManager().calculateConsensus(validationId, options);
    }

    /**
     * Obtient le résultat de consensus pour une validation
     * @param validationId ID de la validation
     */
    async getConsensusResult(validationId: string): Promise<Result<ConsensusResult>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getConsensusManager().getConsensusResult(validationId);
    }

    /**
     * Obtient les statistiques du système
     */
    async getSystemStats(): Promise<Result<ValidationStats>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        // Cette méthode serait implémentée dans un service dédié aux statistiques
        return success({
            implemented: false,
            totalValidations: 0,
            pendingValidations: 0,
            completedValidations: 0,
            averageCompletionTime: 0,
            averageConsensusLevel: 0,
            expertCount: 0,
            validationsByState: {} as Record<ValidationState, number>
        });
    }

    /**
     * Obtient les statistiques pour un expert
     * @param expertId ID de l'expert
     */
    async getExpertStats(expertId: string): Promise<Result<ExpertStats>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getExpertProfileManager().getExpertStats(expertId);
    }

    /**
     * Enregistre un profil d'expert
     * @param profile Profil de l'expert
     */
    async registerExpertProfile(profile: ExpertProfile): Promise<Result<string>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getExpertProfileManager().registerExpertProfile(profile);
    }

    /**
     * Obtient le profil d'un expert
     * @param expertId ID de l'expert
     */
    async getExpertProfile(expertId: string): Promise<Result<ExpertProfile>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getExpertProfileManager().getExpertProfile(expertId);
    }

    /**
     * Trouve des experts qualifiés pour une validation
     * @param validationId ID de la validation
     * @param count Nombre d'experts à trouver
     */
    async findQualifiedExperts(
        validationId: string,
        count: number = 3
    ): Promise<Result<ExpertProfile[]>> {
        if (!this.initialized) {
            return failure(
                ErrorCode.SYSTEM_NOT_INITIALIZED,
                'Collaboration manager is not initialized'
            );
        }

        return this.registry.getExpertProfileManager().findQualifiedExperts(validationId, count);
    }

    /**
     * Récupère le gestionnaire d'événements
     */
    private getEventManager(): IEventManager {
        // Utilisation d'un cast explicite vers l'interface étendue
        return (this.registry as RegistryWithEventManager).eventManager;
    }

    // Méthodes de journalisation
    private logError(message: string): void {
        if (this.config.enableLogging && ['error'].includes(this.config.logLevel || '')) {
            console.error(`[EnhancedCollaborationManager] ERROR: ${message}`);
        }
    }

    private logInfo(message: string): void {
        if (this.config.enableLogging && ['error', 'warn', 'info'].includes(this.config.logLevel || '')) {
            console.info(`[EnhancedCollaborationManager] INFO: ${message}`);
        }
    }
}